import { FormEvent, useEffect, useState } from "react";
import { WEIGHT_SAVED_EVENT, getLatestWeight, saveWeight } from "../../../API/Tribe/Weight/api";
import { WeightEntry } from "../../../API/Tribe/Weight/types";
import { formatDate, todayLocal } from "../../Expenses/utils";
import { Bone } from "../../Expenses/Skeletons";

/**
 * "Today's weight": shows the latest saved weight and lets you save today's.
 * Saving twice on the same day corrects it. Only you see the weight; tribes see its
 * change only if you turn sharing on (a tribe's Weight tab).
 */
const TodayWeightCard = ({ userId, onSaved }: { userId: string; onSaved?: (entry: WeightEntry) => void }) => {
    const [latest, setLatest] = useState<WeightEntry | null | undefined>(undefined); // undefined = loading
    const [value, setValue] = useState("");
    const [errors, setErrors] = useState<string[]>([]);
    const [saved, setSaved] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!userId) return;
        const load = () => getLatestWeight(userId).then((r) => setLatest(r.ok && r.data ? r.data : null));
        load();
        // Saved somewhere else (e.g. the first-login prompt): show the new value
        window.addEventListener(WEIGHT_SAVED_EVENT, load);
        return () => window.removeEventListener(WEIGHT_SAVED_EVENT, load);
    }, [userId]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        const kg = Number(value);
        if (!value || Number.isNaN(kg)) {
            setErrors(["Enter your weight in kg"]);
            return;
        }
        setSaving(true);
        setErrors([]);
        const r = await saveWeight(userId, Math.round(kg * 100) / 100);
        setSaving(false);
        if (!r.ok || !r.data) {
            setErrors(r.errors);
            return;
        }
        setLatest(r.data);
        setValue("");
        setSaved(true);
        onSaved?.(r.data);
    };

    const isToday = latest?.recordedOn === todayLocal();

    return (
        <section className="ex-card tr-weight" aria-labelledby="tr-weight-title">
            <h2 className="ex-card__title" id="tr-weight-title" style={{ margin: 0 }}>Today's weight</h2>
            {latest === undefined ? (
                <Bone w="45%" h={28} />
            ) : latest ? (
                <p className="tr-weight__now">
                    {Number(latest.weightKg)} kg
                    <small>{isToday ? "today" : `on ${formatDate(latest.recordedOn)}`}</small>
                </p>
            ) : (
                <p className="ex-muted">No weight saved yet. Calories are estimated from it.</p>
            )}

            <form className="tr-weight__form" onSubmit={handleSubmit}>
                <label className="sr-only" htmlFor="tr-weight-input">Weight in kg</label>
                <div className="ex-money">
                    <input
                        id="tr-weight-input"
                        className="ex-input"
                        type="number"
                        inputMode="decimal"
                        step="0.1"
                        min="20"
                        max="300"
                        placeholder={latest ? String(Number(latest.weightKg)) : "e.g. 72.4"}
                        value={value}
                        onChange={(e) => { setValue(e.target.value); setSaved(false); }}
                    />
                    <span>kg</span>
                </div>
                <button className="ex-btn ex-btn--primary" type="submit" disabled={saving}>
                    {saving ? "Saving…" : isToday ? "Update" : "Save"}
                </button>
            </form>
            {errors.length > 0 && <p className="ex-errors" role="alert" style={{ margin: 0 }}>{errors.join(", ")}</p>}
            {saved && <p className="tr-success" role="status">Saved.</p>}
            <p className="tr-note">Only you can see your weight. You can share how it changes (never the weight) from a tribe's Weight tab.</p>
        </section>
    );
};

export default TodayWeightCard;
