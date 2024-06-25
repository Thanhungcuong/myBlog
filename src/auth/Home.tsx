import React from "react";
import { logOut } from "./authService";
import { useNavigate } from "react-router-dom";

const Home: React.FC = () => {
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await logOut();
            navigate("/login");
        } catch (error) {
            console.error("Error during logout:", error);
        }
    };

    return (
        <div>
            <h1>Home Page</h1>
            <button onClick={handleLogout}>Sign out</button>
        </div>
    );
};

export default Home;
