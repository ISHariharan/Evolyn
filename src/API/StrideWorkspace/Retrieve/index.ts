import { getAllWorkspacesForUser } from "./api";

export const getAllWorkspaces = (userId) => {
    return getAllWorkspacesForUser(userId);
}