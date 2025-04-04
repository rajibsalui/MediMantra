"use client";

import { useState, useEffect } from "react";
import { Calendar, Clock, X, Loader2, AlertCircle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAppointment } from '@/contexts/AppointmentContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";

export default function UpcomingAppointments() {
  const { getAppointments, cancelAppointment, loading, appointments } = useAppointment();
  const [error, setError] = useState(null);
  const [cancelModal, setCancelModal] = useState({ open: false, appointmentId: null });
  const [cancelReason, setCancelReason] = useState("");
  const [cancellingAppointment, setCancellingAppointment] = useState(false);
  const router = useRouter();
  
  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setError(null);
      await getAppointments();
    } catch (error) {
      console.error('Error fetching appointments:', error);
      setError(error.message || 'Failed to load appointments');
    }
  };
  
  function getStatusBadge(status) {
    switch(status) {
      case "scheduled":
        return <Badge className="bg-green-100 text-green-800">Scheduled</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case "cancelled":
        return <Badge className="bg-red-100 text-red-800">Cancelled</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status || "Unknown"}</Badge>;
    }
  }
  
  function formatAppointmentDate(dateStr) {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  }
  
  function formatAppointmentTime(time) {
    if (!time) return "N/A";
    return time;
  }
  
  const handleOpenCancelModal = (appointmentId) => {
    setCancelModal({ open: true, appointmentId });
    setCancelReason("");
  };
  
  const handleCloseCancelModal = () => {
    setCancelModal({ open: false, appointmentId: null });
    setCancelReason("");
  };
  
  const handleCancelAppointment = async () => {
    if (!cancelModal.appointmentId) return;
    
    try {
      setCancellingAppointment(true);
      await cancelAppointment(cancelModal.appointmentId, cancelReason);
      handleCloseCancelModal();
      fetchAppointments();
    } catch (error) {
      console.error('Error cancelling appointment:', error);
    } finally {
      setCancellingAppointment(false);
    }
  };
  
  const navigateToBookAppointment = () => {
    router.push('/appointments');
  };

  // Filter for upcoming appointments
  const upcomingAppointments = appointments?.filter(apt => {
    const aptDate = new Date(apt.appointmentDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return aptDate >= today && apt.status === 'scheduled';
  }) || [];

  return (
    <Card className="bg-white shadow-md flex flex-col h-[500px]">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl text-gray-800">Upcoming Appointments</CardTitle>
      </CardHeader>
      <CardContent className="overflow-y-auto flex-1">
        {loading && (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
          </div>
        )}
        
        {error && (
          <div className="flex items-center justify-center flex-col text-center py-8">
            <AlertCircle className="h-10 w-10 text-red-500 mb-2" />
            <p className="text-gray-700 mb-4">{error}</p>
            <Button onClick={fetchAppointments} variant="outline" size="sm">
              Try Again
            </Button>
          </div>
        )}

        {!loading && !error && upcomingAppointments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No upcoming appointments</p>
            <Button 
              className="btn btn-primary btn-sm mt-4 bg-blue-600 hover:bg-blue-700 text-white"
              onClick={navigateToBookAppointment}
            >
              Schedule New Appointment
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {upcomingAppointments.map((appointment) => (
              <div key={appointment._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-gray-800">
                      Dr. {appointment.doctor?.user?.firstName} {appointment.doctor?.user?.lastName}
                    </h3>
                    <p className="text-sm text-gray-500">{appointment.doctor?.specialties?.join(", ") || "Specialist"}</p>
                  </div>
                  {getStatusBadge(appointment.status)}
                </div>
                
                <div className="mt-3 space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar size={16} className="text-blue-600" />
                    <span className="text-gray-700">{formatAppointmentDate(appointment.appointmentDate)}</span>
                    <Clock size={16} className="text-blue-600 ml-2" />
                    <span className="text-gray-700">{formatAppointmentTime(appointment.appointmentTime)}</span>
                  </div>
                  {appointment.appointmentType && (
                    <p className="text-sm">
                      <span className="text-gray-500">Type:</span>{" "}
                      <span className="text-gray-700 capitalize">{appointment.appointmentType}</span>
                    </p>
                  )}
                  <p className="text-sm">
                    <span className="text-gray-500">Location:</span>{" "}
                    <span className="text-gray-700">
                      {appointment.appointmentType === "video" ? "Video Consultation" : "Clinic"}
                    </span>
                  </p>
                  {appointment.reason && (
                    <p className="text-sm">
                      <span className="text-gray-500">Reason:</span>{" "}
                      <span className="text-gray-700">{appointment.reason}</span>
                    </p>
                  )}
                </div>
                
                <div className="flex gap-2 mt-3">
                  {appointment.status !== 'cancelled' && (
                    <>
                      <Button variant="outline" size="sm" className="text-gray-700 hover:bg-gray-100">
                        Reschedule
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-red-600 hover:bg-red-50"
                        onClick={() => handleOpenCancelModal(appointment._id)}
                      >
                        Cancel
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))}
            
            <Button 
              variant="outline" 
              className="w-full text-blue-600 hover:bg-blue-50 hover:text-blue-700 mb-2"
              onClick={navigateToBookAppointment}
            >
              Schedule New Appointment
            </Button>
          </div>
        )}
      </CardContent>
      
      <Dialog open={cancelModal.open} onOpenChange={() => handleCloseCancelModal()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Appointment</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this appointment? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <label className="text-sm font-medium">
              Reason for cancellation (optional)
            </label>
            <Textarea 
              placeholder="Please provide a reason for cancelling this appointment"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              rows={3}
            />
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseCancelModal} disabled={cancellingAppointment}>
              Keep Appointment
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleCancelAppointment}
              disabled={cancellingAppointment}
            >
              {cancellingAppointment ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Cancelling...
                </>
              ) : (
                <>Cancel Appointment</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
