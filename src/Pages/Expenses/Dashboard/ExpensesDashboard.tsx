import "../Expenses.scss";
import { ReactNode, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "../../../Store/GlobalStore/GlobalStore";
import { getDashboardSummary, getDashboardTrend } from "../../../API/Expenses/Dashboard/api";
import { DashboardSummary, MonthTotal } from "../../../API/Expenses/Dashboard/types";
import { accountLabel } from "../../../API/Expenses/Accounts/types";
import { paymentMethodLabel } from "../../../API/Expenses/Transactions/types";
import { Period, formatDate, formatInrWhole, periodRange, toLocalIsoDate, todayLocal } from "../utils";
import CategoryIcon from "../Transactions/CategoryIcon";
import { CHART_COLORS, PaceChart, TrendChart } from "./charts";
import Balances from "./Balances";

const DASHBOARD_PERIODS: { value: Period; label: string }[] = [
    { value: "THIS_MONTH", label: "This month" },
    { value: "LAST_MONTH", label: "Last month" },
    { value: "LAST_3_MONTHS", label: "Last 3 months" },
    { value: "THIS_YEAR", label: "This year" },
];

// Colour follows the payment method, never its rank, so it stays the same everywhere
const METHOD_COLORS: Record<string, string> = {
    NET_BANKING: "#2a78d6",
    CREDIT_CARD: "#eb6834",
    UPI: "#1baf7a",
    DEBIT_CARD: "#6250d6",
    CASH: "#eda100",
};

const parseDate = (iso: string) => new Date(`${iso}T00:00:00`);
const daysBetween = (fromIso: string, toIso: string) =>
    Math.round((parseDate(toIso).getTime() - parseDate(fromIso).getTime()) / 86_400_000) + 1;
const monthName = (d: Date, withYear = false) =>
    d.toLocaleDateString("en-IN", withYear ? { month: "long", year: "numeric" } : { month: "short" });

// Daily totals -> running total for day 1..days ("by day 5 you had spent ₹X")
const cumulative = (daily: { date: string; total: number }[], fromIso: string, days: number) => {
    const byDay = new Map(daily.map((d) => [d.date, Number(d.total)]));
    const start = parseDate(fromIso);
    const result: number[] = [];
    let running = 0;
    for (let i = 0; i < days; i++) {
        const day = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
        running += byDay.get(toLocalIsoDate(day)) ?? 0;
        result.push(Math.round(running * 100) / 100);
    }
    return result;
};

// The calendar month before the one containing `iso`
const previousMonthRange = (iso: string) => {
    const d = parseDate(iso);
    return {
        from: toLocalIsoDate(new Date(d.getFullYear(), d.getMonth() - 1, 1)),
        to: toLocalIsoDate(new Date(d.getFullYear(), d.getMonth(), 0)),
    };
};

// The last 6 *completed* months (a half-finished month would look like a great one)
const trendRange = () => {
    const now = new Date();
    return {
        from: toLocalIsoDate(new Date(now.getFullYear(), now.getMonth() - 6, 1)),
        to: toLocalIsoDate(new Date(now.getFullYear(), now.getMonth(), 0)),
    };
};

interface DashboardData {
    summary: DashboardSummary;
    previous: DashboardSummary | null;
    trend: MonthTotal[];
}

const ExpensesDashboard = () => {
    const { state } = useStore();
    const userId: string = state.userDetails?.id;
    const navigate = useNavigate();

    const [period, setPeriod] = useState<Period>("THIS_MONTH");
    const [data, setData] = useState<DashboardData | null>(null);
    const [error, setError] = useState("");

    const { from, to } = periodRange(period) as { from: string; to: string };
    const isSingleMonth = period === "THIS_MONTH" || period === "LAST_MONTH";
    const today = todayLocal();
    const isOngoing = to >= today; // the period includes today, so totals are "so far"

    useEffect(() => {
        if (!userId) return;
        let stale = false; // ignore responses for a period the user already switched away from
        setData(null);
        setError("");

        const prev = previousMonthRange(from);
        const trend = trendRange();
        // Three independent requests, sent at the same time
        Promise.all([
            getDashboardSummary(userId, from, to),
            isSingleMonth ? getDashboardSummary(userId, prev.from, prev.to) : Promise.resolve(null),
            getDashboardTrend(userId, trend.from, trend.to),
        ]).then(([summary, previous, trendResult]) => {
            if (stale) return;
            if (!summary.ok || !summary.data) {
                setError(summary.errors.join(", "));
                return;
            }
            setData({
                summary: summary.data,
                previous: previous && previous.ok && previous.data ? previous.data : null,
                trend: trendResult.ok && trendResult.data ? trendResult.data : [],
            });
        });
        return () => {
            stale = true;
        };
    }, [userId, from, to, isSingleMonth]);

    const s = data?.summary;
    const spent = Number(s?.totalSpent ?? 0);
    const income = Number(s?.totalIncome ?? 0);
    // Average per day: count from the period start, unless this user only began
    // recording partway through it. Then count from their first expense, otherwise
    // "₹203 a day over 315 days" would be wrong for someone who started in September.
    const firstSpend = s?.dailySpending[0]?.date;
    const hasEarlierHistory = isSingleMonth && Number(data?.previous?.totalSpent ?? 0) > 0;
    const averageFrom = !hasEarlierHistory && firstSpend && firstSpend > from ? firstSpend : from;
    const daysCounted = daysBetween(averageFrom, isOngoing ? today : to);
    const isEmpty = s && s.expenseCount + s.incomeCount === 0;

    // ── Spending pace (single-month periods only) ─────────────────────
    let pace: null | {
        current: number[];
        previous: number[];
        daysInMonth: number;
        currentLabel: string;
        previousLabel: string;
        message: ReactNode;
    } = null;
    if (s && isSingleMonth) {
        const start = parseDate(from);
        const daysInMonth = daysBetween(from, to);
        const current = cumulative(s.dailySpending, from, isOngoing ? parseDate(today).getDate() : daysInMonth);
        const prevRange = previousMonthRange(from);
        const prevDays = daysBetween(prevRange.from, prevRange.to);
        const hasPrevious = Number(data?.previous?.totalSpent ?? 0) > 0;
        const previous = hasPrevious ? cumulative(data!.previous!.dailySpending, prevRange.from, prevDays) : [];
        const currentLabel = monthName(start);
        const previousLabel = monthName(parseDate(prevRange.from));

        let message: ReactNode;
        if (!hasPrevious) {
            message = <>Nothing recorded in {monthName(parseDate(prevRange.from), true)}, so there's nothing to compare with yet.</>;
        } else {
            const day = Math.min(current.length, previous.length);
            const now = current[current.length - 1] ?? 0;
            const then = previous[day - 1] ?? 0;
            const diff = now - then;
            const when = isOngoing
                ? `by ${day} ${previousLabel}`
                : `in ${monthName(parseDate(prevRange.from), true)}`;
            message =
                Math.abs(diff) < 1 ? (
                    <>Same as {isOngoing ? "at this point last month" : "the month before"} ({formatInrWhole(then)} {when})</>
                ) : (
                    <>
                        <span className={diff > 0 ? "ex-text--worse" : "ex-text--better"}>
                            {formatInrWhole(Math.abs(diff))} {diff > 0 ? "more" : "less"}
                        </span>{" "}
                        than {isOngoing ? "at this point last month" : "the month before"} ({formatInrWhole(then)} {when})
                    </>
                );
        }
        pace = { current, previous, daysInMonth, currentLabel, previousLabel, message };
    }

    // ── Month-by-month trend ──────────────────────────────────────────
    const allMonths = (data?.trend ?? []).map((m) => ({
        label: monthName(parseDate(`${m.month}-01`)),
        income: Number(m.income),
        spent: Number(m.spent),
    }));
    // Start from the user's first month with any data (no row of empty months for new users)
    const firstWithData = allMonths.findIndex((m) => m.income > 0 || m.spent > 0);
    const trendMonths = firstWithData === -1 ? [] : allMonths.slice(firstWithData);
    const hasTrend = trendMonths.length > 0;

    const maxCategory = Math.max(...(s?.byCategory ?? []).map((c) => Number(c.total)), 1);
    const maxAccount = Math.max(...(s?.byAccount ?? []).map((a) => Number(a.total)), 1);
    const so = isOngoing ? " so far" : "";
    const periodText = `${formatDate(from)} – ${formatDate(isOngoing ? today : to)}`;

    return (
        <div className="ex-page">
            <header className="ex-header">
                <div>
                    <h1 className="ex-title">Expenses</h1>
                    <p className="ex-subtitle">{periodText}</p>
                </div>
                <div className="ex-header__actions">
                    <select
                        className="ex-input ex-input--auto"
                        aria-label="Period"
                        value={period}
                        onChange={(e) => setPeriod(e.target.value as Period)}
                    >
                        {DASHBOARD_PERIODS.map((p) => (
                            <option key={p.value} value={p.value}>{p.label}</option>
                        ))}
                    </select>
                    <button type="button" className="ex-btn ex-btn--primary" onClick={() => navigate("/expenses/transactions/new")}>
                        <i className="bx bx-plus"></i> Add transaction
                    </button>
                </div>
            </header>

            {/* Balances are "right now", so they sit above the month-based numbers */}
            <Balances userId={userId} />

            {error && <p className="ex-errors" role="alert">{error}</p>}
            {!error && !s && <p className="ex-muted">Loading…</p>}

            {s && (
                <>
                    <section className="ex-kpis" aria-label="Totals">
                        <div className="ex-kpi">
                            <span className="ex-kpi__label">Spent{so}</span>
                            <span className="ex-kpi__value">{formatInrWhole(spent)}</span>
                            <span className="ex-kpi__sub">{s.expenseCount} expense{s.expenseCount === 1 ? "" : "s"}</span>
                        </div>
                        <div className="ex-kpi">
                            <span className="ex-kpi__label">Income{so}</span>
                            <span className="ex-kpi__value">{formatInrWhole(income)}</span>
                            <span className="ex-kpi__sub">{s.incomeCount} payment{s.incomeCount === 1 ? "" : "s"} in</span>
                        </div>
                        <div className="ex-kpi">
                            <span className="ex-kpi__label">Left over{so}</span>
                            <span className={`ex-kpi__value ${income - spent < 0 ? "ex-text--worse" : ""}`}>{formatInrWhole(income - spent)}</span>
                            <span className="ex-kpi__sub">Income − spent</span>
                        </div>
                        <div className="ex-kpi">
                            <span className="ex-kpi__label">Average per day</span>
                            <span className="ex-kpi__value">{formatInrWhole(Math.round(spent / Math.max(daysCounted, 1)))}</span>
                            <span className="ex-kpi__sub">
                                Over {daysCounted} day{daysCounted === 1 ? "" : "s"}
                                {averageFrom !== from ? ` since ${formatDate(averageFrom)}` : ""}
                            </span>
                        </div>
                    </section>

                    {isEmpty && (
                        <div className="ex-card ex-empty ex-dash__full">
                            <i className="bx bx-bar-chart-alt-2"></i>
                            <p className="ex-muted">No transactions in this period yet. Add some and this page fills in.</p>
                            <button type="button" className="ex-btn ex-btn--secondary" onClick={() => navigate("/expenses/transactions/new")}>
                                Add a transaction
                            </button>
                        </div>
                    )}

                    {!isEmpty && (
                        <div className="ex-dash">
                            {pace && (
                                <section className="ex-card ex-dash__full">
                                    <h2 className="ex-card__title">Spending pace</h2>
                                    <p className="ex-card__sub">{pace.message}</p>
                                    <div className="ex-legend">
                                        <span><i className="ex-legend__line" style={{ borderColor: CHART_COLORS.SPENT }}></i>{pace.currentLabel}</span>
                                        {pace.previous.length > 0 && (
                                            <span><i className="ex-legend__line ex-legend__line--dashed" style={{ borderColor: CHART_COLORS.PREVIOUS }}></i>{pace.previousLabel}</span>
                                        )}
                                    </div>
                                    <PaceChart {...pace} />
                                </section>
                            )}

                            <section className="ex-card">
                                <h2 className="ex-card__title">Where it went</h2>
                                <p className="ex-card__sub">Spending by category</p>
                                {s.byCategory.length === 0 && <p className="ex-muted">No spending in this period.</p>}
                                {s.byCategory.map((c) => (
                                    <div key={c.categoryId} className="ex-meter">
                                        <div className="ex-meter__row">
                                            <span className="ex-category">
                                                <CategoryIcon icon={c.icon} color={c.color} />
                                                {c.name}
                                            </span>
                                            <span className="ex-meter__value">
                                                {formatInrWhole(c.total)} <span className="ex-muted-inline">{Math.round((Number(c.total) / spent) * 100)}%</span>
                                            </span>
                                        </div>
                                        <div className="ex-meter__track">
                                            <span style={{ width: `${(Number(c.total) / maxCategory) * 100}%` }}></span>
                                        </div>
                                    </div>
                                ))}
                            </section>

                            <section className="ex-card">
                                <h2 className="ex-card__title">By account</h2>
                                <p className="ex-card__sub">Money out of each account</p>
                                {s.byAccount.length === 0 && <p className="ex-muted">No spending in this period.</p>}
                                {s.byAccount.map((a) => (
                                    <div key={a.accountId} className="ex-meter">
                                        <div className="ex-meter__row">
                                            <span>{accountLabel(a.name, a.last4)}</span>
                                            <span className="ex-meter__value">{formatInrWhole(a.total)}</span>
                                        </div>
                                        <div className="ex-meter__track ex-meter__track--violet">
                                            <span style={{ width: `${(Number(a.total) / maxAccount) * 100}%` }}></span>
                                        </div>
                                    </div>
                                ))}

                                {s.byPaymentMethod.length > 0 && (
                                    <>
                                        <h3 className="ex-card__title ex-card__title--spaced">By payment method</h3>
                                        <div className="ex-stack" aria-hidden="true">
                                            {s.byPaymentMethod.map((m) => (
                                                <span key={m.paymentMethod} style={{ flex: Number(m.total), background: METHOD_COLORS[m.paymentMethod] ?? "#898781" }}></span>
                                            ))}
                                        </div>
                                        <div className="ex-legend">
                                            {s.byPaymentMethod.map((m) => (
                                                <span key={m.paymentMethod}>
                                                    <i className="ex-legend__swatch" style={{ background: METHOD_COLORS[m.paymentMethod] ?? "#898781" }}></i>
                                                    {paymentMethodLabel(m.paymentMethod)} {Math.round((Number(m.total) / spent) * 100)}%
                                                </span>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </section>

                            <section className="ex-card">
                                <h2 className="ex-card__title">Top merchants</h2>
                                <p className="ex-card__sub">Where you pay most often</p>
                                {s.topMerchants.length === 0 && <p className="ex-muted">No spending in this period.</p>}
                                <ul className="ex-rows">
                                    {s.topMerchants.map((m) => (
                                        <li key={m.merchant}>
                                            <span>{m.merchant}</span>
                                            <span>
                                                <span className="ex-muted-inline">{m.count} time{m.count === 1 ? "" : "s"} · </span>
                                                {formatInrWhole(m.total)}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </section>

                            <section className="ex-card">
                                <h2 className="ex-card__title">Biggest expenses</h2>
                                <p className="ex-card__sub">Largest single payments</p>
                                {s.biggestExpenses.length === 0 && <p className="ex-muted">No spending in this period.</p>}
                                <ul className="ex-rows">
                                    {s.biggestExpenses.map((t) => (
                                        <li key={t.transactionId}>
                                            <button type="button" className="ex-link" onClick={() => navigate(`/expenses/transactions/${t.transactionId}`)}>
                                                {t.merchant} <span className="ex-muted-inline">· {formatDate(t.transactionDate)}</span>
                                            </button>
                                            <span>{formatInrWhole(t.amount)}</span>
                                        </li>
                                    ))}
                                </ul>
                            </section>
                        </div>
                    )}

                    {hasTrend && (
                        <section className="ex-card ex-dash__trend">
                            <h2 className="ex-card__title">Month by month</h2>
                            <p className="ex-card__sub">Completed months only, so a half-finished month doesn't look like a good one. Hover a month to see what you saved.</p>
                            <div className="ex-legend">
                                <span><i className="ex-legend__swatch" style={{ background: CHART_COLORS.INCOME }}></i>Income</span>
                                <span><i className="ex-legend__swatch" style={{ background: CHART_COLORS.SPENT }}></i>Spent</span>
                            </div>
                            <TrendChart months={trendMonths} />
                        </section>
                    )}
                </>
            )}
        </div>
    );
};

export default ExpensesDashboard;
