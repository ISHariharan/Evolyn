
import { authHeaders, handleUnauthorized } from "../../auth";

const evolynAPI = '/evolyn/api'

export const getAllWorkspacesForUser = async (userId: string) => {
    const url = `${evolynAPI}/retrieve/workspaces?userId=${encodeURIComponent(userId)}`;
    const response = await fetch(url, {
        method: 'GET',
        headers: {
            Accept: 'application/json',
            ...authHeaders(),
        },
    });
    if (response.status === 401) handleUnauthorized();
    if (!response.ok) {
        const text = await response.text().catch(() => '');
        throw new Error(`getAllWorkspacesForUser failed: ${response.status} ${text}`);
    }
    return response.json();
}
