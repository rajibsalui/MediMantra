"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "react-hot-toast";
import axios from "axios";
import { useAuth } from "@/contexts/AuthContext";
import { useDoctor } from "@/contexts/DoctorContext";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { API_URL } from "@/config/environment";
import {
  ArrowLeft,
  Calendar,
  FileText,
  Pill,
  Phone,
  Mail,
  MapPin,
  Clock,
  AlertCircle,
  Activity,
  Heart,
  Droplet,
  Weight,
  Ruler,
  Plus,
  Edit,
  ChevronRight,
} from "lucide-react";

export default function PatientDetailPage({ params }) {
  const router = useRouter();
  const resolvedParams = use(params); // Unwrap the params Promise
    const id = resolvedParams.id;
  const { user, isAuthenticated, loading: authLoading, token } = useAuth();
  const { doctor } = useDoctor();

  const [patient, setPatient] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");

  // Redirect if not authenticated or not a doctor
  useEffect(() => {
    if (!authLoading && (!isAuthenticated || user?.role !== "doctor")) {
      toast.error("You must be logged in as a doctor to access this page");
      router.push("/auth/login");
    }
  }, [isAuthenticated, user, authLoading, router]);

  // Load patient data when authenticated
  useEffect(() => {
    if (isAuthenticated && user?.role === "doctor" && id) {
      loadPatientData();
    }
  }, [isAuthenticated, user, id]);

  const loadPatientData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get auth headers
      const headers = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };

      // Fetch patient details
      const patientResponse = await axios.get(`${API_URL}/doctors/patients/${id}`, headers);

      if (patientResponse.data.success) {
        setPatient(patientResponse.data.data);

        // Fetch patient appointments
        const appointmentsResponse = await axios.get(
          `${API_URL}/doctors/patients/${id}/appointments`,
          headers
        );

        if (appointmentsResponse.data.success) {
          setAppointments(appointmentsResponse.data.data || []);
        }

        // Fetch patient prescriptions
        const prescriptionsResponse = await axios.get(
          `${API_URL}/doctors/patients/${id}/prescriptions`,
          headers
        );

        if (prescriptionsResponse.data.success) {
          setPrescriptions(prescriptionsResponse.data.data || []);
        }

        // Fetch patient medical records
        const recordsResponse = await axios.get(
          `${API_URL}/doctors/patients/${id}/medical-records`,
          headers
        );

        if (recordsResponse.data.success) {
          setMedicalRecords(recordsResponse.data.data || []);
        }
      } else {
        setError(patientResponse.data.message || "Failed to load patient data");
        toast.error("Failed to load patient data");
      }
    } catch (err) {
      console.error("Error loading patient data:", err);
      setError(err.response?.data?.message || "An error occurred while loading patient data");
      toast.error("Failed to load patient data");
    } finally {
      setLoading(false);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Format time
  const formatTime = (timeString) => {
    if (!timeString) return "N/A";
    return timeString;
  };

  // Get appointment status badge
  const getStatusBadge = (status) => {
    const statusStyles = {
      scheduled: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
      completed: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
      cancelled: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
      "no-show": "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
    };

    return (
      <Badge className={`${statusStyles[status] || ""}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  // Render loading skeleton
  if (loading) {
    return (
      <DashboardLayout>
        <div className="container mx-auto py-6 px-4 md:px-6">
          <div className="flex items-center mb-6">
            <Skeleton className="h-10 w-24 mr-4" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <Card>
                <CardContent className="p-6">
                  <div className="flex flex-col items-center">
                    <Skeleton className="h-24 w-24 rounded-full mb-4" />
                    <Skeleton className="h-6 w-40 mb-2" />
                    <Skeleton className="h-4 w-24 mb-6" />
                    <div className="w-full space-y-4">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            <div className="lg:col-span-2">
              <Card>
                <CardContent className="p-6">
                  <Skeleton className="h-8 w-32 mb-4" />
                  <div className="space-y-4">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Render error state
  if (error || !patient) {
    return (
      <DashboardLayout>
        <div className="container mx-auto py-6 px-4 md:px-6">
          <Link href="/doctor/patients">
            <Button variant="ghost" className="mb-6">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Patients
            </Button>
          </Link>
          <Card>
            <CardContent className="p-6 text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-2">Patient Not Found</h2>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                {error || "The patient you're looking for doesn't exist or has been removed."}
              </p>
              <Link href="/doctor/patients">
                <Button>View All Patients</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto py-6 px-4 md:px-6">
        <Link href="/doctor/patients">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Patients
          </Button>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Patient Profile Card */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center">
                  <Avatar className="h-24 w-24 mb-4">
                    <AvatarImage src={patient.user?.profileImage || "/placeholder-patient.png"} />
                    <AvatarFallback>
                      {patient.user?.firstName?.[0]}
                      {patient.user?.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <h2 className="text-xl font-bold">
                    {patient.user?.firstName} {patient.user?.lastName}
                  </h2>
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    {patient.user?.gender || "Not specified"} • {patient.age || "--"} years
                  </p>

                  <div className="flex justify-center space-x-2 mb-6">
                    <Link href={`/doctor/appointments/new?patient=${patient._id}`}>
                      <Button size="sm" className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2" />
                        New Appointment
                      </Button>
                    </Link>
                    <Link href={`/doctor/prescriptions/new?patient=${patient._id}`}>
                      <Button size="sm" variant="outline" className="flex items-center">
                        <Pill className="h-4 w-4 mr-2" />
                        New Prescription
                      </Button>
                    </Link>
                  </div>

                  <div className="w-full space-y-4">
                    {patient.user?.phone && (
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 text-gray-500 dark:text-gray-400 mr-3" />
                        <span>{patient.user.phone}</span>
                      </div>
                    )}
                    {patient.user?.email && (
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 text-gray-500 dark:text-gray-400 mr-3" />
                        <span>{patient.user.email}</span>
                      </div>
                    )}
                    {patient.address && (
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 text-gray-500 dark:text-gray-400 mr-3" />
                        <span>
                          {patient.address.street}, {patient.address.city}, {patient.address.state} {patient.address.zipCode}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="w-full mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <h3 className="font-medium mb-3 text-left">Medical Information</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg flex flex-col items-center">
                        <Droplet className="h-5 w-5 text-red-500 mb-1" />
                        <span className="text-xs text-gray-500 dark:text-gray-400">Blood Type</span>
                        <span className="font-medium">{patient.bloodGroup || "Unknown"}</span>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg flex flex-col items-center">
                        <Weight className="h-5 w-5 text-blue-500 mb-1" />
                        <span className="text-xs text-gray-500 dark:text-gray-400">Weight</span>
                        <span className="font-medium">
                          {patient.weight?.value ? `${patient.weight.value} ${patient.weight.unit}` : "Not recorded"}
                        </span>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg flex flex-col items-center">
                        <Ruler className="h-5 w-5 text-green-500 mb-1" />
                        <span className="text-xs text-gray-500 dark:text-gray-400">Height</span>
                        <span className="font-medium">
                          {patient.height?.value ? `${patient.height.value} ${patient.height.unit}` : "Not recorded"}
                        </span>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg flex flex-col items-center">
                        <Activity className="h-5 w-5 text-purple-500 mb-1" />
                        <span className="text-xs text-gray-500 dark:text-gray-400">Last Checkup</span>
                        <span className="font-medium">
                          {patient.lastCheckup ? formatDate(patient.lastCheckup) : "None"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Patient Details Tabs */}
          <div className="lg:col-span-2">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList key="tabs-list" className="grid grid-cols-4 mb-6">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="appointments">Appointments</TabsTrigger>
                <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
                <TabsTrigger value="records">Medical Records</TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Medical History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {patient.allergies && patient.allergies.length > 0 ? (
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Allergies</h4>
                          <ul className="list-disc pl-5 space-y-1">
                            {patient.allergies.map((allergy, index) => (
                              <li key={index} className="text-gray-600 dark:text-gray-300">
                                {allergy.name} - {allergy.severity} {allergy.reaction && `(${allergy.reaction})`}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ) : (
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Allergies</h4>
                          <p className="text-gray-500 dark:text-gray-400">No known allergies</p>
                        </div>
                      )}

                      {patient.chronicConditions && patient.chronicConditions.length > 0 ? (
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Chronic Conditions</h4>
                          <ul className="list-disc pl-5 space-y-1">
                            {patient.chronicConditions.map((condition, index) => (
                              <li key={index} className="text-gray-600 dark:text-gray-300">
                                {condition.name} - Diagnosed: {formatDate(condition.diagnosedDate)}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ) : (
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Chronic Conditions</h4>
                          <p className="text-gray-500 dark:text-gray-400">No chronic conditions</p>
                        </div>
                      )}

                      {patient.currentMedications && patient.currentMedications.length > 0 ? (
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Current Medications</h4>
                          <ul className="list-disc pl-5 space-y-1">
                            {patient.currentMedications.map((medication, index) => (
                              <li key={index} className="text-gray-600 dark:text-gray-300">
                                {medication.name} - {medication.dosage} ({medication.frequency})
                              </li>
                            ))}
                          </ul>
                        </div>
                      ) : (
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Current Medications</h4>
                          <p className="text-gray-500 dark:text-gray-400">No current medications</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Emergency Contact</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {patient.emergencyContact ? (
                      <div className="space-y-2">
                        <p className="font-medium">
                          {patient.emergencyContact.name} ({patient.emergencyContact.relationship})
                        </p>
                        <p className="text-gray-600 dark:text-gray-300">
                          <Phone className="h-4 w-4 inline mr-2" />
                          {patient.emergencyContact.phone}
                        </p>
                        {patient.emergencyContact.address && (
                          <p className="text-gray-600 dark:text-gray-300">
                            <MapPin className="h-4 w-4 inline mr-2" />
                            {patient.emergencyContact.address}
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="text-gray-500 dark:text-gray-400">No emergency contact information</p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Insurance Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {patient.insuranceInfo && patient.insuranceInfo.provider ? (
                      <div className="space-y-2">
                        <p>
                          <span className="font-medium">Provider:</span> {patient.insuranceInfo.provider}
                        </p>
                        <p>
                          <span className="font-medium">Policy Number:</span> {patient.insuranceInfo.policyNumber}
                        </p>
                        {patient.insuranceInfo.groupNumber && (
                          <p>
                            <span className="font-medium">Group Number:</span> {patient.insuranceInfo.groupNumber}
                          </p>
                        )}
                        {patient.insuranceInfo.primaryInsured && (
                          <p>
                            <span className="font-medium">Primary Insured:</span> {patient.insuranceInfo.primaryInsured}
                          </p>
                        )}
                        {patient.insuranceInfo.coverageStartDate && (
                          <p>
                            <span className="font-medium">Coverage Period:</span>{" "}
                            {formatDate(patient.insuranceInfo.coverageStartDate)} to{" "}
                            {patient.insuranceInfo.coverageEndDate
                              ? formatDate(patient.insuranceInfo.coverageEndDate)
                              : "Present"}
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="text-gray-500 dark:text-gray-400">No insurance information</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Appointments Tab */}
              <TabsContent value="appointments">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-lg">Appointment History</CardTitle>
                    <Link href={`/doctor/appointments/new?patient=${patient._id}`}>
                      <Button size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        New Appointment
                      </Button>
                    </Link>
                  </CardHeader>
                  <CardContent>
                    {appointments.length === 0 ? (
                      <div className="text-center py-8">
                        <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">
                          No appointments yet
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                          This patient doesn't have any appointments scheduled.
                        </p>
                        <Link href={`/doctor/appointments/new?patient=${patient._id}`}>
                          <Button>Schedule Appointment</Button>
                        </Link>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {appointments.map((appointment) => (
                          <div
                            key={appointment._id}
                            className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                          >
                            <div className="flex items-start">
                              <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 mr-3">
                                <Calendar className="h-5 w-5" />
                              </div>
                              <div>
                                <div className="flex items-center">
                                  <h4 className="font-medium text-gray-900 dark:text-gray-100">
                                    {formatDate(appointment.appointmentDate)}
                                  </h4>
                                  <span className="mx-2">•</span>
                                  <span className="text-gray-600 dark:text-gray-300">
                                    {formatTime(appointment.appointmentTime)}
                                  </span>
                                  <span className="mx-2">•</span>
                                  {getStatusBadge(appointment.status)}
                                </div>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                  {appointment.appointmentType.charAt(0).toUpperCase() + appointment.appointmentType.slice(1)} • {appointment.reason || "No reason provided"}
                                </p>
                              </div>
                            </div>
                            <Link href={`/doctor/appointments/${appointment._id}`}>
                              <Button variant="ghost" size="sm" className="rounded-full">
                                <ChevronRight className="h-5 w-5" />
                              </Button>
                            </Link>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Prescriptions Tab */}
              <TabsContent value="prescriptions">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-lg">Prescriptions</CardTitle>
                    <Link href={`/doctor/prescriptions/new?patient=${patient._id}`}>
                      <Button size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        New Prescription
                      </Button>
                    </Link>
                  </CardHeader>
                  <CardContent>
                    {prescriptions.length === 0 ? (
                      <div className="text-center py-8">
                        <Pill className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">
                          No prescriptions yet
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                          This patient doesn't have any prescriptions.
                        </p>
                        <Link href={`/doctor/prescriptions/new?patient=${patient._id}`}>
                          <Button>Create Prescription</Button>
                        </Link>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {prescriptions.map((prescription) => (
                          <div
                            key={prescription._id}
                            className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                          >
                            <div className="flex items-start">
                              <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 mr-3">
                                <Pill className="h-5 w-5" />
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-900 dark:text-gray-100">
                                  {prescription.diagnosis || "Prescription"}
                                </h4>
                                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-1">
                                  <Clock className="h-3 w-3 mr-1" />
                                  <span>
                                    {formatDate(prescription.createdAt)} • {prescription.medications.length} medications
                                  </span>
                                </div>
                              </div>
                            </div>
                            <Link href={`/doctor/prescriptions/${prescription._id}`}>
                              <Button variant="ghost" size="sm" className="rounded-full">
                                <ChevronRight className="h-5 w-5" />
                              </Button>
                            </Link>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Medical Records Tab */}
              <TabsContent value="records">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-lg">Medical Records</CardTitle>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Record
                    </Button>
                  </CardHeader>
                  <CardContent>
                    {medicalRecords.length === 0 ? (
                      <div className="text-center py-8">
                        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">
                          No medical records yet
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                          This patient doesn't have any medical records.
                        </p>
                        <Button>Upload Medical Record</Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {medicalRecords.map((record) => (
                          <div
                            key={record._id}
                            className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                          >
                            <div className="flex items-start">
                              <div className="p-2 rounded-full bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 mr-3">
                                <FileText className="h-5 w-5" />
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-900 dark:text-gray-100">
                                  {record.documentType}
                                </h4>
                                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-1">
                                  <Clock className="h-3 w-3 mr-1" />
                                  <span>
                                    {formatDate(record.documentDate)} • {record.fileName}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <Button variant="outline" size="sm">
                                View
                              </Button>
                              <Button variant="ghost" size="sm" className="rounded-full">
                                <ChevronRight className="h-5 w-5" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
