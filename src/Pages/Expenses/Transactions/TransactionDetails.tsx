import "../Expenses.scss";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useStore } from "../../../Store/GlobalStore/GlobalStore";
import { deleteTransaction, getTransaction } from "../../../API/Expenses/Transactions/api";
import { Transaction, paymentMethodLabel } from "../../../API/Expenses/Transactions/types";
import { accountLabel } from "../../../API/Expenses/Accounts/types";
import { formatDate, formatDateTime, formatInr } from "../utils";
import CategoryIcon from "./CategoryIcon";
import { DetailsSkeleton } from "../Skeletons";

const TransactionDetails = () => {
    const { state } = useStore();
    const userId: string = state.userDetails?.id;
    const navigate = useNavigate();
    const { transactionId } = useParams();

    const [transaction, setTransaction] = useState<Transaction | null>(null);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!userId || !transactionId) return;
        getTransaction(transactionId, userId).then((r) => {
            if (r.ok && r.data) setTransaction(r.data);
            else setError(r.errors.join(", "));
        });
    }, [userId, transactionId]);

    const handleDelete = async () => {
        if (!transaction) return;
        if (!window.confirm(`Delete ${transaction.merchant} (${formatInr(transaction.amount)})? This cannot be undone.`)) return;
        const r = await deleteTransaction(transaction.transactionId, userId);
        if (r.ok) navigate("/expenses/transactions");
        else setError(r.errors.join(", "));
    };

    const t = transaction;
    const isExpense = t?.type === "EXPENSE";
    const isTransfer = t?.type === "TRANSFER";
    const typeLabel = isExpense ? "Expense" : isTransfer ? "Transfer" : "Income";

    return (
        <div className="ex-page">
            <header className="ex-header">
                <div>
                    <button type="button" className="ex-back" onClick={() => navigate("/expenses/transactions")}>
                        <i className="bx bx-arrow-back"></i> Transactions
                    </button>
                    <h1 className="ex-title">Transaction details</h1>
                    <p className="ex-subtitle">View detailed information about this transaction</p>
                </div>
            </header>

            {error && <p className="ex-errors" role="alert">{error}</p>}
            {!error && !t && <DetailsSkeleton />}

            {t && (
                <div className="ex-details">
                    <section className="ex-card ex-hero">
                        <CategoryIcon icon={t.categoryIcon} color={t.categoryColor} />
                        <p className="ex-hero__merchant">{t.merchant}</p>
                        <span className={`ex-badge ex-badge--${t.type.toLowerCase()}`}>{typeLabel}</span>
                        <p className={`ex-hero__amount ${t.type === "INCOME" ? "ex-amount--income" : ""}`}>{formatInr(t.amount)}</p>
                        <span className="ex-muted">{formatDate(t.transactionDate)}</span>
                        <div className="ex-hero__actions">
                            <button
                                type="button"
                                className="ex-btn ex-btn--secondary"
                                onClick={() => navigate(`/expenses/transactions/${t.transactionId}/edit`)}
                            >
                                Edit
                            </button>
                            <button type="button" className="ex-btn ex-btn--danger" onClick={handleDelete}>
                                Delete
                            </button>
                        </div>
                    </section>

                    <section className="ex-card">
                        <h2 className="ex-card__title">Details</h2>
                        <dl className="ex-dl">
                            <dt>{isTransfer ? "From" : "Account"}</dt>
                            <dd>{accountLabel(t.accountName, t.accountLast4)}</dd>
                            {isTransfer ? (
                                <>
                                    <dt>To</dt>
                                    <dd>{t.toAccountName ? accountLabel(t.toAccountName, t.toAccountLast4) : "—"}</dd>
                                </>
                            ) : (
                                <>
                                    <dt>Category</dt>
                                    <dd>{t.categoryName}</dd>
                                </>
                            )}
                            <dt>Type</dt>
                            <dd>{typeLabel}</dd>
                            <dt>Payment method</dt>
                            <dd>{paymentMethodLabel(t.paymentMethod)}</dd>
                            <dt>Date</dt>
                            <dd>{formatDate(t.transactionDate)}</dd>
                            <dt>{isExpense ? "Merchant" : isTransfer ? "Description" : "Source"}</dt>
                            <dd>{t.merchant}</dd>
                            <dt>Notes</dt>
                            <dd>{t.notes || "—"}</dd>
                            <dt>Added</dt>
                            <dd>{formatDateTime(t.createdAt)}</dd>
                            {t.updatedAt !== t.createdAt && (
                                <>
                                    <dt>Last edited</dt>
                                    <dd>{formatDateTime(t.updatedAt)}</dd>
                                </>
                            )}
                        </dl>
                    </section>
                </div>
            )}
        </div>
    );
};

export default TransactionDetails;
