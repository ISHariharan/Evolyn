import { useState, useEffect } from "react";
import "./Header.scss";
// import profileIcon from "../../Statics/dark-theme-profile.svg";
import ToggleSwitch from "../ToggleSwitch/toggleSwitch";
import AuthForm from "../AuthForm/AuthForm";

const Header = () => {
    const [theme, setTheme] = useState(document.documentElement.getAttribute("data-theme") || "light");
    const [showAuthForm, setShowAuthForm] = useState<boolean>(false);


    const handleLogin = () => {
        setShowAuthForm(true);
    };

    useEffect(() => {
        const updateTheme = () => {
            const currentTheme = document.documentElement.getAttribute("data-theme") || "light";
            setTheme(currentTheme);
        };

        // Initial check
        updateTheme();

        // Use MutationObserver to detect changes to data-theme attribute
        const observer = new MutationObserver(updateTheme);
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ["data-theme"],
        });

        // Cleanup observer on component unmount
        return () => observer.disconnect();
    }, []);

    return (
        <div className="header">
            <div className="header__container">
                <a href="#" className="header__logo">Evolyn</a>

                <div className="header__search">
                    <input type="search" placeholder="Search" className="header__input" />
                    <i className="bx bx-search header__icon"></i>
                </div>

                <div className="Header-button-container">
                    <div>
                        <div className="toggleSwitch-profile">
                            <ToggleSwitch />
                            {/* <div>
                                <img src={profileIcon} alt="Profile" className="header__img" />
                            </div> */}
                        </div>
                        <div className="header__toggle">
                            <i className="bx bx-menu" id="header-toggle"></i>
                        </div>
                    </div>
                    <div>
                        <div>
                            <button type="submit" onClick={handleLogin} className="header-login-btn flex justify-center gap-2 items-center mx-auto shadow-l text-md backdrop-blur-sm lg:font-semibold isolation-auto before:absolute before:w-full before:transition-all before:duration-700 before:hover:w-full before:-left-full before:hover:left-0 before:rounded-full before:bg-[var(--eyebrow-color)] before:-z-10 before:aspect-square before:hover:scale-150 relative z-10 px-4 py-2 overflow-hidden border-2 rounded-full group">
                                Login
                                <svg className="w-8 h-8 justify-end group-hover:rotate-90 group-hover:bg-gray-50 ease-linear duration-300 rounded-full border border-gray-700 group-hover:border-none p-2 rotate-45" viewBox="0 0 16 19" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M7 18C7 18.5523 7.44772 19 8 19C8.55228 19 9 18.5523 9 18H7ZM8.70711 0.292893C8.31658 -0.0976311 7.68342 -0.0976311 7.29289 0.292893L0.928932 6.65685C0.538408 7.04738 0.538408 7.68054 0.928932 8.07107C1.31946 8.46159 1.95262 8.46159 2.34315 8.07107L8 2.41421L13.6569 8.07107C14.0474 8.46159 14.6805 8.46159 15.0711 8.07107C15.4616 7.68054 15.4616 7.04738 15.0711 6.65685L8.70711 0.292893ZM9 18L9 1H7L7 18H9Z" fill="currentColor" className="login-button-arrow" />
                                </svg>
                            </button>
                        </div>
                    </div>
                    {showAuthForm && <AuthForm isOpen={showAuthForm} onClose={() => setShowAuthForm(false)} />}
                </div>
            </div>
        </div>
    );
};

export default Header;