// Shared fetch helper for the Expenses module.
// Leading slash matters: "/evolyn/api" always resolves from the site root.
// The dev server's "proxy" setting (package.json) forwards it to Evolyn-API on :3001.
export const evolynApi = "/evolyn/api";

export interface ApiResult<T> {
    ok: boolean;
    status: number;
    data?: T;
    errors: string[];
}

// Turns the API's error JSON ({ message, errors: [...] }) into a list of messages
const readErrors = async (response: Response): Promise<string[]> => {
    try {
        const body = await response.json();
        if (Array.isArray(body?.errors) && body.errors.length > 0) return body.errors;
        if (body?.message) return [body.message];
    } catch {
        // body was not JSON
    }
    return [`Request failed (${response.status})`];
};

export const request = async <T>(path: string, init?: RequestInit): Promise<ApiResult<T>> => {
    try {
        const response = await fetch(`${evolynApi}${path}`, {
            ...init,
            headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
        });
        if (!response.ok) {
            return { ok: false, status: response.status, errors: await readErrors(response) };
        }
        // 204 No Content (e.g. after DELETE) has no body to parse
        const data = response.status === 204 ? undefined : ((await response.json()) as T);
        return { ok: true, status: response.status, data, errors: [] };
    } catch {
        return { ok: false, status: 0, errors: ["Could not reach the server"] };
    }
};

// Builds "?a=1&b=2", skipping empty values
export const toQuery = (params: Record<string, string | number | undefined | null>) => {
    const q = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") q.set(key, String(value));
    });
    const s = q.toString();
    return s ? `?${s}` : "";
};
