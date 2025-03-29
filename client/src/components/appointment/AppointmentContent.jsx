"use client";

import { useState, useRef, useEffect } from "react";
import { gsap } from "gsap";
import { Loader2 } from "lucide-react";
import { doctors, specialties, timeSlots, insuranceProviders } from "./data";
import StepProgress from "./StepProgress";
import Step1DoctorSelection from "./Step1DoctorSelection";
import Step2PatientInfo from "./Step2PatientInfo";
import Step3Confirmation from "./Step3Confirmation";

export default function AppointmentContent() {
  // State
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("");
  const [currentStep, setCurrentStep] = useState(1);
  const [prescriptionFiles, setPrescriptionFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Refs for animations
  const headerRef = useRef(null);
  
  // GSAP animations for header
  useEffect(() => {
    gsap.from(headerRef.current, {
      y: -50,
      // opacity: 0,
      duration: 1,
      ease: "power3.out"
    });
  }, []);

  // Handle file upload for prescriptions
  const handleFileChange = (e) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setPrescriptionFiles([...prescriptionFiles, ...newFiles]);
    }
  };

  // Remove uploaded file
  const removeFile = (index) => {
    setPrescriptionFiles(prescriptionFiles.filter((_, i) => i !== index));
  };
  
  // Go to next step
  const goToNextStep = () => {
    setIsLoading(true);
    setTimeout(() => {
      window.scrollTo(0, 0);
      setCurrentStep(current => Math.min(current + 1, 3));
      setIsLoading(false);
    }, 800); 
  };

  // Go to previous step
  const goToPrevStep = () => {
    setIsLoading(true);
    setTimeout(() => {
      window.scrollTo(0, 0);
      setCurrentStep(current => Math.max(current - 1, 1));
      setIsLoading(false);
    }, 600);
  };

  // Confirm appointment
  const confirmAppointment = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      alert("Appointment booked successfully!");
    }, 1500);
  };

  // Get available time slots for selected date
  const getAvailableTimeSlots = () => {
    const dayOfWeek = selectedDate.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      return timeSlots.filter((_, index) => index % 3 === 0);
    }
    return timeSlots;
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50 dark:from-slate-950 dark:to-slate-900">
      {/* Loader Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-xl flex flex-col items-center max-w-xs w-full">
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
            <Step1DoctorSelection 
              doctors={doctors}
              specialties={specialties}
              selectedDoctor={selectedDoctor}
              selectedDate={selectedDate}
              selectedTimeSlot={selectedTimeSlot}
              searchTerm={searchTerm}
              selectedSpecialty={selectedSpecialty}
              onDoctorSelect={setSelectedDoctor}
              onDateSelect={setSelectedDate}
              onTimeSlotSelect={setSelectedTimeSlot}
              onSearchChange={setSearchTerm}
              onSpecialtyChange={setSelectedSpecialty}
              getAvailableTimeSlots={getAvailableTimeSlots}
              onNext={goToNextStep}
            />
          )}
          
          {currentStep === 2 && (
            <Step2PatientInfo
              prescriptionFiles={prescriptionFiles}
              onFileUpload={handleFileChange}
              onFileRemove={removeFile}
              onNext={goToNextStep}
              onBack={goToPrevStep}
            />
          )}
          
          {currentStep === 3 && (
            <Step3Confirmation
              selectedDoctor={selectedDoctor}
              selectedDate={selectedDate}
              selectedTimeSlot={selectedTimeSlot}
              prescriptionFiles={prescriptionFiles}
              insuranceProviders={insuranceProviders}
              onBack={goToPrevStep}
              onConfirm={confirmAppointment}
              isLoading={isLoading}
            />
          )}
        </div>
      </div>
    </div>
  );
}