"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
// import { ScrollArea } from "@/components/ui/scroll-area";
// import { Card, CardContent } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import {
//   Command,
//   CommandInput,
//   CommandList,
//   CommandGroup,
//   CommandItem,
// } from "@/components/ui/command";
import { BackgroundBeams } from "../ui/aceternity/background-beams";
import { SparklesCore } from "../ui/aceternity/sparkles";
// import { LampContainer } from "../ui/aceternity/lamp";
import { 
  Loader2, 
  CalendarIcon, 
  Eye, 
  EyeOff, 
  ArrowLeft, 
  ArrowRight, 
  Upload, 
  Check, 
  Clock, 
  Plus, 
  X, 
  FileText, 
  Award,
  MapPin,
  GraduationCap
} from "lucide-react";

const steps = [
  { id: "step-1", name: "Personal Information" },
  { id: "step-2", name: "Professional Information" },
  { id: "step-3", name: "Account Setup" },
  { id: "step-4", name: "Review" },
];

export default function DoctorSignupForm() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const fileInputRef = useRef(null);

  const formSchema = z.object({
    firstName: z.string().min(2, { message: "First name is required" }),
    lastName: z.string().min(2, { message: "Last name is required" }),
    email: z.string().email({ message: "Please enter a valid email" }),
    phone: z.string().min(10, { message: "Please enter a valid phone number" }),
    dateOfBirth: z.date({ required_error: "Date of birth is required" }),
    gender: z.string({ required_error: "Please select your gender" }),
    address: z.string().min(5, { message: "Address is required" }),
    city: z.string().min(2, { message: "City is required" }),
    state: z.string().min(2, { message: "State is required" }),
    zipCode: z.string().min(5, { message: "Zip code is required" }),
    qualifications: z.string().min(5, { message: "Qualifications are required" }),
    specialties: z.string().min(5, { message: "Specialties are required" }),
    experience: z.number().min(1, { message: "Experience is required" }),
    password: z.string().min(8, { message: "Password must be at least 8 characters" }),
    confirmPassword: z.string().min(8, { message: "Please confirm your password" }),
    acceptTerms: z.boolean().refine((val) => val === true, { message: "You must accept the terms and conditions" }),
  }).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      dateOfBirth: undefined,
      gender: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      qualifications: "",
      specialties: "",
      experience: 0,
      password: "",
      confirmPassword: "",
      acceptTerms: false,
    },
    mode: "onChange",
  });

  const nextStep = async () => {
    let fieldsToValidate = [];
    
    switch (step) {
      case 0:
        fieldsToValidate = ["firstName", "lastName", "email", "phone", "dateOfBirth", "gender", "address", "city", "state", "zipCode"];
        break;
      case 1:
        fieldsToValidate = ["qualifications", "specialties", "experience"];
        break;
      case 2:
        fieldsToValidate = ["password", "confirmPassword", "acceptTerms"];
        break;
    }
    
    const result = await form.trigger(fieldsToValidate);
    if (!result) return;
    
    if (step < steps.length - 1) {
      setStep(step + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const prevStep = () => {
    if (step > 0) {
      setStep(step - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleProfileImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProfileImage(URL.createObjectURL(file));
    }
  };

  const onSubmit = async (data) => {
    setIsLoading(true);
    
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      console.log("Form data submitted:", data);
      router.push("/signup-success");
    } catch (error) {
      console.error("Signup failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-slate-950 flex flex-col items-center justify-center py-10">
      <BackgroundBeams className="z-0" />
      <div className="container relative z-10 mx-auto px-4 py-10">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8 text-center">
            <Link href="/" className="inline-block mb-6">
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                MediBot
              </span>
            </Link>
            <h2 className="text-3xl font-bold text-white mb-2">
              Create Your Doctor Account
            </h2>
            {/* <div className="w-full h-8">
              <SparklesCore
                id="tsparticlesfull"
                background="transparent"
                minSize={0.6}
                maxSize={1.4}
                particleDensity={60}
                className="w-full h-full"
                particleColor="#FFFFFF"
              />
            </div> */}
          </div>

          <div className="mb-8">
            <div className="flex justify-between">
              {steps.map((s, i) => (
                <div
                  key={s.id}
                  className={`flex-1 text-center ${
                    i !== steps.length - 1
                      ? "border-b-2 border-gray-700 relative"
                      : ""
                  }`}
                >
                  <div
                    className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center text-sm font-medium border-2 ${
                      step >= i
                        ? "bg-blue-600 border-blue-600 text-white"
                        : "border-gray-700 text-gray-400"
                    }`}
                  >
                    {step > i ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      i + 1
                    )}
                  </div>
                  <div
                    className={`mt-2 text-xs ${
                      step >= i ? "text-blue-300" : "text-gray-500"
                    }`}
                  >
                    {s.name}
                  </div>
                  {i !== steps.length - 1 && (
                    <div
                      className={`absolute top-4 left-1/2 right-0 h-0.5 transform -translate-y-1/2 ${
                        step > i ? "bg-blue-600" : "bg-gray-700"
                      }`}
                      style={{ width: "calc(100% - 2rem)" }}
                    ></div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-xl"
          >
            <Form {...form}>
              <form className="space-y-6">
                <AnimatePresence mode="wait">
                  {step === 0 && (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-6"
                      key="step-1"
                    >
                      <div className="flex items-center justify-center mb-6">
                        <div 
                          className="relative w-24 h-24 bg-slate-800 rounded-full overflow-hidden cursor-pointer border-2 border-dashed border-slate-700 hover:border-blue-500 transition-colors"
                          onClick={() => fileInputRef.current.click()}
                        >
                          {profileImage ? (
                            <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                          ) : (
                            <div className="flex flex-col items-center justify-center h-full">
                              <Upload className="h-6 w-6 text-slate-400" />
                              <span className="text-xs text-slate-400 mt-1">Upload</span>
                            </div>
                          )}
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleProfileImageChange}
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="firstName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-slate-200">First name</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Enter your first name"
                                  className="bg-slate-800 border-slate-700 text-white"
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage className="text-red-400" />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="lastName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-slate-200">Last name</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Enter your last name"
                                  className="bg-slate-800 border-slate-700 text-white"
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage className="text-red-400" />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-slate-200">Email</FormLabel>
                              <FormControl>
                                <Input 
                                  type="email"
                                  placeholder="you@example.com"
                                  className="bg-slate-800 border-slate-700 text-white"
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage className="text-red-400" />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-slate-200">Phone number</FormLabel>
                              <FormControl>
                                <Input 
                                  type="tel"
                                  placeholder="(123) 456-7890"
                                  className="bg-slate-800 border-slate-700 text-white"
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage className="text-red-400" />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="dateOfBirth"
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormLabel className="text-slate-200">Date of birth</FormLabel>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button
                                      variant={"outline"}
                                      className={`w-full pl-3 text-left font-normal bg-slate-800 border-slate-700 text-white ${
                                        !field.value ? "text-slate-400" : ""
                                      }`}
                                    >
                                      {field.value ? (
                                        format(field.value, "PPP")
                                      ) : (
                                        <span>Pick a date</span>
                                      )}
                                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                  </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                  <Calendar
                                    mode="single"
                                    selected={field.value}
                                    onSelect={field.onChange}
                                    disabled={(date) =>
                                      date > new Date() || date < new Date("1900-01-01")
                                    }
                                    initialFocus
                                  />
                                </PopoverContent>
                              </Popover>
                              <FormMessage className="text-red-400" />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="gender"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-slate-200">Gender</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                                    <SelectValue placeholder="Select gender" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="male">Male</SelectItem>
                                  <SelectItem value="female">Female</SelectItem>
                                  <SelectItem value="other">Other</SelectItem>
                                  <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage className="text-red-400" />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="address"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-slate-200">Address</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Enter your address"
                                className="bg-slate-800 border-slate-700 text-white"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage className="text-red-400" />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                        <FormField
                          control={form.control}
                          name="city"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-slate-200">City</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="City"
                                  className="bg-slate-800 border-slate-700 text-white"
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage className="text-red-400" />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="state"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-slate-200">State</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="State"
                                  className="bg-slate-800 border-slate-700 text-white"
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage className="text-red-400" />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="zipCode"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-slate-200">Zip Code</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Zip code"
                                  className="bg-slate-800 border-slate-700 text-white"
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage className="text-red-400" />
                            </FormItem>
                          )}
                        />
                      </div>
                    </motion.div>
                  )}

                  {step === 1 && (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-6"
                      key="step-2"
                    >
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium text-white">Professional Information</h3>
                        <p className="text-slate-400">Provide details about your qualifications and specialties.</p>
                      </div>

                      <FormField
                        control={form.control}
                        name="qualifications"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-slate-200">Qualifications</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="List your qualifications..."
                                className="bg-slate-800 border-slate-700 text-white resize-none min-h-[100px]"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage className="text-red-400" />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="specialties"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-slate-200">Specialties</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="List your specialties..."
                                className="bg-slate-800 border-slate-700 text-white resize-none min-h-[100px]"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage className="text-red-400" />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="experience"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-slate-200">Years of Experience</FormLabel>
                            <FormControl>
                              <Input 
                                type="number"
                                placeholder="Enter your years of experience"
                                className="bg-slate-800 border-slate-700 text-white"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage className="text-red-400" />
                          </FormItem>
                        )}
                      />
                    </motion.div>
                  )}

                  {step === 2 && (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-6"
                      key="step-3"
                    >
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium text-white">Create Your Account</h3>
                        <p className="text-slate-400">Set up your login details to access your doctor portal.</p>
                      </div>

                      <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-slate-200">Password</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input 
                                  type={showPassword ? "text" : "password"}
                                  placeholder="Create a secure password"
                                  className="bg-slate-800 border-slate-700 text-white pr-10"
                                  {...field} 
                                />
                                <button
                                  type="button"
                                  className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-400 hover:text-slate-200"
                                  onClick={() => setShowPassword(!showPassword)}
                                >
                                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                              </div>
                            </FormControl>
                            <p className="text-xs text-slate-400 mt-1">
                              Must be at least 8 characters and include a number or special character
                            </p>
                            <FormMessage className="text-red-400" />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-slate-200">Confirm Password</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input 
                                  type={showPassword ? "text" : "password"}
                                  placeholder="Confirm your password"
                                  className="bg-slate-800 border-slate-700 text-white pr-10"
                                  {...field} 
                                />
                              </div>
                            </FormControl>
                            <FormMessage className="text-red-400" />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="acceptTerms"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 mt-6">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel className="text-sm text-slate-200">
                                I agree to the{" "}
                                <Link href="/terms" className="text-blue-400 hover:underline">
                                  Terms of Service
                                </Link>{" "}
                                and{" "}
                                <Link href="/privacy" className="text-blue-400 hover:underline">
                                  Privacy Policy
                                </Link>
                              </FormLabel>
                              <FormMessage className="text-red-400" />
                            </div>
                          </FormItem>
                        )}
                      />
                      
                      <div className="mt-6 pt-4 border-t border-slate-800">
                        <div className="bg-slate-800 p-4 rounded-lg">
                          <h4 className="text-sm font-medium text-white mb-2">What happens next?</h4>
                          <ul className="list-disc text-xs text-slate-400 pl-5 space-y-1">
                            <li>After registering, you'll receive a verification email</li>
                            <li>Click the verification link to activate your account</li>
                            <li>Once verified, you can log in and access your doctor portal</li>
                          </ul>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {step === 3 && (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-6"
                      key="step-4"
                    >
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium text-white">Review Your Information</h3>
                        <p className="text-slate-400">Please verify all details before completing your registration.</p>
                      </div>

                      <div className="space-y-6">
                        <div className="bg-slate-800 p-5 rounded-lg">
                          <h4 className="text-md font-medium text-blue-400 mb-3">Personal Information</h4>
                          <div className="grid grid-cols-2 gap-y-3 gap-x-6 text-sm">
                            <div>
                              <span className="text-slate-400 block">Name</span>
                              <span className="text-white">
                                {form.watch("firstName")} {form.watch("lastName")}
                              </span>
                            </div>
                            <div>
                              <span className="text-slate-400 block">Email</span>
                              <span className="text-white">{form.watch("email")}</span>
                            </div>
                            <div>
                              <span className="text-slate-400 block">Phone</span>
                              <span className="text-white">{form.watch("phone")}</span>
                            </div>
                            <div>
                              <span className="text-slate-400 block">Date of Birth</span>
                              <span className="text-white">
                                {form.watch("dateOfBirth") ? format(form.watch("dateOfBirth"), "PPP") : "Not provided"}
                              </span>
                            </div>
                            <div>
                              <span className="text-slate-400 block">Gender</span>
                              <span className="text-white capitalize">{form.watch("gender") || "Not provided"}</span>
                            </div>
                            <div>
                              <span className="text-slate-400 block">Address</span>
                              <span className="text-white">
                                {form.watch("address")}, {form.watch("city")}, {form.watch("state")} {form.watch("zipCode")}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-slate-800 p-5 rounded-lg">
                          <h4 className="text-md font-medium text-blue-400 mb-3">Professional Information</h4>
                          <div className="space-y-4 text-sm">
                            <div>
                              <span className="text-slate-400 block">Qualifications</span>
                              <span className="text-white">
                                {form.watch("qualifications") || "Not provided"}
                              </span>
                            </div>
                            <div>
                              <span className="text-slate-400 block">Specialties</span>
                              <span className="text-white">
                                {form.watch("specialties") || "Not provided"}
                              </span>
                            </div>
                            <div>
                              <span className="text-slate-400 block">Experience</span>
                              <span className="text-white">
                                {form.watch("experience") || "Not provided"} years
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex justify-between pt-6 border-t border-slate-800">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={prevStep}
                    disabled={step === 0 || isLoading}
                    className="bg-transparent border-slate-700 text-slate-200 hover:bg-slate-800"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  {step < steps.length - 1 ? (
                    <Button 
                      type="button"
                      onClick={nextStep}
                      className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600"
                    >
                      Continue
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  ) : (
                    <Button 
                      type="button"
                      onClick={form.handleSubmit(onSubmit)}
                      disabled={isLoading}
                      className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          Complete Registration
                          <Check className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </form>
            </Form>
          </motion.div>
          
          <div className="mt-6 text-center">
            <p className="text-slate-400">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-medium text-blue-400 hover:text-blue-300"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}