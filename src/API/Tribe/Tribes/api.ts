import { request, toQuery } from "../../Expenses/http";
import {
    CodePreview, FeedPage, MyInvitation, ProfileLookup, TribeDetail, TribeSummary,
} from "./types";

// No userId anywhere: the API knows who you are from your login token.

export const getMyTribes = () => request<TribeSummary[]>("/tribes");

export const createTribe = (name: string, description?: string) =>
    request<TribeDetail>("/tribes", { method: "POST", body: JSON.stringify({ name, description }) });

export const getTribe = (tribeId: string) => request<TribeDetail>(`/tribes/${tribeId}`);

export const updateTribe = (tribeId: string, name: string, description?: string) =>
    request<TribeDetail>(`/tribes/${tribeId}`, { method: "PUT", body: JSON.stringify({ name, description }) });

export const archiveTribe = (tribeId: string) => request<void>(`/tribes/${tribeId}/archive`, { method: "POST" });

export const leaveTribe = (tribeId: string) => request<void>(`/tribes/${tribeId}/leave`, { method: "POST" });

export const removeMember = (tribeId: string, memberUserId: string) =>
    request<TribeDetail>(`/tribes/${tribeId}/members/${memberUserId}/remove`, { method: "POST" });

export const lookupProfile = (profileId: string) =>
    request<ProfileLookup>(`/profiles/${encodeURIComponent(profileId.replace(/^@/, ""))}`);

export const inviteToTribe = (tribeId: string, profileId: string) =>
    request<TribeDetail>(`/tribes/${tribeId}/invitations`, { method: "POST", body: JSON.stringify({ profileId }) });

export const newInviteLink = (tribeId: string) => request<TribeDetail>(`/tribes/${tribeId}/join-code`, { method: "POST" });

export const turnOffInviteLink = (tribeId: string) =>
    request<TribeDetail>(`/tribes/${tribeId}/join-code`, { method: "DELETE" });

export const getMyInvitations = () => request<MyInvitation[]>("/invitations");

export const acceptInvitation = (invitationId: string) =>
    request<TribeDetail>(`/invitations/${invitationId}/accept`, { method: "POST" });

export const declineInvitation = (invitationId: string) =>
    request<{ status: string }>(`/invitations/${invitationId}/decline`, { method: "POST" });

export const cancelInvitation = (invitationId: string) =>
    request<TribeDetail>(`/invitations/${invitationId}/revoke`, { method: "POST" });

export const previewInviteCode = (code: string) => request<CodePreview>(`/tribe-codes/${encodeURIComponent(code)}`);

export const joinWithCode = (code: string) =>
    request<TribeDetail>(`/tribe-codes/${encodeURIComponent(code)}/join`, { method: "POST" });

export const getTribeFeed = (tribeId: string, before?: string | null, limit = 20) =>
    request<FeedPage>(`/tribes/${tribeId}/feed${toQuery({ before: before ?? undefined, limit })}`);

// The full link to share, e.g. https://evolyn.../tribe/join/HB7Q4KM2
export const inviteLinkFor = (code: string) => `${window.location.origin}/tribe/join/${code}`;
