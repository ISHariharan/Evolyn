import "../../Common/DialogBox/DialogBox.scss";
import "../../Pages/Expenses/Expenses.scss";
import "./ProfileId.scss";
import { FormEvent, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useStore } from "../../Store/GlobalStore/GlobalStore";
import { setMyProfileId } from "../../API/Profile/api";
import { suggestProfileId, useProfileIdCheck } from "./useProfileIdCheck";

/**
 * Accounts made before Profile IDs existed get this once, right after logging
 * in: friends will find and invite them by it, so it can't be skipped.
 * It waits until the server has said the account has none (profileId === "").
 */
const ProfileIdPrompt = () => {
    const { state, dispatch } = useStore();
    const user = state.userDetails ?? {};
    const needsOne = state.authenticated && user.id && user.profileId === "";

    const [value, setValue] = useState("");
    const [errors, setErrors] = useState<string[]>([]);
    const [saving, setSaving] = useState(false);
    const check = useProfileIdCheck(value);

    // Start from a suggestion based on the name
    useEffect(() => {
        if (needsOne && !value) setValue(suggestProfileId(user.firstName, user.lastName));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [needsOne]);

    if (!needsOne) return null;

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (check.status !== "available") return;
        setSaving(true);
        setErrors([]);
        const r = await setMyProfileId(check.value);
        setSaving(false);
        if (!r.ok || !r.data) {
            setErrors(r.errors);
            return;
        }
        dispatch({ type: "SET_USERDETAILS", payload: { ...user, profileId: r.data.profileId } });
    };

    return createPortal(
        <div className="dialog-overlay pid-prompt" role="dialog" aria-modal="true" aria-labelledby="pid-prompt-title">
            <form className="dialog-box" onSubmit={handleSubmit}>
                <div className="dialog-content">
                    <p id="pid-prompt-title" className="dialog-title">Pick your Profile ID</p>
                </div>
                <div className="pid-prompt__body">
                    <p className="ex-muted">
                        Evolyn now has Profile IDs. Friends use yours to find and invite you to a tribe, so they never
                        need your email.
                    </p>
                    <label className="ex-field" style={{ marginBottom: 0 }}>
                        <span>Profile ID</span>
                        <div className="pid-input">
                            <span aria-hidden="true">@</span>
                            <input
                                type="text"
                                autoCapitalize="none"
                                autoCorrect="off"
                                spellCheck={false}
                                maxLength={21}
                                value={value}
                                onChange={(e) => setValue(e.target.value)}
                                aria-describedby="pid-prompt-status"
                                autoFocus
                            />
                        </div>
                    </label>
                    <p id="pid-prompt-status" className={`pid-status pid-status--${check.status}`} aria-live="polite">
                        {check.message || "3 to 20 characters: letters, numbers and _"}
                    </p>
                    {errors.length > 0 && <p className="ex-errors" role="alert" style={{ margin: 0 }}>{errors.join(", ")}</p>}
                    <div className="ex-form-actions">
                        <button type="submit" className="ex-btn ex-btn--primary" disabled={saving || check.status !== "available"}>
                            {saving ? "Saving…" : "Save"}
                        </button>
                    </div>
                </div>
            </form>
        </div>,
        document.body
    );
};

export default ProfileIdPrompt;
