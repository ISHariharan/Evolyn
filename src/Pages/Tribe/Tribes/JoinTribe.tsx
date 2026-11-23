import "../../Expenses/Expenses.scss";
import "./Tribes.scss";
import { useEffect, useState } from "react";
import { useStore } from "../../../Store/GlobalStore/GlobalStore";
import { Link, useNavigate, useParams } from "react-router-dom";
import { joinWithCode, previewInviteCode } from "../../../API/Tribe/Tribes/api";
import { CodePreview } from "../../../API/Tribe/Tribes/types";
import { Bone } from "../../Expenses/Skeletons";
import { tribeInitials } from "./MyTribes";

/**
 * /tribe/join/:code - where an invite link lands: see the tribe, then join.
 * Not behind ProtectedRoute: someone opening the link logged out is asked to
 * log in here, and the code is still in the address bar afterwards.
 */
const JoinTribe = () => {
    const { state } = useStore();
    const loggedIn = Boolean(state.authenticated);
    const { code = "" } = useParams();
    const navigate = useNavigate();
    const [preview, setPreview] = useState<CodePreview | null>(null);
    const [error, setError] = useState("");
    const [joining, setJoining] = useState(false);

    useEffect(() => {
        if (!loggedIn) return;
        previewInviteCode(code).then((r) => {
            if (!r.ok || !r.data) setError(r.errors.join(", "));
            else setPreview(r.data);
        });
    }, [code, loggedIn]);

    const join = async () => {
        setJoining(true);
        const r = await joinWithCode(code);
        setJoining(false);
        if (!r.ok || !r.data) {
            setError(r.errors.join(", "));
            return;
        }
        navigate(`/tribe/tribes/${r.data.tribeId}`, { state: { flash: `You joined ${r.data.name}` } });
    };

    return (
        <div className="ex-page">
            <header className="ex-header">
                <div>
                    <Link to="/tribe/tribes" className="ex-back"><i className="bx bx-chevron-left" aria-hidden="true"></i>My tribes</Link>
                    <h1 className="ex-title">Join a tribe</h1>
                </div>
            </header>
            <section className="ex-card" style={{ maxWidth: 520, display: "flex", flexDirection: "column", gap: "1rem" }}>
                {!loggedIn && (
                    <p className="ex-muted" style={{ margin: 0 }}>
                        You've been invited to a tribe on Evolyn. <strong>Log in</strong> or <strong>sign up</strong> (top right)
                        to see it and join.
                    </p>
                )}
                {loggedIn && !preview && !error && (
                    <div role="status" aria-busy="true"><span className="sr-only">Loading…</span><Bone w="60%" h={20} /></div>
                )}
                {error && (
                    <>
                        <p className="ex-errors" role="alert" style={{ margin: 0 }}>{error}</p>
                        <Link to="/tribe/tribes" className="ex-btn ex-btn--secondary" style={{ alignSelf: "flex-start" }}>Back to My tribes</Link>
                    </>
                )}
                {preview && (
                    <>
                        <div className="tb-card__head">
                            <span className="tb-badge">{tribeInitials(preview.name)}</span>
                            <div>
                                <p className="tb-card__name">{preview.name}</p>
                                <span className="tb-meta">{preview.memberCount} {preview.memberCount === 1 ? "member" : "members"}</span>
                            </div>
                        </div>
                        {preview.description && <p className="ex-muted" style={{ margin: 0 }}>{preview.description}</p>}
                        {preview.alreadyMember ? (
                            <Link to={`/tribe/tribes/${preview.tribeId}`} className="ex-btn ex-btn--primary" style={{ alignSelf: "flex-start" }}>
                                You're already in it: open the tribe
                            </Link>
                        ) : (
                            <>
                                <p className="tb-meta" style={{ margin: 0 }}>
                                    Members will see your name, Profile ID and the activities you share with your tribes. Never your
                                    weight or email.
                                </p>
                                <div className="tb-actions">
                                    <Link to="/tribe/tribes" className="ex-btn ex-btn--secondary">Not now</Link>
                                    <button type="button" className="ex-btn ex-btn--primary" onClick={join} disabled={joining}>
                                        {joining ? "Joining…" : `Join ${preview.name}`}
                                    </button>
                                </div>
                            </>
                        )}
                    </>
                )}
            </section>
        </div>
    );
};

export default JoinTribe;
