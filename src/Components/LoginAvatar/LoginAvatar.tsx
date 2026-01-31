import "./LoginAvatar.scss";
import { useStore } from "../../Store/GlobalStore/GlobalStore";
import { useEffect, useState } from "react";
import { checkLoggedInUser } from "../../API/AuthForm/index";


const LoginAvatar = () => {
    const { state, dispatch } = useStore();
    const [avatarName, setAvatarName] = useState<string>("");
    const [userFullName, setUserFullName] = useState<string>("");

    const userDetails = state?.userDetails;
    const email = userDetails?.email;

    const loginStatus = async (userEmail: string) => {
        const user_name = await checkLoggedInUser(userEmail);
        setAvatarName(user_name?.data.firstName[0] + user_name?.data.lastName[0]);
        setUserFullName(user_name?.data.firstName + " " + user_name?.data.lastName);
        const userDetails = {
            email : email,
            id : user_name.data.Id,
        }
        dispatch({type: "SET_USERDETAILS", payload : userDetails});
    }    

    useEffect(() => {
        loginStatus(email);
    }, [])

    const initial = email ? email.charAt(0).toUpperCase() : "U";

    return (
       <div className="LoginAvatar">
            {avatarName && (
                <ul className="LoginAvatar__menu">
                <li style={{ '--i': '#a555ff', '--j': '#ea51ff' } as any}>
                    <span className="icon">{avatarName}</span>
                    <span className="title">{userFullName}</span>
                </li>
                </ul>
            )}
        </div>
    );
}

export default LoginAvatar;
