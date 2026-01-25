import "./NavBar.scss"
import { NavBarProperty } from "./types"
import { getNavBarContent } from "../../API/NavBar/api";
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom";
import { useStore } from "../../Store/GlobalStore/GlobalStore";

const NavBar = () => {
    const navigate = useNavigate();
    const {state, dispatch} = useStore();
    const [navBarDetails, setNavBarDetails] = useState<any>([]);
    /*==================== SHOW NAVBAR ====================*/
    const showMenu = (headerToggle, navbarId) =>{
        const toggleBtn = document.getElementById(headerToggle),
        nav = document.getElementById(navbarId)
        
        // Validate that variables exist
        if(headerToggle && navbarId){
            toggleBtn?.addEventListener('click', ()=>{
                // We add the show-menu className to the div tag with the nav__menu className
                nav?.classList.toggle('show-menu')
                // change icon
                toggleBtn.classList.toggle('bx-x')
            })
        }
    }
    showMenu('header-toggle','navbar')

    /*==================== LINK ACTIVE ====================*/
    const linkColor = document.querySelectorAll('.nav__link')

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
        })
        navBarContent.sort((a, b) => Number(a.order) - Number(b.order));

        setNavBarDetails(navBarContent);
    }

    const handleLogOut = () => {
        navigate('/home');
        dispatch({type : "SET_AUTHENTICATED", payload : false});
    }

    const handleClick = (event, navDataName) => {
        const target = "/" + navDataName.toLowerCase();
        navigate(target);
    }

    useEffect(() => {
        console.log('State Authentication : ', state.authenticated);
        getNavBarData();
    }, []);

    useEffect(() => {
        getNavBarData();
    }, [state.authenticated]);
    return (
        <div className="nav" id="navbar">
            <nav className="nav__container">
                <div>
                    <a className="nav__link nav__logo" onClick={(event) => handleClick(event, "")}>
                        <i className='bx bxs-disc nav__icon' ></i>
                        <span className="nav__logo-name">Evolyn</span>
                    </a>
                    <div className="nav__list">
                        {navBarDetails.map((navData, index) =>
                            navData.visible && (
                                <div className="nav__items" key={index}>
                                    {index === 0 ? (
                                        <a
                                            className="nav__link active"
                                            onClick={(event) => handleClick(event, "")}
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
                                            onClick={(event) => handleClick(event, navData.name)}
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
                    <button onClick={handleLogOut}>
                        <a className="nav__link nav__logout">
                            <i className='bx bx-log-out nav__icon' ></i>
                            <span className="nav__name">Log Out</span>
                        </a>
                    </button>
                )}
            </nav>
        </div>
    );
}

export default NavBar;