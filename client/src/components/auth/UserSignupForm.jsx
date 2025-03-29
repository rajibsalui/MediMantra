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
import { BackgroundBeams } from "../ui/aceternity/background-beams";
import { SparklesCore } from "../ui/aceternity/sparkles";
import { Loader2, CalendarIcon, Eye, EyeOff, ArrowLeft, ArrowRight, Upload, Check } from "lucide-react";

// Create a simple FormDescription component as it's not exported from form
const FormDescription = ({ className, children }) => {
  return <div className={className}>{children}</div>;
};

const steps = [
  { id: "step-1", name: "Personal Information" },
  { id: "step-2", name: "Medical Information" },
  { id: "step-3", name: "Account Setup" },
  { id: "step-4", name: "Review" },
];

export default function UserSignupForm() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
    allergies: z.string().optional(),
    chronicConditions: z.string().optional(),
    currentMedications: z.string().optional(),
    emergencyContactName: z.string().min(2, { message: "Emergency contact name is required" }),
    emergencyContactPhone: z.string().min(10, { message: "Please enter a valid phone number" }),
    emergencyContactRelation: z.string().min(2, { message: "Relation is required" }),
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
      allergies: "",
      chronicConditions: "",
      currentMedications: "",
      emergencyContactName: "",
      emergencyContactPhone: "",
      emergencyContactRelation: "",
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
        fieldsToValidate = ["emergencyContactName", "emergencyContactPhone", "emergencyContactRelation"];
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

  const stepVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 }
  };

  const renderReviewItem = (label, value) => {
    return (
      <div>
        <span className="text-gray-500 block">{label}</span>
        <span className="text-gray-800 font-medium">{value || "Not provided"}</span>
      </div>
    );
  };

  return (
    <div className="relative min-h-screen w-full bg-gray-50 flex flex-col items-center justify-center py-10">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 opacity-60"></div>
      {/* <BackgroundBeams className="absolute inset-0 z-0 opacity-40" /> */}
      <div className="container relative z-10 mx-auto px-4 py-10">
        <div className="mx-auto max-w-3xl">
          <div className="mb-8 text-center">
            <Link href="/" className="inline-block mb-6">
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                MediBot
              </span>
            </Link>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              Create Your Patient Account
            </h2>
            {/* <div className="w-full h-8">
              <SparklesCore
                id="tsparticlesfull"
                background="transparent"
                minSize={0.6}
                maxSize={1.4}
                particleDensity={60}
                className="w-full h-full"
                particleColor="#3B82F6"
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
                      ? "border-b-2 border-gray-200 relative"
                      : ""
                  }`}
                >
                  <div
                    className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center text-sm font-medium border-2 ${
                      step >= i
                        ? "bg-blue-600 border-blue-600 text-white"
                        : "border-gray-300 text-gray-500 bg-white"
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
                      step >= i ? "text-blue-600 font-medium" : "text-gray-500"
                    }`}
                  >
                    {s.name}
                  </div>
                  {i !== steps.length - 1 && (
                    <div
                      className={`absolute top-4 left-1/2 right-0 h-0.5 transform -translate-y-1/2 ${
                        step > i ? "bg-blue-600" : "bg-gray-200"
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
            className="bg-white border border-gray-200 p-6 rounded-2xl shadow-lg"
          >
            <Form {...form}>
              <form className="space-y-6">
                <AnimatePresence mode="wait" initial={false}>
                  {step === 0 && (
                    <motion.div
                      key="step-1"
                      variants={stepVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      transition={{ duration: 0.3 }}
                      className="space-y-6"
                    >
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium text-gray-900">Personal Information</h3>
                        <p className="text-gray-600">Please provide your basic information to get started.</p>
                      </div>

                      <div className="flex items-center justify-center mb-6">
                        <div 
                          className="relative w-24 h-24 bg-gray-100 rounded-full overflow-hidden cursor-pointer border-2 border-dashed border-gray-300 hover:border-blue-500 transition-colors"
                          onClick={() => fileInputRef.current.click()}
                        >
                          {profileImage ? (
                            <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                          ) : (
                            <div className="flex flex-col items-center justify-center h-full">
                              <Upload className="h-6 w-6 text-gray-400" />
                              <span className="text-xs text-gray-500 mt-1">Upload</span>
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
                      
                      <div className="grid z-30 grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="firstName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-gray-700 bg-green-400">First name</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Enter your first name"
                                  className="bg-white border-gray-300 text-gray-900"
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage className="text-red-500" />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="lastName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-gray-700">Last name</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Enter your last name"
                                  className="bg-white border-gray-300 text-gray-900"
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage className="text-red-500" />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-gray-700">Email address</FormLabel>
                              <FormControl>
                                <Input 
                                  type="email"
                                  placeholder="your.email@example.com"
                                  className="bg-white border-gray-300 text-gray-900"
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage className="text-red-500" />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-gray-700">Phone number</FormLabel>
                              <FormControl>
                                <Input 
                                  type="tel"
                                  placeholder="(123) 456-7890"
                                  className="bg-white border-gray-300 text-gray-900"
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage className="text-red-500" />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="dateOfBirth"
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormLabel className="text-gray-700">Date of birth</FormLabel>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button
                                      variant={"outline"}
                                      className={`w-full bg-white border-gray-300 text-left font-normal ${
                                        !field.value && "text-gray-500"
                                      }`}
                                    >
                                      {field.value ? (
                                        format(field.value, "PPP")
                                      ) : (
                                        <span>Select your date of birth</span>
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
                                    disabled={(date) => date > new Date()}
                                    initialFocus
                                  />
                                </PopoverContent>
                              </Popover>
                              <FormMessage className="text-red-500" />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="gender"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-gray-700">Gender</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger className="bg-white border-gray-300 text-gray-900">
                                    <SelectValue placeholder="Select your gender" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="male">Male</SelectItem>
                                  <SelectItem value="female">Female</SelectItem>
                                  <SelectItem value="other">Other</SelectItem>
                                  <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage className="text-red-500" />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="address"
                          render={({ field }) => (
                            <FormItem className="col-span-2">
                              <FormLabel className="text-gray-700">Address</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Enter your street address"
                                  className="bg-white border-gray-300 text-gray-900"
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage className="text-red-500" />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="city"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-gray-700">City</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Enter your city"
                                  className="bg-white border-gray-300 text-gray-900"
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage className="text-red-500" />
                            </FormItem>
                          )}
                        />
                        
                        <div className="grid grid-cols-2 gap-3">
                          <FormField
                            control={form.control}
                            name="state"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-gray-700">State</FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="State"
                                    className="bg-white border-gray-300 text-gray-900"
                                    {...field} 
                                  />
                                </FormControl>
                                <FormMessage className="text-red-500" />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="zipCode"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-gray-700">ZIP Code</FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="ZIP"
                                    className="bg-white border-gray-300 text-gray-900"
                                    {...field} 
                                  />
                                </FormControl>
                                <FormMessage className="text-red-500" />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {step === 1 && (
                    <motion.div
                      key="step-2"
                      variants={stepVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      transition={{ duration: 0.3 }}
                      className="space-y-6"
                    >
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium text-gray-900">Medical Information</h3>
                        <p className="text-gray-600">This information helps us provide better healthcare recommendations.</p>
                      </div>

                      <FormField
                        control={form.control}
                        name="allergies"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-700">Do you have any allergies?</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="List any allergies to medications, foods, or other substances..."
                                className="bg-white border-gray-300 text-gray-900 resize-none min-h-[100px]"
                                {...field} 
                              />
                            </FormControl>
                            <FormDescription className="text-xs text-gray-500">
                              Please include severity if known (mild, moderate, severe)
                            </FormDescription>
                            <FormMessage className="text-red-500" />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="chronicConditions"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-700">Chronic Health Conditions</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="List any chronic health conditions you have..."
                                className="bg-white border-gray-300 text-gray-900 resize-none min-h-[100px]"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage className="text-red-500" />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="currentMedications"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-700">Current Medications</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="List any medications you are currently taking, including dosage if known..."
                                className="bg-white border-gray-300 text-gray-900 resize-none min-h-[100px]"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage className="text-red-500" />
                          </FormItem>
                        )}
                      />
                      
                      <div className="border-t border-gray-200 pt-6 mt-6">
                        <h4 className="text-md font-medium text-gray-900 mb-4">Emergency Contact Information</h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <FormField
                            control={form.control}
                            name="emergencyContactName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-gray-700">Emergency Contact Name</FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="Full name"
                                    className="bg-white border-gray-300 text-gray-900"
                                    {...field} 
                                  />
                                </FormControl>
                                <FormMessage className="text-red-500" />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="emergencyContactPhone"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-gray-700">Emergency Contact Phone</FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="(123) 456-7890"
                                    className="bg-white border-gray-300 text-gray-900"
                                    {...field} 
                                  />
                                </FormControl>
                                <FormMessage className="text-red-500" />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="emergencyContactRelation"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-gray-700">Relationship to You</FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="e.g. Spouse, Parent, Friend"
                                    className="bg-white border-gray-300 text-gray-900"
                                    {...field} 
                                  />
                                </FormControl>
                                <FormMessage className="text-red-500" />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {step === 2 && (
                    <motion.div
                      key="step-3"
                      variants={stepVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      transition={{ duration: 0.3 }}
                      className="space-y-6"
                    >
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium text-gray-900">Create Your Account</h3>
                        <p className="text-gray-600">Set up your login details to access your patient portal.</p>
                      </div>

                      <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-700">Password</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input 
                                  type={showPassword ? "text" : "password"}
                                  placeholder="Create a secure password"
                                  className="bg-white border-gray-300 text-gray-900 pr-10"
                                  {...field} 
                                />
                                <button
                                  type="button"
                                  className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-gray-800"
                                  onClick={() => setShowPassword(!showPassword)}
                                >
                                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                              </div>
                            </FormControl>
                            <p className="text-xs text-gray-500 mt-1">
                              Must be at least 8 characters and include a number or special character
                            </p>
                            <FormMessage className="text-red-500" />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-700">Confirm Password</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input 
                                  type={showConfirmPassword ? "text" : "password"}
                                  placeholder="Confirm your password"
                                  className="bg-white border-gray-300 text-gray-900 pr-10"
                                  {...field} 
                                />
                                <button
                                  type="button"
                                  className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-gray-800"
                                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                              </div>
                            </FormControl>
                            <FormMessage className="text-red-500" />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="acceptTerms"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md p-4 border border-gray-100 bg-gray-50">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel className="text-sm font-medium text-gray-700">
                                I agree to the Terms of Service and Privacy Policy
                              </FormLabel>
                              <FormDescription className="text-xs text-gray-500">
                                By checking this box, you agree to our <a href="#" className="text-blue-600 hover:underline">Terms of Service</a> and <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a>.
                              </FormDescription>
                              <FormMessage className="text-red-500" />
                            </div>
                          </FormItem>
                        )}
                      />
                    </motion.div>
                  )}

                  {step === 3 && (
                    <motion.div
                      key="step-4"
                      variants={stepVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      transition={{ duration: 0.3 }}
                      className="space-y-6"
                    >
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium text-gray-900">Review Your Information</h3>
                        <p className="text-gray-600">Please verify all details before completing your registration.</p>
                      </div>

                      <div className="space-y-6">
                        <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
                          <h4 className="text-md font-medium text-blue-600 mb-3">Personal Information</h4>
                          <div className="grid grid-cols-2 gap-y-3 gap-x-6 text-sm">
                            <div className="col-span-2 flex items-center mb-2">
                              {profileImage ? (
                                <div className="w-12 h-12 rounded-full overflow-hidden mr-3">
                                  <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                                </div>
                              ) : (
                                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                                  <span className="text-gray-500 text-xs">No photo</span>
                                </div>
                              )}
                              <span className="text-gray-800 font-medium">
                                {form.watch("firstName")} {form.watch("lastName")}
                              </span>
                            </div>
                            {renderReviewItem("Email", form.watch("email"))}
                            {renderReviewItem("Phone", form.watch("phone"))}
                            {renderReviewItem("Date of Birth", form.watch("dateOfBirth") ? format(form.watch("dateOfBirth"), "PPP") : "")}
                            {renderReviewItem("Gender", form.watch("gender"))}
                            {renderReviewItem("Address", `${form.watch("address")}, ${form.watch("city")}, ${form.watch("state")} ${form.watch("zipCode")}`)}
                          </div>
                        </div>
                        
                        <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
                          <h4 className="text-md font-medium text-blue-600 mb-3">Medical Information</h4>
                          <div className="grid grid-cols-1 gap-y-3 text-sm">
                            {renderReviewItem("Allergies", form.watch("allergies"))}
                            {renderReviewItem("Chronic Conditions", form.watch("chronicConditions"))}
                            {renderReviewItem("Current Medications", form.watch("currentMedications"))}
                          </div>
                          
                          <h5 className="text-sm font-medium text-gray-700 mt-4 mb-2">Emergency Contact</h5>
                          <div className="grid grid-cols-2 gap-y-3 gap-x-6 text-sm">
                            {renderReviewItem("Name", form.watch("emergencyContactName"))}
                            {renderReviewItem("Phone", form.watch("emergencyContactPhone"))}
                            {renderReviewItem("Relationship", form.watch("emergencyContactRelation"))}
                          </div>
                        </div>
                        
                        <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
                          <h4 className="text-md font-medium text-blue-600 mb-3">Account Information</h4>
                          <div className="grid grid-cols-1 gap-y-3 text-sm">
                            {renderReviewItem("Password", "••••••••")}
                            <div className="text-green-600 text-sm mt-1">
                              <Check className="inline-block h-4 w-4 mr-1" />
                              Terms and Conditions accepted
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 text-sm text-blue-800">
                          <p className="flex items-start">
                            <Check className="h-5 w-5 mr-2 text-blue-600 flex-shrink-0 mt-0.5" />
                            <span>
                              By completing this registration, you're creating a patient account with MediBot. You'll 
                              be able to book appointments, chat with healthcare providers, and access your medical 
                              records securely.
                            </span>
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex justify-between pt-6 border-t border-gray-200">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={prevStep}
                    disabled={step === 0 || isLoading}
                    className="bg-white border-gray-300 text-gray-700 hover:bg-gray-100"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  {step < steps.length - 1 ? (
                    <Button 
                      type="button"
                      onClick={nextStep}
                      className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white"
                    >
                      Continue
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  ) : (
                    <Button 
                      type="button"
                      onClick={form.handleSubmit(onSubmit)}
                      disabled={isLoading}
                      className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white"
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
            <p className="text-gray-600">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-medium text-blue-600 hover:text-blue-500"
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
