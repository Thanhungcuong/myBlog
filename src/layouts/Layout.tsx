import React, { useState, useEffect, useRef } from "react";
import { Outlet, Link, useNavigate } from "react-router-dom";
import { FaSignInAlt, FaBell } from 'react-icons/fa';
import icon from '../assets/img/icon.png';
import { auth, db } from "../firebaseConfig";
import { getDoc, doc } from "firebase/firestore";
import { logOut } from "../auth/authService";
import NotificationComponent from "../components/Notification";

const Layout: React.FC = () => {
    const [user, setUser] = useState<any>(null);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const navigate = useNavigate();
    const dropdownRef = useRef<HTMLLIElement>(null);

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

    useEffect(() => {
        const handleOutsideClick = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setDropdownOpen(false);
            }
        };

        if (dropdownOpen) {
            document.addEventListener("mousedown", handleOutsideClick);
        } else {
            document.removeEventListener("mousedown", handleOutsideClick);
        }

        return () => {
            document.removeEventListener("mousedown", handleOutsideClick);
        };
    }, [dropdownOpen]);

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
                        <li className="">
                            <Link to="/" className="flex items-center">
                                <img src={icon} alt="icon" className="h-8 w-8 mr-2" />
                                <p className="text-xl font-bold">My Blog</p>
                            </Link>
                        </li>
                        <div className="flex space-x-8 items-center">
                            {user && (
                                <li>
                                    <NotificationComponent />
                                </li>
                            )}
                            {user ? (
                                <li className="relative" ref={dropdownRef}>
                                    <img
                                        src={user.avatar}
                                        alt="User Avatar"
                                        className="h-8 w-8 rounded-full cursor-pointer"
                                        onClick={toggleDropdown}
                                    />
                                    {dropdownOpen && (
                                        <div className="absolute mt-2 w-36 bg-white border rounded shadow-lg">
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
