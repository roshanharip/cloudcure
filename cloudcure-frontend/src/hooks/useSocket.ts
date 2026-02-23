import { useEffect, useCallback } from 'react';
import { Socket } from 'socket.io-client';
import { useDispatch } from 'react-redux';
import { socketService, CallData } from '@/services/socket';
import { addNotification } from '@/store/slices/notificationsSlice';
import { useAuth } from './useAuth';
import { logger } from '@/utils/logger';
import { appointmentsApi } from '@/services/appointmentsApi';
import { api } from '@/services/api';

interface NotificationData {
  message?: string;
  [key: string]: unknown;
}

/**
 * Hook to manage Socket.io connection and real-time notifications
 * Auto-connects when user is authenticated
 * Listens for various real-time events and dispatches notifications
 */
export const useSocket = (): {
  socket: Socket | null;
  isConnected: () => boolean;
  sendMessage: (receiverId: string, content: string, type?: string) => Promise<unknown> | undefined;
  initiateCall: (receiverId: string, type?: 'audio' | 'video') => void;
  acceptCall: (callerId: string) => void;
  rejectCall: (callerId: string) => void;
  endCall: (otherUserId: string) => void;
} => {
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated || !user) {
      socketService.disconnect();
      return;
    }

    // Connect socket with user ID
    interface UserWithId {
      id?: string;
      _id?: string;
    }
    const userId = (user as UserWithId).id ?? (user as UserWithId)._id; // Handle both id and _id

    if (userId) {
      socketService.connect(userId);
    }

    // Listen for new messages
    socketService.onMessageReceived((data) => {
      logger.info('New message received', data);
      dispatch(
        addNotification({
          type: 'message',
          title: 'New Message',
          message: `You have a new message from ${data.senderName ?? 'a user'}`,
          data,
        })
      );
    });

    // Listen for incoming calls
    socketService.onIncomingCall((data: CallData) => {
      logger.info('Incoming call', data);
      dispatch(
        addNotification({
          type: 'call',
          title: 'Incoming Call',
          message: `${data.callType === 'video' ? 'Video' : 'Audio'} call from ${data.callerName ?? 'a user'}`,
          data: data as unknown as Record<string, unknown>,
        })
      );
    });

    // Listen for user status changes
    socketService.onUserOnline((data) => {
      logger.info('User online', data.userId);
    });

    socketService.onUserOffline((data) => {
      logger.info('User offline', data.userId);
    });

    // Cleanup on unmount
    return () => {
      socketService.removeAllListeners();
    };
  }, [isAuthenticated, user, dispatch]);

  const sendMessage = useCallback(async (receiverId: string, content: string, type = 'text') => {
    return socketService.sendMessage(receiverId, content, type);
  }, []);

  return {
    socket: socketService.getSocket(),
    isConnected: socketService.isConnected.bind(socketService), // Bind to service
    sendMessage,
    initiateCall: (receiverId: string, type: 'audio' | 'video' = 'audio') => {
      socketService.initiateCall(receiverId, type);
    },
    acceptCall: socketService.acceptCall.bind(socketService),
    rejectCall: socketService.rejectCall.bind(socketService),
    endCall: socketService.endCall.bind(socketService),
  };
};

/**
 * Hook to handle real-time updates for appointments
 * Refetches appointment data when updates occur
 */
export const useAppointmentNotifications = (): void => {
  const dispatch = useDispatch();
  const { user } = useAuth();

  useEffect(() => {
    const socket = socketService.getSocket();
    if (!socket || !user) return;

    const handleAppointmentUpdate = (data: NotificationData): void => {
      logger.info('Appointment update received', data);

      dispatch(
        addNotification({
          type: 'appointment',
          title: 'Appointment Update',
          message: data.message ?? 'An appointment has been updated',
          data: data as unknown as Record<string, unknown>,
        })
      );

      // Refetch appointments list
      dispatch(appointmentsApi.util.invalidateTags(['Appointment']));
    };

    socket.on('appointment:created', handleAppointmentUpdate);
    socket.on('appointment:updated', handleAppointmentUpdate);
    socket.on('appointment:cancelled', handleAppointmentUpdate);
    socket.on('appointment:started', handleAppointmentUpdate);
    socket.on('appointment:ended', handleAppointmentUpdate);
    socket.on('appointment:terminated', handleAppointmentUpdate);

    return () => {
      socket.off('appointment:created', handleAppointmentUpdate);
      socket.off('appointment:updated', handleAppointmentUpdate);
      socket.off('appointment:cancelled', handleAppointmentUpdate);
      socket.off('appointment:started', handleAppointmentUpdate);
      socket.off('appointment:ended', handleAppointmentUpdate);
      socket.off('appointment:terminated', handleAppointmentUpdate);
    };
  }, [dispatch, user]);
};

/**
 * Hook to handle real-time updates for prescriptions
 */
export const usePrescriptionNotifications = (): void => {
  const dispatch = useDispatch();

  useEffect(() => {
    const socket = socketService.getSocket();
    if (!socket) return;

    const handlePrescriptionUpdate = (data: NotificationData): void => {
      logger.info('Prescription update received', data);

      dispatch(
        addNotification({
          type: 'prescription',
          title: 'Prescription Added',
          message: data.message ?? 'A new prescription has been added',
          data: data as unknown as Record<string, unknown>,
        })
      );

      // Refetch prescriptions
      dispatch(api.util.invalidateTags(['Prescription']));
    };

    socket.on('prescription:created', handlePrescriptionUpdate);
    socket.on('prescription:updated', handlePrescriptionUpdate);

    return () => {
      socket.off('prescription:created', handlePrescriptionUpdate);
      socket.off('prescription:updated', handlePrescriptionUpdate);
    };
  }, [dispatch]);
};

/**
 * Hook to handle real-time updates for medical records
 */
export const useMedicalRecordNotifications = (): void => {
  const dispatch = useDispatch();

  useEffect(() => {
    const socket = socketService.getSocket();
    if (!socket) return;

    const handleRecordUpdate = (data: NotificationData): void => {
      logger.info('Medical record update received', data);

      dispatch(
        addNotification({
          type: 'record',
          title: 'Medical Record Update',
          message: data.message ?? 'Your medical records have been updated',
          data: data as unknown as Record<string, unknown>,
        })
      );

      // Refetch medical records
      dispatch(api.util.invalidateTags(['MedicalRecord']));
    };

    socket.on('record:created', handleRecordUpdate);
    socket.on('record:updated', handleRecordUpdate);

    return () => {
      socket.off('record:created', handleRecordUpdate);
      socket.off('record:updated', handleRecordUpdate);
    };
  }, [dispatch]);
};
