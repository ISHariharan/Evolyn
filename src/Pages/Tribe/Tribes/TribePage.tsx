import "../../Expenses/Expenses.scss";
import "../Tribe.scss";
import "./Tribes.scss";
import "../../../Components/ProfileId/ProfileId.scss";
import { FormEvent, useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import Dialog from "../../../Common/DialogBox/DialogBox";
import { archiveTribe, getTribe, leaveTribe, updateTribe } from "../../../API/Tribe/Tribes/api";
import { TribeDetail } from "../../../API/Tribe/Tribes/types";
import { Bone } from "../../Expenses/Skeletons";
import { tribeInitials } from "./MyTribes";
import TribeMembers from "./TribeMembers";
import TribeFeed from "./TribeFeed";
import TribeOverviewTab from "./TribeOverviewTab";

type Tab = "overview" | "activity" | "members";

/** /tribe/tribes/:tribeId - one tribe. Members only (the server checks). */
const TribePage = () => {
    const { tribeId = "" } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    // The tab is in the address (?tab=members) so a refresh or shared link keeps it
    const [params, setParams] = useSearchParams();
    const tabParam = params.get("tab");
    const tab: Tab = tabParam === "members" || tabParam === "activity" ? tabParam : "overview";
    const showTab = (t: Tab) => setParams(t === "overview" ? {} : { tab: t }, { replace: true });

    const [tribe, setTribe] = useState<TribeDetail | null>(null);
    const [loadError, setLoadError] = useState("");
    const [flash, setFlash] = useState<string>((location.state as { flash?: string } | null)?.flash ?? "");
    const [editing, setEditing] = useState(false);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [errors, setErrors] = useState<string[]>([]);
    const [confirm, setConfirm] = useState<"leave" | "archive" | null>(null);

    useEffect(() => {
        setTribe(null);
        setLoadError("");
        getTribe(tribeId).then((r) => {
            if (!r.ok || !r.data) setLoadError(r.errors.join(", "));
            else setTribe(r.data);
        });
    }, [tribeId]);

    // Show a message passed from the previous page once, not again on refresh
    useEffect(() => {
        if (flash) navigate(location.pathname + location.search, { replace: true, state: null });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const startEdit = () => {
        if (!tribe) return;
        setName(tribe.name);
        setDescription(tribe.description ?? "");
        setErrors([]);
        setEditing(true);
    };

    const saveEdit = async (e: FormEvent) => {
        e.preventDefault();
        const r = await updateTribe(tribeId, name.trim(), description.trim() || undefined);
        if (!r.ok || !r.data) {
            setErrors(r.errors);
            return;
        }
        setTribe(r.data);
        setEditing(false);
        setFlash("Saved");
    };

    const doConfirmed = async () => {
        const what = confirm;
        setConfirm(null);
        const r = what === "leave" ? await leaveTribe(tribeId) : await archiveTribe(tribeId);
        if (!r.ok) {
            setErrors(r.errors);
            return;
        }
        navigate("/tribe/tribes");
    };

    if (loadError) {
        return (
            <div className="ex-page">
                <p className="ex-errors" role="alert">{loadError}</p>
                <Link to="/tribe/tribes" className="ex-btn ex-btn--secondary">Back to My tribes</Link>
            </div>
        );
    }

    return (
        <div className="ex-page">
            <header className="ex-header">
                <div style={{ minWidth: 0 }}>
                    <Link to="/tribe/tribes" className="ex-back"><i className="bx bx-chevron-left" aria-hidden="true"></i>My tribes</Link>
                    {tribe ? (
                        <div className="tb-card__head" style={{ marginTop: 4 }}>
                            <span className="tb-badge" style={{ width: 52, height: 52, fontSize: 18 }}>{tribeInitials(tribe.name)}</span>
                            <div style={{ minWidth: 0 }}>
                                <h1 className="ex-title" style={{ overflowWrap: "anywhere" }}>{tribe.name}</h1>
                                <p className="ex-subtitle">
                                    {tribe.memberCount} {tribe.memberCount === 1 ? "member" : "members"} · private
                                    {tribe.archived ? " · archived (read-only)" : ""}
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div role="status" aria-busy="true"><span className="sr-only">Loading tribe…</span><Bone w={220} h={28} /></div>
                    )}
                </div>
                <div className="ex-header__actions">
                    <Link to="/tribe/activities/new" className="ex-btn ex-btn--primary">
                        <i className="bx bx-plus" aria-hidden="true"></i>Log activity
                    </Link>
                </div>
            </header>

            {tribe?.description && !editing && <p className="ex-muted" style={{ margin: "0 0 1rem" }}>{tribe.description}</p>}
            {flash && <p className="tr-success" role="status" style={{ marginBottom: "1rem" }}>{flash}.</p>}
            {errors.length > 0 && !editing && <p className="ex-errors" role="alert">{errors.join(", ")}</p>}

            {tribe && (
                <>
                    <div className="ex-tabs" role="tablist" aria-label="Tribe sections">
                        <button type="button" role="tab" aria-selected={tab === "overview"}
                                className={tab === "overview" ? "is-active" : ""} onClick={() => showTab("overview")}>
                            Overview
                        </button>
                        <button type="button" role="tab" aria-selected={tab === "activity"}
                                className={tab === "activity" ? "is-active" : ""} onClick={() => showTab("activity")}>
                            Activity
                        </button>
                        <button type="button" role="tab" aria-selected={tab === "members"}
                                className={tab === "members" ? "is-active" : ""} onClick={() => showTab("members")}>
                            Members ({tribe.memberCount})
                        </button>
                    </div>

                    {tab === "overview" && <TribeOverviewTab tribeId={tribe.tribeId} archived={tribe.archived} />}
                    {tab === "activity" && <TribeFeed tribeId={tribe.tribeId} />}
                    {tab === "members" && <TribeMembers tribe={tribe} onChange={setTribe} />}

                    {tab === "members" && !tribe.archived && (
                        <section className="ex-card" style={{ marginTop: "1.25rem" }}>
                            <h2 className="tb-section-title">Tribe settings</h2>
                            {editing ? (
                                <form onSubmit={saveEdit} noValidate style={{ maxWidth: 560 }}>
                                    <label className="ex-field">
                                        <span>Name</span>
                                        <input type="text" maxLength={60} value={name} onChange={(e) => setName(e.target.value)} />
                                    </label>
                                    <label className="ex-field">
                                        <span>Description (optional)</span>
                                        <textarea maxLength={300} value={description} onChange={(e) => setDescription(e.target.value)} />
                                    </label>
                                    {errors.length > 0 && <p className="ex-errors" role="alert">{errors.join(", ")}</p>}
                                    <div className="ex-form-actions">
                                        <button type="button" className="ex-btn ex-btn--secondary" onClick={() => setEditing(false)}>Cancel</button>
                                        <button type="submit" className="ex-btn ex-btn--primary">Save</button>
                                    </div>
                                </form>
                            ) : (
                                <div className="tb-actions">
                                    <button type="button" className="ex-btn ex-btn--secondary" onClick={startEdit}>Edit name and description</button>
                                    <button type="button" className="ex-btn ex-btn--secondary" onClick={() => setConfirm("leave")}>Leave tribe</button>
                                    <button type="button" className="ex-btn ex-btn--danger" onClick={() => setConfirm("archive")}>Archive tribe</button>
                                </div>
                            )}
                            <p className="tr-note" style={{ marginTop: "0.75rem" }}>Every member can change these settings.</p>
                        </section>
                    )}
                </>
            )}

            <Dialog
                isOpen={confirm !== null}
                onClose={() => setConfirm(null)}
                Heading={confirm === "leave" ? "Leave this tribe?" : "Archive this tribe?"}
                Description={confirm === "leave"
                    ? "You'll stop seeing it. Your activities stay in its history, and you can join again with a new invitation or link."
                    : "It disappears for every member and can't be changed any more. Nothing is deleted."}
                SecondaryButton="Cancel"
                PrimaryButton={confirm === "leave" ? "Leave" : "Archive"}
                onPrimary={doConfirmed}
            />
        </div>
    );
};

export default TribePage;
