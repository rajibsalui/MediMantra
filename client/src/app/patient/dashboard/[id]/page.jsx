"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { usePatient } from "@/contexts/PatientContext";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardStats from "@/components/dashboard/DashboardStats";
import AppointmentList from "@/components/dashboard/AppointmentList";
import MedicalRecordsList from "@/components/dashboard/MedicalRecordsList";
import VitalStatsChart from "@/components/dashboard/VitalStatsChart";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";
import { RefreshCw, AlertCircle } from "lucide-react";

export default function PatientDashboard() {
  const { id } = useParams();
  const router = useRouter();
  const { user, isAuthenticated ,loading: authLoading} = useAuth();
  const {
    loading,
    fetchPatientProfile,
    fetchUpcomingAppointments,
    fetchMedicalRecords,
    fetchVitalStats
  } = usePatient();

  const [profile, setProfile] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [medicalRecords, setMedicalRecords] = useState(null);
  const [vitalStats, setVitalStats] = useState([]);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated && !authLoading) {
      toast.error("Please sign in to access your dashboard");
      router.push("/login");
    }
  }, [isAuthenticated, authLoading, router]);

  // Load dashboard data
  const loadDashboardData = async () => {
    try {
      setDashboardLoading(true);
      setError(null);

      // Fetch patient profile
      const profileData = await fetchPatientProfile();
      setProfile(profileData);

      // Fetch upcoming appointments
      const appointmentsData = await fetchUpcomingAppointments();
      // Ensure appointments is always an array
      setAppointments(Array.isArray(appointmentsData) ? appointmentsData : []);

      // Fetch medical records
      const medicalRecordsData = await fetchMedicalRecords();
      setMedicalRecords(medicalRecordsData);

      // Fetch vital stats
      const vitalStatsData = await fetchVitalStats();
      setVitalStats(vitalStatsData || []);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      setError("Failed to load dashboard data. Please try again.");
      toast.error("Failed to load dashboard data");
    } finally {
      setDashboardLoading(false);
      setRefreshing(false);
    }
  };

  // Handle manual refresh
  const handleRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };

  // Initial data load
  useEffect(() => {
    if (user && user.id === id) {
      loadDashboardData();
    }
  }, [user, id]);

  // Show loading state
  if (dashboardLoading || loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <LoadingSpinner size="lg" />
        </div>
      </DashboardLayout>
    );
  }

  // Show error state
  if (error) {
    return (
      <DashboardLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
            <AlertCircle className="h-16 w-16 text-red-500 mb-4" />
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              Something went wrong
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-md">
              {error}
            </p>
            <Button onClick={handleRefresh} disabled={refreshing}>
              {refreshing ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Refreshing...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </>
              )}
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
          <DashboardHeader
            title="Patient Dashboard"
            subtitle="Welcome back, manage your health information"
            user={user}
            profile={profile}
          />

          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
            className="mt-4 md:mt-0 flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <DashboardStats
            title="Upcoming Appointments"
            value={appointments.length}
            icon="calendar"
            trend="neutral"
            description="Scheduled appointments"
          />
          <DashboardStats
            title="Medical Records"
            value={medicalRecords?.documents?.length || 0}
            icon="file-medical"
            trend="neutral"
            description="Uploaded documents"
          />
          <DashboardStats
            title="Prescriptions"
            value={medicalRecords?.prescriptions?.length || 0}
            icon="prescription"
            trend="neutral"
            description="Active medications"
          />
          <DashboardStats
            title="Completed Visits"
            value={medicalRecords?.visits?.length || 0}
            icon="check-circle"
            trend="up"
            description="Past consultations"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-slate-900 dark:text-white">Upcoming Appointments</h2>
            <AppointmentList
              appointments={Array.isArray(appointments) ? appointments.slice(0, 5) : []}
              emptyMessage="No upcoming appointments"
            />
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-slate-900 dark:text-white">Recent Medical Records</h2>
            <MedicalRecordsList
              records={Array.isArray(medicalRecords?.documents) ? medicalRecords.documents.slice(0, 5) : []}
              emptyMessage="No medical records found"
            />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6 mb-8">
          <VitalStatsChart data={vitalStats} />
        </div>
      </div>
    </DashboardLayout>
  );
}
