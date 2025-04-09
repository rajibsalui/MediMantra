"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import {
  Calendar as CalendarIcon,
  Clock,
  ChevronRight,
  CheckCircle2,
  XCircle,
  AlertCircle,
  PlusCircle,
} from "lucide-react";

export default function AppointmentCalendar({ appointments = [], loading = false }) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [dateAppointments, setDateAppointments] = useState([]);
  const [activeTab, setActiveTab] = useState("day");

  useEffect(() => {
    if (appointments.length > 0) {
      filterAppointmentsByDate(selectedDate);
    }
  }, [appointments, selectedDate]);

  const filterAppointmentsByDate = (date) => {
    const filtered = appointments.filter((appointment) => {
      const appointmentDate = new Date(appointment.appointmentDate);
      return (
        appointmentDate.getDate() === date.getDate() &&
        appointmentDate.getMonth() === date.getMonth() &&
        appointmentDate.getFullYear() === date.getFullYear()
      );
    });

    // Sort by time
    filtered.sort((a, b) => {
      return new Date(a.startTime) - new Date(b.startTime);
    });

    setDateAppointments(filtered);
  };

  // Function to get dates with appointments for highlighting in calendar
  const getAppointmentDates = () => {
    const dates = {};
    appointments.forEach((appointment) => {
      const date = new Date(appointment.appointmentDate).toDateString();
      if (!dates[date]) {
        dates[date] = 0;
      }
      dates[date]++;
    });
    return dates;
  };

  const appointmentDates = getAppointmentDates();

  // Function to get status badge color
  const getStatusBadge = (status) => {
    switch (status) {
      case "completed":
        return (
          <Badge className="bg-green-100 text-green-800 border border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Completed
          </Badge>
        );
      case "cancelled":
        return (
          <Badge className="bg-red-100 text-red-800 border border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800">
            <XCircle className="w-3 h-3 mr-1" />
            Cancelled
          </Badge>
        );
      case "scheduled":
        return (
          <Badge className="bg-blue-100 text-blue-800 border border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800">
            <Clock className="w-3 h-3 mr-1" />
            Scheduled
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-100 text-gray-800 border border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700">
            <AlertCircle className="w-3 h-3 mr-1" />
            {status}
          </Badge>
        );
    }
  };

  const renderAppointmentList = () => {
    if (loading) {
      return Array(3)
        .fill(0)
        .map((_, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="ml-4">
                <Skeleton className="h-4 w-32 mb-2" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
            <Skeleton className="h-8 w-20" />
          </div>
        ));
    }

    if (dateAppointments.length === 0) {
      return (
        <div className="text-center py-8">
          <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
            <CalendarIcon className="h-8 w-8 text-gray-400 dark:text-gray-500" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">
            No appointments for this date
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Select a different date or create a new appointment
          </p>
          <Link href="/doctor/appointments/new">
            <Button size="sm">
              <PlusCircle className="w-4 h-4 mr-2" />
              New Appointment
            </Button>
          </Link>
        </div>
      );
    }

    return dateAppointments.map((appointment) => (
      <div
        key={appointment._id}
        className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
      >
        <div className="flex items-center">
          <Avatar className="h-10 w-10">
            <AvatarImage
              src={
                appointment.patient?.profilePicture || "/placeholder-patient.png"
              }
            />
            <AvatarFallback>
              {appointment.patient?.firstName?.[0]}
              {appointment.patient?.lastName?.[0]}
            </AvatarFallback>
          </Avatar>
          <div className="ml-4">
            <h3 className="font-medium text-gray-900 dark:text-gray-100">
              {appointment.patient?.firstName} {appointment.patient?.lastName}
            </h3>
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
              <Clock className="w-3 h-3 mr-1" />
              <span>
                {new Date(appointment.startTime).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
                {" - "}
                {new Date(appointment.endTime).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
              <span className="mx-2">•</span>
              <span>{appointment.appointmentType}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {getStatusBadge(appointment.status)}
          <Link href={`/doctor/appointments/${appointment._id}`}>
            <Button variant="ghost" size="sm" className="rounded-full">
              <ChevronRight className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    ));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold flex items-center">
          <CalendarIcon className="w-5 h-5 mr-2 text-blue-500" />
          Appointment Calendar
        </h2>
        <Link href="/doctor/appointments/new">
          <Button size="sm">
            <PlusCircle className="w-4 h-4 mr-2" />
            New Appointment
          </Button>
        </Link>
      </div>

      <Tabs
        defaultValue="day"
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList key="tabs-list" className="grid grid-cols-3 mb-4">
          <TabsTrigger value="day" className="flex items-center">
            <CalendarIcon className="w-4 h-4 mr-2" />
            Day View
          </TabsTrigger>
          <TabsTrigger value="week" className="flex items-center">
            <CalendarIcon className="w-4 h-4 mr-2" />
            Week View
          </TabsTrigger>
          <TabsTrigger value="month" className="flex items-center">
            <CalendarIcon className="w-4 h-4 mr-2" />
            Month View
          </TabsTrigger>
        </TabsList>

        <TabsContent value="day" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-4 md:col-span-1">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
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
              <div className="mt-4">
                <h3 className="font-medium mb-2">Selected Date</h3>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {selectedDate.toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </div>
                <div className="mt-2 text-sm">
                  <span className="font-medium">
                    {dateAppointments.length} appointment
                    {dateAppointments.length !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>
            </Card>

            <Card className="md:col-span-2 overflow-hidden">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="font-medium">
                  Appointments for{" "}
                  {selectedDate.toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                  })}
                </h3>
              </div>
              {renderAppointmentList()}
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="week" className="mt-0">
          <Card className="p-4">
            <div className="text-center py-8">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">
                Week View Coming Soon
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                This feature is under development
              </p>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="month" className="mt-0">
          <Card className="p-4">
            <div className="text-center py-8">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">
                Month View Coming Soon
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                This feature is under development
              </p>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center mb-2">
            <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 mr-3">
              <CalendarIcon className="h-5 w-5" />
            </div>
            <h3 className="font-medium">Total</h3>
          </div>
          <div className="text-2xl font-bold">{appointments.length}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            All appointments
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center mb-2">
            <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 mr-3">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <h3 className="font-medium">Completed</h3>
          </div>
          <div className="text-2xl font-bold">
            {
              appointments.filter(
                (appointment) => appointment.status === "completed"
              ).length
            }
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Completed appointments
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center mb-2">
            <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 mr-3">
              <Clock className="h-5 w-5" />
            </div>
            <h3 className="font-medium">Scheduled</h3>
          </div>
          <div className="text-2xl font-bold">
            {
              appointments.filter(
                (appointment) => appointment.status === "scheduled"
              ).length
            }
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Upcoming appointments
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center mb-2">
            <div className="p-2 rounded-full bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 mr-3">
              <XCircle className="h-5 w-5" />
            </div>
            <h3 className="font-medium">Cancelled</h3>
          </div>
          <div className="text-2xl font-bold">
            {
              appointments.filter(
                (appointment) => appointment.status === "cancelled"
              ).length
            }
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Cancelled appointments
          </div>
        </Card>
      </div>
    </div>
  );
}
