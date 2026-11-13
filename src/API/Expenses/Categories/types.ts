import { TransactionType } from "../Transactions/types";

export interface CategoryInput {
    name: string;
    type: TransactionType;
    icon: string;   // Boxicons class, e.g. "bx bx-restaurant"
    color: string;  // hex, e.g. "#f97316"
    description?: string;
}

export interface Category extends CategoryInput {
    categoryId: string;
    transactionCount: number;
}

// Icons offered in the picker (Boxicons 2.1.4, loaded in public/index.html).
// Every name here was checked to exist in that version; a missing one renders blank.
export const CATEGORY_ICONS = [
    "bx bx-restaurant", "bx bx-coffee", "bx bx-cart", "bx bx-shopping-bag", "bx bx-car",
    "bx bx-bus", "bx bx-gas-pump", "bx bx-home", "bx bx-bulb", "bx bx-wifi",
    "bx bx-phone", "bx bx-plus-medical", "bx bx-dumbbell", "bx bx-book", "bx bx-movie-play",
    "bx bx-music", "bx bx-game", "bx bx-trip", "bx bx-gift", "bx bx-bone",
    "bx bx-child", "bx bx-closet", "bx bx-cut", "bx bx-wrench", "bx bx-shield-quarter",
    "bx bx-line-chart", "bx bx-briefcase", "bx bx-laptop", "bx bx-coin-stack", "bx bx-undo",
    "bx bx-donate-heart", "bx bx-purchase-tag-alt", "bx bx-dots-horizontal-rounded",
];

// Colours offered in the picker
export const CATEGORY_COLORS = [
    "#f97316", "#f59e0b", "#eab308", "#22c55e", "#10b981", "#14b8a6",
    "#3b82f6", "#6366f1", "#8b5cf6", "#ec4899", "#ef4444", "#64748b",
];
