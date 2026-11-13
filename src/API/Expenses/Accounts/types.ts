export type AccountType = "BANK" | "CREDIT_CARD" | "CASH" | "WALLET";

export interface AccountInput {
    name: string;
    accountType: AccountType;
    last4?: string;
    // Balance at the start of openingBalanceDate (for a credit card: amount owed).
    // Transactions dated on or after that day move it.
    openingBalance?: number | null;
    openingBalanceDate?: string | null; // "YYYY-MM-DD"
    creditLimit?: number | null;       // credit cards only
    statementDay?: number | null;      // credit cards only, 1-28
}

export interface Account extends AccountInput {
    accountId: string;
    userId: string;
    createdAt: string;
}

export const ACCOUNT_TYPES: { value: AccountType; label: string; icon: string }[] = [
    { value: "BANK", label: "Bank account", icon: "bx bx-building-house" },
    { value: "CREDIT_CARD", label: "Credit card", icon: "bx bx-credit-card" },
    { value: "CASH", label: "Cash", icon: "bx bx-money" },
    { value: "WALLET", label: "Wallet", icon: "bx bx-wallet" },
];

export const accountTypeMeta = (type: string) =>
    ACCOUNT_TYPES.find((t) => t.value === type) ?? ACCOUNT_TYPES[0];

// "HDFC Bank •••• 1234" or just "Cash"
export const accountLabel = (name: string, last4?: string | null) =>
    last4 ? `${name} •••• ${last4}` : name;
