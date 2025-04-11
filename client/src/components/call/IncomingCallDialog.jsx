"use client";

import { useEffect, useState } from 'react';
import { useVideoCall } from '@/contexts/VideoCallContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Phone, PhoneOff, Video } from "lucide-react";
import callEvents from '@/lib/callEvents';

export default function IncomingCallDialog() {
  const { incomingCall, answerCall, rejectCall } = useVideoCall();
  const [localIncomingCall, setLocalIncomingCall] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Listen for global incoming call events
  useEffect(() => {
    const handleIncomingCall = (callData) => {
      console.log('IncomingCallDialog - Received global incoming call event:', callData);
      setLocalIncomingCall(callData);
      setDialogOpen(true);

      // Force dialog to be visible
      document.body.classList.add('has-incoming-call');

      // Play a sound to alert the user
      try {
        const audio = new Audio('/sounds/ringtone.mp3');
        audio.volume = 1.0;
        audio.play();
      } catch (err) {
        console.error('Error playing notification sound:', err);
      }
    };

    const unsubscribe = callEvents.on('incomingCall', handleIncomingCall);

    // Also listen for the native browser notification API
    if ('Notification' in window && Notification.permission === 'granted') {
      console.log('Browser notifications are supported and permitted');
    } else if ('Notification' in window && Notification.permission !== 'denied') {
      Notification.requestPermission().then(permission => {
        console.log('Notification permission:', permission);
      });
    }

    return () => {
      unsubscribe();
      document.body.classList.remove('has-incoming-call');
    };
  }, []);

  // Debug incoming call state and show browser notification
  useEffect(() => {
    console.log('IncomingCallDialog - incomingCall state:', incomingCall);
    if (incomingCall) {
      setLocalIncomingCall(incomingCall);
      setDialogOpen(true);

      // Force dialog to be visible
      document.body.classList.add('has-incoming-call');

      // Show browser notification if supported
      if ('Notification' in window && Notification.permission === 'granted') {
        try {
          const notification = new Notification('Incoming Call', {
            body: `${incomingCall.callerName} is calling you (${incomingCall.callType})`,
            icon: '/favicon.ico',
            requireInteraction: true
          });

          notification.onclick = () => {
            window.focus();
            notification.close();
          };
        } catch (err) {
          console.error('Error showing browser notification:', err);
        }
      }
    }

    return () => {
      if (incomingCall) {
        document.body.classList.remove('has-incoming-call');
      }
    };
  }, [incomingCall]);

  // Play ringtone when there's an incoming call
  useEffect(() => {
    if (dialogOpen && (incomingCall || localIncomingCall)) {
      console.log('IncomingCallDialog - Playing ringtone for incoming call');
      const ringtone = new Audio('/sounds/ringtone.mp3');
      ringtone.loop = true;
      ringtone.play().catch(err => console.error('Error playing ringtone:', err));

      return () => {
        console.log('IncomingCallDialog - Cleaning up ringtone');
        ringtone.pause();
        ringtone.currentTime = 0;
      };
    }
  }, [dialogOpen, incomingCall, localIncomingCall]);

  // Handle dialog close
  const handleDialogClose = (open) => {
    console.log('Dialog open state changed to:', open);
    setDialogOpen(open);
    if (!open) {
      rejectCall();
    }
  };

  // If no incoming call and dialog not open, don't render anything
  if (!dialogOpen && !incomingCall && !localIncomingCall) {
    console.log('IncomingCallDialog - No incoming call, not rendering dialog');
    return null;
  }

  // Use either the context incomingCall or our local copy
  const callData = incomingCall || localIncomingCall;

  console.log('IncomingCallDialog - Rendering dialog for incoming call:', callData);

  return (
    <Dialog
      open={dialogOpen}
      onOpenChange={handleDialogClose}
    >
      <DialogContent className="sm:max-w-md z-50">
        {/* Force dialog to be on top of everything */}
        <DialogHeader>
          <DialogTitle className="text-center">Incoming {callData.callType} Call</DialogTitle>
          <DialogDescription className="text-center">
            {callData.callerName} is calling you
          </DialogDescription>
        </DialogHeader>

        <div className="flex justify-center py-6">
          <Avatar className="h-24 w-24">
            <div className="bg-blue-100 h-full w-full flex items-center justify-center text-2xl font-semibold text-blue-600">
              {callData.callerName.charAt(0)}
            </div>
          </Avatar>
        </div>

        <div className="flex justify-center items-center">
          {callData.callType === 'video' ? (
            <Video className="h-6 w-6 mr-2 text-blue-600" />
          ) : (
            <Phone className="h-6 w-6 mr-2 text-blue-600" />
          )}
          <span className="text-lg">{callData.callType} call</span>
        </div>

        <DialogFooter className="flex justify-center space-x-4 sm:space-x-4">
          <Button
            variant="outline"
            className="bg-red-100 hover:bg-red-200 text-red-600 border-red-200"
            onClick={() => rejectCall()}
          >
            <PhoneOff className="h-5 w-5 mr-2" />
            Decline
          </Button>
          <Button
            className="bg-green-600 hover:bg-green-700"
            onClick={answerCall}
          >
            <Phone className="h-5 w-5 mr-2" />
            Answer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
