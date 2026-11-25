import "./WeightTab.scss";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getTribeWeightProgress, setWeightSharing, WEIGHT_SAVED_EVENT, WEIGHT_SHARING_EVENT } from "../../../API/Tribe/Weight/api";
import { TribeWeightProgress } from "../../../API/Tribe/Weight/types";
import { Bone } from "../../Expenses/Skeletons";
import { todayLocal } from "../../Expenses/utils";
import WeightChart, { formatChange, MAX_LINES, Series } from "./WeightChart";

const shiftMonth = (month: string, by: number) => {
    const d = new Date(`${month}-01T00:00:00`);
    d.setMonth(d.getMonth() + by);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};

const monthName = (month: string) =>
    new Date(`${month}-01T00:00:00`).toLocaleDateString("en-IN", { month: "long", year: "numeric" });

const shortDate = (iso: string) =>
    new Date(`${iso}T00:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "short" });

/**
 * Weight tab: how each member's weight changed this month, for people who chose to
 * share it. Only the change in kg is ever shown to others (never the weight).
 */
const WeightTab = ({ tribeId }: { tribeId: string }) => {
    const thisMonth = todayLocal().slice(0, 7);
    const [month, setMonth] = useState(thisMonth);
    const [data, setData] = useState<TribeWeightProgress | null>(null);
    const [error, setError] = useState("");
    const [version, setVersion] = useState(0);
    const [saving, setSaving] = useState(false);

    // Reload after a weight is saved or sharing changes anywhere on the page
    useEffect(() => {
        const bump = () => setVersion((v) => v + 1);
        window.addEventListener(WEIGHT_SAVED_EVENT, bump);
        window.addEventListener(WEIGHT_SHARING_EVENT, bump);
        return () => {
            window.removeEventListener(WEIGHT_SAVED_EVENT, bump);
            window.removeEventListener(WEIGHT_SHARING_EVENT, bump);
        };
    }, []);

    useEffect(() => {
        let stale = false;
        setError("");
        getTribeWeightProgress(tribeId, month).then((r) => {
            if (stale) return;
            if (!r.ok || !r.data) setError(r.errors.join(", "));
            else setData(r.data);
        });
        return () => { stale = true; };
    }, [tribeId, month, version]);

    const toggleSharing = async (share: boolean) => {
        setSaving(true);
        const r = await setWeightSharing(share);
        setSaving(false);
        if (!r.ok) setError(r.errors.join(", "));
    };

    const loading = !data || data.month !== month;

    // Colour slots follow joining order, so a person keeps their colour when others start or stop
    // sharing. There are 8 colours (never repeated): members after the 8th to join are listed, not drawn.
    const visible = data ? data.members.map((m, i) => ({ m, slot: i })).filter(({ m }) => m.shared || m.isMe) : [];
    const drawable = visible.filter(({ m }) => (m.points ?? []).length > 0);
    const series: Series[] = drawable
        .filter(({ slot }) => slot < MAX_LINES)
        .map(({ m, slot }) => ({ member: m, slot, name: m.isMe ? "You" : m.firstName }));
    const slotOf = new Map(series.map((s) => [s.member.userId, s.slot]));
    const hidden = data ? data.members.filter((m) => !m.shared && !m.isMe) : [];

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <div className="gl-months" role="group" aria-label="Month">
                <button type="button" className="ex-icon-btn" aria-label="Previous month" onClick={() => setMonth(shiftMonth(month, -1))}>
                    <i className="bx bx-chevron-left" aria-hidden="true"></i>
                </button>
                <span className="gl-months__name" aria-live="polite">{monthName(month)}{month === thisMonth ? " · this month" : ""}</span>
                <button type="button" className="ex-icon-btn" aria-label="Next month" disabled={month >= thisMonth}
                        onClick={() => setMonth(shiftMonth(month, 1))}>
                    <i className="bx bx-chevron-right" aria-hidden="true"></i>
                </button>
                {month !== thisMonth && (
                    <button type="button" className="ex-btn ex-btn--secondary" onClick={() => setMonth(thisMonth)}>This month</button>
                )}
            </div>

            {error && <p className="ex-errors" role="alert" style={{ margin: 0 }}>{error}</p>}

            {data && (
                <section className="ex-card wt-share" aria-labelledby="wt-share-title">
                    <div>
                        <h2 className="tb-section-title" id="wt-share-title" style={{ margin: 0 }}>
                            {data.iShare ? "You're sharing your weight change" : "Your weight is private"}
                        </h2>
                        <p className="ex-muted" style={{ margin: "0.25rem 0 0" }}>
                            {data.iShare
                                ? "Your tribes see how much it changed in kg this month, never your weight."
                                : "Share how much your weight changes (in kg, never the weight itself) with your tribes."}
                        </p>
                    </div>
                    <button type="button" className={`ex-btn ${data.iShare ? "ex-btn--secondary" : "ex-btn--primary"}`}
                            disabled={saving} onClick={() => toggleSharing(!data.iShare)}>
                        {saving ? "Saving…" : data.iShare ? "Stop sharing" : "Share my weight change"}
                    </button>
                </section>
            )}

            <section className="ex-card" aria-labelledby="wt-title">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "0.5rem", flexWrap: "wrap" }}>
                    <h2 className="tb-section-title" id="wt-title" style={{ margin: 0 }}>Weight change, {monthName(month)}</h2>
                    {data && <span className="tb-meta">{data.sharingCount} of {data.memberCount} members share</span>}
                </div>
                {loading ? (
                    <div role="status" aria-busy="true" style={{ marginTop: "1rem" }}>
                        <span className="sr-only">Loading…</span>
                        <Bone h={220} />
                    </div>
                ) : series.length === 0 ? (
                    <p className="ex-muted" style={{ margin: "0.75rem 0 0" }}>
                        No weigh-ins to show for {monthName(month)} yet.
                        {data && !data.iShare ? " Nobody else in this tribe shares theirs yet either, or they haven't weighed in." : ""}
                    </p>
                ) : (
                    <WeightChart data={data!} series={series} />
                )}
                <p className="tr-note" style={{ margin: "0.75rem 0 0" }}>
                    Each line starts at 0 on the person's first weigh-in of the month and shows the change from there.
                    Weights come from the daily weigh-ins on each person's Tribe page.
                </p>
            </section>

            {data && !loading && (
                <section className="ex-card" aria-labelledby="wt-people-title">
                    <h2 className="tb-section-title" id="wt-people-title">Everyone</h2>
                    <ul className="wt-people">
                        {visible.map(({ m }) => {
                            const slot = slotOf.get(m.userId);
                            const count = m.weighIns ?? 0;
                            return (
                                <li key={m.userId} className={m.isMe ? "is-me" : ""}>
                                    <span className={`wt-swatch ${slot != null ? `wt-c${slot}` : "wt-swatch--none"}`} aria-hidden="true"></span>
                                    <span className="wt-people__name">
                                        {m.isMe ? "You" : `${m.firstName} ${m.lastName}`}
                                        <small>
                                            {count === 0
                                                ? `No weigh-ins in ${monthName(month).split(" ")[0]}`
                                                : `${count} ${count === 1 ? "weigh-in" : "weigh-ins"} · ${shortDate(m.startDate!)} to ${shortDate(m.latestDate!)}`}
                                            {m.isMe && !m.shared ? " · not shared" : ""}
                                        </small>
                                        {m.isMe && m.startKg != null && (
                                            <small>{Number(m.startKg)} → {Number(m.latestKg)} kg (only you see this)</small>
                                        )}
                                    </span>
                                    <span className="wt-people__change">{count === 0 ? "—" : formatChange(m.changeKg)}</span>
                                </li>
                            );
                        })}
                        {hidden.map((m) => (
                            <li key={m.userId} className="is-hidden">
                                <span className="wt-swatch wt-swatch--none" aria-hidden="true"></span>
                                <span className="wt-people__name">{m.firstName} {m.lastName}<small>Not shared</small></span>
                                <span className="wt-people__change">—</span>
                            </li>
                        ))}
                    </ul>
                    {drawable.length > series.length && (
                        <p className="tr-note">The chart has colours for the first {MAX_LINES} members to join; everyone is listed here.</p>
                    )}
                    <p className="tr-note" style={{ margin: "0.5rem 0 0" }}>
                        Log your weight on <Link to="/tribe">your Tribe page</Link>. Sharing applies to all your tribes.
                    </p>
                </section>
            )}
        </div>
    );
};

export default WeightTab;
