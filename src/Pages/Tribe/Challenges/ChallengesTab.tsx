import "./Challenges.scss";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getChallenges } from "../../../API/Tribe/Challenges/api";
import { ChallengeSummary, PHASE_LABEL, TYPE_INFO } from "../../../API/Tribe/Challenges/types";
import { Bone } from "../../Expenses/Skeletons";
import { dateRange, fmtValue, myLine, personName, phaseClass, whenLine } from "./format";

const GROUPS: { title: string; phases: string[] }[] = [
    { title: "Active", phases: ["ACTIVE", "UNDER_REVIEW"] },
    { title: "Upcoming", phases: ["UPCOMING"] },
    { title: "Your drafts", phases: ["DRAFT"] },
    { title: "Finished", phases: ["COMPLETED", "CANCELLED"] },
];

/** Challenges tab on the tribe page: everything grouped by where it is in time. */
const ChallengesTab = ({ tribeId, archived }: { tribeId: string; archived: boolean }) => {
    const [list, setList] = useState<ChallengeSummary[] | null>(null);
    const [error, setError] = useState("");

    useEffect(() => {
        getChallenges(tribeId).then((r) => {
            if (!r.ok || !r.data) setError(r.errors.join(", "));
            else setList(r.data);
        });
    }, [tribeId]);

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.75rem" }}>
                <p className="ex-muted" style={{ margin: 0 }}>Time-boxed contests, separate from the monthly goal. Any member can create one.</p>
                {!archived && (
                    <Link to={`/tribe/tribes/${tribeId}/challenges/new`} className="ex-btn ex-btn--primary">
                        <i className="bx bx-plus" aria-hidden="true"></i>Create a challenge
                    </Link>
                )}
            </div>

            {error && <p className="ex-errors" role="alert" style={{ margin: 0 }}>{error}</p>}
            {!list && !error && (
                <div className="tb-grid" role="status" aria-busy="true">
                    <span className="sr-only">Loading challenges…</span>
                    <div className="ex-card"><Bone w="60%" h={18} /><Bone w="40%" h={12} style={{ marginTop: 10 }} /></div>
                </div>
            )}
            {list && list.length === 0 && (
                <div className="ex-card ex-empty">
                    <i className="bx bx-trophy" aria-hidden="true"></i>
                    <p>No challenges yet. Start one: most calories this weekend, or 5 active days this week.</p>
                </div>
            )}

            {list && GROUPS.map((g) => {
                const items = list.filter((c) => g.phases.includes(c.phase));
                if (items.length === 0) return null;
                return (
                    <section key={g.title}>
                        <h2 className="tb-section-title">{g.title}</h2>
                        <div className="tb-grid">
                            {items.map((c) => (
                                <Link key={c.challengeId} to={`/tribe/challenges/${c.challengeId}`} className="ex-card ch-card">
                                    <div className="ch-tags">
                                        <span className="ch-tag">{TYPE_INFO[c.type].label}</span>
                                        <span className={`ch-tag ${phaseClass(c.phase)}`}>{PHASE_LABEL[c.phase]}</span>
                                        {c.joined && <span className="ch-tag">Joined</span>}
                                    </div>
                                    <p className="ch-card__name">{c.name}</p>
                                    <span className="tb-meta">
                                        {dateRange(c)} · {whenLine(c)} · {c.participantCount} {c.participantCount === 1 ? "person" : "people"}
                                    </span>
                                    {c.type === "COLLECTIVE" && c.target != null && c.phase !== "DRAFT" && c.phase !== "UPCOMING" && (
                                        <>
                                            <div className="gl-track" role="img" aria-label={`${c.totalPercent ?? 0}% of the target`}>
                                                <div className={`gl-fill ${c.completed ? "gl-fill--done" : ""}`} style={{ width: `${Math.min(100, Number(c.totalPercent ?? 0))}%` }}></div>
                                            </div>
                                            <span className="tb-meta">{fmtValue(c.total, "kcal")} of {fmtValue(c.target, "kcal")}</span>
                                        </>
                                    )}
                                    {c.type === "TEAM" && c.teams.length === 2 && c.phase !== "UPCOMING" && c.phase !== "DRAFT" && (
                                        <span className="tb-meta">
                                            Team A {fmtValue(c.teams.find((t) => t.team === "A")!.value, "kcal")} · Team B {fmtValue(c.teams.find((t) => t.team === "B")!.value, "kcal")}
                                        </span>
                                    )}
                                    {c.leader && c.phase !== "UPCOMING" && c.type !== "COLLECTIVE" && c.type !== "TEAM" && Number(c.leader.value) > 0 && (
                                        <span className="tb-meta">Leading: {personName(c.leader)} · {fmtValue(c.leader.value, c.unit)}</span>
                                    )}
                                    {myLine(c) && <span style={{ fontSize: 13, color: "var(--title-color)" }}>{myLine(c)}</span>}
                                </Link>
                            ))}
                        </div>
                    </section>
                );
            })}
        </div>
    );
};

export default ChallengesTab;
