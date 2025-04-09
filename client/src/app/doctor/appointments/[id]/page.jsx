"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { toast } from "react-hot-toast";
import { format, formatDistance } from "date-fns";
import { API_URL } from "@/config/environment";

import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { useDoctor } from "@/contexts/DoctorContext";

import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Phone,
  Video,
  User,
  FileText,
  CheckCircle,
  XCircle,
  AlertTriangle,
  MoreVertical,
  RefreshCw,
  Edit,
  MessageSquare,
} from "lucide-react";

// This ensures the page is only rendered on the client side
export const dynamic = 'force-dynamic';
export const runtime = 'edge';

export default function AppointmentDetailPage({ params }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notes, setNotes] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [savingNotes, setSavingNotes] = useState(false);

  useEffect(() => {
    // Redirect if not authenticated or not a doctor
    if (!authLoading && (!isAuthenticated || user?.role !== "doctor")) {
      toast.error("You must be logged in as a doctor to access this page");
      router.push("/auth/login");
    }
  }, [isAuthenticated, user, authLoading, router]);

  useEffect(() => {
    if (isAuthenticated && user?.role === "doctor" && id) {
      loadAppointment();
    }
  }, [isAuthenticated, user, id]);

  const loadAppointment = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(`${API_URL}/appointments/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.data.success) {
        setAppointment(response.data.data);
        setNotes(response.data.data.doctorNotes || "");
      } else {
        setError(response.data.message || "Failed to load appointment");
        toast.error("Failed to load appointment");
      }
    } catch (err) {
      console.error("Error loading appointment:", err);
      setError("Failed to load appointment. Please try again.");
      toast.error("Failed to load appointment");
    } finally {
      setLoading(false);
    }
  };

  const updateAppointmentStatus = async (status) => {
    try {
      setUpdatingStatus(true);

      const response = await axios.put(
        `${API_URL}/appointments/${id}/status`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.data.success) {
        setAppointment(response.data.data);
        toast.success(`Appointment marked as ${status}`);
      } else {
        toast.error(response.data.message || "Failed to update appointment status");
      }
    } catch (err) {
      console.error("Error updating appointment status:", err);
      toast.error(err.response?.data?.message || "Failed to update appointment status");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const saveAppointmentNotes = async () => {
    try {
      setSavingNotes(true);

      const response = await axios.put(
        `${API_URL}/appointments/${id}/notes`,
        { doctorNotes: notes },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.data.success) {
        setAppointment(response.data.data);
        toast.success("Notes saved successfully");
      } else {
        toast.error(response.data.message || "Failed to save notes");
      }
    } catch (err) {
      console.error("Error saving appointment notes:", err);
      toast.error(err.response?.data?.message || "Failed to save notes");
    } finally {
      setSavingNotes(false);
    }
  };

  // Get appointment type icon
  const getAppointmentTypeIcon = () => {
    if (!appointment) return null;

    switch (appointment.appointmentType) {
      case "video":
        return <Video className="h-5 w-5 text-blue-500" />;
      case "phone":
        return <Phone className="h-5 w-5 text-green-500" />;
      default:
        return <MapPin className="h-5 w-5 text-purple-500" />;
    }
  };

  // Get status badge component based on status
  const getStatusBadge = () => {
    if (!appointment) return null;

    const statusConfig = {
      scheduled: { variant: "default", label: "Scheduled" },
      completed: { variant: "success", label: "Completed" },
      cancelled: { variant: "destructive", label: "Cancelled" },
      "no-show": { variant: "outline", label: "No Show" },
    };

    const config = statusConfig[appointment.status] || statusConfig.scheduled;

    return (
      <Badge variant={config.variant} className="capitalize">
        {config.label}
      </Badge>
    );
  };

  const canStartVideoCall = appointment?.appointmentType === "video" &&
    appointment?.status === "scheduled" &&
    new Date() >= new Date(new Date(appointment.appointmentDate).setMinutes(new Date(appointment.appointmentDate).getMinutes() - 5)) &&
    new Date() <= new Date(new Date(appointment.appointmentDate).setMinutes(new Date(appointment.appointmentDate).getMinutes() + appointment.duration || 30));

  if (authLoading || loading) {
    return (
      <DashboardLayout>
        <div className="container mx-auto py-6 px-4 md:px-6">
          <div className="flex items-center mb-6">
            <Skeleton className="h-10 w-10 mr-4" />
            <Skeleton className="h-8 w-48" />
          </div>
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-64 mb-2" />
              <Skeleton className="h-4 w-40" />
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <Skeleton className="h-16 w-64 mb-4 md:mb-0" />
                <Skeleton className="h-10 w-32" />
              </div>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-40 w-full" />
              <div className="flex justify-end space-x-4">
                <Skeleton className="h-10 w-32" />
                <Skeleton className="h-10 w-32" />
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="container mx-auto py-6 px-4 md:px-6">
          <Link href="/doctor/appointments">
            <Button variant="ghost" className="mb-6">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Appointments
            </Button>
          </Link>
          <Card>
            <CardContent className="p-6 text-center">
              <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-2">Error Loading Appointment</h2>
              <p className="text-gray-500 dark:text-gray-400 mb-4">{error}</p>
              <Button onClick={loadAppointment}>Try Again</Button>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  if (!appointment) {
    return (
      <DashboardLayout>
        <div className="container mx-auto py-6 px-4 md:px-6">
          <Link href="/doctor/appointments">
            <Button variant="ghost" className="mb-6">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Appointments
            </Button>
          </Link>
          <Card>
            <CardContent className="p-6 text-center">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-2">Appointment Not Found</h2>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                The appointment you're looking for doesn't exist or has been removed.
              </p>
              <Link href="/doctor/appointments">
                <Button>View All Appointments</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto py-6 px-4 md:px-6">
        <Link href="/doctor/appointments">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Appointments
          </Button>
        </Link>

        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle className="text-xl">Appointment Details</CardTitle>
                <CardDescription>
                  Created on {format(new Date(appointment.createdAt), "MMMM d, yyyy")}
                </CardDescription>
              </div>
              <div className="flex items-center space-x-2 mt-2 md:mt-0">
                {getStatusBadge()}
                {appointment.appointmentType === "video" && appointment.status === "scheduled" && (
                  <Button
                    size="sm"
                    variant={canStartVideoCall ? "default" : "outline"}
                    disabled={!canStartVideoCall}
                    onClick={() => router.push(`/doctor/video-call/${appointment._id}`)}
                  >
                    <Video className="h-4 w-4 mr-2" />
                    {canStartVideoCall ? "Join Video Call" : "Video Call"}
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Patient Information */}
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <h3 className="font-medium mb-3 flex items-center">
                <User className="h-5 w-5 mr-2 text-blue-500" />
                Patient Information
              </h3>
              <div className="flex items-center">
                <Avatar className="h-12 w-12 mr-4">
                  <AvatarImage
                    src={appointment.patient?.user?.profileImage}
                    alt={`${appointment.patient?.user?.firstName} ${appointment.patient?.user?.lastName}`}
                  />
                  <AvatarFallback>
                    {appointment.patient?.user?.firstName?.[0]}
                    {appointment.patient?.user?.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-medium">
                    {appointment.patient?.user?.firstName} {appointment.patient?.user?.lastName}
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {appointment.patient?.user?.email} • {appointment.patient?.user?.phone}
                  </p>
                </div>
                <div className="ml-auto">
                  <Link href={`/doctor/patients/${appointment.patient?._id}`}>
                    <Button variant="outline" size="sm">
                      View Patient Profile
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

            {/* Appointment Time and Type */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <h3 className="font-medium mb-3 flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-green-500" />
                  Appointment Details
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Date:</span>
                    <span>{format(new Date(appointment.appointmentDate), "MMMM d, yyyy")}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Time:</span>
                    <span>{appointment.appointmentTime}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Duration:</span>
                    <span>{appointment.duration || 30} minutes</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Type:</span>
                    <div className="flex items-center">
                      {getAppointmentTypeIcon()}
                      <span className="ml-1 capitalize">{appointment.appointmentType}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <h3 className="font-medium mb-3 flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-amber-500" />
                  Appointment Information
                </h3>
                <div className="space-y-2">
                  <div>
                    <span className="text-sm text-gray-500 dark:text-gray-400 block mb-1">Reason for Visit:</span>
                    <p>{appointment.reason || "No reason provided"}</p>
                  </div>

                  {appointment.symptoms && (
                    <div>
                      <span className="text-sm text-gray-500 dark:text-gray-400 block mb-1">Symptoms:</span>
                      <p>{appointment.symptoms}</p>
                    </div>
                  )}

                  {appointment.patientNotes && (
                    <div>
                      <span className="text-sm text-gray-500 dark:text-gray-400 block mb-1">Patient Notes:</span>
                      <p>{appointment.patientNotes}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Doctor Notes */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <MessageSquare className="h-5 w-5 mr-2 text-blue-500" />
                  Doctor's Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add your notes about this appointment here..."
                  className="min-h-[120px]"
                />
                <div className="mt-2 flex justify-end">
                  <Button
                    onClick={saveAppointmentNotes}
                    disabled={savingNotes}
                    size="sm"
                  >
                    {savingNotes ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Notes"
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Separator />

            {/* Actions */}
            <div className="flex flex-col md:flex-row md:justify-between items-center space-y-4 md:space-y-0">
              <div className="flex space-x-4">
                {appointment.status === "scheduled" && (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => updateAppointmentStatus("completed")}
                      disabled={updatingStatus}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Mark as Completed
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => updateAppointmentStatus("no-show")}
                      disabled={updatingStatus}
                    >
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Mark as No-Show
                    </Button>
                  </>
                )}
                {appointment.status !== "cancelled" && (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="destructive"
                        disabled={updatingStatus}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Cancel Appointment
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Cancel Appointment</DialogTitle>
                        <DialogDescription>
                          Are you sure you want to cancel this appointment? This action cannot be undone.
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => {}}>Cancel</Button>
                        <Button
                          variant="destructive"
                          onClick={() => updateAppointmentStatus("cancelled")}
                          disabled={updatingStatus}
                        >
                          {updatingStatus ? "Cancelling..." : "Yes, Cancel Appointment"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
              <div className="space-x-2">
                <Button variant="outline" onClick={() => router.push(`/doctor/prescriptions/new?appointmentId=${appointment._id}`)}>
                  <FileText className="h-4 w-4 mr-2" />
                  Create Prescription
                </Button>
                <Link href={`/doctor/appointments/${appointment._id}/edit`}>
                  <Button variant="outline">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Appointment
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}