"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { toast } from "react-hot-toast";
import { format } from "date-fns";
import { API_URL, SOCKET_URL } from '@/config/environment';


import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
// import { useAuth } from "@/hooks/useAuth";
import { useAuth } from "@/contexts/AuthContext";

import {
  ArrowLeft,
  Calendar,
  Clock,
  Download,
  FileText,
  Pill,
  User,
  AlertTriangle,
  CheckCircle,
  XCircle,
} from "lucide-react";

export default function PrescriptionDetailPage({ params }) {
  const router = useRouter();
  const resolvedParams = use(params); // Unwrap the params Promise
  const id = resolvedParams.id;
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [prescription, setPrescription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    // Redirect if not authenticated or not a doctor
    if (!authLoading && (!isAuthenticated || user?.role !== "doctor")) {
      toast.error("You must be logged in as a doctor to access this page");
      router.push("/auth/login");
    }
  }, [isAuthenticated, user, authLoading, router]);

  useEffect(() => {
    if (isAuthenticated && user?.role === "doctor" && id) {
      loadPrescription();
    }
  }, [isAuthenticated, user, id]);

  const loadPrescription = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(`${API_URL}/prescriptions/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.data.success) {
        setPrescription(response.data.data);
      } else {
        setError(response.data.message || "Failed to load prescription");
        toast.error("Failed to load prescription");
      }
    } catch (err) {
      console.error("Error loading prescription:", err);
      setError("Failed to load prescription. Please try again.");
      toast.error("Failed to load prescription");
    } finally {
      setLoading(false);
    }
  };

  const updatePrescriptionStatus = async (status) => {
    try {
      setUpdatingStatus(true);

      const response = await axios.put(
        `${API_URL}/prescriptions/${id}/status`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.data.success) {
        setPrescription(response.data.data);
        toast.success(`Prescription marked as ${status}`);
      } else {
        toast.error(response.data.message || "Failed to update prescription status");
      }
    } catch (err) {
      console.error("Error updating prescription status:", err);
      toast.error(err.response?.data?.message || "Failed to update prescription status");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const downloadPrescription = async () => {
    try {
      const response = await axios.get(`${API_URL}/prescriptions/${id}/download`, {
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

  if (authLoading || loading) {
    return (
      <DashboardLayout>
        <div className="container mx-auto py-6 px-4 md:px-6">
          <div className="flex items-center mb-6">
            <Skeleton className="h-10 w-10 mr-4" />
            <Skeleton className="h-8 w-48" />
          </div>
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-64 mb-2" />
              <Skeleton className="h-4 w-40" />
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <Skeleton className="h-16 w-64 mb-4 md:mb-0" />
                <Skeleton className="h-10 w-32" />
              </div>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-40 w-full" />
              <div className="flex justify-end space-x-4">
                <Skeleton className="h-10 w-32" />
                <Skeleton className="h-10 w-32" />
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="container mx-auto py-6 px-4 md:px-6">
          <Link href="/doctor/prescriptions">
            <Button variant="ghost" className="mb-6">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Prescriptions
            </Button>
          </Link>
          <Card>
            <CardContent className="p-6 text-center">
              <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-2">Error Loading Prescription</h2>
              <p className="text-gray-500 dark:text-gray-400 mb-4">{error}</p>
              <Button onClick={loadPrescription}>Try Again</Button>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  if (!prescription) {
    return (
      <DashboardLayout>
        <div className="container mx-auto py-6 px-4 md:px-6">
          <Link href="/doctor/prescriptions">
            <Button variant="ghost" className="mb-6">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Prescriptions
            </Button>
          </Link>
          <Card>
            <CardContent className="p-6 text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-2">Prescription Not Found</h2>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                The prescription you're looking for doesn't exist or has been removed.
              </p>
              <Link href="/doctor/prescriptions">
                <Button>View All Prescriptions</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  const isActive = new Date(prescription.endDate) >= new Date() && prescription.status === "active";

  return (
    <DashboardLayout>
      <div className="container mx-auto py-6 px-4 md:px-6">
        <Link href="/doctor/prescriptions">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Prescriptions
          </Button>
        </Link>

        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle className="text-xl">Prescription Details</CardTitle>
                <CardDescription>
                  Created on {format(new Date(prescription.createdAt), "MMMM d, yyyy")}
                </CardDescription>
              </div>
              <Badge
                variant={isActive ? "success" : "secondary"}
                className="mt-2 md:mt-0"
              >
                {isActive ? "Active" : "Expired"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Patient Information */}
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <h3 className="font-medium mb-3 flex items-center">
                <User className="h-5 w-5 mr-2 text-blue-500" />
                Patient Information
              </h3>
              <div className="flex items-center">
                <Avatar className="h-12 w-12 mr-4">
                  <AvatarImage
                    src={prescription.patient?.user?.profileImage}
                    alt={`${prescription.patient?.user?.firstName} ${prescription.patient?.user?.lastName}`}
                  />
                  <AvatarFallback>
                    {prescription.patient?.user?.firstName?.[0]}
                    {prescription.patient?.user?.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-medium">
                    {prescription.patient?.user?.firstName} {prescription.patient?.user?.lastName}
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Patient ID: {prescription.patient?._id}
                  </p>
                </div>
              </div>
            </div>

            {/* Prescription Dates */}
            <div className="flex flex-col md:flex-row md:space-x-4">
              <div className="flex-1 mb-4 md:mb-0">
                <h3 className="font-medium mb-2 flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-green-500" />
                  Validity Period
                </h3>
                <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Start Date:</span>
                    <span>{format(new Date(prescription.startDate), "MMMM d, yyyy")}</span>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm text-gray-500 dark:text-gray-400">End Date:</span>
                    <span>{format(new Date(prescription.endDate), "MMMM d, yyyy")}</span>
                  </div>
                </div>
              </div>

              <div className="flex-1">
                <h3 className="font-medium mb-2 flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-amber-500" />
                  Status Information
                </h3>
                <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Status:</span>
                    <Badge variant={prescription.status === "active" ? "success" : "secondary"}>
                      {prescription.status.charAt(0).toUpperCase() + prescription.status.slice(1)}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Days Remaining:</span>
                    <span>
                      {isActive
                        ? Math.ceil((new Date(prescription.endDate) - new Date()) / (1000 * 60 * 60 * 24))
                        : 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Diagnosis */}
            {prescription.diagnosis && (
              <div>
                <h3 className="font-medium mb-2">Diagnosis</h3>
                <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                  <p>{prescription.diagnosis}</p>
                </div>
              </div>
            )}

            {/* Medications */}
            <div>
              <h3 className="font-medium mb-3 flex items-center">
                <Pill className="h-5 w-5 mr-2 text-purple-500" />
                Medications
              </h3>
              <div className="space-y-3">
                {prescription.medications.map((medication, index) => (
                  <Card key={index} className="border border-gray-200 dark:border-gray-700">
                    <CardContent className="p-4">
                      <h4 className="font-medium">{medication.name}</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-2">
                        <div>
                          <span className="text-xs text-gray-500 dark:text-gray-400 block">
                            Dosage
                          </span>
                          <span>{medication.dosage}</span>
                        </div>
                        <div>
                          <span className="text-xs text-gray-500 dark:text-gray-400 block">
                            Frequency
                          </span>
                          <span>{medication.frequency}</span>
                        </div>
                        <div>
                          <span className="text-xs text-gray-500 dark:text-gray-400 block">
                            Duration
                          </span>
                          <span>{medication.duration}</span>
                        </div>
                      </div>
                      {medication.instructions && (
                        <div className="mt-3">
                          <span className="text-xs text-gray-500 dark:text-gray-400 block">
                            Instructions
                          </span>
                          <p className="text-sm">{medication.instructions}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Additional Notes */}
            {prescription.notes && (
              <div>
                <h3 className="font-medium mb-2">Additional Notes</h3>
                <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                  <p>{prescription.notes}</p>
                </div>
              </div>
            )}

            <Separator />

            {/* Actions */}
            <div className="flex flex-col md:flex-row md:justify-between items-center space-y-4 md:space-y-0">
              <div className="flex space-x-4">
                {prescription.status === "active" ? (
                  <Button
                    variant="outline"
                    onClick={() => updatePrescriptionStatus("completed")}
                    disabled={updatingStatus}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Mark as Completed
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    onClick={() => updatePrescriptionStatus("active")}
                    disabled={updatingStatus}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Reactivate
                  </Button>
                )}
                {prescription.status !== "cancelled" && (
                  <Button
                    variant="destructive"
                    onClick={() => updatePrescriptionStatus("cancelled")}
                    disabled={updatingStatus}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                )}
              </div>
              {prescription.fileUrl && (
                <Button onClick={downloadPrescription}>
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
