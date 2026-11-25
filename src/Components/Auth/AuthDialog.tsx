import "../../Pages/Account/Account.scss";
import "./Auth.scss";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import logo from "../../Statics/AppLogo_BGRemoved.png";
import ForgotPasswordForm from "./ForgotPasswordForm";
import LoginForm from "./LoginForm";
import SignupForm from "./SignupForm";

export type AuthView = "login" | "signup" | "forgot";

const TITLES: Record<AuthView, { title: string; sub: string }> = {
    login: { title: "Welcome back", sub: "Log in to pick up where you left off." },
    signup: { title: "Create your account", sub: "Free, and takes about a minute." },
    forgot: { title: "Reset your password", sub: "Use the recovery code you saved." },
};

/**
 * Log in, sign up and forgot password in one dialog: a brand panel on the left
 * (hidden on phones) and the form on the right. Esc or the close button closes it.
 */
const AuthDialog = ({ initialView = "login", onClose }: { initialView?: AuthView; onClose: () => void }) => {
    const [view, setView] = useState<AuthView>(initialView);
    const [email, setEmail] = useState("");
    const [notice, setNotice] = useState("");
    const [formKey, setFormKey] = useState(0);
    const box = useRef<HTMLDivElement>(null);

    // Esc closes; the page behind doesn't scroll while it's open
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
        document.addEventListener("keydown", onKey);
        const overflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.removeEventListener("keydown", onKey);
            document.body.style.overflow = overflow;
        };
    }, [onClose]);

    const go = (next: AuthView, opts: { email?: string; notice?: string } = {}) => {
        setEmail(opts.email ?? "");
        setNotice(opts.notice ?? "");
        setView(next);
        setFormKey((k) => k + 1);   // fresh form state for every switch
        box.current?.scrollTo({ top: 0 });
    };

    const { title, sub } = TITLES[view];

    return createPortal(
        <div className="au-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
            <div className="au-dialog" role="dialog" aria-modal="true" aria-labelledby="au-title" ref={box}>
                <aside className="au-brand" aria-hidden="true">
                    <div className="au-brand__logo">
                        <img src={logo} alt="" />
                        <span>Evolyn</span>
                    </div>
                    <p className="au-brand__line">Your money, your workouts and your work, in one place.</p>
                    <ul className="au-brand__list">
                        <li><span className="au-dot au-dot--expenses"></span><b>Expenses</b> See where your money goes, by account and category.</li>
                        <li><span className="au-dot au-dot--tribe"></span><b>Tribe</b> Workouts, streaks and challenges with friends.</li>
                        <li><span className="au-dot au-dot--stride"></span><b>Stride</b> Organise your work in workspaces.</li>
                    </ul>
                </aside>

                <section className="au-main">
                    <button type="button" className="au-close" aria-label="Close" onClick={onClose}>
                        <i className="bx bx-x" aria-hidden="true"></i>
                    </button>

                    {/* Phones: the brand panel is hidden, so a small logo instead */}
                    <div className="au-mobile-logo" aria-hidden="true"><img src={logo} alt="" /><span>Evolyn</span></div>

                    {view === "forgot" ? (
                        <button type="button" className="au-back" onClick={() => go("login", { email })}>
                            <i className="bx bx-chevron-left" aria-hidden="true"></i>Back to log in
                        </button>
                    ) : (
                        <div className="au-tabs" role="tablist" aria-label="Log in or sign up">
                            <button type="button" role="tab" aria-selected={view === "login"} className={view === "login" ? "is-active" : ""}
                                    onClick={() => view !== "login" && go("login")}>Log in</button>
                            <button type="button" role="tab" aria-selected={view === "signup"} className={view === "signup" ? "is-active" : ""}
                                    onClick={() => view !== "signup" && go("signup")}>Sign up</button>
                        </div>
                    )}

                    <h2 className="au-title" id="au-title">{title}</h2>
                    <p className="au-sub">{sub}</p>

                    {view === "login" && (
                        <LoginForm key={formKey} initialEmail={email} notice={notice} onDone={onClose}
                                   onForgot={(e) => go("forgot", { email: e })} />
                    )}
                    {view === "signup" && <SignupForm key={formKey} onDone={onClose} />}
                    {view === "forgot" && (
                        <ForgotPasswordForm key={formKey} initialEmail={email}
                                            onLogIn={(e) => go("login", { email: e, notice: "Password changed. Log in with your new password." })} />
                    )}

                    {view !== "forgot" && (
                        <p className="au-switch">
                            {view === "login" ? "New to Evolyn? " : "Already have an account? "}
                            <button type="button" className="au-link" onClick={() => go(view === "login" ? "signup" : "login")}>
                                {view === "login" ? "Create an account" : "Log in"}
                            </button>
                        </p>
                    )}
                </section>
            </div>
        </div>,
        document.body
    );
};

export default AuthDialog;
