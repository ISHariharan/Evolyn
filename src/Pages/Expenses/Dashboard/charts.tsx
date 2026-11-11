/**
 * Two small charts drawn with plain SVG (no chart library).
 * The idea: pick a drawing area, convert each value to an x/y position with a
 * "scale" function, then draw lines / rectangles at those positions.
 * viewBox + width="100%" makes the SVG stretch to fit its container.
 */

const W = 600;
const PAD = { top: 12, right: 12, bottom: 24, left: 52 };
const SPENT = "#2a78d6";
const INCOME = "#1baf7a";
const PREVIOUS = "#898781";

const compactInr = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    notation: "compact",
    maximumFractionDigits: 1,
});
const fullInr = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });

// The axis has 4 gridline steps. Pick a round step size (like 5K, 6K or 20K)
// so every gridline label is a clean number, then top of axis = 4 steps.
const niceMax = (value: number) => {
    if (value <= 0) return 1000;
    const rawStep = value / 4;
    const magnitude = Math.pow(10, Math.floor(Math.log10(rawStep)));
    const step = [1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10].find((s) => s * magnitude >= rawStep) ?? 10;
    return step * magnitude * 4;
};

const YAxis = ({ max, height }: { max: number; height: number }) => {
    const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => f * max);
    const y = (v: number) => PAD.top + (1 - v / max) * (height - PAD.top - PAD.bottom);
    return (
        <g>
            {ticks.map((t) => (
                <g key={t}>
                    <line x1={PAD.left} x2={W - PAD.right} y1={y(t)} y2={y(t)} className="ex-chart__grid" />
                    <text x={PAD.left - 8} y={y(t) + 4} textAnchor="end" className="ex-chart__tick">
                        {compactInr.format(t)}
                    </text>
                </g>
            ))}
        </g>
    );
};

/** Cumulative spending by day of month: this period (solid) vs previous (dashed). */
export const PaceChart = ({
    current,
    previous,
    daysInMonth,
    currentLabel,
    previousLabel,
}: {
    current: number[];   // cumulative totals for day 1..N (N = days so far)
    previous: number[];  // cumulative totals for every day of the previous month
    daysInMonth: number;
    currentLabel: string;
    previousLabel: string;
}) => {
    const H = 200;
    const max = niceMax(Math.max(...current, ...previous, 0));
    const days = Math.max(daysInMonth, previous.length);
    const x = (day: number) => PAD.left + ((day - 1) / Math.max(days - 1, 1)) * (W - PAD.left - PAD.right);
    const y = (v: number) => PAD.top + (1 - v / max) * (H - PAD.top - PAD.bottom);
    const path = (values: number[]) => values.map((v, i) => `${i === 0 ? "M" : "L"}${x(i + 1)},${y(v)}`).join(" ");
    const xTicks = [1, 8, 15, 22, days];
    const slot = (W - PAD.left - PAD.right) / Math.max(days - 1, 1);

    return (
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img"
             aria-label={`Cumulative spending by day. ${currentLabel}: ${fullInr.format(current[current.length - 1] ?? 0)} so far. ${previousLabel}: ${fullInr.format(previous[previous.length - 1] ?? 0)} for the month.`}>
            <YAxis max={max} height={H} />
            {xTicks.map((d) => (
                <text key={d} x={x(d)} y={H - 6} textAnchor="middle" className="ex-chart__tick">{d}</text>
            ))}
            {previous.length > 0 && (
                <path d={path(previous)} fill="none" stroke={PREVIOUS} strokeWidth={2} strokeDasharray="5 4" strokeLinejoin="round" />
            )}
            <path d={path(current)} fill="none" stroke={SPENT} strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
            {current.length > 0 && (
                <circle cx={x(current.length)} cy={y(current[current.length - 1])} r={4.5} fill={SPENT} className="ex-chart__dot" />
            )}
            {/* Invisible hover strips: the browser shows <title> as a tooltip */}
            {Array.from({ length: days }, (_, i) => (
                <rect key={i} x={x(i + 1) - slot / 2} y={PAD.top} width={slot} height={H - PAD.top - PAD.bottom} fill="transparent">
                    <title>
                        {`Day ${i + 1}` +
                            (i < current.length ? ` · ${currentLabel} ${fullInr.format(current[i])}` : "") +
                            (i < previous.length ? ` · ${previousLabel} ${fullInr.format(previous[i])}` : "")}
                    </title>
                </rect>
            ))}
        </svg>
    );
};

/** Income vs spending per month, as pairs of bars. */
export const TrendChart = ({ months }: { months: { label: string; income: number; spent: number }[] }) => {
    const H = 210;
    const max = niceMax(Math.max(...months.flatMap((m) => [m.income, m.spent]), 0));
    const y = (v: number) => PAD.top + (1 - v / max) * (H - PAD.top - PAD.bottom);
    const groupWidth = (W - PAD.left - PAD.right) / months.length;
    const barWidth = Math.min(22, groupWidth / 3);

    return (
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img"
             aria-label={"Income and spending by month. " + months.map((m) => `${m.label}: income ${fullInr.format(m.income)}, spent ${fullInr.format(m.spent)}`).join("; ")}>
            <YAxis max={max} height={H} />
            {months.map((m, i) => {
                const cx = PAD.left + groupWidth * i + groupWidth / 2;
                const saved = m.income - m.spent;
                return (
                    <g key={m.label}>
                        <title>
                            {`${m.label}: income ${fullInr.format(m.income)}, spent ${fullInr.format(m.spent)}, ` +
                                (saved >= 0 ? `saved ${fullInr.format(saved)}` : `overspent ${fullInr.format(-saved)}`) +
                                (m.income > 0 ? ` (${Math.round((saved / m.income) * 100)}%)` : "")}
                        </title>
                        <rect x={cx - barWidth - 1} y={y(m.income)} width={barWidth} height={y(0) - y(m.income)} rx={3} fill={INCOME} />
                        <rect x={cx + 1} y={y(m.spent)} width={barWidth} height={y(0) - y(m.spent)} rx={3} fill={SPENT} />
                        <text x={cx} y={H - 6} textAnchor="middle" className="ex-chart__tick">{m.label}</text>
                    </g>
                );
            })}
        </svg>
    );
};

export const CHART_COLORS = { SPENT, INCOME, PREVIOUS };
