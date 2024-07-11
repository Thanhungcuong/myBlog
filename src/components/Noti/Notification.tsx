import React, { useState, useEffect } from 'react';
import { ref as rlRef, onValue, query, orderByChild } from 'firebase/database';
import { realtimeDb } from '../../firebaseConfig';

interface Notification {
    user: string;
    type: string;
    postId: string;
    timestamp: string;
}

const NotificationComponent: React.FC<{ uid: string }> = ({ uid }) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);

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
            }
        });

        return () => unsubscribe();
    }, [uid]);

    return (
        <div>
            {notifications.map((notification, index) => (
                <div key={index} className="p-2 border-b mb-2 border-gray-200 bg-blue-300 hover:bg-blue-500 rounded-lg">
                    <p className="text-sm">{notification.user} {notification.type} your post</p>
                    <p className="text-xs text-gray-500">{new Date(notification.timestamp).toLocaleString()}</p>
                </div>
            ))}
        </div>
    );
};

export default NotificationComponent;
