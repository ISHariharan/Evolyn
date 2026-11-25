import "../Expenses/Expenses.scss";
import "./Account.scss";
import "../../Components/Auth/Auth.scss";
import { useNavigate } from "react-router-dom";
import { openLogin } from "../../API/Password/api";
import ForgotPasswordForm from "../../Components/Auth/ForgotPasswordForm";

/**
 * /forgot-password as a page (the login dialog has the same form built in).
 * Email + recovery code + new password; afterwards it opens "Log in".
 */
const ForgotPassword = () => {
    const navigate = useNavigate();
    return (
        <div className="ex-page ac-page">
            <section className="ex-card au-page-card">
                <h1 className="au-title">Reset your password</h1>
                <p className="au-sub">Use the recovery code you saved from your Account page.</p>
                <ForgotPasswordForm onLogIn={() => { navigate("/"); openLogin("login"); }} />
            </section>
        </div>
    );
};

export default ForgotPassword;
