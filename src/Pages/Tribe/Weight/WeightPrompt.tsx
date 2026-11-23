import "../../../Common/DialogBox/DialogBox.scss";
import "../../Expenses/Expenses.scss";
import "../Tribe.scss";
import { FormEvent, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useStore } from "../../../Store/GlobalStore/GlobalStore";
import { getLatestWeight, saveWeight } from "../../../API/Tribe/Weight/api";

const SKIPPED_KEY = "evolyn.weightPromptSkipped";

/**
 * Shown once after logging in when no weight has been saved yet: calories are
 * estimated as MET x weight x time, so nothing can be worked out without it.
 * "Later" hides it until the next visit (the browser tab's session).
 */
const WeightPrompt = () => {
    const { state } = useStore();
    const userId: string = state.userDetails?.id;
    const [open, setOpen] = useState(false);
    const [value, setValue] = useState("");
    const [errors, setErrors] = useState<string[]>([]);
    const [saving, setSaving] = useState(false);

    // Asked after the Profile ID prompt, so the two never show at once
    const hasProfileId = Boolean(state.userDetails?.profileId);

    useEffect(() => {
        if (!state.authenticated || !userId || !hasProfileId) return;
        let skipped = false;
        try { skipped = sessionStorage.getItem(SKIPPED_KEY) === "1"; } catch { /* storage blocked */ }
        if (skipped) return;
        // Only a clear "no weight yet" (404) opens it; a network error doesn't
        getLatestWeight(userId).then((r) => setOpen(!r.ok && r.status === 404));
    }, [state.authenticated, userId, hasProfileId]);

    if (!open) return null;

    const later = () => {
        try { sessionStorage.setItem(SKIPPED_KEY, "1"); } catch { /* storage blocked */ }
        setOpen(false);
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        const kg = Number(value);
        if (!value || Number.isNaN(kg)) {
            setErrors(["Enter your weight in kg"]);
            return;
        }
        setSaving(true);
        const r = await saveWeight(userId, Math.round(kg * 100) / 100);
        setSaving(false);
        if (!r.ok) {
            setErrors(r.errors);
            return;
        }
        setOpen(false);
    };

    return createPortal(
        <div className="dialog-overlay tr-prompt" role="dialog" aria-modal="true" aria-labelledby="tr-prompt-title">
            <form className="dialog-box" onSubmit={handleSubmit}>
                <div className="dialog-content">
                    <p id="tr-prompt-title" className="dialog-title">What's your weight today?</p>
                </div>
                <div className="tr-prompt__body">
                    <p className="ex-muted">
                        Evolyn estimates the calories of your workouts from your weight. Only you can see it, and you
                        can update it any day.
                    </p>
                    <label className="ex-field" style={{ marginBottom: 0 }}>
                        <span>Weight</span>
                        <div className="ex-money">
                            <input
                                type="number"
                                inputMode="decimal"
                                step="0.1"
                                min="20"
                                max="300"
                                placeholder="e.g. 72.4"
                                value={value}
                                onChange={(e) => setValue(e.target.value)}
                                autoFocus
                            />
                            <span>kg</span>
                        </div>
                    </label>
                    {errors.length > 0 && <p className="ex-errors" role="alert" style={{ margin: 0 }}>{errors.join(", ")}</p>}
                    <div className="ex-form-actions">
                        <button type="button" className="ex-btn ex-btn--secondary" onClick={later}>Later</button>
                        <button type="submit" className="ex-btn ex-btn--primary" disabled={saving}>
                            {saving ? "Saving…" : "Save"}
                        </button>
                    </div>
                </div>
            </form>
        </div>,
        document.body
    );
};

export default WeightPrompt;
