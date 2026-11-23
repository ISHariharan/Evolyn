import { ApiResult, request } from "../../Expenses/http";
import { Catalogue } from "./catalogueTypes";

/**
 * The catalogue (~1,100 activities, ~120 KB) almost never changes, so it's
 * fetched once and kept:
 *   - in memory for this visit, and
 *   - in the browser (localStorage) for a week, so the next visit is instant.
 * If the browser blocks storage, it simply downloads it again.
 */
const STORAGE_KEY = "evolyn.activityCatalogue.v1";
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

let inMemory: Catalogue | null = null;
let pending: Promise<ApiResult<Catalogue>> | null = null;

const readStored = (): Catalogue | null => {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return null;
        const { savedAt, catalogue } = JSON.parse(raw);
        if (Date.now() - savedAt > MAX_AGE_MS || !catalogue?.activities?.length) return null;
        return catalogue as Catalogue;
    } catch {
        return null;
    }
};

const store = (catalogue: Catalogue) => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ savedAt: Date.now(), catalogue }));
    } catch {
        // storage full or blocked: memory cache is enough
    }
};

export const getCatalogue = async (): Promise<ApiResult<Catalogue>> => {
    if (inMemory) return { ok: true, status: 200, data: inMemory, errors: [] };
    const stored = readStored();
    if (stored) {
        inMemory = stored;
        return { ok: true, status: 200, data: stored, errors: [] };
    }
    // Several components asking at once share one download
    if (!pending) {
        pending = request<Catalogue>("/activity-definitions").then((result) => {
            if (result.ok && result.data) {
                inMemory = result.data;
                store(result.data);
            }
            pending = null;
            return result;
        });
    }
    return pending;
};

// "Handball, team (15330)" style lookups
export const indexByCode = (catalogue: Catalogue) => new Map(catalogue.activities.map((a) => [a.code, a]));
