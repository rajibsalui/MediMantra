"use client";

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import RecordCard from './RecordCard';
import MedicalRecordCard from './MedicalRecordCard';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, AlertCircle, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

// Empty state component for when no records are available
function EmptyState({ title, description, buttonText, onClick }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-10 px-6 bg-gray-50 dark:bg-gray-800/30 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
      <div className="h-12 w-12 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-4">
        <Plus className="h-6 w-6 text-gray-500 dark:text-gray-400" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">{title}</h3>
      <p className="text-gray-500 dark:text-gray-400 mt-1 mb-4">{description}</p>
      <Button 
        variant="outline" 
        className="bg-white dark:bg-gray-800"
        onClick={onClick}
      >
        {buttonText}
      </Button>
    </div>
  );
}

export default function HealthRecordTabs({ activeFilter, records, isLoading, error, onRetry }) {
  const [activeTab, setActiveTab] = useState("medications");
  
  // Format date to readable string
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Filter records based on activeFilter if needed
  const getFilteredRecords = (recordsList, recordType) => {
    if (!recordsList) return [];
    
    if (activeFilter && activeFilter !== 'all') {
      if (recordType === 'medications') {
        return recordsList.filter(med => med.category === activeFilter || med.condition?.toLowerCase().includes(activeFilter));
      } else if (recordType === 'tests') {
        return recordsList.filter(test => test.type === activeFilter || test.category?.toLowerCase().includes(activeFilter));
      } else if (recordType === 'conditions') {
        return recordsList.filter(condition => condition.category === activeFilter || condition.name?.toLowerCase().includes(activeFilter));
      } else {
        return recordsList; // For allergies we don't filter
      }
    }
    
    return recordsList;
  };
  
  // Sample data for demonstration - would come from API in real app
  const medications = records?.medications || [
    { id: 1, name: "Lisinopril", dosage: "10mg", frequency: "Once daily", startDate: "2023-01-15", doctor: "Dr. Johnson" },
    { id: 2, name: "Metformin", dosage: "500mg", frequency: "Twice daily", startDate: "2023-02-20", doctor: "Dr. Smith" },
    { id: 3, name: "Atorvastatin", dosage: "20mg", frequency: "Once daily", startDate: "2023-03-10", doctor: "Dr. Johnson" },
  ];
  
  const allergies = records?.allergies || [
    { id: 1, name: "Penicillin", severity: "Severe", reaction: "Hives, difficulty breathing", diagnosedDate: "2020-05-12" },
    { id: 2, name: "Peanuts", severity: "Moderate", reaction: "Skin rash", diagnosedDate: "2018-07-03" },
  ];
  
  const conditions = records?.conditions || [
    { id: 1, name: "Hypertension", diagnosedDate: "2022-10-05", status: "Active", treatedBy: "Dr. Williams" },
    { id: 2, name: "Type 2 Diabetes", diagnosedDate: "2022-11-15", status: "Active", treatedBy: "Dr. Smith" },
  ];
  
  const labTests = records?.labTests || [
    { id: 1, name: "Complete Blood Count", date: "2023-05-10", result: "Normal", orderedBy: "Dr. Johnson" },
    { id: 2, name: "Lipid Panel", date: "2023-05-10", result: "High LDL", orderedBy: "Dr. Johnson" },
    { id: 3, name: "HbA1c", date: "2023-04-22", result: "6.7%", orderedBy: "Dr. Smith" },
  ];
  
  const filteredMedications = getFilteredRecords(medications, 'medications');
  const filteredAllergies = getFilteredRecords(allergies, 'allergies');
  const filteredConditions = getFilteredRecords(conditions, 'conditions');
  const filteredLabTests = getFilteredRecords(labTests, 'tests');
  
  if (isLoading) {
    return (
      <div className="space-y-4">
        <TabsList key="tabs-list" className="grid grid-cols-4 mb-6 bg-gray-100">
          <TabsTrigger value="medications" disabled>Medications</TabsTrigger>
          <TabsTrigger value="allergies" disabled>Allergies</TabsTrigger>
          <TabsTrigger value="conditions" disabled>Conditions</TabsTrigger>
          <TabsTrigger value="lab-results" disabled>Lab Results</TabsTrigger>
        </TabsList>
        <div className="space-y-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <Card className="p-8 text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">Failed to load health records</h3>
        <p className="text-gray-500 mb-4">{error.message || 'An error occurred while loading your health records'}</p>
        <Button onClick={onRetry} variant="outline" className="mx-auto flex items-center gap-2">
          <RefreshCw className="h-4 w-4" />
          Try Again
        </Button>
      </Card>
    );
  }

  return (
    <Tabs defaultValue="medications" value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList key="tabs-list" className="grid grid-cols-4 mb-6 bg-gray-100">
        <TabsTrigger value="medications" className="data-[state=active]:bg-white data-[state=active]:text-blue-600">Medications</TabsTrigger>
        <TabsTrigger value="allergies" className="data-[state=active]:bg-white data-[state=active]:text-blue-600">Allergies</TabsTrigger>
        <TabsTrigger value="conditions" className="data-[state=active]:bg-white data-[state=active]:text-blue-600">Conditions</TabsTrigger>
        <TabsTrigger value="lab-results" className="data-[state=active]:bg-white data-[state=active]:text-blue-600">Lab Results</TabsTrigger>
      </TabsList>
      
      <TabsContent value="medications" className="space-y-3">
        {filteredMedications.length > 0 ? (
          filteredMedications.map(med => (
            <motion.div
              key={med.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <MedicalRecordCard
                record={{
                  title: med.name,
                  description: `${med.dosage} - ${med.frequency}`,
                  date: med.startDate,
                  details: {
                    'Dosage': med.dosage,
                    'Frequency': med.frequency,
                    'Started': formatDate(med.startDate),
                    'Prescribed by': med.doctor
                  }
                }}
                type="medication"
              />
            </motion.div>
          ))
        ) : (
          <EmptyState
            title="No medications found"
            description="Your prescribed medications will appear here"
            buttonText="Add Medication" 
            onClick={() => {}}
          />
        )}
      </TabsContent>
      
      <TabsContent value="allergies" className="space-y-3">
        {filteredAllergies.length > 0 ? (
          filteredAllergies.map(allergy => (
            <motion.div
              key={allergy.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <MedicalRecordCard
                record={{
                  title: allergy.name,
                  description: allergy.reaction,
                  date: allergy.diagnosedDate,
                  details: {
                    'Severity': allergy.severity,
                    'Reaction': allergy.reaction,
                    'Diagnosed': formatDate(allergy.diagnosedDate)
                  }
                }}
                type="allergy"
              />
            </motion.div>
          ))
        ) : (
          <EmptyState
            title="No allergies recorded"
            description="Your known allergies will be listed here"
            buttonText="Add Allergy"
            onClick={() => {}}
          />
        )}
      </TabsContent>
      
      <TabsContent value="conditions" className="space-y-3">
        {filteredConditions.length > 0 ? (
          filteredConditions.map(condition => (
            <motion.div
              key={condition.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <MedicalRecordCard
                record={{
                  title: condition.name,
                  description: `Status: ${condition.status}`,
                  date: condition.diagnosedDate,
                  details: {
                    'Status': condition.status,
                    'Diagnosed': formatDate(condition.diagnosedDate),
                    'Treated by': condition.treatedBy
                  }
                }}
                type="condition"
              />
            </motion.div>
          ))
        ) : (
          <EmptyState
            title="No medical conditions found"
            description="Your diagnosed medical conditions will appear here"
            buttonText="Add Condition"
            onClick={() => {}}
          />
        )}
      </TabsContent>
      
      <TabsContent value="lab-results" className="space-y-3">
        {filteredLabTests.length > 0 ? (
          filteredLabTests.map(test => (
            <motion.div
              key={test.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <MedicalRecordCard
                record={{
                  title: test.name,
                  description: `Result: ${test.result}`,
                  date: test.date,
                  details: {
                    'Result': test.result,
                    'Date': formatDate(test.date),
                    'Ordered by': test.orderedBy
                  }
                }}
                type="test"
              />
            </motion.div>
          ))
        ) : (
          <EmptyState
            title="No lab results found"
            description="Your laboratory test results will appear here"
            buttonText="Add Lab Result"
            onClick={() => {}}
          />
        )}
      </TabsContent>
    </Tabs>
  );
}
