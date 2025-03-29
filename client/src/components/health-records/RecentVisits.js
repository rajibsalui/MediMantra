"use client";

import RecordCard from './RecordCard';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function RecentVisits() {
  // Sample data - would come from API in real app
  const visits = [
    {
      id: 1, 
      doctor: "Dr. Johnson (Cardiologist)", 
      date: "2023-06-15", 
      reason: "Annual heart checkup", 
      notes: "Blood pressure slightly elevated. Advised to reduce sodium intake."
    },
    {
      id: 2, 
      doctor: "Dr. Smith (General Physician)", 
      date: "2023-05-03", 
      reason: "Flu symptoms", 
      notes: "Diagnosed with seasonal flu. Prescribed rest and fluids."
    },
    {
      id: 3, 
      doctor: "Dr. Williams (Endocrinologist)", 
      date: "2023-04-22", 
      reason: "Diabetes follow-up", 
      notes: "HbA1c levels improved. Continue with current medication."
    },
  ];

  return (
    <Card className="bg-white shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl text-gray-800">Recent Medical Visits</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {visits.map((visit) => (
            <RecordCard 
              key={visit.id}
              title={visit.doctor}
              type="visit"
              details={[
                { label: "Date", value: new Date(visit.date).toLocaleDateString() },
                { label: "Reason", value: visit.reason },
                { label: "Notes", value: visit.notes }
              ]}
            />
          ))}
          
          <button className="btn btn-outline w-full mt-2 border-blue-600 text-blue-600 hover:bg-blue-50 hover:text-blue-700">View All Visits</button>
        </div>
      </CardContent>
    </Card>
  );
}
