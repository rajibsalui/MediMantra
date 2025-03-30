"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { usePatient } from '@/contexts/PatientContext';
import ProfileSummary from '@/components/health-records/ProfileSummary';
import HealthRecordTabs from '@/components/health-records/HealthRecordTabs';
import RecentVisits from '@/components/health-records/RecentVisits';
import UpcomingAppointments from '@/components/health-records/UpcomingAppointments';
import MedicalMetricsChart from '@/components/health-records/MedicalMetricsChart';
import HealthRecordFilters from '@/components/health-records/HealthRecordFilters';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

// Expected server data shapes for validation
const dataShapes = {
  profile: {
    requiredFields: ['patientId', 'dateOfBirth', 'gender', 'bloodGroup', 'allergies'],
    fallback: {}
  },
  appointments: {
    requiredFields: ['appointmentId', 'doctorId', 'dateTime', 'status'],
    fallback: []
  },
  records: {
    requiredFields: ['visits', 'prescriptions', 'tests', 'treatments'],
    fallback: { visits: [], prescriptions: [], tests: [], treatments: [] }
  },
  vitals: {
    requiredFields: ['bloodPressure', 'heartRate', 'temperature', 'glucoseLevel', 'weight'],
    fallback: []
  }
};

export default function HealthRecords() {
  const [activeFilter, setActiveFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [loadingStates, setLoadingStates] = useState({
    profile: false,
    appointments: false,
    records: false,
    vitals: false
  });
  const [errors, setErrors] = useState({});
  const [refreshing, setRefreshing] = useState(false);
  const [dataRefreshTimestamps, setDataRefreshTimestamps] = useState({
    profile: null,
    appointments: null,
    records: null,
    vitals: null
  });
  const [dataSummary, setDataSummary] = useState({
    appointmentsCount: 0,
    recordsCount: 0,
    prescriptionsCount: 0,
    recentVisitDate: null
  });
  
  // Get auth and patient context
  const { user, getCurrentUser, isAuthenticated, loading: authLoading } = useAuth();
  const { 
    patientProfile, 
    fetchPatientProfile, 
    fetchUpcomingAppointments,
    fetchMedicalRecords,
    fetchVitalStats,
    upcomingAppointments,
    medicalRecords,
    vitalStats,
    loading: patientLoading 
  } = usePatient();
  
  const router = useRouter();

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      getCurrentUser();
      toast.error('Please sign in to access your dashboard');
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  // Validate data shape from server
  const validateData = (data, dataType) => {
    if (!data) return false;
    
    const { requiredFields } = dataShapes[dataType];
    if (Array.isArray(data)) {
      return data.length === 0 || requiredFields.every(field => field in data[0]);
    }
    
    return requiredFields.every(field => field in data);
  };

  // Function to load a specific type of data
  const loadData = async (userId, dataType) => {
    setLoadingStates(prev => ({ ...prev, [dataType]: true }));
    setErrors(prev => ({ ...prev, [dataType]: null }));
    
    try {
      let result;
      switch(dataType) {
        case 'profile':
          // GET /api/patients/:patientId - Fetches patient profile info
          result = await fetchPatientProfile(userId);
          break;
        case 'appointments':
          // GET /api/patients/:patientId/appointments - Fetches upcoming appointments
          result = await fetchUpcomingAppointments(userId);
          break;
        case 'records':
          // GET /api/patients/:patientId/records - Fetches medical records collection
          result = await fetchMedicalRecords(userId);
          break;
        case 'vitals':
          // GET /api/patients/:patientId/vitals - Fetches time series vitals data
          result = await fetchVitalStats(userId);
          break;
        default:
          break;
      }
      
      // Validate the shape of data received from server
      if (!validateData(result, dataType)) {
        console.warn(`Invalid ${dataType} data format received from server`);
        // Still continue since we have fallbacks
      }
      
      // Update refresh timestamp
      setDataRefreshTimestamps(prev => ({
        ...prev,
        [dataType]: new Date().toISOString()
      }));
      
      // Update data summary for analytics
      updateDataSummary();
      
      return true;
    } catch (error) {
      console.error(`Error loading ${dataType}:`, error);
      const errorMessage = error.response?.data?.message || 
        error.message || 
        `Failed to load ${dataType}`;
      
      setErrors(prev => ({ 
        ...prev, 
        [dataType]: {
          message: errorMessage,
          status: error.response?.status || 500,
          timestamp: new Date().toISOString()
        }
      }));
      
      // Show appropriate toast based on error type
      if (error.response?.status === 404) {
        toast.error(`No ${dataType.replace('_', ' ')} found for your account`);
      } else if (error.response?.status === 401) {
        toast.error('Your session has expired. Please log in again');
        router.push('/login');
      } else {
        toast.error(`Failed to load your ${dataType.replace('_', ' ')}`);
      }
      return false;
    } finally {
      setLoadingStates(prev => ({ ...prev, [dataType]: false }));
    }
  };

  // Calculate data summary for dashboard analytics
  const updateDataSummary = () => {
    const appointmentsCount = upcomingAppointments?.length || 0;
    
    const recordsCount = (
      (medicalRecords?.visits?.length || 0) + 
      (medicalRecords?.tests?.length || 0) + 
      (medicalRecords?.treatments?.length || 0)
    );
    
    const prescriptionsCount = medicalRecords?.prescriptions?.length || 0;
    
    const visits = medicalRecords?.visits || [];
    const recentVisitDate = visits.length > 0 
      ? new Date(Math.max(...visits.map(v => new Date(v.date))))
      : null;
    
    setDataSummary({
      appointmentsCount,
      recordsCount,
      prescriptionsCount,
      recentVisitDate: recentVisitDate ? recentVisitDate.toISOString() : null
    });
  };

  // Fetch patient data when authenticated
  useEffect(() => {
    const loadPatientData = async () => {
      if (isAuthenticated && user) {
        setIsLoading(true);
        try {
          // Load all required patient data
          const results = await Promise.all([
            loadData(user._id, 'profile'),
            loadData(user._id, 'appointments'),
            loadData(user._id, 'records'),
            loadData(user._id, 'vitals')
          ]);
          
          // If any data failed to load
          if (results.includes(false)) {
            toast.error('Some data could not be loaded. Please try refreshing.');
          }
        } catch (error) {
          console.error('Error loading patient data:', error);
          toast.error('Failed to load your health records');
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadPatientData();
  }, [isAuthenticated, user]);

  // Auto-refresh data if it's older than 15 minutes
  useEffect(() => {
    if (!isAuthenticated || !user) return;
    
    const checkAndRefreshData = () => {
      const now = new Date();
      Object.entries(dataRefreshTimestamps).forEach(([dataType, timestamp]) => {
        if (!timestamp) return;
        
        const lastRefresh = new Date(timestamp);
        const diffMinutes = (now - lastRefresh) / (1000 * 60);
        
        // If data is older than 15 minutes, refresh it
        if (diffMinutes > 15) {
          loadData(user._id, dataType);
        }
      });
    };
    
    // Check data freshness every 5 minutes
    const intervalId = setInterval(checkAndRefreshData, 5 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, [isAuthenticated, user, dataRefreshTimestamps]);

  // Function to refresh all data
  const handleRefresh = async () => {
    if (!user) return;
    
    setRefreshing(true);
    toast.loading('Refreshing your data...');
    
    try {
      await Promise.all([
        loadData(user._id, 'profile'),
        loadData(user._id, 'appointments'),
        loadData(user._id, 'records'),
        loadData(user._id, 'vitals')
      ]);
      toast.dismiss();
      toast.success('Data refreshed successfully');
    } catch (error) {
      console.error('Error refreshing data:', error);
      toast.error('Failed to refresh data');
    } finally {
      setRefreshing(false);
    }
  };

  // Show loading state while data is being fetched
  if (authLoading || patientLoading || isLoading) {
    return <DashboardSkeleton />;
  }

  // If user is authenticated but not a patient (e.g., doctor)
  if (user && user.role !== 'patient') {
    router.push(`/${user.role}/dashboard`);
    return null;
  }
  
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-3xl font-bold text-blue-600">Health Records</h1>
        
        <div className="flex items-center gap-4 mt-2 md:mt-0">
          {user && (
            <div className="text-gray-600">
              Welcome back, <span className="font-semibold">{user.firstName} {user.lastName}</span>
            </div>
          )}
          
          <Button 
            size="sm" 
            variant="outline" 
            onClick={handleRefresh} 
            disabled={refreshing}
            className="flex items-center gap-2"
            title="Last refreshed: All data will refresh automatically every 15 minutes"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>
      
      {/* Data summary indicators */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <Card className="bg-blue-50">
          <CardContent className="py-4 flex flex-col items-center">
            <p className="text-sm font-medium text-blue-700">Appointments</p>
            <p className="text-2xl font-bold">{dataSummary.appointmentsCount}</p>
          </CardContent>
        </Card>
        
        <Card className="bg-green-50">
          <CardContent className="py-4 flex flex-col items-center">
            <p className="text-sm font-medium text-green-700">Records</p>
            <p className="text-2xl font-bold">{dataSummary.recordsCount}</p>
          </CardContent>
        </Card>
        
        <Card className="bg-purple-50">
          <CardContent className="py-4 flex flex-col items-center">
            <p className="text-sm font-medium text-purple-700">Prescriptions</p>
            <p className="text-2xl font-bold">{dataSummary.prescriptionsCount}</p>
          </CardContent>
        </Card>
        
        <Card className="bg-amber-50">
          <CardContent className="py-4 flex flex-col items-center">
            <p className="text-sm font-medium text-amber-700">Last Visit</p>
            <p className="text-sm font-bold">
              {dataSummary.recentVisitDate 
                ? new Date(dataSummary.recentVisitDate).toLocaleDateString() 
                : 'None'}
            </p>
          </CardContent>
        </Card>
      </div>
        
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - Profile summary and upcoming */}
        <div className="lg:col-span-1 space-y-6">
          <ProfileSummary 
            user={user} 
            patientProfile={patientProfile || dataShapes.profile.fallback}
            isLoading={loadingStates.profile}
            error={errors.profile}
            onRetry={() => loadData(user?._id, 'profile')}
            lastUpdated={dataRefreshTimestamps.profile}
          />
          <UpcomingAppointments 
            appointments={upcomingAppointments || dataShapes.appointments.fallback} 
            isLoading={loadingStates.appointments}
            error={errors.appointments}
            onRetry={() => loadData(user?._id, 'appointments')}
            lastUpdated={dataRefreshTimestamps.appointments}
          />
        </div>
        
        {/* Right columns - Charts and records */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-white shadow-md">
            <CardContent className="pt-6">
              <MedicalMetricsChart 
                vitalStats={vitalStats || dataShapes.vitals.fallback} 
                isLoading={loadingStates.vitals}
                error={errors.vitals}
                onRetry={() => loadData(user?._id, 'vitals')}
                lastUpdated={dataRefreshTimestamps.vitals}
              />
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
            
            <HealthRecordTabs 
              activeFilter={activeFilter} 
              records={medicalRecords || dataShapes.records.fallback}
              isLoading={loadingStates.records}
              error={errors.records}
              onRetry={() => loadData(user?._id, 'records')}
              lastUpdated={dataRefreshTimestamps.records}
            />
          </div>
          
          <RecentVisits 
            visits={medicalRecords?.visits || []}
            user={user}
            isLoading={loadingStates.records}
            error={errors.records}
            onRetry={() => loadData(user?._id, 'records')}
            lastUpdated={dataRefreshTimestamps.records}
          />
        </div>
      </div>
    </div>
  );
}

// Loading skeleton for the dashboard
function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <Skeleton className="h-10 w-64 mb-6" />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column skeleton */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardContent className="p-6">
              <Skeleton className="h-6 w-3/4 mb-4" />
              <Skeleton className="h-16 w-full mb-4" />
              <Skeleton className="h-4 w-1/2" />
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <Skeleton className="h-6 w-3/4 mb-4" />
              <div className="space-y-3">
                <Skeleton className="h-14 w-full" />
                <Skeleton className="h-14 w-full" />
                <Skeleton className="h-14 w-full" />
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Right columns skeleton */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardContent className="p-6">
              <Skeleton className="h-6 w-1/3 mb-4" />
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between mb-6">
                <Skeleton className="h-6 w-1/4" />
                <Skeleton className="h-6 w-1/3" />
              </div>
              <div className="space-y-3">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
