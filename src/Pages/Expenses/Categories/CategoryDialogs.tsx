import { FormEvent, ReactNode, useEffect, useRef, useState } from "react";
import { Category, CategoryInput, CATEGORY_COLORS, CATEGORY_ICONS } from "../../../API/Expenses/Categories/types";
import { TransactionType } from "../../../API/Expenses/Transactions/types";
import CategoryIcon from "../Transactions/CategoryIcon";

/** A small modal: dims the page, closes on Escape or a click outside, traps nothing fancy. */
const Modal = ({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) => {
    const panel = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
        document.addEventListener("keydown", onKey);
        // Move keyboard focus to the first field (not the close button above it)
        const first =
            panel.current?.querySelector<HTMLElement>("input, select") ??
            panel.current?.querySelector<HTMLElement>(".ex-form-actions button");
        first?.focus();
        return () => document.removeEventListener("keydown", onKey);
    }, [onClose]);

    return (
        <div className="ex-modal" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
            <div className="ex-modal__panel" role="dialog" aria-modal="true" aria-label={title} ref={panel}>
                <div className="ex-modal__header">
                    <h2 className="ex-card__title">{title}</h2>
                    <button type="button" className="ex-icon-btn" aria-label="Close" onClick={onClose}>
                        <i className="bx bx-x" aria-hidden="true"></i>
                    </button>
                </div>
                {children}
            </div>
        </div>
    );
};

/** Add or edit a category. */
export const CategoryFormDialog = ({
    initial,
    defaultType,
    onCancel,
    onSave,
}: {
    initial?: Category;               // present when editing
    defaultType: TransactionType;     // the tab you were on when adding
    onCancel: () => void;
    onSave: (input: CategoryInput) => Promise<string[]>; // returns errors, empty on success
}) => {
    const [name, setName] = useState(initial?.name ?? "");
    const [type, setType] = useState<TransactionType>(initial?.type ?? defaultType);
    const [icon, setIcon] = useState(initial?.icon ?? CATEGORY_ICONS[0]);
    const [color, setColor] = useState(initial?.color ?? CATEGORY_COLORS[0]);
    const [description, setDescription] = useState(initial?.description ?? "");
    const [errors, setErrors] = useState<string[]>([]);
    const [saving, setSaving] = useState(false);

    // A category that's already used can't switch between expense and income
    const typeLocked = !!initial && initial.transactionCount > 0;

    const submit = async (e: FormEvent) => {
        e.preventDefault();
        setSaving(true);
        const problems = await onSave({ name: name.trim(), type, icon, color, description: description.trim() || undefined });
        setSaving(false);
        setErrors(problems);
    };

    return (
        <Modal title={initial ? `Edit ${initial.name}` : "Add category"} onClose={onCancel}>
            <form onSubmit={submit}>
                <div className="ex-cat-preview">
                    <CategoryIcon icon={icon} color={color} />
                    <span>{name.trim() || "Category name"}</span>
                </div>

                <label className="ex-field">
                    <span>Name <span className="ex-required">*</span></span>
                    <input value={name} maxLength={50} placeholder="Pets" onChange={(e) => setName(e.target.value)} required />
                </label>

                <div className="ex-field">
                    <span>Type</span>
                    <div className="ex-type-toggle" role="group" aria-label="Category type">
                        {(["EXPENSE", "INCOME"] as TransactionType[]).map((t) => (
                            <button
                                key={t}
                                type="button"
                                className={type === t ? "is-active" : ""}
                                aria-pressed={type === t}
                                disabled={typeLocked && type !== t}
                                onClick={() => setType(t)}
                            >
                                {t === "EXPENSE" ? "Expense" : "Income"}
                            </button>
                        ))}
                    </div>
                    {typeLocked && (
                        <small className="ex-muted">
                            Used by {initial!.transactionCount} transaction{initial!.transactionCount === 1 ? "" : "s"}, so the type can't change.
                        </small>
                    )}
                </div>

                <div className="ex-field">
                    <span>Icon</span>
                    <div className="ex-icon-grid" role="radiogroup" aria-label="Icon">
                        {CATEGORY_ICONS.map((i) => (
                            <button
                                key={i}
                                type="button"
                                role="radio"
                                aria-checked={icon === i}
                                aria-label={i.replace("bx bx-", "").replace(/-/g, " ")}
                                className={icon === i ? "is-active" : ""}
                                style={icon === i ? { color, borderColor: color } : undefined}
                                onClick={() => setIcon(i)}
                            >
                                <i className={i} aria-hidden="true"></i>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="ex-field">
                    <span>Colour</span>
                    <div className="ex-swatches" role="radiogroup" aria-label="Colour">
                        {CATEGORY_COLORS.map((c) => (
                            <button
                                key={c}
                                type="button"
                                role="radio"
                                aria-checked={color === c}
                                aria-label={c}
                                className={color === c ? "is-active" : ""}
                                style={{ background: c }}
                                onClick={() => setColor(c)}
                            />
                        ))}
                    </div>
                </div>

                <label className="ex-field">
                    <span>Description (optional)</span>
                    <input
                        value={description}
                        maxLength={120}
                        placeholder="Food, vet, grooming"
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </label>

                {errors.length > 0 && (
                    <ul className="ex-errors" role="alert">
                        {errors.map((err) => <li key={err}>{err}</li>)}
                    </ul>
                )}

                <div className="ex-form-actions">
                    <button type="button" className="ex-btn ex-btn--secondary" onClick={onCancel}>Cancel</button>
                    <button type="submit" className="ex-btn ex-btn--primary" disabled={saving}>
                        {saving ? "Saving…" : initial ? "Save changes" : "Add category"}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

/** Delete a category; if it has transactions, choose where they move first. */
export const DeleteCategoryDialog = ({
    category,
    others,
    onCancel,
    onDelete,
}: {
    category: Category;
    others: Category[]; // same-type categories it could move to
    onCancel: () => void;
    onDelete: (reassignTo?: string) => Promise<string[]>;
}) => {
    const used = category.transactionCount;
    const [target, setTarget] = useState(others[0]?.categoryId ?? "");
    const [errors, setErrors] = useState<string[]>([]);
    const [busy, setBusy] = useState(false);

    const confirm = async () => {
        setBusy(true);
        const problems = await onDelete(used > 0 ? target : undefined);
        setBusy(false);
        setErrors(problems);
    };

    return (
        <Modal title={`Delete ${category.name}?`} onClose={onCancel}>
            {used === 0 ? (
                <p className="ex-modal__text">No transactions use this category. This can't be undone.</p>
            ) : (
                <>
                    <p className="ex-modal__text">
                        {used} transaction{used === 1 ? " uses" : "s use"} this category. Choose where to move{" "}
                        {used === 1 ? "it" : "them"} before it's deleted.
                    </p>
                    <label className="ex-field">
                        <span>Move transactions to</span>
                        <select value={target} onChange={(e) => setTarget(e.target.value)}>
                            {others.map((c) => (
                                <option key={c.categoryId} value={c.categoryId}>{c.name}</option>
                            ))}
                        </select>
                    </label>
                </>
            )}

            {errors.length > 0 && (
                <ul className="ex-errors" role="alert">
                    {errors.map((err) => <li key={err}>{err}</li>)}
                </ul>
            )}

            <div className="ex-form-actions">
                <button type="button" className="ex-btn ex-btn--secondary" onClick={onCancel}>Cancel</button>
                <button type="button" className="ex-btn ex-btn--danger" disabled={busy || (used > 0 && !target)} onClick={confirm}>
                    {busy ? "Deleting…" : used > 0 ? `Move ${used} and delete` : "Delete category"}
                </button>
            </div>
        </Modal>
    );
};
