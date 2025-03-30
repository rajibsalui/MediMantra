"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';

export default function ProfileSummary() {
  // const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const {user} = useAuth(); // Assuming you have a useAuth hook to get the user data

  useEffect(() => {
    // // Fetch user data from your API or auth service
    // const fetchUserData = async () => {
    //   try {
    //     // Replace this with your actual API call
    //     const response = await fetch('/api/user/profile');
    //     const userData = await response.json();
    //     setUser(userData);
    //   } catch (error) {
    //     console.error('Error fetching user data:', error);
    //   } finally {
    //     setLoading(false);
    //   }
    // };
    if(!user) {
      setLoading(true);
    }
    else {
      setLoading(false);
    }

    // fetchUserData();
  }, []);

  if (loading) {
    return (
      <Card className="bg-white shadow-md">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center text-center">
            <p>Loading profile data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white shadow-md">
      <CardContent className="pt-6">
        <div className="flex flex-col items-center text-center">
          <Avatar className="w-24 h-24 mb-4">
            <img src={user?.profileImage || "/avatar-placeholder.jpg"} alt={user?.name || "Patient"} />
          </Avatar>
          <h3 className="text-xl font-bold text-gray-800">{user?.firstName || "No Name"} {user?.lastName || "No Name"}</h3>
          <p className="text-gray-500">ID: {user?.id || "Unknown"}</p>
          <div className="divider my-3 border-t border-gray-200"></div>
          <div className="w-full">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="text-left text-gray-500">Age</div>
              <div className="text-right font-medium text-gray-800">{user?.age || "N/A"} years</div>
              
              <div className="text-left text-gray-500">Blood Type</div>
              <div className="text-right font-medium text-gray-800">{user?.bloodType || "Unknown"}</div>
              
              <div className="text-left text-gray-500">Height</div>
              <div className="text-right font-medium text-gray-800">{user?.height || "N/A"} cm</div>
              
              <div className="text-left text-gray-500">Weight</div>
              <div className="text-right font-medium text-gray-800">{user?.weight || "N/A"} kg</div>
            </div>
            
            <button className="btn btn-primary btn-sm w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white border-none">View Complete Profile</button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
