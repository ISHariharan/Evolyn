import { MouseEvent, useMemo, useState } from "react";
import { MemberWeight, TribeWeightProgress } from "../../../API/Tribe/Weight/types";

/** "-1.8 kg", "+0.6 kg", "0.0 kg" (a real minus sign) */
export const formatChange = (kg: number | null | undefined) => {
    if (kg == null) return "—";
    const v = Number(kg);
    if (v === 0) return "0.0 kg";
    return `${v > 0 ? "+" : "−"}${Math.abs(v).toFixed(1)} kg`;
};

export const MAX_LINES = 8;

const W = 680;
const H = 280;
const PAD = { top: 30, right: 120, bottom: 30, left: 48 };
const PLOT_W = W - PAD.left - PAD.right;
const PLOT_H = H - PAD.top - PAD.bottom;

const dayOf = (iso: string) => Number(iso.slice(8, 10));
const shortDate = (iso: string) =>
    new Date(`${iso}T00:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "short" });

export interface Series {
    member: MemberWeight;
    slot: number;          // colour slot, from joining order (stable when others start or stop sharing)
    name: string;
}

/** Nice step for the y axis: 0.5, 1 or 2 kg depending on the range */
const stepFor = (range: number) => (range <= 3 ? 0.5 : range <= 6 ? 1 : 2);

/**
 * Weight change this month, one line per member who shares it (and you).
 * Every line starts at 0 on the person's first weigh-in of the month, so the chart
 * shows how weights move, never what they are.
 */
const WeightChart = ({ data, series }: { data: TribeWeightProgress; series: Series[] }) => {
    const [hoverDay, setHoverDay] = useState<number | null>(null);
    const days = dayOf(data.periodEnd);
    const todayDay = data.today.slice(0, 7) === data.month ? dayOf(data.today) : null;

    const { yMin, yMax, ticks } = useMemo(() => {
        const values = series.flatMap((s) => (s.member.points ?? []).map((p) => Number(p.changeKg)));
        let lo = Math.min(-1, ...values);
        let hi = Math.max(1, ...values);
        const step = stepFor(hi - lo);
        lo = Math.floor(lo / step) * step;
        hi = Math.ceil(hi / step) * step;
        const t: number[] = [];
        for (let v = lo; v <= hi + 1e-9; v += step) t.push(Math.round(v * 10) / 10);
        return { yMin: lo, yMax: hi, ticks: t };
    }, [series]);

    const x = (day: number) => PAD.left + ((day - 1) / Math.max(1, days - 1)) * PLOT_W;
    const y = (kg: number) => PAD.top + ((yMax - kg) / (yMax - yMin)) * PLOT_H;

    // Direct labels at the end of each line (4 lines or fewer), nudged apart so they don't overlap
    const endLabels = useMemo(() => {
        if (series.length > 4) return [];
        const items = series
            .filter((s) => (s.member.points ?? []).length > 0)
            .map((s) => {
                const pts = s.member.points!;
                const last = pts[pts.length - 1];
                return { s, y: y(Number(last.changeKg)), text: `${s.name} ${formatChange(s.member.changeKg)}` };
            })
            .sort((a, b) => a.y - b.y);
        for (let i = 1; i < items.length; i++) {
            if (items[i].y - items[i - 1].y < 16) items[i].y = items[i - 1].y + 16;
        }
        return items;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [series, yMin, yMax]);

    const onMove = (e: MouseEvent<SVGRectElement>) => {
        const box = e.currentTarget.getBoundingClientRect();
        const ratio = (e.clientX - box.left) / box.width;
        setHoverDay(Math.min(days, Math.max(1, Math.round(ratio * (days - 1)) + 1)));
    };

    // What each line shows on the hovered day: its latest weigh-in on or before it
    const hover = hoverDay == null ? null : series.map((s) => {
        const pts = (s.member.points ?? []).filter((p) => dayOf(p.date) <= hoverDay);
        const p = pts[pts.length - 1];
        return { s, value: p ? Number(p.changeKg) : null, exact: p ? dayOf(p.date) === hoverDay : false };
    });
    const hoverIso = hoverDay == null ? "" : `${data.month}-${String(hoverDay).padStart(2, "0")}`;

    const summary = series.length === 0
        ? "No weight changes to show yet."
        : `Weight change in kg this month, from each person's first weigh-in. ` +
          series.map((s) => `${s.name}: ${formatChange(s.member.changeKg)}`).join("; ") + ".";

    return (
        <div className="wt-chart">
            {series.length >= 2 && (
                <ul className="wt-legend" aria-label="Legend">
                    {series.map((s) => (
                        <li key={s.member.userId}><span className={`wt-swatch wt-c${s.slot}`} aria-hidden="true"></span>{s.name}</li>
                    ))}
                </ul>
            )}
            <div className="wt-plot">
                <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={summary} preserveAspectRatio="xMidYMid meet">
                    {/* grid and y axis */}
                    {ticks.map((t) => (
                        <g key={t}>
                            <line x1={PAD.left} x2={PAD.left + PLOT_W} y1={y(t)} y2={y(t)} className={t === 0 ? "wt-zero" : "wt-grid"} />
                            <text x={PAD.left - 8} y={y(t)} className="wt-axis" textAnchor="end" dominantBaseline="middle">
                                {t === 0 ? "0" : `${t > 0 ? "+" : "−"}${Math.abs(t)}`}
                            </text>
                        </g>
                    ))}
                    <text x={PAD.left - 8} y={PAD.top - 16} className="wt-axis" textAnchor="end">kg</text>

                    {/* x axis: first, middle and last day */}
                    {[1, Math.ceil(days / 2), days].map((d) => (
                        <text key={d} x={x(d)} y={H - 8} className="wt-axis" textAnchor={d === 1 ? "start" : d === days ? "end" : "middle"}>
                            {shortDate(`${data.month}-${String(d).padStart(2, "0")}`)}
                        </text>
                    ))}
                    {todayDay != null && (
                        <line x1={x(todayDay)} x2={x(todayDay)} y1={PAD.top} y2={PAD.top + PLOT_H} className="wt-today" />
                    )}

                    {/* lines and weigh-in markers */}
                    {series.map((s) => {
                        const pts = s.member.points ?? [];
                        if (pts.length === 0) return null;
                        const d = pts.map((p, i) => `${i === 0 ? "M" : "L"}${x(dayOf(p.date)).toFixed(1)},${y(Number(p.changeKg)).toFixed(1)}`).join(" ");
                        return (
                            <g key={s.member.userId} className={`wt-c${s.slot}`}>
                                {pts.length > 1 && <path d={d} className="wt-line" />}
                                {pts.map((p) => (
                                    <circle key={p.date} cx={x(dayOf(p.date))} cy={y(Number(p.changeKg))} r={4} className="wt-dot" />
                                ))}
                            </g>
                        );
                    })}

                    {endLabels.map((l) => {
                        const pts = l.s.member.points!;
                        return (
                            <text key={l.s.member.userId} x={x(dayOf(pts[pts.length - 1].date)) + 10} y={l.y}
                                  className="wt-label" dominantBaseline="middle">
                                {l.text}
                            </text>
                        );
                    })}

                    {/* hover: crosshair on the nearest day */}
                    {hoverDay != null && (
                        <line x1={x(hoverDay)} x2={x(hoverDay)} y1={PAD.top} y2={PAD.top + PLOT_H} className="wt-cross" />
                    )}
                    <rect x={PAD.left} y={PAD.top} width={PLOT_W} height={PLOT_H} fill="transparent"
                          onMouseMove={onMove} onMouseLeave={() => setHoverDay(null)} />
                </svg>

                {hover && hoverDay != null && (
                    <div className="wt-tooltip" style={{ left: `${(x(hoverDay) / W) * 100}%` }} role="status">
                        <strong>{shortDate(hoverIso)}</strong>
                        {hover.map((h) => (
                            <span key={h.s.member.userId}>
                                <span className={`wt-swatch wt-c${h.s.slot}`} aria-hidden="true"></span>
                                {h.s.name} <b>{h.value == null ? "—" : formatChange(h.value)}</b>
                                {h.value != null && !h.exact ? <em> (last weigh-in)</em> : null}
                            </span>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default WeightChart;
