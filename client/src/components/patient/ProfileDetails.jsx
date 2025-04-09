"use client";

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { usePatient } from '@/contexts/PatientContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Phone, Mail, MapPin, User, Heart, Activity, AlertCircle, Users, Edit } from 'lucide-react';

export default function ProfileDetails({ onEditClick }) {
  const { user } = useAuth();
  const { patient } = usePatient();
  const [activeTab, setActiveTab] = useState('personal');

  // Format date to readable string
  const formatDate = (dateString) => {
    if (!dateString) return 'Not provided';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Calculate age from date of birth
  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return null;
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  // Get combined data from user and patient objects
  const profileData = {
    firstName: user?.firstName || patient?.firstName || '',
    lastName: user?.lastName || patient?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || patient?.phone || '',
    dateOfBirth: user?.dateOfBirth || patient?.dateOfBirth || '',
    age: calculateAge(user?.dateOfBirth || patient?.dateOfBirth),
    gender: user?.gender || patient?.gender || '',
    bloodGroup: patient?.bloodGroup || 'Not specified',
    height: patient?.height?.value ? `${patient.height.value} ${patient.height.unit || 'cm'}` : 'Not specified',
    weight: patient?.weight?.value ? `${patient.weight.value} ${patient.weight.unit || 'kg'}` : 'Not specified',
    allergies: patient?.medicalInformation?.allergies || 'None',
    chronicConditions: patient?.medicalInformation?.chronicConditions || 'None',
    currentMedications: patient?.medicalInformation?.currentMedications || 'None',
    emergencyContact: {
      name: patient?.emergencyContact?.name || '',
      phone: patient?.emergencyContact?.phone || '',
      relationship: patient?.emergencyContact?.relationship || ''
    },
    address: {
      street: user?.address?.street || patient?.address?.street || '',
      city: user?.address?.city || patient?.address?.city || '',
      state: user?.address?.state || patient?.address?.state || '',
      zipCode: user?.address?.zipCode || patient?.address?.zipCode || '',
      country: user?.address?.country || patient?.address?.country || 'India'
    },
    profileImage: user?.profileImage || patient?.profileImage || null,
    registrationDate: user?.registrationDate || user?.createdAt || '',
    lastUpdated: user?.lastUpdated || user?.updatedAt || ''
  };

  // Format full address
  const fullAddress = [
    profileData.address.street,
    profileData.address.city,
    profileData.address.state,
    profileData.address.zipCode,
    profileData.address.country
  ].filter(Boolean).join(', ');

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
          Your personal and medical information
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
              <p className="text-gray-500 text-sm mt-1">Patient</p>
              
              {profileData.registrationDate && (
                <p className="text-xs text-gray-400 mt-2">
                  Member since {formatDate(profileData.registrationDate)}
                </p>
              )}
            </div>
          </div>
          
          <div className="flex-1">
            <div className="flex flex-wrap gap-2 mb-4">
              {profileData.bloodGroup && profileData.bloodGroup !== 'Not specified' && (
                <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                  Blood Type: {profileData.bloodGroup}
                </Badge>
              )}
              
              {profileData.gender && (
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  {profileData.gender.charAt(0).toUpperCase() + profileData.gender.slice(1)}
                </Badge>
              )}
              
              {profileData.age && (
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  Age: {profileData.age}
                </Badge>
              )}
              
              {profileData.allergies && profileData.allergies !== 'None' && (
                <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                  Has Allergies
                </Badge>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-start gap-2">
                <Mail className="h-4 w-4 text-gray-400 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-700">Email</p>
                  <p className="text-gray-600">{profileData.email}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <Phone className="h-4 w-4 text-gray-400 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-700">Phone</p>
                  <p className="text-gray-600">{profileData.phone || 'Not provided'}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <Calendar className="h-4 w-4 text-gray-400 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-700">Date of Birth</p>
                  <p className="text-gray-600">{formatDate(profileData.dateOfBirth)}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-700">Location</p>
                  <p className="text-gray-600">
                    {profileData.address.city && profileData.address.state 
                      ? `${profileData.address.city}, ${profileData.address.state}` 
                      : 'Not provided'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList key="tabs-list" className="grid grid-cols-4">
            <TabsTrigger value="personal">
              <User className="h-4 w-4 mr-2" />
              Personal
            </TabsTrigger>
            <TabsTrigger value="medical">
              <Heart className="h-4 w-4 mr-2" />
              Medical
            </TabsTrigger>
            <TabsTrigger value="emergency">
              <AlertCircle className="h-4 w-4 mr-2" />
              Emergency
            </TabsTrigger>
            <TabsTrigger value="address">
              <MapPin className="h-4 w-4 mr-2" />
              Address
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="personal" className="mt-6">
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-medium mb-4">Personal Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6">
                <div>
                  <p className="text-sm font-medium text-gray-500">Full Name</p>
                  <p className="mt-1">{profileData.firstName} {profileData.lastName}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-500">Email Address</p>
                  <p className="mt-1">{profileData.email}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-500">Phone Number</p>
                  <p className="mt-1">{profileData.phone || 'Not provided'}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-500">Date of Birth</p>
                  <p className="mt-1">{formatDate(profileData.dateOfBirth)}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-500">Age</p>
                  <p className="mt-1">{profileData.age || 'Not available'}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-500">Gender</p>
                  <p className="mt-1">{profileData.gender ? profileData.gender.charAt(0).toUpperCase() + profileData.gender.slice(1) : 'Not specified'}</p>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="medical" className="mt-6">
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-medium mb-4">Medical Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6 mb-6">
                <div>
                  <p className="text-sm font-medium text-gray-500">Blood Group</p>
                  <p className="mt-1">{profileData.bloodGroup}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-500">Height</p>
                  <p className="mt-1">{profileData.height}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-500">Weight</p>
                  <p className="mt-1">{profileData.weight}</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Allergies</p>
                  <div className="mt-1 p-3 bg-white rounded border border-gray-200">
                    <p className="whitespace-pre-wrap">{profileData.allergies}</p>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-500">Chronic Conditions</p>
                  <div className="mt-1 p-3 bg-white rounded border border-gray-200">
                    <p className="whitespace-pre-wrap">{profileData.chronicConditions}</p>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-500">Current Medications</p>
                  <div className="mt-1 p-3 bg-white rounded border border-gray-200">
                    <p className="whitespace-pre-wrap">{profileData.currentMedications}</p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="emergency" className="mt-6">
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-medium mb-4">Emergency Contact</h3>
              
              {profileData.emergencyContact.name ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Contact Name</p>
                    <p className="mt-1">{profileData.emergencyContact.name}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-500">Relationship</p>
                    <p className="mt-1">{profileData.emergencyContact.relationship || 'Not specified'}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-500">Contact Phone</p>
                    <p className="mt-1">{profileData.emergencyContact.phone}</p>
                  </div>
                </div>
              ) : (
                <div className="bg-yellow-50 p-4 rounded-md text-yellow-800">
                  No emergency contact information has been provided. Please add emergency contact details for your safety.
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="address" className="mt-6">
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-medium mb-4">Address Information</h3>
              
              {profileData.address.street ? (
                <div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Street Address</p>
                      <p className="mt-1">{profileData.address.street}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-gray-500">City</p>
                      <p className="mt-1">{profileData.address.city}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-gray-500">State</p>
                      <p className="mt-1">{profileData.address.state}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-gray-500">ZIP Code</p>
                      <p className="mt-1">{profileData.address.zipCode}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-gray-500">Country</p>
                      <p className="mt-1">{profileData.address.country}</p>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <p className="text-sm font-medium text-gray-500">Full Address</p>
                    <p className="mt-1">{fullAddress}</p>
                  </div>
                </div>
              ) : (
                <div className="bg-yellow-50 p-4 rounded-md text-yellow-800">
                  No address information has been provided. Please add your address details.
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
