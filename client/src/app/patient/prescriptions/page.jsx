"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { useAuth } from "@/contexts/AuthContext";
import { usePatient } from "@/contexts/PatientContext";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { API_URL, SOCKET_URL } from "@/config/environment";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "react-hot-toast";
// import { API_URL } from "@/config/environment";
import {
  Pill,
  Calendar,
  User,
  Clock,
  AlertCircle,
  RefreshCw,
  Download,
  FileText,
  CheckCircle,
  XCircle,
  ExternalLink
} from "lucide-react";

// This ensures the page is only rendered on the client side
export const dynamic = 'force-dynamic';
export const runtime = 'edge';

export default function PatientPrescriptions() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { fetchMedicalRecords, loading } = usePatient();

  const [prescriptions, setPrescriptions] = useState([]);
  const [activeTab, setActiveTab] = useState("active");
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      loadPrescriptions();
    } else if (!isAuthenticated && !authLoading) {
      router.push("/login");
    }
  }, [isAuthenticated, user?.id,authLoading]);

  const loadPrescriptions = async () => {
    try {
      setError(null);
      const medicalRecords = await fetchMedicalRecords(user?.id);

      if (medicalRecords && medicalRecords.prescriptions) {
        setPrescriptions(medicalRecords.prescriptions);
      } else {
        setPrescriptions([]);
      }
    } catch (err) {
      console.error("Error loading prescriptions:", err);
      setError("Failed to load prescriptions. Please try again.");
      toast.error("Failed to load prescriptions");
    }
  };

  // Download prescription PDF
  const downloadPrescription = async (prescriptionId) => {
    try {
      const response = await axios.get(`${API_URL}/prescriptions/${prescriptionId}/download`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.data.success && response.data.data.fileUrl) {
        window.open(response.data.data.fileUrl, "_blank");
      } else {
        toast.error("Prescription PDF not found");
      }
    } catch (err) {
      console.error("Error downloading prescription:", err);
      toast.error("Failed to download prescription");
    }
  };

  // Filter prescriptions based on active tab
  const filteredPrescriptions = prescriptions.filter(prescription => {
    // Check if prescription is active based on date
    const isActive = new Date(prescription.endDate) >= new Date();

    // Check if prescription is completed based on status
    const isCompleted = prescription.status === "completed";

    if (activeTab === "active") {
      // For active tab: show prescriptions that are not expired AND not completed
      return isActive && !isCompleted;
    } else {
      // For past tab: show prescriptions that are either expired OR completed
      return !isActive || isCompleted;
    }
  });

  // Render prescription list
  const renderPrescriptions = () => {
    if (loading) {
      return Array(3).fill(0).map((_, index) => (
        <Card key={index} className="mb-4">
          <CardHeader className="pb-2">
            <Skeleton className="h-6 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </CardContent>
        </Card>
      ));
    }

    if (error) {
      return (
        <div className="text-center py-8">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-slate-700 dark:text-slate-300 mb-4">{error}</p>
          <Button onClick={loadPrescriptions} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      );
    }

    if (filteredPrescriptions.length === 0) {
      return (
        <div className="text-center py-8">
          <Pill className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No prescriptions found</h3>
          <p className="text-slate-500 dark:text-slate-400 mb-4">
            {activeTab === "active"
              ? "You don't have any active prescriptions at the moment."
              : "You don't have any past prescriptions in your records."}
          </p>
        </div>
      );
    }

    return filteredPrescriptions.map((prescription) => (
      <Card
        key={prescription._id}
        className="mb-4 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-all"
      >
        <div
          className={`h-1.5 w-full ${
            activeTab === "active" ? "bg-green-500" : "bg-slate-400"
          }`}
        />
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-lg font-semibold">
                {prescription.medications.map(med => med.name).join(", ")}
              </CardTitle>
              <CardDescription>
                Prescribed by Dr. {prescription.doctor?.user?.firstName} {prescription.doctor?.user?.lastName}
              </CardDescription>
            </div>
            <Badge variant={activeTab === "active" ? "success" : "secondary"}>
              {activeTab === "active" ? "Active" : "Expired"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center text-sm">
                <Calendar className="h-4 w-4 mr-2 text-slate-500" />
                <span>
                  <span className="font-medium">Start Date:</span>{" "}
                  {new Date(prescription.startDate).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center text-sm">
                <Calendar className="h-4 w-4 mr-2 text-slate-500" />
                <span>
                  <span className="font-medium">End Date:</span>{" "}
                  {new Date(prescription.endDate).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="pt-2">
              <h4 className="text-sm font-medium mb-2">Medications:</h4>
              <ul className="space-y-2">
                {prescription.medications.map((medication, index) => (
                  <li key={index} className="bg-slate-50 dark:bg-slate-800 p-3 rounded-md">
                    <div className="flex items-start">
                      <Pill className="h-5 w-5 mr-2 text-blue-500 mt-0.5" />
                      <div>
                        <p className="font-medium">{medication.name}</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          {medication.dosage} - {medication.frequency}
                        </p>
                        {medication.instructions && (
                          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                            <span className="font-medium">Instructions:</span> {medication.instructions}
                          </p>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {prescription.notes && (
              <div className="pt-2">
                <h4 className="text-sm font-medium mb-1">Doctor's Notes:</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 p-3 rounded-md">
                  {prescription.notes}
                </p>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="border-t border-slate-200 dark:border-slate-700 pt-4">
          <div className="flex space-x-2 w-full">
            {prescription.fileUrl && (
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => downloadPrescription(prescription._id)}
              >
                <Download className="h-4 w-4 mr-2" />
                Download Prescription
              </Button>
            )}
            <Link href={`/patient/prescriptions/${prescription._id}`} passHref>
              <Button variant="outline" size="sm" className="flex-1">
                <FileText className="h-4 w-4 mr-2" />
                View Details
              </Button>
            </Link>
          </div>
        </CardFooter>
      </Card>
    ));
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto py-6 px-4 md:px-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Prescriptions</h1>
            <p className="text-muted-foreground">
              View and manage your medication prescriptions
            </p>
          </div>
          <Button
            className="mt-4 md:mt-0"
            onClick={loadPrescriptions}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        <Tabs defaultValue="active" value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList key="tabs-list" className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="active" key="active-tab">Active Prescriptions</TabsTrigger>
            <TabsTrigger value="past" key="past-tab">Past Prescriptions</TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="mt-0">
            {renderPrescriptions()}
          </TabsContent>

          <TabsContent value="past" className="mt-0">
            {renderPrescriptions()}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
