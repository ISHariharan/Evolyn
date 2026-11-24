import "../Expenses/Expenses.scss";
import "./Home.scss";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useStore } from "../../Store/GlobalStore/GlobalStore";
import { getMe } from "../../API/AuthForm/api";
import { toWorkspaceList } from "../../Components/NavBar/NavBar";
import { TYPE_INFO, PHASE_LABEL, ChallengeSummary } from "../../API/Tribe/Challenges/types";
import { formatInrWhole, todayLocal } from "../Expenses/utils";
import { Bone } from "../Expenses/Skeletons";
import { HomeData, useHomeData } from "./useHomeData";

const kcal = (n: number) => Math.round(n).toLocaleString("en-IN");

const duration = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return h ? (m ? `${h} h ${m} min` : `${h} h`) : `${m} min`;
};

const greeting = (hour: number) => (hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening");

const longToday = () => new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" });

const shortDate = (iso: string) =>
    new Date(`${iso}T00:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "short" });

// "Handball, general (Taylor Code 520)" -> "Handball, general"
const shortName = (description: string) => description.replace(/\s*\(.*\)\s*$/, "");

const monthName = () => new Date().toLocaleDateString("en-IN", { month: "long" });

// ── Signed out: what Evolyn is ─────────────────────────
const Welcome = () => (
    <div className="ex-page hm">
        <header className="hm-hero">
            <h1 className="hm-hero__title">One place for your money, your workouts and your work</h1>
            <p className="ex-subtitle">Log in to see your day across every Evolyn module.</p>
        </header>
        <div className="hm-modules">
            <section className="ex-card hm-card">
                <h2 className="hm-card__title"><span className="hm-dot hm-dot--expenses" aria-hidden="true"></span>Expenses</h2>
                <p className="ex-muted">Track spending and income across your accounts and cards, and see where it went.</p>
            </section>
            <section className="ex-card hm-card">
                <h2 className="hm-card__title"><span className="hm-dot hm-dot--tribe" aria-hidden="true"></span>Tribe</h2>
                <p className="ex-muted">Log workouts, keep streaks and take on monthly goals and challenges with friends.</p>
            </section>
            <section className="ex-card hm-card">
                <h2 className="hm-card__title"><span className="hm-dot hm-dot--stride" aria-hidden="true"></span>Stride</h2>
                <p className="ex-muted">Organise your day-to-day work in workspaces and boards.</p>
            </section>
        </div>
    </div>
);

// ── Today so far ───────────────────────────────────────
const TodayStrip = ({ d }: { d: HomeData }) => {
    const today = todayLocal();
    const spentToday = d.month ? d.month.dailySpending.find((x) => x.date === today)?.total ?? 0 : undefined;
    const todays = d.activities ? d.activities.activities.filter((a) => a.activityDate === today) : undefined;
    const kcalToday = todays?.reduce((s, a) => s + (a.kcal ?? 0), 0);
    const minutesToday = todays?.reduce((s, a) => s + a.durationMinutes, 0);

    const item = (mod: string, icon: string, value: string | undefined, label: string, failed: boolean) => (
        <div className="hm-today__item">
            <span className={`hm-icon hm-icon--${mod}`} aria-hidden="true"><i className={`bx ${icon}`}></i></span>
            <div className="hm-today__text">
                {value !== undefined ? <span className="hm-today__value">{value}</span>
                    : failed ? <span className="hm-today__value">–</span> : <Bone w={70} h={22} />}
                <span className="hm-today__label">{label}</span>
            </div>
        </div>
    );

    return (
        <section className="ex-card hm-today" aria-labelledby="hm-today-title">
            <h2 className="hm-eyebrow" id="hm-today-title">Today so far</h2>
            <div className="hm-today__grid">
                {item("expenses", "bx-wallet", spentToday !== undefined ? formatInrWhole(spentToday) : undefined, "spent", d.month === null)}
                {item("tribe", "bx-run", kcalToday !== undefined ? `${kcal(kcalToday)} kcal` : undefined,
                    d.dailyGoal?.kcal != null
                        ? `of your ${kcal(d.dailyGoal.kcal)} kcal goal${kcalToday !== undefined && kcalToday >= d.dailyGoal.kcal ? " · done" : ""}`
                        : todays?.length ? todays.map((a) => shortName(a.description)).slice(0, 2).join(", ") : "burned",
                    d.activities === null)}
                {item("stride", "bx-time-five", minutesToday !== undefined ? duration(minutesToday) : undefined, "active", d.activities === null)}
                {item("streak", "bxs-flame", d.streak ? `${d.streak.current} ${d.streak.current === 1 ? "day" : "days"}` : undefined,
                    d.streak ? `streak · best ${d.streak.best}` : "streak", d.streak === null)}
            </div>
        </section>
    );
};

// ── Module cards ───────────────────────────────────────
const CardHead = ({ id, mod, title, to }: { id: string; mod: string; title: string; to: string }) => (
    <div className="hm-card__head">
        <h2 className="hm-card__title" id={id}><span className={`hm-dot hm-dot--${mod}`} aria-hidden="true"></span>{title}</h2>
        <Link to={to} className="hm-link">Open<i className="bx bx-chevron-right" aria-hidden="true"></i></Link>
    </div>
);

const CardSkeleton = () => (
    <>
        <Bone w="45%" h={12} />
        <Bone w="60%" h={30} />
        <Bone w="100%" h={8} />
        <Bone w="80%" h={12} />
    </>
);

const ExpensesCard = ({ d }: { d: HomeData }) => {
    const m = d.month;
    const now = new Date();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const monthPercent = (now.getDate() / daysInMonth) * 100;

    const cards = (d.balances ?? []).filter((a) => a.accountType === "CREDIT_CARD" && a.balance > 0);
    const dues = cards.reduce((s, a) => s + a.balance, 0);
    const nextStatement = cards.map((a) => a.nextStatementDate).filter(Boolean).sort()[0] as string | undefined;

    const top = m ? [...m.byCategory].sort((a, b) => b.total - a.total).slice(0, 3) : [];
    const topMax = top[0]?.total || 1;
    const spentPercent = m && m.totalIncome > 0 ? (m.totalSpent / m.totalIncome) * 100 : null;

    return (
        <section className="ex-card hm-card" aria-labelledby="hm-exp-title">
            <CardHead id="hm-exp-title" mod="expenses" title="Expenses" to="/expenses" />
            {m === undefined ? <CardSkeleton /> : m === null ? <p className="ex-muted">Couldn't load your expenses.</p>
            : m.expenseCount === 0 && m.incomeCount === 0 ? (
                <div className="hm-empty">
                    <p className="ex-muted">Nothing recorded in {monthName()} yet.</p>
                    <Link to="/expenses/transactions/new" className="ex-btn ex-btn--secondary">Add an expense</Link>
                </div>
            ) : (
                <>
                    <div className="hm-big">
                        <span className="hm-big__label">Spent in {monthName()}</span>
                        <span className="hm-big__value">{formatInrWhole(m.totalSpent)}</span>
                        <span className="hm-big__sub">
                            {m.totalIncome > 0
                                ? `of ${formatInrWhole(m.totalIncome)} income · ${formatInrWhole(m.totalIncome - m.totalSpent)} left over`
                                : `${m.expenseCount} ${m.expenseCount === 1 ? "expense" : "expenses"} · no income recorded yet`}
                        </span>
                    </div>
                    {spentPercent !== null && (
                        <div className="hm-progress">
                            <div className="hm-bar" role="img"
                                 aria-label={`${Math.round(spentPercent)}% of income spent, ${Math.round(monthPercent)}% of the month gone`}>
                                <div className="hm-bar__fill hm-bar__fill--expenses" style={{ width: `${Math.min(100, spentPercent)}%` }}></div>
                                <div className="hm-bar__marker" style={{ left: `${monthPercent}%` }}></div>
                            </div>
                            <span className="hm-small">
                                {Math.round(spentPercent)}% spent · day {now.getDate()} of {daysInMonth}
                                {spentPercent <= monthPercent ? ", under pace" : ", ahead of pace"}
                            </span>
                        </div>
                    )}
                    {top.length > 0 && (
                        <div className="hm-cats">
                            <span className="hm-section">Where it went</span>
                            {top.map((c) => (
                                <div className="hm-cat" key={c.categoryId}>
                                    <span className="hm-cat__name">{c.name}</span>
                                    <div className="hm-bar hm-bar--thin"><div className="hm-bar__fill" style={{ width: `${(c.total / topMax) * 100}%` }}></div></div>
                                    <span className="hm-cat__value">{formatInrWhole(c.total)}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}
            {cards.length > 0 && (
                <div className="hm-card__foot">
                    <span>Card dues</span>
                    <strong>{formatInrWhole(dues)}{nextStatement ? ` · statement ${shortDate(nextStatement)}` : ""}</strong>
                </div>
            )}
        </section>
    );
};

const challengeLine = (c: ChallengeSummary) => {
    const unit = c.unit === "days" ? "days" : "kcal";
    if (c.type === "COLLECTIVE" && c.target) return `${kcal(c.total)} of ${kcal(c.target)} kcal together`;
    if (c.me) return `You: ${kcal(c.me.value)} ${unit}${c.target ? ` of ${kcal(c.target)}` : ""} · rank ${c.me.rank}`;
    return `${c.participantCount} ${c.participantCount === 1 ? "person" : "people"} in`;
};

const challengePercent = (c: ChallengeSummary) => {
    if (c.type === "COLLECTIVE") return c.totalPercent ?? null;
    if (c.me && c.target) return Math.min(100, (c.me.value / c.target) * 100);
    return null;
};

const TribeCard = ({ d }: { d: HomeData }) => {
    const t = d.tribe;
    const dash = d.tribeDashboard;
    const c = d.challenge;

    return (
        <section className="ex-card hm-card" aria-labelledby="hm-tribe-title">
            <CardHead id="hm-tribe-title" mod="tribe" title="Tribe" to={t ? `/tribe/tribes/${t.tribeId}` : "/tribe"} />
            {t === undefined ? <CardSkeleton /> : t === null ? <p className="ex-muted">Couldn't load your tribes.</p>
            : t === false ? (
                <div className="hm-empty">
                    <p className="ex-muted">You're not in a tribe yet. Make one for your friends, or join with an invite link.</p>
                    <Link to="/tribe/tribes" className="ex-btn ex-btn--secondary">Find your tribe</Link>
                </div>
            ) : (
                <>
                    {dash === undefined ? <CardSkeleton /> : dash === null ? <p className="ex-muted">Couldn't load {t.name}.</p>
                    : dash.goal && dash.progress ? (
                        <>
                            <div className="hm-big">
                                <span className="hm-big__label">{t.name} · {monthName()} goal</span>
                                <span className="hm-big__value">{kcal(dash.goal.total)} <span className="hm-big__unit">of {kcal(dash.goal.target)} kcal</span></span>
                            </div>
                            <div className="hm-progress">
                                <div className="hm-bar" role="img" aria-label={`${Math.round(dash.progress.percent)}% of the tribe goal reached`}>
                                    <div className="hm-bar__fill hm-bar__fill--tribe" style={{ width: `${Math.min(100, dash.progress.percent)}%` }}></div>
                                </div>
                                <span className="hm-small">
                                    {Math.round(dash.progress.percent)}%
                                    {dash.me ? ` · you added ${kcal(dash.me.goalKcal)} kcal · rank ${dash.me.rankByKcal} of ${dash.memberCount}` : ""}
                                </span>
                            </div>
                        </>
                    ) : (
                        <div className="hm-big">
                            <span className="hm-big__label">{t.name} · {monthName()}</span>
                            <span className="hm-big__value">{kcal(dash.total)} <span className="hm-big__unit">kcal together</span></span>
                            <span className="hm-big__sub">No goal yet: it's everyone's daily goals added up. <Link to="/tribe">Set yours</Link></span>
                        </div>
                    )}

                    {c && (
                        <Link to={`/tribe/challenges/${c.challengeId}`} className="hm-challenge">
                            <span className="hm-challenge__head">
                                <span className="hm-challenge__name">{c.name}</span>
                                <span className={`hm-pill ${c.phase === "ACTIVE" ? "hm-pill--active" : ""}`}>
                                    {PHASE_LABEL[c.phase]}
                                    {c.phase === "ACTIVE" ? ` · ${c.days.remaining} ${c.days.remaining === 1 ? "day" : "days"} left`
                                        : c.phase === "UPCOMING" ? ` · starts ${shortDate(c.startDate)}` : ""}
                                </span>
                            </span>
                            {challengePercent(c) !== null && (
                                <span className="hm-bar hm-bar--thin hm-bar--on-tint">
                                    <span className="hm-bar__fill" style={{ width: `${Math.min(100, challengePercent(c)!)}%` }}></span>
                                </span>
                            )}
                            <span className="hm-small">
                                {TYPE_INFO[c.type].label} · {c.joined || c.phase !== "UPCOMING" ? challengeLine(c) : "You haven't joined yet"}
                            </span>
                        </Link>
                    )}
                </>
            )}
            {t && (
                <div className="hm-card__foot">
                    <span>{d.streak?.activeToday ? "Active today" : "Not active yet today"}</span>
                    <Link to="/tribe/activities/new" className="hm-link">Log activity</Link>
                </div>
            )}
        </section>
    );
};

const StrideCard = () => {
    const { state } = useStore();
    const workspaces = toWorkspaceList(state.workspace);

    return (
        <section className="ex-card hm-card" aria-labelledby="hm-stride-title">
            <CardHead id="hm-stride-title" mod="stride" title="Stride" to="/stride" />
            {workspaces.length === 0 ? (
                <div className="hm-empty">
                    <p className="ex-muted">No workspace yet. Workspaces hold the boards you organise your work in.</p>
                    <Link to="/stride" className="ex-btn ex-btn--secondary">Start a workspace</Link>
                </div>
            ) : (
                <>
                    <div className="hm-big">
                        <span className="hm-big__label">Your workspaces</span>
                        <span className="hm-big__value">{workspaces.length}</span>
                    </div>
                    <ul className="hm-list">
                        {workspaces.slice(0, 4).map((ws: any, i: number) => (
                            <li key={String(ws?.workspaceId ?? i)}>
                                <Link to="/stride/dashboard" className="hm-list__item">
                                    <i className={`bx ${ws?.workspaceIcon || "bx-folder"}`} aria-hidden="true"></i>
                                    {ws?.workspaceName ?? ws?.name ?? "Workspace"}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </>
            )}
            <div className="hm-card__foot"><span>Task boards and progress land here next.</span></div>
        </section>
    );
};

// ── Recent across Evolyn ───────────────────────────────
interface RecentItem { key: string; sortKey: string; when: string; text: string; mod: "expenses" | "tribe"; to: string }

const whenLabel = (date: string, time: string | null) => {
    const today = todayLocal();
    const y = new Date(); y.setDate(y.getDate() - 1);
    const yesterday = `${y.getFullYear()}-${String(y.getMonth() + 1).padStart(2, "0")}-${String(y.getDate()).padStart(2, "0")}`;
    if (date === today) return time ?? "Today";
    if (date === yesterday) return "Yesterday";
    return shortDate(date);
};

const timeOf = (localDateTime: string) =>
    new Date(localDateTime).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" }).toLowerCase();

const Recent = ({ d }: { d: HomeData }) => {
    const loading = d.transactions === undefined || d.activities === undefined;
    const items: RecentItem[] = [
        ...(d.activities?.activities ?? []).map((a) => ({
            key: `a-${a.id}`,
            sortKey: a.startedAt,
            when: whenLabel(a.activityDate, timeOf(a.startedAt)),
            text: `${shortName(a.description)} · ${duration(a.durationMinutes)}${a.kcal != null ? ` · ${kcal(a.kcal)} kcal` : ""}`,
            mod: "tribe" as const,
            to: `/tribe/activities/${a.id}/edit`,
        })),
        ...(d.transactions ?? []).map((t) => ({
            key: `t-${t.transactionId}`,
            // Transactions carry a date, not a time: sort them by when they were added within the day
            sortKey: `${t.transactionDate}T${new Date(t.createdAt).toTimeString().slice(0, 8)}`,
            when: whenLabel(t.transactionDate, null),
            text: `${t.merchant || t.categoryName || "Transfer"}${t.type === "TRANSFER" ? "" : ` · ${t.categoryName}`} · ${t.type === "INCOME" ? "+" : ""}${formatInrWhole(t.amount)}`,
            mod: "expenses" as const,
            to: `/expenses/transactions/${t.transactionId}`,
        })),
    ].sort((a, b) => b.sortKey.localeCompare(a.sortKey)).slice(0, 6);

    return (
        <section className="ex-card hm-card" aria-labelledby="hm-recent-title">
            <h2 className="hm-card__title" id="hm-recent-title">Recent across Evolyn</h2>
            {loading ? <CardSkeleton />
            : items.length === 0 ? <p className="ex-muted">Nothing yet. Log a workout or an expense and it shows up here.</p>
            : (
                <ul className="hm-recent">
                    {items.map((it) => (
                        <li key={it.key}>
                            <Link to={it.to} className="hm-recent__row">
                                <span className="hm-recent__when">{it.when}</span>
                                <span className="hm-recent__text">{it.text}</span>
                                <span className={`hm-tag hm-tag--${it.mod}`}>{it.mod === "tribe" ? "Tribe" : "Expenses"}</span>
                            </Link>
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
};

// ── Worth a look: simple rules across modules ──────────
interface Nudge { key: string; mod: string; icon: string; title: string; text: string; to?: string }

const nudgesFor = (d: HomeData): Nudge[] => {
    const out: Nudge[] = [];
    const s = d.streak;
    if (s?.atRisk && s.current > 0) {
        out.push({ key: "streak", mod: "tribe", icon: "bxs-flame", title: `Your ${s.current}-day streak ends tonight`,
            text: `Log ${s.minMinutes}+ minutes of activity today to keep it going.`, to: "/tribe/activities/new" });
    } else if (s?.activeToday) {
        out.push({ key: "streak", mod: "tribe", icon: "bxs-flame", title: "Streak is safe for today",
            text: `Log an activity tomorrow to reach ${s.current + 1} ${s.current + 1 === 1 ? "day" : "days"}.` });
    }

    const c = d.challenge;
    if (c && c.phase === "UPCOMING" && !c.joined) {
        out.push({ key: "join", mod: "tribe", icon: "bx-trophy", title: `Join ${c.name}`,
            text: `It starts ${shortDate(c.startDate)}. You can join until the end of its first day.`, to: `/tribe/challenges/${c.challengeId}` });
    }

    const dash = d.tribeDashboard;
    if (dash?.progress && dash.progress.phase === "ACTIVE" && !dash.progress.reached && dash.progress.neededPerDay) {
        out.push({ key: "goal", mod: "tribe", icon: "bx-target-lock", title: `${kcal(dash.progress.remaining)} kcal to the tribe goal`,
            text: `That's about ${kcal(dash.progress.neededPerDay)} kcal a day for the tribe, ${dash.progress.remainingDays} days left.` });
    }

    const now = d.month, before = d.lastMonthSoFar;
    if (now && before && before.totalSpent > 0 && now.totalSpent > 0) {
        const change = ((now.totalSpent - before.totalSpent) / before.totalSpent) * 100;
        if (Math.abs(change) >= 10) {
            out.push({ key: "spend", mod: "expenses", icon: change > 0 ? "bx-trending-up" : "bx-trending-down",
                title: `Spending is ${Math.round(Math.abs(change))}% ${change > 0 ? "above" : "below"} last month`,
                text: `${formatInrWhole(now.totalSpent)} so far, against ${formatInrWhole(before.totalSpent)} by this day last month.`, to: "/expenses" });
        }
    }
    return out.slice(0, 4);
};

const Nudges = ({ d }: { d: HomeData }) => {
    const loading = d.streak === undefined || d.month === undefined;
    const nudges = nudgesFor(d);
    return (
        <section className="ex-card hm-card" aria-labelledby="hm-nudge-title">
            <h2 className="hm-card__title" id="hm-nudge-title">Worth a look</h2>
            {loading ? <CardSkeleton />
            : nudges.length === 0 ? <p className="ex-muted">Nothing needs you right now.</p>
            : nudges.map((n) => {
                const body = (
                    <>
                        <span className={`hm-icon hm-icon--sm hm-icon--${n.mod}`} aria-hidden="true"><i className={`bx ${n.icon}`}></i></span>
                        <span className="hm-nudge__text"><strong>{n.title}</strong><span>{n.text}</span></span>
                    </>
                );
                return n.to
                    ? <Link key={n.key} to={n.to} className="hm-nudge hm-nudge--link">{body}</Link>
                    : <div key={n.key} className="hm-nudge">{body}</div>;
            })}
        </section>
    );
};

// ── Signed in: your day across Evolyn ──────────────────
const Dashboard = () => {
    const { state } = useStore();
    const user = state.userDetails ?? {};
    const [firstName, setFirstName] = useState<string>(user.firstName ?? "");
    const d = useHomeData(user.id);

    // Older logins didn't save the first name: ask the API once
    useEffect(() => {
        if (firstName || !user.id) return;
        getMe().then((r) => r.ok && r.data && setFirstName(r.data.firstName));
    }, [firstName, user.id]);

    return (
        <div className="ex-page hm">
            <header className="ex-header">
                <div>
                    <span className="hm-date">{longToday()}</span>
                    <h1 className="ex-title">{greeting(new Date().getHours())}{firstName ? `, ${firstName}` : ""}</h1>
                    <p className="ex-subtitle">Your money, your workouts and your work, in one place.</p>
                </div>
                <div className="hm-actions">
                    <Link to="/tribe/activities/new" className="ex-btn ex-btn--primary hm-btn"><i className="bx bx-plus" aria-hidden="true"></i>Log activity</Link>
                    <Link to="/expenses/transactions/new" className="ex-btn ex-btn--secondary hm-btn"><i className="bx bx-plus" aria-hidden="true"></i>Add expense</Link>
                </div>
            </header>

            <TodayStrip d={d} />

            <div className="hm-modules">
                <ExpensesCard d={d} />
                <TribeCard d={d} />
                <StrideCard />
            </div>

            <div className="hm-bottom">
                <Recent d={d} />
                <Nudges d={d} />
            </div>
        </div>
    );
};

const Home = () => {
    const { state } = useStore();
    return state.authenticated ? <Dashboard /> : <Welcome />;
};

export default Home;
