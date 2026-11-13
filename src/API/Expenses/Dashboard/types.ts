import { Transaction } from "../Transactions/types";

export interface DashboardSummary {
    from: string;
    to: string;
    totalSpent: number;
    expenseCount: number;
    totalIncome: number;
    incomeCount: number;
    byCategory: { categoryId: string; name: string; icon: string; color: string; total: number; count: number }[];
    byAccount: { accountId: string; name: string; last4: string | null; total: number }[];
    byPaymentMethod: { paymentMethod: string; total: number }[];
    topMerchants: { merchant: string; total: number; count: number }[];
    biggestExpenses: Transaction[];
    dailySpending: { date: string; total: number }[];
}

export interface MonthTotal {
    month: string; // "2026-10"
    income: number;
    spent: number;
}

export interface AccountBalance {
    accountId: string;
    name: string;
    last4: string | null;
    accountType: "BANK" | "CREDIT_CARD" | "CASH" | "WALLET";
    openingBalance: number | null;
    openingBalanceDate: string | null;
    balance: number | null;           // bank/cash/wallet: what's in it; card: what you owe
    creditLimit: number | null;
    statementDay: number | null;
    cycleStart: string | null;        // cards only
    nextStatementDate: string | null; // cards only
    cycleSpent: number | null;        // cards only
}
