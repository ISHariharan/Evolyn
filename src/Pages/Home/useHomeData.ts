import { useEffect, useState } from "react";
import { getAccountBalances, getDashboardSummary } from "../../API/Expenses/Dashboard/api";
import { AccountBalance, DashboardSummary } from "../../API/Expenses/Dashboard/types";
import { getTransactions } from "../../API/Expenses/Transactions/api";
import { Transaction } from "../../API/Expenses/Transactions/types";
import { getActivities } from "../../API/Tribe/Activities/api";
import { ActivityList } from "../../API/Tribe/Activities/types";
import { getMyStreak } from "../../API/Tribe/Streaks/api";
import { MyStreak } from "../../API/Tribe/Streaks/types";
import { getMyTribes } from "../../API/Tribe/Tribes/api";
import { TribeSummary } from "../../API/Tribe/Tribes/types";
import { DAILY_GOAL_SAVED_EVENT, getDailyGoal, getTribeDashboard } from "../../API/Tribe/Goals/api";
import { DailyGoal, TribeDashboard } from "../../API/Tribe/Goals/types";
import { getChallenges } from "../../API/Tribe/Challenges/api";
import { ChallengeSummary } from "../../API/Tribe/Challenges/types";
import { toLocalIsoDate, todayLocal } from "../Expenses/utils";

// undefined = still loading, null = couldn't load
export type Loadable<T> = T | null | undefined;

export interface HomeData {
    month: Loadable<DashboardSummary>;
    lastMonthSoFar: Loadable<DashboardSummary>;  // same days of last month, for "vs last month"
    balances: Loadable<AccountBalance[]>;
    transactions: Loadable<Transaction[]>;
    activities: Loadable<ActivityList>;
    streak: Loadable<MyStreak>;
    dailyGoal: Loadable<DailyGoal>;
    tribe: Loadable<TribeSummary | false>;       // false = not in a tribe
    tribeDashboard: Loadable<TribeDashboard>;
    challenge: Loadable<ChallengeSummary | false>; // false = nothing running or coming up
}

// The challenge most worth showing: one you're in that's running, then any running one, then the next upcoming
const pickChallenge = (list: ChallengeSummary[]): ChallengeSummary | false =>
    list.find((c) => c.phase === "ACTIVE" && c.joined)
    ?? list.find((c) => c.phase === "ACTIVE")
    ?? list.filter((c) => c.phase === "UPCOMING").sort((a, b) => a.startDate.localeCompare(b.startDate))[0]
    ?? false;

export const useHomeData = (userId: string | undefined): HomeData => {
    const [data, setData] = useState<HomeData>({
        month: undefined, lastMonthSoFar: undefined, balances: undefined, transactions: undefined,
        activities: undefined, streak: undefined, dailyGoal: undefined, tribe: undefined, tribeDashboard: undefined, challenge: undefined,
    });

    useEffect(() => {
        if (!userId) return;
        let live = true;
        const put = (patch: Partial<HomeData>) => live && setData((d) => ({ ...d, ...patch }));

        const now = new Date();
        const today = todayLocal();
        const monthStart = toLocalIsoDate(new Date(now.getFullYear(), now.getMonth(), 1));
        const lastStart = toLocalIsoDate(new Date(now.getFullYear(), now.getMonth() - 1, 1));
        // Same day number last month (or its last day, for the 31st after a 30-day month)
        const lastEnd = toLocalIsoDate(new Date(now.getFullYear(), now.getMonth() - 1,
            Math.min(now.getDate(), new Date(now.getFullYear(), now.getMonth(), 0).getDate())));

        getDashboardSummary(userId, monthStart, today).then((r) => put({ month: r.ok ? r.data ?? null : null }));
        getDashboardSummary(userId, lastStart, lastEnd).then((r) => put({ lastMonthSoFar: r.ok ? r.data ?? null : null }));
        getAccountBalances(userId, today).then((r) => put({ balances: r.ok ? r.data ?? null : null }));
        getTransactions(userId, { size: 6 }).then((r) => put({ transactions: r.ok && r.data ? r.data.items : null }));
        getActivities(userId).then((r) => put({ activities: r.ok ? r.data ?? null : null }));
        getMyStreak().then((r) => put({ streak: r.ok ? r.data ?? null : null }));
        let tribeId: string | null = null;
        const loadGoal = () => getDailyGoal().then((r) => put({ dailyGoal: r.ok ? r.data ?? null : null }));
        // A new daily goal changes your tribe's target too
        const goalSaved = () => {
            loadGoal();
            if (tribeId) getTribeDashboard(tribeId).then((r) => put({ tribeDashboard: r.ok ? r.data ?? null : null }));
        };
        loadGoal();
        window.addEventListener(DAILY_GOAL_SAVED_EVENT, goalSaved);

        getMyTribes().then(async (r) => {
            if (!r.ok || !r.data) return put({ tribe: null, tribeDashboard: null, challenge: null });
            // Your oldest tribe is the one shown here; the Tribe pages have the rest
            const tribe = [...r.data].sort((a, b) => a.joinedAt.localeCompare(b.joinedAt))[0];
            if (!tribe) return put({ tribe: false, tribeDashboard: null, challenge: false });
            tribeId = tribe.tribeId;
            put({ tribe });
            const [dash, challenges] = await Promise.all([getTribeDashboard(tribe.tribeId), getChallenges(tribe.tribeId)]);
            put({
                tribeDashboard: dash.ok ? dash.data ?? null : null,
                challenge: challenges.ok && challenges.data ? pickChallenge(challenges.data) : null,
            });
        });

        return () => {
            live = false;
            window.removeEventListener(DAILY_GOAL_SAVED_EVENT, goalSaved);
        };
    }, [userId]);

    return data;
};
