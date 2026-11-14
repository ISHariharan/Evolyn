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
import { getCategories } from "../../../API/Expenses/Categories/api";
import { Category } from "../../../API/Expenses/Categories/types";
import {
    PAYMENT_METHODS,
    PaymentMethod,
    TransactionKind,
} from "../../../API/Expenses/Transactions/types";
import { todayLocal } from "../utils";
import { FormSkeleton } from "../Skeletons";

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
    const [allCategories, setAllCategories] = useState<Category[]>([]);
    const [loadError, setLoadError] = useState("");

    // Form fields
    const [type, setType] = useState<TransactionKind>("EXPENSE");
    const [toAccountId, setToAccountId] = useState(""); // TRANSFER only
    const [amount, setAmount] = useState("");
    const [categoryId, setCategoryId] = useState("");
    const [merchant, setMerchant] = useState("");
    const [notes, setNotes] = useState("");
    const [accountId, setAccountId] = useState("");
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("UPI");
    const [transactionDate, setTransactionDate] = useState(todayLocal());

    const [errors, setErrors] = useState<string[]>([]);
    const [saving, setSaving] = useState(false);

    // Load accounts and categories (and, when editing, the transaction itself)
    useEffect(() => {
        if (!userId) return;
        const load = async () => {
            const [accountsResult, categoriesResult] = await Promise.all([
                getAccounts(userId),
                getCategories(userId),
            ]);
            if (!accountsResult.ok || !accountsResult.data) {
                setLoadError(accountsResult.errors.join(", "));
                return;
            }
            if (!categoriesResult.ok || !categoriesResult.data) {
                setLoadError(categoriesResult.errors.join(", "));
                return;
            }
            const list = accountsResult.data;
            const cats = categoriesResult.data;
            setAllCategories(cats);
            setAccounts(list);

            if (!transactionId) {
                if (list.length > 0) {
                    setAccountId(list[0].accountId);
                    setPaymentMethod(defaultMethodFor(list[0].accountType));
                }
                setCategoryId(cats.find((c) => c.type === "EXPENSE")?.categoryId ?? "");
                return;
            }

            const t = await getTransaction(transactionId, userId);
            if (!t.ok || !t.data) {
                setLoadError(t.errors.join(", "));
                return;
            }
            setType(t.data.type);
            setAmount(String(t.data.amount));
            setCategoryId(t.data.categoryId ?? "");
            setMerchant(t.data.merchant);
            setNotes(t.data.notes ?? "");
            setAccountId(t.data.accountId);
            setToAccountId(t.data.toAccountId ?? "");
            setPaymentMethod(t.data.paymentMethod);
            setTransactionDate(t.data.transactionDate);
        };
        load();
    }, [userId, transactionId]);

    const isTransfer = type === "TRANSFER";

    // The user's own categories for the chosen type (transfers have none)
    const categories = isTransfer ? [] : allCategories.filter((c) => c.type === type);

    // A sensible "to" account for a transfer: a credit card (paying its bill) if there
    // is one, otherwise any other account
    const defaultToAccount = (fromId: string) =>
        (accounts ?? []).find((a) => a.accountId !== fromId && a.accountType === "CREDIT_CARD")?.accountId ??
        (accounts ?? []).find((a) => a.accountId !== fromId)?.accountId ??
        "";

    const switchType = (next: TransactionKind) => {
        setType(next);
        if (next === "TRANSFER") {
            setCategoryId("");
            if (!toAccountId || toAccountId === accountId) setToAccountId(defaultToAccount(accountId));
            setPaymentMethod("NET_BANKING");
        } else {
            setCategoryId(allCategories.find((c) => c.type === next)?.categoryId ?? "");
        }
    };

    const changeAccount = (id: string) => {
        setAccountId(id);
        if (isTransfer && id === toAccountId) setToAccountId(defaultToAccount(id));
        const account = accounts?.find((a) => a.accountId === id);
        if (account && !isTransfer) setPaymentMethod(defaultMethodFor(account.accountType));
    };

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        setSaving(true);
        setErrors([]);

        const input = {
            type,
            amount: Number(amount),
            categoryId: isTransfer ? undefined : categoryId,
            toAccountId: isTransfer ? toAccountId : undefined,
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

    const noun = type === "EXPENSE" ? "Expense" : type === "INCOME" ? "Income" : "Transfer";
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
            {!loadError && accounts === null && <FormSkeleton />}

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
                    <div className="ex-type-toggle ex-type-toggle--three" role="group" aria-label="Transaction type">
                        {(["EXPENSE", "INCOME", "TRANSFER"] as TransactionKind[]).map((t) => (
                            <button
                                key={t}
                                type="button"
                                className={type === t ? "is-active" : ""}
                                aria-pressed={type === t}
                                onClick={() => switchType(t)}
                            >
                                {t === "EXPENSE" ? "Expense" : t === "INCOME" ? "Income" : "Transfer"}
                            </button>
                        ))}
                    </div>

                    {/* Recording a transfer as an expense would count the same money twice */}
                    <p className="ex-hint">
                        <i className="bx bx-info-circle" aria-hidden="true"></i>
                        {isTransfer ? (
                            <span>
                                Money moving between your own accounts: paying a credit card bill, withdrawing cash,
                                topping up a wallet. Both balances update, and it isn't counted as income or spending.
                            </span>
                        ) : (
                            <span>
                                Paying a credit card bill or moving money between your own accounts?{" "}
                                <button type="button" className="ex-link ex-link--inline" onClick={() => switchType("TRANSFER")}>
                                    Record it as a transfer
                                </button>{" "}
                                so the spending isn't counted twice.
                            </span>
                        )}
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

                            {!isTransfer && (
                                <label className="ex-field">
                                    <span>Category <span className="ex-required">*</span></span>
                                    <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} required>
                                        {categories.map((c) => (
                                            <option key={c.categoryId} value={c.categoryId}>{c.name}</option>
                                        ))}
                                    </select>
                                    <Link className="ex-field__link" to="/expenses/categories">Manage categories</Link>
                                </label>
                            )}

                            <label className="ex-field">
                                <span>{type === "EXPENSE" ? "Merchant / Description" : type === "INCOME" ? "Source / Description" : "Description"} <span className="ex-required">*</span></span>
                                <input
                                    type="text"
                                    maxLength={100}
                                    placeholder={type === "EXPENSE" ? "e.g. Swiggy" : type === "INCOME" ? "e.g. Acme Corp salary" : "e.g. ICICI card bill"}
                                    value={merchant}
                                    onChange={(e) => setMerchant(e.target.value)}
                                    required
                                />
                            </label>

                            <label className="ex-field">
                                <span>Notes (optional)</span>
                                <textarea
                                    maxLength={500}
                                    placeholder={type === "EXPENSE" ? "e.g. Lunch with team" : type === "INCOME" ? "e.g. November salary" : "e.g. October statement"}
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                />
                            </label>
                        </section>

                        <section className="ex-card">
                            <h2 className="ex-card__title">Payment details</h2>

                            <label className="ex-field">
                                <span>{isTransfer ? "From account" : "Account"} <span className="ex-required">*</span></span>
                                <select value={accountId} onChange={(e) => changeAccount(e.target.value)} required>
                                    {accounts.map((a) => (
                                        <option key={a.accountId} value={a.accountId}>{accountLabel(a.name, a.last4)}</option>
                                    ))}
                                </select>
                            </label>

                            {isTransfer && (
                                <label className="ex-field">
                                    <span>To account <span className="ex-required">*</span></span>
                                    {accounts.length < 2 ? (
                                        <p className="ex-errors">
                                            A transfer needs two accounts. <Link to="/expenses/accounts">Add another account</Link>.
                                        </p>
                                    ) : (
                                        <select value={toAccountId} onChange={(e) => setToAccountId(e.target.value)} required>
                                            {accounts
                                                .filter((a) => a.accountId !== accountId)
                                                .map((a) => (
                                                    <option key={a.accountId} value={a.accountId}>{accountLabel(a.name, a.last4)}</option>
                                                ))}
                                        </select>
                                    )}
                                </label>
                            )}

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
