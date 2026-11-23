import { request } from "../../Expenses/http";
import { Challenge, ChallengeInput, ChallengeSummary } from "./types";

export const getChallenges = (tribeId: string) => request<ChallengeSummary[]>(`/tribes/${tribeId}/challenges`);

export const createChallenge = (tribeId: string, input: ChallengeInput) =>
    request<Challenge>(`/tribes/${tribeId}/challenges`, { method: "POST", body: JSON.stringify(input) });

export const getChallenge = (challengeId: string) => request<Challenge>(`/challenges/${challengeId}`);

// Before it starts everything can change; once running only the name and description
export const updateChallenge = (challengeId: string, input: ChallengeInput) =>
    request<Challenge>(`/challenges/${challengeId}`, { method: "PUT", body: JSON.stringify(input) });

export const challengeAction = (challengeId: string, action: "publish" | "cancel" | "leave") =>
    request<Challenge>(`/challenges/${challengeId}/${action}`, { method: "POST" });

export const joinChallenge = (challengeId: string, team?: "A" | "B") =>
    request<Challenge>(`/challenges/${challengeId}/join`, { method: "POST", body: JSON.stringify(team ? { team } : {}) });
