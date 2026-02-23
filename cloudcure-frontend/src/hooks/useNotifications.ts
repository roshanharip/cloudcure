import { useState, useEffect, useCallback } from 'react';
import { socketService } from '@/services/socket';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface Notification {
    id: string;
    type: 'appointment_created' | 'appointment_started' | 'appointment_ended' | 'appointment_cancelled' | 'appointment_terminated' | 'message_received';
    title: string;
    message: string;
    timestamp: string;
    isRead: boolean;
    link?: string;
    metadata?: any;
}

export const useNotifications = () => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);

    const addNotification = useCallback((notif: Omit<Notification, 'id' | 'isRead' | 'timestamp'>) => {
        const newNotif: Notification = {
            ...notif,
            id: Math.random().toString(36).substr(2, 9),
            isRead: false,
            timestamp: new Date().toISOString(),
        };

        setNotifications(prev => [newNotif, ...prev].slice(0, 50));
        setUnreadCount(prev => prev + 1);

        // Show toast for non-messages or if not on chat page
        if (newNotif.type !== 'message_received') {
            toast(newNotif.title, {
                description: newNotif.message,
                action: newNotif.link ? {
                    label: 'View',
                    onClick: () => window.location.href = newNotif.link!
                } : undefined
            });
        }
    }, []);

    useEffect(() => {
        const socket = socketService.getSocket();
        if (!socket || !user) return;

        const handleAppointmentEvent = (data: any) => {
            let title = 'Appointment Update';
            let message = data.message || 'There is an update to your appointment.';
            let type: Notification['type'] = 'appointment_created';
            let link = user.role === 'doctor' ? '/doctor/appointments' : '/patient/appointments';

            if (data.status === 'scheduled') {
                title = 'New Appointment Booked';
                type = 'appointment_created';
            } else if (data.status === 'in_progress') {
                title = 'Consultation Started';
                message = 'Your consultation has started. Join now.';
                type = 'appointment_started';
            } else if (data.status === 'completed') {
                title = 'Consultation Completed';
                type = 'appointment_ended';
            } else if (data.status === 'cancelled') {
                title = 'Appointment Cancelled';
                type = 'appointment_cancelled';
            } else if (data.status === 'terminated') {
                title = 'Consultation Terminated';
                type = 'appointment_terminated';
            }

            addNotification({ title, message, type, link, metadata: data });
        };

        const handleMessage = (data: any) => {
            // We only show a persistent notification if it's not from the current user
            if (data.senderId !== user.id && data.senderId !== user._id) {
                addNotification({
                    title: 'New Message',
                    message: data.content,
                    type: 'message_received',
                    link: user.role === 'doctor' ? `/doctor/appointments` : `/patient/appointments`,
                    metadata: data
                });
            }
        };

        socket.on('appointment:created', handleAppointmentEvent);
        socket.on('appointment:updated', handleAppointmentEvent);
        socket.on('message:received', handleMessage);

        return () => {
            socket.off('appointment:created', handleAppointmentEvent);
            socket.off('appointment:updated', handleAppointmentEvent);
            socket.off('message:received', handleMessage);
        };
    }, [user, addNotification]);

    const markRead = useCallback((id: string) => {
        setNotifications(prev =>
            prev.map(n => n.id === id ? { ...n, isRead: true } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
    }, []);

    const markAllRead = useCallback(() => {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        setUnreadCount(0);
    }, []);

    const clearNotifications = useCallback(() => {
        setNotifications([]);
        setUnreadCount(0);
    }, []);

    return {
        notifications,
        unreadCount,
        markRead,
        markAllRead,
        clearNotifications
    };
};
