"use client";

import { useRef, useState, useEffect } from "react";
import { gsap } from "gsap";
import { Upload, AlertCircle, CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { insuranceProviders } from "./data";

export default function Step2PatientInfo({
  appointmentDetails,
  updateAppointmentDetails,
  prescriptionFiles,
  onFileUpload,
  onFileRemove,
  onNext,
  onBack
}) {
  const formRef = useRef(null);
  const [dob, setDob] = useState(null);
  
  // GSAP animations
  useEffect(() => {
    gsap.from(formRef.current, {
      opacity: 0,
      y: 20,
      duration: 0.6,
      ease: "power2.out"
    });
  }, []);

  // Handle date selection
  const handleDateSelect = (date) => {
    setDob(date);
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    onNext();
  };

  return (
    <div ref={formRef} className="animate-in">
      <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
        <h2 className="text-2xl font-bold mb-6">Patient Information</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Appointment type */}
          <div className="space-y-3">
            <Label>Appointment Type</Label>
            <RadioGroup 
              value={appointmentDetails.appointmentType}
              onValueChange={(value) => updateAppointmentDetails("appointmentType", value)}
              className="flex flex-col sm:flex-row gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="in-person" id="in-person" />
                <Label htmlFor="in-person" className="cursor-pointer">In-Person Visit</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="video" id="video" />
                <Label htmlFor="video" className="cursor-pointer">Video Consultation</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="phone" id="phone" />
                <Label htmlFor="phone" className="cursor-pointer">Phone Consultation</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Reason for visit */}
          <div className="space-y-2">
            <Label htmlFor="reason">Reason for Visit</Label>
            <Textarea 
              id="reason" 
              placeholder="Please describe your symptoms or reason for the appointment" 
              value={appointmentDetails.reason}
              onChange={(e) => updateAppointmentDetails("reason", e.target.value)}
              className="min-h-[100px]"
            />
          </div>

          {/* Insurance */}
          <div className="space-y-2">
            <Label htmlFor="insurance">Insurance Provider</Label>
            <Select 
              value={appointmentDetails.insurance || ""}
              onValueChange={(value) => updateAppointmentDetails("insurance", value)}
            >
              <SelectTrigger id="insurance">
                <SelectValue placeholder="Select your insurance provider" />
              </SelectTrigger>
              <SelectContent>
                {insuranceProviders.map((provider) => (
                  <SelectItem key={provider} value={provider}>
                    {provider}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date of Birth - Fixed Calendar Implementation */}
          <div className="space-y-2">
            <Label htmlFor="dob">Date of Birth</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="dob"
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dob ? (
                    <span>{dob.toLocaleDateString()}</span>
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={dob}
                  onSelect={handleDateSelect}
                  disabled={(date) => date > new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Prescription upload */}
          <div className="space-y-4">
            <Label>Upload Prescriptions (Optional)</Label>
            <div className="border-2 border-dashed rounded-lg p-6 text-center">
              <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm text-muted-foreground mb-1">Drag and drop files or</p>
              <Input
                type="file"
                id="prescription"
                className="hidden"
                onChange={onFileUpload}
                accept=".jpg,.jpeg,.png,.pdf"
                multiple
              />
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={() => document.getElementById("prescription").click()}
              >
                Browse files
              </Button>
            </div>
            
            {/* File list */}
            {prescriptionFiles.length > 0 && (
              <div className="space-y-2">
                <p className="font-medium text-sm">Uploaded files:</p>
                <ul className="space-y-2">
                  {prescriptionFiles.map((file, index) => (
                    <li key={index} className="flex items-center justify-between bg-blue-50 p-2 rounded text-sm">
                      <span className="truncate">{file.name}</span>
                      <Button 
                        type="button"
                        variant="ghost" 
                        size="sm" 
                        onClick={() => onFileRemove(index)}
                      >
                        Remove
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            <div className="bg-amber-50 border border-amber-200 rounded p-3 text-sm flex">
              <AlertCircle className="h-5 w-5 text-amber-500 mr-2 flex-shrink-0" />
              <p className="text-amber-800">
                Please bring your ID and insurance card to your appointment.
              </p>
            </div>
          </div>
          
          <div className="flex justify-between pt-4">
            <Button type="button" variant="outline" onClick={onBack}>
              Back
            </Button>
            <Button type="submit">
              Continue
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}