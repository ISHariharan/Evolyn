import { categoryMeta, TransactionType } from "../../../API/Expenses/Transactions/types";

// Coloured rounded icon for a category, e.g. 🍴 for "Food & Dining"
const CategoryIcon = ({ category, type, className = "" }: { category: string; type: TransactionType; className?: string }) => {
    const meta = categoryMeta(category, type);
    return (
        <span
            className={`ex-category__icon ${className}`}
            style={{ color: meta.color, background: `${meta.color}1f` }}
            aria-hidden="true"
        >
            <i className={meta.icon}></i>
        </span>
    );
};

export default CategoryIcon;
