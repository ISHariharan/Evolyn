import "./NavBar.scss";
import { FocusEvent, MouseEvent, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getNavBarContent } from "../../API/NavBar/api";
import { useStore } from "../../Store/GlobalStore/GlobalStore";
import Dialog from "../../Common/DialogBox/DialogBox";
import logo from "../../Statics/AppLogo_BGRemoved.png";
import { NavChild, NavItem, NavSection } from "./types";

/**
 * Sidebar navigation.
 *  - Desktop: expanded (icons + labels) or collapsed (icons only, with hover flyouts).
 *    The choice is remembered in localStorage.
 *  - Mobile (< 768px): hidden; the header's menu button opens it as a drawer.
 *  - The highlighted item comes from the current URL, so it's always right.
 */

const STORAGE_KEY = "evolyn.nav.expanded";
const MOBILE_QUERY = "(max-width: 767px)";

const readExpanded = () => {
    try {
        return localStorage.getItem(STORAGE_KEY) !== "false";
    } catch {
        return true; // storage blocked (e.g. private mode): default to expanded
    }
};

// The store has held workspaces in a few shapes over time; accept all of them
const toWorkspaceList = (raw: any): any[] =>
    Array.isArray(raw) ? raw
    : Array.isArray(raw?.workspaces) ? raw.workspaces
    : Array.isArray(raw?.data) ? raw.data
    : [];

const isPathActive = (pathname: string, path?: string, exact?: boolean) =>
    !!path && (exact ? pathname === path : pathname === path || pathname.startsWith(`${path}/`));

interface Flyout {
    label: string;
    item?: NavItem; // present for real nav items (shows the submenu); absent for plain tooltips
    top: number;
}

const NavBar = () => {
    const navigate = useNavigate();
    const { pathname } = useLocation();
    const { state, dispatch } = useStore();
    const drawerOpen: boolean = state.sidebarOpen;

    const [expanded, setExpanded] = useState<boolean>(readExpanded);
    const [isMobile, setIsMobile] = useState<boolean>(() => window.matchMedia(MOBILE_QUERY).matches);
    const [openGroups, setOpenGroups] = useState<Set<string>>(new Set());
    const [flyout, setFlyout] = useState<Flyout | null>(null);
    const [showLogout, setShowLogout] = useState(false);
    const closeTimer = useRef<number | undefined>(undefined);

    // On mobile the drawer always shows labels
    const showLabels = isMobile || expanded;
    const workspaces = toWorkspaceList(state.workspace);

    // ── Menu data: hide signed-in-only entries, fill Stride with workspaces ──
    const sections: NavSection[] = useMemo(() => {
        return getNavBarContent()
            .map((section) => ({
                ...section,
                items: section.items
                    .filter((item) => state.authenticated || !item.requiresAuth)
                    .map((item) =>
                        item.key === "stride"
                            ? {
                                  ...item,
                                  children: workspaces.map((ws: any, i: number) => ({
                                      key: String(ws?.workspaceId ?? i),
                                      label: ws?.workspaceName ?? ws?.name ?? String(ws),
                                      icon: ws?.workspaceIcon || "bx bx-shape-circle",
                                      path: "/stride/dashboard",
                                  })),
                              }
                            : item
                    ),
            }))
            .filter((section) => section.items.length > 0);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state.authenticated, state.workspace]);

    const itemTarget = (item: NavItem) =>
        item.key === "stride" ? (workspaces.length > 0 ? "/stride/dashboard" : "/stride") : item.path;

    const isItemActive = (item: NavItem) =>
        item.key === "stride" ? isPathActive(pathname, "/stride") : isPathActive(pathname, item.path, item.exact);

    // Workspaces all open the same page, so don't highlight one of them
    const isChildActive = (item: NavItem, child: NavChild) =>
        item.key !== "stride" && isPathActive(pathname, child.path);

    // ── Side effects ─────────────────────────────────────────────────────────
    // Track the mobile breakpoint
    useEffect(() => {
        const media = window.matchMedia(MOBILE_QUERY);
        const onChange = () => setIsMobile(media.matches);
        media.addEventListener("change", onChange);
        return () => media.removeEventListener("change", onChange);
    }, []);

    // Remember expanded/collapsed, and tell the page layout (index.css) how wide we are
    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, String(expanded));
        } catch {
            // ignore: it's only a convenience
        }
        document.documentElement.classList.toggle("nav-expanded", expanded);
    }, [expanded]);

    // Open the submenu of the section you're in (e.g. Expenses when on /expenses/...)
    useEffect(() => {
        const active = sections.flatMap((s) => s.items).find((item) => item.children?.length && isItemActive(item));
        if (active) setOpenGroups((prev) => (prev.has(active.key) ? prev : new Set(prev).add(active.key)));
        setFlyout(null);
        // Close the mobile drawer after navigating
        if (drawerOpen) dispatch({ type: "TOGGLE_SIDEBAR", payload: false });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pathname]);

    // Escape closes the drawer / flyout
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key !== "Escape") return;
            setFlyout(null);
            if (drawerOpen) dispatch({ type: "TOGGLE_SIDEBAR", payload: false });
        };
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [drawerOpen, dispatch]);

    // ── Actions ──────────────────────────────────────────────────────────────
    const go = (path?: string) => {
        if (!path) return;
        setFlyout(null);
        navigate(path);
    };

    const toggleGroup = (key: string) =>
        setOpenGroups((prev) => {
            const next = new Set(prev);
            if (next.has(key)) next.delete(key);
            else next.add(key);
            return next;
        });

    const handleItemClick = (item: NavItem) => {
        if (item.soon) return;
        if (item.children?.length && showLabels) setOpenGroups((prev) => new Set(prev).add(item.key));
        go(itemTarget(item));
    };

    // Collapsed mode: show a flyout next to the hovered/focused icon
    const openFlyout = (e: MouseEvent<HTMLElement> | FocusEvent<HTMLElement>, label: string, item?: NavItem) => {
        if (showLabels) return;
        window.clearTimeout(closeTimer.current);
        const rect = e.currentTarget.getBoundingClientRect();
        setFlyout({ label, item, top: rect.top });
    };

    const scheduleCloseFlyout = () => {
        window.clearTimeout(closeTimer.current);
        closeTimer.current = window.setTimeout(() => setFlyout(null), 140);
    };

    const handleLogout = (result: "cancel" | "logout") => {
        setShowLogout(false);
        if (result !== "logout") return;
        navigate("/");
        dispatch({ type: "SET_AUTHENTICATED", payload: false });
        dispatch({ type: "SET_USERDETAILS", payload: { email: "", id: "" } });
    };

    const email: string = state.userDetails?.email ?? "";
    const initial = email ? email.charAt(0).toUpperCase() : "?";

    // ── Rendering ────────────────────────────────────────────────────────────
    const renderChild = (item: NavItem, child: NavChild) => {
        const active = isChildActive(item, child);
        return (
            <li key={child.key}>
                <button
                    type="button"
                    className={`nv-sub__link${active ? " is-active" : ""}${child.soon ? " is-soon" : ""}`}
                    aria-current={active ? "page" : undefined}
                    aria-disabled={child.soon || undefined}
                    onClick={() => !child.soon && go(child.path)}
                >
                    <i className={`${child.icon} nv-sub__icon`} aria-hidden="true"></i>
                    <span className="nv-sub__label">{child.label}</span>
                    {child.soon && <span className="nv-badge">Soon</span>}
                </button>
            </li>
        );
    };

    const renderItem = (item: NavItem) => {
        const active = isItemActive(item);
        const hasChildren = !!item.children?.length;
        const open = openGroups.has(item.key);
        const subId = `nv-sub-${item.key}`;
        return (
            <li key={item.key} className="nv-item">
                <div className={`nv-link${active ? " is-active" : ""}${item.soon ? " is-soon" : ""}`}>
                    <button
                        type="button"
                        className="nv-link__main"
                        aria-current={active ? "page" : undefined}
                        aria-disabled={item.soon || undefined}
                        aria-label={showLabels ? undefined : item.soon ? `${item.label} (coming soon)` : item.label}
                        onClick={() => handleItemClick(item)}
                        onMouseEnter={(e) => openFlyout(e, item.label, item)}
                        onMouseLeave={scheduleCloseFlyout}
                        onFocus={(e) => openFlyout(e, item.label, item)}
                        onBlur={scheduleCloseFlyout}
                    >
                        <i className={`${item.icon} nv-link__icon`} aria-hidden="true"></i>
                        {showLabels && <span className="nv-link__label">{item.label}</span>}
                        {showLabels && item.soon && <span className="nv-badge">Soon</span>}
                    </button>
                    {showLabels && hasChildren && (
                        <button
                            type="button"
                            className={`nv-link__toggle${open ? " is-open" : ""}`}
                            aria-expanded={open}
                            aria-controls={subId}
                            aria-label={`${open ? "Hide" : "Show"} ${item.label} pages`}
                            onClick={() => toggleGroup(item.key)}
                        >
                            <i className="bx bx-chevron-down" aria-hidden="true"></i>
                        </button>
                    )}
                </div>
                {showLabels && hasChildren && (
                    <div className={`nv-sub-wrap${open ? " is-open" : ""}`} inert={!open}>
                        <ul className="nv-sub" id={subId}>
                            {item.children!.map((child) => renderChild(item, child))}
                        </ul>
                    </div>
                )}
            </li>
        );
    };

    return (
        <>
            {isMobile && drawerOpen && (
                <div className="nv-backdrop" onClick={() => dispatch({ type: "TOGGLE_SIDEBAR", payload: false })} />
            )}

            <nav
                className={`nv${showLabels ? " is-expanded" : " is-collapsed"}${isMobile ? " is-mobile" : ""}${drawerOpen ? " is-drawer-open" : ""}`}
                aria-label="Main"
            >
                <div className="nv-brand">
                    <button type="button" className="nv-brand__home" onClick={() => go("/")} aria-label="Evolyn home">
                        <img src={logo} alt="" className="nv-brand__logo" />
                        {showLabels && <span className="nv-brand__name">Evolyn</span>}
                    </button>
                    {isMobile && (
                        <button
                            type="button"
                            className="nv-icon-btn"
                            aria-label="Close menu"
                            onClick={() => dispatch({ type: "TOGGLE_SIDEBAR", payload: false })}
                        >
                            <i className="bx bx-x" aria-hidden="true"></i>
                        </button>
                    )}
                </div>

                <div className="nv-scroll">
                    {sections.map((section) => (
                        <div key={section.key} className="nv-section">
                            {showLabels ? (
                                <p className="nv-section__title">{section.title}</p>
                            ) : (
                                <hr className="nv-section__divider" />
                            )}
                            <ul className="nv-list">{section.items.map(renderItem)}</ul>
                        </div>
                    ))}
                </div>

                <div className="nv-footer">
                    {state.authenticated && (
                        <div className="nv-user">
                            <span className="nv-user__avatar" aria-hidden="true">{initial}</span>
                            {showLabels && (
                                <span className="nv-user__text">
                                    <span className="nv-user__label">Signed in as</span>
                                    <span className="nv-user__email" title={email}>{email}</span>
                                </span>
                            )}
                            <button
                                type="button"
                                className="nv-icon-btn nv-user__logout"
                                aria-label="Log out"
                                onClick={() => setShowLogout(true)}
                                onMouseEnter={(e) => openFlyout(e, "Log out")}
                                onMouseLeave={scheduleCloseFlyout}
                            >
                                <i className="bx bx-log-out" aria-hidden="true"></i>
                            </button>
                        </div>
                    )}

                    {!isMobile && (
                        <button
                            type="button"
                            className="nv-collapse"
                            aria-label={expanded ? "Collapse sidebar" : "Expand sidebar"}
                            onClick={() => {
                                setFlyout(null);
                                setExpanded(!expanded);
                            }}
                            onMouseEnter={(e) => openFlyout(e, "Expand sidebar")}
                            onMouseLeave={scheduleCloseFlyout}
                        >
                            <i className={`bx ${expanded ? "bx-chevrons-left" : "bx-chevrons-right"}`} aria-hidden="true"></i>
                            {showLabels && <span>Collapse</span>}
                        </button>
                    )}
                </div>
            </nav>

            {/* Collapsed mode: label (and submenu) shown beside the hovered icon */}
            {flyout && !showLabels && (
                <div
                    className="nv-flyout"
                    style={{ top: flyout.top, maxHeight: window.innerHeight - flyout.top - 12, overflowY: "auto" }}
                    onMouseEnter={() => window.clearTimeout(closeTimer.current)}
                    onMouseLeave={scheduleCloseFlyout}
                    onFocus={() => window.clearTimeout(closeTimer.current)}
                    onBlur={scheduleCloseFlyout}
                >
                    {flyout.item && !flyout.item.soon ? (
                        <button type="button" className="nv-flyout__title" onClick={() => handleItemClick(flyout.item!)}>
                            {flyout.item.label}
                        </button>
                    ) : (
                        <span className="nv-flyout__title nv-flyout__title--static">
                            {flyout.label}
                            {flyout.item?.soon && <span className="nv-badge">Soon</span>}
                        </span>
                    )}
                    {flyout.item?.children && flyout.item.children.length > 0 && (
                        <>
                            {flyout.item.childrenTitle && <p className="nv-flyout__heading">{flyout.item.childrenTitle}</p>}
                            <ul className="nv-sub nv-sub--flyout">
                                {flyout.item.children.map((child) => renderChild(flyout.item!, child))}
                            </ul>
                        </>
                    )}
                </div>
            )}

            {showLogout && (
                <Dialog
                    isOpen={showLogout}
                    onClose={() => setShowLogout(false)}
                    Heading="Leaving already?"
                    Description="Want to log out of Evolyn now?"
                    SecondaryButton="Cancel"
                    PrimaryButton="Logout"
                    onSecondary={() => handleLogout("cancel")}
                    onPrimary={() => handleLogout("logout")}
                />
            )}
        </>
    );
};

export default NavBar;
