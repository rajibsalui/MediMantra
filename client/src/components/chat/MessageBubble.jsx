"use client";

import { useState } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Check, CheckCheck, Clock, MoreVertical } from "lucide-react";
import { format } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function MessageBubble({ message, isOwnMessage }) {
  const [showOptions, setShowOptions] = useState(false);
  
  // Format timestamp
  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    return format(new Date(timestamp), "h:mm a");
  };
  
  // Handle message options
  const handleCopyText = () => {
    navigator.clipboard.writeText(message.content);
  };
  
  // Determine message status icon
  const getStatusIcon = () => {
    if (!isOwnMessage) return null;
    
    if (message.isRead) {
      return <CheckCheck className="h-3.5 w-3.5 text-blue-500 dark:text-blue-400" />;
    } else {
      return <Check className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />;
    }
  };
  
  return (
    <div
      className={`flex items-end gap-2 group ${
        isOwnMessage ? "flex-row-reverse" : ""
      }`}
      onMouseEnter={() => setShowOptions(true)}
      onMouseLeave={() => setShowOptions(false)}
    >
      {!isOwnMessage && (
        <Avatar className="h-8 w-8 border border-slate-200 dark:border-slate-700">
          <img
            src={message.sender.profileImage || "/images/avatar-placeholder.png"}
            alt={message.sender.firstName}
            onError={(e) => {
              e.target.src = "/images/avatar-placeholder.png";
            }}
          />
        </Avatar>
      )}
      
      <div className="relative max-w-[75%]">
        <div
          className={`p-3 rounded-lg ${
            isOwnMessage
              ? "bg-blue-500 text-white dark:bg-blue-600"
              : "bg-slate-100 dark:bg-slate-800"
          }`}
        >
          {message.content}
          
          {/* Message attachments would go here */}
          
          <div
            className={`flex items-center text-xs mt-1 gap-1 ${
              isOwnMessage ? "text-blue-100" : "text-slate-500 dark:text-slate-400"
            }`}
          >
            <span>{formatTime(message.createdAt)}</span>
            {getStatusIcon()}
          </div>
        </div>
        
        {/* Message options */}
        {showOptions && (
          <div
            className={`absolute ${
              isOwnMessage ? "left-0" : "right-0"
            } -top-2 opacity-0 group-hover:opacity-100 transition-opacity`}
          >
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-1 rounded-full bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-slate-700">
                  <MoreVertical className="h-3 w-3" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align={isOwnMessage ? "start" : "end"}>
                <DropdownMenuItem onClick={handleCopyText}>
                  Copy text
                </DropdownMenuItem>
                <DropdownMenuItem>Forward</DropdownMenuItem>
                {isOwnMessage && (
                  <DropdownMenuItem className="text-red-500 dark:text-red-400">
                    Delete
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>
    </div>
  );
}
