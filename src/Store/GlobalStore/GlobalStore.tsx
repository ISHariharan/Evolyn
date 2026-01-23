import { createContext, useContext, useReducer, useEffect } from "react";
import { StoreType, StoreContextType } from "./GlobalStoreType"


//Initializing Store
const initialStoreState: StoreType = {
    theme : "light",
}

const getInitialState = () => {
  const savedTheme = localStorage.getItem("theme");
  return {
    theme: savedTheme || "light",
  };
};

//Reducer Function
const reducer = (state, action) => {
    switch(action.type) {
        case "SET_THEME":
            return {...state, theme: action.payload};
        default:
            return state;
    }
}

//Declare Global Store Context
const StoreContext = createContext<StoreContextType>(undefined);

//Create Store Provider
export const StoreProvider = ({children}) => {
    const [state, dispatch] = useReducer(reducer, undefined, getInitialState);

    useEffect(() => {
        localStorage.setItem("theme", state.theme);
    }, [state.theme]);

    return(
        <StoreContext.Provider value={{state, dispatch}}>
            {children}
        </StoreContext.Provider>  
    );
}

export const useStore = () => useContext(StoreContext);

