import * as React from "react";
import { useState, useEffect } from "react";
import "./toggleSwitch.css";

const ToggleSwitch = () => {
    const [theme, setTheme] = useState("light");

    useEffect(() => {
        document.documentElement.setAttribute("data-theme", theme);
    }, [theme]);

    const handleToggle = () => {
        setTheme(theme === "light" ? "dark" : "light");
    };

    return (
        <div>
            <label className="switch">
                <input type="checkbox" onChange={handleToggle} checked={theme === "dark"} />
                <span className="slider">
          <svg
              className="slider-icon"
              viewBox="0 0 32 32"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
              role="presentation"
          >
            <path fill="none" d="m4 16.5 8 8 16-16"></path>
          </svg>
        </span>
            </label>
        </div>
    );
};

export default ToggleSwitch;