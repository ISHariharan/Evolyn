import { useState } from "react";
import { LeaderboardEntry } from "../../../API/Tribe/Goals/types";
import { MemberStreak } from "../../../API/Tribe/Streaks/types";

const initials = (first?: string, last?: string) => `${(first ?? "").charAt(0)}${(last ?? "").charAt(0)}`.toUpperCase();

/**
 * Members ranked by estimated calories or by active days (days with at least
 * one activity that counts). Same number = same rank. Calories aren't the only
 * way to contribute, hence the second view.
 */
const Leaderboard = ({ entries, streaks }: { entries: LeaderboardEntry[]; streaks?: MemberStreak[] }) => {
    const [by, setBy] = useState<"kcal" | "days" | "streak">("kcal");
    const sorted = [...entries].sort((a, b) =>
        by === "kcal" ? a.rankByKcal - b.rankByKcal : a.rankByDays - b.rankByDays);
    const top = Math.max(1, ...entries.map((e) => (by === "kcal" ? Number(e.kcal) : e.activeDays)));

    return (
        <section className="ex-card" aria-labelledby="gl-board-title">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem" }}>
                <h2 className="tb-section-title" id="gl-board-title" style={{ margin: 0 }}>Leaderboard</h2>
                <div className="ex-type-toggle" role="group" aria-label="Rank by"
                     style={{ marginBottom: 0, gridTemplateColumns: streaks ? "repeat(3, auto)" : undefined }}>
                    <button type="button" className={by === "kcal" ? "is-active" : ""} aria-pressed={by === "kcal"} onClick={() => setBy("kcal")}>
                        Calories
                    </button>
                    <button type="button" className={by === "days" ? "is-active" : ""} aria-pressed={by === "days"} onClick={() => setBy("days")}>
                        Active days
                    </button>
                    {streaks && (
                        <button type="button" className={by === "streak" ? "is-active" : ""} aria-pressed={by === "streak"} onClick={() => setBy("streak")}>
                            Streaks
                        </button>
                    )}
                </div>
            </div>
            {by === "streak" && streaks ? (
                <ol className="gl-board">
                    {streaks.map((m, i) => {
                        // Same current streak = same rank
                        const rank = streaks.findIndex((x) => x.current === m.current) + 1;
                        const top2 = Math.max(1, ...streaks.map((x) => x.current));
                        return (
                            <li key={m.userId} className={m.isMe ? "is-me" : ""}>
                                <span className="gl-rank">{rank}</span>
                                <span className="tb-badge" style={{ width: 34, height: 34, borderRadius: "50%", fontSize: 12 }}>
                                    {initials(m.firstName, m.lastName)}
                                </span>
                                <div className="gl-board__main">
                                    <div className="gl-board__row">
                                        <span className="gl-board__name">{m.isMe ? "You" : `${m.firstName} ${m.lastName}`}</span>
                                        <span className="gl-board__value">
                                            {m.current} {m.current === 1 ? "day" : "days"}
                                            <span className="tb-meta" style={{ fontWeight: 400 }}> · best {m.best}{m.atRisk ? " · at risk today" : ""}</span>
                                        </span>
                                    </div>
                                    <div className="gl-board__bar" style={{ width: `${(m.current / top2) * 100}%` }}></div>
                                </div>
                            </li>
                        );
                    })}
                </ol>
            ) : (
            <ol className="gl-board">
                {sorted.map((e) => {
                    const value = by === "kcal" ? Number(e.kcal) : e.activeDays;
                    return (
                        <li key={e.userId} className={e.isMe ? "is-me" : ""}>
                            <span className="gl-rank">{by === "kcal" ? e.rankByKcal : e.rankByDays}</span>
                            <span className="tb-badge" style={{ width: 34, height: 34, borderRadius: "50%", fontSize: 12 }}>
                                {initials(e.firstName, e.lastName)}
                            </span>
                            <div className="gl-board__main">
                                <div className="gl-board__row">
                                    <span className="gl-board__name">{e.isMe ? "You" : `${e.firstName} ${e.lastName}`}</span>
                                    <span className="gl-board__value">
                                        {by === "kcal" ? `${Math.round(value).toLocaleString("en-IN")} kcal` : `${value} ${value === 1 ? "day" : "days"}`}
                                    </span>
                                </div>
                                <div className="gl-board__bar" style={{ width: `${(value / top) * 100}%` }}></div>
                                {by === "kcal" && (
                                    <span className="tr-note">
                                        {e.dailyGoal != null
                                            ? `Goal ${e.dailyGoal.toLocaleString("en-IN")} kcal/day${e.goalPercent != null ? ` · ${e.goalPercent}% of their month` : ""}`
                                            : "No daily goal yet"}
                                    </span>
                                )}
                            </div>
                        </li>
                    );
                })}
            </ol>
            )}
            <p className="tr-note" style={{ marginTop: "0.75rem" }}>
                {by === "kcal"
                    ? "Estimated calories for the month. Same number = same rank."
                    : by === "days"
                        ? "Days with at least one activity that counts for goals. Same number = same rank."
                        : "Current streak in days (best ever after it). Not active yet today = at risk, not broken."}
            </p>
        </section>
    );
};

export default Leaderboard;
