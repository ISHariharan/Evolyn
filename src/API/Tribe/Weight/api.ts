import { request, toQuery } from "../../Expenses/http";
import { TribeWeightProgress, WeightEntry } from "./types";

// Saving again on the same day corrects that day's weight
export const saveWeight = async (userId: string, weightKg: number, recordedOn?: string) => {
    const result = await request<WeightEntry>("/weights", {
        method: "PUT",
        body: JSON.stringify({ userId, weightKg, recordedOn }),
    });
    if (result.ok) announceWeightSaved();
    return result;
};

// 404 = no weight saved yet
export const getLatestWeight = (userId: string, onOrBefore?: string) =>
    request<WeightEntry>(`/weights/latest${toQuery({ userId, onOrBefore })}`);

export const getWeightHistory = (userId: string, from?: string, to?: string) =>
    request<WeightEntry[]>(`/weights${toQuery({ userId, from, to })}`);

// Lets other parts of the page (e.g. the Today's weight card) refresh when a weight is saved elsewhere
export const WEIGHT_SAVED_EVENT = "evolyn:weight-saved";
export const announceWeightSaved = () => window.dispatchEvent(new Event(WEIGHT_SAVED_EVENT));

// Each member's weight change this month (only for people who share it)
export const getTribeWeightProgress = (tribeId: string, month?: string) =>
    request<TribeWeightProgress>(`/tribes/${tribeId}/weight-progress${toQuery({ month })}`);

export const getWeightSharing = () => request<{ shareWeightChange: boolean }>("/weight-sharing");

// Turns sharing your weight CHANGE with all your tribes on or off (never the weight itself)
export const setWeightSharing = async (shareWeightChange: boolean) => {
    const result = await request<{ shareWeightChange: boolean }>("/weight-sharing", {
        method: "PUT",
        body: JSON.stringify({ shareWeightChange }),
    });
    if (result.ok) window.dispatchEvent(new Event(WEIGHT_SHARING_EVENT));
    return result;
};

export const WEIGHT_SHARING_EVENT = "evolyn:weight-sharing-changed";
