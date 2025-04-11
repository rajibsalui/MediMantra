"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useVideoCall } from "@/contexts/VideoCallContext";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import VideoCallUI from "@/components/call/VideoCallUI";
import { Loader2 } from "lucide-react";

// This ensures the page is only rendered on the client side
export const dynamic = 'force-dynamic';
export const runtime = 'edge';

export default function PatientVideoCallPage({ params }) {
  const { id } = params;
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { callStatus } = useVideoCall();

  // Redirect if not authenticated or not a patient
  useEffect(() => {
    if (!authLoading && (!isAuthenticated || user?.role !== "patient")) {
      router.push("/login");
    }
  }, [isAuthenticated, authLoading, router, user]);

  // Redirect back to appointment if call ends
  useEffect(() => {
    if (callStatus === 'ended') {
      // Add a small delay before redirecting
      const timer = setTimeout(() => {
        router.push(`/patient/appointments/${id}`);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [callStatus, id, router]);

  // Loading state
  if (authLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[calc(100vh-12rem)]">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Video Call with Doctor</h1>
        
        <div className="h-[calc(100vh-16rem)]">
          <VideoCallUI 
            appointmentId={id}
            isMinimizable={false}
          />
        </div>
      </div>
    </DashboardLayout>
  );
}
