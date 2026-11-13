// Coloured rounded icon for a category, e.g. 🍴 in orange for "Food & Dining".
// Icon and colour come from the user's category (they can change both).
const CategoryIcon = ({ icon, color, className = "" }: { icon: string; color: string; className?: string }) => {
    const safeColor = /^#[0-9a-fA-F]{6}$/.test(color) ? color : "#64748b";
    return (
        <span
            className={`ex-category__icon ${className}`}
            style={{ color: safeColor, background: `${safeColor}1f` }}
            aria-hidden="true"
        >
            <i className={icon || "bx bx-purchase-tag-alt"}></i>
        </span>
    );
};

export default CategoryIcon;
