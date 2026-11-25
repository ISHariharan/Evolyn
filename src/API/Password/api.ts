import { request } from "../Expenses/http";

// Recovery codes and passwords. A recovery code (e.g. K7QF-9XRM-2HPA-W4TD) is the only way
// to reset a forgotten password; it's shown once when made, so it must be saved.

export interface RecoveryStatus {
    hasCode: boolean;
    createdAt: string | null;
}

export const getRecoveryStatus = () => request<RecoveryStatus>("/recovery-code");

// Replaces any old code. Needs your current password.
export const createRecoveryCode = (currentPassword: string) =>
    request<{ recoveryCode: string; message: string }>("/recovery-code", {
        method: "POST",
        body: JSON.stringify({ currentPassword }),
    });

// Forgot password (no login). Answers with a NEW recovery code: the used one stops working.
export const resetPassword = (email: string, recoveryCode: string, password: string) =>
    request<{ recoveryCode: string; message: string }>("/password-reset", {
        method: "POST",
        body: JSON.stringify({ email: email.trim(), recoveryCode, password }),
    });

export const changePassword = (currentPassword: string, newPassword: string) =>
    request<{ message: string }>("/password/change", {
        method: "POST",
        body: JSON.stringify({ currentPassword, newPassword }),
    });

// Asks the header to open the login dialog (after a reset)
export const OPEN_LOGIN_EVENT = "evolyn:open-login";
export const openLogin = () => window.dispatchEvent(new Event(OPEN_LOGIN_EVENT));
