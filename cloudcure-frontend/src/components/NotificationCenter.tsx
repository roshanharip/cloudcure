
import { Bell, CheckCheck, Inbox, Calendar, MessageSquare, AlertCircle, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { useNotifications } from '@/hooks/useNotifications';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/utils';

export function NotificationCenter() {
    const { notifications, unreadCount, markRead, markAllRead, clearNotifications } = useNotifications();

    const getIcon = (type: string) => {
        switch (type) {
            case 'appointment_created': return <Calendar className="h-4 w-4 text-blue-500" />;
            case 'appointment_started': return <AlertCircle className="h-4 w-4 text-green-500" />;
            case 'message_received': return <MessageSquare className="h-4 w-4 text-primary" />;
            default: return <Bell className="h-4 w-4 text-zinc-500" />;
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative group">
                    <Bell className="h-5 w-5 text-zinc-600 dark:text-zinc-400 group-hover:text-primary transition-colors" />
                    {unreadCount > 0 && (
                        <Badge
                            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500 hover:bg-red-600 border-2 border-white dark:border-zinc-950 animate-in zoom-in"
                        >
                            {unreadCount}
                        </Badge>
                    )}
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-80 sm:w-96 p-0 shadow-2xl border-zinc-200 dark:border-zinc-800">
                <DropdownMenuLabel className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="text-base font-bold">Notifications</span>
                        {unreadCount > 0 && (
                            <Badge variant="secondary" className="bg-primary/10 text-primary border-none">
                                {unreadCount} new
                            </Badge>
                        )}
                    </div>
                    <div className="flex gap-1">
                        {notifications.length > 0 && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-zinc-500 hover:text-red-500"
                                onClick={clearNotifications}
                                title="Clear all"
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        )}
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 text-xs text-primary hover:bg-primary/5"
                            onClick={markAllRead}
                        >
                            <CheckCheck className="h-3.5 w-3.5 mr-1" />
                            Mark all read
                        </Button>
                    </div>
                </DropdownMenuLabel>

                <DropdownMenuSeparator />

                <div className="max-h-[400px] overflow-y-auto overflow-x-hidden">
                    {notifications.length === 0 ? (
                        <div className="py-12 flex flex-col items-center justify-center text-zinc-500">
                            <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-3">
                                <Inbox className="h-6 w-6 text-zinc-400" />
                            </div>
                            <p className="text-sm font-medium">Your inbox is empty</p>
                            <p className="text-xs text-zinc-400">We'll notify you when something happens</p>
                        </div>
                    ) : (
                        <div className="grid divide-y divide-zinc-100 dark:divide-zinc-800">
                            {notifications.map((notif) => (
                                <div
                                    key={notif.id}
                                    className={cn(
                                        "flex gap-4 p-4 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50 cursor-pointer group relative",
                                        !notif.isRead && "bg-primary/5 dark:bg-primary/5"
                                    )}
                                    onClick={() => {
                                        markRead(notif.id);
                                        if (notif.link) window.location.href = notif.link;
                                    }}
                                >
                                    <div className={cn(
                                        "w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-sm border",
                                        !notif.isRead ? "bg-white dark:bg-zinc-900 border-primary/20" : "bg-zinc-50 dark:bg-zinc-800/50 border-zinc-100 dark:border-zinc-700"
                                    )}>
                                        {getIcon(notif.type)}
                                    </div>

                                    <div className="flex-1 min-w-0 space-y-1">
                                        <div className="flex items-center justify-between gap-2">
                                            <p className={cn(
                                                "text-sm font-semibold truncate",
                                                !notif.isRead ? "text-zinc-900 dark:text-zinc-100" : "text-zinc-600 dark:text-zinc-400"
                                            )}>
                                                {notif.title}
                                            </p>
                                            <span className="text-[10px] text-zinc-400 shrink-0">
                                                {format(new Date(notif.timestamp), 'HH:mm')}
                                            </span>
                                        </div>
                                        <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                                            {notif.message}
                                        </p>
                                    </div>

                                    {!notif.isRead && (
                                        <div className="absolute right-2 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-primary" />
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <DropdownMenuSeparator />

                <div className="p-2">
                    <Button variant="ghost" className="w-full text-xs text-zinc-500 hover:text-primary">
                        View all activity
                    </Button>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
