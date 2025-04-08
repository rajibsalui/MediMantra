"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Check, CheckCheck } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import NewMessageModal from "./NewMessageModal";
import RequestChatModal from "./RequestChatModal";

export default function ConversationList({
  conversations = [],
  currentConversation,
  onSelectConversation,
  isUserOnline,
  loading = false
}) {
  const { user } = useAuth();
  const [newMessageModalOpen, setNewMessageModalOpen] = useState(false);
  const [requestChatModalOpen, setRequestChatModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Filter conversations based on search query
  const filteredConversations = conversations.filter(conversation => {
    const participant = conversation.participant;
    const fullName = `${participant.firstName} ${participant.lastName}`.toLowerCase();
    return fullName.includes(searchQuery.toLowerCase());
  });

  // Format timestamp to relative time
  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
  };

  // Truncate message content
  const truncateMessage = (content, maxLength = 30) => {
    if (!content) return "";
    return content.length > maxLength
      ? `${content.substring(0, maxLength)}...`
      : content;
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800">
        <h2 className="text-lg font-semibold mb-3">Messages</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search conversations..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Conversation List */}
      <ScrollArea className="flex-1">
        {loading ? (
          <div className="p-4 space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-3 p-2">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-3 w-40" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="p-8 text-center text-slate-500 dark:text-slate-400">
            <p>No conversations found</p>
          </div>
        ) : (
          <div className="p-2">
            {filteredConversations.map((conversation) => (
              <div
                key={conversation._id}
                className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                  currentConversation?._id === conversation._id
                    ? "bg-slate-100 dark:bg-slate-800"
                    : "hover:bg-slate-50 dark:hover:bg-slate-900"
                }`}
                onClick={() => onSelectConversation(conversation)}
              >
                <div className="relative">
                  <Avatar className="h-12 w-12 border border-slate-200 dark:border-slate-700">
                    <img
                      src={conversation.participant.profileImage || "/images/avatar-placeholder.png"}
                      alt={conversation.participant.firstName}
                      onError={(e) => {
                        e.target.src = "/images/avatar-placeholder.png";
                      }}
                    />
                  </Avatar>
                  {isUserOnline(conversation.participant._id) && (
                    <Badge
                      variant="success"
                      className="absolute bottom-0 right-0 h-3 w-3 rounded-full p-0 border-2 border-white dark:border-slate-950"
                    />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <h3 className="font-medium truncate">
                      {conversation.participant.firstName} {conversation.participant.lastName}
                    </h3>
                    <span className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap ml-2">
                      {formatTime(conversation.updatedAt)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
                      {conversation.lastMessage ? (
                        truncateMessage(conversation.lastMessage.content)
                      ) : (
                        "No messages yet"
                      )}
                    </p>
                    {conversation.unreadCount > 0 ? (
                      <Badge className="ml-2 bg-blue-500 hover:bg-blue-600">
                        {conversation.unreadCount}
                      </Badge>
                    ) : conversation.lastMessage?.sender?._id !== conversation.participant._id ? (
                      <span className="ml-2 text-slate-400 dark:text-slate-500">
                        {conversation.lastMessage?.isRead ? (
                          <CheckCheck className="h-4 w-4" />
                        ) : (
                          <Check className="h-4 w-4" />
                        )}
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      {/* New Conversation Button */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800">
        <Button
          className="w-full"
          variant="outline"
          onClick={() => {
            if (user?.role === 'doctor') {
              setNewMessageModalOpen(true);
            } else if (user?.role === 'patient') {
              setRequestChatModalOpen(true);
            }
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          {user?.role === 'patient' ? 'Request Chat with Doctor' : 'New Conversation'}
        </Button>
      </div>

      {/* New Message Modal (for doctors) */}
      {user?.role === 'doctor' && (
        <NewMessageModal
          open={newMessageModalOpen}
          onOpenChange={setNewMessageModalOpen}
        />
      )}

      {/* Request Chat Modal (for patients) */}
      {user?.role === 'patient' && (
        <RequestChatModal
          open={requestChatModalOpen}
          onOpenChange={setRequestChatModalOpen}
        />
      )}
    </div>
  );
}
