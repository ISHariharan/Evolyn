import { request, toQuery } from "../http";
import { Page, Transaction, TransactionFilters, TransactionInput } from "./types";

export const getTransactions = (userId: string, filters: TransactionFilters = {}) =>
    request<Page<Transaction>>(`/transactions${toQuery({ userId, ...filters })}`);

export const getTransaction = (transactionId: string, userId: string) =>
    request<Transaction>(`/transactions/${transactionId}${toQuery({ userId })}`);

export const createTransaction = (transaction: TransactionInput, userId: string) =>
    request<Transaction>("/transactions", {
        method: "POST",
        body: JSON.stringify({ ...transaction, userId }),
    });

export const updateTransaction = (transactionId: string, transaction: TransactionInput, userId: string) =>
    request<Transaction>(`/transactions/${transactionId}`, {
        method: "PUT",
        body: JSON.stringify({ ...transaction, userId }),
    });

export const deleteTransaction = (transactionId: string, userId: string) =>
    request<void>(`/transactions/${transactionId}${toQuery({ userId })}`, { method: "DELETE" });
