"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import {
  Pill,
  Search,
  Filter,
  ChevronRight,
  Clock,
  FileText,
  PlusCircle,
  Calendar,
  Download,
} from "lucide-react";

export default function PrescriptionManagement({ prescriptions = [], loading = false }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("active");
  const [filteredPrescriptions, setFilteredPrescriptions] = useState(prescriptions);

  // Filter prescriptions based on search term and active tab
  const filterPrescriptions = () => {
    let filtered = [...prescriptions];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (prescription) =>
          prescription.patient?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          prescription.patient?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          prescription.medications.some((med) =>
            med.name.toLowerCase().includes(searchTerm.toLowerCase())
          )
      );
    }

    // Apply tab filter
    if (activeTab === "active") {
      filtered = filtered.filter(
        (prescription) => new Date(prescription.endDate) >= new Date()
      );
    } else if (activeTab === "expired") {
      filtered = filtered.filter(
        (prescription) => new Date(prescription.endDate) < new Date()
      );
    }

    setFilteredPrescriptions(filtered);
  };

  // Handle tab change
  const handleTabChange = (value) => {
    setActiveTab(value);
    filterPrescriptions();
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    filterPrescriptions();
  };

  const renderPrescriptionList = () => {
    if (loading) {
      return Array(3)
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

    if (filteredPrescriptions.length === 0) {
      return (
        <div className="text-center py-8">
          <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
            <Pill className="h-8 w-8 text-gray-400 dark:text-gray-500" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">
            No prescriptions found
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            {searchTerm
              ? "Try adjusting your search terms"
              : `No ${activeTab} prescriptions available`}
          </p>
          <Link href="/doctor/prescriptions/new">
            <Button size="sm">
              <PlusCircle className="w-4 h-4 mr-2" />
              New Prescription
            </Button>
          </Link>
        </div>
      );
    }

    return filteredPrescriptions.map((prescription) => (
      <div
        key={prescription._id}
        className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
      >
        <div className="flex items-center">
          <Avatar className="h-10 w-10">
            <AvatarImage
              src={
                prescription.patient?.profilePicture || "/placeholder-patient.png"
              }
            />
            <AvatarFallback>
              {prescription.patient?.firstName?.[0]}
              {prescription.patient?.lastName?.[0]}
            </AvatarFallback>
          </Avatar>
          <div className="ml-4">
            <h3 className="font-medium text-gray-900 dark:text-gray-100">
              {prescription.patient?.firstName} {prescription.patient?.lastName}
            </h3>
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
              <Pill className="w-3 h-3 mr-1" />
              <span>
                {prescription.medications
                  .map((med) => med.name)
                  .join(", ")}
              </span>
              <span className="mx-2">•</span>
              <span>
                {new Date(prescription.startDate).toLocaleDateString()} -{" "}
                {new Date(prescription.endDate).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Badge
            className={
              activeTab === "active"
                ? "bg-green-100 text-green-800 border border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800"
                : "bg-gray-100 text-gray-800 border border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700"
            }
          >
            {activeTab === "active" ? "Active" : "Expired"}
          </Badge>
          <Button variant="ghost" size="sm" className="rounded-full">
            <Download className="h-4 w-4" />
          </Button>
          <Link href={`/doctor/prescriptions/${prescription._id}`}>
            <Button variant="ghost" size="sm" className="rounded-full">
              <ChevronRight className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    ));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold flex items-center">
          <Pill className="w-5 h-5 mr-2 text-blue-500" />
          Prescription Management
        </h2>
        <Link href="/doctor/prescriptions/new">
          <Button size="sm">
            <PlusCircle className="w-4 h-4 mr-2" />
            New Prescription
          </Button>
        </Link>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
          <Input
            placeholder="Search prescriptions..."
            className="pl-10"
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
        <Button variant="outline" size="icon" className="h-10 w-10">
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      <Tabs
        defaultValue="active"
        value={activeTab}
        onValueChange={handleTabChange}
        className="w-full"
      >
        <TabsList key="tabs-list" className="grid grid-cols-3 mb-4">
          <TabsTrigger value="active" className="flex items-center">
            <Pill className="w-4 h-4 mr-2" />
            Active
          </TabsTrigger>
          <TabsTrigger value="expired" className="flex items-center">
            <Clock className="w-4 h-4 mr-2" />
            Expired
          </TabsTrigger>
          <TabsTrigger value="all" className="flex items-center">
            <FileText className="w-4 h-4 mr-2" />
            All
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-0">
          <Card className="overflow-hidden">{renderPrescriptionList()}</Card>
        </TabsContent>

        <TabsContent value="expired" className="mt-0">
          <Card className="overflow-hidden">{renderPrescriptionList()}</Card>
        </TabsContent>

        <TabsContent value="all" className="mt-0">
          <Card className="overflow-hidden">{renderPrescriptionList()}</Card>
        </TabsContent>
      </Tabs>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center mb-4">
            <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 mr-3">
              <Pill className="h-5 w-5" />
            </div>
            <h3 className="font-medium">Prescription Stats</h3>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">Total Prescriptions</span>
              <span className="font-medium">{prescriptions.length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">Active</span>
              <span className="font-medium">
                {
                  prescriptions.filter(
                    (p) => new Date(p.endDate) >= new Date()
                  ).length
                }
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">Expired</span>
              <span className="font-medium">
                {
                  prescriptions.filter(
                    (p) => new Date(p.endDate) < new Date()
                  ).length
                }
              </span>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center mb-4">
            <div className="p-2 rounded-full bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 mr-3">
              <Calendar className="h-5 w-5" />
            </div>
            <h3 className="font-medium">Recent Activity</h3>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">Created This Week</span>
              <span className="font-medium">
                {
                  prescriptions.filter((p) => {
                    const oneWeekAgo = new Date();
                    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
                    return new Date(p.createdAt) > oneWeekAgo;
                  }).length
                }
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">Expiring This Month</span>
              <span className="font-medium">
                {
                  prescriptions.filter((p) => {
                    const now = new Date();
                    const endOfMonth = new Date(
                      now.getFullYear(),
                      now.getMonth() + 1,
                      0
                    );
                    const endDate = new Date(p.endDate);
                    return endDate >= now && endDate <= endOfMonth;
                  }).length
                }
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">Downloaded</span>
              <span className="font-medium">
                {
                  prescriptions.filter((p) => p.downloadCount > 0).length
                }
              </span>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center mb-4">
            <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 mr-3">
              <FileText className="h-5 w-5" />
            </div>
            <h3 className="font-medium">Top Medications</h3>
          </div>
          <div className="space-y-2">
            {/* This would be dynamically generated from actual data */}
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">Amoxicillin</span>
              <span className="font-medium">12</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">Lisinopril</span>
              <span className="font-medium">8</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">Metformin</span>
              <span className="font-medium">6</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
