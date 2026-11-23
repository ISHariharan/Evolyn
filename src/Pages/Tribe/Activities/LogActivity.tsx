import "../../Expenses/Expenses.scss";
import "../Tribe.scss";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useStore } from "../../../Store/GlobalStore/GlobalStore";
import Dialog from "../../../Common/DialogBox/DialogBox";
import { getCatalogue } from "../../../API/Tribe/Activities/catalogue";
import { Catalogue } from "../../../API/Tribe/Activities/catalogueTypes";
import { createActivity, deleteActivity, getActivity, updateActivity } from "../../../API/Tribe/Activities/api";
import { ActivityInput } from "../../../API/Tribe/Activities/types";
import { WEIGHT_SAVED_EVENT, getLatestWeight } from "../../../API/Tribe/Weight/api";
import { WeightEntry } from "../../../API/Tribe/Weight/types";
import { formatDate, toLocalIsoDate } from "../../Expenses/utils";
import { FormSkeleton } from "../../Expenses/Skeletons";
import ActivityPicker from "./ActivityPicker";
import { POPULAR_CODES, getRecentCodes, rememberRecent } from "./recent";
import TodayWeightCard from "../Weight/TodayWeightCard";

const DURATIONS = [30, 45, 60, 90, 120];
const pad = (n: number) => String(n).padStart(2, "0");

// "YYYY-MM-DDTHH:mm" in local time, the format <input type="datetime-local"> uses
const toLocalDateTime = (d: Date) => `${toLocalIsoDate(d)}T${pad(d.getHours())}:${pad(d.getMinutes())}`;

// People usually log right after finishing, so default to an hour ago (rounded down to 5 minutes)
const defaultStart = () => {
    const d = new Date(Date.now() - 60 * 60 * 1000);
    d.setMinutes(d.getMinutes() - (d.getMinutes() % 5), 0, 0);
    return toLocalDateTime(d);
};

/**
 * One component for both screens:
 *   /tribe/activities/new                  -> Log an activity
 *   /tribe/activities/:activityId/edit     -> Edit (loads it first, adds Delete)
 *
 * The calories shown while typing are a preview (MET x weight x time); the
 * server does the real calculation when you save.
 */
const LogActivity = () => {
    const { state } = useStore();
    const userId: string = state.userDetails?.id;
    const navigate = useNavigate();
    const { activityId } = useParams();
    const isEdit = Boolean(activityId);

    const [catalogue, setCatalogue] = useState<Catalogue | null>(null);
    const [weight, setWeight] = useState<WeightEntry | null | undefined>(undefined); // undefined = loading
    const [loadError, setLoadError] = useState("");

    // Form fields
    const [code, setCode] = useState<string | null>(null);
    const [startedAt, setStartedAt] = useState(defaultStart());
    const [minutes, setMinutes] = useState("60");
    const [distance, setDistance] = useState("");
    const [notes, setNotes] = useState("");
    const [visibility, setVisibility] = useState<"TRIBES" | "PRIVATE">("TRIBES");

    const [errors, setErrors] = useState<string[]>([]);
    const [overlap, setOverlap] = useState(""); // message when the server asks to confirm an overlap
    const [needsWeight, setNeedsWeight] = useState(false);
    const [saving, setSaving] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);

    useEffect(() => {
        if (!userId) return;
        const load = async () => {
            const [cat, latest] = await Promise.all([getCatalogue(), getLatestWeight(userId)]);
            if (!cat.ok || !cat.data) {
                setLoadError(cat.errors.join(", "));
                return;
            }
            setWeight(latest.ok && latest.data ? latest.data : null);
            if (activityId) {
                const a = await getActivity(activityId, userId);
                if (!a.ok || !a.data) {
                    setLoadError(a.errors.join(", "));
                    return;
                }
                setCode(a.data.activityCode);
                setStartedAt(a.data.startedAt.slice(0, 16));
                setMinutes(String(a.data.durationMinutes));
                setDistance(a.data.distanceKm != null ? String(a.data.distanceKm) : "");
                setNotes(a.data.notes ?? "");
                setVisibility(a.data.visibility);
            }
            setCatalogue(cat.data);
        };
        load();
    }, [userId, activityId]);

    // A weight saved on this page (the card below) is picked up straight away
    useEffect(() => {
        if (!userId) return;
        const reload = () => getLatestWeight(userId).then((r) => {
            if (r.ok && r.data) { setWeight(r.data); setNeedsWeight(false); }
        });
        window.addEventListener(WEIGHT_SAVED_EVENT, reload);
        return () => window.removeEventListener(WEIGHT_SAVED_EVENT, reload);
    }, [userId]);

    const suggestions = useMemo(() => {
        const recent = userId ? getRecentCodes(userId) : [];
        return [...recent, ...POPULAR_CODES.filter((c) => !recent.includes(c))].slice(0, 8);
    }, [userId]);

    const activity = catalogue?.activities.find((a) => a.code === code);
    const heading = catalogue?.headings.find((h) => h.code === activity?.headingCode);
    const mins = Number(minutes);
    const validMinutes = Number.isInteger(mins) && mins >= 1 && mins <= 1440;
    const estimate =
        activity && weight && validMinutes ? Math.round(activity.met * Number(weight.weightKg) * (mins / 60)) : null;

    const save = async (allowOverlap: boolean) => {
        if (!code) {
            setErrors(["Choose an activity"]);
            return;
        }
        if (!validMinutes) {
            setErrors(["Duration must be between 1 minute and 24 hours"]);
            return;
        }
        const input: ActivityInput = {
            activityCode: code,
            startedAt,
            durationMinutes: mins,
            distanceKm: distance ? Number(distance) : undefined,
            notes: notes.trim() || undefined,
            visibility,
            allowOverlap: allowOverlap || undefined,
        };
        setSaving(true);
        setErrors([]);
        setOverlap("");
        const result = isEdit ? await updateActivity(activityId!, input, userId) : await createActivity(input, userId);
        setSaving(false);

        if (result.ok) {
            rememberRecent(userId, code);
            navigate("/tribe", { state: { flash: isEdit ? "Activity updated" : "Activity logged" } });
            return;
        }
        if (result.code === "OVERLAP") {
            setOverlap(result.errors[0]);
            return;
        }
        if (result.code === "WEIGHT_REQUIRED") {
            setNeedsWeight(true);
            setWeight(null);
        }
        setErrors(result.errors);
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        save(false);
    };

    const handleDelete = async () => {
        setConfirmDelete(false);
        const result = await deleteActivity(activityId!, userId);
        if (!result.ok) {
            setErrors(result.errors);
            return;
        }
        navigate("/tribe", { state: { flash: "Activity deleted" } });
    };

    if (loadError) {
        return (
            <div className="ex-page">
                <p className="ex-errors" role="alert">{loadError}</p>
                <Link to="/tribe" className="ex-btn ex-btn--secondary">Back to Tribe</Link>
            </div>
        );
    }

    if (!catalogue) {
        return (
            <div className="ex-page">
                <FormSkeleton />
            </div>
        );
    }

    return (
        <div className="ex-page">
            <header className="ex-header">
                <div>
                    <Link to="/tribe" className="ex-back"><i className="bx bx-chevron-left" aria-hidden="true"></i>Tribe</Link>
                    <h1 className="ex-title">{isEdit ? "Edit activity" : "Log an activity"}</h1>
                    <p className="ex-subtitle">Calories are estimated from the activity, your weight and the time.</p>
                </div>
            </header>

            <div className="ex-two-col">
                <form className="ex-card" onSubmit={handleSubmit} noValidate>
                    <h2 className="ex-card__title">What did you do?</h2>
                    <ActivityPicker
                        catalogue={catalogue}
                        value={code}
                        onChange={(next) => { setCode(next); setErrors([]); setOverlap(""); }}
                        suggestedCodes={suggestions}
                    />

                    <div style={{ height: "1.25rem" }}></div>

                    <div className="ex-field">
                        <span>How long? <span className="ex-required" aria-hidden="true">*</span></span>
                        <div className="tr-chips" role="group" aria-label="Common durations">
                            {DURATIONS.map((d) => (
                                <button
                                    key={d}
                                    type="button"
                                    className={`tr-chip ${mins === d ? "is-active" : ""}`}
                                    aria-pressed={mins === d}
                                    onClick={() => setMinutes(String(d))}
                                >
                                    {d} min
                                </button>
                            ))}
                        </div>
                        <div className="ex-money" style={{ maxWidth: 200 }}>
                            <input
                                type="number"
                                inputMode="numeric"
                                min="1"
                                max="1440"
                                aria-label="Duration in minutes"
                                value={minutes}
                                onChange={(e) => setMinutes(e.target.value)}
                            />
                            <span>min</span>
                        </div>
                    </div>

                    <label className="ex-field">
                        <span>When did you start? <span className="ex-required" aria-hidden="true">*</span></span>
                        <input
                            type="datetime-local"
                            value={startedAt}
                            max={toLocalDateTime(new Date())}
                            onChange={(e) => setStartedAt(e.target.value)}
                            required
                        />
                    </label>

                    <label className="ex-field">
                        <span>Distance (optional)</span>
                        <div className="ex-money" style={{ maxWidth: 200 }}>
                            <input
                                type="number"
                                inputMode="decimal"
                                step="0.1"
                                min="0"
                                value={distance}
                                onChange={(e) => setDistance(e.target.value)}
                            />
                            <span>km</span>
                        </div>
                    </label>

                    <label className="ex-field">
                        <span>Notes (optional)</span>
                        <textarea maxLength={500} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="e.g. evening practice, two matches" />
                    </label>

                    <label className="ex-field">
                        <span>Who can see it</span>
                        <select value={visibility} onChange={(e) => setVisibility(e.target.value as "TRIBES" | "PRIVATE")}>
                            <option value="TRIBES">Members of my tribes</option>
                            <option value="PRIVATE">Only me</option>
                        </select>
                    </label>

                    {errors.length > 0 && (
                        <ul className="ex-errors" role="alert">
                            {errors.map((err) => <li key={err}>{err}</li>)}
                        </ul>
                    )}

                    {overlap && (
                        <div className="tr-warning" role="alert">
                            <p style={{ margin: "0 0 0.625rem" }}>{overlap}</p>
                            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                                <button type="button" className="ex-btn ex-btn--primary" onClick={() => save(true)} disabled={saving}>
                                    Yes, it's separate
                                </button>
                                <button type="button" className="ex-btn ex-btn--secondary" onClick={() => setOverlap("")}>
                                    Let me fix it
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="ex-form-actions">
                        {isEdit && (
                            <button type="button" className="ex-btn ex-btn--danger" onClick={() => setConfirmDelete(true)}>
                                Delete
                            </button>
                        )}
                        <Link to="/tribe" className="ex-btn ex-btn--secondary">Cancel</Link>
                        <button type="submit" className="ex-btn ex-btn--primary" disabled={saving}>
                            {saving ? "Saving…" : isEdit ? "Save changes" : "Save activity"}
                        </button>
                    </div>
                </form>

                <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                    <section className="ex-card" aria-live="polite">
                        <h2 className="ex-card__title">Estimated calories</h2>
                        {estimate != null && activity && weight ? (
                            <>
                                <p className="tr-weight__now">{estimate.toLocaleString("en-IN")} kcal</p>
                                <p className="tr-calc">
                                    MET {Number(activity.met).toFixed(1)} × {Number(weight.weightKg)} kg × {Math.round((mins / 60) * 100) / 100} h
                                </p>
                                <p className="tr-note">
                                    Uses your weight from {formatDate(weight.recordedOn)} (only you see it). An estimate from
                                    the 2024 Compendium of Physical Activities, not a measurement. Saved values are worked out
                                    by the server.
                                </p>
                                {heading && !heading.countsForGoals && (
                                    <p className="tr-warning" style={{ marginTop: "0.75rem", marginBottom: 0 }}>
                                        {heading.name} activities are saved, but don't count towards tribe goals.
                                    </p>
                                )}
                            </>
                        ) : weight === null ? (
                            <p className="ex-muted">Save your weight to see the estimate.</p>
                        ) : (
                            <p className="ex-muted">Choose an activity and how long it took.</p>
                        )}
                    </section>
                    {(weight === null || needsWeight) && <TodayWeightCard userId={userId} />}
                </div>
            </div>

            <p className="tr-note" style={{ marginTop: "1.25rem" }}>{catalogue.attribution}</p>

            <Dialog
                isOpen={confirmDelete}
                onClose={() => setConfirmDelete(false)}
                Heading="Delete this activity?"
                Description="It will be removed from your totals. This can't be undone from the app."
                SecondaryButton="Cancel"
                PrimaryButton="Delete"
                onPrimary={handleDelete}
            />
        </div>
    );
};

export default LogActivity;
