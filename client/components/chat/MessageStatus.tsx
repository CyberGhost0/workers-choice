'use client';

import { Check, CheckCheck, Clock } from 'lucide-react';

interface MessageStatusProps {
  status: 'sending' | 'sent' | 'delivered' | 'read';
  className?: string;
}

export function MessageStatus({ status, className = '' }: MessageStatusProps) {
  const getStatusDisplay = () => {
    switch (status) {
      case 'sending':
        return {
          icon: <Clock className="h-3 w-3" />,
          text: 'Sending...',
          color: 'text-muted-foreground',
        };
      case 'sent':
        return {
          icon: <Check className="h-3 w-3" />,
          text: 'Sent',
          color: 'text-muted-foreground',
        };
      case 'delivered':
        return {
          icon: <CheckCheck className="h-3 w-3" />,
          text: 'Delivered',
          color: 'text-muted-foreground',
        };
      case 'read':
        return {
          icon: <CheckCheck className="h-3 w-3" />,
          text: 'Read',
          color: 'text-primary',
        };
      default:
        return {
          icon: <Clock className="h-3 w-3" />,
          text: '',
          color: 'text-muted-foreground',
        };
    }
  };

  const { icon, text, color } = getStatusDisplay();

  return (
    <div className={`flex items-center gap-1 ${color} ${className}`}>
      {icon}
      {text && <span className="text-xs">{text}</span>}
    </div>
  );
}

interface TypingIndicatorProps {
  isTyping: boolean;
  userName: string;
}

export function TypingIndicator({ isTyping, userName }: TypingIndicatorProps) {
  if (!isTyping) return null;

  return (
    <div className="flex items-center gap-2 px-4 py-2">
      <div className="flex gap-1">
        <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
      <span className="text-xs text-muted-foreground">{userName} is typing...</span>
    </div>
  );
}

interface UnreadBadgeProps {
  count: number;
  className?: string;
}

export function UnreadBadge({ count, className = '' }: UnreadBadgeProps) {
  if (count === 0) return null;

  return (
    <span
      className={`inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-medium text-white bg-primary rounded-full ${className}`}
    >
      {count > 99 ? '99+' : count}
    </span>
  );
}

interface OnlineStatusProps {
  isOnline: boolean;
  showLabel?: boolean;
}

export function OnlineStatus({ isOnline, showLabel = false }: OnlineStatusProps) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={`w-2.5 h-2.5 rounded-full ${
          isOnline ? 'bg-green-500' : 'bg-muted-foreground/40'
        }`}
      />
      {showLabel && (
        <span className="text-xs text-muted-foreground">
          {isOnline ? 'Online' : 'Offline'}
        </span>
      )}
    </div>
  );
}

interface ConversationPreviewProps {
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  isOnline: boolean;
  isSentByMe: boolean;
}

export function ConversationPreview({
  lastMessage,
  lastMessageTime,
  unreadCount,
  isOnline,
  isSentByMe,
}: ConversationPreviewProps) {
  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <div className="w-2.5 h-2.5 rounded-full absolute -bottom-0.5 -right-0.5 border-2 border-card">
          <div
            className={`w-full h-full rounded-full ${
              isOnline ? 'bg-green-500' : 'bg-muted-foreground/40'
            }`}
          />
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1">
          {isSentByMe && (
            <span className="flex-shrink-0">
              {unreadCount > 0 ? (
                <Check className="h-3 w-3 text-muted-foreground" />
              ) : (
                <CheckCheck className="h-3 w-3 text-primary" />
              )}
            </span>
          )}
          <p className="text-sm text-muted-foreground truncate">{lastMessage}</p>
        </div>
      </div>
      <div className="flex items-center gap-1 flex-shrink-0">
        <span className="text-xs text-muted-foreground">{lastMessageTime}</span>
        {unreadCount > 0 && (
          <span className="w-5 h-5 bg-primary text-white text-xs rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </div>
    </div>
  );
}
