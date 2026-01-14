import { userDetailsType } from "../../Components/AuthForm/types";

const evolynApi = 'evolyn/api';

export const storeUserDetails = async (storeUserDetails : userDetailsType) => {
    const url = `${evolynApi}/store/userdetails`;
    const response = await fetch(url, {
        method : 'POST',
        headers : {
            "Content-Type": "application/json",
        },
        body : JSON.stringify(storeUserDetails),
    });
    console.log('Response : ', response, storeUserDetails);
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
    console.log('Response : ', response, userDetails);
}