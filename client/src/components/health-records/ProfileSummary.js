"use client";

import { Card, CardContent } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';

export default function ProfileSummary() {
  return (
    <Card className="bg-white shadow-md">
      <CardContent className="pt-6">
        <div className="flex flex-col items-center text-center">
          <Avatar className="w-24 h-24 mb-4">
            <img src="/avatar-placeholder.jpg" alt="Patient" />
          </Avatar>
          <h3 className="text-xl font-bold text-gray-800">John Smith</h3>
          <p className="text-gray-500">ID: 12345678</p>
          <div className="divider my-3 border-t border-gray-200"></div>
          <div className="w-full">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="text-left text-gray-500">Age</div>
              <div className="text-right font-medium text-gray-800">34 years</div>
              
              <div className="text-left text-gray-500">Blood Type</div>
              <div className="text-right font-medium text-gray-800">O+</div>
              
              <div className="text-left text-gray-500">Height</div>
              <div className="text-right font-medium text-gray-800">175 cm</div>
              
              <div className="text-left text-gray-500">Weight</div>
              <div className="text-right font-medium text-gray-800">70 kg</div>
            </div>
            
            <button className="btn btn-primary btn-sm w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white border-none">View Complete Profile</button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
