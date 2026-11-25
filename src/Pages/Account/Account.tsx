import "../Expenses/Expenses.scss";
import "./Account.scss";
import { FormEvent, useEffect, useState } from "react";
import { changePassword, createRecoveryCode, getRecoveryStatus, RecoveryStatus } from "../../API/Password/api";
import { isStrongPassword } from "../../Common/passwordRules";
import { formatDateTime } from "../Expenses/utils";
import { Bone } from "../Expenses/Skeletons";
import { PasswordChecklist, RecoveryCodeBox } from "./AccountParts";

export const RECOVERY_CODE_EVENT = "evolyn:recovery-code-made";

/** Make (or replace) your recovery code. Needs your current password; the code is shown once. */
const RecoveryCodeCard = () => {
    const [status, setStatus] = useState<RecoveryStatus | null | undefined>(undefined);
    const [asking, setAsking] = useState(false);
    const [current, setCurrent] = useState("");
    const [errors, setErrors] = useState<string[]>([]);
    const [saving, setSaving] = useState(false);
    const [code, setCode] = useState<string | null>(null);

    useEffect(() => {
        getRecoveryStatus().then((r) => setStatus(r.ok && r.data ? r.data : null));
    }, []);

    const make = async (e: FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setErrors([]);
        const r = await createRecoveryCode(current);
        setSaving(false);
        if (!r.ok || !r.data) {
            setErrors(r.errors);
            return;
        }
        setCode(r.data.recoveryCode);
        setCurrent("");
        setAsking(false);
        setStatus({ hasCode: true, createdAt: new Date().toISOString() });
        window.dispatchEvent(new Event(RECOVERY_CODE_EVENT));
    };

    return (
        <section className="ex-card ac-card" aria-labelledby="ac-code-title">
            <h2 className="ex-card__title" id="ac-code-title" style={{ margin: 0 }}>Recovery code</h2>
            <p className="ex-muted" style={{ margin: 0 }}>
                If you forget your password, "Forgot password" asks for your email and this code. Evolyn can't email you,
                so without a code you'd need the app owner's help.
            </p>
            {status === undefined ? <Bone w="50%" h={14} />
            : status === null ? <p className="ex-errors" style={{ margin: 0 }}>Couldn't check your recovery code.</p>
            : !code && (
                <p className={status.hasCode ? "tr-success" : "ac-warn"} style={{ margin: 0 }}>
                    {status.hasCode
                        ? `You have a recovery code (made ${formatDateTime(status.createdAt!)}).`
                        : "You don't have a recovery code yet."}
                </p>
            )}

            {code && <RecoveryCodeBox code={code} />}

            {asking ? (
                <form onSubmit={make} className="ac-inline" noValidate>
                    <label className="ex-field" style={{ marginBottom: 0 }}>
                        <span>Your current password</span>
                        <input type="password" autoComplete="current-password" value={current} autoFocus
                               onChange={(e) => setCurrent(e.target.value)} />
                    </label>
                    {status?.hasCode && <p className="tr-note" style={{ margin: 0 }}>Your old code will stop working.</p>}
                    {errors.length > 0 && <p className="ex-errors" role="alert" style={{ margin: 0 }}>{errors.join(", ")}</p>}
                    <div className="ex-form-actions" style={{ marginTop: 0 }}>
                        <button type="button" className="ex-btn ex-btn--secondary" onClick={() => { setAsking(false); setErrors([]); }}>Cancel</button>
                        <button type="submit" className="ex-btn ex-btn--primary" disabled={saving || !current}>
                            {saving ? "Making…" : "Show my new code"}
                        </button>
                    </div>
                </form>
            ) : status && (
                <button type="button" className={`ex-btn ${status.hasCode ? "ex-btn--secondary" : "ex-btn--primary"}`}
                        style={{ alignSelf: "flex-start" }} onClick={() => { setAsking(true); setCode(null); }}>
                    {status.hasCode ? "Make a new code" : "Make my recovery code"}
                </button>
            )}
        </section>
    );
};

/** Change your password: current one, then the new one twice. */
const ChangePasswordCard = () => {
    const [current, setCurrent] = useState("");
    const [next, setNext] = useState("");
    const [confirm, setConfirm] = useState("");
    const [errors, setErrors] = useState<string[]>([]);
    const [saving, setSaving] = useState(false);
    const [done, setDone] = useState(false);

    const mismatch = !!confirm && next !== confirm;
    const ready = !!current && isStrongPassword(next) && next === confirm;

    const submit = async (e: FormEvent) => {
        e.preventDefault();
        if (!ready) return;
        setSaving(true);
        setErrors([]);
        setDone(false);
        const r = await changePassword(current, next);
        setSaving(false);
        if (!r.ok) {
            setErrors(r.errors);
            return;
        }
        setDone(true);
        setCurrent("");
        setNext("");
        setConfirm("");
    };

    return (
        <form className="ex-card ac-card" onSubmit={submit} noValidate aria-labelledby="ac-pw-title">
            <h2 className="ex-card__title" id="ac-pw-title" style={{ margin: 0 }}>Change password</h2>
            <label className="ex-field">
                <span>Current password</span>
                <input type="password" autoComplete="current-password" value={current} onChange={(e) => setCurrent(e.target.value)} />
            </label>
            <label className="ex-field">
                <span>New password</span>
                <input type="password" autoComplete="new-password" value={next} onChange={(e) => setNext(e.target.value)} />
            </label>
            {next && <PasswordChecklist password={next} />}
            <label className="ex-field">
                <span>Confirm new password</span>
                <input type="password" autoComplete="new-password" value={confirm} aria-invalid={mismatch}
                       onChange={(e) => setConfirm(e.target.value)} />
            </label>
            {mismatch && <p className="ex-errors" style={{ margin: 0 }}>Passwords don't match</p>}
            {errors.length > 0 && <p className="ex-errors" role="alert" style={{ margin: 0 }}>{errors.join(", ")}</p>}
            {done && <p className="tr-success" role="status" style={{ margin: 0 }}>Password changed. Use it next time you log in.</p>}
            <div className="ex-form-actions" style={{ marginTop: 0 }}>
                <button type="submit" className="ex-btn ex-btn--primary" disabled={saving || !ready}>
                    {saving ? "Changing…" : "Change password"}
                </button>
            </div>
        </form>
    );
};

const Account = () => (
    <div className="ex-page ac-page">
        <header className="ex-header">
            <div>
                <h1 className="ex-title">Account</h1>
                <p className="ex-subtitle">Your password and recovery code.</p>
            </div>
        </header>
        <div className="ac-grid">
            <RecoveryCodeCard />
            <ChangePasswordCard />
        </div>
    </div>
);

export default Account;
