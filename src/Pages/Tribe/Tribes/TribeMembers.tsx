import { FormEvent, useState } from "react";
import {
    cancelInvitation, inviteLinkFor, inviteToTribe, lookupProfile, newInviteLink, removeMember, turnOffInviteLink,
} from "../../../API/Tribe/Tribes/api";
import { ProfileLookup, TribeDetail, TribeMember } from "../../../API/Tribe/Tribes/types";
import Dialog from "../../../Common/DialogBox/DialogBox";
import { formatDate } from "../../Expenses/utils";

const initials = (first?: string, last?: string) => `${(first ?? "").charAt(0)}${(last ?? "").charAt(0)}`.toUpperCase();

interface Props {
    tribe: TribeDetail;
    onChange: (next: TribeDetail) => void;   // the server's updated view of the tribe
}

/**
 * Members tab: invite by Profile ID or with a link, open invitations, and the
 * member list. Every member can do all of this (no roles yet).
 */
const TribeMembers = ({ tribe, onChange }: Props) => {
    const [profileId, setProfileId] = useState("");
    const [found, setFound] = useState<ProfileLookup | null>(null);
    const [errors, setErrors] = useState<string[]>([]);
    const [notice, setNotice] = useState("");
    const [busy, setBusy] = useState(false);
    const [toRemove, setToRemove] = useState<TribeMember | null>(null);
    const readOnly = tribe.archived;

    const act = async (call: () => Promise<{ ok: boolean; data?: TribeDetail; errors: string[] }>, done?: string) => {
        setBusy(true);
        setErrors([]);
        setNotice("");
        const r = await call();
        setBusy(false);
        if (!r.ok || !r.data) {
            setErrors(r.errors);
            return false;
        }
        onChange(r.data);
        if (done) setNotice(done);
        return true;
    };

    // Step 1: check who the Profile ID belongs to, so you invite the right person
    const find = async (e: FormEvent) => {
        e.preventDefault();
        setFound(null);
        setErrors([]);
        setNotice("");
        if (!profileId.trim()) return;
        const r = await lookupProfile(profileId.trim());
        if (!r.ok || !r.data) setErrors(r.errors);
        else setFound(r.data);
    };

    // Step 2: send the invitation
    const sendInvite = async () => {
        if (!found) return;
        const ok = await act(() => inviteToTribe(tribe.tribeId, found.profileId), `Invitation sent to @${found.profileId}`);
        if (ok) {
            setFound(null);
            setProfileId("");
        }
    };

    const copyLink = async () => {
        if (!tribe.joinCode) return;
        try {
            await navigator.clipboard.writeText(inviteLinkFor(tribe.joinCode));
            setNotice("Link copied. Paste it in your WhatsApp group.");
        } catch {
            setNotice("Couldn't copy automatically. Select the link and copy it.");
        }
    };

    return (
        <div className="tr-layout">
            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", minWidth: 0 }}>
                {errors.length > 0 && <p className="ex-errors" role="alert" style={{ margin: 0 }}>{errors.join(", ")}</p>}
                {notice && <p className="tr-success" role="status">{notice}</p>}

                <section className="ex-card" aria-labelledby="tb-members-title">
                    <h2 className="tb-section-title" id="tb-members-title">Members ({tribe.memberCount})</h2>
                    <ul className="tr-activities">
                        {tribe.members.map((m) => (
                            <li key={m.userId} className="tr-activity">
                                <span className="tb-badge" style={{ width: 36, height: 36, borderRadius: "50%", fontSize: 13 }}>
                                    {initials(m.firstName, m.lastName)}
                                </span>
                                <div className="tr-activity__main">
                                    <span className="tr-activity__name">
                                        {m.firstName} {m.lastName} {m.isMe && <span className="tr-tag">You</span>}
                                    </span>
                                    <span className="tr-activity__meta">
                                        {m.profileId ? `@${m.profileId}` : "No Profile ID yet"} · joined {formatDate(m.joinedAt.slice(0, 10))}
                                        {m.isCreator ? " · created the tribe" : ""}
                                    </span>
                                </div>
                                {!m.isMe && !readOnly && (
                                    <button type="button" className="ex-btn ex-btn--secondary" onClick={() => setToRemove(m)}
                                            aria-label={`Remove ${m.firstName} ${m.lastName}`}>
                                        Remove
                                    </button>
                                )}
                            </li>
                        ))}
                    </ul>
                </section>

                {tribe.pendingInvitations.length > 0 && (
                    <section className="ex-card">
                        <h2 className="tb-section-title">Waiting for an answer</h2>
                        <ul className="tr-activities">
                            {tribe.pendingInvitations.map((i) => (
                                <li key={i.invitationId} className="tr-activity">
                                    <div className="tr-activity__main">
                                        <span className="tr-activity__name">{i.firstName} {i.lastName} <span className="tb-meta">@{i.profileId}</span></span>
                                        <span className="tr-activity__meta">
                                            Invited by {i.invitedByFirstName} · expires {formatDate(i.expiresAt.slice(0, 10))}
                                        </span>
                                    </div>
                                    {!readOnly && (
                                        <button type="button" className="ex-btn ex-btn--secondary" disabled={busy}
                                                onClick={() => act(() => cancelInvitation(i.invitationId), "Invitation cancelled")}>
                                            Cancel
                                        </button>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </section>
                )}
            </div>

            {!readOnly && (
                <div className="tr-side">
                    <section className="ex-card">
                        <h2 className="tb-section-title">Invite by Profile ID</h2>
                        <form className="tb-row" onSubmit={find}>
                            <label className="ex-field">
                                <span className="sr-only">Profile ID</span>
                                <div className="pid-input">
                                    <span aria-hidden="true">@</span>
                                    <input type="text" placeholder="arun_k" autoCapitalize="none" autoCorrect="off" spellCheck={false}
                                           value={profileId} onChange={(e) => { setProfileId(e.target.value); setFound(null); }} />
                                </div>
                            </label>
                            <button type="submit" className="ex-btn ex-btn--secondary" disabled={!profileId.trim()}>Find</button>
                        </form>
                        {found && (
                            <div className="tr-picked" style={{ marginTop: "0.75rem" }}>
                                <div className="tr-picked__main">
                                    <span className="tr-picked__name">{found.firstName} {found.lastName}</span>
                                    <span className="tr-picked__meta">@{found.profileId}</span>
                                </div>
                                <button type="button" className="ex-btn ex-btn--primary" onClick={sendInvite} disabled={busy}>
                                    Send invite
                                </button>
                            </div>
                        )}
                        <p className="tr-note" style={{ marginTop: "0.75rem" }}>They'll see it under My tribes and must accept. Invitations last 7 days.</p>
                    </section>

                    <section className="ex-card">
                        <h2 className="tb-section-title">Invite link</h2>
                        {tribe.joinCode ? (
                            <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
                                <input className="ex-input" readOnly value={inviteLinkFor(tribe.joinCode)} aria-label="Invite link"
                                       onFocus={(e) => e.target.select()} />
                                <span className="tb-meta">
                                    Code {tribe.joinCode} · works until {formatDate((tribe.joinCodeExpiresAt ?? "").slice(0, 10))}
                                </span>
                                <div className="tb-actions">
                                    <button type="button" className="ex-btn ex-btn--primary" onClick={copyLink}>Copy link</button>
                                    <button type="button" className="ex-btn ex-btn--secondary" disabled={busy}
                                            onClick={() => act(() => newInviteLink(tribe.tribeId), "New link made; the old one no longer works")}>
                                        New link
                                    </button>
                                    <button type="button" className="ex-btn ex-btn--secondary" disabled={busy}
                                            onClick={() => act(() => turnOffInviteLink(tribe.tribeId), "Invite link turned off")}>
                                        Turn off
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <button type="button" className="ex-btn ex-btn--secondary" disabled={busy}
                                    onClick={() => act(() => newInviteLink(tribe.tribeId), "Invite link ready")}>
                                Create an invite link
                            </button>
                        )}
                        <p className="tr-note" style={{ marginTop: "0.75rem" }}>
                            Anyone with the link who has an Evolyn account can join, for 7 days. Share it only with the group.
                        </p>
                    </section>
                </div>
            )}

            <Dialog
                isOpen={toRemove !== null}
                onClose={() => setToRemove(null)}
                Heading={`Remove ${toRemove?.firstName ?? ""}?`}
                Description="They'll lose access to the tribe. Their activities stay in the history, and you can invite them again later."
                SecondaryButton="Cancel"
                PrimaryButton="Remove"
                onPrimary={() => {
                    const m = toRemove;
                    setToRemove(null);
                    if (m) act(() => removeMember(tribe.tribeId, m.userId), `${m.firstName} was removed`);
                }}
            />
        </div>
    );
};

export default TribeMembers;
