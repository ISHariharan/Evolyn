import "./AuthForm.scss";
import { useState, useEffect } from "react";
import { userDetails, verifyUserDetails } from "../../API/AuthForm";
import {userDetailsType} from "./types";
import { generateUUID } from "../../Common/UUIDGenerator/UUIDGenerator";

const AuthForm = ({isOpen, onClose}) => {
    const [authFormType, setAuthFormType] = useState<string>("SignUp");
    const [authFormDetails, setAuthFormDetails] = useState<boolean>(true);
    const [firstName, setFirstName] = useState<string>("");
    const [lastName, setLastName] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [passWord, setPassword] = useState<string>("");
    const [confirmPassword, setConfirmPassword] = useState<string>("");
    const [isDisabled, setIsDisabled] = useState<boolean>(true);

    let oppAuthFormType = authFormType === 'SignUp' ? 'SignIn' : 'SignUp';

    const swapAuthForm = (authFormSelected) => {
        setAuthFormType(authFormSelected);
        oppAuthFormType = authFormSelected === 'SignUp' ? 'SignIn' : 'SignUp';
        setAuthFormDetails(!authFormDetails);
    }

    const validateButtonFunction = (firstName, lastName, email, passWord, confirmPassword) => {
        if(authFormType === 'SignIn' && email && passWord) {
            return true;
        }
        if(authFormType === 'SignUp' && firstName && lastName && email && (passWord === confirmPassword)) {
            return true;
        }
        return false;
    }

    const handleSubmit = async (formType) => {
        const validation = validateButtonFunction(firstName, lastName, email, passWord, confirmPassword);
        if(!validation) return;

        setIsDisabled(true);
        if(authFormType === 'SignUp') {
            const uuid = generateUUID();
            const props : userDetailsType= {
                uuid: uuid,
                firstName : firstName,
                lastName : lastName,
                email : email,
                password : passWord,
            };
            userDetails(props);
        } else {
            const props : userDetailsType = {
                email : email,
                password: passWord,
            }
            verifyUserDetails(props);
        }

    }

    const isFormValid = () => {
        if (authFormType === "SignUp") {
            return (
            firstName.trim() &&
            lastName.trim() &&
            email.trim() &&
            passWord &&
            confirmPassword &&
            passWord === confirmPassword
            );
        }

        
        return email.trim() && passWord;
    };

    useEffect(() => {
        setIsDisabled(!isFormValid());
    }, [
        firstName,
        lastName,
        email,
        passWord,
        confirmPassword,
        authFormType,
    ]);

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
                                <input className="input" type="text" placeholder="" onChange={(event) => setFirstName(event.target.value)} required />
                                <span>Firstname</span>
                            </label>
                            <label>
                                <input className="input" type="text" placeholder="" onChange={(event) => setLastName(event.target.value)} required />
                                <span>Lastname</span>
                            </label>
                        </div>
                    )}  
                    <label>
                        <input className="input" type="email" placeholder="" onChange={(event) => setEmail(event.target.value)} required />
                        <span>Email</span>
                    </label> 
                    <label>
                        <input className="input" type="password" placeholder="" onChange={(event) => setPassword(event.target.value)} required />
                        <span>Password</span>
                    </label>
                    {authFormDetails && (
                        <label>
                            <input className="input" type="password" onChange={(event) => setConfirmPassword(event.target.value)} placeholder="" required />
                            <span>Confirm password</span>
                        </label>
                    )}
                    <button className="submit" onClick={() => handleSubmit(authFormType)} disabled={isDisabled}>{authFormType}</button>
                    <p className="AuthForm-signin">Already have an acount ? <button onClick={() => swapAuthForm(oppAuthFormType)} className="AuthForm-SignIn-Form">{oppAuthFormType}</button> </p>
                </form>
            </div>
        </div>
    );
}

export default AuthForm;