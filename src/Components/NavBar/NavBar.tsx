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
    const navRef = useRef<HTMLDivElement>(null);
    const showMenu = (headerToggle, navbarId) =>{
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
    const linkColor = document.querySelectorAll('.nav__link')

    function addWorkspaceDropDown(){
        const workspacesForUser = state.workspace;
        const workspaces = [];
        workspacesForUser.forEach(element => {
            workspaces.push(element);
        });
        console.log("Workspaces : ", workspaces);
        console.log('Nav Stride DropDown : ', getNavBarContent());
    }

    function colorLink(){
        linkColor.forEach(l => l.classList.remove('active'))
        this.classList.add('active')
    }

    linkColor.forEach(l => l.addEventListener('click', colorLink))

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

    const handleClick = (event, navDataName) => {
        const target = "/" + navDataName.toLowerCase();
        navigate(target);
    }

    const handleTopLevelClick = (event, navData, index) => {
        if (navData?.dropDown?.length > 0) {
            event.preventDefault();
            setOpenDropdown(prev => (prev === navData.name ? null : navData.name));
        } else {
            handleClick(event, index === 0 ? "" : navData.name);
        }
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

    return (
        <div className="nav" id="navbar" ref={navRef}>
            <nav className="nav__container">
                <div>
                    <a className="nav__link nav__logo" onClick={(event) => handleClick(event, "")}>
                        <i className='bx bxs-disc nav__icon' ></i>
                        <span className="nav__logo-name">Evolyn</span>
                    </a>
                    <div className="nav__list">
                        {navBarDetails.map((navData, index) =>
                            navData.visible && (
                                <div className={`nav__items ${navData.dropDown?.length > 0 ? "nav__dropdown" : ""} ${openDropdown === navData.name ? "is-open" : ""}`} key={index}>
                                    {index === 0 ? (
                                        <a
                                            className="nav__link active"
                                            onClick={(event) => handleTopLevelClick(event, navData, index)}
                                        >
                                            <i className={navData.icon}></i>
                                            <span className="nav__name">{navData.name}</span>
                                            {navData.dropDown?.length > 0 && (
                                                <i className="bx bx-chevron-down nav__icon nav__dropdown-icon"></i>
                                            )}
                                        </a>
                                    ) : (
                                        <a
                                            className="nav__link"
                                            onClick={(event) => handleTopLevelClick(event, navData, index)}
                                        >
                                            <i className={navData.icon}></i>
                                            <span className="nav__name">{navData.name}</span>
                                            {navData.dropDown?.length > 0 && (
                                                <i className="bx bx-chevron-down nav__icon nav__dropdown-icon"></i>
                                            )}
                                        </a>
                                    )}

                                    {navData.dropDown?.length > 0 && (
                                        <div className="nav__dropdown-collapse">
                                            <div className="nav__dropdown-content">
                                                {navData.dropDown.map((dropDownContent, index) => (
                                                    <a
                                                        className="nav__dropdown-item"
                                                        key={index}
                                                        onClick={() => setOpenDropdown(null)}
                                                    >
                                                        {dropDownContent}
                                                    </a>
                                                ))}
                                            </div>
                                        </div>
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
