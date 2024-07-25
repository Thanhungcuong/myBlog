import React, { useState, useEffect, useRef } from 'react';
import { ref as rlRef, onValue, onChildAdded, query, orderByChild, update } from 'firebase/database';
import { realtimeDb } from '../../firebaseConfig';
import { useNavigate } from 'react-router-dom';
import { SnackbarProvider, useSnackbar } from 'notistack';
import { Button } from '@mui/material';
import { FaBell } from 'react-icons/fa';

interface Notification {
    id: string;
    user: string;
    type: string;
    postId: string;
    timestamp: string;
    seen: boolean;
    snackBar: boolean;
}

const NotificationComponent: React.FC<{ uid: string }> = ({ uid }) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unseenCount, setUnseenCount] = useState<number>(0);
    const [showNotifications, setShowNotifications] = useState<boolean>(false);
    const [displayedNotifications, setDisplayedNotifications] = useState<Set<string>>(new Set());
    const navigate = useNavigate();
    const { enqueueSnackbar } = useSnackbar();
    const notificationRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const notificationsRef = query(
            rlRef(realtimeDb, `notifications/${uid}`),
            orderByChild('timestamp')
        );

        const unsubscribe = onValue(notificationsRef, (snapshot) => {
            if (snapshot.exists()) {
                const notificationsData = snapshot.val();
                const notificationsList = Object.keys(notificationsData).map(key => ({
                    ...notificationsData[key],
                    id: key
                }));
                notificationsList.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
                setNotifications(notificationsList);
                const unseenNotifications = notificationsList.filter((notification: any) => !notification.seen);
                setUnseenCount(unseenNotifications.length);
            }
        });

        return () => unsubscribe();
    }, [uid]);

    useEffect(() => {
        const notificationsRef = rlRef(realtimeDb, `notifications/${uid}`);

        const unsubscribe = onChildAdded(notificationsRef, (snapshot) => {
            if (snapshot.exists()) {
                const newNotification = snapshot.val();
                if (!newNotification.seen && !displayedNotifications.has(snapshot.key!) && !newNotification.snackBar) {
                    enqueueSnackbar(`${newNotification.user} ${newNotification.type} your post`, {
                        variant: 'info',
                        anchorOrigin: { vertical: 'top', horizontal: 'right' },
                        autoHideDuration: 2000,
                        action: () => (
                            <button onClick={() => navigate(`/post/${newNotification.postId}`)}>
                                Go to post
                            </button>
                        ),
                    });
                    setDisplayedNotifications(prev => new Set(prev).add(snapshot.key!));
                    const notificationUpdateRef = rlRef(realtimeDb, `notifications/${uid}/${snapshot.key}`);
                    update(notificationUpdateRef, { snackBar: true });
                }
            }
        });

        return () => unsubscribe();
    }, [uid, enqueueSnackbar, navigate, displayedNotifications]);

    const handleClickNoti = (notification: Notification) => {
        navigate(`/post/${notification.postId}`);
        const notificationRef = rlRef(realtimeDb, `notifications/${uid}/${notification.id}`);
        update(notificationRef, { seen: true }).then(() => {
            setNotifications(prevNotifications =>
                prevNotifications.map(n =>
                    n.id === notification.id ? { ...n, seen: true } : n
                )
            );

        });
        setShowNotifications(false);
    };

    const toggleNotifications = () => {
        setShowNotifications(!showNotifications);
    };

    useEffect(() => {
        if (showNotifications && window.innerWidth <= 640) {
            document.body.classList.add('no-scroll');
        } else {
            document.body.classList.remove('no-scroll');
        }

        const handleOutsideClick = (event: MouseEvent) => {
            if (
                notificationRef.current &&
                !notificationRef.current.contains(event.target as Node)
            ) {
                setShowNotifications(false);
                document.body.classList.remove('no-scroll');
            }
        };

        if (showNotifications) {
            document.addEventListener('mousedown', handleOutsideClick);
        } else {
            document.removeEventListener('mousedown', handleOutsideClick);
        }

        return () => {
            document.removeEventListener('mousedown', handleOutsideClick);
            document.body.classList.remove('no-scroll');
        };
    }, [showNotifications]);

    return (
        <div className="relative" ref={notificationRef}>
            <div className="relative cursor-pointer" onClick={toggleNotifications}>
                <FaBell className="text-2xl" />
                {unseenCount > 0 && (
                    <span className="absolute top-0 right-0 bg-red-500 text-white rounded-full text-xs w-4 h-4 flex items-center justify-center">
                        {unseenCount}
                    </span>
                )}
            </div>
            {showNotifications && (
                <div className="absolute sm:right-0 z-50 mt-2 bg-slate-100 w-80 max-sm:w-screen max-sm:right-[0%] translate-x-[25%] max-sm:top-[210%] max-sm:h-screen shadow-lg rounded-lg overflow-hidden p-4">
                    <p className="w-fit text-xl font-bold mx-auto mb-3">Thông báo</p>
                    <div className="overflow-y-auto max-h-96 flex flex-col gap-1 divide-y-2">
                        {notifications.map((notification) => (
                            <div
                                key={notification.id}
                                className={`p-2 mb-1 hover:bg-gray-300 border-gray-200 rounded-lg cursor-pointer ${!notification.seen ? 'bg-gray-300 animate-blink' : ''}`}
                                onClick={() => handleClickNoti(notification)}
                            >
                                <p className="text-sm">{notification.user} {notification.type} your post</p>
                                <p className="text-xs text-gray-500">{new Date(notification.timestamp).toLocaleString()}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationComponent;
