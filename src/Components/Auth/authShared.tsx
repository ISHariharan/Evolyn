import { InputHTMLAttributes, useState } from "react";
import { verifyUserDetails } from "../../API/AuthForm";
import { setToken } from "../../API/auth";
import { useStore } from "../../Store/GlobalStore/GlobalStore";

/** A password input with a show / hide button. */
export const PasswordInput = ({ id, ...props }: InputHTMLAttributes<HTMLInputElement> & { id: string }) => {
    const [shown, setShown] = useState(false);
    return (
        <div className="au-password">
            <input id={id} type={shown ? "text" : "password"} {...props} />
            <button type="button" className="au-password__toggle" onClick={() => setShown((s) => !s)}
                    aria-label={shown ? "Hide password" : "Show password"} aria-controls={id} aria-pressed={shown}>
                <i className={`bx ${shown ? "bx-hide" : "bx-show"}`} aria-hidden="true"></i>
            </button>
        </div>
    );
};

/**
 * Logs in with email + password. On success the API's token is saved and the store
 * knows who you are (same steps as the old form); returns an error message otherwise.
 * Wrong email and wrong password get the same message, so the form doesn't reveal
 * which emails have accounts.
 */
export const useLogIn = () => {
    const { dispatch } = useStore();
    return async (email: string, password: string): Promise<string | null> => {
        const r = await verifyUserDetails({ email: email.trim(), password });
        if (!r.ok || !r.data?.token) {
            if (r.status === 404 || r.status === 401) return "That email and password don't match.";
            const d = r.data ?? {};
            return d.message ?? (Array.isArray(d.errors) ? d.errors.join(", ") : null) ?? "Couldn't log in. Try again in a moment.";
        }
        setToken(r.data.token);
        // Start from a clean slate, then remember who's logged in
        dispatch({ type: "SET_WORKSPACE", payload: {} });
        dispatch({ type: "TOGGLE_SIDEBAR", payload: false });
        dispatch({ type: "SET_USERDETAILS", payload: r.data.user });
        dispatch({ type: "SET_AUTHENTICATED", payload: "true" });
        return null;
    };
};

/** Turns the API's error body ({ error } or { message, errors }) into one line. */
export const errorText = (data: any, fallback: string) =>
    data?.error ?? (Array.isArray(data?.errors) && data.errors.length ? data.errors.join(", ") : data?.message) ?? fallback;
