import "../Expenses.scss";
import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useStore } from "../../../Store/GlobalStore/GlobalStore";
import {
    createTransaction,
    deleteTransaction,
    getTransaction,
    updateTransaction,
} from "../../../API/Expenses/Transactions/api";
import { getAccounts } from "../../../API/Expenses/Accounts/api";
import { Account, AccountType, accountLabel } from "../../../API/Expenses/Accounts/types";
import {
    EXPENSE_CATEGORIES,
    INCOME_CATEGORIES,
    PAYMENT_METHODS,
    PaymentMethod,
    TransactionType,
} from "../../../API/Expenses/Transactions/types";
import { todayLocal } from "../utils";

// A sensible payment method when the user picks an account
const defaultMethodFor = (accountType: AccountType): PaymentMethod =>
    accountType === "CREDIT_CARD" ? "CREDIT_CARD" : accountType === "CASH" ? "CASH" : "UPI";

/**
 * One component for both screens:
 *   /expenses/transactions/new         -> Add
 *   /expenses/transactions/:id/edit    -> Edit (loads the row first, adds Delete)
 */
const TransactionForm = () => {
    const { state } = useStore();
    const userId: string = state.userDetails?.id;
    const navigate = useNavigate();
    const { transactionId } = useParams();
    const isEdit = Boolean(transactionId);

    const [accounts, setAccounts] = useState<Account[] | null>(null);
    const [loadError, setLoadError] = useState("");

    // Form fields
    const [type, setType] = useState<TransactionType>("EXPENSE");
    const [amount, setAmount] = useState("");
    const [category, setCategory] = useState(EXPENSE_CATEGORIES[0].name);
    const [merchant, setMerchant] = useState("");
    const [notes, setNotes] = useState("");
    const [accountId, setAccountId] = useState("");
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("UPI");
    const [transactionDate, setTransactionDate] = useState(todayLocal());

    const [errors, setErrors] = useState<string[]>([]);
    const [saving, setSaving] = useState(false);

    // Load accounts (and, when editing, the transaction itself)
    useEffect(() => {
        if (!userId) return;
        const load = async () => {
            const accountsResult = await getAccounts(userId);
            if (!accountsResult.ok || !accountsResult.data) {
                setLoadError(accountsResult.errors.join(", "));
                return;
            }
            const list = accountsResult.data;
            setAccounts(list);

            if (!transactionId) {
                if (list.length > 0) {
                    setAccountId(list[0].accountId);
                    setPaymentMethod(defaultMethodFor(list[0].accountType));
                }
                return;
            }

            const t = await getTransaction(transactionId, userId);
            if (!t.ok || !t.data) {
                setLoadError(t.errors.join(", "));
                return;
            }
            setType(t.data.type);
            setAmount(String(t.data.amount));
            setCategory(t.data.category);
            setMerchant(t.data.merchant);
            setNotes(t.data.notes ?? "");
            setAccountId(t.data.accountId);
            setPaymentMethod(t.data.paymentMethod);
            setTransactionDate(t.data.transactionDate);
        };
        load();
    }, [userId, transactionId]);

    const categories = type === "EXPENSE" ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

    const switchType = (next: TransactionType) => {
        setType(next);
        setCategory((next === "EXPENSE" ? EXPENSE_CATEGORIES : INCOME_CATEGORIES)[0].name);
    };

    const changeAccount = (id: string) => {
        setAccountId(id);
        const account = accounts?.find((a) => a.accountId === id);
        if (account) setPaymentMethod(defaultMethodFor(account.accountType));
    };

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        setSaving(true);
        setErrors([]);

        const input = {
            type,
            amount: Number(amount),
            category,
            merchant: merchant.trim(),
            notes: notes.trim() || undefined,
            accountId,
            paymentMethod,
            transactionDate,
        };
        const result = transactionId
            ? await updateTransaction(transactionId, input, userId)
            : await createTransaction(input, userId);

        setSaving(false);
        if (result.ok && result.data) {
            navigate(`/expenses/transactions/${result.data.transactionId}`);
        } else {
            setErrors(result.errors);
        }
    };

    const handleDelete = async () => {
        if (!transactionId) return;
        if (!window.confirm(`Delete ${merchant || "this transaction"}? This cannot be undone.`)) return;
        const result = await deleteTransaction(transactionId, userId);
        if (result.ok) navigate("/expenses/transactions");
        else setErrors(result.errors);
    };

    const noun = type === "EXPENSE" ? "Expense" : "Income";
    const title = isEdit ? `Edit ${noun}` : `Add ${noun}`;

    return (
        <div className="ex-page">
            <header className="ex-header">
                <div>
                    <button type="button" className="ex-back" onClick={() => navigate(-1)}>
                        <i className="bx bx-arrow-back"></i> Back
                    </button>
                    <h1 className="ex-title">{title}</h1>
                    <p className="ex-subtitle">
                        {isEdit ? `Update ${noun.toLowerCase()} details` : `Record a new ${noun.toLowerCase()}`}
                    </p>
                </div>
            </header>

            {loadError && <p className="ex-errors" role="alert">{loadError}</p>}
            {!loadError && accounts === null && <p className="ex-muted">Loading…</p>}

            {/* Every transaction needs an account, so ask for one first */}
            {accounts !== null && accounts.length === 0 && (
                <div className="ex-card ex-empty">
                    <i className="bx bx-credit-card"></i>
                    <p className="ex-muted">Add a bank account, card or cash account before recording transactions.</p>
                    <Link className="ex-btn ex-btn--primary" to="/expenses/accounts">Add an account</Link>
                </div>
            )}

            {accounts !== null && accounts.length > 0 && (
                <form onSubmit={handleSubmit}>
                    <div className="ex-type-toggle" role="group" aria-label="Transaction type">
                        {(["EXPENSE", "INCOME"] as TransactionType[]).map((t) => (
                            <button
                                key={t}
                                type="button"
                                className={type === t ? "is-active" : ""}
                                aria-pressed={type === t}
                                onClick={() => switchType(t)}
                            >
                                {t === "EXPENSE" ? "Expense" : "Income"}
                            </button>
                        ))}
                    </div>

                    {/* Recording a transfer as an expense counts the same money twice on the dashboard */}
                    <p className="ex-hint">
                        <i className="bx bx-info-circle" aria-hidden="true"></i>
                        Paying a credit card bill or moving money between your own accounts? Don't add it here.
                        The card purchases are already counted, so it would count the same spending twice.
                    </p>

                    <div className="ex-two-col">
                        <section className="ex-card">
                            <h2 className="ex-card__title">{noun} details</h2>

                            <label className="ex-field">
                                <span>Amount <span className="ex-required">*</span></span>
                                <div className="ex-money">
                                    <input
                                        type="number"
                                        inputMode="decimal"
                                        min="0.01"
                                        step="0.01"
                                        placeholder="0.00"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        required
                                    />
                                    <span>INR</span>
                                </div>
                            </label>

                            <label className="ex-field">
                                <span>Category <span className="ex-required">*</span></span>
                                <select value={category} onChange={(e) => setCategory(e.target.value)}>
                                    {categories.map((c) => (
                                        <option key={c.name} value={c.name}>{c.name}</option>
                                    ))}
                                    {/* keep an old/unknown category selectable when editing */}
                                    {!categories.some((c) => c.name === category) && <option value={category}>{category}</option>}
                                </select>
                            </label>

                            <label className="ex-field">
                                <span>{type === "EXPENSE" ? "Merchant / Description" : "Source / Description"} <span className="ex-required">*</span></span>
                                <input
                                    type="text"
                                    maxLength={100}
                                    placeholder={type === "EXPENSE" ? "e.g. Swiggy" : "e.g. Acme Corp salary"}
                                    value={merchant}
                                    onChange={(e) => setMerchant(e.target.value)}
                                    required
                                />
                            </label>

                            <label className="ex-field">
                                <span>Notes (optional)</span>
                                <textarea
                                    maxLength={500}
                                    placeholder={type === "EXPENSE" ? "e.g. Lunch with team" : "e.g. November salary"}
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                />
                            </label>
                        </section>

                        <section className="ex-card">
                            <h2 className="ex-card__title">Payment details</h2>

                            <label className="ex-field">
                                <span>Account <span className="ex-required">*</span></span>
                                <select value={accountId} onChange={(e) => changeAccount(e.target.value)} required>
                                    {accounts.map((a) => (
                                        <option key={a.accountId} value={a.accountId}>{accountLabel(a.name, a.last4)}</option>
                                    ))}
                                </select>
                            </label>

                            <label className="ex-field">
                                <span>Payment method <span className="ex-required">*</span></span>
                                <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}>
                                    {PAYMENT_METHODS.map((m) => (
                                        <option key={m.value} value={m.value}>{m.label}</option>
                                    ))}
                                </select>
                            </label>

                            <label className="ex-field">
                                <span>Date <span className="ex-required">*</span></span>
                                <input
                                    type="date"
                                    value={transactionDate}
                                    max={todayLocal()}
                                    onChange={(e) => setTransactionDate(e.target.value)}
                                    required
                                />
                            </label>

                            {errors.length > 0 && (
                                <ul className="ex-errors" role="alert">
                                    {errors.map((err) => <li key={err}>{err}</li>)}
                                </ul>
                            )}

                            <div className="ex-form-actions">
                                <button type="button" className="ex-btn ex-btn--secondary" onClick={() => navigate(-1)}>
                                    Cancel
                                </button>
                                {isEdit && (
                                    <button type="button" className="ex-btn ex-btn--danger" onClick={handleDelete}>
                                        Delete
                                    </button>
                                )}
                                <button type="submit" className="ex-btn ex-btn--primary" disabled={saving}>
                                    {saving ? "Saving…" : isEdit ? `Update ${noun}` : `Save ${noun}`}
                                </button>
                            </div>
                        </section>
                    </div>
                </form>
            )}
        </div>
    );
};

export default TransactionForm;
