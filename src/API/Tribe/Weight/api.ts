import { request, toQuery } from "../../Expenses/http";
import { WeightEntry } from "./types";

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
