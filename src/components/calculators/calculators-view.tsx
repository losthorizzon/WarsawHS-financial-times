"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

// Each calculator is data: its inputs, a compute() that returns the
// result rows (or null while an input is empty or invalid), and a note.
// Plain maths in the visitor's browser; nothing to keep up to date.
type Row = [label: string, value: string, secondary?: boolean];
interface Calculator {
  title: string;
  blurb: string;
  inputs: { id: string; label: string; value: number; step: number }[];
  compute: (v: Record<string, number>) => Row[] | null;
  note: string;
}

const money = (n: number) => n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 });

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
      const n = v.years * 12,
        r = v.rate / 100 / 12;
      const growth = r === 0 ? 1 : Math.pow(1 + r, n);
      const final = v.start * growth + v.monthly * (r === 0 ? n : (growth - 1) / r);
      const paidIn = v.start + v.monthly * n;
      return [
        ["Balance after " + v.years + " years", money(final)],
        ["You paid in", money(paidIn), true],
        ["Growth from returns", money(final - paidIn), true],
      ];
    },
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
        ["Buying power of that amount in " + v.years + " years", money(v.amount / f)],
        ["Same basket would cost", money(v.amount * f), true],
        ["Buying power lost", (100 - 100 / f).toFixed(1) + "%", true],
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
        ["Monthly payment", money(pay)],
        ["Total repaid", money(pay * n), true],
        ["Total interest", money(pay * n - v.principal), true],
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
            out.map(([label, value, secondary]) => (
              <div key={label}>
                <p className="calc-result-label">{label}</p>
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.p
                    key={value}
                    className={`calc-result-value${secondary ? " is-secondary" : ""}`}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.18 }}
                  >
                    {value}
                  </motion.p>
                </AnimatePresence>
              </div>
            ))
          ) : (
            <p className="calc-result-label">Enter a number in every box to see the result.</p>
          )}
        </div>
      </div>
      <p className="calc-note">{calc.note}</p>
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
