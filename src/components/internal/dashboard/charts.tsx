/**
 * Hand-rolled SVG charts for the control tower. Recharts is installed but
 * unused — a heavyweight dependency for two curated visuals. These render
 * from the same zero-filled series the server aggregates, scale honestly
 * (occupancy is always 0–100 %, never auto-zoomed), and keep their values
 * textually interpretable via figcaption summaries. Charts never receive
 * invented data: empty/missing series are handled by the caller's source
 * states.
 */
import {
  bucketLabel,
  formatDateShort,
  sparkline,
  type InquirySeriesPoint,
  type SeriesPoint,
} from "@/lib/dashboard/model";

/** Compact inline trend for KPI groups. Decorative alongside numeric values. */
export function Sparkline({ values }: { values: number[] }) {
  const { points } = sparkline(values, 120, 28);
  return (
    <svg viewBox="0 0 120 28" className="h-7 w-[120px] text-green-800" aria-hidden="true">
      <polyline
        points={points}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const TREND_W = 560;
const TREND_H = 200;
const PAD_B = 26;
const PAD_L = 38;

function occupancySummary(points: SeriesPoint[]): string {
  const values = points.map((p) => Math.round(p.value * 100));
  const current = values[values.length - 1];
  const min = Math.min(...values);
  const max = Math.max(...values);
  if (points.length < 2) return `Aktuelle Auslastung: ${current} %.`;
  return `Aktuell ${current} %, Verlauf zwischen ${min} % und ${max} %.`;
}

/** Occupancy as a fixed 0–100 % area. Single-point windows render dot-only. */
export function OccupancyTrendChart({ points }: { points: SeriesPoint[] }) {
  const innerW = TREND_W - PAD_L;
  const innerH = TREND_H - PAD_B;
  const x = (i: number) =>
    points.length > 1 ? PAD_L + (i * innerW) / (points.length - 1) : PAD_L + innerW / 2;
  const y = (v: number) => innerH - v * innerH;
  const line = points.map((p, i) => `${x(i).toFixed(1)},${y(p.value).toFixed(1)}`).join(" ");
  const last = points.length - 1;
  return (
    <figure className="m-0">
      <svg
        viewBox={`0 0 ${TREND_W} ${TREND_H}`}
        className="w-full"
        role="img"
        aria-label={`Auslastung. ${occupancySummary(points)}`}
      >
        {[0, 0.5, 1].map((g) => (
          <g key={g}>
            <line
              x1={PAD_L}
              x2={TREND_W}
              y1={y(g)}
              y2={y(g)}
              className="stroke-charcoal-900/10"
              strokeWidth="1"
            />
            <text x={PAD_L - 6} y={y(g) + 4} textAnchor="end" className="fill-charcoal-600 text-[11px]">
              {Math.round(g * 100)}
            </text>
          </g>
        ))}
        <polygon
          points={`${PAD_L},${innerH} ${line} ${x(last).toFixed(1)},${innerH}`}
          className="fill-green-800/10"
        />
        <polyline
          points={line}
          fill="none"
          className="stroke-green-800"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {points.length < 2 ? (
          <circle cx={x(0)} cy={y(points[0]?.value ?? 0)} r="3" className="fill-green-800" />
        ) : null}
        {points.map((p, i) =>
          i === 0 || i === last ? (
            <text
              key={p.date}
              x={x(i)}
              y={TREND_H - 6}
              textAnchor={i === 0 ? "start" : "end"}
              className="fill-charcoal-600 text-[11px]"
            >
              {formatDateShort(p.date)}
            </text>
          ) : null,
        )}
      </svg>
      <figcaption className="micro mt-2 text-charcoal-600">{occupancySummary(points)}</figcaption>
    </figure>
  );
}

const INQUIRY_SERIES = [
  { key: "ROOM" as const, label: "Zimmer", className: "fill-green-800" },
  { key: "TABLE" as const, label: "Tisch", className: "fill-wine-700" },
  { key: "OCCASION" as const, label: "Anlass", className: "fill-brass-500" },
];

function inquirySummary(points: InquirySeriesPoint[]): string {
  const sum = (key: (typeof INQUIRY_SERIES)[number]["key"]) =>
    points.reduce((acc, p) => acc + p[key], 0);
  return `Anfragen gesamt ${sum("ROOM") + sum("TABLE") + sum("OCCASION")}: ${sum("ROOM")} Zimmer, ${sum("TABLE")} Tisch, ${sum("OCCASION")} Anlass.`;
}

/** Inquiries per bucket, stacked by type so composition stays readable. */
export function InquiryTrendChart({
  points,
  granularity,
}: {
  points: InquirySeriesPoint[];
  granularity: "hour" | "day";
}) {
  const innerW = TREND_W - PAD_L;
  const innerH = TREND_H - PAD_B;
  const totals = points.map((p) => p.ROOM + p.TABLE + p.OCCASION);
  const max = Math.max(...totals, 1);
  const slot = points.length > 0 ? innerW / points.length : innerW;
  const barW = Math.min(slot * 0.6, 48);
  const labelEvery = granularity === "hour" ? 3 : Math.ceil(points.length / 6);
  return (
    <figure className="m-0">
      <svg
        viewBox={`0 0 ${TREND_W} ${TREND_H}`}
        className="w-full"
        role="img"
        aria-label={`Anfragen im Zeitraum. ${inquirySummary(points)}`}
      >
        {[0, 0.5, 1].map((g) => (
          <g key={g}>
            <line
              x1={PAD_L}
              x2={TREND_W}
              y1={innerH - g * innerH}
              y2={innerH - g * innerH}
              className="stroke-charcoal-900/10"
              strokeWidth="1"
            />
            <text
              x={PAD_L - 6}
              y={innerH - g * innerH + 4}
              textAnchor="end"
              className="fill-charcoal-600 text-[11px]"
            >
              {Math.round(g * max)}
            </text>
          </g>
        ))}
        {points.map((p, i) => {
          const cx = PAD_L + i * slot + slot / 2;
          let stack = 0;
          return (
            <g key={p.bucket}>
              {INQUIRY_SERIES.map(({ key, className }) => {
                const h = (p[key] / max) * innerH;
                const rect = h > 0 && (
                  <rect
                    key={key}
                    x={cx - barW / 2}
                    y={innerH - stack - h}
                    width={barW}
                    height={h}
                    className={className}
                  />
                );
                stack += h;
                return rect;
              })}
              {i % labelEvery === 0 ? (
                <text
                  x={cx}
                  y={TREND_H - 6}
                  textAnchor="middle"
                  className="fill-charcoal-600 text-[11px]"
                >
                  {bucketLabel(granularity, p.bucket)}
                </text>
              ) : null}
            </g>
          );
        })}
      </svg>
      <div className="mt-2 flex flex-wrap gap-3">
        {INQUIRY_SERIES.map(({ key, label, className }) => (
          <span key={key} className="micro flex items-center gap-1.5 text-charcoal-600">
            <span aria-hidden className={`inline-block h-2 w-2 rounded-xs ${className}`} />
            {label}
          </span>
        ))}
      </div>
      <figcaption className="micro mt-2 text-charcoal-600">{inquirySummary(points)}</figcaption>
    </figure>
  );
}
