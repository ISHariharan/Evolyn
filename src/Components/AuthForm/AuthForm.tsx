import "./AuthForm.scss";

const AuthForm = () => {
    return (
        <form className="form">
            <p className="title">Register </p>
            <p className="message">Signup now and get full access to our app. </p>
            <div className="flex">
            <label>
                <input className="input" type="text" placeholder="firstname" required />
                <span>Firstname</span>
            </label>
            <label>
                <input className="input" type="text" placeholder="lastname" required />
                <span>Lastname</span>
            </label>
            </div>  
            <label>
            <input className="input" type="email" placeholder="Email" required />
            <span>Email</span>
            </label> 
            <label>
            <input className="input" type="password" placeholder="Password" required />
            <span>Password</span>
            </label>
            <label>
            <input className="input" type="password" placeholder="Confirm Password" required />
            <span>Confirm password</span>
            </label>
            <button className="submit">Submit</button>
            <p className="signin">Already have an acount ? <a href="#">Signin</a> </p>
      </form>
    );
}

export default AuthForm;