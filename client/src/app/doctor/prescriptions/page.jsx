"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { toast } from "react-hot-toast";
import { format } from "date-fns";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
// import { useAuth } from "@/hooks/useAuth";
import { useAuth } from "@/contexts/AuthContext";
import { API_URL, SOCKET_URL } from "@/config/environment";
import {
  Search,
  PlusCircle,
  Pill,
  Calendar,
  Clock,
  FileText,
  Download,
  RefreshCw,
  Filter,
  ChevronRight,
  User,
} from "lucide-react";

// This ensures the page is only rendered on the client side
export const dynamic = 'force-dynamic';
export const runtime = 'edge';

export default function PrescriptionsPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("active");

  useEffect(() => {
    // Redirect if not authenticated or not a doctor
    if (!authLoading && (!isAuthenticated || user?.role !== "doctor")) {
      toast.error("You must be logged in as a doctor to access this page");
      router.push("/auth/login");
    }
  }, [isAuthenticated, user, authLoading, router]);

  useEffect(() => {
    if (isAuthenticated && user?.role === "doctor") {
      loadPrescriptions();
    }
  }, [isAuthenticated, user]);

  const loadPrescriptions = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(`${API_URL}/prescriptions/doctor`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.data.success) {
        setPrescriptions(response.data.data.prescriptions || []);
      } else {
        setError(response.data.message || "Failed to load prescriptions");
        toast.error("Failed to load prescriptions");
      }
    } catch (err) {
      console.error("Error loading prescriptions:", err);
      setError("Failed to load prescriptions. Please try again.");
      toast.error("Failed to load prescriptions");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleTabChange = (value) => {
    setActiveTab(value);
  };

  // Filter prescriptions based on search term and active tab
  const filteredPrescriptions = prescriptions.filter((prescription) => {
    // Filter by search term
    const patientName = `${prescription.patient?.user?.firstName} ${prescription.patient?.user?.lastName}`.toLowerCase();
    const medicationNames = prescription.medications.map((med) => med.name.toLowerCase()).join(" ");
    const diagnosisText = prescription.diagnosis?.toLowerCase() || "";

    const matchesSearch = searchTerm === "" ||
      patientName.includes(searchTerm.toLowerCase()) ||
      medicationNames.includes(searchTerm.toLowerCase()) ||
      diagnosisText.includes(searchTerm.toLowerCase());

    // Filter by tab
    const isActive = new Date(prescription.endDate) >= new Date() && prescription.status === "active";
    const isExpired = new Date(prescription.endDate) < new Date() || prescription.status !== "active";

    if (activeTab === "active") return matchesSearch && isActive;
    if (activeTab === "expired") return matchesSearch && isExpired;
    return matchesSearch; // "all" tab
  });

  const renderPrescriptionList = () => {
    if (loading) {
      return Array(3).fill(0).map((_, i) => (
        <div key={i} className="p-4 border-b last:border-b-0 border-gray-200 dark:border-gray-700">
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
          <Button onClick={loadPrescriptions}>Try Again</Button>
        </div>
      );
    }

    if (filteredPrescriptions.length === 0) {
      return (
        <div className="text-center py-8">
          <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
            <FileText className="h-8 w-8 text-gray-400 dark:text-gray-500" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">
            No prescriptions found
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            {searchTerm
              ? "Try adjusting your search terms"
              : `No ${activeTab} prescriptions available`}
          </p>
          <Link href="/doctor/prescriptions/new">
            <Button size="sm">
              <PlusCircle className="w-4 h-4 mr-2" />
              New Prescription
            </Button>
          </Link>
        </div>
      );
    }

    return filteredPrescriptions.map((prescription) => (
      <div
        key={prescription._id}
        className="p-4 border-b last:border-b-0 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Avatar>
              <AvatarImage
                src={prescription.patient?.user?.profileImage}
                alt={`${prescription.patient?.user?.firstName} ${prescription.patient?.user?.lastName}`}
              />
              <AvatarFallback>
                <User className="h-5 w-5" />
              </AvatarFallback>
            </Avatar>
            <div>
              <h4 className="font-medium">
                {prescription.patient?.user?.firstName} {prescription.patient?.user?.lastName}
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {prescription.medications.map((med) => med.name).join(", ")}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge
              variant={
                new Date(prescription.endDate) >= new Date() && prescription.status === "active"
                  ? "success"
                  : "secondary"
              }
            >
              {new Date(prescription.endDate) >= new Date() && prescription.status === "active"
                ? "Active"
                : "Expired"}
            </Badge>
            <Link href={`/doctor/prescriptions/${prescription._id}`}>
              <Button variant="ghost" size="icon">
                <ChevronRight className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
        <div className="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400 space-x-4">
          <span className="flex items-center">
            <Calendar className="h-4 w-4 mr-1" />
            {format(new Date(prescription.startDate), "MMM d, yyyy")} - {format(new Date(prescription.endDate), "MMM d, yyyy")}
          </span>
          {prescription.fileUrl && (
            <Link href={prescription.fileUrl} target="_blank" rel="noopener noreferrer">
              <span className="flex items-center text-blue-600 dark:text-blue-400 hover:underline">
                <Download className="h-4 w-4 mr-1" />
                Download PDF
              </span>
            </Link>
          )}
        </div>
      </div>
    ));
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto py-6 px-4 md:px-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Prescriptions</h1>
            <p className="text-muted-foreground">
              Manage and track patient prescriptions
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={loadPrescriptions}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Link href="/doctor/prescriptions/new">
              <Button size="sm">
                <PlusCircle className="h-4 w-4 mr-2" />
                New Prescription
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                <Input
                  placeholder="Search prescriptions..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
              </div>
              <Button variant="outline" size="icon" className="h-10 w-10">
                <Filter className="h-4 w-4" />
              </Button>
            </div>

            <Tabs
              defaultValue="active"
              value={activeTab}
              onValueChange={handleTabChange}
              className="w-full"
            >
              <TabsList key="tabs-list" className="grid grid-cols-3 mb-4">
                <TabsTrigger value="active" className="flex items-center">
                  <Pill className="w-4 h-4 mr-2" />
                  Active
                </TabsTrigger>
                <TabsTrigger value="expired" className="flex items-center">
                  <Clock className="w-4 h-4 mr-2" />
                  Expired
                </TabsTrigger>
                <TabsTrigger value="all" className="flex items-center">
                  <FileText className="w-4 h-4 mr-2" />
                  All
                </TabsTrigger>
              </TabsList>

              <TabsContent value="active" className="mt-0">
                <Card className="overflow-hidden">{renderPrescriptionList()}</Card>
              </TabsContent>

              <TabsContent value="expired" className="mt-0">
                <Card className="overflow-hidden">{renderPrescriptionList()}</Card>
              </TabsContent>

              <TabsContent value="all" className="mt-0">
                <Card className="overflow-hidden">{renderPrescriptionList()}</Card>
              </TabsContent>
            </Tabs>
          </div>

          <div className="space-y-6">
            <Card className="p-4">
              <div className="flex items-center mb-4">
                <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 mr-3">
                  <FileText className="h-5 w-5" />
                </div>
                <h3 className="font-medium">Prescription Summary</h3>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Total</span>
                  <span className="font-medium">{prescriptions.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Active</span>
                  <span className="font-medium">
                    {
                      prescriptions.filter(
                        (p) => new Date(p.endDate) >= new Date() && p.status === "active"
                      ).length
                    }
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Expired</span>
                  <span className="font-medium">
                    {
                      prescriptions.filter(
                        (p) => new Date(p.endDate) < new Date() || p.status !== "active"
                      ).length
                    }
                  </span>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center mb-4">
                <div className="p-2 rounded-full bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 mr-3">
                  <Calendar className="h-5 w-5" />
                </div>
                <h3 className="font-medium">Recent Activity</h3>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Created This Week</span>
                  <span className="font-medium">
                    {
                      prescriptions.filter((p) => {
                        const oneWeekAgo = new Date();
                        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
                        return new Date(p.createdAt) > oneWeekAgo;
                      }).length
                    }
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Created This Month</span>
                  <span className="font-medium">
                    {
                      prescriptions.filter((p) => {
                        const oneMonthAgo = new Date();
                        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
                        return new Date(p.createdAt) > oneMonthAgo;
                      }).length
                    }
                  </span>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center mb-4">
                <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 mr-3">
                  <Pill className="h-5 w-5" />
                </div>
                <h3 className="font-medium">Top Medications</h3>
              </div>
              <div className="space-y-2">
                {/* This would be dynamically generated from actual data */}
                {loading ? (
                  <>
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                  </>
                ) : (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Amoxicillin</span>
                      <span className="font-medium">12</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Lisinopril</span>
                      <span className="font-medium">8</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Metformin</span>
                      <span className="font-medium">6</span>
                    </div>
                  </>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
