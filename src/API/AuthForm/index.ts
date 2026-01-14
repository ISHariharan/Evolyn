import { userDetailsType } from "../../Components/AuthForm/types";
import { storeUserDetails, verifyUser } from "./api";

export const userDetails = async (userDetails : userDetailsType) => {
    await storeUserDetails(userDetails);
}

export const verifyUserDetails = async (userDetail : userDetailsType) => {
    await verifyUser(userDetail);
}