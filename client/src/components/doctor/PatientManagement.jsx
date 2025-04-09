"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import {
  Search,
  Filter,
  Users,
  ChevronRight,
  Clock,
  Calendar,
  FileText,
  Pill,
} from "lucide-react";

export default function PatientManagement({ patients = [], loading = false }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredPatients, setFilteredPatients] = useState(patients);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    if (patients.length > 0) {
      filterPatients(searchTerm, activeTab);
    }
  }, [patients, searchTerm, activeTab]);

  const filterPatients = (search, tab) => {
    let filtered = [...patients];

    // Apply search filter
    if (search) {
      filtered = filtered.filter(
        (patient) =>
          patient.firstName?.toLowerCase().includes(search.toLowerCase()) ||
          patient.lastName?.toLowerCase().includes(search.toLowerCase()) ||
          `${patient.firstName} ${patient.lastName}`
            .toLowerCase()
            .includes(search.toLowerCase())
      );
    }

    // Apply tab filter
    if (tab === "recent") {
      // Sort by most recent appointment
      filtered = filtered.sort(
        (a, b) =>
          new Date(b.lastAppointment || 0) - new Date(a.lastAppointment || 0)
      );
      // Take only the first 10
      filtered = filtered.slice(0, 10);
    } else if (tab === "upcoming") {
      // Filter patients with upcoming appointments
      filtered = filtered.filter(
        (patient) => patient.upcomingAppointments && patient.upcomingAppointments > 0
      );
    }

    setFilteredPatients(filtered);
  };

  const renderPatientList = () => {
    if (loading) {
      return Array(5)
        .fill(0)
        .map((_, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="ml-4">
                <Skeleton className="h-4 w-32 mb-2" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
            <Skeleton className="h-8 w-20" />
          </div>
        ));
    }

    if (filteredPatients.length === 0) {
      return (
        <div className="text-center py-8">
          <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
            <Users className="h-8 w-8 text-gray-400 dark:text-gray-500" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">
            No patients found
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {searchTerm
              ? "Try adjusting your search terms"
              : "You don't have any patients yet"}
          </p>
        </div>
      );
    }

    console.log(filteredPatients);

    return filteredPatients.map((patient) => (
      <div
        key={patient._id}
        className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
      >
        <div className="flex items-center">
          <Avatar className="h-10 w-10">
            <AvatarImage src={patient.patient.user.profilePicture || "/placeholder-patient.png"} />
            <AvatarFallback>
              {patient.patient.user.firstName?.[0]}
              {patient.patient.user.lastName?.[0]}
            </AvatarFallback>
          </Avatar>
          <div className="ml-4">
            <h3 className="font-medium text-gray-900 dark:text-gray-100">
              {patient.patient.user.firstName} {patient.patient.user.lastName}
            </h3>
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
              <span>{patient.gender || "Not specified"}</span>
              <span className="mx-2">•</span>
              <span>{patient.age || "--"} years</span>
              {patient.upcomingAppointments > 0 && (
                <>
                  <span className="mx-2">•</span>
                  <Badge variant="outline" className="text-xs">
                    Upcoming: {patient.upcomingAppointments}
                  </Badge>
                </>
              )}
            </div>
          </div>
        </div>
        <Link href={`/doctor/patients/${patient.patient._id}`}>
          <Button variant="ghost" size="sm" className="rounded-full">
            <ChevronRight className="h-5 w-5" />
          </Button>
        </Link>
      </div>
    ));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold flex items-center">
          <Users className="w-5 h-5 mr-2 text-blue-500" />
          Patient Management
        </h2>
        <Link href="/doctor/patients/new">
          <Button size="sm">Add New Patient</Button>
        </Link>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
          <Input
            placeholder="Search patients..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline" size="icon" className="h-10 w-10">
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      <Tabs
        defaultValue="all"
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList key="tabs-list" className="grid grid-cols-3 mb-4">
          <TabsTrigger value="all" className="flex items-center">
            <Users className="w-4 h-4 mr-2" />
            All Patients
          </TabsTrigger>
          <TabsTrigger value="recent" className="flex items-center">
            <Clock className="w-4 h-4 mr-2" />
            Recent
          </TabsTrigger>
          <TabsTrigger value="upcoming" className="flex items-center">
            <Calendar className="w-4 h-4 mr-2" />
            With Appointments
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-0">
          <Card className="overflow-hidden">{renderPatientList()}</Card>
        </TabsContent>

        <TabsContent value="recent" className="mt-0">
          <Card className="overflow-hidden">{renderPatientList()}</Card>
        </TabsContent>

        <TabsContent value="upcoming" className="mt-0">
          <Card className="overflow-hidden">{renderPatientList()}</Card>
        </TabsContent>
      </Tabs>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center mb-4">
            <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 mr-3">
              <Calendar className="h-5 w-5" />
            </div>
            <h3 className="font-medium">Appointment Stats</h3>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">Total Patients</span>
              <span className="font-medium">{patients.length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">With Appointments</span>
              <span className="font-medium">
                {
                  patients.filter(
                    (p) => p.upcomingAppointments && p.upcomingAppointments > 0
                  ).length
                }
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">New This Month</span>
              <span className="font-medium">
                {
                  patients.filter((p) => {
                    const oneMonthAgo = new Date();
                    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
                    return new Date(p.createdAt) > oneMonthAgo;
                  }).length
                }
              </span>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center mb-4">
            <div className="p-2 rounded-full bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 mr-3">
              <FileText className="h-5 w-5" />
            </div>
            <h3 className="font-medium">Medical Records</h3>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">Total Records</span>
              <span className="font-medium">
                {patients.reduce(
                  (sum, p) => sum + (p.medicalRecords?.length || 0),
                  0
                )}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">Pending Review</span>
              <span className="font-medium">
                {patients.reduce(
                  (sum, p) => sum + (p.pendingReviews || 0),
                  0
                )}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">Updated This Week</span>
              <span className="font-medium">
                {patients.reduce(
                  (sum, p) => sum + (p.recentUpdates || 0),
                  0
                )}
              </span>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center mb-4">
            <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 mr-3">
              <Pill className="h-5 w-5" />
            </div>
            <h3 className="font-medium">Prescriptions</h3>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">Active Prescriptions</span>
              <span className="font-medium">
                {patients.reduce(
                  (sum, p) => sum + (p.activePrescriptions || 0),
                  0
                )}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">Expiring Soon</span>
              <span className="font-medium">
                {patients.reduce(
                  (sum, p) => sum + (p.expiringPrescriptions || 0),
                  0
                )}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">Issued This Month</span>
              <span className="font-medium">
                {patients.reduce(
                  (sum, p) => sum + (p.recentPrescriptions || 0),
                  0
                )}
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
