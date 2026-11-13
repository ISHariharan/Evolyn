import { request, toQuery } from "../http";
import { Category, CategoryInput } from "./types";

// The first call for a new user also creates their default categories
export const getCategories = (userId: string) =>
    request<Category[]>(`/categories${toQuery({ userId })}`);

export const createCategory = (category: CategoryInput, userId: string) =>
    request<Category>("/categories", {
        method: "POST",
        body: JSON.stringify({ ...category, userId }),
    });

export const updateCategory = (categoryId: string, category: CategoryInput, userId: string) =>
    request<Category>(`/categories/${categoryId}`, {
        method: "PUT",
        body: JSON.stringify({ ...category, userId }),
    });

// reassignTo: required when the category still has transactions; they move there first
export const deleteCategory = (categoryId: string, userId: string, reassignTo?: string) =>
    request<void>(`/categories/${categoryId}${toQuery({ userId, reassignTo })}`, { method: "DELETE" });
