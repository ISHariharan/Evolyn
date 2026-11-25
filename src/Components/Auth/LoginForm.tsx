import { FormEvent, useState } from "react";
import { PasswordInput, useLogIn } from "./authShared";

interface Props {
    initialEmail?: string;
    notice?: string;               // e.g. "Password changed. Log in with your new password."
    onDone: () => void;
    onForgot: (email: string) => void;
}

const LoginForm = ({ initialEmail = "", notice, onDone, onForgot }: Props) => {
    const logIn = useLogIn();
    const [email, setEmail] = useState(initialEmail);
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [busy, setBusy] = useState(false);

    const submit = async (e: FormEvent) => {
        e.preventDefault();
        if (!email.trim() || !password) {
            setError("Enter your email and password.");
            return;
        }
        setBusy(true);
        setError("");
        const problem = await logIn(email, password);
        setBusy(false);
        if (problem) setError(problem);
        else onDone();
    };

    return (
        <form className="au-form" onSubmit={submit} noValidate>
            {notice && <p className="au-notice" role="status">{notice}</p>}
            <div className="au-field">
                <label htmlFor="au-login-email">Email</label>
                <input id="au-login-email" type="email" autoComplete="username" inputMode="email" autoFocus={!initialEmail}
                       value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="au-field">
                <div className="au-field__row">
                    <label htmlFor="au-login-password">Password</label>
                    <button type="button" className="au-link" onClick={() => onForgot(email)}>Forgot password?</button>
                </div>
                <PasswordInput id="au-login-password" autoComplete="current-password" autoFocus={!!initialEmail}
                               value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            {error && <p className="au-error" role="alert">{error}</p>}
            <button type="submit" className="au-submit" disabled={busy}>{busy ? "Logging in…" : "Log in"}</button>
        </form>
    );
};

export default LoginForm;
