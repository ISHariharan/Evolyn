import { createContext, useContext, useReducer, useEffect } from "react";
import { StoreType, StoreContextType } from "./GlobalStoreType"
import { userDetails } from "../../API/AuthForm";


//Initializing Store
const initialStoreState: StoreType = {
    theme : "light",
    authenticated: false,
    userDetails : {
        email : '',
        id: '',
    },
}

const getInitialState = () => {
  const savedTheme = localStorage.getItem("theme") || "light";

  const authenticatedRaw = localStorage.getItem("authenticated");
  const authenticated = authenticatedRaw === "true";

  const userDetailsRaw = localStorage.getItem("userdetails");
  let parsedUserDetails: any = { email: "" };
  if (userDetailsRaw) {
    try {
      parsedUserDetails = JSON.parse(userDetailsRaw);
    } catch {
      parsedUserDetails = { email: "" };
    }
  }

  return {
    theme: savedTheme,
    authenticated,
    userDetails: parsedUserDetails,
  };
};

//Reducer Function
const reducer = (state, action) => {
    switch(action.type) {
        case "SET_THEME":
            return {...state, theme: action.payload};
        case "SET_AUTHENTICATED":
            const payload =
                action.payload === true || action.payload === "true" ? true : false;
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
        localStorage.setItem("authenticated", String(state.authenticated));
        localStorage.setItem("userdetails", JSON.stringify(state.userDetails));
    }, [state.theme, state.authenticated, state.userDetails]);

    return(
        <StoreContext.Provider value={{state, dispatch}}>
            {children}
        </StoreContext.Provider>  
    );
}

export const useStore = () => useContext(StoreContext);
