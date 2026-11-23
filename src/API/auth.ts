/**
 * The login token Evolyn-API gives you when you log in.
 *
 * It's sent as "Authorization: Bearer <token>" with every request; the API
 * works out who you are from it (and ignores any userId the page sends).
 * When the API answers 401 the token is missing, expired (after 7 days) or
 * invalid: it's thrown away and the app logs you out.
 */
const TOKEN_KEY = "evolyn.token";
export const LOGGED_OUT_EVENT = "evolyn:logged-out";

export const getToken = (): string | null => {
    try {
        return localStorage.getItem(TOKEN_KEY);
    } catch {
        return null;
    }
};

export const setToken = (token: string) => {
    try {
        localStorage.setItem(TOKEN_KEY, token);
    } catch {
        // storage blocked: the login only lasts until the page is reloaded
    }
};

export const clearToken = () => {
    try {
        localStorage.removeItem(TOKEN_KEY);
    } catch {
        // nothing to clear
    }
};

// Headers to add to a fetch: the token, if there is one
export const authHeaders = (): Record<string, string> => {
    const token = getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
};

// Call when the API says 401: forget the token and tell the app (App.jsx) to log out
export const handleUnauthorized = () => {
    clearToken();
    window.dispatchEvent(new Event(LOGGED_OUT_EVENT));
};
