"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import axios from "axios";
import Link from "next/link";
import { API_URL } from '@/config/environment';

// This ensures the page is only rendered on the client side
export const dynamic = 'force-dynamic';
export const runtime = 'edge';


import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { Calendar, Plus, Trash, ArrowLeft } from "lucide-react";

export default function NewPrescriptionPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [selectedPatient, setSelectedPatient] = useState("");
  const [selectedAppointment, setSelectedAppointment] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [notes, setNotes] = useState("");
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date(new Date().setDate(new Date().getDate() + 30)).toISOString().split('T')[0]);
  const [medications, setMedications] = useState([{
    name: "",
    dosage: "",
    frequency: "",
    duration: "",
    instructions: ""
  }]);

  // Filtered appointments based on selected patient
  const [filteredAppointments, setFilteredAppointments] = useState([]);

  useEffect(() => {
    // Redirect if not authenticated or not a doctor
    if (!authLoading && (!isAuthenticated || user?.role !== "doctor")) {
      toast.error("You must be logged in as a doctor to access this page");
      router.push("/auth/login");
    }
  }, [isAuthenticated, user, authLoading, router]);

  // Store token in a ref to avoid direct localStorage access during render
  const tokenRef = useRef("");

  // Get token from localStorage only after component mounts
  useEffect(() => {
    if (typeof window !== 'undefined') {
      tokenRef.current = localStorage.getItem("token") || "";
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (!isAuthenticated || user?.role !== "doctor" || !tokenRef.current) return;

      try {
        setLoading(true);
        setError(null);

        // Fetch patients
        const patientsResponse = await axios.get(`${API_URL}/doctors/patients`, {
          headers: {
            Authorization: `Bearer ${tokenRef.current}`,
          },
        });

        // Fetch appointments
        const appointmentsResponse = await axios.get(`${API_URL}/doctors/appointments`, {
          headers: {
            Authorization: `Bearer ${tokenRef.current}`,
          },
        });

        const patientsData = patientsResponse.data.data || [];
        const appointmentsData = appointmentsResponse.data.data || [];

        setPatients(patientsData);
        setAppointments(appointmentsData);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load data. Please try again.");
        toast.error("Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated, user, tokenRef.current]);

  // Handle patient selection change
  useEffect(() => {
    if (selectedPatient) {
      // Filter appointments for the selected patient
      const patientAppointments = appointments.filter(
        (apt) => apt.patient?._id === selectedPatient && apt.status === "completed"
      );
      setFilteredAppointments(patientAppointments);
    } else {
      setFilteredAppointments([]);
    }
  }, [selectedPatient, appointments]);

  // Add a new medication field
  const addMedication = () => {
    setMedications([...medications, {
      name: "",
      dosage: "",
      frequency: "",
      duration: "",
      instructions: ""
    }]);
  };

  // Remove a medication field
  const removeMedication = (index) => {
    if (medications.length > 1) {
      const updatedMedications = [...medications];
      updatedMedications.splice(index, 1);
      setMedications(updatedMedications);
    } else {
      toast.error("At least one medication is required");
    }
  };

  // Update medication field
  const updateMedication = (index, field, value) => {
    const updatedMedications = [...medications];
    updatedMedications[index][field] = value;
    setMedications(updatedMedications);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    if (!selectedPatient) {
      toast.error("Please select a patient");
      return;
    }

    if (!medications[0].name || !medications[0].dosage || !medications[0].frequency || !medications[0].duration) {
      toast.error("Please fill in all required medication fields");
      return;
    }

    // Prepare data
    const data = {
      patientId: selectedPatient,
      appointmentId: selectedAppointment || undefined,
      diagnosis,
      notes,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      medications
    };

    try {
      setSubmitting(true);

      // Use the token from ref instead of directly accessing localStorage
      const response = await axios.post(`${API_URL}/prescriptions`, data, {
        headers: {
          Authorization: `Bearer ${tokenRef.current}`,
        },
      });

      if (response.data.success) {
        toast.success("Prescription created successfully");
        router.push("/doctor/prescriptions");
      } else {
        toast.error(response.data.message || "Failed to create prescription");
      }
    } catch (error) {
      console.error("Error creating prescription:", error);
      toast.error(error.response?.data?.message || error.message || "Failed to create prescription");
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || loading) {
    return (
      <DashboardLayout>
        <div className="container mx-auto py-6 px-4 md:px-6">
          <Skeleton className="h-10 w-1/3 mb-6" />
          <Skeleton className="h-6 w-1/4 mb-8" />
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-1/4 mb-2" />
              <Skeleton className="h-4 w-1/3" />
            </CardHeader>
            <CardContent className="space-y-6">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-20 w-full" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
              <Skeleton className="h-40 w-full" />
              <Skeleton className="h-20 w-full" />
              <div className="flex justify-end space-x-4">
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-10 w-36" />
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
          <h1 className="text-2xl font-bold tracking-tight mb-2">New Prescription</h1>
          <p className="text-red-500 mb-6">{error}</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto py-6 px-4 md:px-6">
        <h1 className="text-2xl font-bold tracking-tight mb-2">New Prescription</h1>
        <p className="text-muted-foreground mb-6">Create a new prescription for a patient</p>

        <Link href="/doctor/prescriptions">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Prescriptions
          </Button>
        </Link>

        <Card>
          <CardHeader>
            <CardTitle>Prescription Details</CardTitle>
            <CardDescription>
              Fill in the details below to create a new prescription
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Patient Selection */}
                <div className="space-y-2">
                  <Label htmlFor="patient">Patient <span className="text-red-500">*</span></Label>
                  <select
                    id="patient"
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={selectedPatient}
                    onChange={(e) => setSelectedPatient(e.target.value)}
                    required
                    disabled={submitting}
                  >
                    <option value="">Select a patient</option>
                    {patients.map((patient) => (
                      <option key={patient.patient._id} value={patient.patient._id}>
                        {patient.patient.user.firstName} {patient.patient.user.lastName}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Appointment Selection (Optional) */}
                <div className="space-y-2">
                  <Label htmlFor="appointment">Related Appointment (Optional)</Label>
                  <select
                    id="appointment"
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={selectedAppointment}
                    onChange={(e) => setSelectedAppointment(e.target.value)}
                    disabled={submitting || filteredAppointments.length === 0}
                  >
                    <option value="">None</option>
                    {filteredAppointments.map((appointment) => (
                      <option key={appointment._id} value={appointment._id}>
                        {new Date(appointment.appointmentDate).toLocaleDateString()} - {appointment.appointmentTime}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Diagnosis */}
              <div className="space-y-2">
                <Label htmlFor="diagnosis">Diagnosis</Label>
                <Textarea
                  id="diagnosis"
                  placeholder="Enter diagnosis"
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  disabled={submitting}
                  className="resize-none"
                  rows={3}
                />
              </div>

              {/* Prescription Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date <span className="text-red-500">*</span></Label>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                    <Input
                      id="startDate"
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      required
                      disabled={submitting}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date <span className="text-red-500">*</span></Label>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                    <Input
                      id="endDate"
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      required
                      disabled={submitting}
                      min={startDate}
                    />
                  </div>
                </div>
              </div>

              {/* Medications */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base">Medications <span className="text-red-500">*</span></Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addMedication}
                    disabled={submitting}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Medication
                  </Button>
                </div>

                {medications.map((medication, index) => (
                  <div key={index} className="border border-gray-200 rounded-md p-4 relative">
                    {medications.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute top-2 right-2 h-8 w-8 p-0"
                        onClick={() => removeMedication(index)}
                        disabled={submitting}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                      <div className="space-y-2">
                        <Label htmlFor={`medication-name-${index}`}>Medication Name <span className="text-red-500">*</span></Label>
                        <Input
                          id={`medication-name-${index}`}
                          placeholder="e.g., Amoxicillin"
                          value={medication.name}
                          onChange={(e) => updateMedication(index, 'name', e.target.value)}
                          required
                          disabled={submitting}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`medication-dosage-${index}`}>Dosage <span className="text-red-500">*</span></Label>
                        <Input
                          id={`medication-dosage-${index}`}
                          placeholder="e.g., 500mg"
                          value={medication.dosage}
                          onChange={(e) => updateMedication(index, 'dosage', e.target.value)}
                          required
                          disabled={submitting}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`medication-frequency-${index}`}>Frequency <span className="text-red-500">*</span></Label>
                        <Input
                          id={`medication-frequency-${index}`}
                          placeholder="e.g., Twice daily"
                          value={medication.frequency}
                          onChange={(e) => updateMedication(index, 'frequency', e.target.value)}
                          required
                          disabled={submitting}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`medication-duration-${index}`}>Duration <span className="text-red-500">*</span></Label>
                        <Input
                          id={`medication-duration-${index}`}
                          placeholder="e.g., 7 days"
                          value={medication.duration}
                          onChange={(e) => updateMedication(index, 'duration', e.target.value)}
                          required
                          disabled={submitting}
                        />
                      </div>
                    </div>

                    <div className="space-y-2 mt-4">
                      <Label htmlFor={`medication-instructions-${index}`}>Special Instructions (Optional)</Label>
                      <Textarea
                        id={`medication-instructions-${index}`}
                        placeholder="e.g., Take with food"
                        value={medication.instructions}
                        onChange={(e) => updateMedication(index, 'instructions', e.target.value)}
                        disabled={submitting}
                        className="resize-none"
                        rows={2}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Additional Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Enter any additional notes or instructions"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  disabled={submitting}
                  className="resize-none"
                  rows={3}
                />
              </div>

              {/* Form Actions */}
              <div className="flex justify-end space-x-4 pt-4">
                <Link href="/doctor/prescriptions">
                  <Button type="button" variant="outline" disabled={submitting}>
                    Cancel
                  </Button>
                </Link>
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Creating..." : "Create Prescription"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
