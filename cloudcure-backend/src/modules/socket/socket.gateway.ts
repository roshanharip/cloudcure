import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { MessagesService } from '../messages/messages.service';

interface AuthenticatedSocket extends Socket {
  userId?: string;
}

interface RTCSessionDescription {
  type: 'offer' | 'answer';
  sdp: string;
}

interface RTCIceCandidate {
  candidate: string;
  sdpMid?: string | null;
  sdpMLineIndex?: number | null;
}

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  },
})
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(SocketGateway.name);
  private userSockets = new Map<string, string>(); // userId -> socketId

  constructor(private readonly messagesService: MessagesService) {
    this.logger.log('SocketGateway initialized');
  }

  handleConnection(client: AuthenticatedSocket) {
    this.logger.log(`Client connected: ${client.id}`);

    const authUserId = client.handshake.auth?.userId as string | undefined;
    const queryUserId = client.handshake.query?.userId as string | undefined;
    const userId = authUserId || queryUserId;

    if (userId && typeof userId === 'string') {
      client.userId = userId;
      this.userSockets.set(userId, client.id);
      this.logger.log(`User ${userId} connected with socket ${client.id}`);
      this.server.emit('user:online', { userId });
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
    this.logger.log(`Client disconnected: ${client.id}`);

    if (client.userId) {
      this.userSockets.delete(client.userId);
      this.server.emit('user:offline', { userId: client.userId });
    }
  }

  /**
   * Emit an event to a specific user by their userId.
   * Used externally by services (e.g. AppointmentsService).
   */
  emitToUser(userId: string, event: string, data: unknown): void {
    const socketId = this.userSockets.get(userId);
    if (socketId) {
      this.server.to(socketId).emit(event, data);
    }
  }

  /**
   * Emit to multiple users by their userIds.
   */
  emitToUsers(userIds: string[], event: string, data: unknown): void {
    for (const userId of userIds) {
      this.emitToUser(userId, event, data);
    }
  }

  @SubscribeMessage('join:room')
  async handleJoinRoom(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { roomId: string },
  ) {
    await client.join(data.roomId);
    this.logger.log(`Client ${client.id} joined room ${data.roomId}`);
  }

  /**
   * Join an appointment-specific chat room.
   * Room name: chat:<appointmentId>
   */
  @SubscribeMessage('chat:join')
  async handleChatJoin(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { appointmentId: string },
  ) {
    const room = `chat:${data.appointmentId}`;
    await client.join(room);
    this.logger.log(`Client ${client.id} joined chat room ${room}`);
    return { success: true, room };
  }

  @SubscribeMessage('message:send')
  async handleMessage(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody()
    data: {
      receiverId: string;
      content: string;
      type?: string;
      appointmentId?: string;
    },
  ) {
    if (!client.userId) {
      return { error: 'Unauthorized' };
    }

    try {
      const message = await this.messagesService.create(
        client.userId,
        data.receiverId,
        data.content,
        data.type || 'text',
        data.appointmentId,
      );

      const payload = {
        id: message._id.toString(),
        senderId: client.userId,
        receiverId: data.receiverId,
        content: message.content,
        type: message.type,
        isRead: false,
        createdAt: message.createdAt,
        appointmentId: data.appointmentId,
      };

      // Send to receiver if online
      const receiverSocketId = this.userSockets.get(data.receiverId);
      if (receiverSocketId) {
        this.server.to(receiverSocketId).emit('message:received', payload);
      }

      // Also broadcast to appointment chat room for multi-tab support
      if (data.appointmentId) {
        const room = `chat:${data.appointmentId}`;
        this.server.to(room).emit('message:received', payload);
      }

      return {
        success: true,
        messageId: message._id.toString(),
        timestamp: message.createdAt,
      };
    } catch (error: unknown) {
      this.logger.error('Error sending message', error);
      return { error: 'Failed to send message' };
    }
  }

  @SubscribeMessage('message:read')
  async handleMessageRead(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { otherUserId: string },
  ) {
    if (!client.userId) {
      return { error: 'Unauthorized' };
    }

    try {
      await this.messagesService.markConversationAsRead(
        client.userId,
        data.otherUserId,
      );

      // Notify sender that their messages were read
      const senderSocketId = this.userSockets.get(data.otherUserId);
      if (senderSocketId) {
        this.server.to(senderSocketId).emit('message:read_ack', {
          readByUserId: client.userId,
        });
      }

      return { success: true };
    } catch (error: unknown) {
      this.logger.error('Error marking messages as read', error);
      return { error: 'Failed to mark messages as read' };
    }
  }

  @SubscribeMessage('typing:start')
  handleTypingStart(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { receiverId: string },
  ) {
    const receiverSocketId = this.userSockets.get(data.receiverId);
    if (receiverSocketId) {
      this.server.to(receiverSocketId).emit('typing:indicator', {
        userId: client.userId,
        isTyping: true,
      });
    }
  }

  @SubscribeMessage('typing:stop')
  handleTypingStop(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { receiverId: string },
  ) {
    const receiverSocketId = this.userSockets.get(data.receiverId);
    if (receiverSocketId) {
      this.server.to(receiverSocketId).emit('typing:indicator', {
        userId: client.userId,
        isTyping: false,
      });
    }
  }

  // WebRTC signaling for video calls
  @SubscribeMessage('call:initiate')
  handleCallInitiate(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { receiverId: string; callType: 'audio' | 'video' },
  ) {
    const receiverSocketId = this.userSockets.get(data.receiverId);
    if (receiverSocketId) {
      this.server.to(receiverSocketId).emit('call:incoming', {
        callerId: client.userId,
        callType: data.callType,
      });
    }
  }

  @SubscribeMessage('call:accept')
  handleCallAccept(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { callerId: string },
  ) {
    const callerSocketId = this.userSockets.get(data.callerId);
    if (callerSocketId) {
      this.server.to(callerSocketId).emit('call:accepted', {
        receiverId: client.userId,
      });
    }
  }

  @SubscribeMessage('call:reject')
  handleCallReject(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { callerId: string },
  ) {
    const callerSocketId = this.userSockets.get(data.callerId);
    if (callerSocketId) {
      this.server.to(callerSocketId).emit('call:rejected', {
        receiverId: client.userId,
      });
    }
  }

  @SubscribeMessage('call:end')
  handleCallEnd(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { otherUserId: string },
  ) {
    const otherSocketId = this.userSockets.get(data.otherUserId);
    if (otherSocketId) {
      this.server.to(otherSocketId).emit('call:ended', {
        userId: client.userId,
      });
    }
  }

  @SubscribeMessage('call:offer')
  handleCallOffer(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { receiverId: string; offer: RTCSessionDescription },
  ) {
    const receiverSocketId = this.userSockets.get(data.receiverId);
    if (receiverSocketId) {
      this.server.to(receiverSocketId).emit('call:offer', {
        senderId: client.userId,
        offer: data.offer,
      });
    }
  }

  @SubscribeMessage('call:answer')
  handleCallAnswer(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { callerId: string; answer: RTCSessionDescription },
  ) {
    const callerSocketId = this.userSockets.get(data.callerId);
    if (callerSocketId) {
      this.server.to(callerSocketId).emit('call:answer', {
        senderId: client.userId,
        answer: data.answer,
      });
    }
  }

  @SubscribeMessage('call:ice-candidate')
  handleIceCandidate(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { otherUserId: string; candidate: RTCIceCandidate },
  ) {
    const otherSocketId = this.userSockets.get(data.otherUserId);
    if (otherSocketId) {
      this.server.to(otherSocketId).emit('call:ice-candidate', {
        senderId: client.userId,
        candidate: data.candidate,
      });
    }
  }
}
