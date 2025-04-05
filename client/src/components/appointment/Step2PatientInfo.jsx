"use client";

import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { Upload, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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

  // GSAP animations
  useEffect(() => {
    gsap.from(formRef.current, {
      // opacity: 0,
      y: 20,
      duration: 0.6,
      ease: "power2.out"
    });
  }, []);

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    onNext();
  };

  return (
    <div ref={formRef} className="animate-in">
      <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm mb-6">
        <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-slate-100">Patient Information</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Appointment type */}
          <div className="space-y-3">
            <Label className="text-slate-900 dark:text-slate-200">Appointment Type</Label>
            <RadioGroup
              value={appointmentDetails.appointmentType}
              onValueChange={(value) => updateAppointmentDetails("appointmentType", value)}
              className="flex flex-col sm:flex-row gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="in-person" id="in-person" className="text-blue-600 dark:text-blue-500" />
                <Label htmlFor="in-person" className="cursor-pointer text-slate-900 dark:text-slate-200">In-Person Visit</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="video" id="video" className="text-blue-600 dark:text-blue-500" />
                <Label htmlFor="video" className="cursor-pointer text-slate-900 dark:text-slate-200">Video Consultation</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="phone" id="phone" className="text-blue-600 dark:text-blue-500" />
                <Label htmlFor="phone" className="cursor-pointer text-slate-900 dark:text-slate-200">Phone Consultation</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Reason for visit */}
          <div className="space-y-2">
            <Label htmlFor="reason" className="text-slate-900 dark:text-slate-200">Reason for Visit</Label>
            <Textarea
              id="reason"
              placeholder="Please describe your symptoms or reason for the appointment"
              value={appointmentDetails.reason}
              onChange={(e) => updateAppointmentDetails("reason", e.target.value)}
              className="min-h-[100px] bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus-visible:ring-blue-500 placeholder:text-slate-500 dark:placeholder:text-slate-400"
            />
          </div>

          {/* Insurance */}
          <div className="space-y-2">
            <Label htmlFor="insurance" className="text-slate-900 dark:text-slate-200">Insurance Provider</Label>
            <Select
              value={appointmentDetails.insurance || ""}
              onValueChange={(value) => updateAppointmentDetails("insurance", value)}
            >
              <SelectTrigger id="insurance" className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100">
                <SelectValue placeholder="Select your insurance provider" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
                {insuranceProviders.map((provider) => (
                  <SelectItem key={provider} value={provider} className="text-slate-900 dark:text-slate-100">
                    {provider}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Prescription upload */}
          <div className="space-y-4">
            <Label className="text-slate-900 dark:text-slate-200">Upload Prescriptions (Optional)</Label>
            <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg p-6 text-center">
              <Upload className="h-8 w-8 mx-auto mb-2 text-slate-400 dark:text-slate-500" />
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Drag and drop files or</p>
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
                className="border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800"
                onClick={() => document.getElementById("prescription").click()}
              >
                Browse files
              </Button>
            </div>

            {/* File list */}
            {prescriptionFiles.length > 0 && (
              <div className="space-y-2">
                <p className="font-medium text-sm text-slate-900 dark:text-slate-200">Uploaded files:</p>
                <ul className="space-y-2">
                  {prescriptionFiles.map((file, index) => (
                    <li key={index} className="flex items-center justify-between bg-blue-50 dark:bg-blue-900/20 p-2 rounded text-sm text-slate-900 dark:text-slate-200">
                      <span className="truncate">{file.name}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100"
                        onClick={() => onFileRemove(index)}
                      >
                        Remove
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded p-3 text-sm flex">
              <AlertCircle className="h-5 w-5 text-amber-500 dark:text-amber-400 mr-2 flex-shrink-0" />
              <p className="text-amber-800 dark:text-amber-400">
                Please bring your ID and insurance card to your appointment.
              </p>
            </div>
          </div>

          <div className="flex justify-between pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onBack}
              className="border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Back
            </Button>
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white"
            >
              Continue
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}