import { createContext, useContext, useReducer, useEffect } from "react";
import { StoreType, StoreContextType } from "./GlobalStoreType"
import { userDetails } from "../../API/AuthForm";


//Initializing Store
const initialStoreState: StoreType = {
    theme : "light",
    authenticated: false,
    userDetails : {
        email : '',
    },
}

const getInitialState = () => {
  const savedTheme = localStorage.getItem("theme");
  const authenticated = localStorage.getItem("authenticated");
  const userDetails = localStorage.getItem("userdetails")
  
  return {
    theme: savedTheme || "light",
    authenticated: authenticated || false,
    userDetails : userDetails || {
        email : '',
    },
  };
};

//Reducer Function
const reducer = (state, action) => {
    switch(action.type) {
        case "SET_THEME":
            return {...state, theme: action.payload};
        case "SET_AUTHENTICATED":
            const payload = action.payload === "true" ? true : false;
            return {...state, authenticated: payload};
        case "SET_USERDETAILS": 
            return {...state, userDetails : action.payload};
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
        localStorage.setItem("authenticated", state.authenticated);
        localStorage.setItem("userdetails", state.userDetails);
    }, [state.theme, state.authenticated, state.userDetails]);

    return(
        <StoreContext.Provider value={{state, dispatch}}>
            {children}
        </StoreContext.Provider>  
    );
}

export const useStore = () => useContext(StoreContext);

