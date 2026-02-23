import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Message, MessageDocument } from './schemas/message.schema';

export interface ConversationPreview {
  userId: string;
  userName: string;
  userEmail: string;
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
}

@Injectable()
export class MessagesService {
  private readonly logger = new Logger(MessagesService.name);

  constructor(
    @InjectModel(Message.name)
    private messageModel: Model<MessageDocument>,
  ) {
    this.logger.log('MessagesService initialized');
  }

  async create(
    senderId: string,
    receiverId: string,
    content: string,
    type = 'text',
    appointmentId?: string,
  ): Promise<MessageDocument> {
    const messageData: {
      sender: Types.ObjectId;
      receiver: Types.ObjectId;
      content: string;
      type: string;
      appointmentId?: Types.ObjectId;
    } = {
      sender: new Types.ObjectId(senderId),
      receiver: new Types.ObjectId(receiverId),
      content,
      type,
    };

    if (appointmentId) {
      messageData.appointmentId = new Types.ObjectId(appointmentId);
    }

    const message = new this.messageModel(messageData);
    return message.save();
  }

  async getConversation(
    user1Id: string,
    user2Id: string,
    appointmentId?: string,
  ): Promise<MessageDocument[]> {
    const baseQuery = {
      $or: [
        {
          sender: new Types.ObjectId(user1Id),
          receiver: new Types.ObjectId(user2Id),
        },
        {
          sender: new Types.ObjectId(user2Id),
          receiver: new Types.ObjectId(user1Id),
        },
      ],
    };

    const query = appointmentId
      ? { ...baseQuery, appointmentId: new Types.ObjectId(appointmentId) }
      : baseQuery;

    return this.messageModel
      .find(query)
      .populate('sender', 'name email')
      .populate('receiver', 'name email')
      .sort({ createdAt: 1 })
      .exec();
  }

  /**
   * Get a list of conversations (unique peers) for a user,
   * each with the last message and unread count.
   */
  async getConversations(userId: string): Promise<ConversationPreview[]> {
    const userObjectId = new Types.ObjectId(userId);

    // Find all messages sent or received by the user
    const messages = await this.messageModel
      .find({
        $or: [{ sender: userObjectId }, { receiver: userObjectId }],
      })
      .populate('sender', 'name email')
      .populate('receiver', 'name email')
      .sort({ createdAt: -1 })
      .exec();

    // Build conversation map (keyed by peer userId)
    const conversationMap = new Map<string, ConversationPreview>();

    for (const msg of messages) {
      const senderPopulated = msg.sender as unknown as {
        _id: Types.ObjectId;
        name: string;
        email: string;
      };
      const receiverPopulated = msg.receiver as unknown as {
        _id: Types.ObjectId;
        name: string;
        email: string;
      };

      const senderId = senderPopulated._id.toString();
      const receiverId = receiverPopulated._id.toString();

      // Determine the peer (the other side of this conversation)
      const peerId = senderId === userId ? receiverId : senderId;
      const peerName =
        senderId === userId ? receiverPopulated.name : senderPopulated.name;
      const peerEmail =
        senderId === userId ? receiverPopulated.email : senderPopulated.email;

      if (!conversationMap.has(peerId)) {
        const unreadCount = await this.messageModel
          .countDocuments({
            sender: new Types.ObjectId(peerId),
            receiver: userObjectId,
            isRead: false,
          })
          .exec();

        conversationMap.set(peerId, {
          userId: peerId,
          userName: peerName,
          userEmail: peerEmail,
          lastMessage: msg.content,
          lastMessageTime: msg.createdAt,
          unreadCount,
        });
      }
    }

    return Array.from(conversationMap.values());
  }

  async markAsRead(messageId: string): Promise<MessageDocument> {
    const message = await this.messageModel
      .findByIdAndUpdate(messageId, { isRead: true }, { new: true })
      .exec();

    if (!message) {
      throw new NotFoundException(`Message with ID ${messageId} not found`);
    }

    return message;
  }

  async markConversationAsRead(
    userId: string,
    otherUserId: string,
  ): Promise<void> {
    await this.messageModel
      .updateMany(
        {
          sender: new Types.ObjectId(otherUserId),
          receiver: new Types.ObjectId(userId),
          isRead: false,
        },
        { isRead: true },
      )
      .exec();
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.messageModel
      .countDocuments({
        receiver: new Types.ObjectId(userId),
        isRead: false,
      })
      .exec();
  }
}
