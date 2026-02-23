import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { format, isToday, isYesterday, startOfDay } from 'date-fns';
import { Send, Check, CheckCheck, Loader2, Paperclip, MoreVertical, Phone, Video, MessageSquare, Clock, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import { socketService } from '@/services/socket';
import { useGetConversationQuery, useMarkConversationReadMutation } from '@/services/messagesApi';
import { useTerminateAppointmentMutation } from '@/services/appointmentsApi';
import type { Message } from '@/types';
import { cn } from '@/utils';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface ChatWindowProps {
    otherUserId: string;
    otherUserName: string;
    otherUserAvatar?: string;
    appointmentId?: string;
    /** Pass true when rendered inside a doctor context so the waiting timer activates */
    isDoctor?: boolean;
}

interface IncomingMessageEvent {
    id: string;
    senderId: string;
    receiverId?: string;
    content: string;
    type?: string;
    isRead?: boolean;
    createdAt: string;
    appointmentId?: string;
}

function normalizeSenderId(msg: Message): string {
    if (typeof msg.sender === 'string') return msg.sender;
    return msg.sender._id;
}

export function ChatWindow({ otherUserId, otherUserName, otherUserAvatar, appointmentId, isDoctor = false }: ChatWindowProps) {
    const { user } = useAuth();
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [liveMessages, setLiveMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [isOnline, setIsOnline] = useState(false);
    const [waitingTimeLeft, setWaitingTimeLeft] = useState(120);
    const [showWaitTimeoutPrompt, setShowWaitTimeoutPrompt] = useState(false);
    const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const waitTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const navigate = useNavigate();

    const myId = user?.id ?? user?._id ?? '';

    // Fetch conversation history — no appointmentId filter, always fetch full conversation
    const { data: historyMessages, isLoading } = useGetConversationQuery(
        { otherUserId },
        { skip: !otherUserId },
    );

    const [markRead] = useMarkConversationReadMutation();
    const [terminateAppointment, { isLoading: isTerminating }] = useTerminateAppointmentMutation();

    // Merge history + live messages, deduplicated by _id
    const allMessages = useMemo(() => {
        const seen = new Set<string>();
        const combined = [...(historyMessages ?? []), ...liveMessages];
        return combined
            .filter((m) => {
                if (seen.has(m._id)) return false;
                seen.add(m._id);
                return true;
            })
            .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    }, [historyMessages, liveMessages]);

    // Group messages by date
    const groupedMessages = useMemo(() => {
        const groups: { date: Date; messages: Message[] }[] = [];
        allMessages.forEach((msg) => {
            const date = startOfDay(new Date(msg.createdAt));
            let group = groups.find((g) => g.date.getTime() === date.getTime());
            if (!group) {
                group = { date, messages: [] };
                groups.push(group);
            }
            group.messages.push(msg);
        });
        return groups;
    }, [allMessages]);

    const formatGroupDate = (date: Date) => {
        if (isToday(date)) return 'Today';
        if (isYesterday(date)) return 'Yesterday';
        return format(date, 'MMMM d, yyyy');
    };

    // Join appointment chat room and register listeners
    useEffect(() => {
        const socket = socketService.getSocket();
        if (!socket || !user || !myId) return;

        if (appointmentId) {
            socket.emit('chat:join', { appointmentId });
        }

        const handleIncoming = (data: IncomingMessageEvent) => {
            // Accept messages from the other user OR from ourselves (own room broadcast)
            const isFromOther = data.senderId === otherUserId;
            const isFromSelf = data.senderId === myId;
            if (!isFromOther && !isFromSelf) return;

            const msg: Message = {
                _id: data.id,
                sender: data.senderId,
                receiver: data.receiverId ?? myId,
                content: data.content,
                type: (data.type as Message['type']) ?? 'text',
                isRead: data.isRead ?? false,
                appointmentId: data.appointmentId,
                createdAt: data.createdAt,
            };

            setLiveMessages((prev) => {
                if (prev.some((m) => m._id === msg._id)) return prev;
                return [...prev, msg];
            });

            if (isFromOther) {
                void markRead(otherUserId);
                socket.emit('message:read', { otherUserId });
            }
        };

        const handleTypingIndicator = (data: { userId: string; isTyping: boolean }) => {
            if (data.userId === otherUserId) {
                setIsTyping(data.isTyping);
            }
        };

        const handleOnlineStatus = (data: { userId: string }) => {
            if (data.userId === otherUserId) setIsOnline(true);
        };

        const handleOfflineStatus = (data: { userId: string }) => {
            if (data.userId === otherUserId) setIsOnline(false);
        };

        socket.on('message:received', handleIncoming);
        socket.on('typing:indicator', handleTypingIndicator);
        socket.on('user:online', handleOnlineStatus);
        socket.on('user:offline', handleOfflineStatus);

        void markRead(otherUserId);

        return () => {
            socket.off('message:received', handleIncoming);
            socket.off('typing:indicator', handleTypingIndicator);
            socket.off('user:online', handleOnlineStatus);
            socket.off('user:offline', handleOfflineStatus);
        };
    }, [otherUserId, appointmentId, myId, user, markRead]);

    // Reset live messages when the conversation partner changes
    useEffect(() => {
        setLiveMessages([]);
        setIsTyping(false);
        setIsOnline(false);
    }, [otherUserId]);

    // Waiting timer — only active for doctors in an appointment context
    useEffect(() => {
        if (!appointmentId || !isDoctor) return;

        if (isOnline) {
            if (waitTimerRef.current) clearInterval(waitTimerRef.current);
            setShowWaitTimeoutPrompt(false);
            setWaitingTimeLeft(120);
            return;
        }

        if (!showWaitTimeoutPrompt) {
            waitTimerRef.current = setInterval(() => {
                setWaitingTimeLeft((prev) => {
                    if (prev <= 1) {
                        clearInterval(waitTimerRef.current!);
                        setShowWaitTimeoutPrompt(true);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }

        return () => {
            if (waitTimerRef.current) clearInterval(waitTimerRef.current);
        };
    }, [appointmentId, isDoctor, isOnline, showWaitTimeoutPrompt]);

    const handleTerminate = async () => {
        if (!appointmentId) return;
        try {
            await terminateAppointment({ id: appointmentId, reason: 'Patient irresponsive / did not join in time' }).unwrap();
            toast.error('Appointment terminated');
            navigate('/doctor/dashboard');
        } catch {
            toast.error('Failed to terminate appointment');
        }
    };

    const handleWaitLonger = () => {
        setShowWaitTimeoutPrompt(false);
        setWaitingTimeLeft(60);
    };

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [groupedMessages, isTyping]);

    const handleInputChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            setInput(e.target.value);
            const socket = socketService.getSocket();
            if (!socket) return;

            socket.emit('typing:start', { receiverId: otherUserId });

            if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
            typingTimerRef.current = setTimeout(() => {
                socket.emit('typing:stop', { receiverId: otherUserId });
            }, 2000);
        },
        [otherUserId],
    );

    const handleSend = useCallback(async () => {
        const content = input.trim();
        if (!content || !user) return;

        setIsSending(true);
        setInput('');

        const socket = socketService.getSocket();
        if (socket) {
            socket.emit('typing:stop', { receiverId: otherUserId });
        }

        try {
            const response = await socketService.sendMessage(otherUserId, content, 'text', appointmentId) as any;
            if (response && response.success) {
                // Optimistically add the sent message (will be deduplicated once the room broadcast arrives)
                const newMsg: Message = {
                    _id: response.messageId || `temp-${Date.now()}`,
                    sender: myId,
                    receiver: otherUserId,
                    content,
                    type: 'text',
                    isRead: false,
                    createdAt: response.timestamp || new Date().toISOString(),
                    appointmentId,
                };

                setLiveMessages((prev) => {
                    if (prev.some((m) => m._id === newMsg._id)) return prev;
                    return [...prev, newMsg];
                });
            }
        } catch {
            setInput(content);
            toast.error('Failed to send message. Please try again.');
        } finally {
            setIsSending(false);
        }
    }, [input, otherUserId, myId, user, appointmentId]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            void handleSend();
        }
    };

    const handleVideoCall = () => {
        if (!appointmentId || !otherUserId) {
            toast.error('Cannot start a video call without an active appointment.');
            return;
        }
        navigate(`/video-call/${appointmentId}/${otherUserId}`);
    };

    if (isLoading) {
        return (
            <div className="flex flex-1 items-center justify-center bg-zinc-50 dark:bg-zinc-950">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-[#f0f2f5] dark:bg-zinc-950">
            {/* Header */}
            <header className="px-4 py-3 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between shadow-sm z-10">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Avatar className="h-10 w-10 border border-zinc-200 dark:border-zinc-700">
                            <AvatarImage src={otherUserAvatar} />
                            <AvatarFallback className="bg-primary/10 text-primary font-bold">
                                {otherUserName.charAt(0).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        {isOnline && (
                            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-zinc-900 rounded-full" />
                        )}
                    </div>
                    <div>
                        <h3 className="text-sm font-bold leading-none">{otherUserName}</h3>
                        <p className="text-[11px] text-zinc-500 mt-1 font-medium italic">
                            {isTyping ? 'typing...' : (isOnline ? 'Online' : 'Offline')}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-9 w-9 text-zinc-500" title="Voice call (coming soon)" disabled>
                        <Phone className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 text-zinc-500"
                        title="Start video call"
                        onClick={handleVideoCall}
                        disabled={!appointmentId}
                    >
                        <Video className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-9 w-9 text-zinc-500">
                        <MoreVertical className="h-4 w-4" />
                    </Button>
                </div>
            </header>

            {/* Doctor-only: Waiting Alert Banner */}
            {isDoctor && appointmentId && showWaitTimeoutPrompt && (
                <div className="bg-red-50 dark:bg-red-950/30 border-b border-red-100 dark:border-red-900/50 p-4 flex flex-col sm:flex-row items-center justify-between gap-4 z-20">
                    <div className="flex items-center gap-3 text-red-800 dark:text-red-400">
                        <Clock className="h-5 w-5 animate-pulse" />
                        <div className="text-sm">
                            <p className="font-semibold">Patient hasn't joined yet</p>
                            <p className="opacity-80">The 2 minute waiting period has expired.</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline" onClick={handleWaitLonger} className="border-red-200 text-red-700 hover:bg-red-100 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-900/50">
                            Wait 1 more min
                        </Button>
                        <Button size="sm" onClick={() => void handleTerminate()} disabled={isTerminating} className="bg-red-600 hover:bg-red-700 text-white">
                            {isTerminating ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <XCircle className="h-4 w-4 mr-1" />}
                            Terminate Call
                        </Button>
                    </div>
                </div>
            )}

            {isDoctor && appointmentId && !isOnline && !showWaitTimeoutPrompt && waitingTimeLeft > 0 && (
                <div className="bg-blue-50 dark:bg-blue-950/30 border-b border-blue-100 dark:border-blue-900/50 p-2 flex items-center justify-center gap-2 z-20">
                    <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400 animate-pulse" />
                    <p className="text-xs text-blue-800 dark:text-blue-300 font-medium">
                        Waiting for patient to join... ({Math.floor(waitingTimeLeft / 60)}:{String(waitingTimeLeft % 60).padStart(2, '0')})
                    </p>
                </div>
            )}

            {/* Messages List Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-hide">
                {groupedMessages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-zinc-500">
                        <div className="w-16 h-16 rounded-full bg-white dark:bg-zinc-900 flex items-center justify-center mb-4 shadow-sm border border-zinc-200 dark:border-zinc-800">
                            <MessageSquare className="h-8 w-8 text-primary/40" />
                        </div>
                        <p className="text-sm font-medium">No messages yet</p>
                        <p className="text-xs text-zinc-400">Your messages are secured with end-to-end encryption</p>
                    </div>
                )}

                {groupedMessages.map((group) => (
                    <div key={group.date.toISOString()} className="space-y-4">
                        <div className="flex justify-center">
                            <span className="px-3 py-1 rounded-lg bg-white/80 dark:bg-zinc-800/80 backdrop-blur shadow-sm text-[10px] font-bold text-zinc-500 uppercase tracking-widest border border-zinc-200 dark:border-zinc-700">
                                {formatGroupDate(group.date)}
                            </span>
                        </div>

                        {group.messages.map((msg, idx) => {
                            const senderId = normalizeSenderId(msg);
                            const isMine = senderId === myId;
                            const prevMsg = group.messages[idx - 1];
                            const isFirstInSequence = !prevMsg || normalizeSenderId(prevMsg) !== senderId;

                            return (
                                <div
                                    key={msg._id}
                                    className={cn(
                                        'flex animate-in fade-in slide-in-from-bottom-2 duration-300',
                                        isMine ? 'justify-end' : 'justify-start',
                                        isFirstInSequence ? 'mt-4' : 'mt-1',
                                    )}
                                >
                                    <div
                                        className={cn(
                                            'max-w-[75%] rounded-2xl px-3.5 py-2 text-sm shadow-sm relative group transition-all',
                                            isMine
                                                ? 'bg-primary text-primary-foreground rounded-tr-none hover:brightness-105'
                                                : 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-tl-none hover:bg-zinc-50 dark:hover:bg-zinc-850',
                                        )}
                                    >
                                        <p className="leading-relaxed break-words">{msg.content}</p>
                                        <div
                                            className={cn(
                                                'flex items-center justify-end gap-1 mt-1 opacity-70',
                                                isMine ? 'text-primary-foreground/80' : 'text-zinc-500',
                                            )}
                                        >
                                            <span className="text-[9px] font-medium tracking-tighter">
                                                {format(new Date(msg.createdAt), 'HH:mm')}
                                            </span>
                                            {isMine && (
                                                msg.isRead ? (
                                                    <CheckCheck className="h-3 w-3 text-white" />
                                                ) : (
                                                    <Check className="h-3 w-3 text-white/70" />
                                                )
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ))}

                {/* Typing indicator bubble */}
                {isTyping && (
                    <div className="flex justify-start animate-in fade-in slide-in-from-left-2 duration-300">
                        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl rounded-tl-none px-4 py-2.5 shadow-sm">
                            <div className="flex gap-1.5 items-center">
                                <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                <span className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" />
                            </div>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} className="h-px" />
            </div>

            {/* Footer with Input Area */}
            <div className="p-4 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 z-10">
                <div className="flex items-center gap-2 max-w-4xl mx-auto">
                    <Button variant="ghost" size="icon" className="h-10 w-10 text-zinc-500 shrink-0">
                        <Paperclip className="h-5 w-5" />
                    </Button>
                    <div className="flex-1 relative">
                        <Input
                            placeholder="Type a message..."
                            value={input}
                            onChange={handleInputChange}
                            onKeyDown={handleKeyDown}
                            className="w-full h-11 bg-zinc-100 dark:bg-zinc-800 border-none rounded-2xl px-5 pr-12 text-sm focus-visible:ring-1 focus-visible:ring-primary/20 transition-all shadow-inner"
                            disabled={isSending}
                        />
                        <div className="absolute right-2 top-1/2 -translate-y-1/2">
                            <Button
                                size="icon"
                                className={cn(
                                    'h-8 w-8 rounded-xl transition-all scale-90',
                                    input.trim() ? 'bg-primary text-primary-foreground shadow-md hover:scale-100' : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-400 opacity-50 cursor-not-allowed',
                                )}
                                onClick={() => void handleSend()}
                                disabled={!input.trim() || isSending}
                            >
                                {isSending ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Send className="h-4 w-4 fill-current" />
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .scrollbar-hide::-webkit-scrollbar { display: none; }
                .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </div>
    );
}
