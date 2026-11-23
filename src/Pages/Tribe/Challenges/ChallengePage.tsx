import "../../Expenses/Expenses.scss";
import "../Tribe.scss";
import "../Tribes/Tribes.scss";
import "./Challenges.scss";
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import Dialog from "../../../Common/DialogBox/DialogBox";
import { challengeAction, getChallenge, joinChallenge } from "../../../API/Tribe/Challenges/api";
import { Challenge, ChallengePhase, PHASE_LABEL, TYPE_INFO } from "../../../API/Tribe/Challenges/types";
import { Bone } from "../../Expenses/Skeletons";
import { dateRange, fmtDate, fmtValue, personName, phaseClass, whenLine } from "./format";

const initials = (first?: string, last?: string) => `${(first ?? "").charAt(0)}${(last ?? "").charAt(0)}`.toUpperCase();

const STEPS: { phase: ChallengePhase; label: string }[] = [
    { phase: "DRAFT", label: "Draft" },
    { phase: "UPCOMING", label: "Upcoming" },
    { phase: "ACTIVE", label: "Active" },
    { phase: "UNDER_REVIEW", label: "Under review" },
    { phase: "COMPLETED", label: "Results" },
];

const timeOf = (localDateTime: string) =>
    new Date(localDateTime).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" });

/** /tribe/challenges/:challengeId - standings, your part, the rules, and what you can do. */
const ChallengePage = () => {
    const { challengeId = "" } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [c, setC] = useState<Challenge | null>(null);
    const [loadError, setLoadError] = useState("");
    const [errors, setErrors] = useState<string[]>([]);
    const [flash, setFlash] = useState<string>((location.state as { flash?: string } | null)?.flash ?? "");
    const [busy, setBusy] = useState(false);
    const [confirmCancel, setConfirmCancel] = useState(false);

    useEffect(() => {
        getChallenge(challengeId).then((r) => {
            if (!r.ok || !r.data) setLoadError(r.errors.join(", "));
            else setC(r.data);
        });
    }, [challengeId]);

    useEffect(() => {
        if (flash) navigate(location.pathname, { replace: true, state: null });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const act = async (call: () => Promise<{ ok: boolean; data?: Challenge; errors: string[] }>, done: string) => {
        setBusy(true);
        setErrors([]);
        setFlash("");
        const r = await call();
        setBusy(false);
        if (!r.ok || !r.data) {
            setErrors(r.errors);
            return;
        }
        setC(r.data);
        setFlash(done);
    };

    if (loadError) {
        return (
            <div className="ex-page">
                <p className="ex-errors" role="alert">{loadError}</p>
                <Link to="/tribe/tribes" className="ex-btn ex-btn--secondary">Back to My tribes</Link>
            </div>
        );
    }
    if (!c) {
        return <div className="ex-page" role="status" aria-busy="true"><span className="sr-only">Loading…</span><Bone w={260} h={28} /></div>;
    }

    const info = TYPE_INFO[c.type];
    const live = c.phase === "ACTIVE" || c.phase === "UNDER_REVIEW";
    const over = c.phase === "COMPLETED";
    const showScores = live || over;
    const nowIndex = STEPS.findIndex((s) => s.phase === c.phase);
    const me = c.me;
    const leader = c.standings[0];
    const above = me && me.rank > 1 ? c.standings.filter((s) => Number(s.value) > Number(me.value)).slice(-1)[0] : null;

    return (
        <div className="ex-page">
            <header className="ex-header">
                <div style={{ minWidth: 0 }}>
                    <Link to={`/tribe/tribes/${c.tribeId}?tab=challenges`} className="ex-back">
                        <i className="bx bx-chevron-left" aria-hidden="true"></i>Challenges
                    </Link>
                    <h1 className="ex-title" style={{ overflowWrap: "anywhere" }}>{c.name}</h1>
                    <div className="ch-tags" style={{ marginTop: 6 }}>
                        <span className="ch-tag">{info.label}</span>
                        <span className={`ch-tag ${phaseClass(c.phase)}`}>{PHASE_LABEL[c.phase]}</span>
                        {c.joined && <span className="ch-tag">{c.myTeam ? `You're on team ${c.myTeam}` : "Joined"}</span>}
                    </div>
                    <p className="ex-subtitle">{dateRange(c)} · {whenLine(c)} · created by {c.createdByName}</p>
                </div>
                <div className="ex-header__actions">
                    {c.canJoin && c.type !== "TEAM" && (
                        <button type="button" className="ex-btn ex-btn--primary" disabled={busy}
                                onClick={() => act(() => joinChallenge(c.challengeId), "You joined. Activities in the dates now count.")}>
                            Join challenge
                        </button>
                    )}
                    {c.canJoin && c.type === "TEAM" && (["A", "B"] as const).map((t) => (
                        <button key={t} type="button" className="ex-btn ex-btn--primary" disabled={busy}
                                onClick={() => act(() => joinChallenge(c.challengeId, t), `You joined team ${t}.`)}>
                            Join team {t}
                        </button>
                    ))}
                    {c.canPublish && (
                        <button type="button" className="ex-btn ex-btn--primary" disabled={busy}
                                onClick={() => act(() => challengeAction(c.challengeId, "publish"), "Published: the tribe can see and join it.")}>
                            Publish
                        </button>
                    )}
                    {(c.canEditRules || c.canEditName) && (
                        <Link to={`/tribe/challenges/${c.challengeId}/edit`} className="ex-btn ex-btn--secondary">Edit</Link>
                    )}
                    {c.canLeave && (
                        <button type="button" className="ex-btn ex-btn--secondary" disabled={busy}
                                onClick={() => act(() => challengeAction(c.challengeId, "leave"), "You left the challenge.")}>
                            Leave
                        </button>
                    )}
                </div>
            </header>

            {flash && <p className="tr-success" role="status" style={{ marginBottom: "1rem" }}>{flash}</p>}
            {errors.length > 0 && <p className="ex-errors" role="alert">{errors.join(", ")}</p>}
            {c.description && <p className="ex-muted" style={{ margin: "0 0 1rem" }}>{c.description}</p>}

            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                <section className="ex-card" aria-label="Stage">
                    {c.phase === "CANCELLED" ? (
                        <p className="ex-muted" style={{ margin: 0 }}>This challenge was cancelled. Nothing was scored.</p>
                    ) : (
                        <ol className="ch-steps">
                            {STEPS.map((s, i) => (
                                <li key={s.phase} className={i < nowIndex ? "is-done" : i === nowIndex ? "is-now" : ""}>
                                    {s.phase === "ACTIVE" && c.phase === "ACTIVE" ? `Active · day ${c.days.elapsed} of ${c.days.total}` : s.label}
                                </li>
                            ))}
                        </ol>
                    )}
                    {live && (
                        <div className="gl-track" style={{ marginTop: "0.75rem" }} role="img" aria-label={`${c.days.elapsed} of ${c.days.total} days done`}>
                            <div className="gl-fill" style={{ width: `${(c.days.elapsed / c.days.total) * 100}%` }}></div>
                        </div>
                    )}
                </section>

                {/* The headline numbers, by type */}
                {showScores && (
                    <section className="ex-card">
                        {c.type === "TEAM" && c.teams.length === 2 ? (
                            <div className="ch-teams">
                                {(["A", "B"] as const).map((t) => {
                                    const team = c.teams.find((x) => x.team === t)!;
                                    return (
                                        <div key={t} className={team.won ? "is-ahead" : ""}>
                                            <span className="tr-stat__label">Team {t} · {team.members} {team.members === 1 ? "person" : "people"}</span>
                                            <strong>{fmtValue(team.value, "kcal")}</strong>
                                            <span className="tb-meta">{team.won ? (over ? "Won" : "Ahead") : team.rank === 1 ? "Level" : ""}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : c.type === "COLLECTIVE" && c.target != null ? (
                            <>
                                <p className="gl-big" style={{ marginTop: 0 }}>{fmtValue(c.total, "kcal")} <span>of {fmtValue(c.target, "kcal")}</span></p>
                                <div className="gl-track" role="img" aria-label={`${c.totalPercent ?? 0}% of the shared target`}>
                                    <div className={`gl-fill ${c.completed ? "gl-fill--done" : ""}`} style={{ width: `${Math.min(100, Number(c.totalPercent ?? 0))}%` }}></div>
                                </div>
                                <p className="tb-meta" style={{ margin: "0.375rem 0 0" }}>
                                    {c.completed ? `Target reached: ${c.totalPercent}%` : `${c.totalPercent ?? 0}% · ${fmtValue(Math.max(0, c.target - c.total), "kcal")} to go`}
                                    {me ? ` · you added ${fmtValue(me.value, "kcal")}` : ""}
                                </p>
                            </>
                        ) : (
                            <div className="ch-kpis">
                                {me ? (
                                    <>
                                        <div><span className="tr-stat__label">{over ? "Your place" : "Your rank"}</span><span className="gl-stat">#{me.rank} <small>of {c.participantCount}</small></span></div>
                                        <div>
                                            <span className="tr-stat__label">Your {c.unit === "days" ? "active days" : "calories"}</span>
                                            <span className="gl-stat">{fmtValue(me.value, c.unit)}</span>
                                            {c.target != null && <span className="tr-note">{me.percent ?? 0}% of {fmtValue(c.target, c.unit)}{me.completed ? " · done" : ""}</span>}
                                        </div>
                                        {above && !over && (
                                            <div><span className="tr-stat__label">To pass {personName(above)}</span>
                                                <span className="gl-stat">{fmtValue(Number(above.value) - Number(me.value) + (c.unit === "days" ? 1 : 1), c.unit)}</span></div>
                                        )}
                                    </>
                                ) : (
                                    <div><span className="tr-stat__label">You</span><span className="gl-stat">Not taking part</span></div>
                                )}
                                {leader && Number(leader.value) > 0 && (
                                    <div><span className="tr-stat__label">{over ? "Winner" : "Leading"}</span>
                                        <span className="gl-stat">{personName(leader)}</span>
                                        <span className="tr-note">{fmtValue(leader.value, c.unit)}</span></div>
                                )}
                            </div>
                        )}
                    </section>
                )}

                <div className="tr-layout">
                    <section className="ex-card">
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: "0.5rem" }}>
                            <h2 className="tb-section-title" style={{ margin: 0 }}>{over ? "Final results" : "Standings"}</h2>
                            <span className="tb-meta">{c.participantCount} {c.participantCount === 1 ? "person" : "people"} · same number = same rank</span>
                        </div>
                        {c.standings.length === 0 ? (
                            <p className="ex-muted" style={{ marginTop: "0.75rem" }}>Nobody has joined yet.</p>
                        ) : (
                            <ol className="gl-board">
                                {c.standings.map((s) => {
                                    const top = Math.max(1, ...c.standings.map((x) => Number(x.value)));
                                    return (
                                        <li key={s.userId} className={s.isMe ? "is-me" : ""}>
                                            <span className="gl-rank">{showScores ? s.rank : "·"}</span>
                                            <span className="tb-badge" style={{ width: 34, height: 34, borderRadius: "50%", fontSize: 12 }}>{initials(s.firstName, s.lastName)}</span>
                                            <div className="gl-board__main">
                                                <div className="gl-board__row">
                                                    <span className="gl-board__name">
                                                        {personName(s)}{s.team ? <span className="tb-meta"> · team {s.team}</span> : null}
                                                    </span>
                                                    <span className="gl-board__value">
                                                        {showScores ? fmtValue(Number(s.value), c.unit) : "joined"}
                                                        {s.completed && showScores ? <span className="ch-done"> · {over && (c.type === "COMPETITIVE" || c.type === "TEAM") ? "won" : "done"}</span> : null}
                                                    </span>
                                                </div>
                                                {showScores && <div className="gl-board__bar" style={{ width: `${(Number(s.value) / top) * 100}%` }}></div>}
                                            </div>
                                        </li>
                                    );
                                })}
                            </ol>
                        )}
                    </section>

                    <section className="ex-card" style={{ alignSelf: "start" }}>
                        <h2 className="tb-section-title">Rules</h2>
                        <p className="ex-muted" style={{ margin: "0 0 0.75rem" }}>{info.scoring}</p>
                        <ul className="tr-list">
                            {c.target != null && <li><span>Target</span>{fmtValue(c.target, c.unit)}{c.type === "INDIVIDUAL_TARGET" ? " each" : ""}</li>}
                            <li><span>Dates</span>{dateRange(c)} ({c.days.total} {c.days.total === 1 ? "day" : "days"})</li>
                            <li><span>Counts</span>{c.headingName ? `Only ${c.headingName}` : "Any type that counts"}, {c.minMinutes}+ min</li>
                            <li><span>Joining</span>Until the end of {fmtDate(c.startDate)}</li>
                            <li><span>Results</span>Frozen 2 days after {fmtDate(c.endDate)}</li>
                        </ul>
                        {c.canCancel && (
                            <button type="button" className="ex-btn ex-btn--danger" style={{ marginTop: "1rem" }} onClick={() => setConfirmCancel(true)}>
                                Cancel challenge
                            </button>
                        )}
                    </section>
                </div>

                {c.joined && c.myActivities.length > 0 && (
                    <section className="ex-card">
                        <h2 className="tb-section-title">Your activities in this challenge</h2>
                        <ul className="tr-activities">
                            {c.myActivities.map((a) => (
                                <li key={a.activityId} className="tr-activity">
                                    <div className="tr-activity__main">
                                        <span className="tr-activity__name">{a.description}</span>
                                        <span className="tr-activity__meta">
                                            {fmtDate(a.activityDate)} · {timeOf(a.startedAt)} · {a.durationMinutes} min
                                            {!a.counted && a.reason ? ` · not counted: ${a.reason}` : ""}
                                        </span>
                                    </div>
                                    <span className="tr-activity__kcal" style={{ color: a.counted ? undefined : "var(--text-color-light)" }}>
                                        {a.counted ? (c.unit === "days" ? "counts" : `+${Math.round(a.kcal ?? 0).toLocaleString("en-IN")}`) : "—"}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </section>
                )}
                {c.joined && live && c.myActivities.length === 0 && (
                    <section className="ex-card ex-empty">
                        <p>Nothing logged in the challenge dates yet.</p>
                        <Link to="/tribe/activities/new" className="ex-btn ex-btn--primary">Log activity</Link>
                    </section>
                )}
            </div>

            <Dialog
                isOpen={confirmCancel}
                onClose={() => setConfirmCancel(false)}
                Heading="Cancel this challenge?"
                Description="It stops for everyone and nothing is scored. This can't be undone."
                SecondaryButton="Keep it"
                PrimaryButton="Cancel challenge"
                onPrimary={() => {
                    setConfirmCancel(false);
                    act(() => challengeAction(c.challengeId, "cancel"), "Challenge cancelled.");
                }}
            />
        </div>
    );
};

export default ChallengePage;
