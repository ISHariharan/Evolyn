import { request, toQuery } from "../../Expenses/http";
import { DailyGoal, TribeDashboard } from "./types";

// month: "2026-11" (default: this month). The goal in it is the members' daily goals added up.
export const getTribeDashboard = (tribeId: string, month?: string) =>
    request<TribeDashboard>(`/tribes/${tribeId}/dashboard${toQuery({ month })}`);

export const getDailyGoal = () => request<DailyGoal>("/daily-goal");

// Applies from today; earlier days keep the goal they had
export const setDailyGoal = async (kcal: number) => {
    const result = await request<DailyGoal>("/daily-goal", { method: "PUT", body: JSON.stringify({ kcal }) });
    if (result.ok) window.dispatchEvent(new Event(DAILY_GOAL_SAVED_EVENT));
    return result;
};

// Pages showing goal numbers listen for this to refresh after a change
export const DAILY_GOAL_SAVED_EVENT = "evolyn:daily-goal-saved";
