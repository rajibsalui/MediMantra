"use client";

import { useEffect, useState } from 'react';
import { useVideoCall } from '@/contexts/VideoCallContext';
import { Phone, PhoneOff, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'react-hot-toast';
import callEvents from '@/lib/callEvents';

export default function CallNotification() {
  const { incomingCall, answerCall, rejectCall } = useVideoCall();
  const [visible, setVisible] = useState(false);
  const [localIncomingCall, setLocalIncomingCall] = useState(null);

  // Listen for global incoming call events
  useEffect(() => {
    const unsubscribe = callEvents.on('incomingCall', (callData) => {
      console.log('CallNotification - Received global incoming call event:', callData);
      setLocalIncomingCall(callData);
      setVisible(true);
    });

    return unsubscribe;
  }, []);

  // Show notification when there's an incoming call
  useEffect(() => {
    if (incomingCall) {
      console.log('CallNotification - Showing notification for incoming call');
      setLocalIncomingCall(incomingCall);
      setVisible(true);

      // Create a toast notification as well
      toast.custom(
        (t) => (
          <div
            className={`${
              t.visible ? 'animate-enter' : 'animate-leave'
            } max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
          >
            <div className="flex-1 w-0 p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 pt-0.5">
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                    {incomingCall.callType === 'video' ? (
                      <Video className="h-5 w-5 text-blue-600" />
                    ) : (
                      <Phone className="h-5 w-5 text-blue-600" />
                    )}
                  </div>
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    Incoming {incomingCall.callType} call
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    {incomingCall.callerName} is calling you
                  </p>
                </div>
              </div>
            </div>
            <div className="flex border-l border-gray-200">
              <button
                onClick={() => {
                  toast.dismiss(t.id);
                  answerCall();
                }}
                className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-green-600 hover:text-green-500 focus:outline-none"
              >
                Answer
              </button>
            </div>
          </div>
        ),
        { duration: 30000 }
      );
    } else {
      setVisible(false);
    }
  }, [incomingCall, answerCall]);

  if (!visible || (!incomingCall && !localIncomingCall)) return null;

  // Use either the context incomingCall or our local copy
  const callData = incomingCall || localIncomingCall;

  return (
    <div className="fixed top-4 right-4 z-50 bg-white dark:bg-slate-800 shadow-lg rounded-lg p-4 w-80 border border-gray-200 dark:border-slate-700">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold">
          Incoming {callData.callType} Call
        </h3>
        {callData.callType === 'video' ? (
          <Video className="h-5 w-5 text-blue-600" />
        ) : (
          <Phone className="h-5 w-5 text-blue-600" />
        )}
      </div>

      <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
        {callData.callerName} is calling you
      </p>

      <div className="flex justify-between space-x-2">
        <Button
          variant="outline"
          className="w-1/2 bg-red-100 hover:bg-red-200 text-red-600 border-red-200"
          onClick={() => rejectCall()}
        >
          <PhoneOff className="h-4 w-4 mr-2" />
          Decline
        </Button>
        <Button
          className="w-1/2 bg-green-600 hover:bg-green-700"
          onClick={answerCall}
        >
          <Phone className="h-4 w-4 mr-2" />
          Answer
        </Button>
      </div>
    </div>
  );
}
