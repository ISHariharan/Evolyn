import { FormEvent, useEffect, useState } from "react";
import { getTribeStreaks, setStreakRules } from "../../../API/Tribe/Streaks/api";

/** Streak rules in Tribe settings. Any member can change them (no roles yet). */
const StreakRulesForm = ({ tribeId }: { tribeId: string }) => {
    const [minMinutes, setMinMinutes] = useState("");
    const [memberPercent, setMemberPercent] = useState("");
    const [memberCount, setMemberCount] = useState(0);
    const [errors, setErrors] = useState<string[]>([]);
    const [saved, setSaved] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        getTribeStreaks(tribeId).then((r) => {
            if (!r.ok || !r.data) return;
            setMinMinutes(String(r.data.rules.minMinutes));
            setMemberPercent(String(r.data.rules.memberPercent));
            setMemberCount(r.data.rules.memberCount);
        });
    }, [tribeId]);

    const pct = Number(memberPercent);
    const needed = memberCount > 0 && pct > 0 ? Math.max(1, Math.ceil((memberCount * pct) / 100)) : null;

    const save = async (e: FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setErrors([]);
        setSaved(false);
        const r = await setStreakRules(tribeId, Number(minMinutes), Number(memberPercent));
        setSaving(false);
        if (!r.ok) {
            setErrors(r.errors);
            return;
        }
        setSaved(true);
    };

    return (
        <form onSubmit={save} style={{ marginTop: "1rem" }}>
            <h3 className="tb-section-title" style={{ fontSize: 14 }}>Streak rules</h3>
            <div className="tb-row">
                <label className="ex-field">
                    <span>A person's day counts with an activity of at least</span>
                    <div className="ex-money">
                        <input type="number" min="1" max="240" value={minMinutes} onChange={(e) => { setMinMinutes(e.target.value); setSaved(false); }} />
                        <span>min</span>
                    </div>
                </label>
                <label className="ex-field">
                    <span>The tribe's day counts when this many members are active</span>
                    <div className="ex-money">
                        <input type="number" min="1" max="100" value={memberPercent} onChange={(e) => { setMemberPercent(e.target.value); setSaved(false); }} />
                        <span>%</span>
                    </div>
                </label>
                <button type="submit" className="ex-btn ex-btn--secondary" disabled={saving || !minMinutes || !memberPercent}>
                    {saving ? "Saving…" : "Save rules"}
                </button>
            </div>
            {needed && <p className="tr-note" style={{ marginTop: "0.5rem" }}>With {memberCount} members, that's {needed} {needed === 1 ? "person" : "people"} a day.</p>}
            {errors.length > 0 && <p className="ex-errors" role="alert" style={{ marginTop: "0.5rem" }}>{errors.join(", ")}</p>}
            {saved && <p className="tr-success" role="status" style={{ marginTop: "0.5rem" }}>Saved. Streaks are recalculated with the new rules.</p>}
        </form>
    );
};

export default StreakRulesForm;
