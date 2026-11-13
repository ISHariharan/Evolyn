import "../Expenses.scss";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "../../../Store/GlobalStore/GlobalStore";
import { deleteTransaction, getTransactions } from "../../../API/Expenses/Transactions/api";
import { getAccounts } from "../../../API/Expenses/Accounts/api";
import { Account, accountLabel } from "../../../API/Expenses/Accounts/types";
import { getCategories } from "../../../API/Expenses/Categories/api";
import { Category } from "../../../API/Expenses/Categories/types";
import {
    Page,
    Transaction,
    TransactionType,
    paymentMethodLabel,
} from "../../../API/Expenses/Transactions/types";
import { PERIODS, Period, formatDate, formatInr, periodRange } from "../utils";
import CategoryIcon from "./CategoryIcon";

const PAGE_SIZE = 10;

type Tab = "ALL" | TransactionType;

const TransactionsList = () => {
    const { state } = useStore();
    const userId: string = state.userDetails?.id;
    const navigate = useNavigate();

    // Filters
    const [tab, setTab] = useState<Tab>("ALL");
    const [category, setCategory] = useState("");
    const [accountId, setAccountId] = useState("");
    const [period, setPeriod] = useState<Period>("THIS_MONTH");
    const [page, setPage] = useState(0);

    const [accounts, setAccounts] = useState<Account[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [result, setResult] = useState<Page<Transaction> | null>(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    const [openMenu, setOpenMenu] = useState<string | null>(null);
    const [reloadKey, setReloadKey] = useState(0);

    // Accounts and categories are needed for the filter dropdowns
    useEffect(() => {
        if (!userId) return;
        getAccounts(userId).then((r) => r.ok && r.data && setAccounts(r.data));
        getCategories(userId).then((r) => r.ok && r.data && setCategories(r.data));
    }, [userId]);

    // Re-fetch whenever any filter or the page changes.
    // If filters change again before the response arrives, the cleanup below marks
    // this request as stale, so a slow old response can't overwrite newer results.
    useEffect(() => {
        if (!userId) return;
        let stale = false;
        setLoading(true);
        getTransactions(userId, {
            type: tab === "ALL" ? undefined : tab,
            categoryId: category || undefined,
            accountId: accountId || undefined,
            ...periodRange(period),
            page,
            size: PAGE_SIZE,
        }).then((r) => {
            if (stale) return;
            if (r.ok && r.data) {
                setResult(r.data);
                setError("");
            } else {
                setError(r.errors.join(", "));
            }
            setLoading(false);
        });
        return () => {
            stale = true;
        };
    }, [userId, tab, category, accountId, period, page, reloadKey]);

    // Close the ⋮ menu when clicking anywhere else
    useEffect(() => {
        if (!openMenu) return;
        const close = () => setOpenMenu(null);
        document.addEventListener("click", close);
        return () => document.removeEventListener("click", close);
    }, [openMenu]);

    // Changing a filter jumps back to page 1
    const changeFilter = (apply: () => void) => {
        apply();
        setPage(0);
    };

    // Only the categories that fit the current tab
    const categoryOptions = tab === "ALL" ? categories : categories.filter((c) => c.type === tab);

    const handleDelete = async (t: Transaction) => {
        if (!window.confirm(`Delete ${t.merchant} (${formatInr(t.amount)})? This cannot be undone.`)) return;
        const r = await deleteTransaction(t.transactionId, userId);
        if (!r.ok) {
            window.alert(r.errors.join("\n"));
            return;
        }
        // If we deleted the last row on this page, step back a page
        if (result && result.items.length === 1 && page > 0) setPage(page - 1);
        else setReloadKey((k) => k + 1);
    };

    const items = result?.items ?? [];
    const firstRow = result && result.totalItems > 0 ? result.page * result.size + 1 : 0;
    const lastRow = result ? result.page * result.size + items.length : 0;

    return (
        <div className="ex-page">
            <header className="ex-header">
                <div>
                    <h1 className="ex-title">Transactions</h1>
                    <p className="ex-subtitle">View and manage all your income and expenses</p>
                </div>
                <button
                    type="button"
                    className="ex-btn ex-btn--primary"
                    onClick={() => navigate("/expenses/transactions/new")}
                >
                    <i className="bx bx-plus"></i> Add transaction
                </button>
            </header>

            <section className="ex-card">
                <div className="ex-tabs" role="tablist">
                    {(["ALL", "EXPENSE", "INCOME"] as Tab[]).map((t) => (
                        <button
                            key={t}
                            type="button"
                            role="tab"
                            aria-selected={tab === t}
                            className={tab === t ? "is-active" : ""}
                            onClick={() => changeFilter(() => { setTab(t); setCategory(""); })}
                        >
                            {t === "ALL" ? "All" : t === "EXPENSE" ? "Expense" : "Income"}
                        </button>
                    ))}
                </div>

                <div className="ex-filters">
                    <select
                        aria-label="Category"
                        value={category}
                        onChange={(e) => changeFilter(() => setCategory(e.target.value))}
                    >
                        <option value="">All categories</option>
                        {categoryOptions.map((c) => (
                            <option key={c.categoryId} value={c.categoryId}>
                                {c.name}{tab === "ALL" && c.type === "INCOME" ? " (income)" : ""}
                            </option>
                        ))}
                    </select>
                    <select
                        aria-label="Account"
                        value={accountId}
                        onChange={(e) => changeFilter(() => setAccountId(e.target.value))}
                    >
                        <option value="">All accounts</option>
                        {accounts.map((a) => (
                            <option key={a.accountId} value={a.accountId}>{accountLabel(a.name, a.last4)}</option>
                        ))}
                    </select>
                    <select
                        aria-label="Period"
                        value={period}
                        onChange={(e) => changeFilter(() => setPeriod(e.target.value as Period))}
                    >
                        {PERIODS.map((p) => (
                            <option key={p.value} value={p.value}>{p.label}</option>
                        ))}
                    </select>
                </div>

                {error && <p className="ex-errors" role="alert">{error}</p>}

                {!error && !loading && items.length === 0 && (
                    <div className="ex-empty">
                        <i className="bx bx-receipt"></i>
                        <p className="ex-muted">No transactions for these filters.</p>
                        <button
                            type="button"
                            className="ex-btn ex-btn--secondary"
                            onClick={() => navigate("/expenses/transactions/new")}
                        >
                            Add a transaction
                        </button>
                    </div>
                )}

                {items.length > 0 && (
                    <div className="ex-table-wrap">
                        <table className="ex-table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Merchant / Description</th>
                                    <th>Category</th>
                                    <th>Account</th>
                                    <th>Payment method</th>
                                    <th className="ex-num">Amount</th>
                                    <th>Type</th>
                                    <th><span className="sr-only">Actions</span></th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map((t) => (
                                    <tr key={t.transactionId} onClick={() => navigate(`/expenses/transactions/${t.transactionId}`)}>
                                        <td>{formatDate(t.transactionDate)}</td>
                                        <td>{t.merchant}</td>
                                        <td>
                                            <span className="ex-category">
                                                <CategoryIcon icon={t.categoryIcon} color={t.categoryColor} />
                                                {t.categoryName}
                                            </span>
                                        </td>
                                        <td>{accountLabel(t.accountName, t.accountLast4)}</td>
                                        <td>{paymentMethodLabel(t.paymentMethod)}</td>
                                        <td className={`ex-num ${t.type === "EXPENSE" ? "ex-amount--expense" : "ex-amount--income"}`}>
                                            {formatInr(t.amount)}
                                        </td>
                                        <td>
                                            <span className={`ex-badge ${t.type === "EXPENSE" ? "ex-badge--expense" : "ex-badge--income"}`}>
                                                {t.type === "EXPENSE" ? "Expense" : "Income"}
                                            </span>
                                        </td>
                                        <td onClick={(e) => e.stopPropagation()}>
                                            <div className="ex-actions">
                                                <button
                                                    type="button"
                                                    className="ex-icon-btn"
                                                    aria-label={`Actions for ${t.merchant}`}
                                                    aria-expanded={openMenu === t.transactionId}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setOpenMenu(openMenu === t.transactionId ? null : t.transactionId);
                                                    }}
                                                >
                                                    <i className="bx bx-dots-vertical-rounded"></i>
                                                </button>
                                                {openMenu === t.transactionId && (
                                                    <div className="ex-menu" role="menu">
                                                        <button type="button" role="menuitem" onClick={() => navigate(`/expenses/transactions/${t.transactionId}`)}>
                                                            <i className="bx bx-show"></i> View
                                                        </button>
                                                        <button type="button" role="menuitem" onClick={() => navigate(`/expenses/transactions/${t.transactionId}/edit`)}>
                                                            <i className="bx bx-edit-alt"></i> Edit
                                                        </button>
                                                        <button type="button" role="menuitem" className="ex-menu__danger" onClick={() => handleDelete(t)}>
                                                            <i className="bx bx-trash"></i> Delete
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {result && result.totalItems > 0 && (
                    <div className="ex-pagination">
                        <span>
                            Showing {firstRow} to {lastRow} of {result.totalItems} transaction{result.totalItems === 1 ? "" : "s"}
                        </span>
                        {result.totalPages > 1 && (
                            <div className="ex-pages">
                                <button type="button" aria-label="Previous page" disabled={page === 0} onClick={() => setPage(page - 1)}>
                                    <i className="bx bx-chevron-left"></i>
                                </button>
                                {Array.from({ length: result.totalPages }, (_, i) => i)
                                    // show first, last, and pages next to the current one
                                    .filter((i) => i === 0 || i === result.totalPages - 1 || Math.abs(i - page) <= 1)
                                    .map((i, idx, shown) => (
                                        <span key={i} style={{ display: "contents" }}>
                                            {idx > 0 && i - shown[idx - 1] > 1 && <span aria-hidden="true">…</span>}
                                            <button
                                                type="button"
                                                className={i === page ? "is-active" : ""}
                                                aria-current={i === page ? "page" : undefined}
                                                onClick={() => setPage(i)}
                                            >
                                                {i + 1}
                                            </button>
                                        </span>
                                    ))}
                                <button
                                    type="button"
                                    aria-label="Next page"
                                    disabled={page >= result.totalPages - 1}
                                    onClick={() => setPage(page + 1)}
                                >
                                    <i className="bx bx-chevron-right"></i>
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </section>
        </div>
    );
};

export default TransactionsList;
