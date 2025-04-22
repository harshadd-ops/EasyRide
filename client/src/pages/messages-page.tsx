import { useState, useEffect, useRef } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { SearchHeader } from "@/components/layout/search-header";
import { MobileNav } from "@/components/layout/mobile-nav";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation, useParams } from "wouter";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import {
  Loader2,
  Send,
  Mail,
  MailOpen,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Conversation {
  userId: number;
  lastMessage: string;
  lastMessageDate: string;
  unreadCount: number;
  user?: {
    id: number;
    username: string;
    fullName: string;
    profileImage?: string;
  };
}

interface Message {
  id: number;
  senderId: number;
  receiverId: number;
  content: string;
  isRead: boolean;
  createdAt: string;
}

interface ConversationData {
  messages: Message[];
  user: {
    id: number;
    username: string;
    fullName: string;
    profileImage?: string;
  };
}

export default function MessagesPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeConversation, setActiveConversation] = useState<number | null>(null);
  const [location] = useLocation();
  const params = useParams();
  
  // Check if we were directed to a specific conversation
  useEffect(() => {
    if (location.startsWith('/messages/') && params && params.id) {
      const userId = parseInt(params.id);
      if (!isNaN(userId)) {
        setActiveConversation(userId);
      }
    }
  }, [location, params]);
  
  const { data: conversations, isLoading: isLoadingConversations } = useQuery<Conversation[]>({
    queryKey: ['/api/messages'],
    staleTime: 10000, // 10 seconds
  });
  
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 md:ml-64 pb-16 md:pb-0">
        <SearchHeader />
        
        <main className="container mx-auto px-4 py-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-dark-900">Messages</h1>
            <p className="text-gray-600">Chat with your ride companions</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 min-h-[70vh]">
            <Card className="md:col-span-1">
              <CardContent className="p-0">
                <div className="p-4 border-b">
                  <h3 className="font-medium">Conversations</h3>
                </div>
                <ScrollArea className="h-[60vh]">
                  {isLoadingConversations ? (
                    <div className="flex justify-center items-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : !conversations || conversations.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                      <Mail className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                      <p>No conversations yet</p>
                      <p className="text-sm">Start chatting by clicking on a user profile</p>
                    </div>
                  ) : (
                    <div className="divide-y">
                      {conversations.map((conversation) => (
                        <ConversationItem 
                          key={conversation.userId}
                          conversation={conversation}
                          isActive={activeConversation === conversation.userId}
                          onClick={() => setActiveConversation(conversation.userId)}
                        />
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
            
            <Card className="md:col-span-2">
              <CardContent className="p-0 h-full">
                {!activeConversation ? (
                  <div className="flex flex-col items-center justify-center h-[60vh] text-center p-4">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                      <Mail className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-medium mb-2">Your Messages</h3>
                    <p className="text-gray-500 max-w-sm">
                      Select a conversation from the list to view your messages, or start a new one by requesting a ride.
                    </p>
                  </div>
                ) : (
                  <ChatWindow conversationUserId={activeConversation} />
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
      
      <MobileNav />
    </div>
  );
}

function ConversationItem({ 
  conversation, 
  isActive, 
  onClick 
}: { 
  conversation: Conversation; 
  isActive: boolean; 
  onClick: () => void;
}) {
  const getInitials = (name: string) => {
    if (!name) return "U";
    const names = name.split(" ");
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  };
  
  const formatMessageDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 1) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays < 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };
  
  return (
    <div 
      className={`flex items-center p-4 cursor-pointer transition-colors ${
        isActive ? 'bg-primary/5 border-l-4 border-primary' : 'hover:bg-gray-50'
      }`}
      onClick={onClick}
    >
      <div className="relative">
        {conversation.user ? (
          <Avatar>
            <AvatarImage src={conversation.user.profileImage || ""} />
            <AvatarFallback>{getInitials(conversation.user.fullName)}</AvatarFallback>
          </Avatar>
        ) : (
          <Avatar>
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
        )}
        
        {conversation.unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-primary text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
            {conversation.unreadCount}
          </span>
        )}
      </div>
      
      <div className="ml-3 flex-1 overflow-hidden">
        <div className="flex justify-between items-center">
          <p className="font-medium truncate">
            {conversation.user ? conversation.user.fullName : "Unknown User"}
          </p>
          <span className="text-xs text-gray-500">
            {formatMessageDate(conversation.lastMessageDate)}
          </span>
        </div>
        <p className="text-sm text-gray-600 truncate">
          {conversation.lastMessage}
        </p>
      </div>
    </div>
  );
}

function ChatWindow({ conversationUserId }: { conversationUserId: number }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { data: conversationData, isLoading } = useQuery<ConversationData>({
    queryKey: [`/api/messages/${conversationUserId}`],
    staleTime: 10000, // 10 seconds
    refetchInterval: 15000, // Poll every 15 seconds
  });
  
  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      const res = await apiRequest("POST", "/api/messages", {
        receiverId: conversationUserId,
        content,
      });
      return await res.json();
    },
    onSuccess: () => {
      setMessage("");
      queryClient.invalidateQueries({ queryKey: [`/api/messages/${conversationUserId}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to send message",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      sendMessageMutation.mutate(message);
    }
  };
  
  const getInitials = (name: string) => {
    if (!name) return "U";
    const names = name.split(" ");
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  };
  
  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  const formatMessageDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });
  };
  
  // Scroll to bottom of messages when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [conversationData]);
  
  // Group messages by date
  const groupedMessages = conversationData?.messages.reduce<{ [date: string]: Message[] }>((groups, message) => {
    const date = new Date(message.createdAt).toLocaleDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {});
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!conversationData) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center p-4">
        <Mail className="h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-xl font-medium mb-2">No messages found</h3>
        <p className="text-gray-500">There was an error loading this conversation</p>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col h-[60vh]">
      <div className="p-4 border-b flex items-center">
        {conversationData.user && (
          <>
            <Avatar className="mr-3">
              <AvatarImage src={conversationData.user.profileImage || ""} />
              <AvatarFallback>{getInitials(conversationData.user.fullName)}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-medium">{conversationData.user.fullName}</h3>
              <p className="text-sm text-gray-500">{conversationData.user.username}</p>
            </div>
          </>
        )}
      </div>
      
      <ScrollArea className="flex-1 p-4">
        {groupedMessages && Object.entries(groupedMessages).map(([date, messages]) => (
          <div key={date} className="mb-4">
            <div className="flex justify-center mb-4">
              <Badge variant="outline" className="bg-white">
                {formatMessageDate(messages[0].createdAt)}
              </Badge>
            </div>
            
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`flex ${msg.senderId === user?.id ? 'justify-end' : 'justify-start'} mb-4`}
              >
                {msg.senderId !== user?.id && (
                  <Avatar className="mr-2 h-8 w-8">
                    <AvatarImage src={conversationData.user.profileImage || ""} />
                    <AvatarFallback>{getInitials(conversationData.user.fullName)}</AvatarFallback>
                  </Avatar>
                )}
                
                <div 
                  className={`max-w-xs px-4 py-2 rounded-lg ${
                    msg.senderId === user?.id 
                      ? 'bg-primary text-white rounded-tr-none' 
                      : 'bg-gray-200 text-gray-800 rounded-tl-none'
                  }`}
                >
                  <p>{msg.content}</p>
                  <p className={`text-xs ${msg.senderId === user?.id ? 'text-primary-100' : 'text-gray-500'} mt-1 text-right`}>
                    {formatMessageTime(msg.createdAt)}
                    {msg.senderId === user?.id && (
                      <span className="ml-1">
                        {msg.isRead ? (
                          <MailOpen className="inline h-3 w-3" />
                        ) : (
                          <Mail className="inline h-3 w-3" />
                        )}
                      </span>
                    )}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </ScrollArea>
      
      <div className="p-4 border-t">
        <form onSubmit={handleSendMessage} className="flex space-x-2">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1"
          />
          <Button 
            type="submit" 
            disabled={!message.trim() || sendMessageMutation.isPending}
          >
            {sendMessageMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
