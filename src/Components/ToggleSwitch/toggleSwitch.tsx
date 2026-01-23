import * as React from "react";
import { useState, useEffect } from "react";
import "./toggleSwitch.css";
import { useStore } from "../../Store/GlobalStore/GlobalStore";

const ToggleSwitch = () => {
    const {state, dispatch} = useStore();
    let currentTheme;
    console.log('State : ', state.theme);
    const [theme, setTheme] = useState(state.theme);

    useEffect(() => {
        document.documentElement.setAttribute("data-theme", theme);
    }, [theme]);

    const handleToggle = () => {
        currentTheme = theme === "light" ? "dark" : "light";
        dispatch({type: "SET_THEME", payload: currentTheme});
        setTheme(currentTheme);
    };

    return (
        <div>
            <label className="switch">
                <input type="checkbox" onChange={handleToggle} checked={state.theme === "dark"} />
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