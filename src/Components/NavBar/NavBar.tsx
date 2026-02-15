import "./NavBar.scss"
import { NavBarProperty } from "./types"
import { getNavBarContent } from "../../API/NavBar/api";
import { useEffect, useState, useRef } from "react"
import { useNavigate } from "react-router-dom";
import { useStore } from "../../Store/GlobalStore/GlobalStore";
import Dialog from "../../Common/DialogBox/DialogBox";

const NavBar = () => {
    const navigate = useNavigate();
    const {state, dispatch} = useStore();
    const [navBarDetails, setNavBarDetails] = useState<any>([]);
    const [showDialog, setShowDialog] = useState<boolean>(false);
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);
    const [workspaceQuery, setWorkspaceQuery] = useState<string>("");
    const [forceCollapsed, setForceCollapsed] = useState<boolean>(false);
    const navRef = useRef<HTMLDivElement>(null);
    const showMenu = (headerToggle: string, navbarId: string) =>{
        const toggleBtn = document.getElementById(headerToggle),
        nav = document.getElementById(navbarId)
        if(headerToggle && navbarId){
            toggleBtn?.addEventListener('click', ()=>{
                nav?.classList.toggle('show-menu')
                toggleBtn.classList.toggle('bx-x')
            })
        }
    }
    showMenu('header-toggle','navbar')
    const linkColor: NodeListOf<Element> = document.querySelectorAll('.nav__link');


    const colorLink = (e: Event) => {
        linkColor.forEach(l => l.classList.remove('active'));
        (e.currentTarget as Element).classList.add('active');
    };

    linkColor.forEach((l) => l.addEventListener('click', colorLink));

    const getNavBarData = () => {
        const navBarContent = getNavBarContent();
        navBarContent.forEach((item) => {
            if(state.authenticated) {
                item.visible = true;
            }
            else {
                item.visible = item.order !== "2" && item.order !== "3";
            }
        });
        try {
            const workspacesRaw = state.workspace;
            const workspacesArray = Array.isArray(workspacesRaw)
                ? workspacesRaw
                : Array.isArray((workspacesRaw as any)?.workspaces)
                ? (workspacesRaw as any).workspaces
                : Array.isArray((workspacesRaw as any)?.data)
                ? (workspacesRaw as any).data
                : [];

            const strideItem = navBarContent.find((i) => i.name === "Stride");
            if (strideItem) {
                strideItem.dropDown = workspacesArray.map((ws: any) => ws?.workspaceName ?? ws?.name ?? String(ws));
            }
        } catch (e) {
            console.log("Workspace Addition Error : ", e);
        }

        navBarContent.sort((a, b) => Number(a.order) - Number(b.order));

        setNavBarDetails(navBarContent);
    }

    const handleLogOut = (result?: string) => {
        if(result == "cancel") {
            setShowDialog(false);
            return;
        } 
        if(result == "logout"){
            setShowDialog(false);
            navigate('/');
            dispatch({type : "SET_AUTHENTICATED", payload : false});
            dispatch({ type: "SET_USERDETAILS", payload: { email: "", id : "" } });
        }
        else{
            setShowDialog(true);
        }
    }

    const handleClick = (event: React.MouseEvent, navDataName: string) => {
        const target = "/" + navDataName.toLowerCase();
        navigate(target);
    }

    const handleTopLevelClick = (event: React.MouseEvent, navData: any, index: number) => {
        // Robust "Stride" detection: trim + lowercase to avoid name mismatches
        const name = String(navData?.name ?? "").trim().toLowerCase();
        const isStride = name === "stride";

        // For Stride, always navigate to /stride on click; use chevron to open/close submenu
        if (isStride) {
            event.preventDefault();
            setOpenDropdown(null);
            navigate("/stride");
            return;
        }

        if (navData?.dropDown?.length > 0) {
            event.preventDefault();
            setOpenDropdown(prev => (prev === navData.name ? null : navData.name));
            return;
        }

        handleClick(event, index === 0 ? "" : navData.name);
    }

    useEffect(() => {
        getNavBarData();
    }, []);

    useEffect(() => {
        getNavBarData();
    }, [state.authenticated, state.workspace]);
    // Close dropdown on outside click
    useEffect(() => {
        const handleOutside = (e: MouseEvent) => {
            if (!navRef.current) return;
            if (!navRef.current.contains(e.target as Node)) {
                setOpenDropdown(null);
            }
        };
        document.addEventListener("mousedown", handleOutside);
        return () => document.removeEventListener("mousedown", handleOutside);
    }, []);

    const handleNavMouseEnter = () => { setForceCollapsed(false); };
    const handleNavMouseLeave = () => { setOpenDropdown(null); };
    const handleNavFocus = () => { setForceCollapsed(false); };
    const handleNavBlur = (e: React.FocusEvent<HTMLDivElement>) => {
        // If focus moves outside the nav entirely, close any open dropdown
        if (!navRef.current) return;
        const next = e.relatedTarget as Node | null;
        if (!next || !navRef.current.contains(next)) {
            setOpenDropdown(null);
            setForceCollapsed(true);
        }
    };

    return (
        <div
            className={`nav ${forceCollapsed ? 'nav--collapsed' : ''}`}
            id="navbar"
            ref={navRef}
            onMouseEnter={handleNavMouseEnter}
            onMouseLeave={handleNavMouseLeave}
            onFocus={handleNavFocus}
            onBlur={handleNavBlur}
        >
            <nav className="nav__container">
                <div>
                    <a className="nav__link nav__logo" onClick={(event) => handleClick(event, "")}>
                        <i className='bx bxs-disc nav__icon' ></i>
                        <span className="nav__logo-name">Evolyn</span>
                    </a>
                    <div className="nav__list">
                        {navBarDetails.map((navData: any, index: number) =>
                            navData.visible && (
                                <div className={`nav__items ${navData.dropDown?.length > 0 ? "nav__dropdown" : ""} ${openDropdown === navData.name ? "is-open" : ""}`} key={index}>
                                    {index === 0 ? (
                                        <a
                                            className="nav__link active"
                                            onClick={(event) => {
                                                const name = String(navData?.name ?? "").trim().toLowerCase();
                                                if (name === "stride") {
                                                    event.preventDefault();
                                                    setOpenDropdown(null);
                                                    navigate("/stride");
                                                } else {
                                                    handleTopLevelClick(event, navData, index);
                                                }
                                            }}
                                        >
                                            <i className={navData.icon}></i>
                                            <span className="nav__name">{navData.name}</span>
                                            {navData.dropDown?.length > 0 && (
                                                <i
                                                    className="bx bx-chevron-down nav__icon nav__dropdown-icon"
                                                    role="button"
                                                    aria-label={`Toggle ${navData.name} submenu`}
                                                    tabIndex={0}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        e.preventDefault();
                                                        setOpenDropdown(prev => (prev === navData.name ? null : navData.name));
                                                    }}
                                                    onKeyDown={(e) => {
                                                        if (e.key === "Enter" || e.key === " ") {
                                                            e.preventDefault();
                                                            setOpenDropdown(prev => (prev === navData.name ? null : navData.name));
                                                        }
                                                    }}
                                                ></i>
                                            )}
                                        </a>
                                    ) : (
                                        <a
                                            className="nav__link"
                                            onClick={(event) => {
                                                const name = String(navData?.name ?? "").trim().toLowerCase();
                                                if (name === "stride") {
                                                    event.preventDefault();
                                                    setOpenDropdown(null);
                                                    navigate("/stride");
                                                } else {
                                                    handleTopLevelClick(event, navData, index);
                                                }
                                            }}
                                        >
                                            <i className={navData.icon}></i>
                                            <span className="nav__name">{navData.name}</span>
                                            {navData.dropDown?.length > 0 && (
                                                <i
                                                    className="bx bx-chevron-down nav__icon nav__dropdown-icon"
                                                    role="button"
                                                    aria-label={`Toggle ${navData.name} submenu`}
                                                    tabIndex={0}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        e.preventDefault();
                                                        setOpenDropdown(prev => (prev === navData.name ? null : navData.name));
                                                    }}
                                                    onKeyDown={(e) => {
                                                        if (e.key === "Enter" || e.key === " ") {
                                                            e.preventDefault();
                                                            setOpenDropdown(prev => (prev === navData.name ? null : navData.name));
                                                        }
                                                    }}
                                                ></i>
                                            )}
                                        </a>
                                    )}

                                    {navData.dropDown?.length > 0 && (
                                        navData.name === "Stride" ? (
                                            <div
                                                className="nav__dropdown-panel"
                                                role="menu"
                                                aria-label="Stride workspaces"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <div className="nav__dropdown-panel-header">
                                                    <span className="nav__dropdown-title">Workspaces</span>
                                                    <span className="nav__dropdown-count">{navData.dropDown.length}</span>
                                                </div>

                                                <div className="nav__dropdown-search">
                                                    <i className="bx bx-search"></i>
                                                    <input
                                                        type="text"
                                                        placeholder="Search workspaces"
                                                        value={workspaceQuery}
                                                        onChange={(e) => setWorkspaceQuery(e.target.value)}
                                                    />
                                                </div>

                                                <div className="nav__dropdown-list">
                                                    {(() => {
                                                        const filtered = workspaceQuery
                                                            ? navData.dropDown.filter((w: any) =>
                                                                String(w).toLowerCase().includes(workspaceQuery.toLowerCase())
                                                              )
                                                            : navData.dropDown;
                                                        if (!filtered || filtered.length === 0) {
                                                            return <div className="nav__dropdown-empty">No workspaces found</div>;
                                                        }
                                                        return filtered.map((dropDownContent: any, index: number) => (
                                                            <button
                                                                className="nav__dropdown-list-item"
                                                                key={index}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    // TODO: Navigate to the selected workspace context if/when route is available.
                                                                }}
                                                            >
                                                                <span className="nav__dropdown-list-bullet" />
                                                                <span className="nav__dropdown-list-text">
                                                                    {String(dropDownContent)}
                                                                </span>
                                                            </button>
                                                        ));
                                                    })()}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="nav__dropdown-collapse">
                                                <div className="nav__dropdown-content nav__dropdown-thread">
                                                    <span className="nav__dropdown-line" />
                                                    {navData.dropDown.map((dropDownContent: any, index: number) => (
                                                        <a
                                                            className="nav__dropdown-item nav__dropdown-node"
                                                            key={index}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                            }}
                                                        >
                                                            <span className="nav__dropdown-dot" />
                                                            {dropDownContent}
                                                        </a>
                                                    ))}
                                                </div>
                                            </div>
                                        )
                                    )}
                                </div>
                            )
                        )}
                    </div>
                </div>
                {state.authenticated && (
                    <button onClick={() => handleLogOut()}>
                        <a className="nav__link nav__logout">
                            <i className='bx bx-log-out nav__icon' ></i>
                            <span className="nav__name">Log Out</span>
                        </a>
                    </button>
                )}
            </nav>
            {showDialog && (
                <Dialog isOpen={showDialog} onClose={() => setShowDialog(false)} Heading="Leaving already?" Description="Want to log out of Evolyn now?" SecondaryButton="Cancel" PrimaryButton="Logout" onSecondary={() => handleLogOut("cancel")} onPrimary={() => handleLogOut('logout')}/>
            )}
        </div>
    );
}

export default NavBar;
