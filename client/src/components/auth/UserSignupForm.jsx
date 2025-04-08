"use client"
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast, Toaster } from 'react-hot-toast';
import { useAuth } from "@/contexts/AuthContext"; // Added AuthContext import

const UserSignupForm = () => {
  const router = useRouter();
  const { register } = useAuth(); // Get register function from AuthContext

  // Form state with all requested fields
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
    allergies: "",
    chronicConditions: "",
    currentMedications: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    emergencyContactRelation: "",
    password: "",
    confirmPassword: "",
    role: "patient",
    agreeToTerms: false
  });

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  // Error state
  const [errors, setErrors] = useState({});

  // Handle input change
  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });

    // Clear error when field is modified
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  // Navigate between form steps
  const nextStep = () => {
    if (validateCurrentStep()) {
      setCurrentStep(currentStep + 1);
      window.scrollTo(0, 0);
    } else {
      toast.error('Please complete all required fields correctly');
    }
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
    window.scrollTo(0, 0);
  };

  // Validate current step fields
  const validateCurrentStep = () => {
    const newErrors = {};

    if (currentStep === 1) {
      // Personal information validation
      if (!formData.firstName.trim()) {
        newErrors.firstName = 'First name is required';
      }

      if (!formData.lastName.trim()) {
        newErrors.lastName = 'Last name is required';
      }

      if (!formData.email) {
        newErrors.email = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Email is invalid';
      }

      if (formData.phone && !/^\d{10}$/.test(formData.phone.replace(/[^\d]/g, ''))) {
        newErrors.phone = 'Please enter a valid 10-digit phone number';
      }

      if (!formData.dateOfBirth) {
        newErrors.dateOfBirth = 'Date of birth is required';
      }

      if (!formData.gender) {
        newErrors.gender = 'Please select your gender';
      }
    }
    else if (currentStep === 2) {
      // Address validation
      if (!formData.address.trim()) {
        newErrors.address = 'Address is required';
      }

      if (!formData.city.trim()) {
        newErrors.city = 'City is required';
      }

      if (!formData.state.trim()) {
        newErrors.state = 'State is required';
      }

      if (!formData.zipCode.trim()) {
        newErrors.zipCode = 'ZIP code is required';
      } else if (!/^[1-9][0-9]{5}$/.test(formData.zipCode.trim())) {
        newErrors.zipCode = 'Please enter a valid 6-digit PIN code';
      }
    }
    else if (currentStep === 3) {
      // Emergency contact validation
      if (!formData.emergencyContactName.trim()) {
        newErrors.emergencyContactName = 'Emergency contact name is required';
      }

      if (!formData.emergencyContactPhone.trim()) {
        newErrors.emergencyContactPhone = 'Emergency contact phone is required';
      } else if (!/^\d{10}$/.test(formData.emergencyContactPhone.replace(/[^\d]/g, ''))) {
        newErrors.emergencyContactPhone = 'Please enter a valid 10-digit phone number';
      }

      if (!formData.emergencyContactRelation.trim()) {
        newErrors.emergencyContactRelation = 'Relationship is required';
      }
    }
    else if (currentStep === 4) {
      // Password and terms validation
      if (!formData.password) {
        newErrors.password = 'Password is required';
      } else if (formData.password.length < 8) {
        newErrors.password = 'Password must be at least 8 characters';
      } else if (!/(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*])/.test(formData.password)) {
        newErrors.password = 'Password must include uppercase, lowercase, number, and special character';
      }

      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password';
      } else if (formData.confirmPassword !== formData.password) {
        newErrors.confirmPassword = 'Passwords do not match';
      }

      if (!formData.agreeToTerms) {
        newErrors.agreeToTerms = 'You must agree to the terms and conditions';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validate all form fields before submission
  const validateForm = () => {
    const requiredFields = [
      'firstName', 'lastName', 'email', 'dateOfBirth', 'gender',
      'address', 'city', 'state', 'zipCode',
      'emergencyContactName', 'emergencyContactPhone', 'emergencyContactRelation',
      'password', 'confirmPassword'
    ];

    const newErrors = {};

    requiredFields.forEach(field => {
      if (!formData[field] || (typeof formData[field] === 'string' && !formData[field].trim())) {
        newErrors[field] = `${field.replace(/([A-Z])/g, ' $1').replace(/^\w/, c => c.toUpperCase())} is required`;
      }
    });

    // Email validation
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    // Phone validation
    if (formData.phone && !/^\d{10}$/.test(formData.phone.replace(/[^\d]/g, ''))) {
      newErrors.phone = 'Please enter a valid 10-digit phone number';
    }

    // Emergency phone validation
    if (formData.emergencyContactPhone &&
        !/^\d{10}$/.test(formData.emergencyContactPhone.replace(/[^\d]/g, ''))) {
      newErrors.emergencyContactPhone = 'Please enter a valid 10-digit phone number';
    }

    // ZIP code validation
    if (formData.zipCode && !/^[1-9][0-9]{5}$/.test(formData.zipCode)) {
      newErrors.zipCode = 'Please enter a valid 6-digit PIN code';
    }

    // Password validation
    if (formData.password && formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (formData.password &&
              !/(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*])/.test(formData.password)) {
      newErrors.password = 'Password must include uppercase, lowercase, number, and special character';
    }

    // Password matching
    if (formData.confirmPassword && formData.confirmPassword !== formData.password) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Terms agreement
    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the terms and conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please complete all required fields correctly');
      return;
    }

    setIsLoading(true);

    try {
      // Format allergies, chronic conditions, and medications as arrays if they contain comma-separated values
      const formatTextToArray = (text) => {
        if (!text) return [];
        return text.split(',').map(item => item.trim()).filter(item => item);
      };

      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        address: {
          street: formData.address,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          country: 'India'
        },
        medicalInformation: {
          allergies: formData.allergies,
          chronicConditions: formData.chronicConditions,
          currentMedications: formData.currentMedications
        },
        emergencyContact: {
          name: formData.emergencyContactName,
          phone: formData.emergencyContactPhone,
          relationship: formData.emergencyContactRelation
        },
        role: "patient",
        agreeToTerms: formData.agreeToTerms
      };

      // Call the register function from AuthContext
      const response = await register(payload);

      toast.success('Account created! Welcome to MediMantra.');

      // Store user ID in local storage if needed
      if (response && response.userId) {
        localStorage.setItem("userId", response.userId);
      }

      // Redirect to login page or verification page
      router.push('/verify-email');
    } catch (error) {
      const errorMessage = error.message || 'Failed to create account. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle password visibility
  const togglePassword = () => setShowPassword(!showPassword);
  const toggleConfirmPassword = () => setShowConfirmPassword(!showConfirmPassword);

  // Progress indicator
  const renderProgressBar = () => {
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
                 i === 2 ? 'Emergency' : 'Account'}
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

  // Step 1: Personal Information
  const renderPersonalInfoStep = () => {
    return (
      <>
        <h3 className="text-lg font-semibold mb-4">Personal Information</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text text-gray-700 font-medium">First Name*</span>
            </label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="Your first name"
              className={`input input-bordered bg-white w-full ${errors.firstName ? 'input-error border-red-300' : 'border-gray-200'}`}
            />
            {errors.firstName && (
              <label className="label">
                <span className="label-text-alt text-red-500">{errors.firstName}</span>
              </label>
            )}
          </div>

          <div className="form-control w-full">
            <label className="label">
              <span className="label-text text-gray-700 font-medium">Last Name*</span>
            </label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Your last name"
              className={`input input-bordered bg-white w-full ${errors.lastName ? 'input-error border-red-300' : 'border-gray-200'}`}
            />
            {errors.lastName && (
              <label className="label">
                <span className="label-text-alt text-red-500">{errors.lastName}</span>
              </label>
            )}
          </div>
        </div>

        <div className="form-control w-full mt-2">
          <label className="label">
            <span className="label-text text-gray-700 font-medium">Email*</span>
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Your email address"
            className={`input input-bordered bg-white w-full ${errors.email ? 'input-error border-red-300' : 'border-gray-200'}`}
          />
          {errors.email && (
            <label className="label">
              <span className="label-text-alt text-red-500">{errors.email}</span>
            </label>
          )}
        </div>

        <div className="form-control w-full mt-2">
          <label className="label">
            <span className="label-text text-gray-700 font-medium">Phone Number</span>
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="Your phone number"
            className={`input input-bordered bg-white w-full ${errors.phone ? 'input-error border-red-300' : 'border-gray-200'}`}
          />
          {errors.phone && (
            <label className="label">
              <span className="label-text-alt text-red-500">{errors.phone}</span>
            </label>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text text-gray-700 font-medium">Date of Birth*</span>
            </label>
            <input
              type="date"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleChange}
              className={`input input-bordered bg-white w-full ${errors.dateOfBirth ? 'input-error border-red-300' : 'border-gray-200'}`}
            />
            {errors.dateOfBirth && (
              <label className="label">
                <span className="label-text-alt text-red-500">{errors.dateOfBirth}</span>
              </label>
            )}
          </div>

          <div className="form-control w-full">
            <label className="label">
              <span className="label-text text-gray-700 font-medium">Gender*</span>
            </label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className={`select select-bordered bg-white w-full ${errors.gender ? 'select-error border-red-300' : 'border-gray-200'}`}
            >
              <option value="" disabled>Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
              <option value="prefer-not-to-say">Prefer not to say</option>
            </select>
            {errors.gender && (
              <label className="label">
                <span className="label-text-alt text-red-500">{errors.gender}</span>
              </label>
            )}
          </div>
        </div>
      </>
    );
  };

  // Step 2: Address Information
  const renderAddressStep = () => {
    return (
      <>
        <h3 className="text-lg font-semibold mb-4">Address Information</h3>

        <div className="form-control w-full">
          <label className="label">
            <span className="label-text text-gray-700 font-medium">Street Address*</span>
          </label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="Your street address"
            className={`input input-bordered bg-white w-full ${errors.address ? 'input-error border-red-300' : 'border-gray-200'}`}
          />
          {errors.address && (
            <label className="label">
              <span className="label-text-alt text-red-500">{errors.address}</span>
            </label>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text text-gray-700 font-medium">City*</span>
            </label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              placeholder="Your city"
              className={`input input-bordered bg-white w-full ${errors.city ? 'input-error border-red-300' : 'border-gray-200'}`}
            />
            {errors.city && (
              <label className="label">
                <span className="label-text-alt text-red-500">{errors.city}</span>
              </label>
            )}
          </div>

          <div className="form-control w-full">
            <label className="label">
              <span className="label-text text-gray-700 font-medium">State*</span>
            </label>
            <input
              type="text"
              name="state"
              value={formData.state}
              onChange={handleChange}
              placeholder="Your state"
              className={`input input-bordered bg-white w-full ${errors.state ? 'input-error border-red-300' : 'border-gray-200'}`}
            />
            {errors.state && (
              <label className="label">
                <span className="label-text-alt text-red-500">{errors.state}</span>
              </label>
            )}
          </div>
        </div>

        <div className="form-control w-full mt-2">
          <label className="label">
            <span className="label-text text-gray-700 font-medium">ZIP Code*</span>
          </label>
          <input
            type="text"
            name="zipCode"
            value={formData.zipCode}
            onChange={handleChange}
            placeholder="Your ZIP code"
            className={`input input-bordered bg-white w-full ${errors.zipCode ? 'input-error border-red-300' : 'border-gray-200'}`}
          />
          {errors.zipCode && (
            <label className="label">
              <span className="label-text-alt text-red-500">{errors.zipCode}</span>
            </label>
          )}
        </div>

        <h3 className="text-lg font-semibold mt-6 mb-4">Medical Information</h3>

        <div className="form-control w-full">
          <label className="label">
            <span className="label-text text-gray-700 font-medium">Allergies</span>
          </label>
          <textarea
            name="allergies"
            value={formData.allergies}
            onChange={handleChange}
            placeholder="List any allergies you have"
            className="textarea textarea-bordered bg-white w-full h-24"
          />
        </div>

        <div className="form-control w-full mt-2">
          <label className="label">
            <span className="label-text text-gray-700 font-medium">Chronic Conditions</span>
          </label>
          <textarea
            name="chronicConditions"
            value={formData.chronicConditions}
            onChange={handleChange}
            placeholder="List any chronic conditions"
            className="textarea textarea-bordered bg-white w-full h-24"
          />
        </div>

        <div className="form-control w-full mt-2">
          <label className="label">
            <span className="label-text text-gray-700 font-medium">Current Medications</span>
          </label>
          <textarea
            name="currentMedications"
            value={formData.currentMedications}
            onChange={handleChange}
            placeholder="List any current medications"
            className="textarea textarea-bordered bg-white w-full h-24"
          />
        </div>
      </>
    );
  };

  // Step 3: Emergency Contact
  const renderEmergencyContactStep = () => {
    return (
      <>
        <h3 className="text-lg font-semibold mb-4">Emergency Contact Information</h3>

        <div className="form-control w-full">
          <label className="label">
            <span className="label-text text-gray-700 font-medium">Emergency Contact Name*</span>
          </label>
          <input
            type="text"
            name="emergencyContactName"
            value={formData.emergencyContactName}
            onChange={handleChange}
            placeholder="Full name of your emergency contact"
            className={`input input-bordered bg-white w-full ${errors.emergencyContactName ? 'input-error border-red-300' : 'border-gray-200'}`}
          />
          {errors.emergencyContactName && (
            <label className="label">
              <span className="label-text-alt text-red-500">{errors.emergencyContactName}</span>
            </label>
          )}
        </div>

        <div className="form-control w-full mt-2">
          <label className="label">
            <span className="label-text text-gray-700 font-medium">Emergency Contact Phone*</span>
          </label>
          <input
            type="tel"
            name="emergencyContactPhone"
            value={formData.emergencyContactPhone}
            onChange={handleChange}
            placeholder="Emergency contact phone number"
            className={`input input-bordered bg-white w-full ${errors.emergencyContactPhone ? 'input-error border-red-300' : 'border-gray-200'}`}
          />
          {errors.emergencyContactPhone && (
            <label className="label">
              <span className="label-text-alt text-red-500">{errors.emergencyContactPhone}</span>
            </label>
          )}
        </div>

        <div className="form-control w-full mt-2">
          <label className="label">
            <span className="label-text text-gray-700 font-medium">Relationship to Emergency Contact*</span>
          </label>
          <input
            type="text"
            name="emergencyContactRelation"
            value={formData.emergencyContactRelation}
            onChange={handleChange}
            placeholder="E.g., Parent, Spouse, Sibling, Friend"
            className={`input input-bordered bg-white w-full ${errors.emergencyContactRelation ? 'input-error border-red-300' : 'border-gray-200'}`}
          />
          {errors.emergencyContactRelation && (
            <label className="label">
              <span className="label-text-alt text-red-500">{errors.emergencyContactRelation}</span>
            </label>
          )}
        </div>
      </>
    );
  };

  // Step 4: Account Setup
  const renderAccountStep = () => {
    return (
      <>
        <h3 className="text-lg font-semibold mb-4">Account Setup</h3>

        <div className="form-control w-full">
          <label className="label">
            <span className="label-text text-gray-700 font-medium">Password*</span>
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Create a secure password"
              className={`input input-bordered bg-white w-full pr-10 ${errors.password ? 'input-error border-red-300' : 'border-gray-200'}`}
            />
            <button
              type="button"
              onClick={togglePassword}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              {showPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-500">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-500">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              )}
            </button>
          </div>
          {errors.password && (
            <label className="label">
              <span className="label-text-alt text-red-500">{errors.password}</span>
            </label>
          )}
          <p className="text-xs mt-1 text-gray-500">
            Password must be at least 8 characters long and include uppercase, lowercase,
            number, and special character (!@#$%^&*).
          </p>
        </div>

        <div className="form-control w-full mt-2">
          <label className="label">
            <span className="label-text text-gray-700 font-medium">Confirm Password*</span>
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password"
              className={`input input-bordered bg-white w-full pr-10 ${errors.confirmPassword ? 'input-error border-red-300' : 'border-gray-200'}`}
            />
            <button
              type="button"
              onClick={toggleConfirmPassword}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              {showConfirmPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-500">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-500">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              )}
            </button>
          </div>
          {errors.confirmPassword && (
            <label className="label">
              <span className="label-text-alt text-red-500">{errors.confirmPassword}</span>
            </label>
          )}
        </div>

        <div className="form-control mt-4">
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
          {errors.agreeToTerms && (
            <label className="label">
              <span className="label-text-alt text-red-500">{errors.agreeToTerms}</span>
            </label>
          )}
        </div>
      </>
    );
  };

  // Render the current step content based on state
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return renderPersonalInfoStep();
      case 2:
        return renderAddressStep();
      case 3:
        return renderEmergencyContactStep();
      case 4:
        return renderAccountStep();
      default:
        return null;
    }
  };

  // Navigation buttons for multi-step form
  const renderStepButtons = () => {
    return (
      <div className="flex justify-between mt-8">
        {currentStep > 1 && (
          <button
            type="button"
            onClick={prevStep}
            className="btn btn-outline px-6"
          >
            Back
          </button>
        )}

        {currentStep < totalSteps ? (
          <button
            type="button"
            onClick={nextStep}
            className="btn btn-primary px-6 ml-auto"
          >
            Next
          </button>
        ) : (
          <button
            type="submit"
            disabled={isLoading}
            className="btn btn-primary px-6 ml-auto"
          >
            {isLoading ? (
              <>
                <span className="loading loading-spinner loading-xs mr-2"></span>
                Creating Account...
              </>
            ) : (
              'Create Account'
            )}
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-center mb-6">Create Your MediMantra Account</h2>

          {renderProgressBar()}

          <form onSubmit={handleSubmit}>
            {renderStepContent()}
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

      <Toaster position="top-center" reverseOrder={false} />

      <style jsx global>{`
        .step-item {
          flex: 1;
          text-align: center;
          position: relative;
        }

        .step-counter {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto;
          background-color: #e5e7eb;
          color: #6b7280;
          font-weight: bold;
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

export default UserSignupForm;