import React from "react";
import { Outlet } from "react-router-dom";

const Root: React.FC = () => {
    return (
        <div>
            <h1>My App</h1>
            <Outlet />
        </div>
    );
};

export default Root;
