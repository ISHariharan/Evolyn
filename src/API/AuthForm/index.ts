import { userDetailsType } from "../../Components/AuthForm/types";
import { storeUserDetails, verifyUser, checkLoggedInUserDetails } from "./api";

export const userDetails = async (userDetails : userDetailsType) => {
    return await storeUserDetails(userDetails);
}

export const verifyUserDetails = async (userDetail : userDetailsType) => {
    return await verifyUser(userDetail);
}

export const checkLoggedInUser = async (email : string) => {
    return await checkLoggedInUserDetails(email);
}