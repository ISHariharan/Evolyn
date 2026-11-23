import { request, toQuery } from "../../Expenses/http";
import { TribeDashboard } from "./types";

// month: "2026-11" (default: this month)
export const getTribeDashboard = (tribeId: string, month?: string) =>
    request<TribeDashboard>(`/tribes/${tribeId}/dashboard${toQuery({ month })}`);

// Any member can set or change it; past months are read-only. Answers with the updated dashboard.
export const setTribeGoal = (tribeId: string, month: string, target: number) =>
    request<TribeDashboard>(`/tribes/${tribeId}/goals/${month}`, { method: "PUT", body: JSON.stringify({ target }) });
