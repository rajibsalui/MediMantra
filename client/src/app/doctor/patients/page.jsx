"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useDoctor } from "@/contexts/DoctorContext";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import PatientManagement from "@/components/doctor/PatientManagement";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  RefreshCw,
  PlusCircle,
  Users,
  Search,
  Filter,
  FileText,
  Calendar,
} from "lucide-react";
import { API_URL, SOCKET_URL } from '@/config/environment';


// This ensures the page is only rendered on the client side
export const dynamic = 'force-dynamic';
export const runtime = 'edge';


export default function PatientsPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const {
    patients,
    loading,
    dataLoading,
    getDoctorPatients,
  } = useDoctor();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [filterBy, setFilterBy] = useState("all");

  // Redirect if not authenticated or not a doctor
  useEffect(() => {
    if (!authLoading && (!isAuthenticated || user?.role !== "doctor")) {
      toast.error("You must be logged in as a doctor to access this page");
      router.push("/auth/login");
    }
  }, [isAuthenticated, user, authLoading, router]);

  // Load patients data when authenticated
  useEffect(() => {
    if (isAuthenticated && user?.role === "doctor") {
      loadPatients();
    }
  }, [isAuthenticated, user]);

  const loadPatients = async () => {
    try {
      await getDoctorPatients();
    } catch (error) {
      console.error("Error loading patients:", error);
      toast.error("Failed to load patients");
    }
  };

  // Filter and sort patients
  const getFilteredPatients = () => {
    if (!patients || patients.length === 0) return [];

    let filtered = [...patients];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (patient) =>
          patient.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          patient.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          `${patient.firstName} ${patient.lastName}`
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
    }

    // Apply category filter
    if (filterBy === "with-appointments") {
      filtered = filtered.filter(
        (patient) => patient.upcomingAppointments && patient.upcomingAppointments > 0
      );
    } else if (filterBy === "recent") {
      // Get patients with appointments in the last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      filtered = filtered.filter((patient) => {
        return patient.lastAppointment && new Date(patient.lastAppointment) >= thirtyDaysAgo;
      });
    }

    // Apply sorting
    if (sortBy === "name") {
      filtered.sort((a, b) => {
        const nameA = `${a.firstName} ${a.lastName}`.toLowerCase();
        const nameB = `${b.firstName} ${b.lastName}`.toLowerCase();
        return nameA.localeCompare(nameB);
      });
    } else if (sortBy === "recent") {
      filtered.sort((a, b) => {
        const dateA = a.lastAppointment ? new Date(a.lastAppointment) : new Date(0);
        const dateB = b.lastAppointment ? new Date(b.lastAppointment) : new Date(0);
        return dateB - dateA;
      });
    } else if (sortBy === "appointments") {
      filtered.sort((a, b) => {
        const countA = a.appointmentCount || 0;
        const countB = b.appointmentCount || 0;
        return countB - countA;
      });
    }

    return filtered;
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto py-6 px-4 md:px-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Patients</h1>
            <p className="text-muted-foreground">
              Manage your patients and their medical records
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={loadPatients}
              disabled={dataLoading.patients}
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${dataLoading.patients ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
            <Link href="/doctor/patients/new">
              <Button size="sm">
                <PlusCircle className="h-4 w-4 mr-2" />
                New Patient
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 flex items-center">
              <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 mr-3">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Patients</p>
                <h3 className="text-2xl font-bold">{patients?.length || 0}</h3>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 flex items-center">
              <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 mr-3">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">With Appointments</p>
                <h3 className="text-2xl font-bold">
                  {patients?.filter(p => p.upcomingAppointments && p.upcomingAppointments > 0)?.length || 0}
                </h3>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 flex items-center">
              <div className="p-2 rounded-full bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 mr-3">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Medical Records</p>
                <h3 className="text-2xl font-bold">
                  {patients?.reduce((sum, p) => sum + (p.medicalRecords?.length || 0), 0) || 0}
                </h3>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
            <Input
              placeholder="Search patients..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Select value={filterBy} onValueChange={setFilterBy}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Patients</SelectItem>
              <SelectItem value="with-appointments">With Appointments</SelectItem>
              <SelectItem value="recent">Recent (30 days)</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="recent">Recent Visit</SelectItem>
              <SelectItem value="appointments">Most Appointments</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <PatientManagement 
          patients={getFilteredPatients()} 
          loading={loading || dataLoading.patients} 
        />
      </div>
    </DashboardLayout>
  );
}
