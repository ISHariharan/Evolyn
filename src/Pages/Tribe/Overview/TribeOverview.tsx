import "../../Expenses/Expenses.scss";
import "../Tribe.scss";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useStore } from "../../../Store/GlobalStore/GlobalStore";
import Dialog from "../../../Common/DialogBox/DialogBox";
import { WEIGHT_SAVED_EVENT, getWeightHistory } from "../../../API/Tribe/Weight/api";
import { WeightEntry } from "../../../API/Tribe/Weight/types";
import { deleteActivity, getActivities } from "../../../API/Tribe/Activities/api";
import { Activity, ActivityList } from "../../../API/Tribe/Activities/types";
import { getCatalogue } from "../../../API/Tribe/Activities/catalogue";
import { getMyStreak } from "../../../API/Tribe/Streaks/api";
import { MyStreak } from "../../../API/Tribe/Streaks/types";
import { Catalogue } from "../../../API/Tribe/Activities/catalogueTypes";
import { formatDate, periodRange, Period } from "../../Expenses/utils";
import { Bone } from "../../Expenses/Skeletons";
import TodayWeightCard from "../Weight/TodayWeightCard";
import DailyGoalCard from "../DailyGoal/DailyGoalCard";

const PERIODS: { value: Period; label: string }[] = [
    { value: "THIS_MONTH", label: "This month" },
    { value: "LAST_MONTH", label: "Last month" },
    { value: "LAST_3_MONTHS", label: "Last 3 months" },
];

const kcal = (n: number) => Math.round(n).toLocaleString("en-IN");

// 95 -> "1 h 35 min"
const duration = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return h === 0 ? `${m} min` : m === 0 ? `${h} h` : `${h} h ${m} min`;
};

// "2026-11-22T18:30:00" -> "6:30 pm"
const timeOf = (localDateTime: string) =>
    new Date(localDateTime).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" });

/**
 * /tribe - your own activities, estimated calories and weight.
 * Totals are for the chosen period; "counts for goals" leaves out activities
 * under headings that don't count (sleeping, driving...).
 */
const TribeOverview = () => {
    const { state } = useStore();
    const userId: string = state.userDetails?.id;
    const navigate = useNavigate();
    const location = useLocation();

    const [period, setPeriod] = useState<Period>("THIS_MONTH");
    const [list, setList] = useState<ActivityList | null>(null);
    const [listError, setListError] = useState("");
    const [catalogue, setCatalogue] = useState<Catalogue | null>(null);
    const [streak, setStreak] = useState<MyStreak | null>(null);
    const [weights, setWeights] = useState<WeightEntry[] | null>(null);
    const [toDelete, setToDelete] = useState<Activity | null>(null);
    const [flash, setFlash] = useState<string>((location.state as { flash?: string } | null)?.flash ?? "");

    // Show "Activity logged" once, then forget it (a refresh shouldn't show it again)
    useEffect(() => {
        if (flash) navigate(location.pathname, { replace: true, state: null });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const { from, to } = periodRange(period) as { from: string; to: string };

    const loadActivities = useCallback(() => {
        if (!userId) return;
        setList(null);
        setListError("");
        getActivities(userId, from, to).then((r) => {
            if (!r.ok || !r.data) setListError(r.errors.join(", "));
            else setList(r.data);
        });
    }, [userId, from, to]);

    const loadWeights = useCallback(() => {
        if (!userId) return;
        getWeightHistory(userId).then((r) => setWeights(r.ok && r.data ? r.data : []));
    }, [userId]);

    useEffect(() => { loadActivities(); }, [loadActivities]);
    useEffect(() => {
        loadWeights();
        window.addEventListener(WEIGHT_SAVED_EVENT, loadWeights);
        return () => window.removeEventListener(WEIGHT_SAVED_EVENT, loadWeights);
    }, [loadWeights]);
    useEffect(() => {
        getCatalogue().then((r) => r.ok && r.data && setCatalogue(r.data));
    }, []);
    // Streaks are about today; reload after an activity is added or deleted
    useEffect(() => {
        getMyStreak().then((r) => setStreak(r.ok && r.data ? r.data : null));
    }, [list]);

    const countsByHeading = useMemo(
        () => new Map((catalogue?.headings ?? []).map((h) => [h.code, h.countsForGoals])),
        [catalogue]
    );
    const counts = (a: Activity) => countsByHeading.get(a.headingCode) !== false;
    const goalKcal = list ? list.activities.filter(counts).reduce((sum, a) => sum + Number(a.kcal ?? 0), 0) : 0;

    // Newest day first, activities within a day newest first (as the API sends them)
    const days = useMemo(() => {
        const groups: { date: string; items: Activity[]; total: number }[] = [];
        for (const a of list?.activities ?? []) {
            let g = groups.find((x) => x.date === a.activityDate);
            if (!g) groups.push((g = { date: a.activityDate, items: [], total: 0 }));
            g.items.push(a);
            g.total += Number(a.kcal ?? 0);
        }
        return groups;
    }, [list]);

    const handleDelete = async () => {
        const activity = toDelete;
        setToDelete(null);
        if (!activity) return;
        const r = await deleteActivity(activity.id, userId);
        if (!r.ok) {
            setListError(r.errors.join(", "));
            return;
        }
        setFlash("Activity deleted");
        loadActivities();
    };

    return (
        <div className="ex-page">
            <header className="ex-header">
                <div>
                    <h1 className="ex-title">Tribe</h1>
                    <p className="ex-subtitle">Your workouts and estimated calories</p>
                </div>
                <div className="ex-header__actions">
                    <select
                        className="ex-input"
                        style={{ width: "auto" }}
                        aria-label="Period"
                        value={period}
                        onChange={(e) => setPeriod(e.target.value as Period)}
                    >
                        {PERIODS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
                    </select>
                    <Link to="/tribe/activities/new" className="ex-btn ex-btn--primary">
                        <i className="bx bx-plus" aria-hidden="true"></i>Log activity
                    </Link>
                </div>
            </header>

            {flash && <p className="tr-success" role="status" style={{ marginBottom: "1rem" }}>{flash}.</p>}

            <div className="tr-stats">
                <section className="ex-card">
                    <span className="tr-stat__label">Estimated calories</span>
                    {list ? <span className="tr-stat__value">{kcal(list.totalKcal)} kcal</span> : <Bone w="60%" h={26} />}
                    {list && catalogue && goalKcal !== Number(list.totalKcal) && (
                        <span className="tr-note">{kcal(goalKcal)} kcal count for tribe goals</span>
                    )}
                </section>
                <section className="ex-card">
                    <span className="tr-stat__label">Active days</span>
                    {list ? <span className="tr-stat__value">{list.activeDays}</span> : <Bone w="30%" h={26} />}
                </section>
                <section className="ex-card">
                    <span className="tr-stat__label">Time active</span>
                    {list ? <span className="tr-stat__value">{duration(list.totalMinutes)}</span> : <Bone w="50%" h={26} />}
                </section>
                <section className="ex-card">
                    <span className="tr-stat__label">Your streak</span>
                    {streak ? (
                        <>
                            <span className="tr-stat__value">{streak.current} {streak.current === 1 ? "day" : "days"}</span>
                            <span className="tr-note">
                                best {streak.best}
                                {streak.activeToday ? " · kept today" : streak.atRisk ? ` · log ${streak.minMinutes}+ min today to keep it` : ""}
                            </span>
                        </>
                    ) : <Bone w="40%" h={26} />}
                </section>
                <section className="ex-card">
                    <span className="tr-stat__label">Activities</span>
                    {list ? <span className="tr-stat__value">{list.count}</span> : <Bone w="30%" h={26} />}
                </section>
            </div>

            <div className="tr-layout">
                <section className="ex-card" aria-labelledby="tr-activities-title">
                    <h2 className="ex-card__title" id="tr-activities-title">
                        Activities, {formatDate(from)} – {formatDate(to)}
                    </h2>
                    {listError && <p className="ex-errors" role="alert">{listError}</p>}
                    {!list && !listError && (
                        <div role="status" aria-busy="true">
                            <span className="sr-only">Loading activities…</span>
                            {[0, 1, 2].map((i) => <Bone key={i} h={44} style={{ marginBottom: 10 }} />)}
                        </div>
                    )}
                    {list && list.count === 0 && (
                        <div className="ex-empty">
                            <i className="bx bx-run" aria-hidden="true"></i>
                            <p>No activities in this period yet.</p>
                            <Link to="/tribe/activities/new" className="ex-btn ex-btn--primary">Log your first activity</Link>
                        </div>
                    )}
                    {days.map((day) => (
                        <div key={day.date} className="tr-day">
                            <div className="tr-day__head">
                                <span>{formatDate(day.date)}</span>
                                <span>{kcal(day.total)} kcal</span>
                            </div>
                            <ul className="tr-activities">
                                {day.items.map((a) => (
                                    <li key={a.id} className="tr-activity">
                                        <div className="tr-activity__main">
                                            <span className="tr-activity__name">{a.description}</span>
                                            <span className="tr-activity__meta">
                                                {timeOf(a.startedAt)} · {duration(a.durationMinutes)}
                                                {a.distanceKm != null ? ` · ${Number(a.distanceKm)} km` : ""}
                                                {a.visibility === "PRIVATE" ? " · only you" : ""}
                                                {!counts(a) ? " · doesn't count for goals" : ""}
                                            </span>
                                            {a.notes && <span className="tr-activity__notes">{a.notes}</span>}
                                        </div>
                                        <span
                                            className="tr-activity__kcal"
                                            title={a.calculation
                                                ? `MET ${Number(a.calculation.met).toFixed(1)} × ${Number(a.calculation.weightKg)} kg × ${Number(a.calculation.hours)} h (weight from ${formatDate(a.calculation.weightRecordedOn)})`
                                                : undefined}
                                        >
                                            {a.kcal != null ? `${kcal(a.kcal)} kcal` : "—"}
                                        </span>
                                        <div className="tr-activity__actions">
                                            <Link
                                                to={`/tribe/activities/${a.id}/edit`}
                                                className="ex-icon-btn"
                                                aria-label={`Edit ${a.description}`}
                                            >
                                                <i className="bx bx-edit-alt" aria-hidden="true"></i>
                                            </Link>
                                            <button
                                                type="button"
                                                className="ex-icon-btn"
                                                aria-label={`Delete ${a.description}`}
                                                onClick={() => setToDelete(a)}
                                            >
                                                <i className="bx bx-trash" aria-hidden="true"></i>
                                            </button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </section>

                <div className="tr-side">
                    <DailyGoalCard />
                    <TodayWeightCard userId={userId} />
                    <section className="ex-card">
                        <h2 className="ex-card__title">Recent weights</h2>
                        {weights && weights.length === 0 && <p className="ex-muted">Nothing saved yet.</p>}
                        {weights && weights.length > 0 && (
                            <ul className="tr-list">
                                {weights.slice(0, 7).map((w) => (
                                    <li key={w.weightLogId}>
                                        <span>{formatDate(w.recordedOn)}</span>
                                        {Number(w.weightKg)} kg
                                    </li>
                                ))}
                            </ul>
                        )}
                    </section>
                </div>
            </div>

            <p className="tr-note" style={{ marginTop: "1.25rem" }}>
                Calories are estimates: MET × body weight × time, using the 2024 Adult Compendium of Physical Activities.
            </p>

            <Dialog
                isOpen={toDelete !== null}
                onClose={() => setToDelete(null)}
                Heading="Delete this activity?"
                Description={toDelete ? `${toDelete.description} on ${formatDate(toDelete.activityDate)} will be removed from your totals.` : ""}
                SecondaryButton="Cancel"
                PrimaryButton="Delete"
                onPrimary={handleDelete}
            />
        </div>
    );
};

export default TribeOverview;
