"use client";

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, AlertCircle, RefreshCw, Edit } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function ProfileSummary({ user, patientProfile, isLoading, error, onRetry }) {
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return 'N/A';
    const dob = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDifference = today.getMonth() - dob.getMonth();
    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    return age;
  };

  if (isLoading) {
    return (
      <Card className="bg-white shadow-sm">
        <CardContent className="p-6">
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-white shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center text-center py-8">
            <AlertCircle className="h-10 w-10 text-red-500 mb-2" />
            <p className="text-gray-700 mb-4">{error.message || "Failed to load profile"}</p>
            <Button 
              onClick={onRetry} 
              variant="outline" 
              size="sm"
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white shadow-sm overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <CardContent className="p-0">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 text-white">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
              <Avatar className="h-20 w-20 border-4 border-white/20">
                <AvatarImage 
                  src={patientProfile?.profileImage || user?.profileImage || '/default-avatar.png'} 
                  alt={`${user?.firstName || ''} ${user?.lastName || ''}`}
                />
                <AvatarFallback className="bg-white text-blue-600 text-xl">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              
              <div className="text-center sm:text-left">
                <h2 className="text-xl font-bold">
                  {user?.firstName || ''} {user?.lastName || ''}
                </h2>
                <p className="text-blue-100">{user?.email || 'No email provided'}</p>
                <p className="text-blue-100 text-sm mt-1">
                  Patient ID: {user?._id?.substring(0, 8) || patientProfile?.patientId?.substring(0, 8) || 'N/A'}
                </p>
                <Link href="/patient/profile" passHref>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="bg-transparent border-white text-white hover:bg-white/20 mt-2"
                  >
                    <Edit className="h-3.5 w-3.5 mr-1.5" />
                    Edit Profile
                  </Button>
                </Link>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-2 gap-4 mb-5">
              <div>
                <p className="text-sm text-gray-500">Age</p>
                <p className="font-medium">{calculateAge(patientProfile?.dateOfBirth)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Gender</p>
                <p className="font-medium capitalize">{patientProfile?.gender || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Blood Type</p>
                <p className="font-medium">{patientProfile?.bloodGroup || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Date of Birth</p>
                <p className="font-medium">{formatDate(patientProfile?.dateOfBirth)}</p>
              </div>
            </div>
            
            {patientProfile?.allergies && patientProfile.allergies.length > 0 && (
              <div className="mb-5">
                <p className="text-sm text-gray-500 mb-1">Allergies</p>
                <div className="flex flex-wrap gap-1">
                  {patientProfile.allergies.map((allergy, index) => (
                    <span 
                      key={index}
                      className="inline-block bg-red-50 text-red-700 text-xs px-2 py-1 rounded-full"
                    >
                      {allergy}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {patientProfile?.chronicConditions && patientProfile.chronicConditions.length > 0 && (
              <div>
                <p className="text-sm text-gray-500 mb-1">Chronic Conditions</p>
                <div className="flex flex-wrap gap-1">
                  {patientProfile.chronicConditions.map((condition, index) => (
                    <span 
                      key={index}
                      className="inline-block bg-amber-50 text-amber-700 text-xs px-2 py-1 rounded-full"
                    >
                      {condition}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {(!patientProfile?.allergies || patientProfile.allergies.length === 0) && 
             (!patientProfile?.chronicConditions || patientProfile.chronicConditions.length === 0) && (
              <div className="text-gray-500 text-sm italic">
                No medical conditions or allergies listed.
              </div>
            )}
          </div>
        </CardContent>
      </motion.div>
    </Card>
  );
}
