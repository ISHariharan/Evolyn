import { useState } from "react";
import { PASSWORD_RULES } from "../../Common/passwordRules";

/** Live checklist of the password rules under a "new password" field. */
export const PasswordChecklist = ({ password }: { password: string }) => (
    <ul className="ac-rules" aria-label="Password rules">
        {PASSWORD_RULES.map((r) => {
            const ok = r.test(password);
            return (
                <li key={r.label} className={ok ? "is-ok" : ""}>
                    <i className={`bx ${ok ? "bx-check" : "bx-x"}`} aria-hidden="true"></i>
                    {r.label}
                    <span className="sr-only">{ok ? " (done)" : " (missing)"}</span>
                </li>
            );
        })}
    </ul>
);

/** A just-made recovery code: shown once, with a copy button. */
export const RecoveryCodeBox = ({ code }: { code: string }) => {
    const [copied, setCopied] = useState(false);
    const copy = async () => {
        try {
            await navigator.clipboard.writeText(code);
            setCopied(true);
        } catch {
            setCopied(false);
        }
    };
    return (
        <div className="ac-code" role="status">
            <span className="ac-code__label">Your recovery code</span>
            <span className="ac-code__value">{code}</span>
            <div className="ac-code__row">
                <button type="button" className="ex-btn ex-btn--secondary" onClick={copy}>
                    <i className={`bx ${copied ? "bx-check" : "bx-copy"}`} aria-hidden="true"></i>{copied ? "Copied" : "Copy"}
                </button>
                <span className="tr-note" style={{ margin: 0 }}>
                    Save it somewhere safe (a notes app or password manager). It's shown only now, and it's the only
                    way to reset your password if you forget it.
                </span>
            </div>
        </div>
    );
};
