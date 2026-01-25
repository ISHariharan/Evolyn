import "./LoginAvatar.scss";
import { useStore } from "../../Store/GlobalStore/GlobalStore";


const LoginAvatar = () => {
    const { state } = useStore();

    // Safely extract email from store (handles object or string values)
    const userDetails = state?.userDetails;
    let email: string = "";
    if (userDetails && typeof userDetails === "object") {
        email = (userDetails as any).email || "";
    } else if (typeof userDetails === "string") {
        try {
            const parsed = JSON.parse(userDetails);
            email = parsed?.email || "";
        } catch {
            email = "";
        }
    }

    const initial = email ? email.charAt(0).toUpperCase() : "U";

    return (
        <div className="LoginAvatar-Container" title={email || "User"}>
            <div className="LoginAvatar-Initial">{initial}</div>
            {email && <span className="LoginAvatar-Email">{email}</span>}
        </div>
    );
}

export default LoginAvatar;
