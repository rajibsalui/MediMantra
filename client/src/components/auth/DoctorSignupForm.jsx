"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useDoctor } from "@/contexts/DoctorContext";

const DoctorSignupForm = () => {
  const router = useRouter();
  const { register } = useAuth();
  const { uploadVerificationDocuments } = useDoctor();
  
  // Form state
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    gender: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    registrationNumber: "",
    qualifications: "",
    specialties: "",
    experience: "",
    hospitalAffiliations: "",
    languages: "",
    consultationFee: "",
    about: "",
    profileImage: null,
    profileImagePreview: null,
    password: "",
    confirmPassword: "",
    agreeToTerms: false
  });
  
  // UI state
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const totalSteps = 4;
  
  // Handle input change
  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    
    if (type === "file") {
      // Handle file uploads
      if (files && files[0]) {
        const file = files[0];
        const filePreview = URL.createObjectURL(file);
        
        setFormData({
          ...formData,
          [name]: file,
          [`${name}Preview`]: filePreview
        });
      }
    } else if (type === "checkbox") {
      setFormData({
        ...formData,
        [name]: checked
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
    
    // Clear error when field is modified
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ""
      });
    }
  };
  
  // Validation logic
  const validateCurrentStep = () => {
    const newErrors = {};
    
    if (currentStep === 1) {
      // Personal info validation
      if (!formData.firstName.trim()) newErrors.firstName = "First name is required";
      if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
      if (!formData.email.trim()) {
        newErrors.email = "Email is required";
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = "Email is invalid";
      }
      if (!formData.phone.trim()) {
        newErrors.phone = "Phone number is required";
      } else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ""))) {
        newErrors.phone = "Phone number must be 10 digits";
      }
      if (!formData.dateOfBirth) newErrors.dateOfBirth = "Date of birth is required";
      if (!formData.gender) newErrors.gender = "Gender is required";
    } 
    else if (currentStep === 2) {
      // Address validation
      if (!formData.address.trim()) newErrors.address = "Address is required";
      if (!formData.city.trim()) newErrors.city = "City is required";
      if (!formData.state.trim()) newErrors.state = "State is required";
      if (!formData.zipCode.trim()) {
        newErrors.zipCode = "ZIP code is required";
      } else if (!/^\d{6}$/.test(formData.zipCode.trim())) {
        newErrors.zipCode = "ZIP code must be 6 digits";
      }
    }
    else if (currentStep === 3) {
      // Professional info validation
      if (!formData.registrationNumber.trim()) newErrors.registrationNumber = "Registration number is required";
      if (!formData.qualifications.trim()) newErrors.qualifications = "Qualifications are required";
      if (!formData.specialties.trim()) newErrors.specialties = "Specialties are required";
      if (!formData.experience.trim()) {
        newErrors.experience = "Experience is required";
      } else if (isNaN(formData.experience) || parseInt(formData.experience) < 0) {
        newErrors.experience = "Experience must be a positive number";
      }
      if (!formData.consultationFee.trim()) {
        newErrors.consultationFee = "Consultation fee is required";
      } else if (isNaN(formData.consultationFee) || parseFloat(formData.consultationFee) < 0) {
        newErrors.consultationFee = "Consultation fee must be a positive number";
      }
    }
    else if (currentStep === 4) {
      // Account setup validation
      if (!formData.password) {
        newErrors.password = "Password is required";
      } else if (formData.password.length < 8) {
        newErrors.password = "Password must be at least 8 characters";
      }
      
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = "Please confirm your password";
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }
      
      if (!formData.agreeToTerms) {
        newErrors.agreeToTerms = "You must agree to the terms and conditions";
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Navigation functions
  const nextStep = () => {
    if (validateCurrentStep()) {
      setCurrentStep(currentStep + 1);
      window.scrollTo(0, 0);
    }
  };
  
  const prevStep = () => {
    setCurrentStep(currentStep - 1);
    window.scrollTo(0, 0);
  };
  
  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateCurrentStep()) {
      toast.error("Please complete all required fields correctly");
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Step 1: Prepare user registration data (auth related)
      const registrationData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        password: formData.password,
        role: "doctor"
      };
      
      // Register the basic user account with doctor role
      const registerResponse = await register(registrationData, "doctor");
      
      // Step 2: Prepare doctor profile data
      const doctorProfileData = {
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
        registrationNumber: formData.registrationNumber,
        qualifications: formData.qualifications.split(",").map(item => item.trim()).filter(Boolean),
        specialties: formData.specialties.split(",").map(item => item.trim()).filter(Boolean),
        experience: parseFloat(formData.experience),
        hospitalAffiliations: formData.hospitalAffiliations.split(",").map(item => item.trim()).filter(Boolean),
        languages: formData.languages.split(",").map(item => item.trim()).filter(Boolean),
        consultationFee: parseFloat(formData.consultationFee),
        bio: formData.about,
      };
      
      // After successful registration, update doctor profile
      const doctorFormData = new FormData();
      
      // Add doctor profile fields
      Object.entries(doctorProfileData).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          // Handle arrays like qualifications, specialties, etc.
          value.forEach((item) => {
            doctorFormData.append(`${key}[]`, item);
          });
        } else {
          doctorFormData.append(key, value);
        }
      });
      
      // Step 3: Handle profile image separately if provided
      if (formData.profileImage) {
        // We'll use the updateProfileImage function from DoctorContext
        const imageFormData = new FormData();
        imageFormData.append('profileImage', formData.profileImage);
        
        // This will be called after registration in doctor dashboard
      }
      
      // Step 4: Handle verification documents
      // Note: You might want to provide a separate page for this after registration
      
      toast.success("Sign up successful! Please complete your profile in your dashboard.");
      router.push("/doctor/dashboard");
    } catch (error) {
      toast.error(error.message || "Registration failed. Please try again.");
      console.error("Registration error:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Render progress bar
  const renderProgressBar = () => {
    // Progress bar code remains unchanged
    return (
      <div className="w-full mb-6">
        <div className="flex mb-2 justify-between">
          {Array.from({ length: totalSteps }, (_, i) => (
            <div 
              key={i} 
              className={`step-item ${i + 1 <= currentStep ? 'active' : ''}`}
            >
              <div className={`step-counter ${i + 1 === currentStep ? 'current' : i + 1 < currentStep ? 'completed' : ''}`}>
                {i + 1 < currentStep ? '✓' : i + 1}
              </div>
              <div className="step-name text-xs mt-1">
                {i === 0 ? 'Personal' : 
                 i === 1 ? 'Address' : 
                 i === 2 ? 'Professional' : 'Account'}
              </div>
            </div>
          ))}
        </div>
        <div className="w-full bg-gray-200 h-1 rounded-full">
          <div 
            className="bg-blue-600 h-1 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          ></div>
        </div>
      </div>
    );
  };
  
  // Render step navigation buttons - remains unchanged
  const renderStepButtons = () => {
    return (
      <div className="flex justify-between mt-8">
        {currentStep > 1 && (
          <button
            type="button"
            onClick={prevStep}
            className="btn btn-outline px-6"
          >
            Previous
          </button>
        )}
        
        <div className={`${currentStep > 1 ? 'ml-auto' : ''}`}>
          {currentStep < totalSteps ? (
            <button
              type="button"
              onClick={nextStep}
              className="btn btn-primary px-6"
            >
              Next
            </button>
          ) : (
            <button
              type="submit"
              className={`btn btn-primary px-6 ${isLoading ? 'loading' : ''}`}
              disabled={isLoading}
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>
          )}
        </div>
      </div>
    );
  };
  
  // Form step rendering functions remain unchanged
  const renderPersonalInfoStep = () => (
    <>
      <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
      
      {/* Personal info fields remain unchanged */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="form-control">
          <label className="label">
            <span className="label-text">First Name*</span>
          </label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            className={`input input-bordered w-full ${errors.firstName ? 'input-error' : ''}`}
            placeholder="John"
          />
          {errors.firstName && <span className="text-error text-sm mt-1">{errors.firstName}</span>}
        </div>
        
        <div className="form-control">
          <label className="label">
            <span className="label-text">Last Name*</span>
          </label>
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            className={`input input-bordered w-full ${errors.lastName ? 'input-error' : ''}`}
            placeholder="Doe"
          />
          {errors.lastName && <span className="text-error text-sm mt-1">{errors.lastName}</span>}
        </div>
      </div>
      
      {/* Other personal info fields */}
      <div className="form-control mt-2">
        <label className="label">
          <span className="label-text">Email*</span>
        </label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className={`input input-bordered w-full ${errors.email ? 'input-error' : ''}`}
          placeholder="doctor@example.com"
        />
        {errors.email && <span className="text-error text-sm mt-1">{errors.email}</span>}
      </div>
      
      {/* Other fields remain unchanged */}
      <div className="form-control mt-2">
        <label className="label">
          <span className="label-text">Phone Number*</span>
        </label>
        <input
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          className={`input input-bordered w-full ${errors.phone ? 'input-error' : ''}`}
          placeholder="1234567890"
        />
        {errors.phone && <span className="text-error text-sm mt-1">{errors.phone}</span>}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
        <div className="form-control">
          <label className="label">
            <span className="label-text">Date of Birth*</span>
          </label>
          <input
            type="date"
            name="dateOfBirth"
            value={formData.dateOfBirth}
            onChange={handleChange}
            className={`input input-bordered w-full ${errors.dateOfBirth ? 'input-error' : ''}`}
          />
          {errors.dateOfBirth && <span className="text-error text-sm mt-1">{errors.dateOfBirth}</span>}
        </div>
        
        <div className="form-control">
          <label className="label">
            <span className="label-text">Gender*</span>
          </label>
          <select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            className={`select select-bordered w-full ${errors.gender ? 'select-error' : ''}`}
          >
            <option value="" disabled>Select gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
          {errors.gender && <span className="text-error text-sm mt-1">{errors.gender}</span>}
        </div>
      </div>
      
      <div className="form-control mt-4">
        <label className="label">
          <span className="label-text">Profile Picture</span>
        </label>
        <input
          type="file"
          name="profileImage"
          onChange={handleChange}
          accept="image/*"
          className="file-input file-input-bordered w-full"
        />
        {formData.profileImagePreview && (
          <div className="mt-2">
            <img 
              src={formData.profileImagePreview} 
              alt="Profile Preview" 
              className="w-32 h-32 rounded-full object-cover border-2 border-blue-500"
            />
          </div>
        )}
      </div>
    </>
  );
  
  // Address and Professional Info steps remain unchanged
  const renderAddressStep = () => (
    <>
      <h3 className="text-lg font-semibold mb-4">Address Information</h3>
      
      {/* Address fields remain unchanged */}
      <div className="form-control">
        <label className="label">
          <span className="label-text">Street Address*</span>
        </label>
        <input
          type="text"
          name="address"
          value={formData.address}
          onChange={handleChange}
          className={`input input-bordered w-full ${errors.address ? 'input-error' : ''}`}
          placeholder="123 Medical Plaza"
        />
        {errors.address && <span className="text-error text-sm mt-1">{errors.address}</span>}
      </div>
      
      {/* Other address fields remain unchanged */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
        <div className="form-control">
          <label className="label">
            <span className="label-text">City*</span>
          </label>
          <input
            type="text"
            name="city"
            value={formData.city}
            onChange={handleChange}
            className={`input input-bordered w-full ${errors.city ? 'input-error' : ''}`}
            placeholder="Mumbai"
          />
          {errors.city && <span className="text-error text-sm mt-1">{errors.city}</span>}
        </div>
        
        <div className="form-control">
          <label className="label">
            <span className="label-text">State*</span>
          </label>
          <input
            type="text"
            name="state"
            value={formData.state}
            onChange={handleChange}
            className={`input input-bordered w-full ${errors.state ? 'input-error' : ''}`}
            placeholder="Maharashtra"
          />
          {errors.state && <span className="text-error text-sm mt-1">{errors.state}</span>}
        </div>
      </div>
      
      <div className="form-control mt-2">
        <label className="label">
          <span className="label-text">ZIP Code*</span>
        </label>
        <input
          type="text"
          name="zipCode"
          value={formData.zipCode}
          onChange={handleChange}
          className={`input input-bordered w-full ${errors.zipCode ? 'input-error' : ''}`}
          placeholder="400001"
        />
        {errors.zipCode && <span className="text-error text-sm mt-1">{errors.zipCode}</span>}
      </div>
    </>
  );
  
  // Professional Info step
  const renderProfessionalInfoStep = () => (
    <>
      <h3 className="text-lg font-semibold mb-4">Professional Information</h3>
      
      <div className="form-control">
        <label className="label">
          <span className="label-text">Medical Registration Number*</span>
        </label>
        <input
          type="text"
          name="registrationNumber"
          value={formData.registrationNumber}
          onChange={handleChange}
          className={`input input-bordered w-full ${errors.registrationNumber ? 'input-error' : ''}`}
          placeholder="MCI-123456"
        />
        {errors.registrationNumber && <span className="text-error text-sm mt-1">{errors.registrationNumber}</span>}
      </div>
      
      <div className="form-control mt-2">
        <label className="label">
          <span className="label-text">Qualifications* (comma separated)</span>
        </label>
        <input
          type="text"
          name="qualifications"
          value={formData.qualifications}
          onChange={handleChange}
          className={`input input-bordered w-full ${errors.qualifications ? 'input-error' : ''}`}
          placeholder="MBBS, MD, MS"
        />
        {errors.qualifications && <span className="text-error text-sm mt-1">{errors.qualifications}</span>}
      </div>
      
      <div className="form-control mt-2">
        <label className="label">
          <span className="label-text">Specialties* (comma separated)</span>
        </label>
        <input
          type="text"
          name="specialties"
          value={formData.specialties}
          onChange={handleChange}
          className={`input input-bordered w-full ${errors.specialties ? 'input-error' : ''}`}
          placeholder="Cardiology, Neurology, etc."
        />
        {errors.specialties && <span className="text-error text-sm mt-1">{errors.specialties}</span>}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
        <div className="form-control">
          <label className="label">
            <span className="label-text">Years of Experience*</span>
          </label>
          <input
            type="number"
            name="experience"
            value={formData.experience}
            onChange={handleChange}
            className={`input input-bordered w-full ${errors.experience ? 'input-error' : ''}`}
            placeholder="10"
            min="0"
          />
          {errors.experience && <span className="text-error text-sm mt-1">{errors.experience}</span>}
        </div>
        
        <div className="form-control">
          <label className="label">
            <span className="label-text">Consultation Fee (₹)*</span>
          </label>
          <input
            type="number"
            name="consultationFee"
            value={formData.consultationFee}
            onChange={handleChange}
            className={`input input-bordered w-full ${errors.consultationFee ? 'input-error' : ''}`}
            placeholder="1000"
            min="0"
          />
          {errors.consultationFee && <span className="text-error text-sm mt-1">{errors.consultationFee}</span>}
        </div>
      </div>
      
      <div className="form-control mt-2">
        <label className="label">
          <span className="label-text">Hospital Affiliations (comma separated)</span>
        </label>
        <input
          type="text"
          name="hospitalAffiliations"
          value={formData.hospitalAffiliations}
          onChange={handleChange}
          className="input input-bordered w-full"
          placeholder="Apollo Hospital, Max Healthcare, etc."
        />
      </div>
      
      <div className="form-control mt-2">
        <label className="label">
          <span className="label-text">Languages Spoken (comma separated)</span>
        </label>
        <input
          type="text"
          name="languages"
          value={formData.languages}
          onChange={handleChange}
          className="input input-bordered w-full"
          placeholder="English, Hindi, Tamil, etc."
        />
      </div>
      
      <div className="form-control mt-2">
        <label className="label">
          <span className="label-text">About Yourself / Professional Bio</span>
        </label>
        <textarea
          name="about"
          value={formData.about}
          onChange={handleChange}
          className="textarea textarea-bordered w-full h-32"
          placeholder="Write a short professional bio highlighting your expertise and approach to patient care..."
        />
      </div>
    </>
  );
  
  // Account Setup step
  const renderAccountSetupStep = () => (
    <>
      <h3 className="text-lg font-semibold mb-4">Account Setup</h3>
      
      {/* Account setup fields remain unchanged */}
      <div className="form-control">
        <label className="label">
          <span className="label-text">Password*</span>
        </label>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          className={`input input-bordered w-full ${errors.password ? 'input-error' : ''}`}
          placeholder="••••••••"
        />
        {errors.password && <span className="text-error text-sm mt-1">{errors.password}</span>}
        <p className="text-gray-500 text-sm mt-1">Password must be at least 8 characters long</p>
      </div>
      
      {/* Other account setup fields remain unchanged */}
      <div className="form-control mt-4">
        <label className="label">
          <span className="label-text">Confirm Password*</span>
        </label>
        <input
          type="password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          className={`input input-bordered w-full ${errors.confirmPassword ? 'input-error' : ''}`}
          placeholder="••••••••"
        />
        {errors.confirmPassword && <span className="text-error text-sm mt-1">{errors.confirmPassword}</span>}
      </div>
      
      <div className="form-control mt-6">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            name="agreeToTerms"
            checked={formData.agreeToTerms}
            onChange={handleChange}
            className="checkbox checkbox-primary"
          />
          <span className="label-text">
            I agree to the{' '}
            <Link href="/terms" className="text-blue-600 hover:underline">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="text-blue-600 hover:underline">
              Privacy Policy
            </Link>
          </span>
        </label>
        {errors.agreeToTerms && <span className="text-error text-sm mt-1">{errors.agreeToTerms}</span>}
      </div>
      
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="text-blue-800 font-medium mb-2">Verification Process</h4>
        <p className="text-sm text-blue-700">
          Your account will be reviewed by our administrators before activation.
          After registration, you'll be able to upload verification documents from your dashboard.
        </p>
      </div>
    </>
  );
  
  // Render the form based on current step
  const renderFormStep = () => {
    switch(currentStep) {
      case 1:
        return renderPersonalInfoStep();
      case 2:
        return renderAddressStep();
      case 3:
        return renderProfessionalInfoStep();
      case 4:
        return renderAccountSetupStep();
      default:
        return null;
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md p-8">
          <h2 className="text-2xl font-bold text-center mb-6">Doctor Registration</h2>
          
          {renderProgressBar()}
          
          <form onSubmit={handleSubmit}>
            {renderFormStep()}
            {renderStepButtons()}
          </form>
          
          <div className="text-center mt-6">
            Already have an account?{" "}
            <Link href="/login" className="text-blue-600 hover:underline">
              Log In
            </Link>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        .step-item {
          position: relative;
          flex: 1;
          text-align: center;
        }
        
        .step-counter {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background-color: #e5e7eb;
          color: #6b7280;
          margin: 0 auto;
          display: flex;
          justify-content: center;
          align-items: center;
          font-weight: 500;
          font-size: 14px;
        }
        
        .step-counter.current {
          background-color: #3b82f6;
          color: white;
        }
        
        .step-counter.completed {
          background-color: #10b981;
          color: white;
        }
        
        .step-item.active .step-name {
          color: #3b82f6;
          font-weight: 500;
        }
      `}</style>
    </div>
  );
};

export default DoctorSignupForm;