import React from "react";
import { logOut } from "../auth/authService";
import { useNavigate } from "react-router-dom";
import PostArea from "../components/PostArea";

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
    <div className="home-container">
      <PostArea />

    </div>
  );
};

export default Home;
