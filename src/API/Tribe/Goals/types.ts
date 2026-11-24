// A tribe's month: goal, progress, daily totals and leaderboard.
// Everything is added up on the server from the activities (estimated kcal).

// The tribe's goal is never typed in: it's the members' daily goals added up over the month
export interface TribeGoal {
    metricType: "CALORIES_BURNED";
    unit: "kcal";
    source: "MEMBERS";
    target: number;            // the month's target
    total: number;             // calories burned on days members had a goal (what progress counts)
    startsOn: string;          // first day anyone had a goal this month
    dailyTarget: number;       // today's daily goals added up
    membersWithGoal: number;
    memberCount: number;
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
    dailyGoal: number | null;    // their daily goal (null: not set)
    monthTarget: number | null;  // their daily goals added up over the month
    goalKcal: number;            // their calories on days they had a goal
    goalPercent: number | null;  // of their own month target
}

export interface TribeDashboard {
    month: string;             // "2026-11"
    periodStart: string;
    periodEnd: string;
    today: string;             // India date
    memberCount: number;
    total: number;
    averagePerDay: number | null;
    goal: TribeGoal | null;          // null until a member sets a daily goal
    progress: GoalProgress | null;
    membersWithGoal: number;
    daily: { date: string; kcal: number }[];
    leaderboard: LeaderboardEntry[];
    me: LeaderboardEntry | null;
}

// Your own daily goal and progress
export interface DailyGoal {
    today: string;
    kcal: number | null;           // null: not set yet
    effectiveFrom: string | null;
    todayKcal: number;             // counted calories today
    todayPercent: number | null;
    month: string;
    monthKcal: number;
    monthTarget: number | null;    // your daily goals added up over the month
    min: number;
    max: number;
}
