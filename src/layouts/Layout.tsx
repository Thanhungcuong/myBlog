import React, { useState, useEffect } from "react";
import { Outlet, Link, useNavigate } from "react-router-dom";
import { FaSignInAlt } from 'react-icons/fa';
import icon from '../img/icon.png';
import { auth, db } from "../firebaseConfig";
import { getDoc, doc } from "firebase/firestore";
import { logOut } from "../auth/authService";

const Layout: React.FC = () => {
    const [user, setUser] = useState<any>(null);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUser = async () => {
            const uid = localStorage.getItem("uid");
            if (uid) {
                const userDoc = await getDoc(doc(db, "users", uid));
                if (userDoc.exists()) {
                    setUser(userDoc.data());
                }
            }
        };
        fetchUser();
    }, []);

    const handleLogin = () => {
        navigate('/login');
    };

    const handleLogout = async () => {
        await logOut();
        setUser(null);
        navigate('/login');
    };

    const toggleDropdown = () => {
        setDropdownOpen(!dropdownOpen);
    };

    return (
        <div className="flex flex-col min-h-screen">
            <header className="p-4 h-20 shadow-lg">
                <nav>
                    <ul className="flex justify-between items-center max-w-[1440px] px-4 mx-auto">
                        <li className="flex items-center">
                            <img src={icon} alt="icon" className="h-8 w-8 mr-2" />
                            <p className="text-xl">My Blog</p>
                        </li>
                        <div className="flex space-x-8 items-center">
                            <li className="text-center">
                                <Link
                                    to="/newsfeed"
                                    className="text-xl px-4 py-2 rounded hover:font-bold hover:underline transition duration-300 drop-shadow-lg"
                                >
                                    Newsfeed
                                </Link>
                            </li>
                            <li className="text-center">
                                <Link
                                    to="/chat"
                                    className="text-xl px-4 py-2 rounded hover:font-bold hover:underline transition duration-300 drop-shadow-lg"
                                >
                                    Chat
                                </Link>
                            </li>
                            <li className="text-center">
                                <Link
                                    to="/my-blog"
                                    className="text-xl px-4 py-2 rounded hover:font-bold hover:underline transition duration-300 drop-shadow-lg"
                                >
                                    My Blog
                                </Link>
                            </li>
                            {user ? (
                                <li className="relative">
                                    <img
                                        src={user.avatar}
                                        alt="User Avatar"
                                        className="h-8 w-8 rounded-full cursor-pointer"
                                        onClick={toggleDropdown}
                                    />
                                    {dropdownOpen && (
                                        <div className="absolute right-0 mt-2 w-48 bg-white border rounded shadow-lg">
                                            <Link
                                                to="/settings"
                                                className="block px-4 py-2 text-gray-800 hover:bg-gray-100"
                                            >
                                                User Settings
                                            </Link>
                                            <button
                                                onClick={handleLogout}
                                                className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100"
                                            >
                                                Logout
                                            </button>
                                        </div>
                                    )}
                                </li>
                            ) : (
                                <li className="text-center">
                                    <button
                                        onClick={handleLogin}
                                        className="flex items-center justify-center text-xl px-4 py-2 rounded hover:font-bold hover:underline transition duration-300 drop-shadow-lg"
                                    >
                                        <FaSignInAlt className="mr-2" />
                                        Login/Register
                                    </button>
                                </li>
                            )}
                        </div>
                    </ul>
                </nav>
            </header>
            <main className="flex-grow p-4">
                <Outlet />
            </main>
            <footer className="shadow-lg p-4 border-t border-gray-200 text-center">
                My blog made by ThanHungCuong for studying
            </footer>
        </div>
    );
};

export default Layout;
