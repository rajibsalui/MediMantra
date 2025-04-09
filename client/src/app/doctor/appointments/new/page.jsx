"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { toast } from "react-hot-toast";
import { format } from "date-fns";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { useDoctor } from "@/contexts/DoctorContext";

import {
  ArrowLeft,
  Calendar as CalendarIcon,
  Clock,
  Search,
  User,
  Video,
  Phone,
  MapPin,
  Loader2,
} from "lucide-react";
import { API_URL, SOCKET_URL } from '@/config/environment';

// API URL
// const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

// Form schema
const formSchema = z.object({
  patientId: z.string().min(1, "Patient is required"),
  appointmentDate: z.date({
    required_error: "Appointment date is required",
  }),
  appointmentTime: z.string().min(1, "Appointment time is required"),
  appointmentType: z.enum(["in-person", "video", "phone"], {
    required_error: "Appointment type is required",
  }),
  reason: z.string().optional(),
  notes: z.string().optional(),
});

// This ensures the page is only rendered on the client side
export const dynamic = 'force-dynamic';
export const runtime = 'edge';

export default function NewAppointmentPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { doctor } = useDoctor();
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [patientsLoading, setPatientsLoading] = useState(true);
  const [timeSlotsLoading, setTimeSlotsLoading] = useState(false);

  // Initialize form
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      patientId: "",
      appointmentDate: new Date(),
      appointmentTime: "",
      appointmentType: "in-person",
      reason: "",
      notes: "",
    },
  });

  useEffect(() => {
    // Redirect if not authenticated or not a doctor
    if (!authLoading && (!isAuthenticated || user?.role !== "doctor")) {
      toast.error("You must be logged in as a doctor to access this page");
      router.push("/auth/login");
    }
  }, [isAuthenticated, user, authLoading, router]);

  useEffect(() => {
    if (isAuthenticated && user?.role === "doctor") {
      loadPatients();
    }
  }, [isAuthenticated, user]);

  // Load patients when search term changes
  useEffect(() => {
    if (patients.length > 0) {
      filterPatients();
    }
  }, [searchTerm, patients]);

  // Load available time slots when date changes
  useEffect(() => {
    const date = form.watch("appointmentDate");
    if (date) {
      loadAvailableTimeSlots(date);
    }
  }, [form.watch("appointmentDate")]);

  const loadPatients = async () => {
    try {
      setPatientsLoading(true);
      const response = await axios.get(`${API_URL}/doctors/patients`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.data.success) {
        setPatients(response.data.data || []);
        setFilteredPatients(response.data.data || []);
      } else {
        toast.error(response.data.message || "Failed to load patients");
      }
    } catch (err) {
      console.error("Error loading patients:", err);
      toast.error("Failed to load patients. Please try again.");
    } finally {
      setPatientsLoading(false);
    }
  };

  const loadAvailableTimeSlots = async (date) => {
    if (!date) return;

    try {
      setTimeSlotsLoading(true);
      // Reset selected time when date changes
      form.setValue("appointmentTime", "");

      const formattedDate = date.toISOString().split('T')[0];
      const response = await axios.get(
        `${API_URL}/doctors/availability?date=${formattedDate}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.data.success) {
        // Filter only available slots
        const slots = response.data.data.filter(slot => slot.isAvailable) || [];
        setAvailableTimeSlots(slots);
      } else {
        toast.error(response.data.message || "Failed to fetch availability");
        setAvailableTimeSlots([]);
      }
    } catch (err) {
      console.error("Error loading time slots:", err);
      toast.error("Failed to load available time slots");
      setAvailableTimeSlots([]);
    } finally {
      setTimeSlotsLoading(false);
    }
  };

  const filterPatients = () => {
    if (!searchTerm.trim()) {
      setFilteredPatients(patients);
      return;
    }

    const filtered = patients.filter((patient) => {
      const fullName = `${patient.user?.firstName || ""} ${patient.user?.lastName || ""}`.toLowerCase();
      const email = patient.user?.email?.toLowerCase() || "";
      const phone = patient.user?.phone || "";
      
      return (
        fullName.includes(searchTerm.toLowerCase()) ||
        email.includes(searchTerm.toLowerCase()) ||
        phone.includes(searchTerm.toLowerCase())
      );
    });

    setFilteredPatients(filtered);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      
      const appointmentData = {
        patientId: data.patientId,
        appointmentDate: data.appointmentDate.toISOString(),
        appointmentTime: data.appointmentTime,
        appointmentType: data.appointmentType,
        reason: data.reason || "",
        notes: data.notes || "",
      };

      const response = await axios.post(
        `${API_URL}/doctors/appointments`,
        appointmentData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.data.success) {
        toast.success("Appointment created successfully");
        router.push("/doctor/appointments");
      } else {
        toast.error(response.data.message || "Failed to create appointment");
      }
    } catch (err) {
      console.error("Error creating appointment:", err);
      toast.error(err.response?.data?.message || "Failed to create appointment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto py-6 px-4 md:px-6">
        <Link href="/doctor/appointments">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Appointments
          </Button>
        </Link>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">New Appointment</h1>
            <p className="text-muted-foreground">
              Schedule a new appointment for a patient
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Appointment Details</CardTitle>
                <CardDescription>
                  Fill in the details to schedule a new appointment
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    {/* Patient Selection */}
                    <FormField
                      control={form.control}
                      name="patientId"
                      render={({ field }) => (
                        <FormItem className="space-y-4">
                          <FormLabel>Patient</FormLabel>
                          <div className="relative mb-4">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                            <Input
                              placeholder="Search patients by name, email, or phone..."
                              className="pl-10"
                              value={searchTerm}
                              onChange={handleSearchChange}
                            />
                          </div>
                          <div className="max-h-60 overflow-y-auto border rounded-md">
                            {patientsLoading ? (
                              <div className="p-4 space-y-3">
                                {Array(3).fill(0).map((_, i) => (
                                  <div key={i} className="flex items-center space-x-3">
                                    <Skeleton className="h-10 w-10 rounded-full" />
                                    <div className="space-y-1">
                                      <Skeleton className="h-4 w-40" />
                                      <Skeleton className="h-3 w-24" />
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : filteredPatients.length === 0 ? (
                              <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                                No patients found
                              </div>
                            ) : (
                              filteredPatients.map((patient) => (
                                <div
                                  key={patient._id}
                                  className={`p-3 flex items-center space-x-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 ${
                                    field.value === patient._id
                                      ? "bg-blue-50 dark:bg-blue-900/20"
                                      : ""
                                  }`}
                                  onClick={() => form.setValue("patientId", patient._id)}
                                >
                                  <Avatar>
                                    <AvatarImage
                                      src={patient.user?.profileImage}
                                      alt={`${patient.user?.firstName || ""} ${patient.user?.lastName || ""}`}
                                    />
                                    <AvatarFallback>
                                      <User className="h-5 w-5" />
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <div className="font-medium">
                                      {patient.user?.firstName || ""} {patient.user?.lastName || ""}
                                    </div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                      {patient.user?.email || "No email"}
                                    </div>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Date and Time Selection */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="appointmentDate"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Date</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant="outline"
                                    className="w-full pl-3 text-left font-normal"
                                  >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {field.value ? (
                                      format(field.value, "PPP")
                                    ) : (
                                      <span>Pick a date</span>
                                    )}
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                  mode="single"
                                  selected={field.value}
                                  onSelect={field.onChange}
                                  disabled={(date) => {
                                    // Disable dates in the past
                                    const today = new Date();
                                    today.setHours(0, 0, 0, 0);
                                    return date < today;
                                  }}
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="appointmentTime"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Time</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                              disabled={timeSlotsLoading || availableTimeSlots.length === 0}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select time" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {timeSlotsLoading ? (
                                  <div className="flex items-center justify-center py-2">
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                    Loading...
                                  </div>
                                ) : availableTimeSlots.length === 0 ? (
                                  <div className="p-2 text-center text-gray-500 dark:text-gray-400">
                                    No available slots
                                  </div>
                                ) : (
                                  availableTimeSlots.map((slot) => (
                                    <SelectItem
                                      key={slot.startTime}
                                      value={slot.startTime}
                                    >
                                      {slot.startTime}
                                    </SelectItem>
                                  ))
                                )}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Appointment Type */}
                    <FormField
                      control={form.control}
                      name="appointmentType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Appointment Type</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="in-person" className="flex items-center">
                                <div className="flex items-center">
                                  <MapPin className="h-4 w-4 mr-2 text-purple-500" />
                                  In-Person
                                </div>
                              </SelectItem>
                              <SelectItem value="video">
                                <div className="flex items-center">
                                  <Video className="h-4 w-4 mr-2 text-blue-500" />
                                  Video Call
                                </div>
                              </SelectItem>
                              <SelectItem value="phone">
                                <div className="flex items-center">
                                  <Phone className="h-4 w-4 mr-2 text-green-500" />
                                  Phone Call
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Reason */}
                    <FormField
                      control={form.control}
                      name="reason"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Reason for Visit</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Enter the reason for the appointment"
                              className="resize-none"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Notes */}
                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Additional Notes</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Any additional notes or instructions"
                              className="resize-none"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <CardFooter className="flex justify-end space-x-2 px-0">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.push("/doctor/appointments")}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Create Appointment
                      </Button>
                    </CardFooter>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Doctor Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4 mb-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage
                      src={doctor?.user?.profileImage}
                      alt={`${doctor?.user?.firstName || ""} ${doctor?.user?.lastName || ""}`}
                    />
                    <AvatarFallback>
                      <User className="h-6 w-6" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">
                      Dr. {doctor?.user?.firstName || ""} {doctor?.user?.lastName || ""}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {doctor?.specialties?.join(", ") || "General Practitioner"}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">In-Person Consultation</span>
                    <span className="font-medium">
                      ₹{doctor?.consultationFee?.inPerson || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Video Consultation</span>
                    <span className="font-medium">
                      ₹{doctor?.consultationFee?.video || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Phone Consultation</span>
                    <span className="font-medium">
                      ₹{doctor?.consultationFee?.phone || "N/A"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Appointment Guidelines</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-3">
                <p>
                  • Appointments can only be scheduled during available time slots.
                </p>
                <p>
                  • Patients should arrive 15 minutes before their in-person appointment.
                </p>
                <p>
                  • For video consultations, a link will be sent to the patient's email.
                </p>
                <p>
                  • Appointments can be rescheduled up to 24 hours before the scheduled time.
                </p>
                <p>
                  • Please ensure all patient information is accurate before scheduling.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
