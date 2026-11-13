import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAccountBalances } from "../../../API/Expenses/Dashboard/api";
import { AccountBalance } from "../../../API/Expenses/Dashboard/types";
import { accountLabel, accountTypeMeta } from "../../../API/Expenses/Accounts/types";
import { formatDate, formatInrWhole, todayLocal } from "../utils";

/**
 * "Where do I stand right now?" — independent of the month picker.
 * Bank / cash / wallet: current balance. Credit cards: what you owe, what you've spent
 * this billing cycle, and how much of the limit is used.
 */
const Balances = ({ userId }: { userId: string }) => {
    const [accounts, setAccounts] = useState<AccountBalance[] | null>(null);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!userId) return;
        let stale = false;
        getAccountBalances(userId, todayLocal()).then((r) => {
            if (stale) return;
            if (r.ok && r.data) setAccounts(r.data);
            else setError(r.errors.join(", "));
        });
        return () => {
            stale = true;
        };
    }, [userId]);

    if (error) return <p className="ex-errors" role="alert">{error}</p>;
    if (!accounts) return <p className="ex-muted">Loading balances…</p>;
    if (accounts.length === 0) return null;

    const money = accounts.filter((a) => a.accountType !== "CREDIT_CARD");
    const cards = accounts.filter((a) => a.accountType === "CREDIT_CARD");
    const tracked = money.filter((a) => a.balance !== null);
    const totalAvailable = tracked.reduce((sum, a) => sum + Math.round(Number(a.balance) * 100), 0) / 100;
    const totalOwed = cards.reduce((sum, a) => sum + (a.balance === null ? 0 : Math.round(Number(a.balance) * 100)), 0) / 100;
    const missing = accounts.filter((a) => a.balance === null).length;

    return (
        <section className="ex-card ex-balances" aria-labelledby="balances-title">
            <div className="ex-balances__head">
                <div>
                    <h2 className="ex-card__title" id="balances-title">Balances</h2>
                    <p className="ex-card__sub">Right now, across all your accounts — not tied to the month above</p>
                </div>
                <div className="ex-balances__totals">
                    {tracked.length > 0 && (
                        <div>
                            <span className="ex-kpi__label">Available</span>
                            <span className="ex-balances__big">{formatInrWhole(totalAvailable)}</span>
                        </div>
                    )}
                    {cards.some((c) => c.balance !== null) && (
                        <div>
                            <span className="ex-kpi__label">Card dues</span>
                            <span className="ex-balances__big ex-text--worse">{formatInrWhole(totalOwed)}</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="ex-balances__grid">
                {money.map((a) => (
                    <div key={a.accountId} className="ex-balance">
                        <span className="ex-balance__name">
                            <i className={accountTypeMeta(a.accountType).icon} aria-hidden="true"></i>
                            {accountLabel(a.name, a.last4)}
                        </span>
                        {a.balance === null ? (
                            <Link className="ex-balance__set" to="/expenses/accounts">Set a starting balance</Link>
                        ) : (
                            <>
                                <span className={`ex-balance__value ${Number(a.balance) < 0 ? "ex-text--worse" : ""}`}>
                                    {formatInrWhole(a.balance)}
                                </span>
                                <span className="ex-balance__meta">Tracked from {formatDate(a.openingBalanceDate!)}</span>
                            </>
                        )}
                    </div>
                ))}

                {cards.map((c) => {
                    const used = c.balance !== null && c.creditLimit ? Math.min(Number(c.balance) / Number(c.creditLimit), 1) : null;
                    return (
                        <div key={c.accountId} className="ex-balance ex-balance--card">
                            <span className="ex-balance__name">
                                <i className="bx bx-credit-card" aria-hidden="true"></i>
                                {accountLabel(c.name, c.last4)}
                            </span>
                            <div className="ex-balance__card-row">
                                <div>
                                    <span className="ex-balance__meta">
                                        {c.statementDay ? "Spent this cycle" : "Spent this month"}
                                    </span>
                                    <span className="ex-balance__value">{formatInrWhole(c.cycleSpent ?? 0)}</span>
                                </div>
                                <div>
                                    <span className="ex-balance__meta">Owed</span>
                                    {c.balance === null ? (
                                        <Link className="ex-balance__set" to="/expenses/accounts">Set amount owed</Link>
                                    ) : (
                                        <span className="ex-balance__value ex-text--worse">{formatInrWhole(c.balance)}</span>
                                    )}
                                </div>
                            </div>
                            {used !== null && (
                                <>
                                    <div className="ex-meter__track ex-meter__track--limit" aria-hidden="true">
                                        <span
                                            className={used >= 0.8 ? "is-high" : ""}
                                            style={{ width: `${Math.max(used, 0) * 100}%` }}
                                        ></span>
                                    </div>
                                    <span className="ex-balance__meta">
                                        {Math.round(Math.max(used, 0) * 100)}% of {formatInrWhole(c.creditLimit!)} limit used
                                    </span>
                                </>
                            )}
                            <span className="ex-balance__meta">
                                {c.statementDay
                                    ? `Cycle ${formatDate(c.cycleStart!)} – ${formatDate(c.nextStatementDate!)} · next statement ${formatDate(c.nextStatementDate!)}`
                                    : "Add a statement day to see your billing cycle"}
                            </span>
                        </div>
                    );
                })}
            </div>

            {missing > 0 && (
                <p className="ex-balances__note">
                    {missing} account{missing === 1 ? " has" : "s have"} no starting balance, so {missing === 1 ? "its" : "their"} balance
                    can't be shown. <Link to="/expenses/accounts">Set it on the Accounts page</Link>.
                </p>
            )}
        </section>
    );
};

export default Balances;
