"use client";

import { useState, useEffect } from "react";
import { useChat } from "@/contexts/ChatContext";
import { useAuth } from "@/contexts/AuthContext";
import axios from "axios";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";
import { Loader2, Search, User } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { API_URL } from "@/config/environment";

export default function NewMessageModal({ open, onOpenChange }) {
  const { user } = useAuth();
  const { startConversation } = useChat();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(false);

  // Search for users when query changes
  useEffect(() => {
    const searchUsers = async () => {
      if (!searchQuery.trim() || searchQuery.length < 2) {
        setSearchResults([]);
        return;
      }

      try {
        setLoading(true);

        // Determine which endpoint to use based on user role
        const endpoint = user?.role === "doctor"
          ? `${API_URL}/doctors/patients/search`
          : `${API_URL}/patients/doctors/search`;

        const response = await axios.get(`${endpoint}?query=${searchQuery}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        });

        if (response.data.success) {
          setSearchResults(response.data.data);
        }
      } catch (error) {
        console.error("Error searching users:", error);
        setSearchResults([]);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(searchUsers, 500);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery, user?.role]);

  // Handle user selection
  const handleSelectUser = (user) => {
    setSelectedUser(user);
  };

  // Handle starting a conversation
  const handleStartConversation = async () => {
    if (!selectedUser) return;

    try {
      const conversation = await startConversation(selectedUser._id);

      if (conversation) {
        onOpenChange(false);
        setSearchQuery("");
        setSelectedUser(null);
      }
    } catch (error) {
      console.error("Error starting conversation:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New Message</DialogTitle>
          <DialogDescription>
            Search for a {user?.role === "doctor" ? "patient" : "doctor"} to start a conversation.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder={`Search for a ${user?.role === "doctor" ? "patient" : "doctor"}...`}
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
            </div>
          ) : searchResults.length > 0 ? (
            <ScrollArea className="h-[240px]">
              <div className="space-y-2">
                {searchResults.map((result) => (
                  <div
                    key={result._id}
                    className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                      selectedUser?._id === result._id
                        ? "bg-slate-100 dark:bg-slate-800"
                        : "hover:bg-slate-50 dark:hover:bg-slate-900"
                    }`}
                    onClick={() => handleSelectUser(result)}
                  >
                    <Avatar className="h-10 w-10 border border-slate-200 dark:border-slate-700">
                      {result.profileImage ? (
                        <img
                          src={result.profileImage}
                          alt={result.firstName}
                          onError={(e) => {
                            e.target.src = "/images/avatar-placeholder.png";
                          }}
                        />
                      ) : (
                        <User className="h-6 w-6 text-slate-400" />
                      )}
                    </Avatar>
                    <div>
                      <div className="font-medium">
                        {result.firstName} {result.lastName}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        {result.specialization || result.email}
                      </div>
                    </div>
                    {selectedUser?._id === result._id && (
                      <Badge className="ml-auto">Selected</Badge>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          ) : searchQuery.length >= 2 ? (
            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
              No users found
            </div>
          ) : null}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              setSearchQuery("");
              setSelectedUser(null);
              onOpenChange(false);
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleStartConversation}
            disabled={!selectedUser}
          >
            Start Conversation
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
