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
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const {
    appointmentDetails,
    updateAppointmentDetails,
    bookAppointment,
    loading,
    getAvailableTimeSlots,
    getAvailableDates
  } = useAppointment();

  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  // We use appointmentDetails.doctor instead of a separate state
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
    if (!authLoading && !isAuthenticated) {
      router.push("/auth/login?redirect=/appointments");
    }
  }, [isAuthenticated, authLoading, router]);

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
      console.log("Booking appointment with details:", appointmentDetails);
      console.log("Doctor object:", appointmentDetails.doctor);

      // Ensure doctor exists and has a valid ID
      if (!appointmentDetails.doctor) {
        console.error("Doctor object is missing");
        setIsLoading(false);
        return;
      } else if (!appointmentDetails.doctor._id && !appointmentDetails.doctor.id) {
        console.error("Doctor object does not have a valid ID");
        setIsLoading(false);
        return;
      }

      await bookAppointment();
      // Redirect to appointments list after successful booking
      const userID = localStorage.getItem("userId");
      router.push(`/${user.role}/dashboard/${userID}`);
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
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      {isLoading && (
        <div className="fixed inset-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 p-8 rounded-lg shadow-lg text-center">
            <Loader2 className="h-10 w-10 text-blue-600 dark:text-blue-500 animate-spin mb-4" />
            <p className="text-lg font-medium text-slate-900 dark:text-slate-100">
              {currentStep === 3 ? "Booking your appointment..." : "Loading..."}
            </p>
            <p className="text-sm mt-1 text-center text-slate-600 dark:text-slate-400">
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
        className="bg-blue-600 dark:bg-blue-800 text-white py-8 px-6 md:py-16 md:px-0"
      >
        <div className="container mx-auto">
          <div className="max-w-3xl">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">Book Your Doctor Appointment</h1>
            <p className="text-blue-100 dark:text-blue-100 text-lg md:text-xl">Find the right specialist, choose a convenient time, and take control of your health journey.</p>
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
                onDoctorSelect={(doctor) => {
                  // Update the doctor in the appointment context
                  updateAppointmentDetails("doctor", doctor);
                  console.log("Selected doctor:", doctor);
                }}
                onDateSelect={(date) => updateAppointmentDetails("date", date)}
                onTimeSlotSelect={(timeSlot) => {
                  // Store the selected time slot
                  updateAppointmentDetails("timeSlot", timeSlot);

                  // Find the slot object to get the display time
                  const selectedDate = appointmentDetails.date;
                  if (selectedDate && appointmentDetails.doctor) {
                    const doctorId = appointmentDetails.doctor._id || appointmentDetails.doctor.id;
                    getAvailableTimeSlots(doctorId, selectedDate).then(slots => {
                      const selectedSlot = slots.find(slot => slot.startTime === timeSlot);
                      if (selectedSlot && selectedSlot.displayTime) {
                        updateAppointmentDetails("displayTimeSlot", selectedSlot.displayTime);
                      }
                    });
                  }
                }}
                getAvailableTimeSlots={(date) => {
                  if (!appointmentDetails.doctor) return [];
                  const doctorId = appointmentDetails.doctor._id || appointmentDetails.doctor.id;
                  return getAvailableTimeSlots(doctorId, date);
                }}
                getAvailableDates={getAvailableDates}
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
              selectedDoctor={appointmentDetails.doctor}
              selectedDate={appointmentDetails.date}
              selectedTimeSlot={appointmentDetails.timeSlot}
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