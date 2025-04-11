"use client";

import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './AuthContext';
import { useRouter } from 'next/navigation';
import Peer from 'peerjs';
import { io } from 'socket.io-client';
import { SOCKET_URL } from '@/config/environment';
import { toast } from 'react-hot-toast';
import callEvents from '@/lib/callEvents';

const VideoCallContext = createContext();

export const VideoCallProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [callSocket, setCallSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [peer, setPeer] = useState(null);
  const [peerId, setPeerId] = useState(null);
  const [incomingCall, setIncomingCall] = useState(null);
  const [currentCall, setCurrentCall] = useState(null);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isCalling, setIsCalling] = useState(false);
  const [callStatus, setCallStatus] = useState('idle'); // idle, calling, ringing, connected, ended
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [callType, setCallType] = useState('video'); // video or audio
  const [callDuration, setCallDuration] = useState(0);
  const [callStartTime, setCallStartTime] = useState(null);
  const [callHistory, setCallHistory] = useState([]);
  const [isMinimized, setIsMinimized] = useState(false);

  const callTimerRef = useRef(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  // Debug incomingCall state changes
  useEffect(() => {
    console.log('VideoCallContext - incomingCall state changed:', incomingCall);
  }, [incomingCall]);

  // Initialize socket connection for call signaling
  useEffect(() => {
    if (!isAuthenticated || !user) return;

    // Get token from localStorage
    const token = localStorage.getItem('token');
    if (!token) return;

    console.log(`Attempting to connect to video call socket server for ${user.role} (${user._id})`);
    console.log('User details:', { id: user._id, role: user.role, name: `${user.firstName} ${user.lastName}` });

    // Log the socket URL for debugging
    console.log('Socket URL:', SOCKET_URL);
    console.log('Full socket namespace URL:', `${SOCKET_URL}/video-calls`);

    // Use a direct connection approach without namespaces
    const newSocket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 10,
      timeout: 10000
    });

    // Alternative approach if the above doesn't work
    // const newSocket = io(`${SOCKET_URL}/video-calls`, {
    //   auth: { token },
    //   transports: ['websocket', 'polling'],
    //   reconnection: true,
    //   reconnectionDelay: 1000,
    //   reconnectionAttempts: 10,
    //   timeout: 10000,
    //   autoConnect: true,
    //   forceNew: true
    // });

    // Debug socket state
    console.log('Socket initial state:', {
      connected: newSocket.connected,
      disconnected: newSocket.disconnected,
      id: newSocket.id
    });

    // Socket event handlers
    newSocket.on('connect', () => {
      console.log('Video call socket connected');
      setConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('Video call socket disconnected');
      setConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('Video call socket connection error:', error);
      setConnected(false);
      toast.error('Could not connect to call server. Please try again later.');
    });

    // Add reconnect event handler
    newSocket.io.on('reconnect', (attempt) => {
      console.log(`Reconnected to video call server after ${attempt} attempts`);
      setConnected(true);
      toast.success('Reconnected to call server');
    });

    // Add reconnect attempt event handler
    newSocket.io.on('reconnect_attempt', (attempt) => {
      console.log(`Attempting to reconnect to video call server: attempt ${attempt}`);
    });

    // Add reconnect error event handler
    newSocket.io.on('reconnect_error', (error) => {
      console.error('Video call socket reconnection error:', error);
    });

    // Add reconnect failed event handler
    newSocket.io.on('reconnect_failed', () => {
      console.error('Video call socket reconnection failed');
      toast.error('Failed to reconnect to call server');
    });

    // Handle incoming call
    newSocket.on('incomingCall', (data) => {
      console.log('Incoming call received:', data);
      const { callerId, callerName, callType, receiverId, isBroadcast } = data;

      // If this is a broadcast message, check if it's for this user
      if (isBroadcast) {
        console.log('This is a broadcast message, checking if it\'s for this user');
        if (receiverId !== user._id.toString()) {
          console.log('Broadcast message is not for this user, ignoring');
          return;
        }
        console.log('Broadcast message is for this user, processing');
      }

      // Set incoming call data in state
      console.log('Setting incoming call state with:', { callerId, callerName, callType });
      const callData = {
        callerId,
        callerName,
        callType
      };

      setIncomingCall(callData);

      // Also emit a global event for other components to listen to
      callEvents.emit('incomingCall', callData);

      // Show a toast notification in addition to the dialog
      toast.success(`Incoming ${callType} call from ${callerName}`, {
        duration: 5000,
      });

      // Play ringtone
      console.log('Attempting to play ringtone');
      const ringtone = new Audio('/sounds/ringtone.mp3');
      ringtone.loop = true;
      ringtone.play().catch(err => console.error('Error playing ringtone:', err));

      // Auto-reject call after 30 seconds if not answered
      const timeout = setTimeout(() => {
        if (incomingCall) {
          rejectCall();
          ringtone.pause();
          ringtone.currentTime = 0;
        }
      }, 30000);

      // Store ringtone and timeout in refs for cleanup
      return () => {
        clearTimeout(timeout);
        ringtone.pause();
        ringtone.currentTime = 0;
      };
    });

    // Handle call accepted
    newSocket.on('callAccepted', (data) => {
      const { receiverPeerId } = data;

      setCallStatus('connected');

      // Start call with the receiver's peer ID
      if (peer && receiverPeerId) {
        startPeerCall(receiverPeerId);
      }
    });

    // Handle call rejected
    newSocket.on('callRejected', (data) => {
      const { reason } = data;

      setCallStatus('ended');
      setIsCalling(false);

      // Clean up
      stopLocalStream();

      toast.error(reason || 'Call was rejected');
    });

    // Handle call ended
    newSocket.on('callEnded', () => {
      endCall();
    });

    setCallSocket(newSocket);

    // Cleanup on unmount
    return () => {
      newSocket.disconnect();
    };
  }, [isAuthenticated, user]);

  // Initialize PeerJS
  useEffect(() => {
    if (!isAuthenticated || !user || !connected) return;

    const initPeer = async () => {
      try {
        console.log('Initializing PeerJS connection');

        // Determine if we're in development or production
        const isProduction = process.env.NODE_ENV === 'production';
        const peerHost = isProduction ? window.location.hostname : 'localhost';

        // Create a new Peer with a random ID
        const newPeer = new Peer(undefined, {
          host: peerHost,
          port: isProduction ? window.location.port || (window.location.protocol === 'https:' ? 443 : 80) : 3001,
          path: '/peerjs',
          secure: isProduction && window.location.protocol === 'https:',
          debug: 2,
          config: {
            iceServers: [
              { urls: 'stun:stun.l.google.com:19302' },
              { urls: 'stun:stun1.l.google.com:19302' },
              { urls: 'stun:stun2.l.google.com:19302' },
            ]
          }
        });

        newPeer.on('open', (id) => {
          console.log('My peer ID is:', id);
          setPeerId(id);

          // Register peer ID with socket server
          if (callSocket) {
            callSocket.emit('registerPeerId', { peerId: id });
          }
        });

        newPeer.on('call', (call) => {
          // Answer the call automatically if we've accepted the call via socket
          if (callStatus === 'connected' && localStream) {
            call.answer(localStream);

            call.on('stream', (stream) => {
              setRemoteStream(stream);

              // Set remote video element's srcObject to the remote stream
              if (remoteVideoRef.current) {
                remoteVideoRef.current.srcObject = stream;
              }

              // Start call timer
              startCallTimer();
            });
          }

          call.on('close', () => {
            endCall();
          });

          call.on('error', (err) => {
            console.error('Peer call error:', err);
            endCall();
          });

          setCurrentCall(call);
        });

        newPeer.on('error', (err) => {
          console.error('Peer error:', err);
        });

        setPeer(newPeer);
      } catch (error) {
        console.error('Error initializing PeerJS:', error);
      }
    };

    initPeer();

    // Cleanup on unmount
    return () => {
      if (peer) {
        peer.destroy();
      }
    };
  }, [isAuthenticated, user, connected, callStatus, localStream]);

  // Start local stream
  const startLocalStream = useCallback(async (videoEnabled = true) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: videoEnabled,
        audio: true
      });

      setLocalStream(stream);
      setIsVideoEnabled(videoEnabled);

      // Set local video element's srcObject to the local stream
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      return stream;
    } catch (error) {
      console.error('Error accessing media devices:', error);
      toast.error('Could not access camera or microphone');
      return null;
    }
  }, []);

  // Stop local stream
  const stopLocalStream = useCallback(() => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }
  }, [localStream]);

  // Start peer call
  const startPeerCall = useCallback((remotePeerId) => {
    if (!peer || !localStream || !remotePeerId) return;

    const call = peer.call(remotePeerId, localStream);

    call.on('stream', (stream) => {
      setRemoteStream(stream);

      // Set remote video element's srcObject to the remote stream
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = stream;
      }

      // Start call timer
      startCallTimer();
    });

    call.on('close', () => {
      endCall();
    });

    call.on('error', (err) => {
      console.error('Peer call error:', err);
      endCall();
    });

    setCurrentCall(call);
  }, [peer, localStream]);

  // Start call timer
  const startCallTimer = useCallback(() => {
    setCallStartTime(Date.now());
    setCallDuration(0);

    // Clear any existing timer
    if (callTimerRef.current) {
      clearInterval(callTimerRef.current);
    }

    // Start a new timer that updates every second
    callTimerRef.current = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
  }, []);

  // Stop call timer
  const stopCallTimer = useCallback(() => {
    if (callTimerRef.current) {
      clearInterval(callTimerRef.current);
      callTimerRef.current = null;
    }
  }, []);

  // Make a call
  const makeCall = useCallback(async (receiverId, _receiverName, type = 'video') => {
    // Check authentication and connection
    if (!isAuthenticated) {
      toast.error('You must be logged in to make calls');
      return false;
    }

    if (!callSocket) {
      toast.error('Call service not initialized');
      console.error('Call socket not initialized');
      return false;
    }

    // Try to reconnect if not connected
    if (!connected) {
      console.log('Socket not connected, attempting to reconnect...');
      callSocket.connect();

      // Wait a bit for the connection to establish
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Check if we're connected now
      if (!callSocket.connected) {
        toast.error('Not connected to call server. Please try again later.');
        console.error('Socket not connected when attempting to make call');
        return false;
      } else {
        console.log('Successfully reconnected to call server');
        setConnected(true);
      }
    }

    try {
      setCallType(type);
      setCallStatus('calling');
      setIsCalling(true);

      // Start local stream
      console.log(`Starting local ${type} stream`);
      const stream = await startLocalStream(type === 'video');
      if (!stream) {
        setCallStatus('idle');
        setIsCalling(false);
        return false;
      }

      console.log(`Emitting callUser event to ${receiverId}`);
      // Send call request via socket
      callSocket.emit('callUser', {
        receiverId,
        callType: type,
        callerName: `${user.firstName} ${user.lastName}`
      });

      // Set timeout to cancel call if not answered within 30 seconds
      setTimeout(() => {
        if (callStatus === 'calling') {
          endCall();
          toast.error('No answer');
        }
      }, 30000);

      return true;
    } catch (error) {
      console.error('Error making call:', error);
      toast.error('Failed to make call: ' + (error.message || 'Unknown error'));
      setCallStatus('idle');
      setIsCalling(false);
      return false;
    }
  }, [isAuthenticated, callSocket, connected, user, callStatus, startLocalStream]);

  // Answer a call
  const answerCall = useCallback(async () => {
    if (!incomingCall) return;

    setCallType(incomingCall.callType);
    setCallStatus('connected');

    // Start local stream
    const stream = await startLocalStream(incomingCall.callType === 'video');
    if (!stream) {
      rejectCall('Could not access media devices');
      return;
    }

    // Send call accepted via socket
    if (callSocket) {
      callSocket.emit('answerCall', {
        callerId: incomingCall.callerId,
        peerId
      });
    }

    setIncomingCall(null);
  }, [incomingCall, callSocket, peerId, startLocalStream]);

  // Reject a call
  const rejectCall = useCallback((reason = 'Call rejected') => {
    if (!incomingCall || !callSocket) return;

    callSocket.emit('rejectCall', {
      callerId: incomingCall.callerId,
      reason
    });

    setIncomingCall(null);
  }, [incomingCall, callSocket]);

  // End a call
  const endCall = useCallback(() => {
    // Notify the other party that the call has ended
    if (callSocket && (currentCall || incomingCall)) {
      const otherPartyId = incomingCall ? incomingCall.callerId : (currentCall ? currentCall.peer : null);

      if (otherPartyId) {
        callSocket.emit('endCall', { userId: otherPartyId });
      }
    }

    // Close the current call
    if (currentCall) {
      currentCall.close();
    }

    // Stop the call timer
    stopCallTimer();

    // Add call to history if it was connected
    if (callStatus === 'connected' && callStartTime) {
      const callRecord = {
        id: Date.now().toString(),
        type: callType,
        duration: callDuration,
        timestamp: callStartTime,
        participant: incomingCall ? incomingCall.callerName : (currentCall ? currentCall.metadata?.receiverName : 'Unknown')
      };

      setCallHistory(prev => [callRecord, ...prev]);
    }

    // Reset call state
    setCallStatus('ended');
    setIsCalling(false);
    setCurrentCall(null);
    setIncomingCall(null);
    setRemoteStream(null);
    setCallStartTime(null);
    setCallDuration(0);

    // Stop local stream
    stopLocalStream();

    // After a short delay, reset to idle
    setTimeout(() => {
      setCallStatus('idle');
    }, 2000);
  }, [callSocket, currentCall, incomingCall, callStatus, callStartTime, callType, callDuration, stopCallTimer, stopLocalStream]);

  // Toggle audio
  const toggleAudio = useCallback(() => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
      }
    }
  }, [localStream]);

  // Toggle video
  const toggleVideo = useCallback(() => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
      }
    }
  }, [localStream]);

  // Toggle call minimization
  const toggleMinimize = useCallback(() => {
    setIsMinimized(prev => !prev);
  }, []);

  // Navigate to video call page
  const navigateToCallPage = useCallback((appointmentId) => {
    router.push(`/video-call/${appointmentId}`);
  }, [router]);

  // Context value
  const value = {
    callSocket,
    connected,
    peer,
    peerId,
    incomingCall,
    currentCall,
    localStream,
    remoteStream,
    isCalling,
    callStatus,
    isAudioEnabled,
    isVideoEnabled,
    callType,
    callDuration,
    callHistory,
    isMinimized,
    localVideoRef,
    remoteVideoRef,
    makeCall,
    answerCall,
    rejectCall,
    endCall,
    toggleAudio,
    toggleVideo,
    toggleMinimize,
    navigateToCallPage
  };

  return <VideoCallContext.Provider value={value}>{children}</VideoCallContext.Provider>;
};

export const useVideoCall = () => {
  const context = useContext(VideoCallContext);
  if (!context) {
    throw new Error('useVideoCall must be used within a VideoCallProvider');
  }
  return context;
};
