import "../../Expenses/Expenses.scss";
import "../Tribe.scss";
import "./Tribes.scss";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { acceptInvitation, declineInvitation, getMyInvitations, getMyTribes } from "../../../API/Tribe/Tribes/api";
import { MyInvitation, TribeSummary } from "../../../API/Tribe/Tribes/types";
import { Bone } from "../../Expenses/Skeletons";
import { formatDate } from "../../Expenses/utils";

// "Handball Crew" -> "HC"
export const tribeInitials = (name: string) =>
    name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase();

/** /tribe/tribes - your tribes, invitations waiting for you, and joining with a code. */
const MyTribes = () => {
    const navigate = useNavigate();
    const [tribes, setTribes] = useState<TribeSummary[] | null>(null);
    const [invites, setInvites] = useState<MyInvitation[]>([]);
    const [errors, setErrors] = useState<string[]>([]);
    const [busy, setBusy] = useState<string | null>(null); // invitation being answered
    const [code, setCode] = useState("");

    const load = useCallback(() => {
        Promise.all([getMyTribes(), getMyInvitations()]).then(([t, i]) => {
            if (!t.ok || !t.data) {
                setErrors(t.errors);
                return;
            }
            setTribes(t.data);
            setInvites(i.ok && i.data ? i.data : []);
        });
    }, []);

    useEffect(() => { load(); }, [load]);

    const answer = async (inv: MyInvitation, accept: boolean) => {
        setBusy(inv.invitationId);
        setErrors([]);
        const r = accept ? await acceptInvitation(inv.invitationId) : await declineInvitation(inv.invitationId);
        setBusy(null);
        if (!r.ok) {
            setErrors(r.errors);
            load();
            return;
        }
        if (accept) navigate(`/tribe/tribes/${inv.tribeId}`);
        else load();
    };

    const join = (e: FormEvent) => {
        e.preventDefault();
        // Accept a pasted full link as well as just the code
        const c = code.trim().split("/").pop()?.replace(/[^A-Za-z0-9]/g, "") ?? "";
        if (c) navigate(`/tribe/join/${c.toUpperCase()}`);
    };

    return (
        <div className="ex-page">
            <header className="ex-header">
                <div>
                    <h1 className="ex-title">My tribes</h1>
                    <p className="ex-subtitle">Work out with your friends and see what everyone's doing.</p>
                </div>
                <div className="ex-header__actions">
                    <Link to="/tribe/tribes/new" className="ex-btn ex-btn--primary">
                        <i className="bx bx-plus" aria-hidden="true"></i>Create a tribe
                    </Link>
                </div>
            </header>

            {errors.length > 0 && <p className="ex-errors" role="alert">{errors.join(", ")}</p>}

            {invites.length > 0 && (
                <section style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "1.25rem" }}>
                    <h2 className="tb-section-title" style={{ margin: 0 }}>Invitations</h2>
                    {invites.map((inv) => (
                        <div key={inv.invitationId} className="ex-card tb-invite">
                            <div className="tb-card__head">
                                <span className="tb-badge">{tribeInitials(inv.tribeName)}</span>
                                <div>
                                    <p className="tb-card__name">{inv.tribeName}</p>
                                    <span className="tb-meta">
                                        {inv.invitedByFirstName} (@{inv.invitedByProfileId}) invited you ·{" "}
                                        {inv.memberCount} {inv.memberCount === 1 ? "member" : "members"} · expires{" "}
                                        {formatDate(inv.expiresAt.slice(0, 10))}
                                    </span>
                                </div>
                            </div>
                            <div className="tb-actions">
                                <button type="button" className="ex-btn ex-btn--secondary" disabled={busy === inv.invitationId}
                                        onClick={() => answer(inv, false)}>
                                    Decline
                                </button>
                                <button type="button" className="ex-btn ex-btn--primary" disabled={busy === inv.invitationId}
                                        onClick={() => answer(inv, true)}>
                                    Join
                                </button>
                            </div>
                        </div>
                    ))}
                </section>
            )}

            <section style={{ marginBottom: "1.25rem" }}>
                <h2 className="tb-section-title">Your tribes</h2>
                {!tribes && errors.length === 0 && (
                    <div className="tb-grid" role="status" aria-busy="true">
                        <span className="sr-only">Loading tribes…</span>
                        <div className="ex-card"><Bone w="60%" h={18} /><Bone w="40%" h={12} style={{ marginTop: 10 }} /></div>
                        <div className="ex-card"><Bone w="60%" h={18} /><Bone w="40%" h={12} style={{ marginTop: 10 }} /></div>
                    </div>
                )}
                {tribes && (
                    <div className="tb-grid">
                        {tribes.map((t) => (
                            <Link key={t.tribeId} to={`/tribe/tribes/${t.tribeId}`} className="ex-card tb-card">
                                <div className="tb-card__head">
                                    <span className="tb-badge">{tribeInitials(t.name)}</span>
                                    <div style={{ minWidth: 0 }}>
                                        <p className="tb-card__name">{t.name}</p>
                                        <span className="tb-meta">
                                            {t.memberCount} {t.memberCount === 1 ? "member" : "members"} · joined{" "}
                                            {formatDate(t.joinedAt.slice(0, 10))}
                                        </span>
                                    </div>
                                </div>
                                {t.description && <span className="tb-meta">{t.description}</span>}
                            </Link>
                        ))}
                        <Link to="/tribe/tribes/new" className="ex-card tb-card tb-new">
                            <i className="bx bx-plus" aria-hidden="true"></i>
                            <span className="tb-card__name">{tribes.length === 0 ? "Create your first tribe" : "Start another tribe"}</span>
                            <span className="tb-meta">Invite friends with their Profile ID or a link.</span>
                        </Link>
                    </div>
                )}
            </section>

            <form className="ex-card tb-row" onSubmit={join}>
                <label className="ex-field">
                    <span>Have an invite link or code?</span>
                    <input type="text" placeholder="e.g. HB7Q4KM2 or the full link" value={code}
                           onChange={(e) => setCode(e.target.value)} />
                </label>
                <button type="submit" className="ex-btn ex-btn--secondary" disabled={!code.trim()}>Continue</button>
            </form>
        </div>
    );
};

export default MyTribes;
