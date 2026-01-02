import { useState, useEffect } from "react";
import "./Header.scss";
import profileIcon from "../../Statics/dark-theme-profile.svg";
import ToggleSwitch from "../ToggleSwitch/toggleSwitch";

const Header = () => {
    const [theme, setTheme] = useState(document.documentElement.getAttribute("data-theme") || "light");

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
                <a href="#" className="header__logo">Bedimcode</a>

                <div className="header__search">
                    <input type="search" placeholder="Search" className="header__input" />
                    <i className="bx bx-search header__icon"></i>
                </div>

                <div>
                    <div className="toggleSwitch-profile">
                        <ToggleSwitch />
                        <div>
                            <img src={profileIcon} alt="Profile" className="header__img" />
                        </div>
                    </div>
                    <div className="header__toggle">
                        <i className="bx bx-menu" id="header-toggle"></i>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Header;