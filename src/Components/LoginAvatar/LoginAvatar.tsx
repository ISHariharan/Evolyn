import "./LoginAvatar.scss";
import { useStore } from "../../Store/GlobalStore/GlobalStore";
import { useEffect } from "react";
import { getMe } from "../../API/AuthForm/index";

/**
 * Shows your initials and name. The details come from GET /evolyn/api/me,
 * which knows who you are from your login token.
 */
const LoginAvatar = () => {
    const { state, dispatch } = useStore();
    const user = state?.userDetails ?? {};
    const firstName: string = user.firstName ?? "";
    const lastName: string = user.lastName ?? "";

    useEffect(() => {
        let stale = false;
        getMe().then((r) => {
            if (stale || !r.ok || !r.data) return; // a 401 logs out on its own
            dispatch({ type: "SET_USERDETAILS", payload: { ...r.data } });
        });
        return () => { stale = true; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    const fullName = `${firstName} ${lastName}`.trim();

    return (
       <div className="LoginAvatar">
            {initials && (
                <ul className="LoginAvatar__menu">
                <li style={{ '--i': '#a555ff', '--j': '#ea51ff' } as any}>
                    <span className="icon">{initials}</span>
                    <span className="title">{fullName}</span>
                </li>
                </ul>
            )}
        </div>
    );
}

export default LoginAvatar;
