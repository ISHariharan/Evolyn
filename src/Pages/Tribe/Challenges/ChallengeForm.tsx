import "../../Expenses/Expenses.scss";
import "../Tribe.scss";
import "../Tribes/Tribes.scss";
import "./Challenges.scss";
import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { createChallenge, getChallenge, updateChallenge } from "../../../API/Tribe/Challenges/api";
import { ChallengeInput, ChallengeType, TYPE_INFO } from "../../../API/Tribe/Challenges/types";
import { getCatalogue } from "../../../API/Tribe/Activities/catalogue";
import { CatalogueHeading } from "../../../API/Tribe/Activities/catalogueTypes";
import { toLocalIsoDate, todayLocal } from "../../Expenses/utils";
import { FormSkeleton } from "../../Expenses/Skeletons";

const TYPES = Object.keys(TYPE_INFO) as ChallengeType[];

const plusDays = (iso: string, n: number) => {
    const d = new Date(`${iso}T00:00:00`);
    d.setDate(d.getDate() + n);
    return toLocalIsoDate(d);
};

const dayCount = (start: string, end: string) =>
    start && end ? Math.round((new Date(`${end}T00:00:00`).getTime() - new Date(`${start}T00:00:00`).getTime()) / 86_400_000) + 1 : 0;

/**
 * One component for both screens:
 *   /tribe/tribes/:tribeId/challenges/new     create (save as draft, or publish)
 *   /tribe/challenges/:challengeId/edit       edit; once it has started only the name and description
 */
const ChallengeForm = () => {
    const { tribeId: tribeParam, challengeId } = useParams();
    const isEdit = Boolean(challengeId);
    const navigate = useNavigate();

    const [tribeId, setTribeId] = useState(tribeParam ?? "");
    const [loaded, setLoaded] = useState(!isEdit);
    const [rulesLocked, setRulesLocked] = useState(false);
    const [headings, setHeadings] = useState<CatalogueHeading[]>([]);

    const [type, setType] = useState<ChallengeType>("COMPETITIVE");
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [startDate, setStartDate] = useState(todayLocal());
    const [endDate, setEndDate] = useState(plusDays(todayLocal(), 6));
    const [target, setTarget] = useState("");
    const [minMinutes, setMinMinutes] = useState("20");
    const [headingCode, setHeadingCode] = useState("");

    const [errors, setErrors] = useState<string[]>([]);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        getCatalogue().then((r) => r.ok && r.data && setHeadings(r.data.headings.filter((h) => h.countsForGoals)));
        if (!challengeId) return;
        getChallenge(challengeId).then((r) => {
            if (!r.ok || !r.data) {
                setErrors(r.errors);
                setLoaded(true);
                return;
            }
            const c = r.data;
            setTribeId(c.tribeId);
            setType(c.type);
            setName(c.name);
            setDescription(c.description ?? "");
            setStartDate(c.startDate);
            setEndDate(c.endDate);
            setTarget(c.target != null ? String(c.target) : "");
            setMinMinutes(String(c.minMinutes));
            setHeadingCode(c.headingCode ?? "");
            setRulesLocked(!c.canEditRules);
            setLoaded(true);
        });
    }, [challengeId]);

    const needsTarget = type === "COLLECTIVE" || type === "INDIVIDUAL_TARGET" || type === "CONSISTENCY";
    const days = dayCount(startDate, endDate);

    const submit = async (publish: boolean) => {
        const input: ChallengeInput = {
            name: name.trim(),
            description: description.trim() || undefined,
            type,
            startDate,
            endDate,
            target: needsTarget && target ? Number(target) : undefined,
            minMinutes: Number(minMinutes) || 20,
            headingCode: headingCode || undefined,
            publish: isEdit ? undefined : publish,
        };
        setSaving(true);
        setErrors([]);
        const r = isEdit ? await updateChallenge(challengeId!, input) : await createChallenge(tribeId, input);
        setSaving(false);
        if (!r.ok || !r.data) {
            setErrors(r.errors);
            return;
        }
        navigate(`/tribe/challenges/${r.data.challengeId}`, {
            state: { flash: isEdit ? "Saved" : publish ? "Challenge published. Join it to take part." : "Saved as a draft" },
        });
    };

    const onSubmit = (e: FormEvent) => {
        e.preventDefault();
        submit(true);
    };

    if (!loaded) return <div className="ex-page"><FormSkeleton /></div>;

    const backTo = isEdit ? `/tribe/challenges/${challengeId}` : `/tribe/tribes/${tribeId}?tab=challenges`;

    return (
        <div className="ex-page">
            <header className="ex-header">
                <div>
                    <Link to={backTo} className="ex-back"><i className="bx bx-chevron-left" aria-hidden="true"></i>{isEdit ? "Challenge" : "Challenges"}</Link>
                    <h1 className="ex-title">{isEdit ? "Edit challenge" : "Create a challenge"}</h1>
                    <p className="ex-subtitle">
                        {rulesLocked
                            ? "It has started, so only the name and description can change. The rules stay as everyone agreed."
                            : "The rules are fixed once it starts, so everyone plays by the same ones."}
                    </p>
                </div>
            </header>

            <form className="tr-layout" onSubmit={onSubmit} noValidate>
                <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", minWidth: 0 }}>
                    <section className="ex-card">
                        <h2 className="tb-section-title">Type</h2>
                        <div className="ch-types" role="group" aria-label="Challenge type">
                            {TYPES.map((t) => (
                                <button key={t} type="button" className={`ch-type ${type === t ? "is-active" : ""}`}
                                        aria-pressed={type === t} disabled={rulesLocked} onClick={() => setType(t)}>
                                    <strong>{TYPE_INFO[t].label}</strong>
                                    <span>{TYPE_INFO[t].short}</span>
                                </button>
                            ))}
                        </div>
                    </section>

                    <section className="ex-card">
                        <h2 className="tb-section-title">Details</h2>
                        <label className="ex-field">
                            <span>Name <span className="ex-required" aria-hidden="true">*</span></span>
                            <input type="text" maxLength={80} placeholder="e.g. November Grind" value={name} onChange={(e) => setName(e.target.value)} />
                        </label>
                        <label className="ex-field">
                            <span>Description (optional)</span>
                            <textarea maxLength={500} placeholder="What it's about, in a line or two" value={description}
                                      onChange={(e) => setDescription(e.target.value)} />
                        </label>
                        <div className="tb-row">
                            <label className="ex-field">
                                <span>Starts</span>
                                <input type="date" min={todayLocal()} value={startDate} disabled={rulesLocked}
                                       onChange={(e) => setStartDate(e.target.value)} />
                            </label>
                            <label className="ex-field">
                                <span>Ends</span>
                                <input type="date" min={startDate} value={endDate} disabled={rulesLocked}
                                       onChange={(e) => setEndDate(e.target.value)} />
                            </label>
                        </div>
                        <p className="tr-note" style={{ marginTop: "0.5rem" }}>{days > 0 ? `${days} ${days === 1 ? "day" : "days"}, India time, both days included. At most 90.` : ""}</p>
                    </section>

                    <section className="ex-card">
                        <h2 className="tb-section-title">Rules</h2>
                        {needsTarget && (
                            <label className="ex-field">
                                <span>
                                    {type === "COLLECTIVE" ? "Shared target" : type === "INDIVIDUAL_TARGET" ? "Target for each person" : "Active days needed"}
                                    <span className="ex-required" aria-hidden="true"> *</span>
                                </span>
                                <div className="ex-money" style={{ maxWidth: 260 }}>
                                    <input type="number" min="1" max={type === "CONSISTENCY" ? days : undefined} value={target}
                                           disabled={rulesLocked} onChange={(e) => setTarget(e.target.value)}
                                           placeholder={type === "CONSISTENCY" ? String(Math.min(5, Math.max(1, days))) : "e.g. 5000"} />
                                    <span>{type === "CONSISTENCY" ? `of ${days} days` : "kcal"}</span>
                                </div>
                            </label>
                        )}
                        <div className="tb-row">
                            <label className="ex-field">
                                <span>An activity counts if it's at least</span>
                                <div className="ex-money">
                                    <input type="number" min="1" max="240" value={minMinutes} disabled={rulesLocked}
                                           onChange={(e) => setMinMinutes(e.target.value)} />
                                    <span>min</span>
                                </div>
                            </label>
                            <label className="ex-field">
                                <span>Activities that count</span>
                                <select value={headingCode} disabled={rulesLocked} onChange={(e) => setHeadingCode(e.target.value)}>
                                    <option value="">Any type that counts for goals</option>
                                    {headings.map((h) => <option key={h.code} value={h.code}>Only {h.name}</option>)}
                                </select>
                            </label>
                        </div>
                        <p className="tr-note" style={{ marginTop: "0.5rem" }}>
                            Join before it starts or on the first day. Activities marked "Only me" count too. The day after it ends
                            is for late logging; then the results are frozen.
                        </p>
                    </section>

                    {errors.length > 0 && <ul className="ex-errors" role="alert" style={{ margin: 0 }}>{errors.map((e) => <li key={e}>{e}</li>)}</ul>}

                    <div className="ex-form-actions" style={{ marginTop: 0 }}>
                        <Link to={backTo} className="ex-btn ex-btn--secondary">Cancel</Link>
                        {isEdit ? (
                            <button type="submit" className="ex-btn ex-btn--primary" disabled={saving}>{saving ? "Saving…" : "Save"}</button>
                        ) : (
                            <>
                                <button type="button" className="ex-btn ex-btn--secondary" disabled={saving} onClick={() => submit(false)}>Save as draft</button>
                                <button type="submit" className="ex-btn ex-btn--primary" disabled={saving}>{saving ? "Publishing…" : "Publish to tribe"}</button>
                            </>
                        )}
                    </div>
                </div>

                <aside className="ex-card" style={{ alignSelf: "start", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    <span className="tr-note">How it's scored</span>
                    <p className="tb-card__name" style={{ margin: 0 }}>{TYPE_INFO[type].label}</p>
                    <p className="ex-muted" style={{ margin: 0 }}>{TYPE_INFO[type].scoring}</p>
                    <ul className="tr-list" style={{ marginTop: "0.5rem" }}>
                        <li><span>Counts</span>{headingCode ? `Only ${headings.find((h) => h.code === headingCode)?.name ?? ""}` : "Any type that counts"}, {minMinutes || 20}+ min</li>
                        <li><span>Joining</span>Until the end of the first day</li>
                        <li><span>Ties</span>Shared rank</li>
                        <li><span>Monthly goal</span>Activities count there too</li>
                    </ul>
                </aside>
            </form>
        </div>
    );
};

export default ChallengeForm;
