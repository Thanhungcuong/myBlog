import React, { useState, useEffect } from 'react';
import { ref as rlRef, onValue, query, orderByChild } from 'firebase/database';
import { realtimeDb } from '../../firebaseConfig';
import { useNavigate } from 'react-router-dom';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert, { AlertProps } from '@mui/material/Alert';

interface Notification {
    user: string;
    type: string;
    postId: string;
    timestamp: string;
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(function Alert(
    props,
    ref,
) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const NotificationComponent: React.FC<{ uid: string }> = ({ uid }) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarPostId, setSnackbarPostId] = useState('');
    const navigate = useNavigate();

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

                // Hiển thị Snackbar khi có thông báo mới
                const latestNotification = notificationsList[0];
                setSnackbarMessage(`${latestNotification.user} ${latestNotification.type} your post`);
                setSnackbarPostId(latestNotification.postId);
                setSnackbarOpen(true);
            }
        });

        return () => unsubscribe();
    }, [uid]);

    const handleSnackbarClick = () => {
        setSnackbarOpen(false);
        navigate(`/post/${snackbarPostId}`);
    };

    const handleSnackbarClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === 'clickaway') {
            return;
        }
        setSnackbarOpen(false);
    };

    const handleClickNoti = (postId: string) => {
        navigate(`/post/${postId}`);
    }

    return (
        <div className='overflow-y-auto max-h-96 flex flex-col gap-1'>
            {notifications.map((notification, index) => (
                <div key={index} className="p-2 border-b mb-1 hover:bg-gray-300 border-gray-200 rounded-lg cursor-pointer" onClick={() => handleClickNoti(notification.postId)}>
                    <p className="text-sm">{notification.user} {notification.type} your post</p>
                    <p className="text-xs text-gray-500">{new Date(notification.timestamp).toLocaleString()}</p>
                </div>
            ))}

            <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose} onClick={handleSnackbarClick}>
                <Alert onClose={handleSnackbarClose} severity="info" sx={{ width: '100%' }}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </div>
    );
};

export default NotificationComponent;
