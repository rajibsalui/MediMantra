"use client";

import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { Upload, FileText, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Textarea } from "@/components/ui/textarea";
import { Calendar as CalendarIcon } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";

// Sample insurance providers (could be moved to data.js)
const insuranceProviders = [
  "Blue Cross Blue Shield",
  "UnitedHealthcare",
  "Aetna",
  "Cigna",
  "Humana",
  "Medicare",
  "Medicaid",
  "Kaiser Permanente",
  "Other"
];

export default function Step2PatientInfo({
  prescriptionFiles,
  onFileUpload,
  onFileRemove,
  onNext,
  onBack
}) {
  const formRef = useRef(null);
  
  // GSAP animations
  useEffect(() => {
    // Form fields animation
    gsap.from(".form-animate", {
      y: 20,
      // opacity: 0,
      stagger: 0.1,
      duration: 0.5,
      delay: 0.2
    });
  }, []);
  
  return (
    <div className="space-y-8" ref={formRef}>
      <Card className="border-none shadow-md overflow-hidden">
        <CardHeader className="bg-blue-50 dark:bg-slate-800 pb-3">
          <CardTitle>Patient Information</CardTitle>
          <CardDescription>Please fill in your details below</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form className="space-y-6">
            <div className="form-animate grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input id="firstName" placeholder="Enter your first name" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" placeholder="Enter your last name" />
              </div>
            </div>

            <div className="form-animate grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="your@email.com" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" placeholder="(123) 456-7890" />
              </div>
            </div>

            <div className="form-animate grid md:grid-cols-2 gap-6">
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
                      <span>Pick a date</span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      disabled={(date) => date > new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select>
                  <SelectTrigger id="gender">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                    <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="form-animate space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input id="address" placeholder="Street address" />
            </div>

            <div className="form-animate grid md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input id="city" placeholder="City" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input id="state" placeholder="State" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="zip">Zip Code</Label>
                <Input id="zip" placeholder="Zip code" />
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="form-animate border-none shadow-md overflow-hidden">
        <CardHeader className="bg-blue-50 dark:bg-slate-800 pb-3">
          <CardTitle>Health Information</CardTitle>
          <CardDescription>This information helps your doctor prepare for your visit</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="reason">Reason for Visit</Label>
              <Textarea 
                id="reason"
                placeholder="Describe your symptoms or reason for the appointment"
                className="min-h-[100px]"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Have you seen this doctor before?</Label>
              <RadioGroup defaultValue="no" className="flex space-x-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="yes" />
                  <Label htmlFor="yes" className="cursor-pointer">Yes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="no" />
                  <Label htmlFor="no" className="cursor-pointer">No</Label>
                </div>
              </RadioGroup>
            </div>

            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="allergies">
                <AccordionTrigger>Do you have any allergies?</AccordionTrigger>
                <AccordionContent>
                  <Textarea 
                    placeholder="List any allergies to medications, foods, or other substances"
                    className="mt-2"
                  />
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="medications">
                <AccordionTrigger>Are you currently taking any medications?</AccordionTrigger>
                <AccordionContent>
                  <Textarea 
                    placeholder="List current medications including dosage and frequency"
                    className="mt-2"
                  />
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="conditions">
                <AccordionTrigger>Do you have any pre-existing medical conditions?</AccordionTrigger>
                <AccordionContent>
                  <Textarea 
                    placeholder="List any chronic conditions, previous surgeries, or relevant medical history"
                    className="mt-2"
                  />
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <div className="space-y-3">
              <Label>Insurance Information</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select insurance provider" />
                </SelectTrigger>
                <SelectContent>
                  {insuranceProviders.map(provider => (
                    <SelectItem key={provider} value={provider.toLowerCase().replace(/\s+/g, '-')}>
                      {provider}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <div className="grid md:grid-cols-2 gap-4 pt-2">
                <div className="space-y-2">
                  <Label htmlFor="policy">Policy Number</Label>
                  <Input id="policy" placeholder="Insurance policy number" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="group">Group Number (if applicable)</Label>
                  <Input id="group" placeholder="Group number" />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="form-animate border-none shadow-md overflow-hidden">
        <CardHeader className="bg-blue-50 dark:bg-slate-800 pb-3">
          <CardTitle>Previous Medical Records</CardTitle>
          <CardDescription>Upload any previous prescriptions, lab results, or medical reports</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-6">
            <div 
              className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg p-8 text-center hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
              onClick={() => document.getElementById('file-upload').click()}
            >
              <div className="mx-auto flex flex-col items-center">
                <Upload className="h-10 w-10 text-slate-400 mb-3" />
                <h3 className="text-lg font-medium mb-1">Upload Previous Medical Records</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Drag and drop files here or click to browse
                </p>
                <p className="text-xs text-muted-foreground">
                  Supported formats: PDF, JPG, PNG (max 10MB)
                </p>
                <input
                  id="file-upload"
                  type="file"
                  multiple
                  className="hidden"
                  onChange={onFileUpload}
                  accept="image/png, image/jpeg, application/pdf"
                />
              </div>
            </div>
            
            {/* Show uploaded files */}
            {prescriptionFiles.length > 0 && (
              <div className="space-y-3">
                <Label>Uploaded Files</Label>
                <div className="space-y-2">
                  {prescriptionFiles.map((file, i) => (
                    <div key={i} className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800 rounded-md">
                      <div className="flex items-center">
                        <FileText className="h-5 w-5 mr-2 text-blue-500" />
                        <span className="text-sm font-medium">{file.name}</span>
                        <span className="text-xs text-muted-foreground ml-2">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onFileRemove(i)}
                        className="h-8 w-8 p-0"
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      <div className="form-animate pt-2 space-y-4">
        <div className="flex items-start space-x-3">
          <Checkbox id="terms" />
          <div>
            <Label htmlFor="terms" className="text-sm font-medium">
              I agree to the terms and privacy policy
            </Label>
            <p className="text-sm text-muted-foreground mt-1">
              By scheduling this appointment, you agree to our cancellation policy and consent to telehealth services if applicable.
            </p>
          </div>
        </div>
      </div>

      {/* Navigation buttons */}
      <div className="pt-6 flex justify-between">
        <Button 
          variant="outline" 
          onClick={onBack}
        >
          Back
        </Button>
        <Button 
          onClick={onNext} 
          size="lg"
          className="min-w-[150px]"
        >
          Review & Confirm
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}