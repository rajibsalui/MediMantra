"use client";

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import RecordCard from './RecordCard';

export default function HealthRecordTabs({ activeFilter }) {
  const [activeTab, setActiveTab] = useState("medications");
  
  // Sample data - would come from API in real app
  const medications = [
    { id: 1, name: "Lisinopril", dosage: "10mg", frequency: "Once daily", startDate: "2023-01-15", doctor: "Dr. Johnson" },
    { id: 2, name: "Metformin", dosage: "500mg", frequency: "Twice daily", startDate: "2023-02-20", doctor: "Dr. Smith" },
    { id: 3, name: "Atorvastatin", dosage: "20mg", frequency: "Once daily", startDate: "2023-03-10", doctor: "Dr. Johnson" },
  ];
  
  const allergies = [
    { id: 1, name: "Penicillin", severity: "Severe", reaction: "Hives, difficulty breathing", diagnosedDate: "2020-05-12" },
    { id: 2, name: "Peanuts", severity: "Moderate", reaction: "Skin rash", diagnosedDate: "2018-07-03" },
  ];
  
  const conditions = [
    { id: 1, name: "Hypertension", diagnosedDate: "2022-10-05", status: "Active", treatedBy: "Dr. Williams" },
    { id: 2, name: "Type 2 Diabetes", diagnosedDate: "2022-11-15", status: "Active", treatedBy: "Dr. Smith" },
  ];
  
  const labTests = [
    { id: 1, name: "Complete Blood Count", date: "2023-05-10", result: "Normal", orderedBy: "Dr. Johnson" },
    { id: 2, name: "Lipid Panel", date: "2023-05-10", result: "High LDL", orderedBy: "Dr. Johnson" },
    { id: 3, name: "HbA1c", date: "2023-04-22", result: "6.7%", orderedBy: "Dr. Smith" },
  ];
  
  // Filter records based on activeFilter if needed
  // In a real app you would apply actual filtering logic

  return (
    <Tabs defaultValue="medications" value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid grid-cols-4 mb-6 bg-gray-100">
        <TabsTrigger value="medications" className="data-[state=active]:bg-white data-[state=active]:text-blue-600">Medications</TabsTrigger>
        <TabsTrigger value="allergies" className="data-[state=active]:bg-white data-[state=active]:text-blue-600">Allergies</TabsTrigger>
        <TabsTrigger value="conditions" className="data-[state=active]:bg-white data-[state=active]:text-blue-600">Conditions</TabsTrigger>
        <TabsTrigger value="lab-results" className="data-[state=active]:bg-white data-[state=active]:text-blue-600">Lab Results</TabsTrigger>
      </TabsList>
      
      <TabsContent value="medications" className="space-y-3">
        {medications.map(med => (
          <RecordCard 
            key={med.id}
            title={med.name}
            type="medication"
            details={[
              { label: "Dosage", value: med.dosage },
              { label: "Frequency", value: med.frequency },
              { label: "Started", value: new Date(med.startDate).toLocaleDateString() },
              { label: "Prescribed by", value: med.doctor }
            ]}
          />
        ))}
      </TabsContent>
      
      <TabsContent value="allergies" className="space-y-3">
        {allergies.map(allergy => (
          <RecordCard 
            key={allergy.id}
            title={allergy.name}
            type="allergy"
            details={[
              { label: "Severity", value: allergy.severity },
              { label: "Reaction", value: allergy.reaction },
              { label: "Diagnosed", value: new Date(allergy.diagnosedDate).toLocaleDateString() }
            ]}
          />
        ))}
      </TabsContent>
      
      <TabsContent value="conditions" className="space-y-3">
        {conditions.map(condition => (
          <RecordCard 
            key={condition.id}
            title={condition.name}
            type="condition"
            details={[
              { label: "Status", value: condition.status },
              { label: "Diagnosed", value: new Date(condition.diagnosedDate).toLocaleDateString() },
              { label: "Treated by", value: condition.treatedBy }
            ]}
          />
        ))}
      </TabsContent>
      
      <TabsContent value="lab-results" className="space-y-3">
        {labTests.map(test => (
          <RecordCard 
            key={test.id}
            title={test.name}
            type="lab-test"
            details={[
              { label: "Result", value: test.result },
              { label: "Date", value: new Date(test.date).toLocaleDateString() },
              { label: "Ordered by", value: test.orderedBy }
            ]}
          />
        ))}
      </TabsContent>
    </Tabs>
  );
}
