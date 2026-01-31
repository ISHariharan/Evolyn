import "./AuthForm.scss";
import { useState, useEffect } from "react";
import { userDetails, verifyUserDetails } from "../../API/AuthForm";
import { userDetailsType } from "./types";
import { generateUUID } from "../../Common/UUIDGenerator/UUIDGenerator";
import SuccessToastMessage from "../../Common/SuccessToastMessage/SuccessToastMessage";
import ErrorToastMessage from "../../Common/ErrorToastMessage/ErrorToastMessage";
import { useStore } from "../../Store/GlobalStore/GlobalStore";

const AuthForm = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
    const [authFormType, setAuthFormType] = useState<"SignUp" | "SignIn">("SignUp");
    const [firstName, setFirstName] = useState<string>("");
    const [lastName, setLastName] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [passWord, setPassword] = useState<string>("");
    const [confirmPassword, setConfirmPassword] = useState<string>("");
    const [isDisabled, setIsDisabled] = useState<boolean>(true);
    const [showSuccessToast, setShowSuccesToast] = useState(false);
    const [showErrorToast, setShowErrorToast] = useState(false);
    const [toastHeader, setToastHeader] = useState("");
    const [toastBody, setToastBody] = useState("");
    const {state, dispatch} = useStore();

    const [strength, setStrength] = useState<"weak" | "medium" | "strong" | "">("");
    const [strengthText, setStrengthText] = useState<string>("");

    const oppAuthFormType = authFormType === "SignUp" ? "SignIn" : "SignUp";

    const calculatePasswordStrength = (pwd: string) => {
        if (!pwd) {
            setStrength("");
            setStrengthText("");
            return;
        }

        const hasMinLength = pwd.length >= 8;
        const hasUpper = /[A-Z]/.test(pwd);
        const hasLower = /[a-z]/.test(pwd);
        const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(pwd);

        const score = [hasMinLength, hasUpper, hasLower, hasSpecial].filter(Boolean).length;

        if (score <= 1) {
            setStrength("weak");
            setStrengthText("Weak");
        } else if (score === 2 || score === 3) {
            setStrength("medium");
            setStrengthText("Medium");
        } else if (score === 4) {
            setStrength("strong");
            setStrengthText("Strong");
        }
    };

    const isFormValid = () => {
        if (authFormType === "SignIn") {
            return !!email.trim() && !!passWord;
        }

        return (
            !!firstName.trim() &&
            !!lastName.trim() &&
            !!email.trim() &&
            !!passWord &&
            passWord === confirmPassword &&
            strength === "strong" 
        );
    };

    useEffect(() => {
        setIsDisabled(!isFormValid());
    }, [firstName, lastName, email, passWord, confirmPassword, authFormType, strength]);

    useEffect(() => {
        console.log("Authenticated : ", state.authenticated);
    }, [state.authenticated]);

    useEffect(() => {
        if (authFormType === "SignUp") {
        calculatePasswordStrength(passWord);
        } else {
        setStrength("");
        setStrengthText("");
        }
    }, [passWord, authFormType]);

    const triggerToastMessage = (response) => {
      console.log("Response : ", response);
      const userDetails = {
        email : email,
        id: '',
      }
      const SucessToastHeader = authFormType === 'SignIn' ? "Login Successful" : "Registration Successful";
      const ErrorToastMessage = authFormType === 'SignIn' ? "Login Failed" : "Registration Failed";
      if (response.ok) {
        setToastHeader(SucessToastHeader);
        setToastBody(response.data.message);
        setShowSuccesToast(true);
        dispatch({type: "SET_AUTHENTICATED", payload : "true"});
        if(authFormType === 'SignIn') {
          onClose();
        } else {
          swapAuthForm();
        }
        dispatch({type: "SET_USERDETAILS", payload : userDetails});
      } else {
        setToastHeader(ErrorToastMessage);
        setToastBody(response.data.error);
        setShowErrorToast(true);
        dispatch({type: "SET_AUTHENTICATED", payload : "false"});
      }
    }

    const handleSubmit = async (e: React.MouseEvent) => {
        e.preventDefault();
        if (isDisabled) return;

        if (authFormType === "SignUp") {
            const uuid = generateUUID();
            const props: userDetailsType = {
                uuid,
                firstName,
                lastName,
                email,
                password: passWord,
            };
            const response = await userDetails(props);
            triggerToastMessage(response);
        } else {
            const props: userDetailsType = {
                email,
                password: passWord,
            };
            const response = await verifyUserDetails(props);
            triggerToastMessage(response);
        }
    };

    const swapAuthForm = () => {
        setAuthFormType(oppAuthFormType);
        setFirstName("");
        setLastName("");
        setEmail("");
        setPassword("");
        setConfirmPassword("");
    };

  if (!isOpen) return null;

  const passwordsMatch = passWord === confirmPassword && !!confirmPassword;
  const showMismatch = !!confirmPassword && !passwordsMatch;

  return (
    <div className="AuthForm-Overlay">
      <div className="AuthForm-PopUp">
        <form className="Authform" onSubmit={(e) => e.preventDefault()}>
          <div className="AuthForm-header-text">
            <p className="AuthForm-Title">{authFormType === "SignUp" ? "Register" : "Login"}</p>
            <button
              type="button"
              className="AuthForm-close-icon bx bx-x-circle"
              onClick={onClose}
            />
          </div>

          <p className="message">
            {authFormType.toLowerCase()} now and get full access to our app.
          </p>

          {authFormType === "SignUp" && (
            <div className="flex">
              <label>
                <input
                  className="input"
                  type="text"
                  value={firstName}
                  placeholder=""
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
                <span>Firstname</span>
              </label>
              <label>
                <input
                  className="input"
                  type="text"
                  value={lastName}
                  placeholder=""
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
                <span>Lastname</span>
              </label>
            </div>
          )}

          <label>
            <input
              className="input"
              type="email"
              value={email}
              placeholder=""
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <span>Email</span>
          </label>

          <label>
            <input
              className="input"
              type="password"
              value={passWord}
              placeholder=""
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <span>Password</span>
          </label>

          {authFormType === "SignUp" && (
            <>
              <label>
                <input
                  className={`input ${showMismatch ? "mismatch" : ""}`}
                  type="password"
                  value={confirmPassword}
                  placeholder=""
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <span>Confirm password</span>
              </label>

              {passWord && (
                <div className={`password-strength-container ${passwordsMatch ? "passwords-match" : ""}`}>
                  <div className={`password-strength-bar strength-${strength}`} />
                </div>
              )}

              {/* Strength text */}
              {passWord && !passwordsMatch && (
                <div className={`password-strength-text strength-${strength}-text`}>
                  {strengthText}
                </div>
              )}

              {/* Password mismatch error */}
              {showMismatch && (
                <div className="password-match-error">
                  Passwords do not match
                </div>
              )}
            </>
          )}

          <button
            type="button"
            className={`submit ${!isDisabled && strength === "medium" ? "almost-valid" : ""}`}
            onClick={handleSubmit}
            disabled={isDisabled}
          >
            {authFormType}
          </button>

          <p className="AuthForm-signin">
            {authFormType === "SignUp"
              ? "Already have an account? "
              : "Don't have an account? "}
            <button
              type="button"
              onClick={swapAuthForm}
              className="AuthForm-SignIn-Form"
            >
              {oppAuthFormType}
            </button>
          </p>
        </form>
      </div>
      {showSuccessToast && (
        <SuccessToastMessage
          ToastMessageHeader={toastHeader}
          ToastMessageBody={toastBody}
          duration={3000}
        />
      )}
      {showErrorToast && (
        <ErrorToastMessage
          ToastMessageHeader={toastHeader}
          ToastMessageBody={toastBody}
          duration={3000}
        />
      )}
    </div>
  );
};

export default AuthForm;