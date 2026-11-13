export type TransactionType = "EXPENSE" | "INCOME";

export type PaymentMethod = "UPI" | "CREDIT_CARD" | "DEBIT_CARD" | "NET_BANKING" | "CASH";

// What the form sends to Evolyn-API
export interface TransactionInput {
    accountId: string;
    type: TransactionType;
    amount: number;
    transactionDate: string; // "YYYY-MM-DD"
    categoryId: string;
    merchant: string;
    notes?: string;
    paymentMethod: PaymentMethod;
}

// What Evolyn-API returns for each saved row
export interface Transaction extends TransactionInput {
    transactionId: string;
    categoryName: string;
    categoryIcon: string;
    categoryColor: string;
    accountName: string;
    accountLast4: string | null;
    source: "MANUAL" | "SMS" | "STATEMENT";
    createdAt: string;
    updatedAt: string;
}

export interface TransactionFilters {
    type?: TransactionType;
    categoryId?: string;
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

// Categories are per-user and editable now: see API/Expenses/Categories.

export const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
    { value: "UPI", label: "UPI" },
    { value: "CREDIT_CARD", label: "Credit card" },
    { value: "DEBIT_CARD", label: "Debit card" },
    { value: "NET_BANKING", label: "Bank transfer" },
    { value: "CASH", label: "Cash" },
];

export const paymentMethodLabel = (value: string) =>
    PAYMENT_METHODS.find((m) => m.value === value)?.label ?? value;
