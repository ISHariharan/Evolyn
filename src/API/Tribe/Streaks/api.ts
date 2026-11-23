import { request } from "../../Expenses/http";
import { MyStreak, TribeStreaks } from "./types";

export const getTribeStreaks = (tribeId: string) => request<TribeStreaks>(`/tribes/${tribeId}/streaks`);

// Any member can change them (no roles yet)
export const setStreakRules = (tribeId: string, minMinutes: number, memberPercent: number) =>
    request<TribeStreaks>(`/tribes/${tribeId}/streak-rules`, {
        method: "PUT",
        body: JSON.stringify({ minMinutes, memberPercent }),
    });

// Your own streak (20+ min of a type that counts), outside any tribe
export const getMyStreak = () => request<MyStreak>("/streaks/me");
