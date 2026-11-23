// Challenges: time-boxed contests inside a tribe. Standings are worked out on
// the server from activities; a day after the end the results are frozen.

export type ChallengeType = "COMPETITIVE" | "COLLECTIVE" | "INDIVIDUAL_TARGET" | "CONSISTENCY" | "TEAM";
export type ChallengePhase = "DRAFT" | "UPCOMING" | "ACTIVE" | "UNDER_REVIEW" | "COMPLETED" | "CANCELLED";

export interface Standing {
    userId: string;
    firstName: string;
    lastName: string;
    profileId: string | null;
    isMe: boolean;
    team: "A" | "B" | null;
    value: number;              // kcal, or days for CONSISTENCY
    percent: number | null;     // of the target (individual/consistency) or share of the total (collective)
    completed: boolean;         // reached the target / won
    rank: number;               // ties share a rank
}

export interface TeamStanding {
    team: "A" | "B";
    value: number;
    members: number;
    rank: number;
    won: boolean;               // while running: currently ahead
}

export interface MyChallengeActivity {
    activityId: string;
    description: string;
    startedAt: string;
    activityDate: string;
    durationMinutes: number;
    kcal: number | null;
    counted: boolean;
    reason: string | null;      // why it didn't count
}

export interface Challenge {
    challengeId: string;
    tribeId: string;
    name: string;
    description: string | null;
    type: ChallengeType;
    unit: "kcal" | "days";
    target: number | null;
    startDate: string;
    endDate: string;
    minMinutes: number;
    headingCode: string | null;
    headingName: string | null;
    status: "DRAFT" | "PUBLISHED" | "CANCELLED";
    phase: ChallengePhase;
    createdByName: string;
    createdByProfileId: string | null;
    isCreator: boolean;
    finalizedAt: string | null;
    today: string;
    days: { total: number; elapsed: number; remaining: number };
    participantCount: number;
    joined: boolean;
    myTeam: "A" | "B" | null;
    standings: Standing[];
    teams: TeamStanding[];
    total: number;
    totalPercent: number | null;
    completed: boolean;         // collective: target reached
    me: Standing | null;
    myActivities: MyChallengeActivity[];
    canJoin: boolean;
    canLeave: boolean;
    canEditRules: boolean;
    canEditName: boolean;
    canPublish: boolean;
    canCancel: boolean;
}

export type ChallengeSummary = Pick<Challenge,
    "challengeId" | "name" | "type" | "unit" | "target" | "startDate" | "endDate" | "phase" | "participantCount" |
    "joined" | "myTeam" | "days" | "total" | "totalPercent" | "completed" | "teams" | "isCreator" | "me"> & {
    leader: Standing | null;
};

export interface ChallengeInput {
    name: string;
    description?: string;
    type: ChallengeType;
    startDate: string;
    endDate: string;
    target?: number;
    minMinutes?: number;
    headingCode?: string;
    publish?: boolean;
}

export const TYPE_INFO: Record<ChallengeType, { label: string; short: string; scoring: string }> = {
    COMPETITIVE: {
        label: "Competitive", short: "Highest total wins",
        scoring: "Everyone's estimated calories are ranked; the highest total wins. Same total = same rank.",
    },
    COLLECTIVE: {
        label: "Collective", short: "One shared target",
        scoring: "Everyone adds to one shared calorie target. The group succeeds together if it's reached in time.",
    },
    INDIVIDUAL_TARGET: {
        label: "Individual target", short: "Everyone chases the same target",
        scoring: "Each person aims for the same calorie target. Anyone who reaches it completes the challenge.",
    },
    CONSISTENCY: {
        label: "Consistency", short: "Count active days",
        scoring: "What counts is how many different days you're active, not how much you burn.",
    },
    TEAM: {
        label: "Team vs team", short: "Team A against team B",
        scoring: "Pick team A or B when joining. The team with the higher combined calories wins.",
    },
};

export const PHASE_LABEL: Record<ChallengePhase, string> = {
    DRAFT: "Draft",
    UPCOMING: "Upcoming",
    ACTIVE: "Active",
    UNDER_REVIEW: "Under review",
    COMPLETED: "Completed",
    CANCELLED: "Cancelled",
};
