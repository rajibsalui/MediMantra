"use client";

import React, { useState, useEffect, Suspense } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useDoctor } from "@/contexts/DoctorContext";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  CalendarDays,
  Users,
  Star,
  Clock,
  TrendingUp,
  Stethoscope,
  CreditCard,
  Calendar,
  FileText,
  Pill,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";
import { AnimatedTooltip } from "@/components/ui/animated-tooltip";
import { SparklesCore } from "@/components/ui/sparkles";
import { CardSpotlight } from "@/components/ui/card-spotlight";
import { Badge } from "@/components/ui/badge";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { API_URL, SOCKET_URL } from '@/config/environment';



export default function DoctorDashboard() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const {
    doctor,
    appointments,
    dashboardStats,
    loading,
    getDoctorProfile,
    getDoctorAppointments,
    getDashboardStats,
  } = useDoctor();

  const [todayAppointments, setTodayAppointments] = useState([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [recentPatients, setRecentPatients] = useState([]);
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  // Handle theme detection after mounting
  useEffect(() => {
    setMounted(true);

    // Check if user has a theme preference stored
    const savedTheme = localStorage.getItem("theme");
    if (
      savedTheme === "dark" ||
      (!savedTheme && window.matchMedia("(prefers-color-scheme: dark)").matches)
    ) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  // Toggle theme function
  const toggleTheme = () => {
    const isDark = document.documentElement.classList.toggle("dark");
    localStorage.setItem("theme", isDark ? "dark" : "light");
  };

  // Check for token on component mount
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      toast.error("Authentication required. Please log in.");
      router.push("/doctor/login");
    }
  }, [router]);

  // Redirect if not authenticated or not a doctor
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast.error("Please sign in to access your dashboard");
      router.push("/");
    }

    if (!authLoading && isAuthenticated && user?.role !== "doctor") {
      toast.error("Unauthorized access. This dashboard is for doctors only.");
      router.push("/");
    }
  }, [isAuthenticated, user, authLoading, router]);

  // Fetch doctor data when authenticated
  useEffect(() => {
    const loadDoctorData = async () => {
      if (isAuthenticated && user?.role === "doctor") {
        try {
          // Load doctor profile if not already loaded
          if (!doctor) {
            await getDoctorProfile();
          }

          // Load appointments and dashboard stats
          await Promise.all([getDoctorAppointments(), getDashboardStats()]);
        } catch (error) {
          console.error("Error loading doctor data:", error);
          toast.error("Failed to load dashboard data");
        }
      }
    };

    loadDoctorData();
  }, [isAuthenticated, user]);

  // Process appointments
  useEffect(() => {
    if (appointments?.length > 0) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      setTodayAppointments(
        appointments
          .filter((apt) => {
            const aptDate = new Date(apt.appointmentDate);
            return aptDate >= today && aptDate < tomorrow;
          })
          .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
      );

      // Get upcoming appointments (excluding today)
      setUpcomingAppointments(
        appointments
          .filter((apt) => {
            const aptDate = new Date(apt.appointmentDate);
            return aptDate > tomorrow;
          })
          .sort(
            (a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate)
          )
          .slice(0, 5)
      );

      // Get recent patients (unique)
      const uniquePatients = [];
      const patientIds = new Set();

      appointments.forEach((apt) => {
        if (!patientIds.has(apt.patient._id)) {
          patientIds.add(apt.patient._id);
          uniquePatients.push(apt.patient);
        }
      });

      setRecentPatients(uniquePatients.slice(0, 5));
    }
  }, [appointments]);

  // Import the components we created
  const AnalyticsDashboard = dynamic(() => import('@/components/doctor/AnalyticsDashboard'));
  const PatientManagement = dynamic(() => import('@/components/doctor/PatientManagement'));
  const AppointmentCalendar = dynamic(() => import('@/components/doctor/AppointmentCalendar'));
  const PrescriptionManagement = dynamic(() => import('@/components/doctor/PrescriptionManagement'));
  const MedicalRecordManagement = dynamic(() => import('@/components/doctor/MedicalRecordManagement'));
  const ScheduleManager = dynamic(() => import('@/components/doctor/ScheduleManager'));

  // If loading, show skeleton
  if (authLoading || loading || !doctor || !mounted) {
    return <DashboardSkeleton />;
  }

  return (
    <DashboardLayout>
    <div
      className={`min-h-screen ${
        document.documentElement.classList.contains("dark")
          ? "bg-gradient-to-b from-gray-950 to-gray-900"
          : "bg-gradient-to-b from-gray-50 to-white"
      } transition-colors duration-200`}
    >
      {/* Sparkles background effect with reduced opacity */}
      <div className="fixed inset-0 pointer-events-none">
        <SparklesCore
          id="tsparticles"
          background="transparent"
          minSize={0.4}
          maxSize={1.0}
          particleDensity={8}
          className="w-full h-full"
          particleColor={
            document.documentElement.classList.contains("dark")
              ? "#3b82f6"
              : "#60a5fa"
          }
          opacity={0.15}
        />
      </div>

      {/* Main content */}
      <div className="relative z-10 p-4 md:p-8 max-w-7xl mx-auto">
        {/* Welcome header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                <span
                  className={`bg-clip-text text-transparent ${
                    document.documentElement.classList.contains("dark")
                      ? "bg-gradient-to-r from-blue-400 to-indigo-300"
                      : "bg-gradient-to-r from-blue-700 to-indigo-600"
                  }`}
                >
                  Welcome back, Dr. {doctor.user?.firstName || user?.firstName}
                </span>
              </h1>
              <p
                className={`${
                  document.documentElement.classList.contains("dark")
                    ? "text-gray-400"
                    : "text-gray-600"
                } mt-1`}
              >
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>

            <div className="mt-4 md:mt-0 flex items-center space-x-4">
              <Badge
                variant={doctor.isVerified ? "success" : "warning"}
                className={`h-8 px-3 font-medium ${
                  doctor.isVerified
                    ? "bg-green-100 text-green-800 border border-green-200 dark:bg-green-800/50 dark:text-green-200 dark:border-green-700"
                    : "bg-amber-100 text-amber-800 border border-amber-200 dark:bg-amber-800/50 dark:text-amber-200 dark:border-amber-700"
                }`}
              >
                {doctor.isVerified ? "Verified" : "Pending Verification"}
              </Badge>

              <div className="relative">
                <div
                  className={`absolute w-3 h-3 bg-emerald-500 rounded-full top-0 right-0 ring-2 ${
                    document.documentElement.classList.contains("dark")
                      ? "ring-gray-900"
                      : "ring-white"
                  }`}
                ></div>
                <Avatar className="w-12 h-12 border-2 border-blue-500 shadow-lg">
                  <AvatarImage
                    src={
                      doctor.user?.profilePicture || "/placeholder-doctor.png"
                    }
                    alt="Doctor"
                  />
                  <AvatarFallback
                    className={`${
                      document.documentElement.classList.contains("dark")
                        ? "bg-gray-800 text-gray-200"
                        : "bg-blue-100 text-blue-700"
                    } font-medium`}
                  >
                    {doctor.user?.firstName?.[0] || user?.firstName?.[0]}
                    {doctor.user?.lastName?.[0] || user?.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
              </div>

              <Button
                variant="outline"
                size="icon"
                onClick={toggleTheme}
                className="rounded-full bg-white text-gray-800 border-gray-200 hover:bg-gray-100 shadow-sm
             dark:bg-gray-800/80 dark:text-gray-200 dark:border-gray-700 dark:hover:bg-gray-700 dark:shadow-inner"
              >
                {/* Sun icon (shows in dark mode) */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="hidden dark:block"
                >
                  <circle cx="12" cy="12" r="5"></circle>
                  <line x1="12" y1="1" x2="12" y2="3"></line>
                  <line x1="12" y1="21" x2="12" y2="23"></line>
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                  <line x1="1" y1="12" x2="3" y2="12"></line>
                  <line x1="21" y1="12" x2="23" y2="12"></line>
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                </svg>
                {/* Moon icon (shows in light mode) */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="block dark:hidden"
                >
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 A7 7 0 0 0 21 12.79z"></path>
                </svg>
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Dashboard Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList key="tabs-list" className="grid grid-cols-3 md:grid-cols-6 gap-2 mb-4">
            <TabsTrigger value="overview" className="flex items-center justify-center">
              <CalendarDays className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="patients" className="flex items-center justify-center">
              <Users className="w-4 h-4 mr-2" />
              Patients
            </TabsTrigger>
            <TabsTrigger value="appointments" className="flex items-center justify-center">
              <Calendar className="w-4 h-4 mr-2" />
              Appointments
            </TabsTrigger>
            <TabsTrigger value="prescriptions" className="flex items-center justify-center">
              <Pill className="w-4 h-4 mr-2" />
              Prescriptions
            </TabsTrigger>
            <TabsTrigger value="records" className="flex items-center justify-center">
              <FileText className="w-4 h-4 mr-2" />
              Records
            </TabsTrigger>
            <TabsTrigger value="schedule" className="flex items-center justify-center">
              <Clock className="w-4 h-4 mr-2" />
              Schedule
            </TabsTrigger>
          </TabsList>

          {/* Tab Content */}
          <TabsContent value="overview" className="mt-0">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <CardSpotlight
                  className={`h-full ${
                    document.documentElement.classList.contains("dark")
                      ? "bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700/50 shadow-md shadow-blue-900/10"
                      : "bg-white"
                  } rounded-xl p-6`}
                  glareColor={
                    document.documentElement.classList.contains("dark")
                      ? "rgba(59, 130, 246, 0.2)"
                      : "rgba(59, 130, 246, 0.15)"
                  }
                  borderColor={
                    document.documentElement.classList.contains("dark")
                      ? "rgba(59, 130, 246, 0.2)"
                      : "rgba(59, 130, 246, 0.15)"
                  }
                >
                  <div className="flex items-center">
                    <div
                      className={`rounded-lg ${
                        document.documentElement.classList.contains("dark")
                          ? "bg-blue-500/10 ring-1 ring-blue-600/20"
                          : "bg-blue-100"
                      } p-3 mr-4`}
                    >
                      <CalendarDays
                        className={`w-6 h-6 ${
                          document.documentElement.classList.contains("dark")
                            ? "text-blue-400"
                            : "text-blue-600"
                        }`}
                      />
                    </div>
                    <div>
                      <p
                        className={`text-sm ${
                          document.documentElement.classList.contains("dark")
                            ? "text-gray-400"
                            : "text-gray-500"
                        } font-medium`}
                      >
                        Today's Appointments
                      </p>
                      <h3
                        className={`text-2xl font-bold ${
                          document.documentElement.classList.contains("dark")
                            ? "text-white"
                            : "text-gray-900"
                        }`}
                      >
                        {todayAppointments.length}
                      </h3>
                    </div>
                  </div>
                </CardSpotlight>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <CardSpotlight
                  className={`h-full ${
                    document.documentElement.classList.contains("dark")
                      ? "bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700/50 shadow-md shadow-green-900/10"
                      : "bg-white"
                  } rounded-xl p-6`}
                  glareColor={
                    document.documentElement.classList.contains("dark")
                      ? "rgba(34, 197, 94, 0.2)"
                      : "rgba(34, 197, 94, 0.15)"
                  }
                  borderColor={
                    document.documentElement.classList.contains("dark")
                      ? "rgba(34, 197, 94, 0.2)"
                      : "rgba(34, 197, 94, 0.15)"
                  }
                >
                  <div className="flex items-center">
                    <div
                      className={`rounded-lg ${
                        document.documentElement.classList.contains("dark")
                          ? "bg-green-500/10 ring-1 ring-green-600/20"
                          : "bg-green-100"
                      } p-3 mr-4`}
                    >
                      <Users
                        className={`w-6 h-6 ${
                          document.documentElement.classList.contains("dark")
                            ? "text-green-400"
                            : "text-green-600"
                        }`}
                      />
                    </div>
                    <div>
                      <p
                        className={`text-sm ${
                          document.documentElement.classList.contains("dark")
                            ? "text-gray-400"
                            : "text-gray-500"
                        } font-medium`}
                      >
                        Total Patients
                      </p>
                      <h3
                        className={`text-2xl font-bold ${
                          document.documentElement.classList.contains("dark")
                            ? "text-white"
                            : "text-gray-900"
                        }`}
                      >
                        {dashboardStats?.totalPatients || 0}
                      </h3>
                    </div>
                  </div>
                </CardSpotlight>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.3 }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <CardSpotlight
                  className={`h-full ${
                    document.documentElement.classList.contains("dark")
                      ? "bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700/50 shadow-md shadow-violet-900/10"
                      : "bg-white"
                  } rounded-xl p-6`}
                  glareColor={
                    document.documentElement.classList.contains("dark")
                      ? "rgba(139, 92, 246, 0.2)"
                      : "rgba(139, 92, 246, 0.15)"
                  }
                  borderColor={
                    document.documentElement.classList.contains("dark")
                      ? "rgba(139, 92, 246, 0.2)"
                      : "rgba(139, 92, 246, 0.15)"
                  }
                >
                  <div className="flex items-center">
                    <div
                      className={`rounded-lg ${
                        document.documentElement.classList.contains("dark")
                          ? "bg-violet-500/10 ring-1 ring-violet-600/20"
                          : "bg-purple-100"
                      } p-3 mr-4`}
                    >
                      <Star
                        className={`w-6 h-6 ${
                          document.documentElement.classList.contains("dark")
                            ? "text-violet-400"
                            : "text-purple-600"
                        }`}
                      />
                    </div>
                    <div>
                      <p
                        className={`text-sm ${
                          document.documentElement.classList.contains("dark")
                            ? "text-gray-400"
                            : "text-gray-500"
                        } font-medium`}
                      >
                        Rating
                      </p>
                      <div className="flex items-baseline">
                        <h3
                          className={`text-2xl font-bold ${
                            document.documentElement.classList.contains("dark")
                              ? "text-white"
                              : "text-gray-900"
                          }`}
                        >
                          {doctor.averageRating?.toFixed(1) || "N/A"}
                        </h3>
                        <span
                          className={`ml-1 text-sm ${
                            document.documentElement.classList.contains("dark")
                              ? "text-gray-400"
                              : "text-gray-500"
                          }`}
                        >
                          / 5
                        </span>
                      </div>
                    </div>
                  </div>
                </CardSpotlight>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.4 }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <CardSpotlight
                  className={`h-full ${
                    document.documentElement.classList.contains("dark")
                      ? "bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700/50 shadow-md shadow-amber-900/10"
                      : "bg-white"
                  } rounded-xl p-6`}
                  glareColor={
                    document.documentElement.classList.contains("dark")
                      ? "rgba(245, 158, 11, 0.2)"
                      : "rgba(245, 158, 11, 0.15)"
                  }
                  borderColor={
                    document.documentElement.classList.contains("dark")
                      ? "rgba(245, 158, 11, 0.2)"
                      : "rgba(245, 158, 11, 0.15)"
                  }
                >
                  <div className="flex items-center">
                    <div
                      className={`rounded-lg ${
                        document.documentElement.classList.contains("dark")
                          ? "bg-amber-500/10 ring-1 ring-amber-600/20"
                          : "bg-amber-100"
                      } p-3 mr-4`}
                    >
                      <CreditCard
                        className={`w-6 h-6 ${
                          document.documentElement.classList.contains("dark")
                            ? "text-amber-400"
                            : "text-amber-600"
                        }`}
                      />
                    </div>
                    <div>
                      <p
                        className={`text-sm ${
                          document.documentElement.classList.contains("dark")
                            ? "text-gray-400"
                            : "text-gray-500"
                        } font-medium`}
                      >
                        Earnings (Month)
                      </p>
                      <h3
                        className={`text-2xl font-bold ${
                          document.documentElement.classList.contains("dark")
                            ? "text-white"
                            : "text-gray-900"
                        }`}
                      >
                        ₹{dashboardStats?.monthlyEarnings?.toLocaleString() || 0}
                      </h3>
                    </div>
                  </div>
                </CardSpotlight>
              </motion.div>
            </div>

            <Suspense fallback={<div className="p-12 text-center">Loading analytics...</div>}>
              <AnalyticsDashboard dashboardStats={dashboardStats} />
            </Suspense>
          </TabsContent>

          <TabsContent value="patients" className="mt-0">
            <Suspense fallback={<div className="p-12 text-center">Loading patient management...</div>}>
              <PatientManagement patients={recentPatients} loading={loading} />
            </Suspense>
          </TabsContent>

          <TabsContent value="appointments" className="mt-0">
            <Suspense fallback={<div className="p-12 text-center">Loading appointment calendar...</div>}>
              <AppointmentCalendar appointments={appointments} loading={loading} />
            </Suspense>
          </TabsContent>

          <TabsContent value="prescriptions" className="mt-0">
            <Suspense fallback={<div className="p-12 text-center">Loading prescription management...</div>}>
              <PrescriptionManagement prescriptions={[]} loading={loading} />
            </Suspense>
          </TabsContent>

          <TabsContent value="records" className="mt-0">
            <Suspense fallback={<div className="p-12 text-center">Loading medical records...</div>}>
              <MedicalRecordManagement medicalRecords={[]} loading={loading} />
            </Suspense>
          </TabsContent>

          <TabsContent value="schedule" className="mt-0">
            <Suspense fallback={<div className="p-12 text-center">Loading schedule manager...</div>}>
              <ScheduleManager availability={doctor.availability || []} loading={loading} />
            </Suspense>
          </TabsContent>
        </Tabs>

        {/* Quick Actions */}
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
          >
            <CardSpotlight
              className={`h-full ${
                document.documentElement.classList.contains("dark")
                  ? "bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700/50 shadow-md shadow-blue-900/10"
                  : "bg-white"
              } rounded-xl p-6`}
              glareColor={
                document.documentElement.classList.contains("dark")
                  ? "rgba(59, 130, 246, 0.2)"
                  : "rgba(59, 130, 246, 0.15)"
              }
              borderColor={
                document.documentElement.classList.contains("dark")
                  ? "rgba(59, 130, 246, 0.2)"
                  : "rgba(59, 130, 246, 0.15)"
              }
            >
              <div className="flex items-center">
                <div
                  className={`rounded-lg ${
                    document.documentElement.classList.contains("dark")
                      ? "bg-blue-500/10 ring-1 ring-blue-600/20"
                      : "bg-blue-100"
                  } p-3 mr-4`}
                >
                  <CalendarDays
                    className={`w-6 h-6 ${
                      document.documentElement.classList.contains("dark")
                        ? "text-blue-400"
                        : "text-blue-600"
                    }`}
                  />
                </div>
                <div>
                  <p
                    className={`text-sm ${
                      document.documentElement.classList.contains("dark")
                        ? "text-gray-400"
                        : "text-gray-500"
                    } font-medium`}
                  >
                    Today's Appointments
                  </p>
                  <h3
                    className={`text-2xl font-bold ${
                      document.documentElement.classList.contains("dark")
                        ? "text-white"
                        : "text-gray-900"
                    }`}
                  >
                    {todayAppointments.length}
                  </h3>
                </div>
              </div>
            </CardSpotlight>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
          >
            <CardSpotlight
              className={`h-full ${
                document.documentElement.classList.contains("dark")
                  ? "bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700/50 shadow-md shadow-green-900/10"
                  : "bg-white"
              } rounded-xl p-6`}
              glareColor={
                document.documentElement.classList.contains("dark")
                  ? "rgba(34, 197, 94, 0.2)"
                  : "rgba(34, 197, 94, 0.15)"
              }
              borderColor={
                document.documentElement.classList.contains("dark")
                  ? "rgba(34, 197, 94, 0.2)"
                  : "rgba(34, 197, 94, 0.15)"
              }
            >
              <div className="flex items-center">
                <div
                  className={`rounded-lg ${
                    document.documentElement.classList.contains("dark")
                      ? "bg-green-500/10 ring-1 ring-green-600/20"
                      : "bg-green-100"
                  } p-3 mr-4`}
                >
                  <Users
                    className={`w-6 h-6 ${
                      document.documentElement.classList.contains("dark")
                        ? "text-green-400"
                        : "text-green-600"
                    }`}
                  />
                </div>
                <div>
                  <p
                    className={`text-sm ${
                      document.documentElement.classList.contains("dark")
                        ? "text-gray-400"
                        : "text-gray-500"
                    } font-medium`}
                  >
                    Total Patients
                  </p>
                  <h3
                    className={`text-2xl font-bold ${
                      document.documentElement.classList.contains("dark")
                        ? "text-white"
                        : "text-gray-900"
                    }`}
                  >
                    {dashboardStats?.totalPatients || 0}
                  </h3>
                </div>
              </div>
            </CardSpotlight>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
          >
            <CardSpotlight
              className={`h-full ${
                document.documentElement.classList.contains("dark")
                  ? "bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700/50 shadow-md shadow-violet-900/10"
                  : "bg-white"
              } rounded-xl p-6`}
              glareColor={
                document.documentElement.classList.contains("dark")
                  ? "rgba(139, 92, 246, 0.2)"
                  : "rgba(139, 92, 246, 0.15)"
              }
              borderColor={
                document.documentElement.classList.contains("dark")
                  ? "rgba(139, 92, 246, 0.2)"
                  : "rgba(139, 92, 246, 0.15)"
              }
            >
              <div className="flex items-center">
                <div
                  className={`rounded-lg ${
                    document.documentElement.classList.contains("dark")
                      ? "bg-violet-500/10 ring-1 ring-violet-600/20"
                      : "bg-purple-100"
                  } p-3 mr-4`}
                >
                  <Star
                    className={`w-6 h-6 ${
                      document.documentElement.classList.contains("dark")
                        ? "text-violet-400"
                        : "text-purple-600"
                    }`}
                  />
                </div>
                <div>
                  <p
                    className={`text-sm ${
                      document.documentElement.classList.contains("dark")
                        ? "text-gray-400"
                        : "text-gray-500"
                    } font-medium`}
                  >
                    Rating
                  </p>
                  <div className="flex items-baseline">
                    <h3
                      className={`text-2xl font-bold ${
                        document.documentElement.classList.contains("dark")
                          ? "text-white"
                          : "text-gray-900"
                      }`}
                    >
                      {doctor.averageRating?.toFixed(1) || "N/A"}
                    </h3>
                    <span
                      className={`ml-1 text-sm ${
                        document.documentElement.classList.contains("dark")
                          ? "text-gray-400"
                          : "text-gray-500"
                      }`}
                    >
                      / 5
                    </span>
                  </div>
                </div>
              </div>
            </CardSpotlight>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
          >
            <CardSpotlight
              className={`h-full ${
                document.documentElement.classList.contains("dark")
                  ? "bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700/50 shadow-md shadow-amber-900/10"
                  : "bg-white"
              } rounded-xl p-6`}
              glareColor={
                document.documentElement.classList.contains("dark")
                  ? "rgba(245, 158, 11, 0.2)"
                  : "rgba(245, 158, 11, 0.15)"
              }
              borderColor={
                document.documentElement.classList.contains("dark")
                  ? "rgba(245, 158, 11, 0.2)"
                  : "rgba(245, 158, 11, 0.15)"
              }
            >
              <div className="flex items-center">
                <div
                  className={`rounded-lg ${
                    document.documentElement.classList.contains("dark")
                      ? "bg-amber-500/10 ring-1 ring-amber-600/20"
                      : "bg-amber-100"
                  } p-3 mr-4`}
                >
                  <CreditCard
                    className={`w-6 h-6 ${
                      document.documentElement.classList.contains("dark")
                        ? "text-amber-400"
                        : "text-amber-600"
                    }`}
                  />
                </div>
                <div>
                  <p
                    className={`text-sm ${
                      document.documentElement.classList.contains("dark")
                        ? "text-gray-400"
                        : "text-gray-500"
                    } font-medium`}
                  >
                    Earnings (Month)
                  </p>
                  <h3
                    className={`text-2xl font-bold ${
                      document.documentElement.classList.contains("dark")
                        ? "text-white"
                        : "text-gray-900"
                    }`}
                  >
                    ₹{dashboardStats?.monthlyEarnings?.toLocaleString() || 0}
                  </h3>
                </div>
              </div>
            </CardSpotlight>
          </motion.div>
        </div>

        {/* Recent Activities and Upcoming Appointments */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Today's Appointments */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.5 }}
            className="lg:col-span-2"
          >
            <Card
              className={`${
                document.documentElement.classList.contains("dark")
                  ? "bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700/50 shadow-lg shadow-black/20"
                  : "bg-white shadow-md"
              } rounded-xl overflow-hidden`}
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-5">
                  <h2
                    className={`text-xl font-bold flex items-center ${
                      document.documentElement.classList.contains("dark")
                        ? "text-white"
                        : "text-gray-900"
                    }`}
                  >
                    <Calendar
                      className={`w-5 h-5 mr-2 ${
                        document.documentElement.classList.contains("dark")
                          ? "text-blue-400"
                          : "text-blue-600"
                      }`}
                    />
                    Today's Appointments
                  </h2>
                  <Link href="/doctor/appointments">
                    <Button
                      variant={
                        document.documentElement.classList.contains("dark")
                          ? "ghost"
                          : "ghost"
                      }
                      size="sm"
                      className={
                        document.documentElement.classList.contains("dark")
                          ? "text-blue-400 hover:text-blue-300 hover:bg-blue-900/20"
                          : "text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      }
                    >
                      View All
                    </Button>
                  </Link>
                </div>

                {todayAppointments.length === 0 ? (
                  <div className="text-center py-12">
                    <div
                      className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center ${
                        document.documentElement.classList.contains("dark")
                          ? "bg-gray-700"
                          : "bg-gray-100"
                      }`}
                    >
                      <Clock
                        className={`w-8 h-8 ${
                          document.documentElement.classList.contains("dark")
                            ? "text-gray-500"
                            : "text-gray-400"
                        }`}
                      />
                    </div>
                    <p
                      className={`mt-3 text-sm font-medium ${
                        document.documentElement.classList.contains("dark")
                          ? "text-gray-400"
                          : "text-gray-500"
                      }`}
                    >
                      No appointments scheduled for today
                    </p>
                    <Link href="/doctor/appointments/new">
                      <Button
                        variant="outline"
                        size="sm"
                        className={`mt-3 ${
                          document.documentElement.classList.contains("dark")
                            ? "border-gray-600 text-gray-300 hover:bg-gray-700"
                            : "border-gray-200 text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        Create Appointment
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {todayAppointments.map((appointment, index) => (
                      <motion.div
                        key={appointment._id || index}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.2, delay: index * 0.05 }}
                        whileHover={{ x: 4 }}
                        className={`${
                          document.documentElement.classList.contains("dark")
                            ? "bg-gray-800/70 hover:bg-gray-750 ring-1 ring-gray-700/50"
                            : "bg-gray-50 hover:bg-gray-100"
                        } rounded-lg p-4 flex items-center justify-between transition-colors`}
                      >
                        <div className="flex items-center">
                          <Avatar
                            className={`w-10 h-10 mr-3 ${
                              document.documentElement.classList.contains(
                                "dark"
                              )
                                ? "ring-2 ring-gray-700"
                                : "ring-2 ring-white"
                            }`}
                          >
                            <AvatarImage
                              src={
                                appointment.patient?.profilePicture ||
                                "/placeholder-patient.png"
                              }
                            />
                            <AvatarFallback
                              className={
                                document.documentElement.classList.contains(
                                  "dark"
                                )
                                  ? "bg-gray-700 text-gray-300"
                                  : "bg-gray-200 text-gray-600"
                              }
                            >
                              {appointment.patient?.firstName?.[0]}
                              {appointment.patient?.lastName?.[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3
                              className={`font-medium ${
                                document.documentElement.classList.contains(
                                  "dark"
                                )
                                  ? "text-white"
                                  : "text-gray-900"
                              }`}
                            >
                              {appointment.patient?.firstName}{" "}
                              {appointment.patient?.lastName}
                            </h3>
                            <div className="flex items-center">
                              <span
                                className={`text-sm ${
                                  document.documentElement.classList.contains(
                                    "dark"
                                  )
                                    ? "text-gray-400"
                                    : "text-gray-500"
                                }`}
                              >
                                {new Date(
                                  appointment.startTime
                                ).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                                {" - "}
                                {new Date(
                                  appointment.endTime
                                ).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                              <span
                                className={`inline-block w-1.5 h-1.5 rounded-full mx-2 ${
                                  document.documentElement.classList.contains(
                                    "dark"
                                  )
                                    ? "bg-gray-600"
                                    : "bg-gray-300"
                                }`}
                              ></span>
                              <span
                                className={`text-sm ${
                                  document.documentElement.classList.contains(
                                    "dark"
                                  )
                                    ? "text-gray-400"
                                    : "text-gray-500"
                                }`}
                              >
                                {appointment.appointmentType}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge
                            className={
                              appointment.status === "confirmed"
                                ? `${
                                    document.documentElement.classList.contains(
                                      "dark"
                                    )
                                      ? "bg-green-900/60 text-green-300 border border-green-800"
                                      : "bg-green-100 text-green-800 border border-green-200"
                                  }`
                                : appointment.status === "cancelled"
                                ? `${
                                    document.documentElement.classList.contains(
                                      "dark"
                                    )
                                      ? "bg-red-900/60 text-red-300 border border-red-800"
                                      : "bg-red-100 text-red-800 border border-red-200"
                                  }`
                                : `${
                                    document.documentElement.classList.contains(
                                      "dark"
                                    )
                                      ? "bg-blue-900/60 text-blue-300 border border-blue-800"
                                      : "bg-blue-100 text-blue-800 border border-blue-200"
                                  }`
                            }
                          >
                            {appointment.status}
                          </Badge>
                          <Link
                            href={`/doctor/appointments/${appointment._id}`}
                          >
                            <Button
                              size="icon"
                              variant="ghost"
                              className={`h-8 w-8 rounded-full ${
                                document.documentElement.classList.contains(
                                  "dark"
                                )
                                  ? "hover:bg-gray-700 text-gray-400 hover:text-gray-200"
                                  : "hover:bg-gray-200 text-gray-500 hover:text-gray-700"
                              }`}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path d="M9 18l6-6-6-6"></path>
                              </svg>
                            </Button>
                          </Link>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          </motion.div>

          {/* Recent Patients */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.6 }}
          >
            <Card
              className={`h-full ${
                document.documentElement.classList.contains("dark")
                  ? "bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700/50 shadow-lg shadow-black/20"
                  : "bg-white shadow-md"
              } rounded-xl`}
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-5">
                  <h2
                    className={`text-xl font-bold flex items-center ${
                      document.documentElement.classList.contains("dark")
                        ? "text-white"
                        : "text-gray-900"
                    }`}
                  >
                    <Users
                      className={`w-5 h-5 mr-2 ${
                        document.documentElement.classList.contains("dark")
                          ? "text-blue-400"
                          : "text-blue-600"
                      }`}
                    />
                    Recent Patients
                  </h2>
                  <Link href="/doctor/patients">
                    <Button
                      variant={
                        document.documentElement.classList.contains("dark")
                          ? "ghost"
                          : "ghost"
                      }
                      size="sm"
                      className={
                        document.documentElement.classList.contains("dark")
                          ? "text-blue-400 hover:text-blue-300 hover:bg-blue-900/20"
                          : "text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      }
                    >
                      View All
                    </Button>
                  </Link>
                </div>

                {recentPatients.length === 0 ? (
                  <div className="text-center py-12">
                    <div
                      className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center ${
                        document.documentElement.classList.contains("dark")
                          ? "bg-gray-700"
                          : "bg-gray-100"
                      }`}
                    >
                      <Users
                        className={`w-8 h-8 ${
                          document.documentElement.classList.contains("dark")
                            ? "text-gray-500"
                            : "text-gray-400"
                        }`}
                      />
                    </div>
                    <p
                      className={`mt-3 text-sm font-medium ${
                        document.documentElement.classList.contains("dark")
                          ? "text-gray-400"
                          : "text-gray-500"
                      }`}
                    >
                      No patients yet
                    </p>
                  </div>
                ) : (
                  <div className="flex justify-center">
                    <div className="flex flex-wrap gap-2 justify-center my-4">
                      <AnimatedTooltip
                        items={recentPatients.map((patient) => ({
                          id: patient._id,
                          name: `${patient.firstName} ${patient.lastName}`,
                          designation: patient.gender || "Patient",
                          image:
                            patient.profilePicture ||
                            "/placeholder-patient.png",
                        }))}
                      />
                    </div>
                  </div>
                )}

                <div className="mt-4">
                  <div
                    className={`grid grid-cols-2 gap-3 ${
                      document.documentElement.classList.contains("dark")
                        ? "text-white"
                        : ""
                    }`}
                  >
                    <div
                      className={`p-4 rounded-lg ${
                        document.documentElement.classList.contains("dark")
                          ? "bg-gray-800/80 border border-gray-700/50"
                          : "bg-gray-50 border border-gray-100"
                      }`}
                    >
                      <div
                        className={`text-xs uppercase font-semibold mb-1 ${
                          document.documentElement.classList.contains("dark")
                            ? "text-gray-400"
                            : "text-gray-500"
                        }`}
                      >
                        New Patients
                      </div>
                      <div
                        className={`text-2xl font-bold ${
                          document.documentElement.classList.contains("dark")
                            ? "text-blue-400"
                            : "text-blue-600"
                        }`}
                      >
                        {dashboardStats?.newPatients || 0}
                      </div>
                      <div
                        className={`text-xs mt-1 ${
                          document.documentElement.classList.contains("dark")
                            ? "text-gray-400"
                            : "text-gray-500"
                        }`}
                      >
                        Last 30 days
                      </div>
                    </div>

                    <div
                      className={`p-4 rounded-lg ${
                        document.documentElement.classList.contains("dark")
                          ? "bg-gray-800/80 border border-gray-700/50"
                          : "bg-gray-50 border border-gray-100"
                      }`}
                    >
                      <div
                        className={`text-xs uppercase font-semibold mb-1 ${
                          document.documentElement.classList.contains("dark")
                            ? "text-gray-400"
                            : "text-gray-500"
                        }`}
                      >
                        Returning
                      </div>
                      <div
                        className={`text-2xl font-bold ${
                          document.documentElement.classList.contains("dark")
                            ? "text-purple-400"
                            : "text-purple-600"
                        }`}
                      >
                        {dashboardStats?.returningPatients || 0}
                      </div>
                      <div
                        className={`text-xs mt-1 ${
                          document.documentElement.classList.contains("dark")
                            ? "text-gray-400"
                            : "text-gray-500"
                        }`}
                      >
                        With follow-ups
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Appointment Trends and Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Performance Metrics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.7 }}
          >
            <Card
              className={`${
                document.documentElement.classList.contains("dark")
                  ? "bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700/50 shadow-lg shadow-black/20"
                  : "bg-white shadow-md"
              } rounded-xl`}
            >
              <div className="p-6">
                <h2
                  className={`text-xl font-bold flex items-center mb-5 ${
                    document.documentElement.classList.contains("dark")
                      ? "text-white"
                      : "text-gray-900"
                  }`}
                >
                  <TrendingUp
                    className={`w-5 h-5 mr-2 ${
                      document.documentElement.classList.contains("dark")
                        ? "text-blue-400"
                        : "text-blue-600"
                    }`}
                  />
                  Performance Metrics
                </h2>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div
                    className={`p-4 rounded-lg ${
                      document.documentElement.classList.contains("dark")
                        ? "bg-gray-800/80 border border-gray-700/50"
                        : "bg-gray-50 border border-gray-100"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div
                          className={`text-xs uppercase font-semibold mb-1 ${
                            document.documentElement.classList.contains("dark")
                              ? "text-gray-400"
                              : "text-gray-500"
                          }`}
                        >
                          Completed
                        </div>
                        <div
                          className={`text-2xl font-bold ${
                            document.documentElement.classList.contains("dark")
                              ? "text-white"
                              : "text-gray-900"
                          }`}
                        >
                          {dashboardStats?.completedAppointments || 0}
                        </div>
                      </div>
                      <div
                        className={`p-2 rounded-lg ${
                          document.documentElement.classList.contains("dark")
                            ? "bg-indigo-900/30 text-indigo-400"
                            : "bg-indigo-100 text-indigo-600"
                        }`}
                      >
                        <Stethoscope className="w-5 h-5" />
                      </div>
                    </div>
                  </div>

                  <div
                    className={`p-4 rounded-lg ${
                      document.documentElement.classList.contains("dark")
                        ? "bg-gray-800/80 border border-gray-700/50"
                        : "bg-gray-50 border border-gray-100"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div
                          className={`text-xs uppercase font-semibold mb-1 ${
                            document.documentElement.classList.contains("dark")
                              ? "text-gray-400"
                              : "text-gray-500"
                          }`}
                        >
                          Cancellation
                        </div>
                        <div className="flex items-baseline">
                          <span
                            className={`text-2xl font-bold ${
                              document.documentElement.classList.contains(
                                "dark"
                              )
                                ? "text-white"
                                : "text-gray-900"
                            }`}
                          >
                            {dashboardStats?.cancellationRate || 0}
                          </span>
                          <span
                            className={`ml-1 text-sm ${
                              document.documentElement.classList.contains(
                                "dark"
                              )
                                ? "text-gray-400"
                                : "text-gray-500"
                            }`}
                          >
                            %
                          </span>
                        </div>
                      </div>
                      <div
                        className={`p-2 rounded-lg ${
                          document.documentElement.classList.contains("dark")
                            ? "bg-rose-900/30 text-rose-400"
                            : "bg-rose-100 text-rose-600"
                        }`}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="w-5 h-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Feedback score */}
                <div className="mt-6">
                  <div className="flex justify-between items-center mb-2">
                    <h3
                      className={`font-medium ${
                        document.documentElement.classList.contains("dark")
                          ? "text-gray-300"
                          : "text-gray-700"
                      }`}
                    >
                      Patient Satisfaction
                    </h3>
                    <span
                      className={`font-medium text-lg ${
                        document.documentElement.classList.contains("dark")
                          ? "text-white"
                          : "text-gray-900"
                      }`}
                    >
                      {dashboardStats?.patientSatisfaction || 0}%
                    </span>
                  </div>
                  <div
                    className={`w-full ${
                      document.documentElement.classList.contains("dark")
                        ? "bg-gray-700"
                        : "bg-gray-200"
                    } rounded-full h-2.5 overflow-hidden`}
                  >
                    <div
                      className={`h-2.5 rounded-full ${
                        (dashboardStats?.patientSatisfaction || 0) >= 80
                          ? document.documentElement.classList.contains("dark")
                            ? "bg-green-500"
                            : "bg-green-600"
                          : (dashboardStats?.patientSatisfaction || 0) >= 50
                          ? document.documentElement.classList.contains("dark")
                            ? "bg-amber-500"
                            : "bg-amber-600"
                          : document.documentElement.classList.contains("dark")
                          ? "bg-red-500"
                          : "bg-red-600"
                      }`}
                      style={{
                        width: `${dashboardStats?.patientSatisfaction || 0}%`,
                      }}
                    ></div>
                  </div>
                  <div
                    className={`flex justify-between text-xs ${
                      document.documentElement.classList.contains("dark")
                        ? "text-gray-400"
                        : "text-gray-500"
                    } mt-1`}
                  >
                    <span>Poor</span>
                    <span>Excellent</span>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Upcoming Appointments */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.8 }}
          >
            <Card
              className={`h-full ${
                document.documentElement.classList.contains("dark")
                  ? "bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700/50 shadow-lg shadow-black/20"
                  : "bg-white shadow-md"
              } rounded-xl`}
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-5">
                  <h2
                    className={`text-xl font-bold flex items-center ${
                      document.documentElement.classList.contains("dark")
                        ? "text-white"
                        : "text-gray-900"
                    }`}
                  >
                    <Calendar
                      className={`w-5 h-5 mr-2 ${
                        document.documentElement.classList.contains("dark")
                          ? "text-blue-400"
                          : "text-blue-600"
                      }`}
                    />
                    Upcoming Appointments
                  </h2>
                  <Link href="/doctor/appointments">
                    <Button
                      variant={
                        document.documentElement.classList.contains("dark")
                          ? "ghost"
                          : "ghost"
                      }
                      size="sm"
                      className={
                        document.documentElement.classList.contains("dark")
                          ? "text-blue-400 hover:text-blue-300 hover:bg-blue-900/20"
                          : "text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      }
                    >
                      View All
                    </Button>
                  </Link>
                </div>

                {upcomingAppointments.length === 0 ? (
                  <div className="text-center py-12">
                    <div
                      className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center ${
                        document.documentElement.classList.contains("dark")
                          ? "bg-gray-700"
                          : "bg-gray-100"
                      }`}
                    >
                      <Calendar
                        className={`w-8 h-8 ${
                          document.documentElement.classList.contains("dark")
                            ? "text-gray-500"
                            : "text-gray-400"
                        }`}
                      />
                    </div>
                    <p
                      className={`mt-3 text-sm font-medium ${
                        document.documentElement.classList.contains("dark")
                          ? "text-gray-400"
                          : "text-gray-500"
                      }`}
                    >
                      No upcoming appointments
                    </p>
                    <Link href="/doctor/appointments/new">
                      <Button
                        variant="outline"
                        size="sm"
                        className={`mt-3 ${
                          document.documentElement.classList.contains("dark")
                            ? "border-gray-600 text-gray-300 hover:bg-gray-700"
                            : "border-gray-200 text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        Create Appointment
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {upcomingAppointments.map((appointment, index) => (
                      <motion.div
                        key={appointment._id || index}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.2, delay: index * 0.05 }}
                        className={`flex items-center p-3 rounded-lg ${
                          document.documentElement.classList.contains("dark")
                            ? "hover:bg-gray-800/70 border border-gray-700/50"
                            : "hover:bg-gray-50 border border-gray-100"
                        } transition-colors`}
                      >
                        <div className="flex-shrink-0">
                          <Avatar
                            className={`w-10 h-10 ${
                              document.documentElement.classList.contains(
                                "dark"
                              )
                                ? "ring-1 ring-gray-700"
                                : "ring-1 ring-gray-200"
                            }`}
                          >
                            <AvatarImage
                              src={
                                appointment.patient?.profilePicture ||
                                "/placeholder-patient.png"
                              }
                            />
                            <AvatarFallback
                              className={
                                document.documentElement.classList.contains(
                                  "dark"
                                )
                                  ? "bg-gray-700 text-gray-300"
                                  : "bg-gray-200 text-gray-600"
                              }
                            >
                              {appointment.patient?.firstName?.[0]}
                              {appointment.patient?.lastName?.[0]}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                        <div className="ml-3 flex-grow">
                          <p
                            className={`text-sm font-medium ${
                              document.documentElement.classList.contains(
                                "dark"
                              )
                                ? "text-white"
                                : "text-gray-900"
                            }`}
                          >
                            {appointment.patient?.firstName}{" "}
                            {appointment.patient?.lastName}
                          </p>
                          <div className="flex items-center">
                            <span
                              className={`text-xs ${
                                document.documentElement.classList.contains(
                                  "dark"
                                )
                                  ? "text-gray-400"
                                  : "text-gray-500"
                              }`}
                            >
                              {new Date(
                                appointment.appointmentDate
                              ).toLocaleDateString(undefined, {
                                month: "short",
                                day: "numeric",
                              })}
                            </span>
                            <span
                              className={`inline-block w-1 h-1 rounded-full mx-1.5 ${
                                document.documentElement.classList.contains(
                                  "dark"
                                )
                                  ? "bg-gray-600"
                                  : "bg-gray-300"
                              }`}
                            ></span>
                            <span
                              className={`text-xs ${
                                document.documentElement.classList.contains(
                                  "dark"
                                )
                                  ? "text-gray-400"
                                  : "text-gray-500"
                              }`}
                            >
                              {new Date(
                                appointment.startTime
                              ).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                        </div>
                        <Link href={`/doctor/appointments/${appointment._id}`}>
                          <Button
                            variant="ghost"
                            size="sm"
                            className={`h-8 ${
                              document.documentElement.classList.contains(
                                "dark"
                              )
                                ? "hover:bg-gray-700 text-gray-300"
                                : "hover:bg-gray-100 text-gray-600"
                            }`}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M9 18l6-6-6-6"></path>
                            </svg>
                          </Button>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.9 }}
        >
          <Card
            className={`${
              document.documentElement.classList.contains("dark")
                ? "bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700/50 shadow-lg shadow-black/20"
                : "bg-white shadow-md"
            } rounded-xl p-6 mb-8`}
          >
            <h2
              className={`text-xl font-bold mb-5 ${
                document.documentElement.classList.contains("dark")
                  ? "text-white"
                  : "text-gray-900"
              }`}
            >
              Quick Actions
            </h2>
            <div className="flex flex-wrap gap-3">
              <Link href="/doctor/appointments/new">
                <Button
                  className={
                    document.documentElement.classList.contains("dark")
                      ? "bg-gradient-to-r from-blue-600 to-blue-500 hover:opacity-90 shadow-md shadow-blue-900/20"
                      : "bg-blue-600 hover:bg-blue-700 shadow-sm"
                  }
                >
                  New Appointment
                </Button>
              </Link>
              <Link href="/doctor/schedule">
                <Button
                  variant="outline"
                  className={
                    document.documentElement.classList.contains("dark")
                      ? "border-blue-500/50 text-blue-300 hover:bg-blue-900/30 backdrop-blur-sm"
                      : "border-blue-600 text-blue-600 hover:bg-blue-50"
                  }
                >
                  Manage Schedule
                </Button>
              </Link>
              <Link href="/doctor/patients">
                <Button
                  variant="outline"
                  className={
                    document.documentElement.classList.contains("dark")
                      ? "border-blue-500/50 text-blue-300 hover:bg-blue-900/30 backdrop-blur-sm"
                      : "border-blue-600 text-blue-600 hover:bg-blue-50"
                  }
                >
                  Patient List
                </Button>
              </Link>
              <Link href="/doctor/profile">
                <Button
                  variant="outline"
                  className={
                    document.documentElement.classList.contains("dark")
                      ? "border-blue-500/50 text-blue-300 hover:bg-blue-900/30 backdrop-blur-sm"
                      : "border-blue-600 text-blue-600 hover:bg-blue-50"
                  }
                >
                  Update Profile
                </Button>
              </Link>
            </div>
          </Card>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}

// Update the dashboard skeleton to always use dark mode
function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 to-gray-900 p-4 md:p-8">
      {/* Header skeleton */}
      <div className="mb-8">
        <div className="h-8 bg-gray-800 rounded-md w-64 mb-2 animate-pulse"></div>
        <div className="h-4 bg-gray-800 rounded-md w-48 animate-pulse"></div>
      </div>

      {/* Stats cards skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="bg-gray-800/80 border border-gray-700 rounded-xl shadow-md p-6"
          >
            <div className="flex items-center">
              <div className="rounded-full bg-gray-700 w-12 h-12 mr-4 animate-pulse"></div>
              <div>
                <div className="h-4 bg-gray-700 rounded-md w-24 mb-2 animate-pulse"></div>
                <div className="h-6 bg-gray-700 rounded-md w-12 animate-pulse"></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs skeleton */}
      <div className="mb-8">
        <div className="h-10 bg-gray-800 rounded-md w-full mb-6 animate-pulse"></div>
        <div className="h-64 bg-gray-800 rounded-xl w-full animate-pulse"></div>
      </div>
    </div>
  );
}
