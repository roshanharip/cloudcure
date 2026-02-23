import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Search } from 'lucide-react';
import { format } from 'date-fns';
import { useGetConversationsQuery } from '@/services/messagesApi';
import { useSocket } from '@/hooks/useSocket';
import { ChatWindow } from '@/components/chat/ChatWindow';
import type { Conversation } from '@/types';

export default function DoctorChatPage() {
    const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
    const [search, setSearch] = useState('');
    const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
    const [searchParams] = useSearchParams();

    const { socket } = useSocket();

    const { data: conversations = [], refetch } = useGetConversationsQuery();

    const queryPatientId = searchParams.get('patientId');
    const queryPatientName = searchParams.get('patientName');
    const queryAppointmentId = searchParams.get('appointmentId');

    // Auto-select patient if coming from Dashboard 'Start' button
    useEffect(() => {
        // If conversations are loaded and we have a target param
        if (queryPatientId && queryPatientName && !activeConversation && conversations.length >= 0) {
            const existing = conversations.find((c) => c.userId === queryPatientId);
            if (existing) {
                setActiveConversation(existing);
            } else {
                setActiveConversation({
                    userId: queryPatientId,
                    userName: queryPatientName,
                    userEmail: '',
                    lastMessage: '',
                    lastMessageTime: new Date().toISOString(),
                    unreadCount: 0
                });
            }
        }
    }, [queryPatientId, queryPatientName, activeConversation, conversations]);

    // Track online users via socket events
    useEffect(() => {
        if (!socket) return;

        const handleOnline = (data: { userId: string }) => {
            setOnlineUsers((prev) => new Set(prev).add(data.userId));
        };
        const handleOffline = (data: { userId: string }) => {
            setOnlineUsers((prev) => {
                const next = new Set(prev);
                next.delete(data.userId);
                return next;
            });
        };
        // Refetch conversations when new message arrives (to update last message)
        const handleNewMsg = () => void refetch();

        socket.on('user:online', handleOnline);
        socket.on('user:offline', handleOffline);
        socket.on('message:received', handleNewMsg);

        return () => {
            socket.off('user:online', handleOnline);
            socket.off('user:offline', handleOffline);
            socket.off('message:received', handleNewMsg);
        };
    }, [socket, refetch]);

    const filtered = conversations.filter((c) =>
        c.userName.toLowerCase().includes(search.toLowerCase()),
    );

    return (
        <div className="h-[calc(100vh-8rem)] flex gap-4">
            {/* Sidebar: Contacts */}
            <Card className="w-80 flex flex-col flex-shrink-0">
                <CardHeader className="p-4 border-b">
                    <CardTitle className="text-lg">Messages</CardTitle>
                    <div className="relative mt-2">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search patients..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                </CardHeader>
                <CardContent className="p-0 flex-1 overflow-hidden">
                    <div className="h-full overflow-y-auto">
                        {filtered.length === 0 && !queryPatientId ? (
                            <div className="flex flex-col items-center justify-center h-32 text-muted-foreground text-sm">
                                <MessageSquare className="h-8 w-8 mb-2 opacity-40" />
                                <p>No conversations yet</p>
                            </div>
                        ) : (
                            filtered.map((conv) => (
                                <button
                                    key={conv.userId}
                                    type="button"
                                    onClick={() => setActiveConversation(conv)}
                                    className={`w-full p-4 flex items-center gap-3 text-left cursor-pointer hover:bg-muted/50 transition-colors border-b last:border-b-0 ${activeConversation?.userId === conv.userId ? 'bg-muted' : ''
                                        }`}
                                >
                                    <div className="relative flex-shrink-0">
                                        <Avatar className="h-10 w-10">
                                            <AvatarFallback>
                                                {conv.userName.charAt(0).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        {onlineUsers.has(conv.userId) && (
                                            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-background rounded-full" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-center">
                                            <span className="font-medium text-sm truncate">
                                                {conv.userName}
                                            </span>
                                            <span className="text-[10px] text-muted-foreground flex-shrink-0 ml-1">
                                                {format(new Date(conv.lastMessageTime), 'HH:mm')}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <p className="text-xs text-muted-foreground truncate flex-1">
                                                {conv.lastMessage}
                                            </p>
                                            {conv.unreadCount > 0 && (
                                                <Badge className="h-4 min-w-4 px-1 text-[10px] flex-shrink-0">
                                                    {conv.unreadCount}
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Main Chat Area */}
            <Card className="flex-1 flex flex-col overflow-hidden">
                {activeConversation ? (
                    <>
                        {/* Chat header */}
                        <div className="p-4 border-b flex items-center gap-3 flex-shrink-0">
                            <div className="relative">
                                <Avatar className="h-9 w-9">
                                    <AvatarFallback>
                                        {activeConversation.userName.charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                {onlineUsers.has(activeConversation.userId) && (
                                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-background rounded-full" />
                                )}
                            </div>
                            <div>
                                <p className="font-semibold text-sm">{activeConversation.userName}</p>
                                <p className="text-xs text-muted-foreground">
                                    {onlineUsers.has(activeConversation.userId) ? (
                                        <span className="text-green-500">Online</span>
                                    ) : (
                                        'Offline'
                                    )}
                                </p>
                            </div>
                        </div>

                        {/* Chat window fills remaining space */}
                        <div className="flex-1 overflow-hidden">
                            <ChatWindow
                                otherUserId={activeConversation.userId}
                                otherUserName={activeConversation.userName}
                                appointmentId={activeConversation.userId === queryPatientId ? (queryAppointmentId || undefined) : undefined}
                                isDoctor={true}
                            />
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
                        <div className="bg-muted/50 p-6 rounded-full mb-4">
                            <MessageSquare className="h-10 w-10 text-muted-foreground/50" />
                        </div>
                        <p className="font-medium">Select a patient to start messaging</p>
                        <p className="text-sm mt-1">
                            Your conversations with patients will appear here
                        </p>
                    </div>
                )}
            </Card>
        </div>
    );
}
