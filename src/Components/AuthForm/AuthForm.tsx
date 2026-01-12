import "./AuthForm.scss";

const AuthForm = ({isOpen, onClose}) => {
    if(!isOpen) return;
    return (
        <div className="AuthForm-Overlay">
            <div className="AuthForm-PopUp">
                <form className="form">
                    <div className="AuthForm-header-text">
                        <div><p className="AuthForm-Title">Register </p></div>
                        <div><button className="AuthForm-close-icon bx bx-x-circle" onClick={onClose}></button></div>
                    </div>
                    <p className="message">Signup now and get full access to our app. </p>
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
                    <label>
                        <input className="input" type="email" placeholder="" required />
                        <span>Email</span>
                    </label> 
                    <label>
                        <input className="input" type="password" placeholder="" required />
                        <span>Password</span>
                    </label>
                    <label>
                        <input className="input" type="password" placeholder="" required />
                        <span>Confirm password</span>
                    </label>
                    <button className="submit" onClick={onClose}>Submit</button>
                    <p className="signin">Already have an acount ? <a href="#">Signin</a> </p>
                </form>
            </div>
        </div>
    );
}

export default AuthForm;