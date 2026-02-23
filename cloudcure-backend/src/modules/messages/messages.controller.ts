import {
    Controller,
    Get,
    Patch,
    Param,
    UseGuards,
    Request,
    HttpCode,
    HttpStatus,
    Query,
    BadRequestException,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBearerAuth,
    ApiQuery,
} from '@nestjs/swagger';
import { MessagesService } from './messages.service';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';

interface AuthRequest extends Request {
    user: { id?: string; userId?: string; sub?: string };
}

function extractUserId(req: AuthRequest): string {
    const userId = req.user.id ?? req.user.userId ?? req.user.sub;
    if (!userId) {
        throw new BadRequestException('User ID not found in token');
    }
    return userId;
}

@ApiTags('Messages')
@Controller('messages')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MessagesController {
    constructor(private readonly messagesService: MessagesService) { }

    @Get('conversations')
    @ApiOperation({ summary: 'Get all conversations for the current user' })
    @ApiResponse({ status: 200, description: 'List of conversation previews' })
    async getConversations(@Request() req: AuthRequest) {
        const userId = extractUserId(req);
        return this.messagesService.getConversations(userId);
    }

    @Get('unread-count')
    @ApiOperation({ summary: 'Get unread message count for current user' })
    @ApiResponse({ status: 200, description: 'Unread count' })
    async getUnreadCount(@Request() req: AuthRequest) {
        const userId = extractUserId(req);
        const count = await this.messagesService.getUnreadCount(userId);
        return { count };
    }

    @Get(':otherUserId')
    @ApiOperation({ summary: 'Get conversation history with another user' })
    @ApiQuery({ name: 'appointmentId', required: false, type: String })
    @ApiResponse({ status: 200, description: 'List of messages' })
    async getConversation(
        @Request() req: AuthRequest,
        @Param('otherUserId') otherUserId: string,
        @Query('appointmentId') appointmentId?: string,
    ) {
        const userId = extractUserId(req);
        return this.messagesService.getConversation(userId, otherUserId, appointmentId);
    }

    @Patch('read/:otherUserId')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Mark all messages from a user as read' })
    @ApiResponse({ status: 200, description: 'Messages marked as read' })
    async markConversationAsRead(
        @Request() req: AuthRequest,
        @Param('otherUserId') otherUserId: string,
    ) {
        const userId = extractUserId(req);
        await this.messagesService.markConversationAsRead(userId, otherUserId);
        return { success: true };
    }
}
