"use client";

import { useState } from "react";
import { 
  User, 
  MapPin, 
  Phone, 
  Mail, 
  Calendar, 
  Award, 
  Heart, 
  Languages, 
  Clock, 
  Edit,
  Building,
  CreditCard,
  Video,
  Check,
  X
} from "lucide-react";
import { useDoctor } from "@/contexts/DoctorContext";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Helper function to format date
const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export default function DoctorProfileDetails({ onEditClick }) {
  const { doctor } = useDoctor();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("personal");

  // Get combined data from user and doctor objects
  const profileData = {
    firstName: user?.firstName || doctor?.user?.firstName || '',
    lastName: user?.lastName || doctor?.user?.lastName || '',
    email: user?.email || doctor?.user?.email || '',
    phone: user?.phone || doctor?.user?.phone || '',
    gender: user?.gender || doctor?.gender || '',
    profileImage: user?.profileImage || doctor?.user?.profileImage || '',
    registrationDate: user?.createdAt || doctor?.createdAt,
    bio: doctor?.bio || 'No bio provided',
    experience: doctor?.experience || 0,
    registrationNumber: doctor?.registrationNumber || '',
    registrationCouncil: doctor?.registrationCouncil || '',
    qualifications: doctor?.qualifications || [],
    specialties: doctor?.specialties || [],
    languages: doctor?.languages || [],
    clinicDetails: doctor?.clinicDetails || {},
    consultationFee: doctor?.consultationFee || {},
    videoConsultation: doctor?.videoConsultation || { available: false },
    acceptingNewPatients: doctor?.acceptingNewPatients !== false,
    averageRating: doctor?.averageRating || 0,
    totalReviews: doctor?.totalReviews || 0,
  };

  return (
    <Card className="w-full shadow-sm">
      <CardHeader className="relative">
        <div className="absolute right-6 top-6">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onEditClick}
            className="flex items-center gap-1"
          >
            <Edit className="h-4 w-4" />
            Edit Profile
          </Button>
        </div>
        <CardTitle>Profile Details</CardTitle>
        <CardDescription>
          Your professional and practice information
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="flex flex-col md:flex-row gap-8 mb-8 items-center md:items-start">
          <div className="flex flex-col items-center">
            <Avatar className="w-32 h-32 border-4 border-white shadow-lg">
              <AvatarImage src={profileData.profileImage || "https://via.placeholder.com/150"} alt="Profile" />
              <AvatarFallback className="bg-blue-100 text-blue-800 text-xl">
                {profileData.firstName?.[0]}{profileData.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
            
            <div className="mt-4 text-center">
              <h2 className="text-xl font-bold">
                {profileData.firstName} {profileData.lastName}
              </h2>
              <p className="text-gray-500 text-sm mt-1">Doctor</p>
              
              {profileData.registrationDate && (
                <p className="text-xs text-gray-400 mt-2">
                  Member since {formatDate(profileData.registrationDate)}
                </p>
              )}
            </div>
          </div>
          
          <div className="flex-1">
            <div className="flex flex-wrap gap-2 mb-4 justify-center md:justify-start">
              {profileData.specialties.map((specialty, index) => (
                <Badge key={index} variant="secondary" className="bg-blue-50 text-blue-600 hover:bg-blue-100">
                  {specialty}
                </Badge>
              ))}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2 text-gray-600">
                <Mail className="h-4 w-4 text-blue-500" />
                <span>{profileData.email}</span>
              </div>
              
              <div className="flex items-center gap-2 text-gray-600">
                <Phone className="h-4 w-4 text-blue-500" />
                <span>{profileData.phone || "Not provided"}</span>
              </div>
              
              <div className="flex items-center gap-2 text-gray-600">
                <Award className="h-4 w-4 text-blue-500" />
                <span>{profileData.experience} years experience</span>
              </div>
              
              <div className="flex items-center gap-2 text-gray-600">
                <User className="h-4 w-4 text-blue-500" />
                <span>{profileData.gender || "Not specified"}</span>
              </div>
            </div>
            
            <div className="mt-4 text-gray-600">
              <p className="italic">{profileData.bio}</p>
            </div>
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList key="tabs-list" className="grid grid-cols-4">
            <TabsTrigger value="personal">
              <User className="h-4 w-4 mr-2" />
              Personal
            </TabsTrigger>
            <TabsTrigger value="professional">
              <Award className="h-4 w-4 mr-2" />
              Professional
            </TabsTrigger>
            <TabsTrigger value="practice">
              <Building className="h-4 w-4 mr-2" />
              Practice
            </TabsTrigger>
            <TabsTrigger value="preferences">
              <Heart className="h-4 w-4 mr-2" />
              Preferences
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="personal" className="mt-6">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-medium mb-4">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4">
                <div>
                  <p className="text-sm text-gray-500">Full Name</p>
                  <p className="font-medium">{profileData.firstName} {profileData.lastName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{profileData.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium">{profileData.phone || "Not provided"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Gender</p>
                  <p className="font-medium">{profileData.gender || "Not specified"}</p>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="professional" className="mt-6">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-medium mb-4">Professional Information</h3>
              
              <div className="mb-6">
                <p className="text-sm text-gray-500 mb-1">Registration Details</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2">
                  <div>
                    <p className="text-xs text-gray-500">Registration Number</p>
                    <p className="font-medium">{profileData.registrationNumber}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Registration Council</p>
                    <p className="font-medium">{profileData.registrationCouncil}</p>
                  </div>
                </div>
              </div>
              
              <div className="mb-6">
                <p className="text-sm text-gray-500 mb-2">Qualifications</p>
                {profileData.qualifications.length > 0 ? (
                  <div className="space-y-2">
                    {profileData.qualifications.map((qual, index) => (
                      <div key={index} className="bg-white dark:bg-gray-700 p-2 rounded-md">
                        <p className="font-medium">{qual.degree}</p>
                        <p className="text-sm text-gray-500">{qual.institution}, {qual.year}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm italic">No qualifications added</p>
                )}
              </div>
              
              <div className="mb-6">
                <p className="text-sm text-gray-500 mb-2">Specialties</p>
                <div className="flex flex-wrap gap-2">
                  {profileData.specialties.length > 0 ? (
                    profileData.specialties.map((specialty, index) => (
                      <Badge key={index} variant="outline" className="bg-blue-50 text-blue-600">
                        {specialty}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-sm italic">No specialties added</p>
                  )}
                </div>
              </div>
              
              <div>
                <p className="text-sm text-gray-500 mb-2">Languages</p>
                <div className="flex flex-wrap gap-2">
                  {profileData.languages.length > 0 ? (
                    profileData.languages.map((language, index) => (
                      <Badge key={index} variant="outline" className="bg-gray-100 text-gray-700">
                        {language}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-sm italic">No languages added</p>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="practice" className="mt-6">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-medium mb-4">Practice Details</h3>
              
              <div className="mb-6">
                <p className="text-sm text-gray-500 mb-1">Clinic Information</p>
                <div className="grid grid-cols-1 gap-y-2">
                  <div>
                    <p className="text-xs text-gray-500">Clinic/Hospital Name</p>
                    <p className="font-medium">{profileData.clinicDetails?.name || "Not provided"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Contact Number</p>
                    <p className="font-medium">{profileData.clinicDetails?.contactNumber || "Not provided"}</p>
                  </div>
                </div>
              </div>
              
              <div className="mb-6">
                <p className="text-sm text-gray-500 mb-1">Clinic Address</p>
                {profileData.clinicDetails?.address?.street ? (
                  <div>
                    <p className="font-medium">{profileData.clinicDetails.address.street}</p>
                    <p>
                      {profileData.clinicDetails.address.city}{profileData.clinicDetails.address.city && profileData.clinicDetails.address.state ? ', ' : ''}
                      {profileData.clinicDetails.address.state}
                    </p>
                    <p>
                      {profileData.clinicDetails.address.zipCode}{profileData.clinicDetails.address.zipCode ? ', ' : ''}
                      {profileData.clinicDetails.address.country || 'India'}
                    </p>
                  </div>
                ) : (
                  <p className="text-sm italic">No address provided</p>
                )}
              </div>
              
              <div>
                <p className="text-sm text-gray-500 mb-2">Consultation Fees</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white dark:bg-gray-700 p-3 rounded-md">
                    <p className="text-xs text-gray-500">In-Person</p>
                    <p className="font-medium">₹{profileData.consultationFee?.inPerson || 0}</p>
                  </div>
                  
                  <div className="bg-white dark:bg-gray-700 p-3 rounded-md">
                    <p className="text-xs text-gray-500">Video Call</p>
                    <p className="font-medium">₹{profileData.consultationFee?.video || 0}</p>
                  </div>
                  
                  <div className="bg-white dark:bg-gray-700 p-3 rounded-md">
                    <p className="text-xs text-gray-500">Phone Call</p>
                    <p className="font-medium">₹{profileData.consultationFee?.phone || 0}</p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="preferences" className="mt-6">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-medium mb-4">Preferences</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-700 rounded-md">
                  <div>
                    <p className="font-medium">Accepting New Patients</p>
                    <p className="text-sm text-gray-500">Whether you're currently accepting new patients</p>
                  </div>
                  <div className={`p-1 rounded-full ${profileData.acceptingNewPatients ? 'bg-green-100' : 'bg-red-100'}`}>
                    {profileData.acceptingNewPatients ? (
                      <Check className="h-5 w-5 text-green-600" />
                    ) : (
                      <X className="h-5 w-5 text-red-600" />
                    )}
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-700 rounded-md">
                  <div>
                    <p className="font-medium">Video Consultation</p>
                    <p className="text-sm text-gray-500">Whether you offer video consultations</p>
                  </div>
                  <div className={`p-1 rounded-full ${profileData.videoConsultation?.available ? 'bg-green-100' : 'bg-red-100'}`}>
                    {profileData.videoConsultation?.available ? (
                      <Check className="h-5 w-5 text-green-600" />
                    ) : (
                      <X className="h-5 w-5 text-red-600" />
                    )}
                  </div>
                </div>
                
                {profileData.videoConsultation?.available && (
                  <div className="p-3 bg-white dark:bg-gray-700 rounded-md ml-6 border-l-4 border-blue-200">
                    <p className="font-medium">Preferred Platform</p>
                    <p className="text-sm">
                      {profileData.videoConsultation.platform === 'zoom' && 'Zoom'}
                      {profileData.videoConsultation.platform === 'google-meet' && 'Google Meet'}
                      {profileData.videoConsultation.platform === 'microsoft-teams' && 'Microsoft Teams'}
                      {profileData.videoConsultation.platform === 'custom' && 'Custom Platform'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
