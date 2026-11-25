import { FormEvent, useState } from "react";
import { userDetails as storeUserDetails } from "../../API/AuthForm";
import { generateUUID } from "../../Common/UUIDGenerator/UUIDGenerator";
import { isStrongPassword } from "../../Common/passwordRules";
import { PasswordChecklist } from "../../Pages/Account/AccountParts";
import { suggestProfileId, useProfileIdCheck } from "../ProfileId/useProfileIdCheck";
import { errorText, PasswordInput, useLogIn } from "./authShared";

/**
 * Create an account: name, Profile ID (checked live), email and a strong password.
 * Logs you straight in afterwards, so there's no second form to fill.
 */
const SignupForm = ({ onDone }: { onDone: () => void }) => {
    const logIn = useLogIn();
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [profileId, setProfileId] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [error, setError] = useState("");
    const [busy, setBusy] = useState(false);
    const pid = useProfileIdCheck(profileId);
    const suggestion = suggestProfileId(firstName, lastName);

    const mismatch = !!confirm && password !== confirm;
    const ready = !!firstName.trim() && !!lastName.trim() && !!email.trim() && pid.status === "available"
        && isStrongPassword(password) && password === confirm;

    const submit = async (e: FormEvent) => {
        e.preventDefault();
        if (!ready) {
            setError("Fill in every field. Your Profile ID must be available and your password strong.");
            return;
        }
        setBusy(true);
        setError("");
        const r = await storeUserDetails({
            uuid: generateUUID(), firstName: firstName.trim(), lastName: lastName.trim(),
            email: email.trim(), password, profileId: pid.value,
        });
        if (!r.ok) {
            setBusy(false);
            setError(errorText(r.data, "Couldn't create your account. Try again in a moment."));
            return;
        }
        const problem = await logIn(email, password);
        setBusy(false);
        if (problem) setError(`Account created, but logging in failed: ${problem}`);
        else onDone();
    };

    return (
        <form className="au-form" onSubmit={submit} noValidate>
            <div className="au-row">
                <div className="au-field">
                    <label htmlFor="au-first">First name</label>
                    <input id="au-first" type="text" autoComplete="given-name" autoFocus value={firstName}
                           onChange={(e) => setFirstName(e.target.value)} />
                </div>
                <div className="au-field">
                    <label htmlFor="au-last">Last name</label>
                    <input id="au-last" type="text" autoComplete="family-name" value={lastName}
                           onChange={(e) => setLastName(e.target.value)} />
                </div>
            </div>

            <div className="au-field">
                <label htmlFor="au-pid">Profile ID</label>
                <div className="au-prefix">
                    <span aria-hidden="true">@</span>
                    <input id="au-pid" type="text" autoCapitalize="none" autoCorrect="off" spellCheck={false} maxLength={21}
                           placeholder={suggestion || "arun_k"} value={profileId} aria-describedby="au-pid-status"
                           onChange={(e) => setProfileId(e.target.value)} />
                </div>
                <p id="au-pid-status" className={`au-hint au-hint--${pid.status}`} aria-live="polite">
                    {pid.message || "Friends find and invite you by this. Letters, numbers and _"}
                    {!profileId && suggestion && (
                        <> · <button type="button" className="au-link" onClick={() => setProfileId(suggestion)}>Use @{suggestion}</button></>
                    )}
                </p>
            </div>

            <div className="au-field">
                <label htmlFor="au-signup-email">Email</label>
                <input id="au-signup-email" type="email" autoComplete="email" inputMode="email" value={email}
                       onChange={(e) => setEmail(e.target.value)} />
            </div>

            <div className="au-field">
                <label htmlFor="au-signup-password">Password</label>
                <PasswordInput id="au-signup-password" autoComplete="new-password" value={password}
                               onChange={(e) => setPassword(e.target.value)} />
                {password && <PasswordChecklist password={password} />}
            </div>

            <div className="au-field">
                <label htmlFor="au-signup-confirm">Confirm password</label>
                <PasswordInput id="au-signup-confirm" autoComplete="new-password" value={confirm} aria-invalid={mismatch}
                               onChange={(e) => setConfirm(e.target.value)} />
                {mismatch && <p className="au-hint au-hint--taken">Passwords don't match</p>}
            </div>

            {error && <p className="au-error" role="alert">{error}</p>}
            <button type="submit" className="au-submit" disabled={busy || !ready}>{busy ? "Creating your account…" : "Create account"}</button>
            <p className="au-fineprint">After signing up, make a recovery code on your Account page: it's how you reset a forgotten password.</p>
        </form>
    );
};

export default SignupForm;
