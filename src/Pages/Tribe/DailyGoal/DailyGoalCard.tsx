import "../Tribes/Tribes.scss";
import "./DailyGoal.scss";
import { useEffect, useState } from "react";
import { DAILY_GOAL_SAVED_EVENT, getDailyGoal } from "../../../API/Tribe/Goals/api";
import { DailyGoal } from "../../../API/Tribe/Goals/types";
import { Bone } from "../../Expenses/Skeletons";
import DailyGoalForm from "./DailyGoalForm";

const kcal = (n: number | null | undefined) => (n == null ? "—" : Math.round(n).toLocaleString("en-IN"));

/** Your daily goal on your Tribe page: today's progress, the month so far, and a way to change it. */
const DailyGoalCard = () => {
    const [goal, setGoal] = useState<DailyGoal | null | undefined>(undefined);
    const [editing, setEditing] = useState(false);

    useEffect(() => {
        const load = () => getDailyGoal().then((r) => setGoal(r.ok && r.data ? r.data : null));
        load();
        // Saved from the prompt or another card: show the new numbers
        window.addEventListener(DAILY_GOAL_SAVED_EVENT, load);
        return () => window.removeEventListener(DAILY_GOAL_SAVED_EVENT, load);
    }, []);

    if (goal === undefined) {
        return <section className="ex-card dg-card"><Bone w="40%" h={14} /><Bone w="60%" h={28} /><Bone w="100%" h={8} /></section>;
    }
    if (goal === null) {
        return <section className="ex-card dg-card"><p className="ex-muted" style={{ margin: 0 }}>Couldn't load your daily goal.</p></section>;
    }

    const saved = (g: DailyGoal) => {
        setGoal(g);
        setEditing(false);
    };

    if (goal.kcal == null || editing) {
        return (
            <section className="ex-card dg-card" aria-labelledby="dg-title">
                <h2 className="ex-card__title" id="dg-title">{goal.kcal == null ? "Set your daily goal" : "Change your daily goal"}</h2>
                {goal.kcal == null && (
                    <p className="ex-muted" style={{ margin: "0 0 0.75rem" }}>
                        Your tribes' monthly goals are built from everyone's daily goals. Until you set one, you add 0 to them.
                    </p>
                )}
                <DailyGoalForm current={goal.kcal} onSaved={saved} onCancel={goal.kcal == null ? undefined : () => setEditing(false)} />
            </section>
        );
    }

    const pct = Math.min(100, Number(goal.todayPercent ?? 0));
    const done = Number(goal.todayPercent ?? 0) >= 100;
    return (
        <section className="ex-card dg-card" aria-labelledby="dg-title">
            <div className="dg-head">
                <h2 className="ex-card__title" id="dg-title" style={{ margin: 0 }}>Your daily goal</h2>
                <button type="button" className="ex-btn ex-btn--secondary" onClick={() => setEditing(true)}>Change</button>
            </div>
            <p className="gl-big" style={{ margin: "0.5rem 0" }}>
                {kcal(goal.todayKcal)} <span>of {kcal(goal.kcal)} kcal today</span>
            </p>
            <div className="gl-track" role="img" aria-label={`${goal.todayPercent ?? 0}% of today's goal`}>
                <div className={`gl-fill ${done ? "gl-fill--done" : ""}`} style={{ width: `${pct}%` }}></div>
            </div>
            <p className="tb-meta" style={{ margin: "0.375rem 0 0" }}>
                {done ? "Done for today" : `${kcal(Math.max(0, goal.kcal - goal.todayKcal))} kcal to go today`}
                {goal.monthTarget != null && ` · ${kcal(goal.monthKcal)} of ${kcal(goal.monthTarget)} kcal this month`}
            </p>
        </section>
    );
};

export default DailyGoalCard;
