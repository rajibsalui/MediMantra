"use client";

import { useState, useEffect, useRef } from "react";
import { useChat } from "@/contexts/ChatContext";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Send, Paperclip, MoreVertical, Phone, Video, ArrowLeft } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import ConversationList from "./ConversationList";
import MessageBubble from "./MessageBubble";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function ChatInterface() {
  const { user } = useAuth();
  const {
    socket,
    conversations,
    currentConversation,
    setCurrentConversation,
    messages,
    loading,
    fetchMessages,
    sendMessage,
    sendMessageHttp,
    sendTypingStatus,
    isUserOnline,
    isUserTyping
  } = useChat();
  
  const [messageInput, setMessageInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showConversations, setShowConversations] = useState(true);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  
  // Check if on mobile
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);
    
    return () => {
      window.removeEventListener("resize", checkIfMobile);
    };
  }, []);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  
  // Focus input when conversation changes
  useEffect(() => {
    if (currentConversation) {
      inputRef.current?.focus();
      
      // On mobile, hide conversation list when a conversation is selected
      if (isMobile) {
        setShowConversations(false);
      }
    }
  }, [currentConversation, isMobile]);
  
  // Handle conversation selection
  const handleSelectConversation = (conversation) => {
    setCurrentConversation(conversation);
    fetchMessages(conversation._id);
  };
  
  // Handle sending a message
  const handleSendMessage = async () => {
    if (!messageInput.trim() || !currentConversation) return;
    
    setIsSending(true);
    const receiverId = currentConversation.participant._id;
    
    // Try to send via socket first
    const sent = sendMessage(receiverId, messageInput.trim());
    
    // If socket fails, use HTTP fallback
    if (!sent) {
      await sendMessageHttp(receiverId, messageInput.trim());
    }

    // socket.emit('message:send', {
    //   receiverId: selectedChat._id,
    //   message
    // });
    
    setMessageInput("");
    setIsSending(false);
  };
  
  // Handle input keydown (send on Enter, but allow Shift+Enter for new line)
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  // Handle typing indicator
  const handleInputChange = (e) => {
    setMessageInput(e.target.value);
    
    if (currentConversation) {
      sendTypingStatus(currentConversation.participant._id, e.target.value.length > 0);
    }
  };
  
  // Back button for mobile view
  const handleBackToList = () => {
    setShowConversations(true);
  };
  
  return (
    <div className="flex h-[calc(100vh-12rem)] rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 overflow-hidden">
      {/* Conversation List - hidden on mobile when a conversation is selected */}
      {(showConversations || !isMobile) && (
        <div className={`${isMobile ? 'w-full' : 'w-1/3 border-r border-slate-200 dark:border-slate-800'}`}>
          <ConversationList 
            conversations={conversations}
            currentConversation={currentConversation}
            onSelectConversation={handleSelectConversation}
            isUserOnline={isUserOnline}
          />
        </div>
      )}
      
      {/* Chat Area - full width on mobile when a conversation is selected */}
      {(!showConversations || !isMobile) && (
        <div className={`${isMobile ? 'w-full' : 'w-2/3'} flex flex-col`}>
          {currentConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {isMobile && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={handleBackToList}
                      className="mr-1"
                    >
                      <ArrowLeft className="h-5 w-5" />
                    </Button>
                  )}
                  <Avatar className="h-10 w-10 border border-slate-200 dark:border-slate-700">
                    <img 
                      src={currentConversation.participant.profileImage || "/images/avatar-placeholder.png"} 
                      alt={currentConversation.participant.firstName}
                      onError={(e) => {
                        e.target.src = "/images/avatar-placeholder.png";
                      }}
                    />
                  </Avatar>
                  <div>
                    <div className="font-medium flex items-center gap-2">
                      {currentConversation.participant.firstName} {currentConversation.participant.lastName}
                      {isUserOnline(currentConversation.participant._id) && (
                        <Badge variant="success" className="h-2 w-2 rounded-full p-0" />
                      )}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {isUserTyping(currentConversation.participant._id) ? (
                        <span className="text-blue-500 dark:text-blue-400">Typing...</span>
                      ) : isUserOnline(currentConversation.participant._id) ? (
                        "Online"
                      ) : (
                        "Offline"
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon">
                    <Phone className="h-5 w-5" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Video className="h-5 w-5" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-5 w-5" />
                  </Button>
                </div>
              </div>
              
              {/* Messages Area */}
              <ScrollArea className="flex-1 p-4">
                {loading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] ${i % 2 === 0 ? 'bg-blue-100 dark:bg-blue-900' : 'bg-slate-100 dark:bg-slate-800'} rounded-lg p-3`}>
                          <Skeleton className="h-4 w-full mb-2" />
                          <Skeleton className="h-4 w-3/4" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-500 dark:text-slate-400">
                    <div className="text-center p-6">
                      <div className="mb-2 text-4xl">💬</div>
                      <h3 className="text-lg font-medium mb-1">No messages yet</h3>
                      <p className="text-sm">Send a message to start the conversation</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <MessageBubble
                        key={message._id}
                        message={message}
                        isOwnMessage={message.sender._id === user?.id}
                      />
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </ScrollArea>
              
              {/* Message Input */}
              <div className="p-4 border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-end gap-2">
                  <Button variant="ghost" size="icon" className="rounded-full h-10 w-10">
                    <Paperclip className="h-5 w-5" />
                  </Button>
                  <div className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
                    <Textarea
                      ref={inputRef}
                      value={messageInput}
                      onChange={handleInputChange}
                      onKeyDown={handleKeyDown}
                      placeholder="Type a message..."
                      className="min-h-[60px] max-h-[150px] border-0 focus-visible:ring-0 bg-transparent"
                    />
                  </div>
                  <Button
                    onClick={handleSendMessage}
                    disabled={!messageInput.trim() || isSending}
                    className="rounded-full h-10 w-10 p-2"
                  >
                    {isSending ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Send className="h-5 w-5" />
                    )}
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 dark:text-slate-400">
              <div className="text-center p-6">
                <div className="mb-4 text-6xl">💬</div>
                <h3 className="text-xl font-medium mb-2">Your Messages</h3>
                <p className="text-sm max-w-md">
                  Select a conversation from the list to start chatting or send a message to a new contact.
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
