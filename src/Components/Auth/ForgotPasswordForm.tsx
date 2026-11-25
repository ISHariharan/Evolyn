import { FormEvent, useState } from "react";
import { resetPassword } from "../../API/Password/api";
import { isStrongPassword } from "../../Common/passwordRules";
import { PasswordChecklist, RecoveryCodeBox } from "../../Pages/Account/AccountParts";
import { PasswordInput } from "./authShared";

interface Props {
    initialEmail?: string;
    onLogIn: (email: string) => void;   // after a reset: go to "Log in" with the email filled in
}

/**
 * Forgot password: email + recovery code + a new password (no email is sent).
 * On success the used code stops working and a new one is shown, once, to save.
 * Used by the login dialog and the /forgot-password page.
 */
const ForgotPasswordForm = ({ initialEmail = "", onLogIn }: Props) => {
    const [email, setEmail] = useState(initialEmail);
    const [code, setCode] = useState("");
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [error, setError] = useState("");
    const [busy, setBusy] = useState(false);
    const [newCode, setNewCode] = useState<string | null>(null);

    const mismatch = !!confirm && password !== confirm;
    const ready = !!email.trim() && !!code.trim() && isStrongPassword(password) && password === confirm;

    const submit = async (e: FormEvent) => {
        e.preventDefault();
        if (!ready) {
            setError("Fill in every field, with a strong new password typed twice.");
            return;
        }
        setBusy(true);
        setError("");
        const r = await resetPassword(email, code, password);
        setBusy(false);
        if (!r.ok || !r.data) {
            setError(r.errors.join(", "));
            return;
        }
        setNewCode(r.data.recoveryCode);
    };

    if (newCode) {
        return (
            <div className="au-form">
                <p className="au-notice" role="status">Password changed. Your old recovery code no longer works; here's your new one.</p>
                <RecoveryCodeBox code={newCode} />
                <button type="button" className="au-submit" onClick={() => onLogIn(email)}>I've saved it, log in</button>
            </div>
        );
    }

    return (
        <form className="au-form" onSubmit={submit} noValidate>
            <div className="au-field">
                <label htmlFor="au-forgot-email">Email</label>
                <input id="au-forgot-email" type="email" autoComplete="username" inputMode="email" autoFocus={!initialEmail}
                       value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="au-field">
                <label htmlFor="au-forgot-code">Recovery code</label>
                <input id="au-forgot-code" type="text" className="au-mono" autoComplete="off" spellCheck={false}
                       autoFocus={!!initialEmail} placeholder="K7QF-9XRM-2HPA-W4TD" value={code}
                       onChange={(e) => setCode(e.target.value)} />
                <p className="au-hint">The code you saved from your Account page. Capitals and dashes don't matter.</p>
            </div>
            <div className="au-field">
                <label htmlFor="au-forgot-password">New password</label>
                <PasswordInput id="au-forgot-password" autoComplete="new-password" value={password}
                               onChange={(e) => setPassword(e.target.value)} />
                {password && <PasswordChecklist password={password} />}
            </div>
            <div className="au-field">
                <label htmlFor="au-forgot-confirm">Confirm new password</label>
                <PasswordInput id="au-forgot-confirm" autoComplete="new-password" value={confirm} aria-invalid={mismatch}
                               onChange={(e) => setConfirm(e.target.value)} />
                {mismatch && <p className="au-hint au-hint--taken">Passwords don't match</p>}
            </div>
            {error && <p className="au-error" role="alert">{error}</p>}
            <button type="submit" className="au-submit" disabled={busy || !ready}>{busy ? "Changing…" : "Change password"}</button>
            <p className="au-fineprint">
                No recovery code? Ask the person who runs Evolyn to reset your password, then make a code on your Account page.
            </p>
        </form>
    );
};

export default ForgotPasswordForm;
