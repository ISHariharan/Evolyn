// Activities you logged recently (per person, in this browser) so the picker
// can offer them first. Falls back to common choices for a handball group.

const key = (userId: string) => `evolyn.recentActivities.${userId}`;
const MAX = 6;

// Team handball, jogging, running, brisk walk, gym, cycling, swimming, football, cricket, yoga
export const POPULAR_CODES = ["15330", "12020", "12050", "17200", "02061", "01014", "18240", "15610", "15150", "02175"];

// Short names for the suggestion chips (the full Compendium description shows once picked)
const SHORT_LABELS: Record<string, string> = {
    "15330": "Team handball",
    "12020": "Jogging",
    "12050": "Running (10 min/mile)",
    "17200": "Brisk walk",
    "02061": "Gym",
    "01014": "Cycling",
    "18240": "Swimming laps",
    "15610": "Football",
    "15150": "Cricket",
    "02175": "Yoga",
};

export const shortLabel = (code: string, description: string) => {
    if (SHORT_LABELS[code]) return SHORT_LABELS[code];
    return description.length > 32 ? `${description.slice(0, 30).trimEnd()}…` : description;
};

export const getRecentCodes = (userId: string): string[] => {
    try {
        const list = JSON.parse(localStorage.getItem(key(userId)) ?? "[]");
        return Array.isArray(list) ? list.filter((c) => typeof c === "string") : [];
    } catch {
        return [];
    }
};

export const rememberRecent = (userId: string, code: string) => {
    try {
        const next = [code, ...getRecentCodes(userId).filter((c) => c !== code)].slice(0, MAX);
        localStorage.setItem(key(userId), JSON.stringify(next));
    } catch {
        // storage blocked: no recent list, nothing else breaks
    }
};
