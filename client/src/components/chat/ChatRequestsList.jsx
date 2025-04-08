"use client";

import { useState, useEffect } from "react";
import { useChat } from "@/contexts/ChatContext";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Check, X, Bell, User } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

export default function ChatRequestsList() {
  const { user } = useAuth();
  const { 
    pendingRequests, 
    respondToRequest, 
    fetchPendingRequests,
    loading 
  } = useChat();
  
  const [processingIds, setProcessingIds] = useState({});
  
  // Fetch pending requests on mount
  useEffect(() => {
    if (user?.role === 'doctor') {
      fetchPendingRequests();
    }
  }, [user, fetchPendingRequests]);
  
  // Handle accepting a request
  const handleAccept = async (conversationId) => {
    setProcessingIds(prev => ({ ...prev, [conversationId]: true }));
    await respondToRequest(conversationId, 'accepted');
    setProcessingIds(prev => ({ ...prev, [conversationId]: false }));
  };
  
  // Handle rejecting a request
  const handleReject = async (conversationId) => {
    setProcessingIds(prev => ({ ...prev, [conversationId]: true }));
    await respondToRequest(conversationId, 'rejected');
    setProcessingIds(prev => ({ ...prev, [conversationId]: false }));
  };
  
  // Format timestamp
  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
  };
  
  // If not a doctor, don't show anything
  if (user?.role !== 'doctor') {
    return null;
  }
  
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Chat Requests</CardTitle>
            <CardDescription>Patients waiting for your response</CardDescription>
          </div>
          <Badge variant="outline" className="flex items-center gap-1">
            <Bell className="h-3 w-3" />
            {pendingRequests.length}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="flex items-center gap-3 p-2">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-3 w-40" />
                </div>
                <div className="flex gap-2">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <Skeleton className="h-8 w-8 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        ) : pendingRequests.length === 0 ? (
          <div className="text-center py-6 text-slate-500 dark:text-slate-400">
            <div className="mb-2 text-4xl">🔔</div>
            <p>No pending chat requests</p>
          </div>
        ) : (
          <ScrollArea className="h-[300px]">
            <div className="space-y-3">
              {pendingRequests.map((request) => (
                <div 
                  key={request.conversationId} 
                  className="flex items-center justify-between p-3 border border-slate-200 dark:border-slate-800 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border border-slate-200 dark:border-slate-700">
                      {request.patient.profileImage ? (
                        <img
                          src={request.patient.profileImage}
                          alt={request.patient.firstName}
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
                        {request.patient.firstName} {request.patient.lastName}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        {formatTime(request.timestamp)}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-full h-8 w-8 p-0"
                      onClick={() => handleReject(request.conversationId)}
                      disabled={processingIds[request.conversationId]}
                    >
                      <X className="h-4 w-4 text-red-500" />
                    </Button>
                    <Button
                      size="sm"
                      className="rounded-full h-8 w-8 p-0"
                      onClick={() => handleAccept(request.conversationId)}
                      disabled={processingIds[request.conversationId]}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
