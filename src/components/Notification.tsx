import React, { useState, useEffect } from 'react';
import { collection, query, onSnapshot, doc, setDoc, where } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { FaBell } from 'react-icons/fa';
import { useSnackbar } from 'notistack';
import { Avatar, IconButton } from '@mui/material';

interface Notification {
    id: string;
    type: 'like' | 'comment';
    postId: string;
    userId: string;
    userName: string;
    userAvatar: string;
    createdAt: Date;
}

const NotificationComponent: React.FC = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [open, setOpen] = useState(false);
    const { enqueueSnackbar } = useSnackbar();

    useEffect(() => {
        const uid = localStorage.getItem("uid");
        if (!uid) return;

        const notificationsQuery = query(collection(db, "notifications"), where("userId", "==", uid));
        const unsubscribeNotifications = onSnapshot(notificationsQuery, (snapshot) => {
            const newNotifications = snapshot.docs.map(doc => doc.data() as Notification);
            setNotifications(newNotifications);

            // Show each new notification in the Snackbar
            snapshot.docChanges().forEach((change) => {
                if (change.type === "added") {
                    const newNotification = change.doc.data() as Notification;
                    enqueueSnackbar(`${newNotification.userName} ${newNotification.type === 'like' ? 'liked' : 'commented on'} your post`, {
                        anchorOrigin: { vertical: 'top', horizontal: 'right' },
                        autoHideDuration: 2000,
                    });
                }
            });
        });

        return () => {
            unsubscribeNotifications();
        };
    }, [enqueueSnackbar]);

    return (
        <div>
            <IconButton onClick={() => setOpen(!open)}>
                <FaBell />
            </IconButton>
            {open && (
                <div className="absolute right-0 mt-2 w-64 bg-white border rounded shadow-lg">
                    {notifications.length === 0 ? (
                        <div className="p-4">No notifications</div>
                    ) : (
                        notifications.map((notification) => (
                            <div key={notification.id} className="p-4 border-b last:border-0">
                                <Avatar src={notification.userAvatar} alt="User Avatar" className="h-8 w-8 rounded-full inline-block mr-2" />
                                <span className="text-sm">
                                    <strong>{notification.userName}</strong> {notification.type === 'like' ? 'liked' : 'commented on'} your post
                                </span>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default NotificationComponent;
