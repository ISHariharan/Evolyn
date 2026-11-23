import { Challenge, ChallengeSummary, Standing } from "../../../API/Tribe/Challenges/types";

const nf = (n: number) => Math.round(n).toLocaleString("en-IN");

// "1,234 kcal" or "3 days"
export const fmtValue = (value: number, unit: "kcal" | "days") =>
    unit === "days" ? `${value} ${value === 1 ? "day" : "days"}` : `${nf(value)} kcal`;

export const fmtDate = (iso: string) =>
    new Date(`${iso}T00:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "short" });

export const dateRange = (c: { startDate: string; endDate: string }) =>
    c.startDate === c.endDate ? fmtDate(c.startDate) : `${fmtDate(c.startDate)} – ${fmtDate(c.endDate)}`;

const daysUntil = (from: string, to: string) =>
    Math.round((new Date(`${to}T00:00:00`).getTime() - new Date(`${from}T00:00:00`).getTime()) / 86_400_000);

// One line about where the challenge is in time
export const whenLine = (c: Pick<Challenge, "phase" | "days" | "startDate" | "endDate"> & { today?: string }) => {
    switch (c.phase) {
        case "DRAFT": return "Draft: only you can see it";
        case "UPCOMING": {
            const n = c.today ? daysUntil(c.today, c.startDate) : null;
            return n == null ? `Starts ${fmtDate(c.startDate)}` : n <= 1 ? "Starts tomorrow" : `Starts in ${n} days`;
        }
        case "ACTIVE": return `Day ${c.days.elapsed} of ${c.days.total}` +
            (c.days.remaining === 0 ? " · last day" : ` · ${c.days.remaining} ${c.days.remaining === 1 ? "day" : "days"} left`);
        case "UNDER_REVIEW": return "Ended yesterday · results are final tomorrow";
        case "COMPLETED": return "Completed · results are final";
        case "CANCELLED": return "Cancelled";
    }
};

export const personName = (s: Pick<Standing, "isMe" | "firstName" | "lastName">) =>
    s.isMe ? "You" : `${s.firstName} ${s.lastName}`.trim();

// What "your" number means for this type
export const myLine = (c: ChallengeSummary | Challenge) => {
    const me = c.me;
    if (!c.joined || !me) return null;
    switch (c.type) {
        case "COLLECTIVE": return `You added ${fmtValue(me.value, "kcal")}`;
        case "INDIVIDUAL_TARGET": return `You: ${fmtValue(me.value, "kcal")} · ${me.percent ?? 0}%${me.completed ? " · done" : ""}`;
        case "CONSISTENCY": return `You: ${fmtValue(me.value, "days")} of ${c.target}${me.completed ? " · done" : ""}`;
        case "TEAM": return `Team ${c.myTeam} · you: ${fmtValue(me.value, "kcal")}`;
        default: return `You: #${me.rank} · ${fmtValue(me.value, "kcal")}`;
    }
};

export const phaseClass = (phase: string) =>
    phase === "ACTIVE" ? "ch-tag--active" : phase === "UPCOMING" ? "ch-tag--upcoming"
        : phase === "UNDER_REVIEW" ? "ch-tag--review" : phase === "DRAFT" ? "ch-tag--draft" : "ch-tag--done";
