import { userDetailsType } from "../../Components/AuthForm/types";
import { evolynApi, request } from "../Expenses/http";

export const storeUserDetails = async (storeUserDetails : userDetailsType) => {
    const url = `${evolynApi}/store/userdetails`;
    const response = await fetch(url, {
        method : 'POST',
        headers : {
            "Content-Type": "application/json",
        },
        body : JSON.stringify(storeUserDetails),
    });
    let data = null;
    try {
        data = await response.json();
    } catch (err) {
        data = err;
    }
    return {
        ok: response.ok,
        status: response.status,
        statusText: response.statusText,
        data,
    };
}

export const verifyUser = async (userDetails : userDetailsType) => {
    const url = `${evolynApi}/verify/userdetails`;
    const response = await fetch(url, {
        method : 'POST',
        headers : {
            "Content-Type": "application/json",
        },
        body : JSON.stringify(userDetails),
    });

    let data = null;
    try {
        data = await response.json();
    } catch (err) {
        data = err;
    }
    return {
        ok: response.ok,
        status: response.status,
        statusText: response.statusText,
        data,
    };
}

// Your own details, from the login token (replaces the old look-up-anyone-by-email call)
export const getMe = () =>
    request<{ id: string; email: string; firstName: string; lastName: string }>("/me");
