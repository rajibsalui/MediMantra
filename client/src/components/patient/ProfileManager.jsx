"use client";

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'react-hot-toast';
import { usePatient } from '@/contexts/PatientContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LoaderCircle, Upload, Save, X } from 'lucide-react';

const schema = yup.object({
  firstName: yup.string().required('First name is required'),
  lastName: yup.string().required('Last name is required'),
  email: yup.string().email('Invalid email format').required('Email is required'),
  phone: yup.string()
    .required('Phone number is required')
    .matches(/^\d{10}$/, 'Phone number must be 10 digits'),
  dateOfBirth: yup.string().required('Date of birth is required'),
  gender: yup.string().required('Gender is required'),
  bloodGroup: yup.string(),
  height: yup.number().positive('Height must be positive').typeError('Height must be a number').nullable(),
  weight: yup.number().positive('Weight must be positive').typeError('Weight must be a number').nullable(),
  allergies: yup.string(),
  chronicConditions: yup.string(),
  currentMedications: yup.string(),
  emergencyContactName: yup.string().required('Emergency contact name is required'),
  emergencyContactPhone: yup.string()
    .required('Emergency contact phone is required')
    .matches(/^\d{10}$/, 'Phone number must be 10 digits'),
  emergencyContactRelation: yup.string().required('Relationship is required'),
  address: yup.object({
    street: yup.string().required('Street address is required'),
    city: yup.string().required('City is required'),
    state: yup.string().required('State is required'),
    zipCode: yup.string()
      .required('ZIP code is required')
      .matches(/^[1-9][0-9]{5}$/, 'ZIP code must be 6 digits'),
    country: yup.string().default('India')
  })
});

export default function ProfileManager() {
  const { patient, updatePatientProfile, updateProfileImage, loading } = usePatient();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('personal');
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);

  const { register, handleSubmit, reset, formState: { errors }, setValue, watch, trigger } = useForm({
    resolver: yupResolver(schema),
    mode: 'onChange',
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      dateOfBirth: '',
      gender: '',
      bloodGroup: '',
      height: '',
      weight: '',
      allergies: '',
      chronicConditions: '',
      currentMedications: '',
      emergencyContactName: '',
      emergencyContactPhone: '',
      emergencyContactRelation: '',
      address: {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'India'
      }
    }
  });

  // For debugging
  const formValues = watch();

  // Log form values when they change
  useEffect(() => {
    console.log('Form values:', formValues);
  }, [formValues]);

  useEffect(() => {
    if (patient && user) {
      // Combine user and patient data for the form
      reset({
        firstName: user.firstName || patient.firstName || '',
        lastName: user.lastName || patient.lastName || '',
        email: user.email || '',
        phone: user.phone || patient.phone || '',
        dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] :
                    (patient.dateOfBirth ? new Date(patient.dateOfBirth).toISOString().split('T')[0] : ''),
        gender: user.gender || patient.gender || '',
        bloodGroup: patient.bloodGroup || '',
        height: patient.height?.value || '',
        weight: patient.weight?.value || '',
        allergies: patient.medicalInformation?.allergies || patient.allergies?.join(', ') || '',
        chronicConditions: patient.medicalInformation?.chronicConditions || patient.chronicConditions?.join(', ') || '',
        currentMedications: patient.medicalInformation?.currentMedications || '',
        emergencyContactName: patient.emergencyContact?.name || '',
        emergencyContactPhone: patient.emergencyContact?.phone || '',
        emergencyContactRelation: patient.emergencyContact?.relationship || '',
        address: {
          street: user.address?.street || patient.address?.street || '',
          city: user.address?.city || patient.address?.city || '',
          state: user.address?.state || patient.address?.state || '',
          zipCode: user.address?.zipCode || patient.address?.zipCode || '',
          country: user.address?.country || patient.address?.country || 'India'
        }
      });

      // Set image preview if available
      if (user.profileImage || patient.profileImage) {
        setImagePreview(user.profileImage || patient.profileImage);
      }
    }
  }, [patient, user, reset]);

  const onSubmit = async (data) => {
    try {
      console.log('Form submitted with data:', data);

      // Format the data
      const formattedData = {
        ...data,
        medicalInformation: {
          allergies: data.allergies || '',
          chronicConditions: data.chronicConditions || '',
          currentMedications: data.currentMedications || ''
        },
        emergencyContact: {
          name: data.emergencyContactName,
          phone: data.emergencyContactPhone,
          relationship: data.emergencyContactRelation
        }
      };

      console.log('Formatted data:', formattedData);

      // Remove fields that are now in nested objects
      delete formattedData.allergies;
      delete formattedData.chronicConditions;
      delete formattedData.currentMedications;
      delete formattedData.emergencyContactName;
      delete formattedData.emergencyContactPhone;
      delete formattedData.emergencyContactRelation;

      // Convert height and weight to proper format if provided
      if (data.height) {
        formattedData.height = {
          value: parseFloat(data.height),
          unit: 'cm'
        };
      }

      if (data.weight) {
        formattedData.weight = {
          value: parseFloat(data.weight),
          unit: 'kg'
        };
      }

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
              {user?.firstName || patient?.firstName} {user?.lastName || patient?.lastName}
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mb-2">{user?.email || patient?.email}</p>

            <div className="flex flex-wrap gap-2 mb-3">
              {patient?.bloodGroup && patient?.bloodGroup !== 'unknown' && (
                <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                  Blood Type: {patient.bloodGroup}
                </Badge>
              )}

              {user?.gender && (
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  {user.gender.charAt(0).toUpperCase() + user.gender.slice(1)}
                </Badge>
              )}

              {patient?.medicalInformation?.allergies && (
                <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                  Allergies
                </Badge>
              )}
            </div>

            <div className="mt-4 space-y-1 text-sm text-gray-500 dark:text-gray-400">
              {user?.dateOfBirth && (
                <p className="flex items-center gap-2">
                  <span className="font-medium">Date of Birth:</span>
                  {new Date(user.dateOfBirth).toLocaleDateString()}
                </p>
              )}

              {user?.phone && (
                <p className="flex items-center gap-2">
                  <span className="font-medium">Phone:</span> {user.phone}
                </p>
              )}

              {(user?.address?.city || patient?.address?.city) && (user?.address?.state || patient?.address?.state) && (
                <p className="flex items-center gap-2">
                  <span className="font-medium">Location:</span>
                  {user?.address?.city || patient?.address?.city}, {user?.address?.state || patient?.address?.state}
                </p>
              )}

              {patient?.emergencyContact?.name && (
                <p className="flex items-center gap-2">
                  <span className="font-medium">Emergency Contact:</span>
                  {patient.emergencyContact.name} ({patient.emergencyContact.relationship})
                </p>
              )}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList key="tabs-list" className="grid grid-cols-4">
              <TabsTrigger value="personal">Personal Info</TabsTrigger>
              <TabsTrigger value="medical">Medical Details</TabsTrigger>
              <TabsTrigger value="emergency">Emergency Contact</TabsTrigger>
              <TabsTrigger value="address">Address</TabsTrigger>
            </TabsList>
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
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Email Address"
                  {...register('email')}
                  disabled
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email.message}</p>
                )}
                <p className="text-xs text-gray-500">Email address cannot be changed. Contact support for assistance.</p>
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
                  <input type="hidden" {...register('gender')} />
                  <Select
                    onValueChange={(value) => setValue('gender', value)}
                    defaultValue={patient?.gender || ''}
                    name="gender"
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
                  <input type="hidden" {...register('bloodGroup')} />
                  <Select
                    onValueChange={(value) => setValue('bloodGroup', value)}
                    defaultValue={patient?.bloodGroup || ''}
                    name="bloodGroup"
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
                      <SelectItem value="unknown">Unknown</SelectItem>
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

              <div className="space-y-2">
                <Label htmlFor="currentMedications">Current Medications</Label>
                <Textarea
                  id="currentMedications"
                  placeholder="List any medications you are currently taking"
                  {...register('currentMedications')}
                />
              </div>
            </TabsContent>

            <TabsContent value="emergency" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="emergencyContactName">Emergency Contact Name</Label>
                <Input
                  id="emergencyContactName"
                  placeholder="Full name of emergency contact"
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
                  placeholder="Emergency contact phone number"
                  {...register('emergencyContactPhone')}
                />
                {errors.emergencyContactPhone && (
                  <p className="text-sm text-red-500">{errors.emergencyContactPhone.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="emergencyContactRelation">Relationship to Emergency Contact</Label>
                <Input
                  id="emergencyContactRelation"
                  placeholder="E.g., Parent, Spouse, Sibling, Friend"
                  {...register('emergencyContactRelation')}
                />
                {errors.emergencyContactRelation && (
                  <p className="text-sm text-red-500">{errors.emergencyContactRelation.message}</p>
                )}
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
