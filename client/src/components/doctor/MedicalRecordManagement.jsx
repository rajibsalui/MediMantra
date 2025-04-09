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
  FileText,
  Search,
  Filter,
  ChevronRight,
  Clock,
  PlusCircle,
  Download,
  Calendar,
  Users,
  FileUp,
} from "lucide-react";

export default function MedicalRecordManagement({ medicalRecords = [], loading = false }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [filteredRecords, setFilteredRecords] = useState(medicalRecords);

  // Filter records based on search term and active tab
  const filterRecords = () => {
    let filtered = [...medicalRecords];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (record) =>
          record.patient?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          record.patient?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          record.documentType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          record.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply tab filter
    if (activeTab === "recent") {
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      filtered = filtered.filter(
        (record) => new Date(record.uploadDate) >= oneMonthAgo
      );
    } else if (activeTab === "lab") {
      filtered = filtered.filter(
        (record) => record.documentType === "Lab Result"
      );
    }

    setFilteredRecords(filtered);
  };

  // Handle tab change
  const handleTabChange = (value) => {
    setActiveTab(value);
    filterRecords();
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    filterRecords();
  };

  const renderRecordList = () => {
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

    if (filteredRecords.length === 0) {
      return (
        <div className="text-center py-8">
          <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
            <FileText className="h-8 w-8 text-gray-400 dark:text-gray-500" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">
            No medical records found
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            {searchTerm
              ? "Try adjusting your search terms"
              : "No medical records available"}
          </p>
          <Link href="/doctor/medical-records/upload">
            <Button size="sm">
              <PlusCircle className="w-4 h-4 mr-2" />
              Upload Medical Record
            </Button>
          </Link>
        </div>
      );
    }

    return filteredRecords.map((record) => (
      <div
        key={record._id}
        className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
      >
        <div className="flex items-center">
          <Avatar className="h-10 w-10">
            <AvatarImage
              src={
                record.patient?.profilePicture || "/placeholder-patient.png"
              }
            />
            <AvatarFallback>
              {record.patient?.firstName?.[0]}
              {record.patient?.lastName?.[0]}
            </AvatarFallback>
          </Avatar>
          <div className="ml-4">
            <h3 className="font-medium text-gray-900 dark:text-gray-100">
              {record.patient?.firstName} {record.patient?.lastName}
            </h3>
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
              <FileText className="w-3 h-3 mr-1" />
              <span>{record.documentType}</span>
              <span className="mx-2">•</span>
              <span>
                {new Date(record.documentDate).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Badge
            className="bg-blue-100 text-blue-800 border border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800"
          >
            {record.documentType}
          </Badge>
          <Button variant="ghost" size="sm" className="rounded-full">
            <Download className="h-4 w-4" />
          </Button>
          <Link href={`/doctor/medical-records/${record._id}`}>
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
          <FileText className="w-5 h-5 mr-2 text-blue-500" />
          Medical Record Management
        </h2>
        <Link href="/doctor/medical-records/upload">
          <Button size="sm">
            <FileUp className="w-4 h-4 mr-2" />
            Upload Record
          </Button>
        </Link>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
          <Input
            placeholder="Search medical records..."
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
        defaultValue="all"
        value={activeTab}
        onValueChange={handleTabChange}
        className="w-full"
      >
        <TabsList key="tabs-list" className="grid grid-cols-3 mb-4">
          <TabsTrigger value="all" className="flex items-center">
            <FileText className="w-4 h-4 mr-2" />
            All Records
          </TabsTrigger>
          <TabsTrigger value="recent" className="flex items-center">
            <Clock className="w-4 h-4 mr-2" />
            Recent
          </TabsTrigger>
          <TabsTrigger value="lab" className="flex items-center">
            <FileText className="w-4 h-4 mr-2" />
            Lab Results
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-0">
          <Card className="overflow-hidden">{renderRecordList()}</Card>
        </TabsContent>

        <TabsContent value="recent" className="mt-0">
          <Card className="overflow-hidden">{renderRecordList()}</Card>
        </TabsContent>

        <TabsContent value="lab" className="mt-0">
          <Card className="overflow-hidden">{renderRecordList()}</Card>
        </TabsContent>
      </Tabs>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center mb-4">
            <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 mr-3">
              <FileText className="h-5 w-5" />
            </div>
            <h3 className="font-medium">Record Stats</h3>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">Total Records</span>
              <span className="font-medium">{medicalRecords.length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">Lab Results</span>
              <span className="font-medium">
                {
                  medicalRecords.filter(
                    (r) => r.documentType === "Lab Result"
                  ).length
                }
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">Imaging</span>
              <span className="font-medium">
                {
                  medicalRecords.filter(
                    (r) => r.documentType === "Imaging"
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
              <span className="text-gray-500 dark:text-gray-400">Uploaded This Week</span>
              <span className="font-medium">
                {
                  medicalRecords.filter((r) => {
                    const oneWeekAgo = new Date();
                    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
                    return new Date(r.uploadDate) > oneWeekAgo;
                  }).length
                }
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">Viewed</span>
              <span className="font-medium">
                {
                  medicalRecords.filter((r) => r.viewCount > 0).length
                }
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">Downloaded</span>
              <span className="font-medium">
                {
                  medicalRecords.filter((r) => r.downloadCount > 0).length
                }
              </span>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center mb-4">
            <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 mr-3">
              <Users className="h-5 w-5" />
            </div>
            <h3 className="font-medium">Patient Distribution</h3>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">Patients with Records</span>
              <span className="font-medium">
                {
                  new Set(
                    medicalRecords.map((r) => r.patient?._id)
                  ).size
                }
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">Avg. Records per Patient</span>
              <span className="font-medium">
                {
                  medicalRecords.length > 0
                    ? (
                        medicalRecords.length /
                        new Set(medicalRecords.map((r) => r.patient?._id)).size
                      ).toFixed(1)
                    : "0"
                }
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">Most Recent Patient</span>
              <span className="font-medium">
                {
                  medicalRecords.length > 0
                    ? (() => {
                        const sorted = [...medicalRecords].sort(
                          (a, b) =>
                            new Date(b.uploadDate) - new Date(a.uploadDate)
                        );
                        return sorted[0]?.patient?.firstName
                          ? `${sorted[0].patient.firstName.charAt(0)}. ${
                              sorted[0].patient.lastName
                            }`
                          : "N/A";
                      })()
                    : "N/A"
                }
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
