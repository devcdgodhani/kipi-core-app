
import React, { useState, useEffect } from 'react';
import { Bell, Check, Clock } from 'lucide-react';
import { notificationService } from '../../services/notification.service';
import type { Notification } from '../../types/notification.types';
import { toast } from 'react-hot-toast';

const NotificationPage: React.FC = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [unreadCount, setUnreadCount] = useState(0);

    const fetchNotifications = async () => {
        try {
            const response = await notificationService.getMyNotifications({ limit: 50 });
            setNotifications(response.notifications);
            setUnreadCount(response.unreadCount);
        } catch (error) {
            console.error('Failed to fetch notifications', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const handleMarkAsRead = async (id: string) => {
        try {
            await notificationService.markAsRead([id]);
            setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            toast.error('Failed to mark as read');
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await notificationService.markAllAsRead();
            setNotifications(notifications.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
            toast.success('All marked as read');
        } catch (error) {
            toast.error('Failed to mark all as read');
        }
    };

    if (loading) return <div className="py-20 text-center">Loading notifications...</div>;

    return (
        <div className="max-w-4xl mx-auto pt-10 pb-20 px-4">
            <div className="flex items-center justify-between mb-10 border-b border-gray-100 pb-6">
                <div>
                    <h1 className="text-3xl font-black uppercase tracking-tight text-gray-900">Notifications</h1>
                    <p className="text-gray-500 text-sm mt-1">You have {unreadCount} unread messages</p>
                </div>
                {unreadCount > 0 && (
                    <button
                        onClick={handleMarkAllAsRead}
                        className="text-xs font-bold uppercase tracking-widest text-primary hover:underline"
                    >
                        Mark all as read
                    </button>
                )}
            </div>

            {notifications.length === 0 ? (
                <div className="py-20 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm text-gray-300">
                        {/* icon */}
                    </div>
                    <p className="text-gray-500 font-medium">No notifications yet</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {notifications.map((notif) => (
                        <div
                            key={notif._id}
                            className={`p-6 border transition-all duration-300 flex gap-6 ${notif.isRead
                                ? 'bg-white border-gray-100'
                                : 'bg-primary/5 border-primary/10 shadow-sm'
                                }`}
                        >
                            <div className={`w-12 h-12 flex-shrink-0 flex items-center justify-center rounded-xl ${notif.isRead ? 'bg-gray-50 text-gray-400' : 'bg-white text-primary shadow-sm'
                                }`}>
                                <Bell size={20} />
                            </div>

                            <div className="flex-1 space-y-1">
                                <div className="flex items-start justify-between">
                                    <h3 className={`text-sm font-bold uppercase tracking-tight ${notif.isRead ? 'text-gray-600' : 'text-gray-900'}`}>
                                        {notif.title}
                                    </h3>
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                                        <Clock size={12} /> {new Date(notif.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                                <p className={`text-sm leading-relaxed ${notif.isRead ? 'text-gray-400' : 'text-gray-500'}`}>
                                    {notif.message}
                                </p>

                                {!notif.isRead && (
                                    <button
                                        onClick={() => handleMarkAsRead(notif._id)}
                                        className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary mt-2 flex items-center gap-1 hover:underline"
                                    >
                                        <Check size={12} /> Mark as read
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default NotificationPage;
