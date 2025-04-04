"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { useAuth } from "@/contexts/AuthContext";
import { 
  User, 
  MapPin, 
  Briefcase, 
  Lock, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle, 
  AlertTriangle,
  Clock,
  Video
} from "lucide-react";

const DoctorSignupForm = () => {
  const router = useRouter();
  const { registerDoctor, completeDoctorProfile, uploadVerificationDocs } = useAuth();
  
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
    qualifications: [{ degree: "", institution: "", year: "" }],
    specialties: "",
    experience: "",
    hospitalAffiliations: "",
    languages: "", 
    consultationFee: {
      inPerson: "",
      video: "",
      phone: ""
    },
    about: "",
    profileImage: null,
    profileImagePreview: null,
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
    clinicDetails: {
      name: "",
      address: {
        street: "",
        city: "",
        state: "",
        zipCode: "",
        country: "India"
      },
      contactNumber: ""
    },
    availability: [
      {
        day: "Monday",
        isAvailable: true,
        slots: [{ startTime: "09:00", endTime: "17:00", isBooked: false }]
      }
    ],
    videoConsultation: {
      available: false,
      platform: "zoom"
    },
    acceptingNewPatients: true
  });
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const totalSteps = 5;
  
  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    
    if (type === "file") {
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
      if (name.includes('.')) {
        const [parent, child, subchild] = name.split('.');
        if (subchild) {
          setFormData({
            ...formData,
            [parent]: {
              ...formData[parent],
              [child]: {
                ...formData[parent][child],
                [subchild]: value
              }
            }
          });
        } else {
          setFormData({
            ...formData,
            [parent]: {
              ...formData[parent],
              [child]: value
            }
          });
        }
      } else {
        setFormData({
          ...formData,
          [name]: value
        });
      }
    }
    
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ""
      });
    }
  };
  
  const validateCurrentStep = () => {
    const newErrors = {};
    
    if (currentStep === 1) {
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
      if (!formData.registrationNumber.trim()) newErrors.registrationNumber = "Registration number is required";
      
      formData.qualifications.forEach((qual, index) => {
        if (!qual.degree.trim()) {
          newErrors[`qualifications[${index}].degree`] = "Degree is required";
        }
        if (!qual.institution.trim()) {
          newErrors[`qualifications[${index}].institution`] = "Institution is required";
        }
        if (!qual.year) {
          newErrors[`qualifications[${index}].year`] = "Year is required";
        } else if (isNaN(qual.year) || parseInt(qual.year) < 1950 || parseInt(qual.year) > new Date().getFullYear()) {
          newErrors[`qualifications[${index}].year`] = "Please enter a valid year";
        }
      });
      
      if (!formData.specialties.trim()) newErrors.specialties = "Specialties are required";
      if (!formData.experience.trim()) {
        newErrors.experience = "Experience is required";
      } else if (isNaN(formData.experience) || parseInt(formData.experience) < 0) {
        newErrors.experience = "Experience must be a positive number";
      }
      if (!formData.consultationFee.inPerson.trim()) {
        newErrors['consultationFee.inPerson'] = "In-person consultation fee is required";
      } else if (isNaN(formData.consultationFee.inPerson) || parseFloat(formData.consultationFee.inPerson) < 0) {
        newErrors['consultationFee.inPerson'] = "Fee must be a positive number";
      }
    }
    else if (currentStep === 4) {
      if (!formData.clinicDetails.name.trim()) newErrors['clinicDetails.name'] = "Clinic name is required";
      if (!formData.clinicDetails.contactNumber.trim()) {
        newErrors['clinicDetails.contactNumber'] = "Clinic contact number is required";
      } else if (!/^\d{10}$/.test(formData.clinicDetails.contactNumber.replace(/\D/g, ""))) {
        newErrors['clinicDetails.contactNumber'] = "Contact number must be 10 digits";
      }
      
      if (!formData.availability || formData.availability.length === 0) {
        newErrors['availability'] = "At least one availability day is required";
      } else {
        const hasAvailableDay = formData.availability.some(day => 
          day.isAvailable && day.slots && day.slots.length > 0
        );
        
        if (!hasAvailableDay) {
          newErrors['availability'] = "Please set your availability for at least one day";
        }
      }
    }
    else if (currentStep === 5) {
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
  
  const addSlot = (dayIndex) => {
    const updatedAvailability = [...formData.availability];
    const lastSlot = updatedAvailability[dayIndex].slots[updatedAvailability[dayIndex].slots.length - 1];
    
    let startTime = "09:00";
    let endTime = "10:00";
    
    if (lastSlot) {
      const lastEndHour = parseInt(lastSlot.endTime.split(':')[0]);
      const lastEndMinute = lastSlot.endTime.split(':')[1];
      startTime = lastSlot.endTime;
      endTime = `${(lastEndHour + 1).toString().padStart(2, '0')}:${lastEndMinute}`;
    }
    
    updatedAvailability[dayIndex].slots.push({
      startTime,
      endTime,
      isBooked: false
    });
    
    setFormData({
      ...formData,
      availability: updatedAvailability
    });
  };
  
  const removeSlot = (dayIndex, slotIndex) => {
    const updatedAvailability = [...formData.availability];
    updatedAvailability[dayIndex].slots.splice(slotIndex, 1);
    setFormData({
      ...formData,
      availability: updatedAvailability
    });
  };
  
  const handleSlotChange = (dayIndex, slotIndex, field, value) => {
    const updatedAvailability = [...formData.availability];
    updatedAvailability[dayIndex].slots[slotIndex][field] = value;
    setFormData({
      ...formData,
      availability: updatedAvailability
    });
  };
  
  const toggleDayAvailability = (dayIndex) => {
    const updatedAvailability = [...formData.availability];
    updatedAvailability[dayIndex].isAvailable = !updatedAvailability[dayIndex].isAvailable;
    setFormData({
      ...formData,
      availability: updatedAvailability
    });
  };
  
  const handleVideoConsultationToggle = (isAvailable) => {
    setFormData({
      ...formData,
      videoConsultation: {
        ...formData.videoConsultation,
        available: isAvailable
      }
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateCurrentStep()) {
      toast.error("Please complete all required fields correctly");
      return;
    }
    
    setIsLoading(true);
    
    try {
      const clinicDetailsFormatted = {
        name: formData.clinicDetails.name,
        address: {
          street: formData.clinicDetails.address.street || formData.address,
          city: formData.clinicDetails.address.city || formData.city,
          state: formData.clinicDetails.address.state || formData.state,
          zipCode: formData.clinicDetails.address.zipCode || formData.zipCode,
          country: "India"
        },
        contactNumber: formData.clinicDetails.contactNumber
      };
      
      const availabilityFormatted = formData.availability
        .filter(day => day.isAvailable)
        .map(day => ({
          day: day.day,
          isAvailable: true,
          slots: day.slots.map(slot => ({
            startTime: slot.startTime,
            endTime: slot.endTime,
            isBooked: false
          }))
        }));
      
      const doctorData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        password: formData.password,
        specialties: formData.specialties.split(",").map(item => item.trim()).filter(Boolean),
        qualifications: formData.qualifications.filter(q => q.degree.trim() && q.institution.trim() && q.year),
        registrationNumber: formData.registrationNumber,
        registrationCouncil: "Medical Council of India",
        experience: parseInt(formData.experience),
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
        consultationFee: {
          inPerson: parseFloat(formData.consultationFee.inPerson) || 0,
          video: parseFloat(formData.consultationFee.video) || 0,
          phone: parseFloat(formData.consultationFee.phone) || 0
        },
        profileImage: formData.profileImage,
        languages: formData.languages.split(",").map(item => item.trim()).filter(Boolean),
        hospitalAffiliations: formData.hospitalAffiliations.split(",").map(item => item.trim()).filter(Boolean).map(name => ({
          name,
          current: true
        })),
        bio: formData.about,
        clinicDetails: clinicDetailsFormatted,
        availability: availabilityFormatted,
        videoConsultation: formData.videoConsultation,
        acceptingNewPatients: formData.acceptingNewPatients
      };
      
      const registerResponse = await registerDoctor(doctorData);
      console.log(registerResponse);
      toast.success("Doctor account created successfully!");
      const userID = localStorage.getItem("userId");
      router.push(`/doctor/dashboard/${userID}`);
    } catch (error) {
      toast.error(error.message || "Registration failed. Please try again.");
      console.error("Registration error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderPersonalInfoStep = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-3 pb-2 mb-5 border-b border-gray-200 dark:border-gray-700">
        <div className="bg-blue-100/50 dark:bg-blue-900/30 p-2 rounded-full text-blue-600 dark:text-blue-400">
          <User className="w-5 h-5" />
        </div>
        <h3 className="text-lg font-medium text-gray-800 dark:text-gray-100">Personal Information</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label htmlFor="firstName" className={labelClass}>
            First Name <span className="text-red-500">*</span>
          </label>
          <input
            id="firstName"
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            className={inputClass('firstName')}
            placeholder="John"
          />
          {errors.firstName && <p className={errorClass}>{errors.firstName}</p>}
        </div>
        
        <div>
          <label htmlFor="lastName" className={labelClass}>
            Last Name <span className="text-red-500">*</span>
          </label>
          <input
            id="lastName"
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            className={inputClass('lastName')}
            placeholder="Doe"
          />
          {errors.lastName && <p className={errorClass}>{errors.lastName}</p>}
        </div>
      </div>
      
      <div>
        <label htmlFor="email" className={labelClass}>
          Email Address <span className="text-red-500">*</span>
        </label>
        <input
          id="email"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className={inputClass('email')}
          placeholder="doctor@example.com"
        />
        {errors.email && <p className={errorClass}>{errors.email}</p>}
      </div>
      
      <div>
        <label htmlFor="phone" className={labelClass}>
          Phone Number <span className="text-red-500">*</span>
        </label>
        <input
          id="phone"
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          className={inputClass('phone')}
          placeholder="9876543210"
          maxLength="10"
        />
        {errors.phone && <p className={errorClass}>{errors.phone}</p>}
      </div>
      
      <div>
        <label htmlFor="dateOfBirth" className={labelClass}>
          Date of Birth <span className="text-red-500">*</span>
        </label>
        <input
          id="dateOfBirth"
          type="date"
          name="dateOfBirth"
          value={formData.dateOfBirth}
          onChange={handleChange}
          className={inputClass('dateOfBirth')}
          max={new Date().toISOString().split('T')[0]}
        />
        {errors.dateOfBirth && <p className={errorClass}>{errors.dateOfBirth}</p>}
      </div>
      
      <div>
        <label className={labelClass}>
          Gender <span className="text-red-500">*</span>
        </label>
        <div className="flex space-x-4 mt-1">
          <div className="flex items-center">
            <input
              id="genderMale"
              type="radio"
              name="gender"
              value="male"
              checked={formData.gender === "male"}
              onChange={handleChange}
              className="w-4 h-4 text-blue-600 dark:text-blue-500 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
            />
            <label htmlFor="genderMale" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
              Male
            </label>
          </div>
          <div className="flex items-center">
            <input
              id="genderFemale"
              type="radio"
              name="gender"
              value="female"
              checked={formData.gender === "female"}
              onChange={handleChange}
              className="w-4 h-4 text-blue-600 dark:text-blue-500 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
            />
            <label htmlFor="genderFemale" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
              Female
            </label>
          </div>
          <div className="flex items-center">
            <input
              id="genderOther"
              type="radio"
              name="gender"
              value="Other"
              checked={formData.gender === "Other"}
              onChange={handleChange}
              className="w-4 h-4 text-blue-600 dark:text-blue-500 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
            />
            <label htmlFor="genderOther" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
              Other
            </label>
          </div>
        </div>
        {errors.gender && <p className={errorClass}>{errors.gender}</p>}
      </div>
      
      <div>
        <label htmlFor="profileImage" className={labelClass}>
          Profile Picture
        </label>
        <div className="mt-2 flex items-center space-x-5">
          <div className="flex-shrink-0">
            {formData.profileImagePreview ? (
              <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-gray-200 dark:border-gray-700">
                <img
                  src={formData.profileImagePreview}
                  alt="Profile preview"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => {
                    setFormData({
                      ...formData,
                      profileImage: null,
                      profileImagePreview: null
                    });
                  }}
                  className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full w-5 h-5 flex items-center justify-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            ) : (
              <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center border-2 border-gray-200 dark:border-gray-700">
                <User className="w-8 h-8 text-gray-400 dark:text-gray-500" />
              </div>
            )}
          </div>
          <div>
            <label
              htmlFor="profile-upload"
              className="px-4 py-2 cursor-pointer bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/40 dark:focus:ring-blue-500/30"
            >
              Upload Photo
            </label>
            <input 
              id="profile-upload" 
              type="file" 
              name="profileImage"
              accept="image/*"
              onChange={handleChange}
              className="hidden"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              JPG, PNG up to 2MB
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAddressStep = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-3 pb-2 mb-5 border-b border-gray-200 dark:border-gray-700">
        <div className="bg-blue-100/50 dark:bg-blue-900/30 p-2 rounded-full text-blue-600 dark:text-blue-400">
          <MapPin className="w-5 h-5" />
        </div>
        <h3 className="text-lg font-medium text-gray-800 dark:text-gray-100">Address Information</h3>
      </div>
      
      <div>
        <label htmlFor="address" className={labelClass}>
          Street Address <span className="text-red-500">*</span>
        </label>
        <input
          id="address"
          type="text"
          name="address"
          value={formData.address}
          onChange={handleChange}
          className={inputClass('address')}
          placeholder="123 Main Street"
        />
        {errors.address && <p className={errorClass}>{errors.address}</p>}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label htmlFor="city" className={labelClass}>
            City <span className="text-red-500">*</span>
          </label>
          <input
            id="city"
            type="text"
            name="city"
            value={formData.city}
            onChange={handleChange}
            className={inputClass('city')}
            placeholder="Mumbai"
          />
          {errors.city && <p className={errorClass}>{errors.city}</p>}
        </div>
        
        <div>
          <label htmlFor="state" className={labelClass}>
            State <span className="text-red-500">*</span>
          </label>
          <input
            id="state"
            type="text"
            name="state"
            value={formData.state}
            onChange={handleChange}
            className={inputClass('state')}
            placeholder="Maharashtra"
          />
          {errors.state && <p className={errorClass}>{errors.state}</p>}
        </div>
      </div>
      
      <div>
        <label htmlFor="zipCode" className={labelClass}>
          PIN Code <span className="text-red-500">*</span>
        </label>
        <input
          id="zipCode"
          type="text"
          name="zipCode"
          value={formData.zipCode}
          onChange={handleChange}
          className={inputClass('zipCode')}
          placeholder="400001"
          maxLength="6"
        />
        {errors.zipCode && <p className={errorClass}>{errors.zipCode}</p>}
      </div>
    </div>
  );

  const renderProfessionalInfoStep = () => {
    const addQualification = () => {
      setFormData({
        ...formData,
        qualifications: [...formData.qualifications, { degree: '', institution: '', year: '' }]
      });
    };
  
    const removeQualification = (index) => {
      const newQualifications = [...formData.qualifications];
      newQualifications.splice(index, 1);
      setFormData({
        ...formData,
        qualifications: newQualifications
      });
    };
  
    const handleQualificationChange = (index, field, value) => {
      const newQualifications = [...formData.qualifications];
      newQualifications[index][field] = value;
      setFormData({
        ...formData,
        qualifications: newQualifications
      });
    };
  
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3 pb-2 mb-5 border-b border-gray-200 dark:border-gray-700">
          <div className="bg-blue-100/50 dark:bg-blue-900/30 p-2 rounded-full text-blue-600 dark:text-blue-400">
            <Briefcase className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-medium text-gray-800 dark:text-gray-100">Professional Information</h3>
        </div>
        
        <div>
          <label htmlFor="registrationNumber" className={labelClass}>
            Medical Registration Number <span className="text-red-500">*</span>
          </label>
          <input
            id="registrationNumber"
            type="text"
            name="registrationNumber"
            value={formData.registrationNumber}
            onChange={handleChange}
            className={inputClass('registrationNumber')}
            placeholder="e.g. MCI-01-12345"
          />
          {errors.registrationNumber && <p className={errorClass}>{errors.registrationNumber}</p>}
        </div>
        
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className={labelClass}>
              Qualifications <span className="text-red-500">*</span>
            </label>
            <button
              type="button"
              onClick={addQualification}
              className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
            >
              + Add Another
            </button>
          </div>
          
          {formData.qualifications.map((qual, index) => (
            <div key={index} className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg mb-3">
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Qualification #{index + 1}</h4>
                {formData.qualifications.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeQualification(index)}
                    className="text-sm text-red-500 hover:text-red-700 dark:hover:text-red-400 transition-colors"
                  >
                    Remove
                  </button>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label htmlFor={`degree-${index}`} className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Degree
                  </label>
                  <input
                    id={`degree-${index}`}
                    type="text"
                    value={qual.degree}
                    onChange={(e) => handleQualificationChange(index, 'degree', e.target.value)}
                    className={`w-full px-2.5 py-2 text-sm ${errors[`qualifications[${index}].degree`] ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-700'} rounded-lg`}
                    placeholder="e.g. MBBS"
                  />
                  {errors[`qualifications[${index}].degree`] && (
                    <p className="text-red-500 dark:text-red-400 text-xs mt-1">
                      {errors[`qualifications[${index}].degree`]}
                    </p>
                  )}
                </div>
                
                <div>
                  <label htmlFor={`institution-${index}`} className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Institution
                  </label>
                  <input
                    id={`institution-${index}`}
                    type="text"
                    value={qual.institution}
                    onChange={(e) => handleQualificationChange(index, 'institution', e.target.value)}
                    className={`w-full px-2.5 py-2 text-sm ${errors[`qualifications[${index}].institution`] ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-700'} rounded-lg`}
                    placeholder="e.g. AIIMS"
                  />
                  {errors[`qualifications[${index}].institution`] && (
                    <p className="text-red-500 dark:text-red-400 text-xs mt-1">
                      {errors[`qualifications[${index}].institution`]}
                    </p>
                  )}
                </div>
                
                <div>
                  <label htmlFor={`year-${index}`} className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Year
                  </label>
                  <input
                    id={`year-${index}`}
                    type="number"
                    value={qual.year}
                    onChange={(e) => handleQualificationChange(index, 'year', e.target.value)}
                    className={`w-full px-2.5 py-2 text-sm ${errors[`qualifications[${index}].year`] ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-700'} rounded-lg`}
                    placeholder="e.g. 2010"
                    min="1950"
                    max={new Date().getFullYear()}
                  />
                  {errors[`qualifications[${index}].year`] && (
                    <p className="text-red-500 dark:text-red-400 text-xs mt-1">
                      {errors[`qualifications[${index}].year`]}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div>
          <label htmlFor="specialties" className={labelClass}>
            Specialties <span className="text-red-500">*</span>
          </label>
          <input
            id="specialties"
            type="text"
            name="specialties"
            value={formData.specialties}
            onChange={handleChange}
            className={inputClass('specialties')}
            placeholder="e.g. Cardiology, Internal Medicine"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Separate multiple specialties with commas
          </p>
          {errors.specialties && <p className={errorClass}>{errors.specialties}</p>}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label htmlFor="experience" className={labelClass}>
              Years of Experience <span className="text-red-500">*</span>
            </label>
            <input
              id="experience"
              type="number"
              name="experience"
              value={formData.experience}
              onChange={handleChange}
              className={inputClass('experience')}
              placeholder="e.g. 5"
              min="0"
            />
            {errors.experience && <p className={errorClass}>{errors.experience}</p>}
          </div>
          
          <div>
            <label htmlFor="languages" className={labelClass}>
              Languages Spoken
            </label>
            <input
              id="languages"
              type="text"
              name="languages"
              value={formData.languages}
              onChange={handleChange}
              className={inputClass('languages')}
              placeholder="e.g. English, Hindi, Marathi"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Separate multiple languages with commas
            </p>
          </div>
        </div>
        
        <div>
          <label htmlFor="hospitalAffiliations" className={labelClass}>
            Hospital Affiliations
          </label>
          <input
            id="hospitalAffiliations"
            type="text"
            name="hospitalAffiliations"
            value={formData.hospitalAffiliations}
            onChange={handleChange}
            className={inputClass('hospitalAffiliations')}
            placeholder="e.g. Apollo Hospital, Fortis"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Separate multiple hospitals with commas
          </p>
        </div>
        
        <div>
          <label className={labelClass}>Consultation Fee <span className="text-red-500">*</span></label>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-2">
            <div>
              <label htmlFor="inPersonFee" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                In-person (₹) <span className="text-red-500">*</span>
              </label>
              <input
                id="inPersonFee"
                type="number"
                name="consultationFee.inPerson"
                value={formData.consultationFee.inPerson}
                onChange={handleChange}
                className={inputClass('consultationFee.inPerson')}
                placeholder="e.g. 500"
                min="0"
              />
              {errors['consultationFee.inPerson'] && <p className="text-red-500 dark:text-red-400 text-xs mt-1">{errors['consultationFee.inPerson']}</p>}
            </div>
            
            <div>
              <label htmlFor="videoFee" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Video (₹)
              </label>
              <input
                id="videoFee"
                type="number"
                name="consultationFee.video"
                value={formData.consultationFee.video}
                onChange={handleChange}
                className={inputClass('consultationFee.video')}
                placeholder="e.g. 400"
                min="0"
              />
            </div>
            
            <div>
              <label htmlFor="phoneFee" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Phone (₹)
              </label>
              <input
                id="phoneFee"
                type="number"
                name="consultationFee.phone"
                value={formData.consultationFee.phone}
                onChange={handleChange}
                className={inputClass('consultationFee.phone')}
                placeholder="e.g. 300"
                min="0"
              />
            </div>
          </div>
        </div>
        
        <div>
          <label htmlFor="about" className={labelClass}>
            Professional Bio
          </label>
          <textarea
            id="about"
            name="about"
            value={formData.about}
            onChange={handleChange}
            rows="4"
            className={inputClass('about')}
            placeholder="Write a brief description of your professional experience and expertise..."
          ></textarea>
        </div>
      </div>
    );
  };

  const renderAccountSetupStep = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-3 pb-2 mb-5 border-b border-gray-200 dark:border-gray-700">
        <div className="bg-blue-100/50 dark:bg-blue-900/30 p-2 rounded-full text-blue-600 dark:text-blue-400">
          <Lock className="w-5 h-5" />
        </div>
        <h3 className="text-lg font-medium text-gray-800 dark:text-gray-100">Account Setup</h3>
      </div>
      
      <div>
        <label htmlFor="password" className={labelClass}>
          Password <span className="text-red-500">*</span>
        </label>
        <input
          id="password"
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          className={inputClass('password')}
          placeholder="••••••••"
          autoComplete="new-password"
        />
        {errors.password && <p className={errorClass}>{errors.password}</p>}
      </div>
      
      <div>
        <label htmlFor="confirmPassword" className={labelClass}>
          Confirm Password <span className="text-red-500">*</span>
        </label>
        <input
          id="confirmPassword"
          type="password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          className={inputClass('confirmPassword')}
          placeholder="••••••••"
          autoComplete="new-password"
        />
        {errors.confirmPassword && <p className={errorClass}>{errors.confirmPassword}</p>}
      </div>
      
      <div className="mt-6">
        <div className="flex items-start">
          <div className="flex items-center h-5">
            <input
              id="agreeToTerms"
              name="agreeToTerms"
              type="checkbox"
              checked={formData.agreeToTerms}
              onChange={handleChange}
              className="w-4 h-4 text-blue-600 dark:text-blue-500 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 rounded"
            />
          </div>
          <div className="ml-3 text-sm">
            <label htmlFor="agreeToTerms" className="text-gray-700 dark:text-gray-300">
              I agree to the <a href="/terms" className="text-blue-600 dark:text-blue-400 hover:underline">Terms of Service</a> and <a href="/privacy" className="text-blue-600 dark:text-blue-400 hover:underline">Privacy Policy</a>
            </label>
            {errors.agreeToTerms && <p className={errorClass}>{errors.agreeToTerms}</p>}
          </div>
        </div>
      </div>
      
      <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-100 dark:border-yellow-800/30 rounded-lg">
        <div className="flex">
          <div className="flex-shrink-0">
            <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-500" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-600">Important Information</h3>
            <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-500">
              <p>
                Your account will be reviewed by our administrators after registration. You'll be notified once your account has been approved.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStepIcon = (step) => {
    switch(step) {
      case 1: return <User className="w-5 h-5" />;
      case 2: return <MapPin className="w-5 h-5" />;
      case 3: return <Briefcase className="w-5 h-5" />;
      case 4: return <Clock className="w-5 h-5" />;
      case 5: return <Lock className="w-5 h-5" />;
      default: return null;
    }
  };

  const renderProgressBar = () => {
    return (
      <div className="w-full mb-8">
        <div className="flex mb-3 justify-between">
          {Array.from({ length: totalSteps }, (_, i) => (
            <div 
              key={i} 
              className={`step-item ${i + 1 <= currentStep ? 'active' : ''}`}
            >
              <div className={`step-counter ${
                i + 1 === currentStep 
                  ? 'current bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-500 ring-4 ring-blue-100 dark:ring-blue-900/30' 
                  : i + 1 < currentStep 
                    ? 'completed bg-gradient-to-r from-green-500 to-emerald-500 dark:from-green-600 dark:to-emerald-600' 
                    : 'bg-gray-200 dark:bg-gray-700'
              }`}>
                {i + 1 < currentStep ? <CheckCircle className="w-4 h-4" /> : renderStepIcon(i + 1)}
              </div>
              <div className={`step-name text-xs mt-1.5 ${
                i + 1 === currentStep 
                  ? 'text-blue-600 dark:text-blue-400 font-medium' 
                  : i + 1 < currentStep 
                    ? 'text-green-600 dark:text-green-400 font-medium' 
                    : 'text-gray-500 dark:text-gray-400'
              }`}>
                {i === 0 ? 'Personal' : 
                 i === 1 ? 'Address' : 
                 i === 2 ? 'Professional' :
                 i === 3 ? 'Availability' : 'Account'}
              </div>
            </div>
          ))}
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 h-1.5 rounded-full mt-1">
          <div 
            className="bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-500 h-1.5 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          ></div>
        </div>
      </div>
    );
  };
  
  const renderClinicDetailsStep = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-3 pb-2 mb-5 border-b border-gray-200 dark:border-gray-700">
        <div className="bg-blue-100/50 dark:bg-blue-900/30 p-2 rounded-full text-blue-600 dark:text-blue-400">
          <Clock className="w-5 h-5" />
        </div>
        <h3 className="text-lg font-medium text-gray-800 dark:text-gray-100">Clinic Details & Availability</h3>
      </div>
      
      <div className="p-5 border border-gray-200 dark:border-gray-700 rounded-lg space-y-6">
        <h3 className="font-medium text-lg text-gray-800 dark:text-gray-200">Clinic Information</h3>
        
        <div>
          <label htmlFor="clinicName" className={labelClass}>
            Clinic Name <span className="text-red-500">*</span>
          </label>
          <input
            id="clinicName"
            type="text"
            name="clinicDetails.name"
            value={formData.clinicDetails.name}
            onChange={handleChange}
            className={inputClass('clinicDetails.name')}
            placeholder="e.g. Health First Medical Center"
          />
          {errors['clinicDetails.name'] && <p className={errorClass}>{errors['clinicDetails.name']}</p>}
        </div>
        
        <div>
          <label htmlFor="clinicContactNumber" className={labelClass}>
            Clinic Contact Number <span className="text-red-500">*</span>
          </label>
          <input
            id="clinicContactNumber"
            type="tel"
            name="clinicDetails.contactNumber"
            value={formData.clinicDetails.contactNumber}
            onChange={handleChange}
            className={inputClass('clinicDetails.contactNumber')}
            placeholder="e.g. 9876543210"
            maxLength="10"
          />
          {errors['clinicDetails.contactNumber'] && <p className={errorClass}>{errors['clinicDetails.contactNumber']}</p>}
        </div>
        
        <div className="flex items-center mt-4">
          <input
            id="sameAsPersonalAddress"
            type="checkbox"
            onChange={(e) => {
              if (e.target.checked) {
                setFormData({
                  ...formData,
                  clinicDetails: {
                    ...formData.clinicDetails,
                    address: {
                      street: formData.address,
                      city: formData.city,
                      state: formData.state,
                      zipCode: formData.zipCode,
                      country: "India"
                    }
                  }
                });
              }
            }}
            className="w-4 h-4 text-blue-600 dark:text-blue-500 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 rounded"
          />
          <label htmlFor="sameAsPersonalAddress" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
            Use personal address as clinic address
          </label>
        </div>
      </div>
      
      <div className="p-5 border border-gray-200 dark:border-gray-700 rounded-lg space-y-6 mt-6">
        <h3 className="font-medium text-lg text-gray-800 dark:text-gray-200">Video Consultation</h3>
        
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <div className="flex items-center">
              <input
                id="videoConsultYes"
                type="radio"
                name="videoConsultationAvailable"
                checked={formData.videoConsultation.available}
                onChange={() => handleVideoConsultationToggle(true)}
                className="w-4 h-4 text-blue-600 dark:text-blue-500 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
              />
              <label htmlFor="videoConsultYes" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                Yes, I offer video consultations
              </label>
            </div>
            <div className="flex items-center">
              <input
                id="videoConsultNo"
                type="radio"
                name="videoConsultationAvailable"
                checked={!formData.videoConsultation.available}
                onChange={() => handleVideoConsultationToggle(false)}
                className="w-4 h-4 text-blue-600 dark:text-blue-500 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
              />
              <label htmlFor="videoConsultNo" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                No, in-person only
              </label>
            </div>
          </div>
          
          {formData.videoConsultation.available && (
            <div className="ml-6 space-y-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-md">
              <label htmlFor="videoPlatform" className={labelClass}>
                Preferred Platform
              </label>
              <select
                id="videoPlatform"
                name="videoConsultation.platform"
                value={formData.videoConsultation.platform}
                onChange={handleChange}
                className={inputClass('videoConsultation.platform')}
              >
                <option value="zoom">Zoom</option>
                <option value="google-meet">Google Meet</option>
                <option value="microsoft-teams">Microsoft Teams</option>
                <option value="custom">Other</option>
              </select>
              
              <div className="flex items-start mt-3">
                <div className="flex items-center h-5">
                  <input
                    id="acceptingNewPatients"
                    type="checkbox"
                    name="acceptingNewPatients"
                    checked={formData.acceptingNewPatients}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        acceptingNewPatients: e.target.checked
                      });
                    }}
                    className="w-4 h-4 text-blue-600 dark:text-blue-500 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 rounded"
                  />
                </div>
                <label htmlFor="acceptingNewPatients" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  I am currently accepting new patients
                </label>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="p-5 border border-gray-200 dark:border-gray-700 rounded-lg space-y-6 mt-6">
        <div className="flex justify-between items-center">
          <h3 className="font-medium text-lg text-gray-800 dark:text-gray-200">Availability Schedule</h3>
        </div>
        
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Set your availability for each day of the week. You can add multiple time slots per day.
        </p>
        
        {errors['availability'] && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 rounded-md text-red-600 dark:text-red-400 text-sm">
            {errors['availability']}
          </div>
        )}
        
        <div className="space-y-6 mt-4">
          {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day, dayIndex) => {
            let daySchedule = formData.availability.find(a => a.day === day);
            if (!daySchedule) {
              daySchedule = {
                day,
                isAvailable: false,
                slots: [{ startTime: "09:00", endTime: "17:00", isBooked: false }]
              };
              
              const newAvailability = [...formData.availability];
              newAvailability.push(daySchedule);
              formData.availability = newAvailability;
            }
            
            const dayIdx = formData.availability.findIndex(a => a.day === day);
            
            return (
              <div key={day} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <input
                      id={`available-${day}`}
                      type="checkbox"
                      checked={daySchedule.isAvailable}
                      onChange={() => toggleDayAvailability(dayIdx)}
                      className="w-4 h-4 text-blue-600 dark:text-blue-500 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 rounded"
                    />
                    <label htmlFor={`available-${day}`} className="font-medium text-gray-800 dark:text-gray-200">
                      {day}
                    </label>
                  </div>
                  
                  {daySchedule.isAvailable && (
                    <button
                      type="button"
                      onClick={() => addSlot(dayIdx)}
                      className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                    >
                      + Add Time Slot
                    </button>
                  )}
                </div>
                
                {daySchedule.isAvailable && (
                  <div className="mt-3 space-y-3">
                    {daySchedule.slots.map((slot, slotIndex) => (
                      <div key={slotIndex} className="grid grid-cols-5 gap-2 items-center bg-gray-50 dark:bg-gray-800/50 p-2 rounded">
                        <div className="col-span-2">
                          <label htmlFor={`${day}-start-${slotIndex}`} className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                            Start Time
                          </label>
                          <input
                            id={`${day}-start-${slotIndex}`}
                            type="time"
                            value={slot.startTime}
                            onChange={(e) => handleSlotChange(dayIdx, slotIndex, 'startTime', e.target.value)}
                            className="w-full px-2 py-1.5 text-sm text-gray-800 dark:text-gray-100 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg"
                          />
                        </div>
                        <div className="col-span-2">
                          <label htmlFor={`${day}-end-${slotIndex}`} className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                            End Time
                          </label>
                          <input
                            id={`${day}-end-${slotIndex}`}
                            type="time"
                            value={slot.endTime}
                            onChange={(e) => handleSlotChange(dayIdx, slotIndex, 'endTime', e.target.value)}
                            className="w-full px-2 py-1.5 text-sm text-gray-800 dark:text-gray-100 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg"
                          />
                        </div>
                        <div className="flex items-end justify-center">
                          {daySchedule.slots.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeSlot(dayIdx, slotIndex)}
                              className="p-1.5 text-red-500 hover:text-red-700 dark:hover:text-red-400 rounded-lg"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
  
  const renderStepButtons = () => {
    return (
      <div className="flex justify-between mt-10">
        {currentStep > 1 && (
          <button
            type="button"
            onClick={prevStep}
            className="px-6 py-2.5 flex items-center text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/40 dark:focus:ring-blue-500/30"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Previous
          </button>
        )}
        
        <div className={`${currentStep > 1 ? 'ml-auto' : ''}`}>
          {currentStep < totalSteps ? (
            <button
              type="button"
              onClick={nextStep}
              className="px-6 py-2.5 flex items-center text-white bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-500 rounded-lg hover:from-blue-600 hover:to-blue-700 dark:hover:from-blue-500 dark:hover:to-blue-400 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/40 dark:focus:ring-blue-500/30"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          ) : (
            <button
              type="submit"
              className={`px-6 py-2.5 flex items-center justify-center text-white bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-500 rounded-lg hover:from-blue-600 hover:to-blue-700 dark:hover:from-blue-500 dark:hover:to-blue-400 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/40 dark:focus:ring-blue-500/30 ${isLoading ? 'opacity-75 cursor-wait' : ''}`}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating Account...
                </>
              ) : (
                'Create Account'
              )}
            </button>
          )}
        </div>
      </div>
    );
  };
  
  const inputClass = (fieldName) => `w-full px-3 py-2.5 text-gray-800 dark:text-gray-100 bg-white dark:bg-gray-800 border ${
    errors[fieldName] 
      ? 'border-red-300 dark:border-red-600 focus:border-red-500 dark:focus:border-red-500 focus:ring-red-500/20 dark:focus:ring-red-500/20' 
      : 'border-gray-300 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-500 focus:ring-blue-500/20 dark:focus:ring-blue-500/30'
    } rounded-lg outline-none transition-all focus:ring-4`;

  const labelClass = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5";
  const errorClass = "text-red-500 dark:text-red-400 text-sm mt-1.5";
  
  const renderFormStep = () => {
    switch(currentStep) {
      case 1:
        return renderPersonalInfoStep();
      case 2:
        return renderAddressStep();
      case 3:
        return renderProfessionalInfoStep();
      case 4:
        return renderClinicDetailsStep();
      case 5:
        return renderAccountSetupStep();
      default:
        return null;
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg dark:shadow-gray-900/40 p-8">
          <h2 className="text-2xl font-semibold text-center text-gray-800 dark:text-gray-100 mb-2">Doctor Registration</h2>
          <p className="text-center text-gray-500 dark:text-gray-400 mb-8">Join our network of healthcare professionals</p>
          
          {renderProgressBar()}
          
          <form onSubmit={handleSubmit}>
            {renderFormStep()}
            {renderStepButtons()}
          </form>
          
          <div className="text-center mt-8 text-gray-600 dark:text-gray-300">
            Already have an account?{" "}
            <Link href="/login" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
              Log In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorSignupForm;