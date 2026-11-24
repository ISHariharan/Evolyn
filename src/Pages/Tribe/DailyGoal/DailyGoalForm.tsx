import { FormEvent, useState } from "react";
import { setDailyGoal } from "../../../API/Tribe/Goals/api";
import { DailyGoal } from "../../../API/Tribe/Goals/types";

const QUICK_PICKS = [300, 400, 500, 700];

interface Props {
    current: number | null;
    onSaved: (goal: DailyGoal) => void;
    onCancel?: () => void;
    cancelLabel?: string;
    autoFocus?: boolean;
}

/** Enter or change your daily calorie goal. Used by the prompt, your Tribe page and tribe goal card. */
const DailyGoalForm = ({ current, onSaved, onCancel, cancelLabel = "Cancel", autoFocus }: Props) => {
    const [value, setValue] = useState(current ? String(current) : "");
    const [errors, setErrors] = useState<string[]>([]);
    const [saving, setSaving] = useState(false);

    const submit = async (e: FormEvent) => {
        e.preventDefault();
        const kcal = Math.round(Number(value));
        if (!value || !Number.isFinite(kcal) || kcal < 50 || kcal > 5000) {
            setErrors(["Enter a goal between 50 and 5000 kcal"]);
            return;
        }
        setSaving(true);
        const r = await setDailyGoal(kcal);
        setSaving(false);
        if (!r.ok || !r.data) {
            setErrors(r.errors);
            return;
        }
        onSaved(r.data);
    };

    return (
        <form className="dg-form" onSubmit={submit} noValidate>
            <label className="ex-field" style={{ marginBottom: 0 }}>
                <span>Calories to burn each day</span>
                <div className="ex-money">
                    <input type="number" inputMode="numeric" min="50" max="5000" step="10" placeholder="e.g. 400"
                           value={value} onChange={(e) => setValue(e.target.value)} autoFocus={autoFocus} />
                    <span>kcal</span>
                </div>
            </label>
            <div className="dg-picks" role="group" aria-label="Quick picks">
                {QUICK_PICKS.map((k) => (
                    <button key={k} type="button" className={`dg-pick ${value === String(k) ? "is-active" : ""}`}
                            aria-pressed={value === String(k)} onClick={() => setValue(String(k))}>
                        {k}
                    </button>
                ))}
            </div>
            <p className="tr-note" style={{ margin: 0 }}>
                Counts from today. Workouts of a type that counts for goals add up towards it, and every tribe
                you're in adds your goal to its monthly target.
            </p>
            {errors.length > 0 && <p className="ex-errors" role="alert" style={{ margin: 0 }}>{errors.join(", ")}</p>}
            <div className="ex-form-actions" style={{ marginTop: 0 }}>
                {onCancel && <button type="button" className="ex-btn ex-btn--secondary" onClick={onCancel}>{cancelLabel}</button>}
                <button type="submit" className="ex-btn ex-btn--primary" disabled={saving}>{saving ? "Saving…" : "Save goal"}</button>
            </div>
        </form>
    );
};

export default DailyGoalForm;
