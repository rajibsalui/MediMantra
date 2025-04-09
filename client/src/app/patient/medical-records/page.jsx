"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { usePatient } from "@/contexts/PatientContext";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "react-hot-toast";
import { 
  FileText, 
  Upload, 
  Download, 
  Trash2, 
  AlertCircle, 
  RefreshCw, 
  Search,
  Calendar,
  Clock,
  Tag,
  User,
  ExternalLink,
  Filter,
  Plus
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { API_URL, SOCKET_URL } from '@/config/environment';

// This ensures the page is only rendered on the client side
export const dynamic = 'force-dynamic';
export const runtime = 'edge';


export default function PatientMedicalRecords() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { fetchMedicalRecords, loading } = usePatient();
  const fileInputRef = useRef(null);
  
  const [medicalRecords, setMedicalRecords] = useState(null);
  const [activeTab, setActiveTab] = useState("documents");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadDetails, setUploadDetails] = useState({
    title: "",
    category: "lab_report",
    description: ""
  });
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      loadMedicalRecords();
    } else if (!isAuthenticated && !loading) {
      router.push("/login");
    }
  }, [isAuthenticated, user?.id]);
  
  const loadMedicalRecords = async () => {
    try {
      setError(null);
      const records = await fetchMedicalRecords(user?.id);
      
      if (records) {
        setMedicalRecords(records);
      } else {
        setMedicalRecords(null);
      }
    } catch (err) {
      console.error("Error loading medical records:", err);
      setError("Failed to load medical records. Please try again.");
      toast.error("Failed to load medical records");
    }
  };
  
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadFile(file);
      
      // Auto-fill title with filename (without extension)
      const fileName = file.name.split('.').slice(0, -1).join('.');
      setUploadDetails(prev => ({
        ...prev,
        title: fileName
      }));
    }
  };
  
  const handleUpload = async (e) => {
    e.preventDefault();
    
    if (!uploadFile) {
      toast.error("Please select a file to upload");
      return;
    }
    
    if (!uploadDetails.title) {
      toast.error("Please provide a title for the document");
      return;
    }
    
    try {
      setUploading(true);
      
      // Create form data
      const formData = new FormData();
      formData.append("file", uploadFile);
      formData.append("title", uploadDetails.title);
      formData.append("category", uploadDetails.category);
      formData.append("description", uploadDetails.description);
      
      // TODO: Implement actual upload API call
      // await uploadMedicalDocument(formData);
      
      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success("Medical record uploaded successfully");
      setUploadDialogOpen(false);
      resetUploadForm();
      loadMedicalRecords();
    } catch (err) {
      console.error("Error uploading medical record:", err);
      toast.error("Failed to upload medical record");
    } finally {
      setUploading(false);
    }
  };
  
  const resetUploadForm = () => {
    setUploadFile(null);
    setUploadDetails({
      title: "",
      category: "lab_report",
      description: ""
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };
  
  // Filter and search records
  const getFilteredRecords = () => {
    if (!medicalRecords) return [];
    
    let records = [];
    
    // Get records based on active tab
    switch (activeTab) {
      case "documents":
        records = medicalRecords.documents || [];
        break;
      case "lab_results":
        records = medicalRecords.testResults || [];
        break;
      case "visits":
        records = medicalRecords.visits || [];
        break;
      case "conditions":
        records = [
          ...(medicalRecords.allergies || []).map(item => ({ type: 'allergy', name: item })),
          ...(medicalRecords.chronicConditions || []).map(item => ({ type: 'condition', name: item }))
        ];
        break;
      default:
        records = [];
    }
    
    // Apply category filter if not "all"
    if (filterCategory !== "all" && activeTab === "documents") {
      records = records.filter(record => record.category === filterCategory);
    }
    
    // Apply search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      records = records.filter(record => {
        // Different search logic based on record type
        if (activeTab === "documents") {
          return (
            (record.title && record.title.toLowerCase().includes(term)) ||
            (record.description && record.description.toLowerCase().includes(term)) ||
            (record.category && record.category.toLowerCase().includes(term))
          );
        } else if (activeTab === "lab_results") {
          return (
            (record.testName && record.testName.toLowerCase().includes(term)) ||
            (record.result && record.result.toLowerCase().includes(term))
          );
        } else if (activeTab === "visits") {
          return (
            (record.doctor && record.doctor.user && 
              `${record.doctor.user.firstName} ${record.doctor.user.lastName}`.toLowerCase().includes(term)) ||
            (record.reason && record.reason.toLowerCase().includes(term)) ||
            (record.notes && record.notes.toLowerCase().includes(term))
          );
        } else if (activeTab === "conditions") {
          return record.name.toLowerCase().includes(term);
        }
        return false;
      });
    }
    
    return records;
  };
  
  const filteredRecords = getFilteredRecords();
  
  // Render document records
  const renderDocuments = () => {
    if (loading) {
      return Array(3).fill(0).map((_, index) => (
        <Card key={index} className="mb-4">
          <CardHeader className="pb-2">
            <Skeleton className="h-6 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </CardContent>
        </Card>
      ));
    }
    
    if (error) {
      return (
        <div className="text-center py-8">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-slate-700 dark:text-slate-300 mb-4">{error}</p>
          <Button onClick={loadMedicalRecords} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      );
    }
    
    if (!filteredRecords || filteredRecords.length === 0) {
      return (
        <div className="text-center py-8">
          <FileText className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No medical records found</h3>
          <p className="text-slate-500 dark:text-slate-400 mb-4">
            {searchTerm 
              ? "No records match your search criteria. Try a different search term." 
              : "You don't have any medical records uploaded yet."}
          </p>
          {!searchTerm && (
            <Button onClick={() => setUploadDialogOpen(true)}>
              <Upload className="h-4 w-4 mr-2" />
              Upload Medical Record
            </Button>
          )}
        </div>
      );
    }
    
    return filteredRecords.map((document) => (
      <Card 
        key={document._id} 
        className="mb-4 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-all"
      >
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-lg font-semibold">
                {document.title}
              </CardTitle>
              <CardDescription>
                {document.category && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 mr-2">
                    {document.category.replace('_', ' ')}
                  </span>
                )}
                {document.uploadDate && (
                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    Uploaded on {new Date(document.uploadDate).toLocaleDateString()}
                  </span>
                )}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {document.description && (
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              {document.description}
            </p>
          )}
        </CardContent>
        <CardFooter className="border-t border-slate-200 dark:border-slate-700 pt-4">
          <div className="flex space-x-2 w-full">
            {document.fileUrl && (
              <Button variant="outline" size="sm" className="flex-1">
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            )}
            <Button variant="outline" size="sm" className="flex-1">
              <ExternalLink className="h-4 w-4 mr-2" />
              View Details
            </Button>
          </div>
        </CardFooter>
      </Card>
    ));
  };
  
  // Render lab results
  const renderLabResults = () => {
    if (!filteredRecords || filteredRecords.length === 0) {
      return (
        <div className="text-center py-8">
          <FileText className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No lab results found</h3>
          <p className="text-slate-500 dark:text-slate-400 mb-4">
            {searchTerm 
              ? "No lab results match your search criteria." 
              : "You don't have any lab test results in your records."}
          </p>
        </div>
      );
    }
    
    return filteredRecords.map((test, index) => (
      <Card 
        key={test._id || index} 
        className="mb-4 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-all"
      >
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-lg font-semibold">
                {test.testName}
              </CardTitle>
              <CardDescription>
                {test.testDate && (
                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    Test Date: {new Date(test.testDate).toLocaleDateString()}
                  </span>
                )}
              </CardDescription>
            </div>
            {test.status && (
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                test.status === 'normal' 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' 
                  : test.status === 'abnormal'
                  ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                  : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
              }`}>
                {test.status.charAt(0).toUpperCase() + test.status.slice(1)}
              </span>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Result</p>
                <p className="text-sm font-semibold">{test.result}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Reference Range</p>
                <p className="text-sm">{test.referenceRange || 'N/A'}</p>
              </div>
            </div>
            
            {test.notes && (
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Notes</p>
                <p className="text-sm">{test.notes}</p>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="border-t border-slate-200 dark:border-slate-700 pt-4">
          <div className="flex space-x-2 w-full">
            {test.reportUrl && (
              <Button variant="outline" size="sm" className="flex-1">
                <Download className="h-4 w-4 mr-2" />
                Download Report
              </Button>
            )}
            <Button variant="outline" size="sm" className="flex-1">
              <ExternalLink className="h-4 w-4 mr-2" />
              View Details
            </Button>
          </div>
        </CardFooter>
      </Card>
    ));
  };
  
  // Render medical visits
  const renderVisits = () => {
    if (!filteredRecords || filteredRecords.length === 0) {
      return (
        <div className="text-center py-8">
          <FileText className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No medical visits found</h3>
          <p className="text-slate-500 dark:text-slate-400 mb-4">
            {searchTerm 
              ? "No visits match your search criteria." 
              : "You don't have any recorded medical visits."}
          </p>
        </div>
      );
    }
    
    return filteredRecords.map((visit) => (
      <Card 
        key={visit._id} 
        className="mb-4 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-all"
      >
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-lg font-semibold">
                {visit.doctor?.user ? `Dr. ${visit.doctor.user.firstName} ${visit.doctor.user.lastName}` : 'Doctor Visit'}
              </CardTitle>
              <CardDescription>
                {visit.appointmentDate && (
                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    Visit Date: {new Date(visit.appointmentDate).toLocaleDateString()}
                  </span>
                )}
              </CardDescription>
            </div>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
              Completed
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {visit.reason && (
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Reason for Visit</p>
                <p className="text-sm">{visit.reason}</p>
              </div>
            )}
            
            {visit.diagnosis && (
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Diagnosis</p>
                <p className="text-sm">{visit.diagnosis}</p>
              </div>
            )}
            
            {visit.notes && (
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Doctor's Notes</p>
                <p className="text-sm">{visit.notes}</p>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="border-t border-slate-200 dark:border-slate-700 pt-4">
          <Button variant="outline" size="sm" className="w-full">
            <ExternalLink className="h-4 w-4 mr-2" />
            View Visit Details
          </Button>
        </CardFooter>
      </Card>
    ));
  };
  
  // Render medical conditions
  const renderConditions = () => {
    if (!filteredRecords || filteredRecords.length === 0) {
      return (
        <div className="text-center py-8">
          <FileText className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No conditions found</h3>
          <p className="text-slate-500 dark:text-slate-400 mb-4">
            {searchTerm 
              ? "No conditions match your search criteria." 
              : "You don't have any recorded medical conditions or allergies."}
          </p>
        </div>
      );
    }
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredRecords.map((condition, index) => (
          <Card 
            key={index} 
            className="border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-all"
          >
            <CardContent className="p-4">
              <div className="flex items-start">
                <div className={`p-2 rounded-full mr-3 ${
                  condition.type === 'allergy' 
                    ? 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400' 
                    : 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400'
                }`}>
                  <AlertCircle className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-medium">{condition.name}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {condition.type === 'allergy' ? 'Allergy' : 'Chronic Condition'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };
  
  return (
    <DashboardLayout>
      <div className="container mx-auto py-6 px-4 md:px-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Medical Records</h1>
            <p className="text-muted-foreground">
              View and manage your complete medical history
            </p>
          </div>
          <div className="flex space-x-2 mt-4 md:mt-0">
            <Button 
              variant="outline"
              onClick={() => setUploadDialogOpen(true)}
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload
            </Button>
            <Button 
              onClick={loadMedicalRecords}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
        
        {/* Search and filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
            <Input
              placeholder="Search medical records..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {activeTab === "documents" && (
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <div className="flex items-center">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by category" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="lab_report">Lab Reports</SelectItem>
                <SelectItem value="prescription">Prescriptions</SelectItem>
                <SelectItem value="imaging">Imaging</SelectItem>
                <SelectItem value="discharge_summary">Discharge Summary</SelectItem>
                <SelectItem value="vaccination">Vaccination</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>
        
        {/* Tabs */}
        <Tabs defaultValue="documents" value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList key="tabs-list" className="grid w-full grid-cols-2 md:grid-cols-4 mb-6">
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="lab_results">Lab Results</TabsTrigger>
            <TabsTrigger value="visits">Medical Visits</TabsTrigger>
            <TabsTrigger value="conditions">Conditions</TabsTrigger>
          </TabsList>
          
          <TabsContent value="documents" className="mt-0">
            {renderDocuments()}
          </TabsContent>
          
          <TabsContent value="lab_results" className="mt-0">
            {renderLabResults()}
          </TabsContent>
          
          <TabsContent value="visits" className="mt-0">
            {renderVisits()}
          </TabsContent>
          
          <TabsContent value="conditions" className="mt-0">
            {renderConditions()}
          </TabsContent>
        </Tabs>
        
        {/* Upload dialog */}
        <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Upload Medical Record</DialogTitle>
              <DialogDescription>
                Upload medical documents, reports, or other health records to your profile.
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleUpload}>
              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label htmlFor="file">Document File</Label>
                  <div className="flex items-center justify-center w-full">
                    <label 
                      htmlFor="file-upload" 
                      className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700"
                    >
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-8 h-8 mb-2 text-slate-500" />
                        <p className="mb-2 text-sm text-slate-500 dark:text-slate-400">
                          <span className="font-semibold">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          PDF, JPG, PNG or DOCX (MAX. 10MB)
                        </p>
                      </div>
                      <input 
                        id="file-upload" 
                        type="file" 
                        className="hidden" 
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                      />
                    </label>
                  </div>
                  {uploadFile && (
                    <div className="flex items-center justify-between bg-slate-100 dark:bg-slate-800 p-2 rounded mt-2">
                      <span className="text-sm truncate">{uploadFile.name}</span>
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm"
                        onClick={() => {
                          setUploadFile(null);
                          if (fileInputRef.current) fileInputRef.current.value = "";
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="title">Document Title</Label>
                  <Input 
                    id="title" 
                    value={uploadDetails.title}
                    onChange={(e) => setUploadDetails({...uploadDetails, title: e.target.value})}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select 
                    value={uploadDetails.category} 
                    onValueChange={(value) => setUploadDetails({...uploadDetails, category: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lab_report">Lab Report</SelectItem>
                      <SelectItem value="prescription">Prescription</SelectItem>
                      <SelectItem value="imaging">Imaging (X-ray, MRI, etc.)</SelectItem>
                      <SelectItem value="discharge_summary">Discharge Summary</SelectItem>
                      <SelectItem value="vaccination">Vaccination Record</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Input 
                    id="description" 
                    value={uploadDetails.description}
                    onChange={(e) => setUploadDetails({...uploadDetails, description: e.target.value})}
                  />
                </div>
              </div>
              
              <DialogFooter className="mt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setUploadDialogOpen(false);
                    resetUploadForm();
                  }}
                  disabled={uploading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={uploading || !uploadFile}>
                  {uploading ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Document
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
