import "../../Expenses/Expenses.scss";
import "./Tribes.scss";
import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createTribe } from "../../../API/Tribe/Tribes/api";

/** /tribe/tribes/new - name and description; invite friends from the tribe page afterwards. */
const CreateTribe = () => {
    const navigate = useNavigate();
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [errors, setErrors] = useState<string[]>([]);
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (name.trim().length < 2) {
            setErrors(["Name must be 2 to 60 characters"]);
            return;
        }
        setSaving(true);
        setErrors([]);
        const r = await createTribe(name.trim(), description.trim() || undefined);
        setSaving(false);
        if (!r.ok || !r.data) {
            setErrors(r.errors);
            return;
        }
        // Straight to Members so you can invite people
        navigate(`/tribe/tribes/${r.data.tribeId}?tab=members`, { state: { flash: "Tribe created. Now invite your friends." } });
    };

    return (
        <div className="ex-page">
            <header className="ex-header">
                <div>
                    <Link to="/tribe/tribes" className="ex-back"><i className="bx bx-chevron-left" aria-hidden="true"></i>My tribes</Link>
                    <h1 className="ex-title">Create a tribe</h1>
                    <p className="ex-subtitle">A private group: only people you invite can join or see it.</p>
                </div>
            </header>

            <form className="ex-card" style={{ maxWidth: 560 }} onSubmit={handleSubmit} noValidate>
                <label className="ex-field">
                    <span>Name <span className="ex-required" aria-hidden="true">*</span></span>
                    <input type="text" maxLength={60} placeholder="e.g. Handball Crew" value={name}
                           onChange={(e) => setName(e.target.value)} autoFocus />
                </label>
                <label className="ex-field">
                    <span>Description (optional)</span>
                    <textarea maxLength={300} placeholder="e.g. Our handball group: practice, runs and gym"
                              value={description} onChange={(e) => setDescription(e.target.value)} />
                </label>
                {errors.length > 0 && <ul className="ex-errors" role="alert">{errors.map((e) => <li key={e}>{e}</li>)}</ul>}
                <div className="ex-form-actions">
                    <Link to="/tribe/tribes" className="ex-btn ex-btn--secondary">Cancel</Link>
                    <button type="submit" className="ex-btn ex-btn--primary" disabled={saving}>
                        {saving ? "Creating…" : "Create tribe"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateTribe;
