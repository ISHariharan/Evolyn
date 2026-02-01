
const evolynAPI = '/evolyn/api'

export const getAllWorkspacesForUser = async (userId: string) => {
    const url = `${evolynAPI}/retrieve/workspaces?userId=${encodeURIComponent(userId)}`;
    const response = await fetch(url, {
        method: 'GET',
        headers: {
            Accept: 'application/json',
        },
    });
    if (!response.ok) {
        const text = await response.text().catch(() => '');
        throw new Error(`getAllWorkspacesForUser failed: ${response.status} ${text}`);
    }
    return response.json();
}
