import "../Expenses/Expenses.scss";
import "./Account.scss";
import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { openLogin, resetPassword } from "../../API/Password/api";
import { isStrongPassword } from "../../Common/passwordRules";
import { PasswordChecklist, RecoveryCodeBox } from "./AccountParts";

/**
 * Forgot password: email + recovery code + a new password. No login needed.
 * On success the used code stops working and a new one is shown, once, to save.
 */
const ForgotPassword = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [code, setCode] = useState("");
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [errors, setErrors] = useState<string[]>([]);
    const [saving, setSaving] = useState(false);
    const [newCode, setNewCode] = useState<string | null>(null);

    const mismatch = !!confirm && password !== confirm;
    const ready = !!email.trim() && !!code.trim() && isStrongPassword(password) && password === confirm;

    const submit = async (e: FormEvent) => {
        e.preventDefault();
        if (!ready) {
            setErrors(["Fill in every field, with a strong new password typed twice"]);
            return;
        }
        setSaving(true);
        setErrors([]);
        const r = await resetPassword(email, code, password);
        setSaving(false);
        if (!r.ok || !r.data) {
            setErrors(r.errors);
            return;
        }
        setNewCode(r.data.recoveryCode);
        setPassword("");
        setConfirm("");
        setCode("");
    };

    if (newCode) {
        return (
            <div className="ex-page ac-page">
                <header className="ex-header">
                    <div>
                        <h1 className="ex-title">Password changed</h1>
                        <p className="ex-subtitle">Log in with your new password.</p>
                    </div>
                </header>
                <section className="ex-card ac-card">
                    <p style={{ margin: 0 }}>Your old recovery code no longer works. Here's your new one:</p>
                    <RecoveryCodeBox code={newCode} />
                    <button type="button" className="ex-btn ex-btn--primary" style={{ alignSelf: "flex-start" }} onClick={() => { navigate("/"); openLogin(); }}>
                        I've saved it, log in
                    </button>
                </section>
            </div>
        );
    }

    return (
        <div className="ex-page ac-page">
            <header className="ex-header">
                <div>
                    <h1 className="ex-title">Forgot your password?</h1>
                    <p className="ex-subtitle">Use the recovery code you saved to choose a new password.</p>
                </div>
            </header>

            <form className="ex-card ac-card" onSubmit={submit} noValidate>
                <label className="ex-field">
                    <span>Email</span>
                    <input type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} />
                </label>
                <label className="ex-field">
                    <span>Recovery code</span>
                    <input type="text" autoComplete="off" spellCheck={false} placeholder="e.g. K7QF-9XRM-2HPA-W4TD"
                           className="ac-mono" value={code} onChange={(e) => setCode(e.target.value)} />
                </label>
                <label className="ex-field">
                    <span>New password</span>
                    <input type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} />
                </label>
                {password && <PasswordChecklist password={password} />}
                <label className="ex-field">
                    <span>Confirm new password</span>
                    <input type="password" autoComplete="new-password" value={confirm} aria-invalid={mismatch}
                           onChange={(e) => setConfirm(e.target.value)} />
                </label>
                {mismatch && <p className="ex-errors" style={{ margin: 0 }}>Passwords don't match</p>}
                {errors.length > 0 && <p className="ex-errors" role="alert" style={{ margin: 0 }}>{errors.join(", ")}</p>}
                <div className="ex-form-actions" style={{ marginTop: 0 }}>
                    <button type="submit" className="ex-btn ex-btn--primary" disabled={saving || !ready}>
                        {saving ? "Changing…" : "Change password"}
                    </button>
                </div>
            </form>

            <section className="ex-card ac-card ac-help">
                <h2 className="ex-card__title" style={{ margin: 0 }}>No recovery code?</h2>
                <p className="ex-muted" style={{ margin: 0 }}>
                    Recovery codes are made from your Account page while you're logged in. If you never made one, ask the
                    person who runs Evolyn to reset your password for you.
                </p>
            </section>
        </div>
    );
};

export default ForgotPassword;
