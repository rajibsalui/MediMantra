"use client";

import { useEffect, useState } from 'react';
import { useVideoCall } from '@/contexts/VideoCallContext';
import { useAuth } from '@/contexts/AuthContext';
import { Phone, PhoneOff, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'react-hot-toast';
import callEvents from '@/lib/callEvents';

export default function DoctorCallNotification() {
  const { user } = useAuth();
  const { incomingCall, answerCall, rejectCall } = useVideoCall();
  const [localIncomingCall, setLocalIncomingCall] = useState(null);
  const [visible, setVisible] = useState(false);
  
  // Only show for doctors
  if (!user || user.role !== 'doctor') {
    return null;
  }
  
  // Listen for global incoming call events
  useEffect(() => {
    const handleIncomingCall = (callData) => {
      console.log('DoctorCallNotification - Received global incoming call event:', callData);
      setLocalIncomingCall(callData);
      setVisible(true);
      
      // Show a persistent toast notification
      toast.success(
        `Incoming ${callData.callType} call from ${callData.callerName}`,
        {
          duration: 30000,
          position: 'top-center',
          style: {
            border: '1px solid #3b82f6',
            padding: '16px',
            color: '#3b82f6',
          },
          icon: callData.callType === 'video' ? '🎥' : '📞',
        }
      );
      
      // Play notification sound
      try {
        const audio = new Audio('/sounds/ringtone.mp3');
        audio.volume = 1.0;
        audio.loop = true;
        audio.play();
        
        // Stop after 30 seconds
        setTimeout(() => {
          audio.pause();
          audio.currentTime = 0;
        }, 30000);
      } catch (err) {
        console.error('Error playing notification sound:', err);
      }
      
      // Show browser notification
      if ('Notification' in window && Notification.permission === 'granted') {
        try {
          const notification = new Notification('Doctor: Incoming Call', {
            body: `${callData.callerName} is calling you (${callData.callType})`,
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
    };
    
    const unsubscribe = callEvents.on('incomingCall', handleIncomingCall);
    
    return unsubscribe;
  }, []);
  
  // Handle incoming call from context
  useEffect(() => {
    if (incomingCall) {
      console.log('DoctorCallNotification - Incoming call from context:', incomingCall);
      setLocalIncomingCall(incomingCall);
      setVisible(true);
    }
  }, [incomingCall]);
  
  if (!visible || (!incomingCall && !localIncomingCall)) return null;
  
  // Use either the context incomingCall or our local copy
  const callData = incomingCall || localIncomingCall;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
      <div className="bg-white dark:bg-slate-800 rounded-lg p-6 max-w-md w-full shadow-2xl">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-blue-100 text-blue-600 text-2xl font-bold mb-4">
            {callData.callerName.charAt(0)}
          </div>
          <h2 className="text-2xl font-bold">Incoming {callData.callType} Call</h2>
          <p className="text-gray-600 dark:text-gray-300 mt-2">{callData.callerName} is calling you</p>
        </div>
        
        <div className="flex justify-center items-center mb-6">
          {callData.callType === 'video' ? (
            <Video className="h-8 w-8 text-blue-600 mr-2" />
          ) : (
            <Phone className="h-8 w-8 text-blue-600 mr-2" />
          )}
          <span className="text-lg">{callData.callType} call</span>
        </div>
        
        <div className="flex space-x-4">
          <Button 
            className="w-1/2 bg-red-600 hover:bg-red-700 text-white"
            onClick={() => {
              rejectCall();
              setVisible(false);
            }}
          >
            <PhoneOff className="h-5 w-5 mr-2" />
            Decline
          </Button>
          <Button 
            className="w-1/2 bg-green-600 hover:bg-green-700 text-white"
            onClick={() => {
              answerCall();
              setVisible(false);
            }}
          >
            <Phone className="h-5 w-5 mr-2" />
            Answer
          </Button>
        </div>
      </div>
    </div>
  );
}
