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
import { Loader2, Search, User, CheckCircle, AlertCircle, Clock } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { API_URL } from "@/config/environment";

export default function RequestChatModal({ open, onOpenChange }) {
  const { user } = useAuth();
  const { requestConversation, requestStatus } = useChat();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [loading, setLoading] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const [requestedDoctorIds, setRequestedDoctorIds] = useState({});

  // Search for doctors when query changes
  useEffect(() => {
    const searchDoctors = async () => {
      if (!searchQuery.trim() || searchQuery.length < 2) {
        setSearchResults([]);
        return;
      }

      try {
        setLoading(true);

        const response = await axios.get(`${API_URL}/patients/doctors/search?query=${searchQuery}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        });

        if (response.data.success) {
          setSearchResults(response.data.data);
        }
      } catch (error) {
        console.error("Error searching doctors:", error);
        setSearchResults([]);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(searchDoctors, 500);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  // Handle doctor selection
  const handleSelectDoctor = (doctor) => {
    setSelectedDoctor(doctor);
  };

  // Handle requesting a chat
  const handleRequestChat = async () => {
    if (!selectedDoctor) return;

    try {
      setRequesting(true);
      const success = await requestConversation(selectedDoctor._id);

      if (success) {
        // Add to requested doctors
        setRequestedDoctorIds(prev => ({
          ...prev,
          [selectedDoctor._id]: true
        }));

        // Clear selection
        setSelectedDoctor(null);
      }
    } catch (error) {
      console.error("Error requesting chat:", error);
    } finally {
      setRequesting(false);
    }
  };

  // Get request status badge
  const getStatusBadge = (doctorId) => {
    // Check if we have a status for this doctor
    const conversationId = Object.keys(requestStatus).find(
      id => searchResults.find(
        doc => doc._id === doctorId && requestStatus[id]
      )
    );

    if (!conversationId) return null;

    const status = requestStatus[conversationId];

    if (status === 'pending') {
      return (
        <Badge variant="outline" className="flex items-center gap-1 bg-yellow-50 text-yellow-700 border-yellow-200">
          <Clock className="h-3 w-3" />
          Pending
        </Badge>
      );
    } else if (status === 'accepted') {
      return (
        <Badge variant="outline" className="flex items-center gap-1 bg-green-50 text-green-700 border-green-200">
          <CheckCircle className="h-3 w-3" />
          Accepted
        </Badge>
      );
    } else if (status === 'rejected') {
      return (
        <Badge variant="outline" className="flex items-center gap-1 bg-red-50 text-red-700 border-red-200">
          <AlertCircle className="h-3 w-3" />
          Rejected
        </Badge>
      );
    }

    return null;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Request Chat with Doctor</DialogTitle>
          <DialogDescription>
            Search for a doctor to request a chat session
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search for a doctor by name or specialty..."
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
                {searchResults.map((doctor) => (
                  <div
                    key={doctor._id}
                    className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
                      selectedDoctor?._id === doctor._id
                        ? "bg-slate-100 dark:bg-slate-800"
                        : "hover:bg-slate-50 dark:hover:bg-slate-900"
                    }`}
                    onClick={() => handleSelectDoctor(doctor)}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 border border-slate-200 dark:border-slate-700">
                        {doctor.profileImage ? (
                          <img
                            src={doctor.profileImage}
                            alt={doctor.firstName}
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
                          {doctor.firstName} {doctor.lastName}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          {doctor.specialization || "General Physician"}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(doctor._id)}
                      {selectedDoctor?._id === doctor._id && (
                        <Badge>Selected</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          ) : searchQuery.length >= 2 ? (
            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
              No doctors found
            </div>
          ) : null}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              setSearchQuery("");
              setSelectedDoctor(null);
              onOpenChange(false);
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleRequestChat}
            disabled={!selectedDoctor || requesting || requestedDoctorIds[selectedDoctor?._id]}
          >
            {requesting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Requesting...
              </>
            ) : requestedDoctorIds[selectedDoctor?._id] ? (
              "Already Requested"
            ) : (
              "Request Chat"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
