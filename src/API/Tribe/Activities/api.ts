import { request, toQuery } from "../../Expenses/http";
import { Activity, ActivityInput, ActivityList } from "./types";

// A 409 answer carries code "OVERLAP" (ask, then resend with allowOverlap)
// or "WEIGHT_REQUIRED" (save a weight first)
export const createActivity = (activity: ActivityInput, userId: string) =>
    request<Activity>("/activities", { method: "POST", body: JSON.stringify({ ...activity, userId }) });

export const updateActivity = (activityId: string, activity: ActivityInput, userId: string) =>
    request<Activity>(`/activities/${activityId}`, { method: "PUT", body: JSON.stringify({ ...activity, userId }) });

export const getActivity = (activityId: string, userId: string) =>
    request<Activity>(`/activities/${activityId}${toQuery({ userId })}`);

// Default range: this month so far
export const getActivities = (userId: string, from?: string, to?: string) =>
    request<ActivityList>(`/activities${toQuery({ userId, from, to })}`);

export const deleteActivity = (activityId: string, userId: string) =>
    request<void>(`/activities/${activityId}${toQuery({ userId })}`, { method: "DELETE" });
