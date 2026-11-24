import "../DailyGoal/DailyGoal.scss";
import { useState } from "react";
import { TribeDashboard } from "../../../API/Tribe/Goals/types";
import DailyGoalForm from "../DailyGoal/DailyGoalForm";

const kcal = (n: number | null | undefined) => (n == null ? "—" : Math.round(n).toLocaleString("en-IN"));

const dayMonth = (iso: string) =>
    new Date(`${iso}T00:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "short" });

const monthName = (month: string) =>
    new Date(`${month}-01T00:00:00`).toLocaleDateString("en-IN", { month: "long", year: "numeric" });

interface Props {
    data: TribeDashboard;
    readOnly: boolean;   // archived tribe
}

/**
 * The month's goal: the members' daily goals added up over the month. Nobody types
 * it in; each member sets their own daily goal (here, on their Tribe page or in the
 * prompt after login). Shows progress, what's left, what's needed per day and the
 * projection at the current pace. After a save the overview reloads itself
 * (DAILY_GOAL_SAVED_EVENT).
 */
const GoalCard = ({ data, readOnly }: Props) => {
    const [editing, setEditing] = useState(false);
    const { goal, progress, me } = data;
    const thisMonth = data.month === data.today.slice(0, 7);
    const canSetMine = thisMonth && !readOnly && me != null;
    const iHaveNoGoal = me != null && me.dailyGoal == null;

    const mine = canSetMine && (editing ? (
        <div style={{ marginTop: "0.75rem" }}>
            <DailyGoalForm current={me?.dailyGoal ?? null} onSaved={() => setEditing(false)} onCancel={() => setEditing(false)} autoFocus />
        </div>
    ) : iHaveNoGoal ? (
        <button type="button" className="ex-btn ex-btn--primary" style={{ marginTop: "0.75rem", alignSelf: "flex-start" }}
                onClick={() => setEditing(true)}>
            Set your daily goal
        </button>
    ) : null);

    // Nobody has a daily goal covering this month
    if (!goal || !progress) {
        return (
            <section className="ex-card" style={{ display: "flex", flexDirection: "column" }}>
                <h2 className="tb-section-title">{monthName(data.month)} goal</h2>
                <p className="ex-muted" style={{ margin: 0 }}>
                    {thisMonth ? "No goal yet. " : "There was no goal. "}
                    The tribe's goal is everyone's daily calorie goal added up, and {thisMonth ? "no one has set one yet" : "no one had one then"}.
                    The tribe burned <strong>{kcal(data.total)} kcal</strong>{thisMonth ? " this month so far" : ` in ${monthName(data.month)}`}.
                </p>
                {mine}
            </section>
        );
    }

    const pct = Math.min(100, Number(progress.percent));
    const ended = progress.phase === "ENDED";
    const upcoming = progress.phase === "UPCOMING";
    const missing = goal.memberCount - goal.membersWithGoal;

    return (
        <section className="ex-card" style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: "0.75rem", flexWrap: "wrap", alignItems: "baseline" }}>
                <h2 className="tb-section-title" style={{ margin: 0 }}>{monthName(data.month)} goal</h2>
                {canSetMine && !iHaveNoGoal && !editing && (
                    <button type="button" className="ex-btn ex-btn--secondary" onClick={() => setEditing(true)}>Change my daily goal</button>
                )}
            </div>

            <p className="gl-big">
                {kcal(goal.total)} <span>of {kcal(goal.target)} kcal</span>
            </p>
            <div className="gl-track" role="img" aria-label={`${progress.percent}% of the goal reached`}>
                <div className={`gl-fill ${progress.reached ? "gl-fill--done" : ""}`} style={{ width: `${pct}%` }}></div>
            </div>
            <p className="tb-meta" style={{ margin: "0.375rem 0 0" }}>
                {progress.reached
                    ? `Goal reached: ${progress.percent}%`
                    : `${progress.percent}% done · ${kcal(progress.remaining)} kcal to go`}
            </p>

            {mine}

            <div className="gl-stats">
                {!ended && !progress.reached && (
                    <div>
                        <span className="tr-stat__label">Needed per day</span>
                        <span className="gl-stat">{kcal(progress.neededPerDay)} kcal</span>
                        <span className="tr-note">for the {progress.remainingDays} {progress.remainingDays === 1 ? "day" : "days"} left, today included</span>
                    </div>
                )}
                {!upcoming && (
                    <div>
                        <span className="tr-stat__label">{ended ? "Average per day" : "Average so far"}</span>
                        <span className="gl-stat">{kcal(progress.averagePerDay)} kcal</span>
                        <span className="tr-note">over {progress.elapsedDays} {progress.elapsedDays === 1 ? "day" : "days"}</span>
                    </div>
                )}
                {progress.phase === "ACTIVE" && progress.projectedTotal != null && (
                    <div>
                        <span className="tr-stat__label">At current pace</span>
                        <span className="gl-stat">≈ {kcal(progress.projectedTotal)} kcal</span>
                        <span className="tr-note">
                            {progress.projectedPercent}% of the goal by month end. A projection from the average so far, not a promise.
                        </span>
                    </div>
                )}
                {ended && (
                    <div>
                        <span className="tr-stat__label">Result</span>
                        <span className="gl-stat">{progress.reached ? "Reached" : "Not reached"}</span>
                        <span className="tr-note">{progress.percent}% of {kcal(goal.target)} kcal</span>
                    </div>
                )}
            </div>
            <p className="tr-note" style={{ marginTop: "0.75rem" }}>
                Everyone's daily goals added up: {kcal(goal.dailyTarget)} kcal a day from {goal.membersWithGoal} of {goal.memberCount}{" "}
                {goal.memberCount === 1 ? "member" : "members"}.
                {missing > 0 ? ` ${missing} ${missing === 1 ? "member hasn't" : "members haven't"} set one yet and add 0 until they do.` : ""}
                {goal.startsOn !== data.periodStart
                    ? ` Counted from ${dayMonth(goal.startsOn)}, when the first goal applied; each person's calories count from the day they set theirs.`
                    : ""}
            </p>
        </section>
    );
};

export default GoalCard;
