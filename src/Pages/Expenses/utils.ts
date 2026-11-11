const pad = (n: number) => String(n).padStart(2, "0");

// A Date as "YYYY-MM-DD" in the user's *local* time zone.
// (toISOString() gives the UTC date, which is "yesterday" in India before 5:30 AM.)
export const toLocalIsoDate = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export const todayLocal = () => toLocalIsoDate(new Date());

const inrFormatter = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
});
export const formatInr = (amount: number | string) => inrFormatter.format(Number(amount));

// Whole rupees for summaries, where paise are just noise: "₹20,668"
const inrWholeFormatter = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
});
export const formatInrWhole = (amount: number | string) => inrWholeFormatter.format(Math.round(Number(amount)));

// "2026-11-10" -> "10 Nov 2026"
export const formatDate = (isoDate: string) =>
    new Date(`${isoDate}T00:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

// "2026-11-11T09:50:26Z" -> "11 Nov 2026, 3:20 pm" (local time)
export const formatDateTime = (isoInstant: string) =>
    new Date(isoInstant).toLocaleString("en-IN", {
        day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit",
    });

export type Period = "THIS_MONTH" | "LAST_MONTH" | "LAST_3_MONTHS" | "THIS_YEAR" | "ALL";

export const PERIODS: { value: Period; label: string }[] = [
    { value: "THIS_MONTH", label: "This month" },
    { value: "LAST_MONTH", label: "Last month" },
    { value: "LAST_3_MONTHS", label: "Last 3 months" },
    { value: "THIS_YEAR", label: "This year" },
    { value: "ALL", label: "All time" },
];

// Converts a period choice into the from/to dates the API filters on
export const periodRange = (period: Period): { from?: string; to?: string } => {
    const now = new Date();
    const y = now.getFullYear();
    const m = now.getMonth();
    switch (period) {
        case "THIS_MONTH":
            return { from: toLocalIsoDate(new Date(y, m, 1)), to: toLocalIsoDate(new Date(y, m + 1, 0)) };
        case "LAST_MONTH":
            return { from: toLocalIsoDate(new Date(y, m - 1, 1)), to: toLocalIsoDate(new Date(y, m, 0)) };
        case "LAST_3_MONTHS":
            return { from: toLocalIsoDate(new Date(y, m - 2, 1)), to: toLocalIsoDate(new Date(y, m + 1, 0)) };
        case "THIS_YEAR":
            return { from: `${y}-01-01`, to: `${y}-12-31` };
        default:
            return {};
    }
};
