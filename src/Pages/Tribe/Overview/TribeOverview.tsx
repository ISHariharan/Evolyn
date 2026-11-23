import "../../Expenses/Expenses.scss";
import "../Tribe.scss";
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useStore } from "../../../Store/GlobalStore/GlobalStore";
import { WEIGHT_SAVED_EVENT, getWeightHistory } from "../../../API/Tribe/Weight/api";
import { WeightEntry } from "../../../API/Tribe/Weight/types";
import { formatDate } from "../../Expenses/utils";
import TodayWeightCard from "../Weight/TodayWeightCard";

/** /tribe - your own activity and calories, before any tribe exists. */
const TribeOverview = () => {
    const { state } = useStore();
    const userId: string = state.userDetails?.id;
    const [weights, setWeights] = useState<WeightEntry[] | null>(null);

    const loadWeights = useCallback(() => {
        if (!userId) return;
        getWeightHistory(userId).then((r) => setWeights(r.ok && r.data ? r.data : []));
    }, [userId]);

    useEffect(() => {
        loadWeights();
        window.addEventListener(WEIGHT_SAVED_EVENT, loadWeights);
        return () => window.removeEventListener(WEIGHT_SAVED_EVENT, loadWeights);
    }, [loadWeights]);

    return (
        <div className="ex-page">
            <header className="ex-header">
                <div>
                    <h1 className="ex-title">Tribe</h1>
                    <p className="ex-subtitle">Your workouts and estimated calories</p>
                </div>
                <div className="ex-header__actions">
                    <Link to="/tribe/activities/new" className="ex-btn ex-btn--primary">
                        <i className="bx bx-plus" aria-hidden="true"></i>Log activity
                    </Link>
                </div>
            </header>

            <div className="ex-two-col">
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
    );
};

export default TribeOverview;
