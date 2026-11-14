import "../Expenses.scss";
import { FormEvent, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useStore } from "../../../Store/GlobalStore/GlobalStore";
import { createAccount, deleteAccount, getAccounts, updateAccount } from "../../../API/Expenses/Accounts/api";
import { ACCOUNT_TYPES, Account, AccountType, accountTypeMeta } from "../../../API/Expenses/Accounts/types";
import { formatDate, todayLocal } from "../utils";
import { AccountListSkeleton } from "../Skeletons";

const emptyForm = () => ({
    name: "",
    accountType: "BANK" as AccountType,
    last4: "",
    openingBalance: "",
    openingBalanceDate: todayLocal(),
    creditLimit: "",
    statementDay: "",
});

// "" -> null, otherwise a number (form inputs hold strings)
const numOrNull = (v: string) => (v.trim() === "" ? null : Number(v));

const Accounts = () => {
    const { state } = useStore();
    const userId: string = state.userDetails?.id;

    const [accounts, setAccounts] = useState<Account[]>([]);
    const [loading, setLoading] = useState(true);
    const [listError, setListError] = useState("");

    // null = adding a new account; otherwise the account being edited
    const [editing, setEditing] = useState<Account | null>(null);
    const [form, setForm] = useState(emptyForm);
    const isCard = form.accountType === "CREDIT_CARD";
    const [formErrors, setFormErrors] = useState<string[]>([]);
    const [saving, setSaving] = useState(false);

    // ?edit=<accountId> (from the dashboard's "Set actual balance") opens that account
    const [searchParams, setSearchParams] = useSearchParams();
    const formRef = useRef<HTMLFormElement>(null);

    useEffect(() => {
        if (!userId) return;
        getAccounts(userId).then((result) => {
            if (result.ok && result.data) {
                setAccounts(result.data);
                const target = result.data.find((a) => a.accountId === searchParams.get("edit"));
                if (target) {
                    startEdit(target);
                    setSearchParams({}, { replace: true }); // don't reopen it on refresh
                    // Bring the form into view and put the cursor in the balance field
                    setTimeout(() => {
                        formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
                        formRef.current?.querySelector<HTMLInputElement>("input[name=openingBalance]")?.focus();
                    }, 50);
                }
            } else {
                setListError(result.errors.join(", "));
            }
            setLoading(false);
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userId]);

    const startEdit = (account: Account) => {
        setEditing(account);
        setForm({
            name: account.name,
            accountType: account.accountType,
            last4: account.last4 ?? "",
            openingBalance: account.openingBalance == null ? "" : String(account.openingBalance),
            openingBalanceDate: account.openingBalanceDate ?? todayLocal(),
            creditLimit: account.creditLimit == null ? "" : String(account.creditLimit),
            statementDay: account.statementDay == null ? "" : String(account.statementDay),
        });
        setFormErrors([]);
    };

    const resetForm = () => {
        setEditing(null);
        setForm(emptyForm());
        setFormErrors([]);
    };

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        setSaving(true);
        setFormErrors([]);
        const input = {
            name: form.name.trim(),
            accountType: form.accountType,
            last4: form.accountType === "CASH" ? "" : form.last4.trim(),
            openingBalance: numOrNull(form.openingBalance),
            openingBalanceDate: form.openingBalance.trim() === "" ? null : form.openingBalanceDate,
            creditLimit: isCard ? numOrNull(form.creditLimit) : null,
            statementDay: isCard ? numOrNull(form.statementDay) : null,
        };
        const result = editing
            ? await updateAccount(editing.accountId, input, userId)
            : await createAccount(input, userId);

        if (result.ok && result.data) {
            const saved = result.data;
            setAccounts((prev) =>
                editing ? prev.map((a) => (a.accountId === saved.accountId ? saved : a)) : [...prev, saved]
            );
            resetForm();
        } else {
            setFormErrors(result.errors);
        }
        setSaving(false);
    };

    const handleDelete = async (account: Account) => {
        if (!window.confirm(`Delete "${account.name}"? This cannot be undone.`)) return;
        const result = await deleteAccount(account.accountId, userId);
        if (result.ok) {
            setAccounts((prev) => prev.filter((a) => a.accountId !== account.accountId));
            if (editing?.accountId === account.accountId) resetForm();
        } else {
            // e.g. 409: "This account has 3 transaction(s)..."
            window.alert(result.errors.join("\n"));
        }
    };

    return (
        <div className="ex-page">
            <header className="ex-header">
                <div>
                    <h1 className="ex-title">Accounts</h1>
                    <p className="ex-subtitle">
                        Your bank accounts, cards, cash and wallets. Every transaction belongs to one of these.
                    </p>
                </div>
            </header>

            <div className="ex-two-col">
                <section className="ex-card">
                    <h2 className="ex-card__title">Your accounts</h2>
                    {loading && <AccountListSkeleton />}
                    {!loading && listError && <p className="ex-errors" role="alert">{listError}</p>}
                    {!loading && !listError && accounts.length === 0 && (
                        <p className="ex-muted">No accounts yet. Add your first one using the form.</p>
                    )}
                    <ul className="ex-account-list">
                        {accounts.map((account) => {
                            const meta = accountTypeMeta(account.accountType);
                            return (
                                <li key={account.accountId} className="ex-account">
                                    <span className="ex-category__icon" aria-hidden="true">
                                        <i className={meta.icon}></i>
                                    </span>
                                    <div className="ex-account__main">
                                        <span className="ex-account__name">{account.name}</span>
                                        <span className="ex-account__meta">
                                            {meta.label}
                                            {account.last4 ? ` · •••• ${account.last4}` : ""}
                                            {account.openingBalanceDate
                                                ? ` · tracked from ${formatDate(account.openingBalanceDate)}`
                                                : " · balance from transactions"}
                                        </span>
                                    </div>
                                    <button
                                        type="button"
                                        className="ex-icon-btn"
                                        aria-label={`Edit ${account.name}`}
                                        onClick={() => startEdit(account)}
                                    >
                                        <i className="bx bx-edit-alt"></i>
                                    </button>
                                    <button
                                        type="button"
                                        className="ex-icon-btn"
                                        aria-label={`Delete ${account.name}`}
                                        onClick={() => handleDelete(account)}
                                    >
                                        <i className="bx bx-trash"></i>
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                </section>

                <form className="ex-card" onSubmit={handleSubmit} ref={formRef}>
                    <h2 className="ex-card__title">{editing ? `Edit ${editing.name}` : "Add account"}</h2>

                    <label className="ex-field">
                        <span>Account name <span className="ex-required">*</span></span>
                        <input
                            type="text"
                            maxLength={60}
                            placeholder="e.g. HDFC Bank, ICICI Credit Card"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            required
                        />
                    </label>

                    <label className="ex-field">
                        <span>Type <span className="ex-required">*</span></span>
                        <select
                            value={form.accountType}
                            onChange={(e) => setForm({ ...form, accountType: e.target.value as AccountType })}
                        >
                            {ACCOUNT_TYPES.map((t) => (
                                <option key={t.value} value={t.value}>{t.label}</option>
                            ))}
                        </select>
                    </label>

                    {form.accountType !== "CASH" && (
                        <label className="ex-field">
                            <span>Last 4 digits (optional)</span>
                            <input
                                type="text"
                                inputMode="numeric"
                                pattern="\d{4}"
                                maxLength={4}
                                placeholder="1234"
                                value={form.last4}
                                onChange={(e) => setForm({ ...form, last4: e.target.value.replace(/\D/g, "") })}
                            />
                        </label>
                    )}

                    <fieldset className="ex-fieldset">
                        <legend>{isCard ? "Amount owed" : "Balance"} (optional)</legend>
                        <p className="ex-muted ex-fieldset__hint">
                            {isCard
                                ? "Leave empty to calculate it from your transactions. Or enter what you owed at the start of a date: purchases from then on add to it, bill payments and refunds reduce it."
                                : "Leave empty to calculate it from your transactions. Or enter the real balance at the start of a date: every transaction from that day on updates it."}
                        </p>
                        <div className="ex-row">
                            <label className="ex-field">
                                <span>{isCard ? "Owed (₹)" : "Balance (₹)"}</span>
                                <input
                                    name="openingBalance"
                                    type="number"
                                    inputMode="decimal"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={form.openingBalance}
                                    onChange={(e) => setForm({ ...form, openingBalance: e.target.value })}
                                />
                            </label>
                            <label className="ex-field">
                                <span>On</span>
                                <input
                                    type="date"
                                    max={todayLocal()}
                                    value={form.openingBalanceDate}
                                    onChange={(e) => setForm({ ...form, openingBalanceDate: e.target.value })}
                                />
                            </label>
                        </div>
                    </fieldset>

                    {isCard && (
                        <div className="ex-row">
                            <label className="ex-field">
                                <span>Credit limit (₹, optional)</span>
                                <input
                                    type="number"
                                    inputMode="decimal"
                                    min="0"
                                    step="0.01"
                                    placeholder="100000"
                                    value={form.creditLimit}
                                    onChange={(e) => setForm({ ...form, creditLimit: e.target.value })}
                                />
                            </label>
                            <label className="ex-field">
                                <span>Statement day (optional)</span>
                                <input
                                    type="number"
                                    inputMode="numeric"
                                    min="1"
                                    max="28"
                                    placeholder="e.g. 15"
                                    value={form.statementDay}
                                    onChange={(e) => setForm({ ...form, statementDay: e.target.value })}
                                />
                            </label>
                        </div>
                    )}

                    {formErrors.length > 0 && (
                        <ul className="ex-errors" role="alert">
                            {formErrors.map((err) => <li key={err}>{err}</li>)}
                        </ul>
                    )}

                    <div className="ex-form-actions">
                        {editing && (
                            <button type="button" className="ex-btn ex-btn--secondary" onClick={resetForm}>
                                Cancel
                            </button>
                        )}
                        <button type="submit" className="ex-btn ex-btn--primary" disabled={saving || !userId}>
                            {saving ? "Saving…" : editing ? "Save changes" : "Add account"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Accounts;
