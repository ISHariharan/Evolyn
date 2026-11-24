import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { DAILY_GOAL_SAVED_EVENT, getTribeDashboard } from "../../../API/Tribe/Goals/api";
import { TribeDashboard } from "../../../API/Tribe/Goals/types";
import { getTribeStreaks } from "../../../API/Tribe/Streaks/api";
import { TribeStreaks } from "../../../API/Tribe/Streaks/types";
import StreakCards from "./StreakCards";
import { Bone } from "../../Expenses/Skeletons";
import { todayLocal } from "../../Expenses/utils";
import GoalCard from "./GoalCard";
import DailyChart from "./DailyChart";
import Leaderboard from "./Leaderboard";

const kcal = (n: number | null | undefined) => (n == null ? "—" : Math.round(n).toLocaleString("en-IN"));

// "2026-11" plus/minus months
const shiftMonth = (month: string, by: number) => {
    const d = new Date(`${month}-01T00:00:00`);
    d.setMonth(d.getMonth() + by);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};

const monthName = (month: string) =>
    new Date(`${month}-01T00:00:00`).toLocaleDateString("en-IN", { month: "long", year: "numeric" });

/**
 * Overview tab: the month's goal and progress, your share, the tribe's daily
 * calories and the leaderboard. Earlier months can be looked back on, and next
 * month shows the target from everyone's current daily goals.
 */
const TribeOverviewTab = ({ tribeId, archived }: { tribeId: string; archived: boolean }) => {
    const thisMonth = todayLocal().slice(0, 7);
    const [month, setMonth] = useState(thisMonth);
    const [data, setData] = useState<TribeDashboard | null>(null);
    const [error, setError] = useState("");
    const [streaks, setStreaks] = useState<TribeStreaks | null>(null);
    // Bumped when someone saves a daily goal here, so the tribe's target is reloaded
    const [goalVersion, setGoalVersion] = useState(0);

    useEffect(() => {
        const bump = () => setGoalVersion((v) => v + 1);
        window.addEventListener(DAILY_GOAL_SAVED_EVENT, bump);
        return () => window.removeEventListener(DAILY_GOAL_SAVED_EVENT, bump);
    }, []);

    // Streaks are about today, so they're loaded once, whatever month is shown
    useEffect(() => {
        getTribeStreaks(tribeId).then((r) => setStreaks(r.ok && r.data ? r.data : null));
    }, [tribeId]);

    useEffect(() => {
        let stale = false;
        setData(null);
        setError("");
        getTribeDashboard(tribeId, month).then((r) => {
            if (stale) return;
            if (!r.ok || !r.data) setError(r.errors.join(", "));
            else setData(r.data);
        });
        return () => { stale = true; };
    }, [tribeId, month, goalVersion]);

    const me = data?.me;

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <div className="gl-months" role="group" aria-label="Month">
                <button type="button" className="ex-icon-btn" aria-label="Previous month" onClick={() => setMonth(shiftMonth(month, -1))}>
                    <i className="bx bx-chevron-left" aria-hidden="true"></i>
                </button>
                <span className="gl-months__name" aria-live="polite">
                    {monthName(month)}{month === thisMonth ? " · this month" : ""}
                </span>
                <button type="button" className="ex-icon-btn" aria-label="Next month"
                        disabled={month >= shiftMonth(thisMonth, 1)} onClick={() => setMonth(shiftMonth(month, 1))}>
                    <i className="bx bx-chevron-right" aria-hidden="true"></i>
                </button>
                {month !== thisMonth && (
                    <button type="button" className="ex-btn ex-btn--secondary" onClick={() => setMonth(thisMonth)}>This month</button>
                )}
            </div>

            {error && <p className="ex-errors" role="alert" style={{ margin: 0 }}>{error}</p>}
            {!data && !error && (
                <div className="tr-layout" role="status" aria-busy="true">
                    <span className="sr-only">Loading…</span>
                    <div className="ex-card"><Bone w="40%" h={16} /><Bone w="70%" h={32} style={{ marginTop: 12 }} /><Bone h={12} style={{ marginTop: 12 }} /></div>
                    <div className="ex-card"><Bone w="50%" h={16} /><Bone w="60%" h={28} style={{ marginTop: 12 }} /></div>
                </div>
            )}

            {data && (
                <>
                    <div className="tr-layout">
                        <GoalCard data={data} readOnly={archived} />
                        <section className="ex-card" style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                            <h2 className="tb-section-title" style={{ margin: 0 }}>{month === thisMonth ? "You this month" : `You in ${monthName(month)}`}</h2>
                            {me ? (
                                <div className="gl-me">
                                    <div><span className="tr-stat__label">Your calories</span><span className="gl-stat">{kcal(me.kcal)}</span>
                                        <span className="tr-note">{me.sharePercent}% of the tribe</span></div>
                                    <div><span className="tr-stat__label">Rank</span><span className="gl-stat">#{me.rankByKcal} <small>of {data.memberCount}</small></span></div>
                                    <div><span className="tr-stat__label">Active days</span><span className="gl-stat">{me.activeDays}</span></div>
                                    <div><span className="tr-stat__label">Activities</span><span className="gl-stat">{me.sessions}</span></div>
                                    <div><span className="tr-stat__label">Your goal</span>
                                        <span className="gl-stat">{me.dailyGoal != null ? <>{kcal(me.dailyGoal)} <small>kcal/day</small></> : "Not set"}</span>
                                        {me.goalPercent != null && <span className="tr-note">{me.goalPercent}% of your {kcal(me.monthTarget)} kcal</span>}</div>
                                </div>
                            ) : (
                                <p className="ex-muted">You're not counted in this month.</p>
                            )}
                            {month === thisMonth && !archived && (
                                <Link to="/tribe/activities/new" className="ex-btn ex-btn--primary" style={{ alignSelf: "flex-start" }}>
                                    <i className="bx bx-plus" aria-hidden="true"></i>Log activity
                                </Link>
                            )}
                        </section>
                    </div>

                    {month === thisMonth && streaks && <StreakCards data={streaks} />}
                    <DailyChart data={data} />
                    <Leaderboard entries={data.leaderboard} streaks={month === thisMonth ? streaks?.members : undefined} />

                    <p className="tr-note" style={{ margin: 0 }}>
                        What counts: activities of current members dated in {monthName(month)} (India time), for activity types
                        that count for goals (not sleeping, driving and similar). Activities marked "Only me" add to totals but are
                        never shown in the feed. Calories are estimates: MET × weight × time. The goal is everyone's daily
                        goal added up over the month's days, counted from the day each was set.
                    </p>
                </>
            )}
        </div>
    );
};

export default TribeOverviewTab;
