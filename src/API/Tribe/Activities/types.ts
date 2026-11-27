// What the Log activity form sends. The server works out the calories from the
// activity's MET value and your weight, unless you enter the number you burned.
export interface ActivityInput {
    activityCode: string;            // Compendium code, e.g. "15330"
    startedAt: string;               // India local time "YYYY-MM-DDTHH:mm"
    durationMinutes: number;
    distanceKm?: number;
    notes?: string;
    visibility: "TRIBES" | "PRIVATE";
    allowOverlap?: boolean;          // true after confirming an overlapping activity is separate
    enteredKcal?: number;            // calories from a watch or machine, used instead of the estimate
}

// How the calories were worked out, saved with the activity
export interface Calculation {
    kcal: number;                    // 2 decimals
    met: number;
    weightKg: number | null;         // empty for entered calories without a saved weight
    weightRecordedOn: string | null; // which day's weight was used
    hours: number;
    formula: string;                 // "MET_GROSS_V1" = MET x kg x hours, "ENTERED_V1" = entered by you
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
    kcalEntered: boolean;            // you entered the calories instead of using the estimate
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
