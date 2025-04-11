"use client";

import { useVideoCall } from '@/contexts/VideoCallContext';
import VideoCallUI from './VideoCallUI';

export default function FloatingCallUI() {
  const { callStatus, isMinimized } = useVideoCall();
  
  // Only show when in a call and minimized
  if (callStatus === 'idle' || callStatus === 'ended' || !isMinimized) {
    return null;
  }
  
  return (
    <div className="fixed bottom-4 right-4 z-50 shadow-xl">
      <VideoCallUI isMinimizable={true} />
    </div>
  );
}
