"use client";
import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import { format } from "date-fns";
import { toast } from "react-hot-toast";
import {
  Loader2, Calendar, Clock, CheckCircle, XCircle,
  CalendarPlus, LayoutDashboard, UserRound, PhoneCall,
  Search, Filter, MapPin, Building, ArrowUpRight, BadgeAlert
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import RateDoctorDialog from "@/components/appointment/RateDoctorDialog";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useAppointment } from "@/contexts/AppointmentContext";
import { API_URL, SOCKET_URL } from '@/config/environment';


// This ensures the page is only rendered on the client side
export const dynamic = 'force-dynamic';
export const runtime = 'edge';



export default function PatientAppointments() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { appointments, loading: appointmentsLoading, getAppointments, cancelAppointment } = useAppointment();

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
    if (isAuthenticated) {
      getAppointments();
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

  // Get appointment counts
  const upcomingCount = appointments.filter(a => {
    const appointmentDate = new Date(a.appointmentDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return appointmentDate >= today && a.status === "scheduled";
  }).length;

  const completedCount = appointments.filter(a => a.status === "completed").length;
  const cancelledCount = appointments.filter(a => a.status === "cancelled").length;

  const renderAppointmentsList = (tab) => {
    const filteredAppointments = appointments.filter(appointment => {
      const appointmentDate = new Date(appointment.appointmentDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (tab === "upcoming") {
        return appointmentDate >= today && appointment.status === "scheduled";
      } else if (tab === "past") {
        return appointmentDate < today || ["completed", "cancelled", "no-show"].includes(appointment.status);
      } else if (tab === "all") {
        return true;
      }
      return false;
    });

    if (filteredAppointments.length === 0) {
      return (
        <div className="text-center py-16 bg-gradient-to-b from-muted/30 to-transparent rounded-xl border border-dashed border-muted-foreground/30">
          <div className="flex justify-center mb-4">
            {tab === "upcoming" ?
              <CalendarPlus className="h-12 w-12 text-muted-foreground/60" /> :
              <Calendar className="h-12 w-12 text-muted-foreground/60" />
            }
          </div>
          <h3 className="text-xl font-semibold mb-3">No appointments found</h3>
          <p className="text-muted-foreground max-w-md mx-auto mb-6">
            {tab === "upcoming"
              ? "You don't have any upcoming appointments scheduled. Book now to secure your slot."
              : "You don't have any past appointments in your medical history."}
          </p>
          {tab === "upcoming" && (
            <Button onClick={() => router.push("/appointments")} size="lg" className="font-medium px-8">
              <CalendarPlus className="mr-2 h-4 w-4" />
              Book an Appointment
            </Button>
          )}
        </div>
      );
    }

    return (
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAppointments.map((appointment) => (
          <Card
            key={appointment._id}
            className="overflow-hidden border-muted hover:border-muted-foreground/30 transition-all duration-300 hover:shadow-md group"
          >
            <div
              className={`h-1.5 w-full ${
                appointment.status === "scheduled"
                  ? "bg-blue-500"
                  : appointment.status === "completed"
                  ? "bg-green-500"
                  : appointment.status === "cancelled"
                  ? "bg-red-500"
                  : "bg-gray-500"
              }`}
            />
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg font-semibold group-hover:text-primary transition-colors">
                    Dr. {appointment.doctor.user.firstName} {appointment.doctor.user.lastName}
                  </CardTitle>
                  <CardDescription className="mt-0.5">
                    {appointment.doctor.specialties.join(", ")}
                  </CardDescription>
                </div>
                <Badge variant={appointment.status === "scheduled" ? "blue" : appointment.status === "completed" ? "success" : "destructive"} className="capitalize">
                  {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pb-4">
              <div className="space-y-3 pt-2">
                <div className="flex items-center p-2 bg-muted/40 rounded-md">
                  <Calendar className="h-4 w-4 mr-2 text-primary" />
                  <span className="font-medium">
                    {format(new Date(appointment.appointmentDate), "MMMM d, yyyy")}
                  </span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>{appointment.appointmentTime}</span>
                </div>
                <div className="flex items-center">
                  <span className="font-medium mr-2 text-sm text-muted-foreground">Type:</span>
                  <span className="capitalize flex items-center">
                    {appointment.appointmentType === "virtual" ? (
                      <><PhoneCall className="mr-1 h-3 w-3 text-primary" /> Virtual</>
                    ) : (
                      <><UserRound className="mr-1 h-3 w-3 text-primary" /> In-person</>
                    )}
                  </span>
                </div>
                {appointment.location && (
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-sm">{appointment.location}</span>
                  </div>
                )}
                {appointment.department && (
                  <div className="flex items-center">
                    <Building className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-sm">{appointment.department}</span>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex flex-col items-stretch space-y-2 pt-0 border-t border-muted bg-muted/20">
              {appointment.status === "scheduled" && (
                <Button
                  variant="destructive"
                  onClick={() => setCancelDialog({ open: true, appointment })}
                  size="sm"
                  className="w-full mt-2"
                >
                  <XCircle className="h-4 w-4 mr-1" /> Cancel Appointment
                </Button>
              )}

              {appointment.status === "completed" && !appointment.feedback?.submitted && (
                <Button
                  variant="outline"
                  onClick={() => setRateDialog({ open: true, appointment })}
                  size="sm"
                  className="w-full mt-2"
                >
                  <CheckCircle className="h-4 w-4 mr-1" /> Rate Doctor
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  };

  // Cancel appointment
  const handleCancelAppointment = async () => {
    if (!cancelDialog.appointment) return;

    setCancelLoading(true);
    try {
      await cancelAppointment(cancelDialog.appointment._id, cancelReason);

      // Close dialog and reset state
      setCancelDialog({ open: false, appointment: null });
      setCancelReason("");
    } catch (error) {
      console.error("Error cancelling appointment:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setCancelLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/20">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your appointments...</p>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto py-6 px-4 md:px-6">
        {/* Dashboard header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">My Appointments</h1>
              <p className="text-muted-foreground">
                Manage your medical appointments and consultations
              </p>
            </div>
            <div className="flex space-x-2 mt-4 md:mt-0">
              <Button
                onClick={() => router.push("/appointments")}
                className="bg-primary hover:bg-primary/90"
              >
                <CalendarPlus className="mr-2 h-4 w-4" />
                Book New Appointment
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card className="bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/30 dark:to-background border-blue-100 dark:border-blue-900/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Upcoming</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <div className="bg-blue-100 dark:bg-blue-900/50 p-2 rounded-full mr-3">
                    <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="text-2xl font-bold">{upcomingCount}</div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-white dark:from-green-950/30 dark:to-background border-green-100 dark:border-green-900/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <div className="bg-green-100 dark:bg-green-900/50 p-2 rounded-full mr-3">
                    <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="text-2xl font-bold">{completedCount}</div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-red-50 to-white dark:from-red-950/30 dark:to-background border-red-100 dark:border-red-900/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Cancelled</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <div className="bg-red-100 dark:bg-red-900/50 p-2 rounded-full mr-3">
                    <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                  </div>
                  <div className="text-2xl font-bold">{cancelledCount}</div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-white dark:from-purple-950/30 dark:to-background border-purple-100 dark:border-purple-900/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <div className="bg-purple-100 dark:bg-purple-900/50 p-2 rounded-full mr-3">
                    <LayoutDashboard className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="text-2xl font-bold">{appointments.length}</div>
                </div>
              </CardContent>
            </Card>
          </div>

        </div>

        {/* Search and filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
            <Input
              placeholder="Search appointments..."
              className="pl-10"
            />
          </div>

          <Select defaultValue="all">
            <SelectTrigger className="w-full sm:w-[180px]">
              <div className="flex items-center">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="bg-card rounded-xl p-6 shadow-sm border">
          <Tabs defaultValue="upcoming" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList key="tabs-list" className="mb-6 grid w-full grid-cols-3 md:w-auto md:inline-flex">
              <TabsTrigger key="upcoming-tab" value="upcoming" className="font-medium">
                <Calendar className="mr-2 h-4 w-4" /> Upcoming
              </TabsTrigger>
              <TabsTrigger key="past-tab" value="past" className="font-medium">
                <Clock className="mr-2 h-4 w-4" /> Past
              </TabsTrigger>
              <TabsTrigger key="all-tab" value="all" className="font-medium">
                <LayoutDashboard className="mr-2 h-4 w-4" /> All
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upcoming" className="mt-2">
              {renderAppointmentsList("upcoming")}
            </TabsContent>
            <TabsContent value="past" className="mt-2">
              {renderAppointmentsList("past")}
            </TabsContent>
            <TabsContent value="all" className="mt-2">
              {renderAppointmentsList("all")}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Cancel appointment dialog */}
      <Dialog open={cancelDialog.open} onOpenChange={(open) => !open && setCancelDialog({ open, appointment: null })}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center text-xl">
              <XCircle className="h-5 w-5 mr-2 text-red-500" />
              Cancel Appointment
            </DialogTitle>
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
              className="min-h-24"
            />
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setCancelDialog({ open: false, appointment: null })}
              className="w-full sm:w-auto"
            >
              Keep Appointment
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancelAppointment}
              disabled={cancelLoading}
              className="w-full sm:w-auto"
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
    </DashboardLayout>
  );
}
