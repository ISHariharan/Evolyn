import { request, toQuery } from "../http";
import { DashboardSummary, MonthTotal } from "./types";

export const getDashboardSummary = (userId: string, from: string, to: string) =>
    request<DashboardSummary>(`/dashboard/summary${toQuery({ userId, from, to })}`);

export const getDashboardTrend = (userId: string, from: string, to: string) =>
    request<MonthTotal[]>(`/dashboard/trend${toQuery({ userId, from, to })}`);
