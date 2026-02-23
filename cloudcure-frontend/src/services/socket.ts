import { io, Socket } from 'socket.io-client';
import { logger } from '@/utils/logger';


export interface ServerResponse {
  success: boolean;
  error?: string;
  data?: unknown;
}

export interface MessageData {
  senderId: string;
  receiverId: string;
  content: string;
  type: string;
  senderName?: string;
  timestamp: string;
  [key: string]: unknown;
}

export interface CallData {
  callerId: string;
  callType: 'audio' | 'video';
  callerName?: string;
  [key: string]: unknown;
}

export interface WebRTCOffer {
  senderId: string;
  receiverId: string;
  offer: RTCSessionDescriptionInit;
}

export interface WebRTCAnswer {
  senderId: string;
  receiverId: string;
  answer: RTCSessionDescriptionInit;
}

export interface WebRTCCandidate {
  senderId: string;
  candidate: RTCIceCandidateInit;
}

class SocketService {
  private socket: Socket | null = null;

  connect(userId: string): Socket {
    if (this.socket?.connected) {
      logger.info('Socket already connected');
      return this.socket;
    }

    const apiUrl = import.meta.env.VITE_API_URL as string | undefined;
    const SOCKET_URL = apiUrl ? apiUrl.replace('/api/v1', '') : 'http://localhost:3000';

    this.socket = io(SOCKET_URL, {
      auth: {
        userId,
      },
      transports: ['websocket', 'polling'],
    });

    this.socket.on('connect', () => {
      logger.info('Socket connected', { socketId: this.socket?.id });
    });

    this.socket.on('disconnect', () => {
      logger.warn('Socket disconnected');
    });

    this.socket.on('connect_error', (error: Error) => {
      logger.error('Socket connection error', error);
    });

    return this.socket;
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      logger.info('Socket disconnected manually');
    }
  }

  getSocket(): Socket | null {
    return this.socket;
  }

  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  // Message events
  sendMessage(receiverId: string, content: string, type = 'text', appointmentId?: string): Promise<unknown> | undefined {
    if (!this.socket) return;
    const socket = this.socket;
    return new Promise((resolve, reject) => {
      socket.emit('message:send', { receiverId, content, type, appointmentId }, (response: ServerResponse) => {
        if (response.success) {
          resolve(response);
        } else {
          reject(new Error(response.error));
        }
      });
    });
  }

  onMessageReceived(callback: (data: MessageData) => void): void {
    this.socket?.on('message:received', callback);
  }

  onTyping(callback: (data: { userId: string; isTyping: boolean }) => void): void {
    this.socket?.on('typing:indicator', callback);
  }

  startTyping(receiverId: string): void {
    this.socket?.emit('typing:start', { receiverId });
  }

  stopTyping(receiverId: string): void {
    this.socket?.emit('typing:stop', { receiverId });
  }

  // User status events
  onUserOnline(callback: (data: { userId: string }) => void): void {
    this.socket?.on('user:online', callback);
  }

  onUserOffline(callback: (data: { userId: string }) => void): void {
    this.socket?.on('user:offline', callback);
  }

  // Call events
  initiateCall(receiverId: string, callType: 'audio' | 'video'): void {
    this.socket?.emit('call:initiate', { receiverId, callType });
  }

  acceptCall(callerId: string): void {
    this.socket?.emit('call:accept', { callerId });
  }

  rejectCall(callerId: string): void {
    this.socket?.emit('call:reject', { callerId });
  }

  endCall(otherUserId: string): void {
    this.socket?.emit('call:end', { otherUserId });
  }

  onIncomingCall(callback: (data: CallData) => void): void {
    this.socket?.on('call:incoming', callback);
  }

  onCallAccepted(callback: (data: { receiverId: string }) => void): void {
    this.socket?.on('call:accepted', callback);
  }

  onCallRejected(callback: (data: { receiverId: string }) => void): void {
    this.socket?.on('call:rejected', callback);
  }

  onCallEnded(callback: (data: { userId: string }) => void): void {
    this.socket?.on('call:ended', callback);
  }

  // WebRTC signaling
  sendOffer(receiverId: string, offer: RTCSessionDescriptionInit): void {
    this.socket?.emit('call:offer', { receiverId, offer });
  }

  sendAnswer(callerId: string, answer: RTCSessionDescriptionInit): void {
    this.socket?.emit('call:answer', { callerId, answer });
  }

  sendIceCandidate(otherUserId: string, candidate: RTCIceCandidateInit): void {
    this.socket?.emit('call:ice-candidate', { otherUserId, candidate });
  }

  onOffer(callback: (data: WebRTCOffer) => void): void {
    this.socket?.on('call:offer', callback);
  }

  onAnswer(callback: (data: WebRTCAnswer) => void): void {
    this.socket?.on('call:answer', callback);
  }

  onIceCandidate(callback: (data: WebRTCCandidate) => void): void {
    this.socket?.on('call:ice-candidate', callback);
  }

  // Join rooms
  joinRoom(roomId: string): void {
    this.socket?.emit('join:room', { roomId });
  }

  // Remove all listeners
  removeAllListeners(): void {
    this.socket?.removeAllListeners();
  }
}

// Export singleton instance
export const socketService = new SocketService();
