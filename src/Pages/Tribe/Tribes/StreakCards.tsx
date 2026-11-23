import { TribeStreaks } from "../../../API/Tribe/Streaks/types";

const days = (n: number) => `${n} ${n === 1 ? "day" : "days"}`;

/**
 * The tribe's streak and yours, with today's state and the last 14 days.
 * A streak that isn't kept YET today is "at risk", not broken, until midnight.
 */
const StreakCards = ({ data }: { data: TribeStreaks }) => {
    const { tribe, me, rules } = data;
    const label = (iso: string) => new Date(`${iso}T00:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "short" });

    return (
        <div className="tr-layout">
            <section className="ex-card" style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
                <h2 className="tb-section-title" style={{ margin: 0 }}>Tribe streak</h2>
                <p className="st-big">
                    <i className={`bx ${tribe.current > 0 ? "bxs-flame st-flame" : "bx-flame"}`} aria-hidden="true"></i>
                    {days(tribe.current)} <span>best {days(tribe.best)}</span>
                </p>
                <p className={`st-today ${tribe.activeToday ? "is-done" : ""}`}>
                    {tribe.activeToday
                        ? `Kept today: ${tribe.activeMembersToday} of ${rules.memberCount} members active.`
                        : `Today so far: ${tribe.activeMembersToday} of the ${tribe.neededMembers} members needed.` +
                          (tribe.atRisk ? " Keep it going before midnight." : "")}
                </p>
                <div className="st-strip" role="img"
                     aria-label={`Last 14 days: ${data.recentDays.filter((d) => d.counted).length} counted for the tribe`}>
                    {data.recentDays.map((d) => (
                        <span key={d.date} className={`st-dot ${d.counted ? "is-on" : ""} ${d.date === data.today ? "is-today" : ""}`}
                              title={`${label(d.date)}: ${d.activeMembers} active${d.counted ? ", counted" : ""}`}></span>
                    ))}
                </div>
                <p className="tr-note" style={{ margin: 0 }}>
                    A day counts when at least {rules.neededMembers} of {rules.memberCount} members ({rules.memberPercent}%)
                    log {rules.minMinutes}+ minutes of an activity that counts for goals.
                </p>
            </section>

            <section className="ex-card" style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
                <h2 className="tb-section-title" style={{ margin: 0 }}>Your streak</h2>
                {me ? (
                    <>
                        <p className="st-big">
                            <i className={`bx ${me.current > 0 ? "bxs-flame st-flame" : "bx-flame"}`} aria-hidden="true"></i>
                            {days(me.current)} <span>best {days(me.best)}</span>
                        </p>
                        <p className={`st-today ${me.activeToday ? "is-done" : ""}`}>
                            {me.activeToday
                                ? "Kept today."
                                : me.atRisk
                                    ? `Log ${rules.minMinutes}+ minutes today to keep it.`
                                    : `Log ${rules.minMinutes}+ minutes today to start one.`}
                        </p>
                    </>
                ) : (
                    <p className="ex-muted">You're not counted in this tribe.</p>
                )}
            </section>
        </div>
    );
};

export default StreakCards;
