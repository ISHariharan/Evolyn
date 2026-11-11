// One entry in a submenu (e.g. Expenses -> Transactions)
export interface NavChild {
    key: string;
    label: string;
    icon: string;
    path?: string;   // no path = not built yet
    soon?: boolean;  // shows a "Soon" badge and can't be clicked
}

// A top-level navbar entry
export interface NavItem {
    key: string;
    label: string;
    icon: string;
    path?: string;
    soon?: boolean;
    requiresAuth?: boolean;
    exact?: boolean;          // only active on exactly this path (used for Home "/")
    children?: NavChild[];
    childrenTitle?: string;   // heading shown above the children in the collapsed flyout
}

// A labelled group of entries ("General", "Modules")
export interface NavSection {
    key: string;
    title: string;
    items: NavItem[];
}
