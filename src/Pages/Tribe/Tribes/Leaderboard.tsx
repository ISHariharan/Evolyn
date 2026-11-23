import { useState } from "react";
import { LeaderboardEntry } from "../../../API/Tribe/Goals/types";

const initials = (first?: string, last?: string) => `${(first ?? "").charAt(0)}${(last ?? "").charAt(0)}`.toUpperCase();

/**
 * Members ranked by estimated calories or by active days (days with at least
 * one activity that counts). Same number = same rank. Calories aren't the only
 * way to contribute, hence the second view.
 */
const Leaderboard = ({ entries }: { entries: LeaderboardEntry[] }) => {
    const [by, setBy] = useState<"kcal" | "days">("kcal");
    const sorted = [...entries].sort((a, b) =>
        by === "kcal" ? a.rankByKcal - b.rankByKcal : a.rankByDays - b.rankByDays);
    const top = Math.max(1, ...entries.map((e) => (by === "kcal" ? Number(e.kcal) : e.activeDays)));

    return (
        <section className="ex-card" aria-labelledby="gl-board-title">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem" }}>
                <h2 className="tb-section-title" id="gl-board-title" style={{ margin: 0 }}>Leaderboard</h2>
                <div className="ex-type-toggle" role="group" aria-label="Rank by" style={{ marginBottom: 0 }}>
                    <button type="button" className={by === "kcal" ? "is-active" : ""} aria-pressed={by === "kcal"} onClick={() => setBy("kcal")}>
                        Calories
                    </button>
                    <button type="button" className={by === "days" ? "is-active" : ""} aria-pressed={by === "days"} onClick={() => setBy("days")}>
                        Active days
                    </button>
                </div>
            </div>
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
                            </div>
                        </li>
                    );
                })}
            </ol>
            <p className="tr-note" style={{ marginTop: "0.75rem" }}>
                {by === "kcal"
                    ? "Estimated calories for the month. Same number = same rank."
                    : "Days with at least one activity that counts for goals. Same number = same rank."}
            </p>
        </section>
    );
};

export default Leaderboard;
