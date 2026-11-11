export type TransactionType = "EXPENSE" | "INCOME";

export type PaymentMethod = "UPI" | "CREDIT_CARD" | "DEBIT_CARD" | "NET_BANKING" | "CASH";

// What the form sends to Evolyn-API
export interface TransactionInput {
    accountId: string;
    type: TransactionType;
    amount: number;
    transactionDate: string; // "YYYY-MM-DD"
    category: string;
    merchant: string;
    notes?: string;
    paymentMethod: PaymentMethod;
}

// What Evolyn-API returns for each saved row
export interface Transaction extends TransactionInput {
    transactionId: string;
    accountName: string;
    accountLast4: string | null;
    source: "MANUAL" | "SMS" | "STATEMENT";
    createdAt: string;
    updatedAt: string;
}

export interface TransactionFilters {
    type?: TransactionType;
    category?: string;
    accountId?: string;
    from?: string;
    to?: string;
    page?: number;
    size?: number;
}

export interface Page<T> {
    items: T[];
    page: number; // 0-based
    size: number;
    totalItems: number;
    totalPages: number;
}

export interface CategoryMeta {
    name: string;
    icon: string;
    color: string;
}

export const EXPENSE_CATEGORIES: CategoryMeta[] = [
    { name: "Food & Dining", icon: "bx bx-restaurant", color: "#f97316" },
    { name: "Transport", icon: "bx bx-car", color: "#f59e0b" },
    { name: "Shopping", icon: "bx bx-shopping-bag", color: "#6366f1" },
    { name: "Entertainment", icon: "bx bx-movie-play", color: "#ec4899" },
    { name: "Housing", icon: "bx bx-home", color: "#8b5cf6" },
    { name: "Health", icon: "bx bx-plus-medical", color: "#10b981" },
    { name: "Education", icon: "bx bx-book", color: "#3b82f6" },
    { name: "Utilities", icon: "bx bx-bulb", color: "#eab308" },
    { name: "Investments", icon: "bx bx-line-chart", color: "#14b8a6" },
    { name: "Others", icon: "bx bx-dots-horizontal-rounded", color: "#64748b" },
];

export const INCOME_CATEGORIES: CategoryMeta[] = [
    { name: "Salary", icon: "bx bx-briefcase", color: "#22c55e" },
    { name: "Freelance", icon: "bx bx-laptop", color: "#22c55e" },
    { name: "Interest", icon: "bx bx-coin-stack", color: "#22c55e" },
    { name: "Refund", icon: "bx bx-undo", color: "#22c55e" },
    { name: "Gift", icon: "bx bx-gift", color: "#22c55e" },
    { name: "Others", icon: "bx bx-dots-horizontal-rounded", color: "#22c55e" },
];

export const categoryMeta = (name: string, type: TransactionType): CategoryMeta =>
    (type === "INCOME" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES).find((c) => c.name === name) ?? {
        name,
        icon: "bx bx-purchase-tag-alt",
        color: "#64748b",
    };

export const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
    { value: "UPI", label: "UPI" },
    { value: "CREDIT_CARD", label: "Credit card" },
    { value: "DEBIT_CARD", label: "Debit card" },
    { value: "NET_BANKING", label: "Bank transfer" },
    { value: "CASH", label: "Cash" },
];

export const paymentMethodLabel = (value: string) =>
    PAYMENT_METHODS.find((m) => m.value === value)?.label ?? value;
