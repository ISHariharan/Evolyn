import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getTribeFeed } from "../../../API/Tribe/Tribes/api";
import { FeedItem } from "../../../API/Tribe/Tribes/types";
import { Bone } from "../../Expenses/Skeletons";
import { formatDate, todayLocal } from "../../Expenses/utils";

const initials = (first?: string, last?: string) => `${(first ?? "").charAt(0)}${(last ?? "").charAt(0)}`.toUpperCase();

// "2026-11-22T18:30:00" -> "6:30 pm"
const timeOf = (localDateTime: string) =>
    new Date(localDateTime).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" });

const duration = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return h === 0 ? `${m} min` : m === 0 ? `${h} h` : `${h} h ${m} min`;
};

const dayLabel = (isoDate: string) => {
    const today = todayLocal();
    const y = new Date(`${today}T00:00:00`);
    y.setDate(y.getDate() - 1);
    const yesterday = `${y.getFullYear()}-${String(y.getMonth() + 1).padStart(2, "0")}-${String(y.getDate()).padStart(2, "0")}`;
    if (isoDate === today) return "Today";
    if (isoDate === yesterday) return "Yesterday";
    return formatDate(isoDate);
};

/**
 * Activity tab: what members shared with their tribes, newest first, grouped
 * by day. "Only me" activities never appear here (the server leaves them out).
 */
const TribeFeed = ({ tribeId }: { tribeId: string }) => {
    const [items, setItems] = useState<FeedItem[] | null>(null);
    const [nextBefore, setNextBefore] = useState<string | null>(null);
    const [error, setError] = useState("");
    const [loadingMore, setLoadingMore] = useState(false);

    const loadPage = useCallback(async (before: string | null) => {
        const r = await getTribeFeed(tribeId, before);
        if (!r.ok || !r.data) {
            setError(r.errors.join(", "));
            return;
        }
        setItems((prev) => (before && prev ? [...prev, ...r.data!.items] : r.data!.items));
        setNextBefore(r.data.nextBefore);
    }, [tribeId]);

    useEffect(() => {
        setItems(null);
        setError("");
        loadPage(null);
    }, [loadPage]);

    const days = useMemo(() => {
        const groups: { date: string; items: FeedItem[]; total: number }[] = [];
        for (const a of items ?? []) {
            let g = groups.find((x) => x.date === a.activityDate);
            if (!g) groups.push((g = { date: a.activityDate, items: [], total: 0 }));
            g.items.push(a);
            g.total += Number(a.kcal ?? 0);
        }
        return groups;
    }, [items]);

    const more = async () => {
        setLoadingMore(true);
        await loadPage(nextBefore);
        setLoadingMore(false);
    };

    return (
        <section className="ex-card" aria-labelledby="tb-feed-title">
            <h2 className="tb-section-title" id="tb-feed-title">Latest activity</h2>
            {error && <p className="ex-errors" role="alert">{error}</p>}
            {!items && !error && (
                <div role="status" aria-busy="true">
                    <span className="sr-only">Loading activity…</span>
                    {[0, 1, 2].map((i) => <Bone key={i} h={48} style={{ marginBottom: 10 }} />)}
                </div>
            )}
            {items && items.length === 0 && (
                <div className="ex-empty">
                    <i className="bx bx-run" aria-hidden="true"></i>
                    <p>Nothing shared yet. Log a workout and it shows up here for the whole tribe.</p>
                    <Link to="/tribe/activities/new" className="ex-btn ex-btn--primary">Log activity</Link>
                </div>
            )}
            {days.map((day) => (
                <div key={day.date} className="tr-day">
                    <div className="tr-day__head">
                        <span>{dayLabel(day.date)}</span>
                        <span>{Math.round(day.total).toLocaleString("en-IN")} kcal</span>
                    </div>
                    <ul className="tr-activities">
                        {day.items.map((a) => (
                            <li key={a.activityId} className="tr-activity">
                                <span className="tb-badge" style={{ width: 36, height: 36, borderRadius: "50%", fontSize: 13 }}>
                                    {initials(a.firstName, a.lastName)}
                                </span>
                                <div className="tr-activity__main">
                                    <span className="tr-activity__name">
                                        {a.isMe ? "You" : `${a.firstName} ${a.lastName}`}
                                        <span className="tb-meta" style={{ fontWeight: 400 }}> · {a.description}</span>
                                    </span>
                                    <span className="tr-activity__meta">
                                        {a.profileId && !a.isMe ? `@${a.profileId} · ` : ""}
                                        {timeOf(a.startedAt)} · {duration(a.durationMinutes)}
                                        {a.distanceKm != null ? ` · ${Number(a.distanceKm)} km` : ""}
                                        {!a.countsForGoals ? " · doesn't count for goals" : ""}
                                    </span>
                                </div>
                                <span className="tr-activity__kcal">
                                    {a.kcal != null ? `${Math.round(a.kcal).toLocaleString("en-IN")} kcal` : "—"}
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>
            ))}
            {nextBefore && (
                <button type="button" className="ex-btn ex-btn--secondary" style={{ marginTop: "1rem" }} onClick={more} disabled={loadingMore}>
                    {loadingMore ? "Loading…" : "Show older activity"}
                </button>
            )}
            {items && items.length > 0 && (
                <p className="tr-note" style={{ marginTop: "1rem" }}>
                    Calories are estimates (MET × weight × time). Activities marked "Only me" are never shown here.
                </p>
            )}
        </section>
    );
};

export default TribeFeed;
