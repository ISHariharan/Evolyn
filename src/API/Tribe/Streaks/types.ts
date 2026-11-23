// Streaks: consecutive days with at least one activity of the minimum length,
// of a type that counts for goals (India dates). Worked out on the server.

export interface Streak {
    current: number;
    best: number;
    activeToday: boolean;
    atRisk: boolean;          // not active yet today, but the run up to yesterday is still alive
    lastActive: string | null;
}

export interface MemberStreak extends Streak {
    userId: string;
    firstName: string;
    lastName: string;
    profileId: string | null;
    isMe: boolean;
}

export interface TribeStreaks {
    today: string;
    rules: { minMinutes: number; memberPercent: number; memberCount: number; neededMembers: number };
    tribe: Streak & { activeMembersToday: number; neededMembers: number };
    members: MemberStreak[];  // highest current streak first
    me: MemberStreak | null;
    recentDays: { date: string; activeMembers: number; counted: boolean }[];  // last 14 days, oldest first
}

export interface MyStreak extends Streak {
    minMinutes: number;
    today: string;
}
