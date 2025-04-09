"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { toast } from "react-hot-toast";
import {
  User,
  Save,
  LoaderCircle,
  X,
  Plus,
  Trash2,
  Upload,
} from "lucide-react";
import { useDoctor } from "@/contexts/DoctorContext";
import { useAuth } from "@/contexts/AuthContext";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

// Validation schema
const schema = yup.object().shape({
  firstName: yup.string().required("First name is required"),
  lastName: yup.string().required("Last name is required"),
  email: yup.string().email("Invalid email").required("Email is required"),
  phone: yup.string().required("Phone number is required"),
  gender: yup.string().required("Gender is required"),
  bio: yup.string(),
  experience: yup
    .number()
    .typeError("Experience must be a number")
    .required("Experience is required")
    .min(0, "Experience cannot be negative"),
  registrationNumber: yup.string().required("Registration number is required"),
  registrationCouncil: yup.string().required("Registration council is required"),
  consultationFee: yup.object().shape({
    inPerson: yup
      .number()
      .typeError("Fee must be a number")
      .required("In-person consultation fee is required")
      .min(0, "Fee cannot be negative"),
    video: yup
      .number()
      .typeError("Fee must be a number")
      .min(0, "Fee cannot be negative")
      .nullable(),
    phone: yup
      .number()
      .typeError("Fee must be a number")
      .min(0, "Fee cannot be negative")
      .nullable(),
  }),
  clinicDetails: yup.object().shape({
    name: yup.string(),
    address: yup.object().shape({
      street: yup.string(),
      city: yup.string(),
      state: yup.string(),
      zipCode: yup.string(),
      country: yup.string(),
    }),
    contactNumber: yup.string(),
  }),
  languages: yup.array().of(yup.string()),
});

export default function DoctorProfileManager() {
  const { doctor, getDoctorProfile, loading } = useDoctor();
  const { user, updateProfileImage } = useAuth();
  const [activeTab, setActiveTab] = useState("personal");
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [qualifications, setQualifications] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [newLanguage, setNewLanguage] = useState("");
  const [newSpecialty, setNewSpecialty] = useState("");
  const [newQualification, setNewQualification] = useState({
    degree: "",
    institution: "",
    year: "",
  });
  const [videoConsultation, setVideoConsultation] = useState({
    available: false,
    platform: "zoom",
  });
  const [acceptingNewPatients, setAcceptingNewPatients] = useState(true);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    resolver: yupResolver(schema),
    mode: "onChange",
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      gender: "",
      bio: "",
      experience: "",
      registrationNumber: "",
      registrationCouncil: "",
      consultationFee: {
        inPerson: "",
        video: "",
        phone: "",
      },
      clinicDetails: {
        name: "",
        address: {
          street: "",
          city: "",
          state: "",
          zipCode: "",
          country: "India",
        },
        contactNumber: "",
      },
    },
  });

  // Initialize form with doctor data
  useEffect(() => {
    if (doctor && user) {
      // Set basic user info
      setValue("firstName", user.firstName || "");
      setValue("lastName", user.lastName || "");
      setValue("email", user.email || "");
      setValue("phone", user.phone || "");
      setValue("gender", user.gender || "");

      // Set doctor specific info
      setValue("bio", doctor.bio || "");
      setValue("experience", doctor.experience || "");
      setValue("registrationNumber", doctor.registrationNumber || "");
      setValue("registrationCouncil", doctor.registrationCouncil || "");

      // Set consultation fees
      if (doctor.consultationFee) {
        setValue("consultationFee.inPerson", doctor.consultationFee.inPerson || "");
        setValue("consultationFee.video", doctor.consultationFee.video || "");
        setValue("consultationFee.phone", doctor.consultationFee.phone || "");
      }

      // Set clinic details
      if (doctor.clinicDetails) {
        setValue("clinicDetails.name", doctor.clinicDetails.name || "");
        setValue("clinicDetails.contactNumber", doctor.clinicDetails.contactNumber || "");

        if (doctor.clinicDetails.address) {
          setValue("clinicDetails.address.street", doctor.clinicDetails.address.street || "");
          setValue("clinicDetails.address.city", doctor.clinicDetails.address.city || "");
          setValue("clinicDetails.address.state", doctor.clinicDetails.address.state || "");
          setValue("clinicDetails.address.zipCode", doctor.clinicDetails.address.zipCode || "");
          setValue("clinicDetails.address.country", doctor.clinicDetails.address.country || "India");
        }
      }

      // Set arrays
      setQualifications(doctor.qualifications || []);
      setSpecialties(doctor.specialties || []);
      setLanguages(doctor.languages || []);

      // Set video consultation
      setVideoConsultation(doctor.videoConsultation || { available: false, platform: "zoom" });

      // Set accepting new patients
      setAcceptingNewPatients(doctor.acceptingNewPatients !== false);

      // Set image preview
      if (user.profileImage) {
        setImagePreview(user.profileImage);
      }
    }
  }, [doctor, user, setValue]);

  const onSubmit = async (data) => {
    try {
      // Prepare data for API
      const formattedData = {
        ...data,
        qualifications,
        specialties,
        languages,
        videoConsultation,
        acceptingNewPatients,
      };

      // Call API to update profile
      await updateDoctorProfile(formattedData);
      toast.success("Profile updated successfully");

      // Refresh doctor profile
      await getDoctorProfile();
    } catch (error) {
      toast.error(error.message || "Failed to update profile");
    }
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProfileImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleImageUpload = async () => {
    if (!profileImage) {
      toast.error("Please select an image to upload");
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("image", profileImage);

      await updateProfileImage(formData);
      toast.success("Profile image updated successfully");
      setProfileImage(null);

      // Refresh doctor profile
      await getDoctorProfile();
    } catch (error) {
      toast.error(error.message || "Failed to update profile image");
    } finally {
      setUploading(false);
    }
  };

  const clearSelectedImage = () => {
    setProfileImage(null);
    setImagePreview(user?.profileImage || null);
  };

  // Handle qualifications
  const addQualification = () => {
    if (!newQualification.degree || !newQualification.institution || !newQualification.year) {
      toast.error("Please fill all qualification fields");
      return;
    }

    setQualifications([...qualifications, { ...newQualification }]);
    setNewQualification({ degree: "", institution: "", year: "" });
  };

  const removeQualification = (index) => {
    setQualifications(qualifications.filter((_, i) => i !== index));
  };

  // Handle specialties
  const addSpecialty = () => {
    if (!newSpecialty) {
      toast.error("Please enter a specialty");
      return;
    }

    if (specialties.includes(newSpecialty)) {
      toast.error("This specialty already exists");
      return;
    }

    setSpecialties([...specialties, newSpecialty]);
    setNewSpecialty("");
  };

  const removeSpecialty = (index) => {
    setSpecialties(specialties.filter((_, i) => i !== index));
  };

  // Handle languages
  const addLanguage = () => {
    if (!newLanguage) {
      toast.error("Please enter a language");
      return;
    }

    if (languages.includes(newLanguage)) {
      toast.error("This language already exists");
      return;
    }

    setLanguages([...languages, newLanguage]);
    setNewLanguage("");
  };

  const removeLanguage = (index) => {
    setLanguages(languages.filter((_, i) => i !== index));
  };

  // Use the updateDoctorProfile function from DoctorContext

  return (
    <Card className="w-full shadow-sm">
      <CardHeader>
        <CardTitle>My Profile</CardTitle>
        <CardDescription>
          Update your professional information and practice details
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-8 mb-8 items-center md:items-start">
          <div className="flex flex-col items-center">
            <Avatar className="w-32 h-32 border-4 border-white shadow-lg">
              <AvatarImage src={imagePreview || "https://via.placeholder.com/150"} alt="Profile" />
              <AvatarFallback className="bg-blue-100 text-blue-800 text-xl">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </AvatarFallback>
            </Avatar>

            <div className="mt-4 space-y-2">
              <label htmlFor="profile-image" className="cursor-pointer">
                <div className="flex items-center justify-center px-4 py-2 text-sm bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors">
                  <Upload className="h-4 w-4 mr-2" />
                  Change Photo
                </div>
                <input
                  id="profile-image"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </label>

              {profileImage && (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={handleImageUpload}
                    disabled={uploading}
                    className="w-full"
                  >
                    {uploading ? (
                      <><LoaderCircle className="h-4 w-4 mr-1 animate-spin" /> Uploading</>
                    ) : (
                      <><Save className="h-4 w-4 mr-1" /> Save</>
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={clearSelectedImage}
                    className="px-2"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 text-center md:text-left">
            <h2 className="text-2xl font-bold mb-1">
              {user?.firstName || doctor?.firstName} {user?.lastName || doctor?.lastName}
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mb-2">{user?.email || doctor?.email}</p>

            <div className="flex flex-wrap gap-2 justify-center md:justify-start">
              {specialties.map((specialty, index) => (
                <span key={index} className="px-2 py-1 bg-blue-50 text-blue-600 text-xs rounded-full">
                  {specialty}
                </span>
              ))}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList key="tabs-list" className="grid grid-cols-4">
              <TabsTrigger value="personal">Personal Info</TabsTrigger>
              <TabsTrigger value="professional">Professional</TabsTrigger>
              <TabsTrigger value="practice">Practice Details</TabsTrigger>
              <TabsTrigger value="preferences">Preferences</TabsTrigger>
            </TabsList>

            {/* Personal Information Tab */}
            <TabsContent value="personal" className="space-y-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    placeholder="First Name"
                    {...register("firstName")}
                  />
                  {errors.firstName && (
                    <p className="text-red-500 text-xs mt-1">{errors.firstName.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    placeholder="Last Name"
                    {...register("lastName")}
                  />
                  {errors.lastName && (
                    <p className="text-red-500 text-xs mt-1">{errors.lastName.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Email"
                    {...register("email")}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    placeholder="Phone Number"
                    {...register("phone")}
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Select
                    value={watch("gender")}
                    onValueChange={(value) => setValue("gender", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.gender && (
                    <p className="text-red-500 text-xs mt-1">{errors.gender.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  placeholder="Write a short bio about yourself"
                  className="min-h-[100px]"
                  {...register("bio")}
                />
              </div>
            </TabsContent>

            {/* Professional Tab */}
            <TabsContent value="professional" className="space-y-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="experience">Years of Experience</Label>
                  <Input
                    id="experience"
                    type="number"
                    placeholder="Years of Experience"
                    {...register("experience")}
                  />
                  {errors.experience && (
                    <p className="text-red-500 text-xs mt-1">{errors.experience.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="registrationNumber">Registration Number</Label>
                  <Input
                    id="registrationNumber"
                    placeholder="Registration Number"
                    {...register("registrationNumber")}
                  />
                  {errors.registrationNumber && (
                    <p className="text-red-500 text-xs mt-1">{errors.registrationNumber.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="registrationCouncil">Registration Council</Label>
                <Input
                  id="registrationCouncil"
                  placeholder="Registration Council"
                  {...register("registrationCouncil")}
                />
                {errors.registrationCouncil && (
                  <p className="text-red-500 text-xs mt-1">{errors.registrationCouncil.message}</p>
                )}
              </div>

              {/* Qualifications */}
              <div className="space-y-2">
                <Label>Qualifications</Label>
                <div className="space-y-4">
                  {qualifications.map((qualification, index) => (
                    <div key={index} className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                      <div className="flex-1">
                        <p className="font-medium">{qualification.degree}</p>
                        <p className="text-sm text-gray-500">{qualification.institution}, {qualification.year}</p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeQualification(index)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  ))}

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <Input
                      placeholder="Degree"
                      value={newQualification.degree}
                      onChange={(e) => setNewQualification({...newQualification, degree: e.target.value})}
                    />
                    <Input
                      placeholder="Institution"
                      value={newQualification.institution}
                      onChange={(e) => setNewQualification({...newQualification, institution: e.target.value})}
                    />
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        placeholder="Year"
                        value={newQualification.year}
                        onChange={(e) => setNewQualification({...newQualification, year: e.target.value})}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={addQualification}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Specialties */}
              <div className="space-y-2">
                <Label>Specialties</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {specialties.map((specialty, index) => (
                    <div key={index} className="flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-600 rounded-full">
                      <span>{specialty}</span>
                      <button
                        type="button"
                        onClick={() => removeSpecialty(index)}
                        className="text-blue-400 hover:text-blue-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add specialty"
                    value={newSpecialty}
                    onChange={(e) => setNewSpecialty(e.target.value)}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addSpecialty}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Languages */}
              <div className="space-y-2">
                <Label>Languages</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {languages.map((language, index) => (
                    <div key={index} className="flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full">
                      <span>{language}</span>
                      <button
                        type="button"
                        onClick={() => removeLanguage(index)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add language"
                    value={newLanguage}
                    onChange={(e) => setNewLanguage(e.target.value)}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addLanguage}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </TabsContent>

            {/* Practice Details Tab */}
            <TabsContent value="practice" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="clinicName">Clinic/Hospital Name</Label>
                <Input
                  id="clinicName"
                  placeholder="Clinic/Hospital Name"
                  {...register("clinicDetails.name")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="clinicContactNumber">Clinic Contact Number</Label>
                <Input
                  id="clinicContactNumber"
                  placeholder="Clinic Contact Number"
                  {...register("clinicDetails.contactNumber")}
                />
              </div>

              <div className="space-y-2">
                <Label>Clinic Address</Label>
                <Input
                  placeholder="Street Address"
                  className="mb-2"
                  {...register("clinicDetails.address.street")}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <Input
                    placeholder="City"
                    {...register("clinicDetails.address.city")}
                  />
                  <Input
                    placeholder="State"
                    {...register("clinicDetails.address.state")}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                  <Input
                    placeholder="ZIP Code"
                    {...register("clinicDetails.address.zipCode")}
                  />
                  <Input
                    placeholder="Country"
                    {...register("clinicDetails.address.country")}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Consultation Fees</Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="inPersonFee" className="text-xs">In-Person (₹)</Label>
                    <Input
                      id="inPersonFee"
                      type="number"
                      placeholder="0"
                      {...register("consultationFee.inPerson")}
                    />
                    {errors.consultationFee?.inPerson && (
                      <p className="text-red-500 text-xs mt-1">{errors.consultationFee.inPerson.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="videoFee" className="text-xs">Video Call (₹)</Label>
                    <Input
                      id="videoFee"
                      type="number"
                      placeholder="0"
                      {...register("consultationFee.video")}
                    />
                  </div>
                  <div>
                    <Label htmlFor="phoneFee" className="text-xs">Phone Call (₹)</Label>
                    <Input
                      id="phoneFee"
                      type="number"
                      placeholder="0"
                      {...register("consultationFee.phone")}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Preferences Tab */}
            <TabsContent value="preferences" className="space-y-4 mt-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="acceptingPatients" className="text-base font-medium">Accepting New Patients</Label>
                    <p className="text-sm text-gray-500">Toggle this off if you're not accepting new patients</p>
                  </div>
                  <Switch
                    id="acceptingPatients"
                    checked={acceptingNewPatients}
                    onCheckedChange={setAcceptingNewPatients}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="videoConsultation" className="text-base font-medium">Video Consultation</Label>
                    <p className="text-sm text-gray-500">Enable video consultation for your patients</p>
                  </div>
                  <Switch
                    id="videoConsultation"
                    checked={videoConsultation.available}
                    onCheckedChange={(checked) => setVideoConsultation({...videoConsultation, available: checked})}
                  />
                </div>

                {videoConsultation.available && (
                  <div className="space-y-2 pl-4 border-l-2 border-gray-100 dark:border-gray-700">
                    <Label htmlFor="videoPlatform">Preferred Platform</Label>
                    <Select
                      value={videoConsultation.platform}
                      onValueChange={(value) => setVideoConsultation({...videoConsultation, platform: value})}
                    >
                      <SelectTrigger id="videoPlatform">
                        <SelectValue placeholder="Select platform" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="zoom">Zoom</SelectItem>
                        <SelectItem value="google-meet">Google Meet</SelectItem>
                        <SelectItem value="microsoft-teams">Microsoft Teams</SelectItem>
                        <SelectItem value="custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>

          <div className="mt-6">
            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? <><LoaderCircle className="h-4 w-4 mr-2 animate-spin" /> Saving...</> : 'Save Changes'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
