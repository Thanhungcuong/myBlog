import React from "react";
import { signInWithGoogle } from "./authService";
import { useNavigate } from "react-router-dom";

const Login: React.FC = () => {
    const navigate = useNavigate();

    const handleLogin = async () => {
        try {
            await signInWithGoogle();
            navigate("/home");
        } catch (error) {
            console.error("Error during login:", error);
        }
    };

    return (
        <div>
            <h1>Login Page</h1>
            <button onClick={handleLogin}>Sign in with Google</button>
        </div>
    );
};

export default Login;
