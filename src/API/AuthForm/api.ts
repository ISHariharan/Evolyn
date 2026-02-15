import { userDetailsType } from "../../Components/AuthForm/types";

const evolynApi = '/evolyn/api';

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

export const checkLoggedInUserDetails = async (email : string) => {
    const url = `${evolynApi}/verify/loggedin/user`;
    const response = await fetch(url, {
        method : 'POST',
        headers : {
            "Content-Type": "application/json",
        },
        body : JSON.stringify({"email" : email}),
    })
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