'use client';

import { useState, useRef, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { useAuth } from '@/lib/hooks/useAuth';
import { WelcomeWindow } from '@/components/chat/WelcomeWindow';
import { MessageStatus, TypingIndicator, UnreadBadge, OnlineStatus, ConversationPreview } from '@/components/chat/MessageStatus';
import { formatDateTime, getInitials } from '@/lib/utils';
import {
  Send,
  Image as ImageIcon,
  Paperclip,
  Smile,
  Phone,
  Video,
  MoreVertical,
  Search,
  ArrowLeft,
  File,
  FileText,
  X,
  MessageSquare,
} from 'lucide-react';

interface Conversation {
  id: string;
  user: {
    id: string;
    name: string;
    avatar?: string;
    isOnline: boolean;
    role: string;
  };
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: string;
  status: 'sending' | 'sent' | 'delivered' | 'read';
  attachments?: { type: string; url: string; name: string }[];
}

// Mock data
const mockConversations: Conversation[] = [
  {
    id: '1',
    user: {
      id: 'u1',
      name: 'John Smith',
      isOnline: true,
      role: 'ARTISAN',
    },
    lastMessage: 'I can come tomorrow at 10 AM',
    lastMessageTime: '10:30 AM',
    unreadCount: 2,
  },
  {
    id: '2',
    user: {
      id: 'u2',
      name: 'SparkleClean Pro',
      isOnline: false,
      role: 'ARTISAN',
    },
    lastMessage: 'Your cleaning is scheduled for Friday',
    lastMessageTime: 'Yesterday',
    unreadCount: 0,
  },
  {
    id: '3',
    user: {
      id: 'u3',
      name: 'PowerTech Electric',
      isOnline: true,
      role: 'ARTISAN',
    },
    lastMessage: 'Thanks for choosing us!',
    lastMessageTime: 'Jan 12',
    unreadCount: 0,
  },
  {
    id: '4',
    user: {
      id: 'u4',
      name: 'Home Essentials Store',
      isOnline: false,
      role: 'SELLER',
    },
    lastMessage: 'Your order has been shipped',
    lastMessageTime: 'Jan 10',
    unreadCount: 1,
  },
];

const mockMessages: Message[] = [
  {
    id: 'm1',
    senderId: 'current',
    content: 'Hi, I need help with a leaky faucet in my kitchen.',
    timestamp: '2024-01-15T09:00:00Z',
    status: 'read',
  },
  {
    id: 'm2',
    senderId: 'u1',
    content: 'Hello! I can help with that. Can you send me a photo of the issue?',
    timestamp: '2024-01-15T09:05:00Z',
    status: 'read',
  },
  {
    id: 'm3',
    senderId: 'current',
    content: 'Sure, here it is.',
    timestamp: '2024-01-15T09:10:00Z',
    status: 'read',
    attachments: [{ type: 'image', url: '/placeholder-faucet.jpg', name: 'faucet.jpg' }],
  },
  {
    id: 'm4',
    senderId: 'u1',
    content: 'I see the issue. It looks like the washer needs replacement. I can come tomorrow at 10 AM. Does that work for you?',
    timestamp: '2024-01-15T10:30:00Z',
    status: 'delivered',
  },
];

export default function ChatPage() {
  const { user } = useAuth();
  const [showWelcome, setShowWelcome] = useState(true);
  const [conversations, setConversations] = useState<Conversation[]>(mockConversations);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return;

    const msg: Message = {
      id: `m${Date.now()}`,
      senderId: 'current',
      content: newMessage,
      timestamp: new Date().toISOString(),
      status: 'sending',
    };

    setMessages([...messages, msg]);
    setNewMessage('');

    // Simulate message status updates
    setTimeout(() => {
      setMessages((prev) =>
        prev.map((m) => (m.id === msg.id ? { ...m, status: 'sent' } : m))
      );
    }, 500);

    setTimeout(() => {
      setMessages((prev) =>
        prev.map((m) => (m.id === msg.id ? { ...m, status: 'delivered' } : m))
      );
    }, 1000);

    setTimeout(() => {
      setMessages((prev) =>
        prev.map((m) => (m.id === msg.id ? { ...m, status: 'read' } : m))
      );
    }, 2000);

    // Simulate typing indicator
    setTimeout(() => setIsTyping(true), 1500);
    setTimeout(() => setIsTyping(false), 3000);
  };

  const handleFileUpload = (files: FileList | null, type: 'image' | 'file') => {
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const attachment = {
        type: type === 'image' ? 'image' : 'file',
        url: URL.createObjectURL(file),
        name: file.name,
      };

      const msg: Message = {
        id: `m${Date.now()}`,
        senderId: 'current',
        content: type === 'image' ? '' : `Shared a file: ${file.name}`,
        timestamp: new Date().toISOString(),
        status: 'sending',
        attachments: [attachment],
      };

      setMessages((prev) => [...prev, msg]);
    });
  };

  const filteredConversations = conversations.filter((conv) =>
    conv.user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col bg-muted/50">
      <Header />

      <main className="flex-1 flex">
        {/* Conversations List */}
        <div
          className={`${
            selectedConversation ? 'hidden md:flex' : 'flex'
          } flex-col w-full md:w-80 lg:w-96 border-r bg-card`}
        >
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold mb-3">Messages</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {filteredConversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => setSelectedConversation(conv)}
                className={`p-4 border-b cursor-pointer hover:bg-muted/50 transition-colors ${
                  selectedConversation?.id === conv.id ? 'bg-primary/5' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-medium text-primary">
                        {getInitials(conv.user.name)}
                      </span>
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5">
                      <OnlineStatus isOnline={conv.user.isOnline} />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium truncate">{conv.user.name}</h4>
                      <span className="text-xs text-muted-foreground">
                        {conv.lastMessageTime}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground truncate">
                        {conv.lastMessage}
                      </p>
                      {conv.unreadCount > 0 && (
                        <UnreadBadge count={conv.unreadCount} />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div
          className={`${
            selectedConversation ? 'flex' : 'hidden md:flex'
          } flex-1 flex-col`}
        >
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b bg-card flex items-center gap-3">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="md:hidden"
                      onClick={() => setSelectedConversation(null)}
                    >
                      <ArrowLeft className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Back to conversations</TooltipContent>
                </Tooltip>
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-sm font-medium text-primary">
                      {getInitials(selectedConversation.user.name)}
                    </span>
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5">
                    <OnlineStatus isOnline={selectedConversation.user.isOnline} />
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="font-medium">{selectedConversation.user.name}</h4>
                  <p className="text-xs text-muted-foreground">
                    {selectedConversation.user.isOnline ? 'Online' : 'Offline'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Phone className="h-5 w-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Start voice call</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Video className="h-5 w-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Start video call</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-5 w-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>More options</TooltipContent>
                  </Tooltip>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${
                      msg.senderId === 'current' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-[70%] ${
                        msg.senderId === 'current'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      } rounded-2xl px-4 py-2`}
                    >
                      {msg.attachments?.map((att, idx) => (
                        <div key={idx} className="mb-2">
                          {att.type === 'image' ? (
                            <div className="w-48 h-32 bg-black/10 rounded-lg flex items-center justify-center">
                              <ImageIcon className="h-8 w-8 opacity-50" />
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 p-2 bg-black/10 rounded-lg">
                              <File className="h-8 w-8" />
                              <span className="text-sm">{att.name}</span>
                            </div>
                          )}
                        </div>
                      ))}
                      {msg.content && <p className="text-sm">{msg.content}</p>}
                      <div
                        className={`flex items-center gap-1 mt-1 ${
                          msg.senderId === 'current' ? 'justify-end' : ''
                        }`}
                      >
                        <span className="text-xs opacity-70">
                          {new Date(msg.timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                        {msg.senderId === 'current' && (
                          <MessageStatus status={msg.status} />
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                <TypingIndicator
                  isTyping={isTyping}
                  userName={selectedConversation.user.name}
                />

                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="p-4 border-t bg-card">
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={(e) => handleFileUpload(e.target.files, 'file')}
                  />
                  <input
                    type="file"
                    ref={imageInputRef}
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => handleFileUpload(e.target.files, 'image')}
                  />
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => imageInputRef.current?.click()}
                      >
                        <ImageIcon className="h-5 w-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Attach image</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Paperclip className="h-5 w-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Attach file</TooltipContent>
                  </Tooltip>
                  <input
                    type="text"
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') handleSendMessage();
                    }}
                    className="flex-1 px-4 py-2 rounded-full border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Smile className="h-5 w-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Add emoji</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="icon"
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim()}
                      >
                        <Send className="h-5 w-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Send message</TooltipContent>
                  </Tooltip>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageSquare className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Select a conversation</h3>
                <p className="text-muted-foreground">
                  Choose from your existing conversations or start a new one
                </p>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Welcome Window */}
      <WelcomeWindow isOpen={showWelcome} onClose={() => setShowWelcome(false)} />
    </div>
  );
}
