import "../../../Common/DialogBox/DialogBox.scss";
import "../../Expenses/Expenses.scss";
import "../Tribe.scss";
import "./DailyGoal.scss";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useStore } from "../../../Store/GlobalStore/GlobalStore";
import { getDailyGoal } from "../../../API/Tribe/Goals/api";
import { getLatestWeight, WEIGHT_SAVED_EVENT } from "../../../API/Tribe/Weight/api";
import DailyGoalForm from "./DailyGoalForm";

const SKIPPED_KEY = "evolyn.dailyGoalPromptSkipped";

/**
 * Asks once after logging in for a daily calorie goal, if there isn't one yet.
 * Tribe goals are built from members' daily goals, so without one you add 0.
 * Comes after the Profile ID and weight prompts, so only one dialog shows at a time.
 * "Later" hides it until the next visit (the browser tab's session).
 */
const DailyGoalPrompt = () => {
    const { state } = useStore();
    const userId: string = state.userDetails?.id;
    const hasProfileId = Boolean(state.userDetails?.profileId);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        if (!state.authenticated || !userId || !hasProfileId) return;
        let live = true;
        const check = async () => {
            let skipped = false;
            try { skipped = sessionStorage.getItem(SKIPPED_KEY) === "1"; } catch { /* storage blocked */ }
            if (skipped) return;
            // Weight first: its prompt shows instead while there's none
            const weight = await getLatestWeight(userId);
            if (!weight.ok) return;
            const goal = await getDailyGoal();
            if (live) setOpen(goal.ok && goal.data?.kcal == null);
        };
        check();
        window.addEventListener(WEIGHT_SAVED_EVENT, check);
        return () => {
            live = false;
            window.removeEventListener(WEIGHT_SAVED_EVENT, check);
        };
    }, [state.authenticated, userId, hasProfileId]);

    if (!open) return null;

    const later = () => {
        try { sessionStorage.setItem(SKIPPED_KEY, "1"); } catch { /* storage blocked */ }
        setOpen(false);
    };

    return createPortal(
        <div className="dialog-overlay tr-prompt" role="dialog" aria-modal="true" aria-labelledby="dg-prompt-title">
            <div className="dialog-box">
                <div className="dialog-content">
                    <p id="dg-prompt-title" className="dialog-title">Set your daily calorie goal</p>
                </div>
                <div className="tr-prompt__body">
                    <p className="ex-muted" style={{ margin: 0 }}>
                        How many calories do you want to burn with exercise each day? Your tribes' monthly goals are
                        built from everyone's daily goals. You can change it any time.
                    </p>
                    <DailyGoalForm current={null} onSaved={() => setOpen(false)} onCancel={later} cancelLabel="Later" autoFocus />
                </div>
            </div>
        </div>,
        document.body
    );
};

export default DailyGoalPrompt;
