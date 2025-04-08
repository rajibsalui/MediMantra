"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { toast } from "react-hot-toast";
import { format, isToday, isPast, isFuture } from "date-fns";

import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useAuth } from "@/contexts/AuthContext";
import { useDoctor } from "@/contexts/DoctorContext";

import {
  Search,
  PlusCircle,
  Calendar as CalendarIcon,
  Clock,
  Filter,
  ChevronRight,
  User,
  RefreshCw,
  Video,
  Phone,
  MapPin,
} from "lucide-react";

// API URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export default function AppointmentsPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const doctorContext = useDoctor();
  const { getDoctorAppointments } = doctorContext;
  console.log("Doctor Context:", doctorContext);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("upcoming");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [appointmentDates, setAppointmentDates] = useState({});

  useEffect(() => {
    // Redirect if not authenticated or not a doctor
    if (!authLoading && (!isAuthenticated || user?.role !== "doctor")) {
      toast.error("You must be logged in as a doctor to access this page");
      router.push("/auth/login");
    }
  }, [isAuthenticated, user, authLoading, router]);

  useEffect(() => {
    console.log("Auth state:", { isAuthenticated, userRole: user?.role });
    if (isAuthenticated && user?.role === "doctor") {
      console.log("Loading appointments...");
      loadAppointments();
    } else {
      console.log("Not loading appointments - not authenticated as doctor");
    }
  }, [
    isAuthenticated,
    user,
    activeTab,
    selectedDate,
    statusFilter,
    typeFilter,
    page,
  ]);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      setError(null);

      // Prepare query parameters object
      const queryParams = {
        page,
        limit: 10,
      };

      // Add date filter if on day view
      if (activeTab === "day" && selectedDate) {
        queryParams.date = selectedDate.toISOString().split("T")[0];
      }

      // Add status filter if not "all"
      if (statusFilter !== "all") {
        queryParams.status = statusFilter;
      }

      // Add type filter if not "all"
      if (typeFilter !== "all") {
        queryParams.type = typeFilter;
      }

      // Use getDoctorAppointments from context instead of direct API call
      console.log("Query Params:", queryParams);
      const result = await getDoctorAppointments(queryParams);
      console.log("API Result:", result);

      if (result.success) {
        setAppointments(result.data || []);
        setTotalPages(result.pagination?.pages || 1);

        // Process appointment dates for calendar highlighting
        const dates = {};
        result.data.forEach((appointment) => {
          const dateStr = new Date(appointment.appointmentDate).toDateString();
          dates[dateStr] = (dates[dateStr] || 0) + 1;
        });
        setAppointmentDates(dates);
      } else {
        setError(result.message || "Failed to load appointments");
        toast.error("Failed to load appointments");
      }
    } catch (err) {
      console.error("Error loading appointments:", err);
      setError("Failed to load appointments. Please try again.");
      toast.error("Failed to load appointments");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleTabChange = (value) => {
    setActiveTab(value);
    setPage(1); // Reset to first page when changing tabs
  };

  const handleStatusFilterChange = (value) => {
    setStatusFilter(value);
    setPage(1); // Reset to first page when changing filter
  };

  const handleTypeFilterChange = (value) => {
    setTypeFilter(value);
    setPage(1); // Reset to first page when changing filter
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setPage(1); // Reset to first page when changing date
  };

  // Get status badge component based on status
  const getStatusBadge = (status) => {
    const statusConfig = {
      scheduled: { variant: "default", label: "Scheduled" },
      completed: { variant: "success", label: "Completed" },
      cancelled: { variant: "destructive", label: "Cancelled" },
      "no-show": { variant: "outline", label: "No Show" },
    };

    const config = statusConfig[status] || statusConfig.scheduled;

    return (
      <Badge variant={config.variant} className="capitalize">
        {config.label}
      </Badge>
    );
  };

  // Get appointment type icon
  const getAppointmentTypeIcon = (type) => {
    switch (type) {
      case "video":
        return <Video className="h-4 w-4 text-blue-500" />;
      case "phone":
        return <Phone className="h-4 w-4 text-green-500" />;
      default:
        return <MapPin className="h-4 w-4 text-purple-500" />;
    }
  };

  // Filter appointments based on search term and active tab
  const filteredAppointments = (appointments || []).filter((appointment) => {
    // Filter by search term
    const patientName = `${appointment.patient?.user?.firstName || ""} ${
      appointment.patient?.user?.lastName || ""
    }`.toLowerCase();
    const reasonText = appointment.reason?.toLowerCase() || "";
    const statusText = appointment.status?.toLowerCase() || "";

    const matchesSearch =
      searchTerm === "" ||
      patientName.includes(searchTerm.toLowerCase()) ||
      reasonText.includes(searchTerm.toLowerCase()) ||
      statusText.includes(searchTerm.toLowerCase());

    // Filter by tab
    if (activeTab === "upcoming") {
      return (
        matchesSearch &&
        isFuture(new Date(appointment.appointmentDate)) &&
        appointment.status === "scheduled"
      );
    } else if (activeTab === "today") {
      return matchesSearch && isToday(new Date(appointment.appointmentDate));
    } else if (activeTab === "past") {
      return (
        matchesSearch &&
        (isPast(new Date(appointment.appointmentDate)) ||
          ["completed", "cancelled", "no-show"].includes(appointment.status))
      );
    } else if (activeTab === "day") {
      // Day view is handled by the API with date parameter
      return matchesSearch;
    }

    return matchesSearch; // "all" tab
  });

  const renderAppointmentList = () => {
    console.log("Filtered Appointments:", filteredAppointments);
    console.log("Raw Appointments:", appointments);
    console.log("Active Tab:", activeTab);

    if (loading) {
      return Array(3)
        .fill(0)
        .map((_, i) => (
          <div
            key={i}
            className="p-4 border-b last:border-b-0 border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
              <Skeleton className="h-8 w-24" />
            </div>
          </div>
        ));
    }

    if (error) {
      return (
        <div className="p-6 text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={loadAppointments}>Try Again</Button>
        </div>
      );
    }

    // Add this section to display appointment count at the top
    return (
      <>
        <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-t-md border-b border-gray-200 dark:border-gray-700 mb-2">
          <div className="flex justify-between items-center">
            <div className="text-sm font-medium">
              {filteredAppointments.length}{" "}
              {filteredAppointments.length === 1
                ? "appointment"
                : "appointments"}{" "}
              {activeTab !== "all" ? `(${activeTab})` : ""}
              {statusFilter !== "all" ? ` • Status: ${statusFilter}` : ""}
              {typeFilter !== "all" ? ` • Type: ${typeFilter}` : ""}
            </div>
            {searchTerm && (
              <div className="text-sm">Search: "{searchTerm}"</div>
            )}
          </div>
        </div>

        {filteredAppointments.length === 0 ? (
          <div className="text-center py-8">
            <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
              <CalendarIcon className="h-8 w-8 text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">
              No appointments found
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              {searchTerm
                ? "Try adjusting your search terms"
                : `No ${activeTab} appointments available`}
            </p>
            <Link href="/doctor/appointments/new">
              <Button size="sm">
                <PlusCircle className="w-4 h-4 mr-2" />
                New Appointment
              </Button>
            </Link>
          </div>
        ) : (
          filteredAppointments.map((appointment) => (
            <div
              key={appointment._id}
              className="p-4 border-b last:border-b-0 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Avatar>
                    <AvatarImage
                      src={appointment.patient?.user?.profileImage}
                      alt={`${appointment.patient?.user?.firstName || ""} ${
                        appointment.patient?.user?.lastName || ""
                      }`}
                    />
                    <AvatarFallback>
                      <User className="h-5 w-5" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-medium">
                      {appointment.patient?.user?.firstName || "Unknown"}{" "}
                      {appointment.patient?.user?.lastName || "Patient"}
                    </h4>
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <CalendarIcon className="h-3.5 w-3.5 mr-1" />
                      <span>
                        {appointment.appointmentDate
                          ? format(
                              new Date(appointment.appointmentDate),
                              "MMM d, yyyy"
                            )
                          : "No date"}
                      </span>
                      <span className="mx-1">•</span>
                      <Clock className="h-3.5 w-3.5 mr-1" />
                      <span>{appointment.appointmentTime}</span>
                      <span className="mx-1">•</span>
                      <span className="flex items-center">
                        {getAppointmentTypeIcon(appointment.appointmentType)}
                        <span className="ml-1 capitalize">
                          {appointment.appointmentType}
                        </span>
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusBadge(appointment.status)}
                  <Link href={`/doctor/appointments/${appointment._id}`}>
                    <Button variant="ghost" size="icon">
                      <ChevronRight className="h-5 w-5" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))
        )}
      </>
    );
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto py-6 px-4 md:px-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Appointments</h1>
            <p className="text-muted-foreground">
              Manage and schedule patient appointments
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={loadAppointments}
              disabled={loading}
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
            <Link href="/doctor/appointments/new">
              <Button size="sm">
                <PlusCircle className="h-4 w-4 mr-2" />
                New Appointment
              </Button>
            </Link>
          </div>
        </div>

        <Tabs
          defaultValue="upcoming"
          value={activeTab}
          onValueChange={handleTabChange}
          className="w-full mb-6"
        >
          <TabsList className="grid grid-cols-5 mb-4">
            <TabsTrigger value="upcoming" className="flex items-center">
              <CalendarIcon className="w-4 h-4 mr-2" />
              Upcoming
            </TabsTrigger>
            <TabsTrigger value="today" className="flex items-center">
              <Clock className="w-4 h-4 mr-2" />
              Today
            </TabsTrigger>
            <TabsTrigger value="past" className="flex items-center">
              <Clock className="w-4 h-4 mr-2" />
              Past
            </TabsTrigger>
            <TabsTrigger value="day" className="flex items-center">
              <CalendarIcon className="w-4 h-4 mr-2" />
              Day View
            </TabsTrigger>
            <TabsTrigger value="all" className="flex items-center">
              <Filter className="w-4 h-4 mr-2" />
              All
            </TabsTrigger>
          </TabsList>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                  <Input
                    placeholder="Search appointments..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={handleSearchChange}
                  />
                </div>
                <div className="flex space-x-2">
                  <Select
                    value={statusFilter}
                    onValueChange={handleStatusFilterChange}
                  >
                    <SelectTrigger className="w-[130px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                      <SelectItem value="no-show">No Show</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select
                    value={typeFilter}
                    onValueChange={handleTypeFilterChange}
                  >
                    <SelectTrigger className="w-[130px]">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="in-person">In-Person</SelectItem>
                      <SelectItem value="video">Video</SelectItem>
                      <SelectItem value="phone">Phone</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <TabsContent key="upcoming" value="upcoming" className="mt-0">
                <Card className="overflow-hidden">
                  <div>{renderAppointmentList()}</div>
                </Card>
              </TabsContent>

              <TabsContent key="today" value="today" className="mt-0">
                <Card className="overflow-hidden">
                  {renderAppointmentList()}
                </Card>
              </TabsContent>

              <TabsContent key="past" value="past" className="mt-0">
                <Card className="overflow-hidden">
                  {renderAppointmentList()}
                </Card>
              </TabsContent>

              <TabsContent key="all" value="all" className="mt-0">
                <Card className="overflow-hidden">
                  {renderAppointmentList()}
                </Card>
              </TabsContent>

              <TabsContent key="day" value="day" className="mt-0">
                <Card className="overflow-hidden">
                  {renderAppointmentList()}
                </Card>
              </TabsContent>

              {/* Pagination */}
              {totalPages > 1 && (
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                      />
                    </PaginationItem>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (p) => (
                        <PaginationItem key={p}>
                          <PaginationLink
                            isActive={page === p}
                            onClick={() => setPage(p)}
                          >
                            {p}
                          </PaginationLink>
                        </PaginationItem>
                      )
                    )}
                    <PaginationItem>
                      <PaginationNext
                        onClick={() =>
                          setPage((p) => Math.min(totalPages, p + 1))
                        }
                        disabled={page === totalPages}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
            </div>

            <div className="space-y-6">
              {activeTab === "day" && (
                <Card className="p-4">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={handleDateSelect}
                    className="rounded-md"
                    modifiers={{
                      hasAppointment: (date) => {
                        return appointmentDates[date.toDateString()] > 0;
                      },
                    }}
                    modifiersStyles={{
                      hasAppointment: {
                        fontWeight: "bold",
                        backgroundColor: "rgba(59, 130, 246, 0.1)",
                        borderRadius: "100%",
                      },
                    }}
                  />
                </Card>
              )}

              <Card className="p-4">
                <div className="flex items-center mb-4">
                  <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 mr-3">
                    <CalendarIcon className="h-5 w-5" />
                  </div>
                  <h3 className="font-medium">Appointment Summary</h3>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">
                      Today
                    </span>
                    <span className="font-medium">
                      {
                        appointments.filter((apt) =>
                          isToday(new Date(apt.appointmentDate))
                        ).length
                      }
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">
                      Upcoming
                    </span>
                    <span className="font-medium">
                      {
                        appointments.filter(
                          (apt) =>
                            isFuture(new Date(apt.appointmentDate)) &&
                            !isToday(new Date(apt.appointmentDate)) &&
                            apt.status === "scheduled"
                        ).length
                      }
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">
                      This Week
                    </span>
                    <span className="font-medium">
                      {
                        appointments.filter((apt) => {
                          const aptDate = new Date(apt.appointmentDate);
                          const today = new Date();
                          const endOfWeek = new Date();
                          endOfWeek.setDate(
                            today.getDate() + (7 - today.getDay())
                          );
                          return aptDate >= today && aptDate <= endOfWeek;
                        }).length
                      }
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">
                      Total
                    </span>
                    <span className="font-medium">{appointments.length}</span>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center mb-4">
                  <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 mr-3">
                    <Filter className="h-5 w-5" />
                  </div>
                  <h3 className="font-medium">By Status</h3>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">
                      Scheduled
                    </span>
                    <span className="font-medium">
                      {
                        appointments.filter((apt) => apt.status === "scheduled")
                          .length
                      }
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">
                      Completed
                    </span>
                    <span className="font-medium">
                      {
                        appointments.filter((apt) => apt.status === "completed")
                          .length
                      }
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">
                      Cancelled
                    </span>
                    <span className="font-medium">
                      {
                        appointments.filter((apt) => apt.status === "cancelled")
                          .length
                      }
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">
                      No-Show
                    </span>
                    <span className="font-medium">
                      {
                        appointments.filter((apt) => apt.status === "no-show")
                          .length
                      }
                    </span>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center mb-4">
                  <div className="p-2 rounded-full bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 mr-3">
                    <Video className="h-5 w-5" />
                  </div>
                  <h3 className="font-medium">By Type</h3>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">
                      In-Person
                    </span>
                    <span className="font-medium">
                      {
                        appointments.filter(
                          (apt) => apt.appointmentType === "in-person"
                        ).length
                      }
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">
                      Video
                    </span>
                    <span className="font-medium">
                      {
                        appointments.filter(
                          (apt) => apt.appointmentType === "video"
                        ).length
                      }
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">
                      Phone
                    </span>
                    <span className="font-medium">
                      {
                        appointments.filter(
                          (apt) => apt.appointmentType === "phone"
                        ).length
                      }
                    </span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
