import "./AuthForm.scss";
import { useState, useEffect } from "react";

const AuthForm = ({isOpen, onClose}) => {
    const [authFormType, setAuthFormType] = useState<string>("SignUp");
    const [authFormDetails, setAuthFormDetails] = useState<boolean>(true);
    let oppAuthFormType = authFormType === 'SignUp' ? 'SignIn' : 'SignUp';

    const swapAuthForm = (authFormSelected) => {
        setAuthFormType(authFormSelected);
        oppAuthFormType = authFormSelected === 'SignUp' ? 'SignIn' : 'SignUp';
        setAuthFormDetails(!authFormDetails);
    }

    if(!isOpen) return;

    return (
        <div className="AuthForm-Overlay">
            <div className="AuthForm-PopUp">
                <form className="Authform">
                    <div className="AuthForm-header-text">
                        <div><p className="AuthForm-Title">{authFormType === 'SignUp' ? 'Register' : 'Login'} </p></div>
                        <div><button className="AuthForm-close-icon bx bx-x-circle" onClick={onClose}></button></div>
                    </div>
                    <p className="message">{authFormType} now and get full access to our app. </p>
                    {authFormDetails && (
                        <div className="flex">
                            <label>
                                <input className="input" type="text" placeholder="" required />
                                <span>Firstname</span>
                            </label>
                            <label>
                                <input className="input" type="text" placeholder="" required />
                                <span>Lastname</span>
                            </label>
                        </div>
                    )}  
                    <label>
                        <input className="input" type="email" placeholder="" required />
                        <span>Email</span>
                    </label> 
                    <label>
                        <input className="input" type="password" placeholder="" required />
                        <span>Password</span>
                    </label>
                    {authFormDetails && (
                        <label>
                            <input className="input" type="password" placeholder="" required />
                            <span>Confirm password</span>
                        </label>
                    )}
                    <button className="submit" onClick={onClose}>Submit</button>
                    <p className="AuthForm-signin">Already have an acount ? <button onClick={() => swapAuthForm(oppAuthFormType)} className="AuthForm-SignIn-Form">{oppAuthFormType}</button> </p>
                </form>
            </div>
        </div>
    );
}

export default AuthForm;