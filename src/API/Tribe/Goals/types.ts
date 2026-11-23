// A tribe's month: goal, progress, daily totals and leaderboard.
// Everything is added up on the server from the activities (estimated kcal).

export interface TribeGoal {
    goalId: string;
    metricType: "CALORIES_BURNED";
    unit: "kcal";
    target: number;
    updatedAt: string;
    updatedByName: string;
    updatedByProfileId: string | null;
}

export interface GoalProgress {
    phase: "UPCOMING" | "ACTIVE" | "ENDED";
    percent: number;              // done %, 1 decimal
    remaining: number;
    totalDays: number;
    elapsedDays: number;          // today counts
    remainingDays: number;        // today counts
    averagePerDay: number | null;
    neededPerDay: number | null;  // null when reached or over
    projectedTotal: number | null;    // "at current pace", only while the month is running
    projectedPercent: number | null;
    reached: boolean;
}

export interface LeaderboardEntry {
    userId: string;
    firstName: string;
    lastName: string;
    profileId: string | null;
    isMe: boolean;
    kcal: number;
    activeDays: number;
    sessions: number;
    minutes: number;
    rankByKcal: number;    // ties share a rank
    rankByDays: number;
    sharePercent: number;  // of the tribe's total
}

export interface TribeDashboard {
    month: string;             // "2026-11"
    periodStart: string;
    periodEnd: string;
    today: string;             // India date
    memberCount: number;
    total: number;
    averagePerDay: number | null;
    goal: TribeGoal | null;
    progress: GoalProgress | null;
    suggestedTarget: number | null;   // last month's target, to start from
    canSetGoal: boolean;              // false for past months
    daily: { date: string; kcal: number }[];
    leaderboard: LeaderboardEntry[];
    me: LeaderboardEntry | null;
}
