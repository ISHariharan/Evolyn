import { TribeDashboard } from "../../../API/Tribe/Goals/types";

const kcal = (n: number) => Math.round(n).toLocaleString("en-IN");

/**
 * The tribe's calories day by day for the month. Days still to come are
 * dashed; while the goal is running, a line shows what's needed per day.
 */
const DailyChart = ({ data }: { data: TribeDashboard }) => {
    const needed = data.progress?.phase === "ACTIVE" ? data.progress.neededPerDay : null;
    const max = Math.max(1, ...data.daily.map((d) => Number(d.kcal)), needed ?? 0) * 1.1;
    const first = data.daily[0]?.date;
    const last = data.daily[data.daily.length - 1]?.date;
    const busiest = data.daily.reduce((a, b) => (Number(b.kcal) > Number(a.kcal) ? b : a), data.daily[0]);

    const label = (iso?: string) =>
        iso ? new Date(`${iso}T00:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "";

    const summary = `Tribe calories per day from ${label(first)} to ${label(last)}. Total ${kcal(data.total)} kcal.` +
        (busiest && Number(busiest.kcal) > 0 ? ` Busiest day ${label(busiest.date)} with ${kcal(busiest.kcal)} kcal.` : "") +
        (needed ? ` Needed per day from now on: ${kcal(needed)} kcal.` : "");

    return (
        <section className="ex-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: "0.5rem" }}>
                <h2 className="tb-section-title" style={{ margin: 0 }}>Tribe calories by day</h2>
                <span className="tb-meta">
                    <span className="gl-key gl-key--bar"></span>Logged
                    <span className="gl-key gl-key--today"></span>Today
                    {needed ? <><span className="gl-key gl-key--line"></span>Needed per day</> : null}
                </span>
            </div>
            <div className="gl-chart" role="img" aria-label={summary}>
                {data.daily.map((d) => {
                    const future = d.date > data.today;
                    const today = d.date === data.today;
                    const h = future ? (needed ? (needed / max) * 100 : 0) : (Number(d.kcal) / max) * 100;
                    return (
                        <div
                            key={d.date}
                            className={`gl-bar ${future ? "gl-bar--future" : ""} ${today ? "gl-bar--today" : ""}`}
                            style={{ height: `${h}%` }}
                            title={`${label(d.date)}: ${future ? "not yet" : `${kcal(d.kcal)} kcal`}`}
                        ></div>
                    );
                })}
                {needed ? (
                    <div className="gl-line" style={{ bottom: `${(needed / max) * 100}%` }}>
                        <span>{kcal(needed)}/day needed</span>
                    </div>
                ) : null}
            </div>
            <div className="tb-meta" style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                <span>{label(first)}</span>
                <span>{label(last)}</span>
            </div>
        </section>
    );
};

export default DailyChart;
