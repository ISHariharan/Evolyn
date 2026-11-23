import { useMemo, useState } from "react";
import { Catalogue, CatalogueActivity } from "../../../API/Tribe/Activities/catalogueTypes";
import { shortLabel } from "./recent";

const PAGE = 40;

const formatMet = (met: number) => Number(met).toFixed(1);

// Every word you type must appear in the description (or start the code): "hand team" finds "Handball, team"
const matches = (a: CatalogueActivity, terms: string[]) => {
    const text = a.description.toLowerCase();
    return terms.every((t) => text.includes(t) || a.code.startsWith(t));
};

interface Props {
    catalogue: Catalogue;
    value: string | null;               // selected activity code
    onChange: (code: string | null) => void;
    suggestedCodes: string[];           // recent first, then popular
}

/**
 * Choosing an activity from the ~1,100 in the Compendium:
 *   - one tap on a suggestion (your recent ones, then common ones), or
 *   - pick a heading (Sports, Running...), or
 *   - search by words ("handball", "swim lap").
 * Each result shows its MET value; activities under headings that don't count
 * for tribe goals (sleeping, driving...) say so.
 */
const ActivityPicker = ({ catalogue, value, onChange, suggestedCodes }: Props) => {
    const [query, setQuery] = useState("");
    const [heading, setHeading] = useState<string | null>(null);
    const [shown, setShown] = useState(PAGE);

    const byCode = useMemo(() => new Map(catalogue.activities.map((a) => [a.code, a])), [catalogue]);
    const headingByCode = useMemo(() => new Map(catalogue.headings.map((h) => [h.code, h])), [catalogue]);
    // Headings that count for goals first: they're what people log most
    const headings = useMemo(
        () => [...catalogue.headings].sort((a, b) => Number(b.countsForGoals) - Number(a.countsForGoals)),
        [catalogue]
    );

    const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
    const searching = terms.length > 0 || heading !== null;

    const results = useMemo(() => {
        if (!searching) return [];
        const list = catalogue.activities.filter(
            (a) => (heading === null || a.headingCode === heading) && (terms.length === 0 || matches(a, terms))
        );
        // Descriptions that START with the first word come first ("Handball..." before "...handball...")
        if (terms.length > 0) {
            const first = terms[0];
            list.sort(
                (a, b) =>
                    Number(b.description.toLowerCase().startsWith(first)) -
                        Number(a.description.toLowerCase().startsWith(first)) ||
                    a.description.length - b.description.length
            );
        }
        return list;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [catalogue, heading, query]);

    const suggestions = suggestedCodes.map((c) => byCode.get(c)).filter(Boolean) as CatalogueActivity[];
    const selected = value ? byCode.get(value) : undefined;

    const choose = (code: string) => {
        onChange(code);
        setQuery("");
        setHeading(null);
        setShown(PAGE);
    };

    if (selected) {
        const h = headingByCode.get(selected.headingCode);
        return (
            <div className="tr-picked">
                <div className="tr-picked__main">
                    <span className="tr-picked__name">{selected.description}</span>
                    <span className="tr-picked__meta">
                        {h?.name} · code {selected.code} · MET {formatMet(selected.met)}
                    </span>
                    {h && !h.countsForGoals && (
                        <span className="tr-tag tr-tag--muted">Doesn't count for tribe goals</span>
                    )}
                </div>
                <button type="button" className="ex-btn ex-btn--secondary" onClick={() => onChange(null)}>
                    Change
                </button>
            </div>
        );
    }

    return (
        <div className="tr-picker">
            {suggestions.length > 0 && (
                <div className="tr-picker__group">
                    <span className="tr-picker__label">Suggestions</span>
                    <div className="tr-chips">
                        {suggestions.map((a) => (
                            <button
                                key={a.code}
                                type="button"
                                className="tr-chip"
                                title={`${a.description} · MET ${formatMet(a.met)}`}
                                onClick={() => choose(a.code)}
                            >
                                {shortLabel(a.code, a.description)}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <label className="ex-field" style={{ marginBottom: 0 }}>
                <span>Search all activities</span>
                <input
                    type="search"
                    placeholder="e.g. handball, swim laps, cricket"
                    value={query}
                    onChange={(e) => { setQuery(e.target.value); setShown(PAGE); }}
                />
            </label>

            <div className="tr-picker__group">
                <span className="tr-picker__label">Or browse by type</span>
                <div className="tr-chips" role="group" aria-label="Activity types">
                    {headings.map((h) => (
                        <button
                            key={h.code}
                            type="button"
                            className={`tr-chip ${heading === h.code ? "is-active" : ""} ${h.countsForGoals ? "" : "tr-chip--muted"}`}
                            aria-pressed={heading === h.code}
                            onClick={() => { setHeading(heading === h.code ? null : h.code); setShown(PAGE); }}
                        >
                            {h.name}
                        </button>
                    ))}
                </div>
            </div>

            {searching && (
                <div className="tr-results" aria-live="polite">
                    <p className="tr-note">
                        {results.length === 0
                            ? "No activity matches. Try fewer or different words."
                            : `${results.length} ${results.length === 1 ? "activity" : "activities"}`}
                    </p>
                    <ul>
                        {results.slice(0, shown).map((a) => {
                            const h = headingByCode.get(a.headingCode);
                            return (
                                <li key={a.code}>
                                    <button type="button" className="tr-result" onClick={() => choose(a.code)}>
                                        <span className="tr-result__name">{a.description}</span>
                                        <span className="tr-result__meta">
                                            {h?.name} · MET {formatMet(a.met)}
                                            {h && !h.countsForGoals ? " · doesn't count for goals" : ""}
                                        </span>
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                    {results.length > shown && (
                        <button type="button" className="ex-btn ex-btn--secondary" onClick={() => setShown(shown + PAGE)}>
                            Show more ({results.length - shown} left)
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default ActivityPicker;
