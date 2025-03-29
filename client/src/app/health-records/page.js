"use client";

import { useState } from 'react';
import ProfileSummary from '@/components/health-records/ProfileSummary';
import HealthRecordTabs from '@/components/health-records/HealthRecordTabs';
import RecentVisits from '@/components/health-records/RecentVisits';
import UpcomingAppointments from '@/components/health-records/UpcomingAppointments';
import MedicalMetricsChart from '@/components/health-records/MedicalMetricsChart';
import HealthRecordFilters from '@/components/health-records/HealthRecordFilters';
import { Card, CardContent } from '@/components/ui/card';
// import { TracingBeam } from '@/components/ui/tracing-beam';

export default function HealthRecords() {
  const [activeFilter, setActiveFilter] = useState('all');
  
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
        <h1 className="text-3xl font-bold text-blue-600 mb-6">Health Records</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column - Profile summary and upcoming */}
          <div className="lg:col-span-1 space-y-6">
            <ProfileSummary />
            <UpcomingAppointments />
          </div>
          
          {/* Right columns - Charts and records */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-white shadow-md">
              <CardContent className="pt-6">
                <MedicalMetricsChart />
              </CardContent>
            </Card>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                <h2 className="text-2xl font-semibold text-gray-800">Medical Records</h2>
                <HealthRecordFilters 
                  activeFilter={activeFilter} 
                  setActiveFilter={setActiveFilter}
                />
              </div>
              
              <HealthRecordTabs activeFilter={activeFilter} />
            </div>
            
            <RecentVisits />
          </div>
        </div>
    </div>
  );
}
