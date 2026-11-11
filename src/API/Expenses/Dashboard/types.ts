import { Transaction } from "../Transactions/types";

export interface DashboardSummary {
    from: string;
    to: string;
    totalSpent: number;
    expenseCount: number;
    totalIncome: number;
    incomeCount: number;
    byCategory: { category: string; total: number; count: number }[];
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
