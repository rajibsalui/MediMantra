import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { format } from "date-fns";
import { toast } from "react-hot-toast";
import { Loader2, Calendar, Clock, CheckCircle, XCircle } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../../../components/ui/dialog";
import { Textarea } from "../../../components/ui/textarea";
import RateDoctorDialog from "../../../components/appointment/RateDoctorDialog";
import { useAuth } from "../../../contexts/AuthContext";

export default function PatientAppointments() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("upcoming");
  const [cancelDialog, setCancelDialog] = useState({ open: false, appointment: null });
  const [cancelReason, setCancelReason] = useState("");
  const [cancelLoading, setCancelLoading] = useState(false);
  const [rateDialog, setRateDialog] = useState({ open: false, appointment: null });

  // Check authentication
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login?redirect=/patient/appointments");
    }
  }, [isAuthenticated, authLoading, router]);

  // Fetch appointments
  useEffect(() => {
    const fetchAppointments = async () => {
      if (!isAuthenticated) return;
      
      try {
        const response = await fetch("/api/patients/appointments");
        const data = await response.json();
        
        if (data.success) {
          setAppointments(data.data);
        } else {
          toast.error(data.message || "Failed to fetch appointments");
        }
      } catch (error) {
        console.error("Error fetching appointments:", error);
        toast.error("Something went wrong. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchAppointments();
    }
  }, [isAuthenticated]);

  // Filter appointments based on active tab
  const filteredAppointments = appointments.filter(appointment => {
    const appointmentDate = new Date(appointment.appointmentDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (activeTab === "upcoming") {
      return appointmentDate >= today && appointment.status === "scheduled";
    } else if (activeTab === "past") {
      return appointmentDate < today || ["completed", "cancelled", "no-show"].includes(appointment.status);
    } else if (activeTab === "all") {
      return true;
    }
    return false;
  });

  // Cancel appointment
  const handleCancelAppointment = async () => {
    if (!cancelDialog.appointment) return;
    
    setCancelLoading(true);
    try {
      const response = await fetch(`/api/patients/appointments/${cancelDialog.appointment._id}/cancel`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reason: cancelReason,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Appointment cancelled successfully");
        
        // Update local state
        setAppointments(appointments.map(app => 
          app._id === cancelDialog.appointment._id 
            ? { ...app, status: "cancelled", cancellationReason: cancelReason } 
            : app
        ));
        
        setCancelDialog({ open: false, appointment: null });
        setCancelReason("");
      } else {
        toast.error(data.message || "Failed to cancel appointment");
      }
    } catch (error) {
      console.error("Error cancelling appointment:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setCancelLoading(false);
    }
  };

  if (authLoading || (loading && !appointments.length)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>My Appointments | MediMantra</title>
      </Head>
      
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-6">My Appointments</h1>
        
        <div className="mb-6">
          <Button onClick={() => router.push("/doctors")}>
            Book New Appointment
          </Button>
        </div>
        
        <Tabs defaultValue="upcoming" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="past">Past</TabsTrigger>
            <TabsTrigger value="all">All</TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeTab}>
            {filteredAppointments.length === 0 ? (
              <div className="text-center py-12 bg-muted/30 rounded-lg">
                <h3 className="text-xl font-medium mb-2">No appointments found</h3>
                <p className="text-muted-foreground mb-4">
                  {activeTab === "upcoming" 
                    ? "You don't have any upcoming appointments scheduled." 
                    : "You don't have any past appointments."}
                </p>
                {activeTab === "upcoming" && (
                  <Button onClick={() => router.push("/doctors")}>
                    Book an Appointment
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAppointments.map((appointment) => (
                  <Card key={appointment._id} className="overflow-hidden">
                    <div 
                      className={`h-2 ${
                        appointment.status === "scheduled" 
                          ? "bg-blue-500" 
                          : appointment.status === "completed" 
                          ? "bg-green-500" 
                          : appointment.status === "cancelled" 
                          ? "bg-red-500" 
                          : "bg-gray-500"
                      }`}
                    />
                    <CardHeader>
                      <CardTitle>
                        Dr. {appointment.doctor.user.firstName} {appointment.doctor.user.lastName}
                      </CardTitle>
                      <CardDescription>
                        {appointment.doctor.specialties.join(", ")}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span>
                            {format(new Date(appointment.appointmentDate), "MMMM d, yyyy")}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span>{appointment.appointmentTime}</span>
                        </div>
                        <div className="flex items-center">
                          <span className="font-medium mr-2">Type:</span>
                          <span className="capitalize">{appointment.appointmentType}</span>
                        </div>
                        <div className="flex items-center">
                          <span className="font-medium mr-2">Status:</span>
                          <span className={`capitalize px-2 py-0.5 rounded-full text-xs ${
                            appointment.status === "scheduled" 
                              ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" 
                              : appointment.status === "completed" 
                              ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" 
                              : appointment.status === "cancelled" 
                              ? "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300" 
                              : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                          }`}>
                            {appointment.status}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex flex-col items-stretch space-y-2">
                      {appointment.status === "scheduled" && (
                        <Button 
                          variant="destructive" 
                          onClick={() => setCancelDialog({ open: true, appointment })}
                          size="sm"
                          className="w-full"
                        >
                          Cancel Appointment
                        </Button>
                      )}
                      
                      {appointment.status === "completed" && !appointment.feedback?.submitted && (
                        <Button 
                          variant="outline" 
                          onClick={() => setRateDialog({ open: true, appointment })}
                          size="sm"
                          className="w-full"
                        >
                          Rate Doctor
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Cancel appointment dialog */}
      <Dialog open={cancelDialog.open} onOpenChange={(open) => !open && setCancelDialog({ open, appointment: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Appointment</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this appointment? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <label className="block text-sm font-medium mb-2">
              Reason for Cancellation
            </label>
            <Textarea
              placeholder="Please provide a reason for cancellation (optional)"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
            />
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelDialog({ open: false, appointment: null })}>
              Keep Appointment
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleCancelAppointment}
              disabled={cancelLoading}
            >
              {cancelLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Cancelling...
                </>
              ) : (
                "Confirm Cancellation"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Rate doctor dialog */}
      <RateDoctorDialog 
        isOpen={rateDialog.open}
        onClose={() => setRateDialog({ open: false, appointment: null })}
        appointment={rateDialog.appointment}
      />
    </>
  );
}
