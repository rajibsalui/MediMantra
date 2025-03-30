"use client";

import { useState, useRef, useEffect } from "react";
import { gsap } from "gsap";
import { Loader2 } from "lucide-react";
import StepProgress from "./StepProgress";
import Step1DoctorSelection from "./Step1DoctorSelection";
import Step2PatientInfo from "./Step2PatientInfo";
import Step3Confirmation from "./Step3Confirmation";
import { DoctorListProvider } from "@/contexts/DoctorListContext";
import { useAppointment } from "@/contexts/AppointmentContext";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

export default function AppointmentContent() {
  const { user, isAuthenticated } = useAuth();
  const { 
    appointmentDetails, 
    updateAppointmentDetails, 
    bookAppointment, 
    loading,
    getAvailableTimeSlots
  } = useAppointment();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState(""); // Add state for search term
  const router = useRouter();
  
  // Refs for animations
  const headerRef = useRef(null);
  
  // GSAP animations for header
  useEffect(() => {
    gsap.from(headerRef.current, {
      y: -50,
      duration: 1,
      ease: "power3.out"
    });
  }, []);

  // Check authentication
  useEffect(() => {
    if (!isAuthenticated && currentStep > 1) {
      router.push("/auth/login?redirect=/appointments");
    }
  }, [isAuthenticated, currentStep, router]);

  // Handle file upload for prescriptions
  const handleFileChange = (e) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      updateAppointmentDetails("prescriptionFiles", [
        ...appointmentDetails.prescriptionFiles,
        ...newFiles
      ]);
    }
  };
  
  // Remove file from prescriptions
  const removeFile = (index) => {
    const updatedFiles = [...appointmentDetails.prescriptionFiles];
    updatedFiles.splice(index, 1);
    updateAppointmentDetails("prescriptionFiles", updatedFiles);
  };
  
  // Navigation functions
  const goToNextStep = () => {
    setCurrentStep((prev) => prev + 1);
  };
  
  const goToPrevStep = () => {
    setCurrentStep((prev) => prev - 1);
  };
  
  // Confirm appointment booking
  const confirmAppointment = async () => {
    try {
      setIsLoading(true);
      await bookAppointment();
      // Redirect to appointments list after successful booking
      router.push("/dashboard/appointments");
    } catch (error) {
      console.error("Error booking appointment:", error);
      setIsLoading(false);
    }
  };

  // Add a handler for search changes
  const handleSearchChange = (value) => {
    setSearchTerm(value);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {isLoading && (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-lg text-center">
            <Loader2 className="h-10 w-10 text-blue-600 animate-spin mb-4" />
            <p className="text-lg font-medium">
              {currentStep === 3 ? "Booking your appointment..." : "Loading..."}
            </p>
            <p className="text-sm text-muted-foreground mt-1 text-center">
              {currentStep === 3 
                ? "Please don't close this window." 
                : "This will only take a moment."}
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <div 
        ref={headerRef}
        className="bg-blue-600 text-white py-8 px-6 md:py-16 md:px-0"
      >
        <div className="container mx-auto">
          <div className="max-w-3xl">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">Book Your Doctor Appointment</h1>
            <p className="text-blue-100 text-lg md:text-xl">Find the right specialist, choose a convenient time, and take control of your health journey.</p>
          </div>
        </div>
      </div>
      
      {/* Progress indicator */}
      <div className="container mx-auto py-8">
        <StepProgress currentStep={currentStep} />

        {/* Main content based on step */}
        <div className="max-w-6xl mx-auto">
          {currentStep === 1 && (
            <DoctorListProvider>
              <Step1DoctorSelection 
                selectedDoctor={appointmentDetails.doctor}
                selectedDate={appointmentDetails.date}
                selectedTimeSlot={appointmentDetails.timeSlot}
                onDoctorSelect={(doctor) => updateAppointmentDetails("doctor", doctor)}
                onDateSelect={(date) => updateAppointmentDetails("date", date)}
                onTimeSlotSelect={(timeSlot) => updateAppointmentDetails("timeSlot", timeSlot)}
                getAvailableTimeSlots={getAvailableTimeSlots}
                onNext={goToNextStep}
                searchTerm={searchTerm}
                onSearchChange={handleSearchChange}
              />
            </DoctorListProvider>
          )}
          
          {currentStep === 2 && (
            <Step2PatientInfo
              appointmentDetails={appointmentDetails}
              updateAppointmentDetails={updateAppointmentDetails}
              prescriptionFiles={appointmentDetails.prescriptionFiles}
              onFileUpload={handleFileChange}
              onFileRemove={removeFile}
              onNext={goToNextStep}
              onBack={goToPrevStep}
            />
          )}
          
          {currentStep === 3 && (
            <Step3Confirmation
              appointmentDetails={appointmentDetails}
              onBack={goToPrevStep}
              onConfirm={confirmAppointment}
              isLoading={loading}
            />
          )}
        </div>
      </div>
    </div>
  );
}