import { NavSection } from "../../Components/NavBar/types";

/**
 * The navbar's structure. Kept as data (not JSX) so it could later come from the API.
 * Stride's children are filled in at runtime from the user's workspaces.
 * Entries marked `soon` aren't built yet: they show a "Soon" badge and can't be clicked.
 */
export function getNavBarContent(): NavSection[] {
    return [
        {
            key: "general",
            title: "General",
            items: [
                { key: "home", label: "Home", icon: "bx bx-home-alt-2", path: "/", exact: true },
                { key: "explore", label: "Explore", icon: "bx bx-compass", path: "/explore" },
                { key: "messages", label: "Messages", icon: "bx bx-message-rounded-dots", soon: true },
            ],
        },
        {
            key: "modules",
            title: "Modules",
            items: [
                {
                    key: "stride",
                    label: "Stride",
                    icon: "bx bx-trending-up",
                    path: "/stride",
                    requiresAuth: true,
                    childrenTitle: "Workspaces",
                    children: [],
                },
                {
                    key: "expenses",
                    label: "Expenses",
                    icon: "bx bx-wallet-alt",
                    path: "/expenses", // opens the expenses dashboard
                    requiresAuth: true,
                    children: [
                        { key: "transactions", label: "Transactions", icon: "bx bx-transfer-alt", path: "/expenses/transactions" },
                        { key: "accounts", label: "Accounts", icon: "bx bx-credit-card", path: "/expenses/accounts" },
                        { key: "categories", label: "Categories", icon: "bx bx-purchase-tag-alt", soon: true },
                        { key: "budgets", label: "Budgets", icon: "bx bx-target-lock", soon: true },
                        { key: "recurring", label: "Recurring", icon: "bx bx-refresh", soon: true },
                        { key: "reports", label: "Reports", icon: "bx bx-bar-chart-alt-2", soon: true },
                        { key: "insights", label: "Insights", icon: "bx bx-bulb", soon: true },
                    ],
                },
            ],
        },
    ];
}
