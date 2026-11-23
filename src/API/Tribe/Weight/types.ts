// Your body weight for one day. Only you can see it; calories are worked out from it.
export interface WeightEntry {
    weightLogId: string;
    userId: string;
    recordedOn: string; // "YYYY-MM-DD" (India time)
    weightKg: number;
    createdAt: string;
    updatedAt: string;
}
