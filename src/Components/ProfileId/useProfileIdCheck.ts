import { useEffect, useState } from "react";
import { checkProfileId } from "../../API/Profile/api";

export type ProfileIdStatus = "empty" | "invalid" | "checking" | "available" | "taken" | "error";

// Same rules as the server: 3-20 characters, letters, numbers, _ (a leading @ is ignored)
export const normalizeProfileId = (raw: string) => raw.trim().replace(/^@/, "").toLowerCase();
const FORMAT = /^[a-z0-9_]{3,20}$/;

/**
 * Live "is this Profile ID free?" check while typing. Waits until you pause
 * for 400 ms, so it doesn't ask the server on every key press.
 */
export const useProfileIdCheck = (raw: string, currentOwn?: string) => {
    const value = normalizeProfileId(raw);
    const [status, setStatus] = useState<ProfileIdStatus>("empty");
    const [message, setMessage] = useState("");

    useEffect(() => {
        if (!value) {
            setStatus("empty");
            setMessage("");
            return;
        }
        if (!FORMAT.test(value)) {
            setStatus("invalid");
            setMessage("3 to 20 characters: letters, numbers and _ only");
            return;
        }
        if (currentOwn && value === currentOwn) {
            setStatus("available");
            setMessage("That's yours");
            return;
        }
        setStatus("checking");
        setMessage("Checking…");
        let stale = false;
        const timer = window.setTimeout(async () => {
            const r = await checkProfileId(value);
            if (stale) return;
            if (!r.ok || !r.data) {
                setStatus("error");
                setMessage("Couldn't check right now");
            } else if (r.data.available) {
                setStatus("available");
                setMessage(`@${value} is available`);
            } else {
                setStatus(r.data.reason?.includes("taken") ? "taken" : "invalid");
                setMessage(r.data.reason ?? "Not available");
            }
        }, 400);
        return () => {
            stale = true;
            window.clearTimeout(timer);
        };
    }, [value, currentOwn]);

    return { value, status, message };
};

// A starting suggestion from the name: "Hariharan", "I S" -> "hariharan_is"
export const suggestProfileId = (firstName?: string, lastName?: string) => {
    const clean = (s?: string) => (s ?? "").toLowerCase().replace(/[^a-z0-9]/g, "");
    const joined = [clean(firstName), clean(lastName)].filter(Boolean).join("_");
    return joined.slice(0, 20);
};
