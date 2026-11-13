import "../Expenses.scss";
import { useEffect, useState } from "react";
import { useStore } from "../../../Store/GlobalStore/GlobalStore";
import { createCategory, deleteCategory, getCategories, updateCategory } from "../../../API/Expenses/Categories/api";
import { Category, CategoryInput } from "../../../API/Expenses/Categories/types";
import { TransactionType } from "../../../API/Expenses/Transactions/types";
import CategoryIcon from "../Transactions/CategoryIcon";
import { CategoryFormDialog, DeleteCategoryDialog } from "./CategoryDialogs";

type Dialog =
    | { kind: "add" }
    | { kind: "edit"; category: Category }
    | { kind: "delete"; category: Category }
    | null;

const Categories = () => {
    const { state } = useStore();
    const userId: string = state.userDetails?.id;

    const [tab, setTab] = useState<TransactionType>("EXPENSE");
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [dialog, setDialog] = useState<Dialog>(null);

    const load = async () => {
        const r = await getCategories(userId);
        if (r.ok && r.data) {
            setCategories(r.data);
            setError("");
        } else {
            setError(r.errors.join(", "));
        }
        setLoading(false);
    };

    useEffect(() => {
        if (userId) load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userId]);

    const shown = categories.filter((c) => c.type === tab);
    const countOf = (type: TransactionType) => categories.filter((c) => c.type === type).length;

    // Each handler returns error messages for the dialog to show (empty = success)
    const save = async (input: CategoryInput): Promise<string[]> => {
        const editing = dialog?.kind === "edit" ? dialog.category : null;
        const r = editing
            ? await updateCategory(editing.categoryId, input, userId)
            : await createCategory(input, userId);
        if (!r.ok) return r.errors;
        setDialog(null);
        setTab(input.type);
        await load();
        return [];
    };

    const remove = async (reassignTo?: string): Promise<string[]> => {
        if (dialog?.kind !== "delete") return [];
        const r = await deleteCategory(dialog.category.categoryId, userId, reassignTo);
        if (!r.ok) return r.errors;
        setDialog(null);
        await load();
        return [];
    };

    return (
        <div className="ex-page">
            <header className="ex-header">
                <div>
                    <h1 className="ex-title">Categories</h1>
                    <p className="ex-subtitle">Manage your expense and income categories</p>
                </div>
                <button type="button" className="ex-btn ex-btn--primary" onClick={() => setDialog({ kind: "add" })}>
                    <i className="bx bx-plus"></i> Add category
                </button>
            </header>

            <section className="ex-card">
                <div className="ex-tabs" role="tablist">
                    {(["EXPENSE", "INCOME"] as TransactionType[]).map((t) => (
                        <button
                            key={t}
                            type="button"
                            role="tab"
                            aria-selected={tab === t}
                            className={tab === t ? "is-active" : ""}
                            onClick={() => setTab(t)}
                        >
                            {t === "EXPENSE" ? "Expense" : "Income"} categories ({countOf(t)})
                        </button>
                    ))}
                </div>

                {loading && <p className="ex-muted">Loading…</p>}
                {error && <p className="ex-errors" role="alert">{error}</p>}

                {!loading && !error && (
                    <div className="ex-table-wrap">
                        <table className="ex-table ex-table--static">
                            <thead>
                                <tr>
                                    <th>Category</th>
                                    <th>Description</th>
                                    <th className="ex-num">Transactions</th>
                                    <th><span className="sr-only">Actions</span></th>
                                </tr>
                            </thead>
                            <tbody>
                                {shown.map((c) => (
                                    <tr key={c.categoryId}>
                                        <td>
                                            <span className="ex-category">
                                                <CategoryIcon icon={c.icon} color={c.color} />
                                                {c.name}
                                            </span>
                                        </td>
                                        <td className="ex-cell-muted">{c.description || "—"}</td>
                                        <td className="ex-num">{c.transactionCount}</td>
                                        <td className="ex-row-actions">
                                            <button
                                                type="button"
                                                className="ex-icon-btn"
                                                aria-label={`Edit ${c.name}`}
                                                onClick={() => setDialog({ kind: "edit", category: c })}
                                            >
                                                <i className="bx bx-edit-alt" aria-hidden="true"></i>
                                            </button>
                                            <button
                                                type="button"
                                                className="ex-icon-btn"
                                                aria-label={`Delete ${c.name}`}
                                                disabled={shown.length <= 1}
                                                title={shown.length <= 1 ? "Keep at least one category of each type" : undefined}
                                                onClick={() => setDialog({ kind: "delete", category: c })}
                                            >
                                                <i className="bx bx-trash" aria-hidden="true"></i>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>

            {(dialog?.kind === "add" || dialog?.kind === "edit") && (
                <CategoryFormDialog
                    initial={dialog.kind === "edit" ? dialog.category : undefined}
                    defaultType={tab}
                    onCancel={() => setDialog(null)}
                    onSave={save}
                />
            )}

            {dialog?.kind === "delete" && (
                <DeleteCategoryDialog
                    category={dialog.category}
                    others={categories.filter((c) => c.type === dialog.category.type && c.categoryId !== dialog.category.categoryId)}
                    onCancel={() => setDialog(null)}
                    onDelete={remove}
                />
            )}
        </div>
    );
};

export default Categories;
