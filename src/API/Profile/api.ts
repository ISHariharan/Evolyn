import { request } from "../Expenses/http";

// Profile ID: the public handle friends find each other by, e.g. "arun_k"

export interface ProfileIdAvailability {
    profileId: string;   // lowercased
    available: boolean;
    reason?: string;     // why not, e.g. "@arun_k is already taken"
}

// Works without logging in (the signup form uses it)
export const checkProfileId = (profileId: string) =>
    request<ProfileIdAvailability>(`/profile-ids/${encodeURIComponent(profileId)}/availability`);

// Choose yours (for accounts made before Profile IDs). The server knows who you are from the login token.
export const setMyProfileId = (profileId: string) =>
    request<{ profileId: string }>("/me/profile-id", { method: "PUT", body: JSON.stringify({ profileId }) });
