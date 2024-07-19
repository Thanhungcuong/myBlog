import React, { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { FaSignInAlt, FaBell } from 'react-icons/fa';
import icon from '../assets/img/icon.png';
import { auth, db, realtimeDb } from '../firebaseConfig';
import { getDoc, doc } from 'firebase/firestore';
import { ref as rlRef, onChildAdded } from 'firebase/database';
import { logOut } from '../auth/authService';
import NotificationComponent from '../components/noti/Notification';
import { SnackbarProvider, useSnackbar } from 'notistack';
import { Avatar } from '@mui/material';

const Layout: React.FC = () => {
    const [user, setUser] = useState<any>(null);
    const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
    const [showNotifications, setShowNotifications] = useState<boolean>(false);
    const navigate = useNavigate();
    const dropdownRef = useRef<HTMLLIElement>(null);
    const dropdownNoti = useRef<HTMLLIElement>(null);
    const { enqueueSnackbar } = useSnackbar();

    useEffect(() => {
        const fetchUser = async () => {
            const uid = localStorage.getItem('uid');
            if (uid) {
                const userDoc = await getDoc(doc(db, 'users', uid));
                if (userDoc.exists()) {
                    setUser(userDoc.data());
                }
            }
        };
        fetchUser();
    }, []);

    useEffect(() => {
        if (user) {
            const notificationsRef = rlRef(realtimeDb, `notifications/${user.uid}`);
            const unsubscribe = onChildAdded(notificationsRef, (snapshot) => {
                const notification = snapshot.val();
                const notificationId = snapshot.key;
                const displayedNotifications = JSON.parse(localStorage.getItem('displayedNotifications') || '[]');

                if (!displayedNotifications.includes(notificationId)) {
                    enqueueSnackbar(`New notification: ${notification.user} ${notification.type} your post`, {
                        variant: 'info',
                        anchorOrigin: { vertical: 'top', horizontal: 'right' },
                        autoHideDuration: 2000,
                    });

                    displayedNotifications.push(notificationId);
                    localStorage.setItem('displayedNotifications', JSON.stringify(displayedNotifications));
                }
            });
            return () => unsubscribe();
        }
    }, [user, enqueueSnackbar]);

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

    useEffect(() => {
        const handleOutsideClick = (event: MouseEvent) => {
            if (
                dropdownNoti.current &&
                !dropdownNoti.current.contains(event.target as Node)
            ) {
                setShowNotifications(false);
            }
        };

        if (showNotifications) {
            document.addEventListener('mousedown', handleOutsideClick);
        } else {
            document.removeEventListener('mousedown', handleOutsideClick);
        }

        return () => {
            document.removeEventListener('mousedown', handleOutsideClick);
        };
    }, [showNotifications]);

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
            navigate(`/profile`);
        }
    };

    return (
        <SnackbarProvider
            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            autoHideDuration={2000}
        >
            <div className="flex flex-col min-h-screen">
                <header className="p-4 h-20 shadow-lg border mb-12">
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
                                    <li className="relative" ref={dropdownNoti}>
                                        <FaBell
                                            className="text-2xl cursor-pointer"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setShowNotifications(!showNotifications);
                                            }}
                                        />
                                        {showNotifications && (
                                            <div className="absolute right-0 z-50 mt-2 w-80 bg-white shadow-lg rounded-lg p-4">
                                                <NotificationComponent uid={user.uid} />
                                            </div>
                                        )}
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
                                            <div className="absolute mt-2 w-52 bg-white border rounded shadow-lg flex items-center flex-col justify-start gap-3 p-4">
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
                <main className="flex-grow bg-[#fefefe]">
                    <Outlet />
                </main>
                <footer className="shadow-lg p-4 border-t border-gray-200 text-center">
                    My blog made by ThanHungCuong for studying
                </footer>
            </div>
        </SnackbarProvider>
    );
};

export default Layout;
