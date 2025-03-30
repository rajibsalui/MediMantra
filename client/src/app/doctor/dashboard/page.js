"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useDoctor } from '@/contexts/DoctorContext';
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CalendarDays, Users, Star, Clock, TrendingUp, Stethoscope, CreditCard, Calendar } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from 'react-hot-toast';
import { motion } from "framer-motion";
import { AnimatedTooltip } from "@/components/ui/animated-tooltip";
import { SparklesCore } from "@/components/ui/sparkles";
import { CardSpotlight } from "@/components/ui/card-spotlight";
import { Badge } from "@/components/ui/badge";

export default function DoctorDashboard() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { 
    doctor, 
    appointments, 
    dashboardStats,
    loading, 
    dataLoading,
    getDoctorProfile, 
    getDoctorAppointments, 
    getDashboardStats 
  } = useDoctor();
  
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [recentPatients, setRecentPatients] = useState([]);
  
  // Check for token on component mount
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const doctorId = localStorage.getItem('doctorId');
    
    if (!token) {
      toast.error('Authentication required. Please log in.');
      router.push('/doctor/login');
    }
  }, [router]);
  
  // Redirect if not authenticated or not a doctor
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast.error('Please sign in to access your dashboard');
      router.push('/');
    }
    
    if (!authLoading && isAuthenticated && user?.role !== 'doctor') {
      toast.error('Unauthorized access. This dashboard is for doctors only.');
      router.push('/');
    }
  }, [isAuthenticated, user, authLoading, router]);
  
  // Fetch doctor data when authenticated
  useEffect(() => {
    const loadDoctorData = async () => {
      if (isAuthenticated && user?.role === 'doctor') {
        try {
          // Load doctor profile if not already loaded
          if (!doctor) {
            await getDoctorProfile();
          }
          
          // Load appointments and dashboard stats
          await Promise.all([
            getDoctorAppointments(),
            getDashboardStats()
          ]);
        } catch (error) {
          console.error('Error loading doctor data:', error);
          toast.error('Failed to load dashboard data');
        }
      }
    };
    
    loadDoctorData();
  }, [isAuthenticated, user]);
  
  // Process appointments
  useEffect(() => {
    if (appointments?.length > 0) {
      // Get today's appointments
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      setTodayAppointments(
        appointments.filter(apt => {
          const aptDate = new Date(apt.appointmentDate);
          return aptDate >= today && aptDate < tomorrow;
        }).sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
      );
      
      // Get upcoming appointments (excluding today)
      setUpcomingAppointments(
        appointments.filter(apt => {
          const aptDate = new Date(apt.appointmentDate);
          return aptDate > tomorrow;
        }).sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate))
        .slice(0, 5)
      );
      
      // Get recent patients (unique)
      const uniquePatients = [];
      const patientIds = new Set();
      
      appointments.forEach(apt => {
        if (!patientIds.has(apt.patient._id)) {
          patientIds.add(apt.patient._id);
          uniquePatients.push(apt.patient);
        }
      });
      
      setRecentPatients(uniquePatients.slice(0, 5));
    }
  }, [appointments]);
  
  // If loading, show skeleton
  if (authLoading || loading || !doctor) {
    return <DashboardSkeleton />;
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sparkles background effect */}
      <div className="fixed inset-0 pointer-events-none">
        <SparklesCore
          id="tsparticles"
          background="transparent"
          minSize={0.6}
          maxSize={1.4}
          particleDensity={10}
          className="w-full h-full"
          particleColor="#3b82f6"
          opacity={0.2}
        />
      </div>
      
      {/* Main content */}
      <div className="relative z-10 p-4 md:p-8">
        {/* Welcome header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold">
                <span className="text-blue-600">Welcome back, Dr. {doctor.user?.firstName || user?.firstName}</span>
              </h1>
              <p className="text-gray-600 mt-1">
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
            
            <div className="mt-4 md:mt-0 flex items-center space-x-4">
              <Badge variant={doctor.isVerified ? "success" : "warning"} className="h-8 px-3">
                {doctor.isVerified ? "Verified" : "Pending Verification"}
              </Badge>
              
              <div className="online avatar">
                <div className="w-12 h-12 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                  <Avatar className="w-12 h-12 border-2 border-blue-500">
                    <AvatarImage src={doctor.user?.profilePicture || "/placeholder-doctor.png"} alt="Doctor" />
                    <AvatarFallback>
                      {doctor.user?.firstName?.[0] || user?.firstName?.[0]}
                      {doctor.user?.lastName?.[0] || user?.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <CardSpotlight className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center">
                <div className="rounded-full bg-blue-100 p-3 mr-4">
                  <CalendarDays className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Today's Appointments</p>
                  <h3 className="text-2xl font-bold">{todayAppointments.length}</h3>
                </div>
              </div>
            </CardSpotlight>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <CardSpotlight className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center">
                <div className="rounded-full bg-green-100 p-3 mr-4">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Total Patients</p>
                  <h3 className="text-2xl font-bold">{dashboardStats?.totalPatients || 0}</h3>
                </div>
              </div>
            </CardSpotlight>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <CardSpotlight className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center">
                <div className="rounded-full bg-purple-100 p-3 mr-4">
                  <Star className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Rating</p>
                  <h3 className="text-2xl font-bold">{doctor.averageRating?.toFixed(1) || 'N/A'}</h3>
                </div>
              </div>
            </CardSpotlight>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
          >
            <CardSpotlight className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center">
                <div className="rounded-full bg-amber-100 p-3 mr-4">
                  <CreditCard className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Earnings (Month)</p>
                  <h3 className="text-2xl font-bold">₹{dashboardStats?.monthlyEarnings?.toLocaleString() || 0}</h3>
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
            <Card className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold flex items-center">
                    <Calendar className="w-5 h-5 mr-2 text-blue-600" />
                    Today's Appointments
                  </h2>
                  <Link href="/doctor/appointments">
                    <Button variant="ghost" size="sm" className="text-blue-600">
                      View All
                    </Button>
                  </Link>
                </div>
                
                {todayAppointments.length === 0 ? (
                  <div className="text-center py-8">
                    <Clock className="w-12 h-12 mx-auto text-gray-300" />
                    <p className="mt-2 text-gray-500">No appointments scheduled for today</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {todayAppointments.map((appointment, index) => (
                      <div 
                        key={appointment._id || index}
                        className="bg-gray-50 rounded-lg p-4 flex items-center justify-between"
                      >
                        <div className="flex items-center">
                          <Avatar className="w-10 h-10 mr-3">
                            <AvatarImage src={appointment.patient?.profilePicture || "/placeholder-patient.png"} />
                            <AvatarFallback>
                              {appointment.patient?.firstName?.[0]}
                              {appointment.patient?.lastName?.[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-medium">{appointment.patient?.firstName} {appointment.patient?.lastName}</h3>
                            <p className="text-sm text-gray-500">
                              {new Date(appointment.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                              {' - '}
                              {new Date(appointment.endTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </p>
                          </div>
                        </div>
                        <div>
                          <Badge className={
                            appointment.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                            appointment.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                            'bg-blue-100 text-blue-800'
                          }>
                            {appointment.status}
                          </Badge>
                        </div>
                      </div>
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
            <Card className="bg-white rounded-xl shadow-md">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold flex items-center">
                    <Users className="w-5 h-5 mr-2 text-blue-600" />
                    Recent Patients
                  </h2>
                  <Link href="/doctor/patients">
                    <Button variant="ghost" size="sm" className="text-blue-600">
                      View All
                    </Button>
                  </Link>
                </div>
                
                {recentPatients.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 mx-auto text-gray-300" />
                    <p className="mt-2 text-gray-500">No patients yet</p>
                  </div>
                ) : (
                  <div className="flex justify-center">
                    <div className="flex flex-wrap gap-2 justify-center my-4">
                      <AnimatedTooltip
                        items={recentPatients.map(patient => ({
                          id: patient._id,
                          name: `${patient.firstName} ${patient.lastName}`,
                          designation: patient.gender || 'Patient',
                          image: patient.profilePicture || "/placeholder-patient.png",
                        }))}
                      />
                    </div>
                  </div>
                )}
                
                <div className="mt-4">
                  <div className="stats stats-vertical shadow w-full bg-gray-50">
                    <div className="stat">
                      <div className="stat-title">New Patients</div>
                      <div className="stat-value text-primary">{dashboardStats?.newPatients || 0}</div>
                      <div className="stat-desc">Last 30 days</div>
                    </div>
                    <div className="stat">
                      <div className="stat-title">Returning Patients</div>
                      <div className="stat-value text-secondary">{dashboardStats?.returningPatients || 0}</div>
                      <div className="stat-desc">Patients with follow-ups</div>
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
            <Card className="bg-white rounded-xl shadow-md">
              <div className="p-6">
                <h2 className="text-xl font-bold flex items-center mb-4">
                  <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
                  Performance Metrics
                </h2>
                
                <div className="mt-4">
                  <div className="stats shadow w-full">
                    <div className="stat">
                      <div className="stat-figure text-primary">
                        <Stethoscope className="w-8 h-8" />
                      </div>
                      <div className="stat-title">Completed</div>
                      <div className="stat-value">{dashboardStats?.completedAppointments || 0}</div>
                      <div className="stat-desc">Appointments</div>
                    </div>
                    
                    <div className="stat">
                      <div className="stat-figure text-secondary">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-8 h-8 stroke-current">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path>
                        </svg>
                      </div>
                      <div className="stat-title">Cancellation</div>
                      <div className="stat-value">{dashboardStats?.cancellationRate || 0}%</div>
                      <div className="stat-desc">Rate</div>
                    </div>
                  </div>
                </div>
                
                {/* Feedback score */}
                <div className="mt-6">
                  <h3 className="font-medium text-gray-700 mb-2">Patient Satisfaction</h3>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-blue-600 h-2.5 rounded-full" 
                      style={{ width: `${dashboardStats?.patientSatisfaction || 0}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>0%</span>
                    <span>{dashboardStats?.patientSatisfaction || 0}%</span>
                    <span>100%</span>
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
            <Card className="bg-white rounded-xl shadow-md">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold flex items-center">
                    <Calendar className="w-5 h-5 mr-2 text-blue-600" />
                    Upcoming Appointments
                  </h2>
                  <Link href="/doctor/appointments">
                    <Button variant="ghost" size="sm" className="text-blue-600">
                      View All
                    </Button>
                  </Link>
                </div>
                
                {upcomingAppointments.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 mx-auto text-gray-300" />
                    <p className="mt-2 text-gray-500">No upcoming appointments</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {upcomingAppointments.map((appointment, index) => (
                      <div key={appointment._id || index} className="flex items-center p-3 border-b last:border-b-0">
                        <div className="flex-shrink-0">
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={appointment.patient?.profilePicture || "/placeholder-patient.png"} />
                            <AvatarFallback>
                              {appointment.patient?.firstName?.[0]}
                              {appointment.patient?.lastName?.[0]}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                        <div className="ml-3 flex-grow">
                          <p className="text-sm font-medium">{appointment.patient?.firstName} {appointment.patient?.lastName}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(appointment.appointmentDate).toLocaleDateString()} • {' '}
                            {new Date(appointment.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </p>
                        </div>
                        <Link href={`/doctor/appointments/${appointment._id}`}>
                          <Button variant="outline" size="sm">View</Button>
                        </Link>
                      </div>
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
          <Card className="bg-white rounded-xl shadow-md p-6 mb-8">
            <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
            <div className="flex flex-wrap gap-3">
              <Link href="/doctor/appointments/new">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  New Appointment
                </Button>
              </Link>
              <Link href="/doctor/schedule">
                <Button variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50">
                  Manage Schedule
                </Button>
              </Link>
              <Link href="/doctor/patients">
                <Button variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50">
                  Patient List
                </Button>
              </Link>
              <Link href="/doctor/profile">
                <Button variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50">
                  Update Profile
                </Button>
              </Link>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

// Loading skeleton for dashboard
function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      {/* Header skeleton */}
      <div className="mb-8">
        <div className="h-8 bg-gray-200 rounded-md w-64 mb-2 animate-pulse"></div>
        <div className="h-4 bg-gray-200 rounded-md w-48 animate-pulse"></div>
      </div>
      
      {/* Stats cards skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center">
              <div className="rounded-full bg-gray-200 w-12 h-12 mr-4 animate-pulse"></div>
              <div>
                <div className="h-4 bg-gray-200 rounded-md w-24 mb-2 animate-pulse"></div>
                <div className="h-6 bg-gray-200 rounded-md w-12 animate-pulse"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Content skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-md p-6">
          <div className="h-6 bg-gray-200 rounded-md w-48 mb-6 animate-pulse"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-gray-100 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="rounded-full bg-gray-200 w-10 h-10 mr-3 animate-pulse"></div>
                  <div>
                    <div className="h-4 bg-gray-200 rounded-md w-32 mb-2 animate-pulse"></div>
                    <div className="h-3 bg-gray-200 rounded-md w-24 animate-pulse"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="h-6 bg-gray-200 rounded-md w-36 mb-6 animate-pulse"></div>
          <div className="flex justify-center mb-4">
            <div className="flex space-x-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="rounded-full bg-gray-200 w-16 h-16 animate-pulse"></div>
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <div className="h-20 bg-gray-200 rounded-md animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  );
}