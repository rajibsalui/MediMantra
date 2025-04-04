"use client";

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'react-hot-toast';
import { usePatient } from '@/contexts/PatientContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LoaderCircle, Upload, Save, User, X } from 'lucide-react';

const schema = yup.object({
  firstName: yup.string().required('First name is required'),
  lastName: yup.string().required('Last name is required'),
  phone: yup.string().required('Phone number is required'),
  dateOfBirth: yup.string().required('Date of birth is required'),
  gender: yup.string().required('Gender is required'),
  bloodGroup: yup.string(),
  height: yup.number().positive('Height must be positive').typeError('Height must be a number'),
  weight: yup.number().positive('Weight must be positive').typeError('Weight must be a number'),
  allergies: yup.string(),
  chronicConditions: yup.string(),
  emergencyContactName: yup.string(),
  emergencyContactPhone: yup.string(),
  address: yup.object({
    street: yup.string(),
    city: yup.string(),
    state: yup.string(),
    zipCode: yup.string(),
    country: yup.string()
  })
});

export default function ProfileManager() {
  const { patient, updatePatientProfile, updateProfileImage, loading } = usePatient();
  const [activeTab, setActiveTab] = useState('personal');
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  
  const { register, handleSubmit, reset, formState: { errors, isDirty }, setValue } = useForm({
    resolver: yupResolver(schema)
  });

  useEffect(() => {
    if (patient) {
      reset({
        firstName: patient.firstName || '',
        lastName: patient.lastName || '',
        phone: patient.phone || '',
        dateOfBirth: patient.dateOfBirth ? new Date(patient.dateOfBirth).toISOString().split('T')[0] : '',
        gender: patient.gender || '',
        bloodGroup: patient.bloodGroup || '',
        height: patient.height || '',
        weight: patient.weight || '',
        allergies: patient.allergies?.join(', ') || '',
        chronicConditions: patient.chronicConditions?.join(', ') || '',
        emergencyContactName: patient.emergencyContact?.name || '',
        emergencyContactPhone: patient.emergencyContact?.phone || '',
        address: {
          street: patient.address?.street || '',
          city: patient.address?.city || '',
          state: patient.address?.state || '',
          zipCode: patient.address?.zipCode || '',
          country: patient.address?.country || ''
        }
      });
      
      if (patient.profileImage) {
        setImagePreview(patient.profileImage);
      }
    }
  }, [patient, reset]);

  const onSubmit = async (data) => {
    try {
      // Format the data
      const formattedData = {
        ...data,
        allergies: data.allergies ? data.allergies.split(',').map(item => item.trim()).filter(Boolean) : [],
        chronicConditions: data.chronicConditions ? data.chronicConditions.split(',').map(item => item.trim()).filter(Boolean) : [],
        emergencyContact: {
          name: data.emergencyContactName,
          phone: data.emergencyContactPhone
        }
      };
      
      delete formattedData.emergencyContactName;
      delete formattedData.emergencyContactPhone;
      
      await updatePatientProfile(formattedData);
      toast.success("Profile updated successfully");
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
      formData.append('image', profileImage);
      
      await updateProfileImage(formData);
      toast.success("Profile image updated successfully");
      setProfileImage(null);
    } catch (error) {
      toast.error(error.message || "Failed to update profile image");
    } finally {
      setUploading(false);
    }
  };

  const clearSelectedImage = () => {
    setProfileImage(null);
    setImagePreview(patient?.profileImage || null);
  };

  return (
    <Card className="w-full shadow-sm">
      <CardHeader>
        <CardTitle>My Profile</CardTitle>
        <CardDescription>
          Update your personal information and medical details
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-8 mb-8 items-center md:items-start">
          <div className="flex flex-col items-center">
            <Avatar className="w-32 h-32 border-4 border-white shadow-lg">
              <AvatarImage src={imagePreview || "https://via.placeholder.com/150"} alt="Profile" />
              <AvatarFallback className="bg-blue-100 text-blue-800 text-xl">
                {patient?.firstName?.[0]}{patient?.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
            
            <div className="mt-4 flex flex-col gap-2">
              <Label htmlFor="profile-image" className="cursor-pointer bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-1.5 rounded-md flex items-center justify-center text-sm font-medium">
                <Upload className="h-4 w-4 mr-1.5" />
                Change Photo
              </Label>
              <Input 
                id="profile-image"
                type="file"
                onChange={handleImageChange}
                accept="image/*"
                className="hidden"
              />
              
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
              {patient?.firstName} {patient?.lastName}
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mb-2">{patient?.email}</p>
            
            {patient?.bloodGroup && (
              <div className="inline-block bg-red-50 text-red-700 px-2 py-1 rounded-md text-sm font-medium">
                Blood Type: {patient.bloodGroup}
              </div>
            )}
            
            <div className="mt-4 space-y-1 text-sm text-gray-500 dark:text-gray-400">
              {patient?.dateOfBirth && (
                <p>Date of Birth: {new Date(patient.dateOfBirth).toLocaleDateString()}</p>
              )}
              {patient?.phone && <p>Phone: {patient.phone}</p>}
              {patient?.address?.city && patient?.address?.state && (
                <p>Location: {patient.address.city}, {patient.address.state}</p>
              )}
            </div>
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="personal">Personal Info</TabsTrigger>
            <TabsTrigger value="medical">Medical Details</TabsTrigger>
            <TabsTrigger value="address">Address</TabsTrigger>
          </TabsList>
          
          <form onSubmit={handleSubmit(onSubmit)}>
            <TabsContent value="personal" className="space-y-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input 
                    id="firstName" 
                    placeholder="First Name" 
                    {...register('firstName')}
                    error={errors.firstName?.message}
                  />
                  {errors.firstName && (
                    <p className="text-sm text-red-500">{errors.firstName.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input 
                    id="lastName" 
                    placeholder="Last Name" 
                    {...register('lastName')}
                  />
                  {errors.lastName && (
                    <p className="text-sm text-red-500">{errors.lastName.message}</p>
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input 
                  id="phone" 
                  placeholder="Phone Number" 
                  {...register('phone')}
                />
                {errors.phone && (
                  <p className="text-sm text-red-500">{errors.phone.message}</p>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  <Input 
                    id="dateOfBirth" 
                    type="date" 
                    {...register('dateOfBirth')}
                  />
                  {errors.dateOfBirth && (
                    <p className="text-sm text-red-500">{errors.dateOfBirth.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Select 
                    onValueChange={(value) => setValue('gender', value)} 
                    defaultValue={patient?.gender}
                  >
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
                  {errors.gender && (
                    <p className="text-sm text-red-500">{errors.gender.message}</p>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="emergencyContactName">Emergency Contact Name</Label>
                  <Input 
                    id="emergencyContactName" 
                    placeholder="Emergency Contact Name" 
                    {...register('emergencyContactName')}
                  />
                  {errors.emergencyContactName && (
                    <p className="text-sm text-red-500">{errors.emergencyContactName.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emergencyContactPhone">Emergency Contact Phone</Label>
                  <Input 
                    id="emergencyContactPhone" 
                    placeholder="Emergency Contact Phone" 
                    {...register('emergencyContactPhone')}
                  />
                  {errors.emergencyContactPhone && (
                    <p className="text-sm text-red-500">{errors.emergencyContactPhone.message}</p>
                  )}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="medical" className="space-y-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bloodGroup">Blood Group</Label>
                  <Select 
                    onValueChange={(value) => setValue('bloodGroup', value)} 
                    defaultValue={patient?.bloodGroup}
                  >
                    <SelectTrigger id="bloodGroup">
                      <SelectValue placeholder="Select blood group" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A+">A+</SelectItem>
                      <SelectItem value="A-">A-</SelectItem>
                      <SelectItem value="B+">B+</SelectItem>
                      <SelectItem value="B-">B-</SelectItem>
                      <SelectItem value="AB+">AB+</SelectItem>
                      <SelectItem value="AB-">AB-</SelectItem>
                      <SelectItem value="O+">O+</SelectItem>
                      <SelectItem value="O-">O-</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="height">Height (cm)</Label>
                  <Input 
                    id="height" 
                    placeholder="Height in cm" 
                    {...register('height')}
                  />
                  {errors.height && (
                    <p className="text-sm text-red-500">{errors.height.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <Input 
                    id="weight" 
                    placeholder="Weight in kg" 
                    {...register('weight')}
                  />
                  {errors.weight && (
                    <p className="text-sm text-red-500">{errors.weight.message}</p>
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="allergies">Allergies (comma separated)</Label>
                <Textarea 
                  id="allergies" 
                  placeholder="Penicillin, Peanuts, etc." 
                  {...register('allergies')}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="chronicConditions">Chronic Conditions (comma separated)</Label>
                <Textarea 
                  id="chronicConditions" 
                  placeholder="Diabetes, Hypertension, etc." 
                  {...register('chronicConditions')}
                />
              </div>
            </TabsContent>
            
            <TabsContent value="address" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="street">Street Address</Label>
                <Input 
                  id="street" 
                  placeholder="Street address" 
                  {...register('address.street')}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input 
                    id="city" 
                    placeholder="City" 
                    {...register('address.city')}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input 
                    id="state" 
                    placeholder="State" 
                    {...register('address.state')}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="zipCode">ZIP Code</Label>
                  <Input 
                    id="zipCode" 
                    placeholder="ZIP Code" 
                    {...register('address.zipCode')}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input 
                    id="country" 
                    placeholder="Country" 
                    {...register('address.country')}
                  />
                </div>
              </div>
            </TabsContent>
            
            <div className="mt-6">
              <Button type="submit" className="w-full" disabled={loading || !isDirty}>
                {loading ? <><LoaderCircle className="h-4 w-4 mr-2 animate-spin" /> Saving...</> : 'Save Changes'}
              </Button>
            </div>
          </form>
        </Tabs>
      </CardContent>
    </Card>
  );
}
