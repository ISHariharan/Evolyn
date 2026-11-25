// Your body weight for one day. Only you can see it (tribes can see its change if you share that);
// calories are worked out from it.
export interface WeightEntry {
    weightLogId: string;
    userId: string;
    recordedOn: string; // "YYYY-MM-DD" (India time)
    weightKg: number;
    createdAt: string;
    updatedAt: string;
}

// ── Weight change in a tribe ──
// Other members only ever get the CHANGE in kg (from their first weigh-in of the month),
// and only if they turned sharing on. Your own kg come back for you alone.

export interface WeightPoint {
    date: string;       // "YYYY-MM-DD"
    changeKg: number;   // vs the first weigh-in of the month (0 on that day)
}

export interface MemberWeight {
    userId: string;
    firstName: string;
    lastName: string;
    profileId: string | null;
    isMe: boolean;
    shared: boolean;
    // Present only when shared or you:
    weighIns?: number;
    startDate?: string | null;
    latestDate?: string | null;
    changeKg?: number | null;
    points?: WeightPoint[];
    // Yours only:
    startKg?: number;
    latestKg?: number;
}

export interface TribeWeightProgress {
    month: string;
    periodStart: string;
    periodEnd: string;
    today: string;
    memberCount: number;
    sharingCount: number;
    iShare: boolean;
    members: MemberWeight[];   // in joining order (gives each person a stable chart colour)
}
