import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAccountBalances } from "../../../API/Expenses/Dashboard/api";
import { AccountBalance } from "../../../API/Expenses/Dashboard/types";
import { accountLabel, accountTypeMeta } from "../../../API/Expenses/Accounts/types";
import { formatDate, formatInrWhole, todayLocal } from "../utils";
import { BalancesSkeleton } from "../Skeletons";

// Opens the Accounts page with this account's edit form already open
const setBalanceLink = (accountId: string) => `/expenses/accounts?edit=${accountId}`;

/** Small line under a balance saying where the number comes from. */
const Source = ({ account }: { account: AccountBalance }) => {
    const isCard = account.accountType === "CREDIT_CARD";
    if (account.balanceSource === "OPENING_BALANCE") {
        return <span className="ex-balance__meta">Tracked from {formatDate(account.openingBalanceDate!)}</span>;
    }
    return (
        <span className="ex-balance__meta">
            {account.balanceSource === "TRANSACTIONS" ? "Calculated from your transactions · " : "No transactions yet · "}
            <Link to={setBalanceLink(account.accountId)}>{isCard ? "Set amount owed" : "Set actual balance"}</Link>
        </span>
    );
};

/**
 * "Where do I stand right now?" — independent of the month picker.
 * Bank / cash / wallet: current balance. Credit cards: what you owe, what you've spent
 * this billing cycle, and how much of the limit is used.
 * Accounts without a starting balance are calculated from all their transactions.
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
    if (!accounts) return <BalancesSkeleton />;
    if (accounts.length === 0) return null;

    const money = accounts.filter((a) => a.accountType !== "CREDIT_CARD");
    const cards = accounts.filter((a) => a.accountType === "CREDIT_CARD");
    const sum = (list: AccountBalance[]) =>
        list.reduce((paise, a) => paise + Math.round(Number(a.balance) * 100), 0) / 100;
    const totalAvailable = sum(money);
    const totalOwed = sum(cards);
    const calculated = accounts.filter((a) => a.balanceSource === "TRANSACTIONS").length;

    return (
        <section className="ex-card ex-balances" aria-labelledby="balances-title">
            <div className="ex-balances__head">
                <div>
                    <h2 className="ex-card__title" id="balances-title">Balances</h2>
                    <p className="ex-card__sub">Right now, across all your accounts — not tied to the month below</p>
                </div>
                <div className="ex-balances__totals">
                    {money.length > 0 && (
                        <div>
                            <span className="ex-kpi__label">Available</span>
                            <span className={`ex-balances__big ${totalAvailable < 0 ? "ex-text--worse" : ""}`}>
                                {formatInrWhole(totalAvailable)}
                            </span>
                        </div>
                    )}
                    {cards.length > 0 && (
                        <div>
                            <span className="ex-kpi__label">Card dues</span>
                            <span className={`ex-balances__big ${totalOwed > 0 ? "ex-text--worse" : ""}`}>
                                {formatInrWhole(totalOwed)}
                            </span>
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
                        <span className={`ex-balance__value ${Number(a.balance) < 0 ? "ex-text--worse" : ""}`}>
                            {formatInrWhole(a.balance)}
                        </span>
                        <Source account={a} />
                    </div>
                ))}

                {cards.map((c) => {
                    const owed = Number(c.balance);
                    const used = c.creditLimit ? Math.min(Math.max(owed, 0) / Number(c.creditLimit), 1) : null;
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
                                    <span className={`ex-balance__value ${owed > 0 ? "ex-text--worse" : ""}`}>
                                        {formatInrWhole(owed)}
                                    </span>
                                </div>
                            </div>
                            {used !== null && (
                                <>
                                    <div className="ex-meter__track ex-meter__track--limit" aria-hidden="true">
                                        <span className={used >= 0.8 ? "is-high" : ""} style={{ width: `${used * 100}%` }}></span>
                                    </div>
                                    <span className="ex-balance__meta">
                                        {Math.round(used * 100)}% of {formatInrWhole(c.creditLimit!)} limit used
                                    </span>
                                </>
                            )}
                            <span className="ex-balance__meta">
                                {c.statementDay ? (
                                    `Cycle ${formatDate(c.cycleStart!)} – ${formatDate(c.nextStatementDate!)} · next statement ${formatDate(c.nextStatementDate!)}`
                                ) : (
                                    <>
                                        <Link to={setBalanceLink(c.accountId)}>Add a statement day</Link> to see your billing cycle
                                    </>
                                )}
                            </span>
                            <Source account={c} />
                        </div>
                    );
                })}
            </div>

            {calculated > 0 && (
                <p className="ex-balances__note">
                    {calculated === 1 ? "One balance is" : `${calculated} balances are`} calculated only from the transactions
                    you've recorded. If {calculated === 1 ? "it doesn't" : "they don't"} match your bank or card app, use
                    “Set actual balance” to enter the real figure once; transactions from that day on keep it up to date.
                </p>
            )}
        </section>
    );
};

export default Balances;
