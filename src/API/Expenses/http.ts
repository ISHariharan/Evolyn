import { authHeaders, handleUnauthorized } from "../auth";

// Shared fetch helper for the Expenses and Tribe modules.
// Where Evolyn-API lives.
// Production (.env.production): the browser calls Render directly. Going through Vercel's
// rewrite made Render's Cloudflare see bursts from Vercel's shared servers and answer 429.
// Locally REACT_APP_API_ORIGIN is unset, so it's "/evolyn/api" and the dev server's
// "proxy" setting (package.json) forwards it to Evolyn-API on :3001.
export const evolynApi = `${process.env.REACT_APP_API_ORIGIN ?? ""}/evolyn/api`;

export interface ApiResult<T> {
    ok: boolean;
    status: number;
    data?: T;
    errors: string[];
    code?: string; // machine-readable reason some errors carry, e.g. "OVERLAP"
}

// Turns the API's error JSON ({ message, errors: [...], code? }) into a list of messages
const readErrors = async (response: Response): Promise<{ errors: string[]; code?: string }> => {
    try {
        const body = await response.json();
        const code = typeof body?.code === "string" ? body.code : undefined;
        if (Array.isArray(body?.errors) && body.errors.length > 0) return { errors: body.errors, code };
        if (body?.message) return { errors: [body.message], code };
    } catch {
        // body was not JSON
    }
    return { errors: [`Request failed (${response.status})`] };
};

export const request = async <T>(path: string, init?: RequestInit): Promise<ApiResult<T>> => {
    try {
        const response = await fetch(`${evolynApi}${path}`, {
            ...init,
            headers: { "Content-Type": "application/json", ...authHeaders(), ...(init?.headers ?? {}) },
        });
        if (response.status === 401) handleUnauthorized(); // token missing or expired: log out
        if (!response.ok) {
            const { errors, code } = await readErrors(response);
            return { ok: false, status: response.status, errors, code };
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
