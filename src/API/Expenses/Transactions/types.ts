// Categories are either EXPENSE or INCOME
export type TransactionType = "EXPENSE" | "INCOME";

// A transaction can also be a TRANSFER between two of your own accounts
// (paying a card bill, withdrawing cash, topping up a wallet). It has no category
// and isn't counted as income or spending.
export type TransactionKind = TransactionType | "TRANSFER";

export type PaymentMethod = "UPI" | "CREDIT_CARD" | "DEBIT_CARD" | "NET_BANKING" | "CASH";

// What the form sends to Evolyn-API
export interface TransactionInput {
    accountId: string;
    toAccountId?: string; // TRANSFER only
    type: TransactionKind;
    amount: number;
    transactionDate: string; // "YYYY-MM-DD"
    categoryId?: string; // not used for TRANSFER
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
    toAccountName: string | null;
    toAccountLast4: string | null;
    source: "MANUAL" | "SMS" | "STATEMENT";
    createdAt: string;
    updatedAt: string;
}

export interface TransactionFilters {
    type?: TransactionKind;
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
