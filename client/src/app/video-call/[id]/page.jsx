"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useVideoCall } from "@/contexts/VideoCallContext";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import VideoCallUI from "@/components/call/VideoCallUI";
import axios from "axios";
import { API_URL } from "@/config/environment";
import { Loader2 } from "lucide-react";

// This ensures the page is only rendered on the client side
export const dynamic = 'force-dynamic';
export const runtime = 'edge';

export default function VideoCallPage({ params }) {
  const { id } = params;
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { callStatus } = useVideoCall();
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch appointment details
  useEffect(() => {
    if (!isAuthenticated || authLoading) return;

    const fetchAppointment = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/appointments/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (response.data.success) {
          setAppointment(response.data.data);
        } else {
          setError('Failed to load appointment details');
        }
      } catch (error) {
        console.error('Error fetching appointment:', error);
        setError('Failed to load appointment details');
      } finally {
        setLoading(false);
      }
    };

    fetchAppointment();
  }, [id, isAuthenticated, authLoading]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  // Redirect back to appointment if call ends
  useEffect(() => {
    if (callStatus === 'ended') {
      // Add a small delay before redirecting
      const timer = setTimeout(() => {
        if (user?.role === 'doctor') {
          router.push(`/doctor/appointments/${id}`);
        } else {
          router.push(`/patient/appointments/${id}`);
        }
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [callStatus, id, router, user]);

  // Loading state
  if (authLoading || loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[calc(100vh-12rem)]">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </DashboardLayout>
    );
  }

  // Error state
  if (error) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-[calc(100vh-12rem)]">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-600">{error}</p>
          <button
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md"
            onClick={() => router.back()}
          >
            Go Back
          </button>
        </div>
      </DashboardLayout>
    );
  }

  // Determine the other participant based on user role
  const otherParticipantId = user?.role === 'doctor' 
    ? appointment?.patient?._id 
    : appointment?.doctor?._id;

  return (
    <DashboardLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Video Call</h1>
        
        <div className="h-[calc(100vh-16rem)]">
          <VideoCallUI 
            appointmentId={id}
            patientId={appointment?.patient?._id}
            doctorId={appointment?.doctor?._id}
            isMinimizable={false}
          />
        </div>
      </div>
    </DashboardLayout>
  );
}
