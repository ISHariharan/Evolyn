import { request, toQuery } from "../http";
import { AccountBalance, DashboardSummary, MonthTotal } from "./types";

export const getDashboardSummary = (userId: string, from: string, to: string) =>
    request<DashboardSummary>(`/dashboard/summary${toQuery({ userId, from, to })}`);

export const getDashboardTrend = (userId: string, from: string, to: string) =>
    request<MonthTotal[]>(`/dashboard/trend${toQuery({ userId, from, to })}`);

// today: the user's local date, so "this billing cycle" uses their calendar, not the server's
export const getAccountBalances = (userId: string, today: string) =>
    request<AccountBalance[]>(`/dashboard/accounts${toQuery({ userId, today })}`);
