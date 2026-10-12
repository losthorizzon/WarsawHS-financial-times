"use client";

import NumberFlow from "@number-flow/react";
import { useState } from "react";
import { Area, AreaChart } from "@/components/charts/area-chart";
import { Grid } from "@/components/charts/grid";
import { ChartTooltip } from "@/components/charts/tooltip";
import { YAxis } from "@/components/charts/y-axis";
import { useMounted } from "@/hooks/use-mounted";

// Each calculator is data: its inputs, a compute() that returns the
// result rows (or null while an input is empty or invalid), and a note.
// Plain maths in the visitor's browser; nothing to keep up to date.
// Values stay numbers (not pre-formatted text) so they can roll smoothly
// from one result to the next as the inputs change.
type Row = [label: string, value: number, kind: "money" | "percent", secondary?: boolean];
interface Calculator {
  title: string;
  blurb: string;
  inputs: { id: string; label: string; value: number; step: number }[];
  compute: (v: Record<string, number>) => Row[] | null;
  /** Optional year-by-year series for a growth chart under the results. */
  series?: (v: Record<string, number>) => { year: number; balance: number; paidIn: number }[];
  note: string;
}

const MONEY = { maximumFractionDigits: 0 } as const;
const PERCENT = { style: "percent", minimumFractionDigits: 1, maximumFractionDigits: 1 } as const;

function compoundBalance(start: number, monthly: number, rate: number, months: number) {
  const r = rate / 100 / 12;
  const growth = r === 0 ? 1 : Math.pow(1 + r, months);
  return start * growth + monthly * (r === 0 ? months : (growth - 1) / r);
}

const CALCULATORS: Calculator[] = [
  {
    title: "Compound growth",
    blurb: "What regular saving becomes when the returns earn returns of their own.",
    inputs: [
      { id: "start", label: "Starting amount", value: 1000, step: 100 },
      { id: "monthly", label: "Added every month", value: 200, step: 50 },
      { id: "rate", label: "Yearly return (%)", value: 6, step: 0.5 },
      { id: "years", label: "Years", value: 20, step: 1 },
    ],
    compute: (v) => {
      const n = v.years * 12;
      const final = compoundBalance(v.start, v.monthly, v.rate, n);
      const paidIn = v.start + v.monthly * n;
      return [
        ["Balance after " + v.years + " years", final, "money"],
        ["You paid in", paidIn, "money", true],
        ["Growth from returns", final - paidIn, "money", true],
      ];
    },
    series: (v) =>
      Array.from({ length: Math.min(60, Math.floor(v.years)) + 1 }, (_, y) => ({
        year: y,
        balance: compoundBalance(v.start, v.monthly, v.rate, y * 12),
        paidIn: v.start + v.monthly * y * 12,
      })),
    note: "Returns are assumed steady and compounded monthly. Real markets rise and fall, so treat this as an illustration, not a forecast.",
  },
  {
    title: "Inflation and purchasing power",
    blurb: "How rising prices quietly shrink what your money can buy.",
    inputs: [
      { id: "amount", label: "Amount today", value: 1000, step: 100 },
      { id: "infl", label: "Yearly inflation (%)", value: 4, step: 0.5 },
      { id: "years", label: "Years", value: 10, step: 1 },
    ],
    compute: (v) => {
      const f = Math.pow(1 + v.infl / 100, v.years);
      return [
        ["Buying power of that amount in " + v.years + " years", v.amount / f, "money"],
        ["Same basket would cost", v.amount * f, "money", true],
        ["Buying power lost", 1 - 1 / f, "percent", true],
      ];
    },
    note: "Assumes prices rise at one constant rate. Actual inflation varies from year to year.",
  },
  {
    title: "Loan repayment",
    blurb: "The monthly payment on a fixed-rate loan, and what the interest adds up to.",
    inputs: [
      { id: "principal", label: "Amount borrowed", value: 10000, step: 500 },
      { id: "apr", label: "Yearly interest rate (%)", value: 8, step: 0.25 },
      { id: "years", label: "Years to repay", value: 5, step: 1 },
    ],
    compute: (v) => {
      const n = v.years * 12,
        r = v.apr / 100 / 12;
      if (n <= 0) return null;
      const pay = r === 0 ? v.principal / n : (v.principal * r) / (1 - Math.pow(1 + r, -n));
      return [
        ["Monthly payment", pay, "money"],
        ["Total repaid", pay * n, "money", true],
        ["Total interest", pay * n - v.principal, "money", true],
      ];
    },
    note: "Standard equal-payment loan. Fees, insurance and variable rates are not included.",
  },
];

function CalculatorCard({ calc }: { calc: Calculator }) {
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(calc.inputs.map((f) => [f.id, String(f.value)]))
  );
  const nums: Record<string, number> = {};
  let valid = true;
  for (const f of calc.inputs) {
    const n = parseFloat(values[f.id]);
    if (isNaN(n) || n < 0) valid = false;
    nums[f.id] = n;
  }
  const out = valid ? calc.compute(nums) : null;

  return (
    <div className="calc-card">
      <div className="module-head">
        <h2>{calc.title}</h2>
      </div>
      <p className="calc-note" style={{ paddingTop: "1rem" }}>
        {calc.blurb}
      </p>
      <div className="calc-body">
        <div className="calc-inputs">
          {calc.inputs.map((f) => (
            <label key={f.id}>
              {f.label}
              <input
                type="number"
                inputMode="decimal"
                min={0}
                step={f.step}
                value={values[f.id]}
                onChange={(e) => setValues((v) => ({ ...v, [f.id]: e.target.value }))}
              />
            </label>
          ))}
        </div>
        <div className="calc-results" aria-live="polite">
          {out ? (
            out.map(([label, value, kind, secondary], i) => (
              <div key={i}>
                <p className="calc-result-label">{label}</p>
                <p className={`calc-result-value${secondary ? " is-secondary" : ""}`}>
                  <NumberFlow locales="en-US" value={value} format={kind === "money" ? MONEY : PERCENT} />
                </p>
              </div>
            ))
          ) : (
            <p className="calc-result-label">Enter a number in every box to see the result.</p>
          )}
        </div>
      </div>
      {calc.series && valid && <GrowthChart data={calc.series(nums)} />}
      <p className="calc-note">{calc.note}</p>
    </div>
  );
}

// BKLit UI area chart: what was paid in vs. what the balance grew to.
// Drawn in the browser only — the x-axis is real calendar years from now.
function GrowthChart({ data }: { data: { year: number; balance: number; paidIn: number }[] }) {
  const mounted = useMounted();
  if (!mounted || data.length < 2) return null;
  const thisYear = new Date().getFullYear();
  const points = data.map((d) => ({ ...d, date: new Date(thisYear + d.year, 0, 1) }));
  const fmt = (v: number) => Math.round(v).toLocaleString("en-US");
  return (
    <div className="calc-chart">
      <div className="calc-chart-plot">
        <AreaChart data={points} aspectRatio={undefined} margin={{ top: 12, right: 8, bottom: 8, left: 64 }} className="h-full w-full">
          <Grid strokeDasharray="3,4" />
          <Area dataKey="balance" fill="var(--brass)" stroke="var(--brass)" fillOpacity={0.28} strokeWidth={2.2} />
          <Area dataKey="paidIn" fill="var(--navy)" stroke="var(--accent)" fillOpacity={0.18} strokeWidth={1.6} />
          <YAxis numTicks={4} formatValue={fmt} />
          <ChartTooltip
            showDatePill={false}
            rows={(p) => [
              { color: "var(--ink-faint)", label: "Year", value: p.year === 0 ? "Today" : `${p.year}` },
              { color: "var(--brass)", label: "Balance", value: fmt(p.balance as number) },
              { color: "var(--accent)", label: "Paid in", value: fmt(p.paidIn as number) },
            ]}
          />
        </AreaChart>
      </div>
      {/* The time axis is "years from now", so it is labelled in words
          rather than with calendar dates. */}
      <p className="calc-axis">
        <span>Today</span>
        <span>{data.length - 1} years</span>
      </p>
      <p className="calc-legend">
        <span style={{ color: "var(--brass)" }}>Balance</span>
        <span style={{ color: "var(--accent)" }}>What you paid in</span>
      </p>
    </div>
  );
}

export function CalculatorsView() {
  return (
    <div>
      {CALCULATORS.map((c) => (
        <CalculatorCard key={c.title} calc={c} />
      ))}
    </div>
  );
}
