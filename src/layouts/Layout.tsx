import React, { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { FaSignInAlt, FaShoppingBag } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import icon from '../assets/img/icon.png';
import { auth, db } from '../firebaseConfig';
import { getDoc, doc } from 'firebase/firestore';
import { logOut } from '../auth/authService';
import NotificationComponent from '../components/noti/Notification';
import { RootState } from '../redux/store';
import { useSelector } from 'react-redux';

const Layout: React.FC = () => {
    const { t, i18n } = useTranslation();
    const [user, setUser] = useState<any>(null);
    const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
    const navigate = useNavigate();
    const dropdownRef = useRef<HTMLLIElement>(null);
    const uid = useSelector((state: RootState) => state.uid.uid);

    useEffect(() => {
        const fetchUser = async () => {
            if (uid) {
                const userDoc = await getDoc(doc(db, 'users', uid));
                if (userDoc.exists()) {
                    setUser(userDoc.data());
                }
            }
        };
        fetchUser();
    }, [uid]);

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
            document.addEventListener('mousedown', handleOutsideClick);
        } else {
            document.removeEventListener('mousedown', handleOutsideClick);
        }

        return () => {
            document.removeEventListener('mousedown', handleOutsideClick);
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

    const navigateToProfile = () => {
        if (user && user.uid) {
            navigate('/profile');
        }
    };

    const handleClickSubscription = () => {
        if (user && user.uid) {
            navigate('/subscription');
        }
    };

    const changeLanguage = (lng: string) => {
        i18n.changeLanguage(lng);
    };

    return (
        <div className="flex flex-col min-h-screen">
            <header className="p-4 h-20 shadow-lg border">
                <nav>
                    <ul className="flex justify-between items-center max-w-[1440px] px-4 mx-auto">
                        <li>
                            <Link to="/" className="flex items-center">
                                <img src={icon} alt="icon" className="h-8 w-8 mr-2" />
                                <p className="text-xl font-bold">My Blog</p>
                            </Link>
                        </li>
                        <div className="flex space-x-8 items-center">
                            <li className="cursor-pointer" onClick={handleClickSubscription}>
                                <FaShoppingBag className="text-2xl" />
                            </li>
                            {user && (
                                <li>
                                    <NotificationComponent uid={user.uid} />
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
                                        <div className="absolute max-sm:right-0 mt-2 w-52 z-50 bg-white border rounded shadow-lg flex items-center flex-col justify-start gap-3 p-4">
                                            <div
                                                className="flex items-center cursor-pointer hover:bg-gray-100 w-full p-2"
                                                onClick={navigateToProfile}
                                            >
                                                <img
                                                    src={user.avatar}
                                                    alt="User Avatar"
                                                    className="h-8 w-8 rounded-full"
                                                />
                                                <span className="ml-2 text-gray-800 text-nowrap">{user.name}</span>
                                            </div>

                                            <button
                                                onClick={() => changeLanguage('en')}
                                                className="flex items-center w-full p-2 hover:bg-gray-100"
                                            >
                                                <img
                                                    src="https://upload.wikimedia.org/wikipedia/en/a/a4/Flag_of_the_United_States.svg"
                                                    alt="English"
                                                    className="h-6 w-6 mr-2"
                                                />
                                                EN
                                            </button>
                                            <button
                                                onClick={() => changeLanguage('vi')}
                                                className="flex items-center w-full p-2 hover:bg-gray-100"
                                            >
                                                <img
                                                    src="https://upload.wikimedia.org/wikipedia/commons/2/21/Flag_of_Vietnam.svg"
                                                    alt="Vietnamese"
                                                    className="h-6 w-6 mr-2"
                                                />
                                                VI
                                            </button>

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
                                        className="flex items-center justify-center text-xl px-4 py-2 rounded hover:underline transition duration-300 drop-shadow-lg"
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
            <main className="flex-grow bg-[#fefefe]">
                <Outlet />
            </main>
            <footer className="shadow-lg p-4 border-t border-gray-200 text-center">
                My blog made by ThanHungCuong for studying
            </footer>
        </div>
    );
};

export default Layout;
