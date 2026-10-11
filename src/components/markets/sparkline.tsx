/** Tiny trend line used in the snapshot module and the markets tables. */
export function Sparkline({
  values,
  up,
  width = 60,
  height = 24,
  className = "snapshot-spark",
}: {
  values: number[];
  up: boolean;
  width?: number;
  height?: number;
  className?: string;
}) {
  const pad = 2;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const flat = max === min;
  const range = max - min || 1;
  const stepX = values.length > 1 ? (width - pad * 2) / (values.length - 1) : 0;
  const points = values
    .map((v, i) => {
      const x = pad + i * stepX;
      // No variance (e.g. right after a data reset): draw a flat line
      // centered in the chart, not pinned to the bottom edge.
      const y = flat ? height / 2 : pad + (1 - (v - min) / range) * (height - pad * 2);
      return x.toFixed(1) + "," + y.toFixed(1);
    })
    .join(" ");
  return (
    <svg className={className} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" aria-hidden="true">
      <polyline
        points={points}
        fill="none"
        stroke={up ? "var(--up)" : "var(--down)"}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
