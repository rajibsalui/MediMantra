"use client";

import { useState, useEffect } from 'react';
import { useVideoCall } from '@/contexts/VideoCallContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { Loader2, Mic, MicOff, Video, VideoOff, PhoneOff, Minimize, Maximize, Phone } from 'lucide-react';
import { formatDuration } from '@/lib/utils';

export default function VideoCallUI({ appointmentId, patientId, doctorId, isMinimizable = true }) {
  const { user } = useAuth();
  const {
    callStatus,
    incomingCall,
    isAudioEnabled,
    isVideoEnabled,
    callType,
    callDuration,
    isMinimized,
    localVideoRef,
    remoteVideoRef,
    makeCall,
    answerCall,
    rejectCall,
    endCall,
    toggleAudio,
    toggleVideo,
    toggleMinimize
  } = useVideoCall();
  
  const [callingUser, setCallingUser] = useState(null);
  const [callInitiated, setCallInitiated] = useState(false);

  // Format call duration
  const formattedDuration = formatDuration(callDuration);

  // Determine if the current user is the doctor or patient
  const isDoctor = user?.role === 'doctor';
  const callPartnerId = isDoctor ? patientId : doctorId;

  // Initialize call when component mounts
  useEffect(() => {
    if (appointmentId && callPartnerId && !callInitiated && callStatus === 'idle') {
      // Fetch user details for the call partner
      const fetchUserDetails = async () => {
        try {
          // This would be replaced with an actual API call to get user details
          const partnerDetails = {
            id: callPartnerId,
            name: 'Call Partner', // This would be replaced with actual name
          };
          
          setCallingUser(partnerDetails);
        } catch (error) {
          console.error('Error fetching user details:', error);
        }
      };
      
      fetchUserDetails();
    }
  }, [appointmentId, callPartnerId, callInitiated, callStatus]);

  // Handle initiating a call
  const handleInitiateCall = async (type = 'video') => {
    if (callingUser && !callInitiated) {
      const success = await makeCall(callingUser.id, callingUser.name, type);
      if (success) {
        setCallInitiated(true);
      }
    }
  };

  // Render different UI based on call status
  const renderCallUI = () => {
    switch (callStatus) {
      case 'idle':
        return (
          <div className="flex flex-col items-center justify-center p-6 space-y-4">
            <h2 className="text-xl font-semibold">Start a call</h2>
            <div className="flex space-x-4">
              <Button 
                onClick={() => handleInitiateCall('video')}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Video className="h-5 w-5 mr-2" />
                Video Call
              </Button>
              <Button 
                onClick={() => handleInitiateCall('audio')}
                variant="outline"
              >
                <Phone className="h-5 w-5 mr-2" />
                Voice Call
              </Button>
            </div>
          </div>
        );
        
      case 'calling':
        return (
          <div className="flex flex-col items-center justify-center p-6 space-y-4">
            <Avatar className="h-24 w-24">
              <div className="bg-blue-100 h-full w-full flex items-center justify-center text-2xl font-semibold text-blue-600">
                {callingUser?.name?.charAt(0) || '?'}
              </div>
            </Avatar>
            <h2 className="text-xl font-semibold">Calling {callingUser?.name}...</h2>
            <div className="flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600 mr-2" />
              <span>Waiting for answer</span>
            </div>
            <Button 
              onClick={endCall}
              className="bg-red-600 hover:bg-red-700 mt-4"
            >
              <PhoneOff className="h-5 w-5 mr-2" />
              Cancel
            </Button>
          </div>
        );
        
      case 'connected':
        return (
          <div className={`flex flex-col ${isMinimized ? 'h-auto' : 'h-full'}`}>
            {/* Video container */}
            <div className={`relative ${isMinimized ? 'h-24' : 'flex-grow'} bg-black rounded-t-lg overflow-hidden`}>
              {/* Remote video (full size) */}
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className={`w-full h-full object-cover ${!isVideoEnabled && callType === 'video' ? 'opacity-0' : ''}`}
              />
              
              {/* Local video (picture-in-picture) */}
              <div className={`absolute bottom-4 right-4 ${isMinimized ? 'w-16 h-16' : 'w-32 h-32'} rounded-lg overflow-hidden border-2 border-white shadow-lg`}>
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Call duration */}
              <div className="absolute top-4 left-4 bg-black/50 text-white px-2 py-1 rounded-md text-sm">
                {formattedDuration}
              </div>
            </div>
            
            {/* Call controls */}
            <div className="bg-white dark:bg-slate-900 p-4 rounded-b-lg flex items-center justify-between">
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={toggleAudio}
                  className={!isAudioEnabled ? 'bg-red-100 text-red-600 border-red-200' : ''}
                >
                  {isAudioEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
                </Button>
                
                {callType === 'video' && (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={toggleVideo}
                    className={!isVideoEnabled ? 'bg-red-100 text-red-600 border-red-200' : ''}
                  >
                    {isVideoEnabled ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
                  </Button>
                )}
              </div>
              
              <Button
                className="bg-red-600 hover:bg-red-700"
                onClick={endCall}
              >
                <PhoneOff className="h-5 w-5 mr-2" />
                End Call
              </Button>
              
              {isMinimizable && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={toggleMinimize}
                >
                  {isMinimized ? <Maximize className="h-5 w-5" /> : <Minimize className="h-5 w-5" />}
                </Button>
              )}
            </div>
          </div>
        );
        
      case 'ended':
        return (
          <div className="flex flex-col items-center justify-center p-6 space-y-4">
            <h2 className="text-xl font-semibold">Call Ended</h2>
            <p>Call duration: {formattedDuration}</p>
            <Button 
              onClick={() => handleInitiateCall(callType)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Phone className="h-5 w-5 mr-2" />
              Call Again
            </Button>
          </div>
        );
        
      default:
        return null;
    }
  };

  // Render incoming call UI
  const renderIncomingCallUI = () => {
    return (
      <div className="flex flex-col items-center justify-center p-6 space-y-4">
        <Avatar className="h-24 w-24">
          <div className="bg-blue-100 h-full w-full flex items-center justify-center text-2xl font-semibold text-blue-600">
            {incomingCall?.callerName?.charAt(0) || '?'}
          </div>
        </Avatar>
        <h2 className="text-xl font-semibold">Incoming {incomingCall.callType} call</h2>
        <p>{incomingCall.callerName} is calling you</p>
        <div className="flex space-x-4">
          <Button 
            onClick={answerCall}
            className="bg-green-600 hover:bg-green-700"
          >
            <Phone className="h-5 w-5 mr-2" />
            Answer
          </Button>
          <Button 
            onClick={() => rejectCall()}
            className="bg-red-600 hover:bg-red-700"
          >
            <PhoneOff className="h-5 w-5 mr-2" />
            Decline
          </Button>
        </div>
      </div>
    );
  };

  return (
    <Card className={`overflow-hidden ${isMinimized ? 'w-72' : 'w-full'} ${isMinimized ? 'h-auto' : 'h-full'}`}>
      {incomingCall ? renderIncomingCallUI() : renderCallUI()}
    </Card>
  );
}
