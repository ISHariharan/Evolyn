import { request, toQuery } from "../http";
import { Account, AccountInput } from "./types";

export const getAccounts = (userId: string) =>
    request<Account[]>(`/accounts${toQuery({ userId })}`);

export const createAccount = (account: AccountInput, userId: string) =>
    request<Account>("/accounts", {
        method: "POST",
        body: JSON.stringify({ ...account, userId }),
    });

export const updateAccount = (accountId: string, account: AccountInput, userId: string) =>
    request<Account>(`/accounts/${accountId}`, {
        method: "PUT",
        body: JSON.stringify({ ...account, userId }),
    });

export const deleteAccount = (accountId: string, userId: string) =>
    request<void>(`/accounts/${accountId}${toQuery({ userId })}`, { method: "DELETE" });
