// What the Log activity form sends. There's no calories field: the server works
// them out from the activity's MET value and your weight.
export interface ActivityInput {
    activityCode: string;            // Compendium code, e.g. "15330"
    startedAt: string;               // India local time "YYYY-MM-DDTHH:mm"
    durationMinutes: number;
    distanceKm?: number;
    notes?: string;
    visibility: "TRIBES" | "PRIVATE";
    allowOverlap?: boolean;          // true after confirming an overlapping activity is separate
}

// How the calories were worked out, saved with the activity
export interface Calculation {
    kcal: number;                    // 2 decimals
    met: number;
    weightKg: number;
    weightRecordedOn: string;        // which day's weight was used
    hours: number;
    formula: string;                 // "MET_GROSS_V1" = MET x kg x hours
    edition: string;                 // "2024_ADULT"
    calculatedAt: string;
}

export interface Activity {
    id: string;
    activityCode: string;
    headingCode: string;
    description: string;
    startedAt: string;               // "2026-11-22T18:30:00" (India time)
    activityDate: string;            // "2026-11-22"
    durationMinutes: number;
    distanceKm: number | null;
    notes: string | null;
    visibility: "TRIBES" | "PRIVATE";
    source: "MANUAL";
    kcal: number | null;             // rounded for display
    calculation: Calculation | null;
}

export interface ActivityList {
    from: string;
    to: string;
    count: number;
    activeDays: number;
    totalKcal: number;
    totalMinutes: number;
    activities: Activity[];
}
