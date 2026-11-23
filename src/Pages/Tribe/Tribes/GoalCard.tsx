import { FormEvent, useState } from "react";
import { setTribeGoal } from "../../../API/Tribe/Goals/api";
import { TribeDashboard } from "../../../API/Tribe/Goals/types";

const kcal = (n: number | null | undefined) => (n == null ? "—" : Math.round(n).toLocaleString("en-IN"));

const monthName = (month: string) =>
    new Date(`${month}-01T00:00:00`).toLocaleDateString("en-IN", { month: "long", year: "numeric" });

interface Props {
    tribeId: string;
    data: TribeDashboard;
    readOnly: boolean;                       // archived tribe
    onChange: (next: TribeDashboard) => void;
}

/**
 * The month's goal: progress, what's left, what's needed per day, and the
 * projection at the current pace. Any member can set or change the target
 * (no roles yet); past months are read-only.
 */
const GoalCard = ({ tribeId, data, readOnly, onChange }: Props) => {
    const [editing, setEditing] = useState(false);
    const [value, setValue] = useState("");
    const [errors, setErrors] = useState<string[]>([]);
    const [saving, setSaving] = useState(false);
    const { goal, progress } = data;
    const canEdit = data.canSetGoal && !readOnly;

    const startEdit = () => {
        setValue(String(goal?.target ?? data.suggestedTarget ?? ""));
        setErrors([]);
        setEditing(true);
    };

    const save = async (e: FormEvent) => {
        e.preventDefault();
        const target = Number(value);
        if (!Number.isFinite(target) || target < 1) {
            setErrors(["Enter a target in kcal"]);
            return;
        }
        setSaving(true);
        const r = await setTribeGoal(tribeId, data.month, Math.round(target));
        setSaving(false);
        if (!r.ok || !r.data) {
            setErrors(r.errors);
            return;
        }
        onChange(r.data);
        setEditing(false);
    };

    const form = (
        <form onSubmit={save} className="tb-row" style={{ marginTop: "0.75rem" }}>
            <label className="ex-field">
                <span>Target for {monthName(data.month)}</span>
                <div className="ex-money">
                    <input type="number" inputMode="numeric" min="1" step="100" value={value}
                           onChange={(e) => setValue(e.target.value)} autoFocus />
                    <span>kcal</span>
                </div>
            </label>
            <button type="submit" className="ex-btn ex-btn--primary" disabled={saving}>{saving ? "Saving…" : "Save goal"}</button>
            {goal && <button type="button" className="ex-btn ex-btn--secondary" onClick={() => setEditing(false)}>Cancel</button>}
        </form>
    );

    // No goal yet for this month
    if (!goal || !progress) {
        return (
            <section className="ex-card">
                <h2 className="tb-section-title">{monthName(data.month)} goal</h2>
                <p className="ex-muted" style={{ margin: 0 }}>
                    No goal {data.canSetGoal ? "yet" : "was set"}. The tribe burned <strong>{kcal(data.total)} kcal</strong>
                    {data.month === data.today.slice(0, 7) ? " this month so far" : ` in ${monthName(data.month)}`}
                    {data.memberCount > 0 ? `, about ${kcal(Math.round(Math.max(1, data.total) / Math.max(1, data.memberCount)))} per member` : ""}.
                </p>
                {canEdit && !editing && (
                    <button type="button" className="ex-btn ex-btn--primary" style={{ marginTop: "0.75rem" }} onClick={startEdit}>
                        Set this month's goal
                    </button>
                )}
                {canEdit && editing && form}
                {data.suggestedTarget && canEdit && !editing && (
                    <p className="tr-note" style={{ marginTop: "0.5rem" }}>Last goal was {kcal(data.suggestedTarget)} kcal.</p>
                )}
                {errors.length > 0 && <p className="ex-errors" role="alert" style={{ marginTop: "0.75rem" }}>{errors.join(", ")}</p>}
            </section>
        );
    }

    const pct = Math.min(100, Number(progress.percent));
    const ended = progress.phase === "ENDED";
    const upcoming = progress.phase === "UPCOMING";

    return (
        <section className="ex-card">
            <div style={{ display: "flex", justifyContent: "space-between", gap: "0.75rem", flexWrap: "wrap", alignItems: "baseline" }}>
                <h2 className="tb-section-title" style={{ margin: 0 }}>{monthName(data.month)} goal</h2>
                {canEdit && !editing && (
                    <button type="button" className="ex-btn ex-btn--secondary" onClick={startEdit}>Change goal</button>
                )}
            </div>

            <p className="gl-big">
                {kcal(data.total)} <span>of {kcal(goal.target)} kcal</span>
            </p>
            <div className="gl-track" role="img" aria-label={`${progress.percent}% of the goal reached`}>
                <div className={`gl-fill ${progress.reached ? "gl-fill--done" : ""}`} style={{ width: `${pct}%` }}></div>
            </div>
            <p className="tb-meta" style={{ margin: "0.375rem 0 0" }}>
                {progress.reached
                    ? `Goal reached: ${progress.percent}%`
                    : `${progress.percent}% done · ${kcal(progress.remaining)} kcal to go`}
            </p>

            {editing && form}
            {errors.length > 0 && <p className="ex-errors" role="alert" style={{ marginTop: "0.75rem" }}>{errors.join(", ")}</p>}

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
                Goal set by {goal.updatedByName}{goal.updatedByProfileId ? ` (@${goal.updatedByProfileId})` : ""}. Any member can change it.
            </p>
        </section>
    );
};

export default GoalCard;
