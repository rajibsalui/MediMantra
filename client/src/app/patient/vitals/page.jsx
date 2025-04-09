"use client";

import { useState, useEffect } from "react";
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
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "react-hot-toast";
import { 
  Activity, 
  Heart, 
  Thermometer, 
  Droplet, 
  Wind, 
  Percent, 
  Scale,
  AlertCircle, 
  RefreshCw, 
  Plus,
  Calendar,
  Clock
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
import VitalStatForm from "@/components/health-records/VitalStatForm";
import { API_URL, SOCKET_URL } from '@/config/environment';

// This ensures the page is only rendered on the client side
export const dynamic = 'force-dynamic';
export const runtime = 'edge';
export default function PatientVitals() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { fetchVitalStats, addVitalStats, loading } = usePatient();
  
  const [vitalStats, setVitalStats] = useState(null);
  const [activeMetric, setActiveMetric] = useState("bloodPressure");
  const [timeRange, setTimeRange] = useState("6m"); // 6 months default
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      loadVitalStats();
    } else if (!isAuthenticated && !loading) {
      router.push("/login");
    }
  }, [isAuthenticated, user?.id]);
  
  const loadVitalStats = async () => {
    try {
      setError(null);
      const stats = await fetchVitalStats(user?.id);
      
      if (stats) {
        setVitalStats(stats);
      } else {
        setVitalStats(null);
      }
    } catch (err) {
      console.error("Error loading vital statistics:", err);
      setError("Failed to load vital statistics. Please try again.");
      toast.error("Failed to load vital statistics");
    }
  };
  
  const handleAddVitalStat = async (data) => {
    try {
      await addVitalStats(data);
      toast.success("Vital statistics added successfully");
      loadVitalStats();
      setShowAddForm(false);
    } catch (err) {
      console.error("Error adding vital statistics:", err);
      toast.error("Failed to add vital statistics");
    }
  };
  
  // Format data for charts
  const getChartData = () => {
    if (!vitalStats || !vitalStats.data || vitalStats.data.length === 0) {
      return [];
    }
    
    // Sort by date
    const sortedData = [...vitalStats.data].sort((a, b) => 
      new Date(a.recordedAt) - new Date(b.recordedAt)
    );
    
    // Apply time range filter
    const filtered = filterByTimeRange(sortedData, timeRange);
    
    return filtered.map(stat => ({
      date: new Date(stat.recordedAt).toLocaleDateString(),
      systolic: stat.bloodPressure?.systolic || 0,
      diastolic: stat.bloodPressure?.diastolic || 0,
      heartRate: stat.heartRate || 0,
      temperature: stat.temperature || 0,
      respiratoryRate: stat.respiratoryRate || 0,
      oxygenSaturation: stat.oxygenSaturation || 0,
      weight: stat.weight || 0
    }));
  };
  
  // Filter data by time range
  const filterByTimeRange = (data, range) => {
    const now = new Date();
    let cutoffDate;
    
    switch (range) {
      case "1m":
        cutoffDate = new Date(now.setMonth(now.getMonth() - 1));
        break;
      case "3m":
        cutoffDate = new Date(now.setMonth(now.getMonth() - 3));
        break;
      case "6m":
        cutoffDate = new Date(now.setMonth(now.getMonth() - 6));
        break;
      case "1y":
        cutoffDate = new Date(now.setFullYear(now.getFullYear() - 1));
        break;
      case "all":
      default:
        return data;
    }
    
    return data.filter(stat => new Date(stat.recordedAt) >= cutoffDate);
  };
  
  // Get latest vital stats
  const getLatestStats = () => {
    if (!vitalStats || !vitalStats.data || vitalStats.data.length === 0) {
      return null;
    }
    
    // Sort by date descending to get the most recent
    const sortedData = [...vitalStats.data].sort((a, b) => 
      new Date(b.recordedAt) - new Date(a.recordedAt)
    );
    
    return sortedData[0];
  };
  
  const latestStats = getLatestStats();
  const chartData = getChartData();
  
  // Render vital stats summary cards
  const renderStatsSummary = () => {
    if (!latestStats) return null;
    
    const stats = [
      { 
        title: 'Blood Pressure', 
        value: latestStats.bloodPressure ? 
          `${latestStats.bloodPressure.systolic}/${latestStats.bloodPressure.diastolic}` : 
          'N/A', 
        unit: 'mmHg', 
        icon: <Droplet className="h-5 w-5" />,
        color: 'text-red-600 dark:text-red-400',
        bgColor: 'bg-red-50 dark:bg-red-900/20'
      },
      { 
        title: 'Heart Rate', 
        value: latestStats.heartRate || 'N/A', 
        unit: 'BPM', 
        icon: <Heart className="h-5 w-5" />,
        color: 'text-pink-600 dark:text-pink-400',
        bgColor: 'bg-pink-50 dark:bg-pink-900/20'
      },
      { 
        title: 'Temperature', 
        value: latestStats.temperature || 'N/A', 
        unit: '°C', 
        icon: <Thermometer className="h-5 w-5" />,
        color: 'text-orange-600 dark:text-orange-400',
        bgColor: 'bg-orange-50 dark:bg-orange-900/20'
      },
      { 
        title: 'Oxygen', 
        value: latestStats.oxygenSaturation || 'N/A', 
        unit: '%', 
        icon: <Percent className="h-5 w-5" />,
        color: 'text-blue-600 dark:text-blue-400',
        bgColor: 'bg-blue-50 dark:bg-blue-900/20'
      },
      { 
        title: 'Respiratory Rate', 
        value: latestStats.respiratoryRate || 'N/A', 
        unit: 'BPM', 
        icon: <Wind className="h-5 w-5" />,
        color: 'text-cyan-600 dark:text-cyan-400',
        bgColor: 'bg-cyan-50 dark:bg-cyan-900/20'
      },
      { 
        title: 'Weight', 
        value: latestStats.weight || 'N/A', 
        unit: 'kg', 
        icon: <Scale className="h-5 w-5" />,
        color: 'text-green-600 dark:text-green-400',
        bgColor: 'bg-green-50 dark:bg-green-900/20'
      }
    ];
    
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        {stats.map((stat, index) => (
          <Card key={index} className="border-slate-200 dark:border-slate-700">
            <CardContent className="p-4">
              <div className="flex flex-col items-center text-center">
                <div className={`p-2 rounded-full ${stat.bgColor} ${stat.color} mb-3`}>
                  {stat.icon}
                </div>
                <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{stat.title}</h3>
                <div className={`text-xl font-bold ${stat.color}`}>
                  {stat.value} <span className="text-xs font-normal">{stat.unit}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };
  
  // Render chart for selected metric
  const renderChart = () => {
    if (loading) {
      return (
        <div className="h-80 flex items-center justify-center">
          <Skeleton className="h-full w-full rounded-lg" />
        </div>
      );
    }
    
    if (error) {
      return (
        <div className="text-center py-8">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-slate-700 dark:text-slate-300 mb-4">{error}</p>
          <Button onClick={loadVitalStats} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      );
    }
    
    if (!chartData || chartData.length === 0) {
      return (
        <div className="text-center py-8">
          <Activity className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No vital statistics data</h3>
          <p className="text-slate-500 dark:text-slate-400 mb-4">
            Start tracking your health metrics by adding your vital statistics.
          </p>
          <Button onClick={() => setShowAddForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Vital Statistics
          </Button>
        </div>
      );
    }
    
    // Configure chart based on selected metric
    let lines = [];
    let yAxisLabel = "";
    
    switch (activeMetric) {
      case "bloodPressure":
        lines = [
          { dataKey: "systolic", stroke: "#ef4444", name: "Systolic" },
          { dataKey: "diastolic", stroke: "#3b82f6", name: "Diastolic" }
        ];
        yAxisLabel = "mmHg";
        break;
      case "heartRate":
        lines = [{ dataKey: "heartRate", stroke: "#ec4899", name: "Heart Rate" }];
        yAxisLabel = "BPM";
        break;
      case "temperature":
        lines = [{ dataKey: "temperature", stroke: "#f97316", name: "Temperature" }];
        yAxisLabel = "°C";
        break;
      case "respiratoryRate":
        lines = [{ dataKey: "respiratoryRate", stroke: "#06b6d4", name: "Respiratory Rate" }];
        yAxisLabel = "BPM";
        break;
      case "oxygenSaturation":
        lines = [{ dataKey: "oxygenSaturation", stroke: "#2563eb", name: "Oxygen Saturation" }];
        yAxisLabel = "%";
        break;
      case "weight":
        lines = [{ dataKey: "weight", stroke: "#16a34a", name: "Weight" }];
        yAxisLabel = "kg";
        break;
    }
    
    return (
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis 
              dataKey="date" 
              stroke="#94a3b8"
              tick={{ fill: "#94a3b8" }}
            />
            <YAxis 
              stroke="#94a3b8" 
              tick={{ fill: "#94a3b8" }}
              label={{ 
                value: yAxisLabel, 
                angle: -90, 
                position: 'insideLeft',
                style: { fill: "#94a3b8" }
              }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: "#ffffff", 
                border: "1px solid #e2e8f0",
                borderRadius: "0.375rem"
              }} 
            />
            <Legend />
            {lines.map((line, index) => (
              <Line
                key={index}
                type="monotone"
                dataKey={line.dataKey}
                stroke={line.stroke}
                name={line.name}
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  };
  
  // Render history table
  const renderHistoryTable = () => {
    if (!chartData || chartData.length === 0) {
      return null;
    }
    
    return (
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-slate-100 dark:bg-slate-800">
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-500 dark:text-slate-400">Date</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-500 dark:text-slate-400">Blood Pressure</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-500 dark:text-slate-400">Heart Rate</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-500 dark:text-slate-400">Temperature</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-500 dark:text-slate-400">Oxygen</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-500 dark:text-slate-400">Respiratory Rate</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-500 dark:text-slate-400">Weight</th>
            </tr>
          </thead>
          <tbody>
            {chartData.map((stat, index) => (
              <tr 
                key={index} 
                className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50"
              >
                <td className="px-4 py-3 text-sm">{stat.date}</td>
                <td className="px-4 py-3 text-sm">
                  {stat.systolic && stat.diastolic ? `${stat.systolic}/${stat.diastolic} mmHg` : 'N/A'}
                </td>
                <td className="px-4 py-3 text-sm">{stat.heartRate ? `${stat.heartRate} BPM` : 'N/A'}</td>
                <td className="px-4 py-3 text-sm">{stat.temperature ? `${stat.temperature} °C` : 'N/A'}</td>
                <td className="px-4 py-3 text-sm">{stat.oxygenSaturation ? `${stat.oxygenSaturation}%` : 'N/A'}</td>
                <td className="px-4 py-3 text-sm">{stat.respiratoryRate ? `${stat.respiratoryRate} BPM` : 'N/A'}</td>
                <td className="px-4 py-3 text-sm">{stat.weight ? `${stat.weight} kg` : 'N/A'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };
  
  return (
    <DashboardLayout>
      <div className="container mx-auto py-6 px-4 md:px-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Vital Statistics</h1>
            <p className="text-muted-foreground">
              Track and monitor your health metrics over time
            </p>
          </div>
          <div className="flex space-x-2 mt-4 md:mt-0">
            <Button 
              variant="outline"
              onClick={() => setShowAddForm(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add New
            </Button>
            <Button 
              onClick={loadVitalStats}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
        
        {/* Latest stats summary */}
        {renderStatsSummary()}
        
        {/* Chart section */}
        <Card className="mb-6">
          <CardHeader className="pb-2">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <CardTitle>Health Metrics Trends</CardTitle>
              <div className="flex flex-wrap gap-2 mt-2 sm:mt-0">
                <select 
                  className="px-2 py-1 text-sm border border-slate-200 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800"
                  value={activeMetric}
                  onChange={(e) => setActiveMetric(e.target.value)}
                >
                  <option value="bloodPressure">Blood Pressure</option>
                  <option value="heartRate">Heart Rate</option>
                  <option value="temperature">Temperature</option>
                  <option value="respiratoryRate">Respiratory Rate</option>
                  <option value="oxygenSaturation">Oxygen Saturation</option>
                  <option value="weight">Weight</option>
                </select>
                <select 
                  className="px-2 py-1 text-sm border border-slate-200 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800"
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                >
                  <option value="1m">Last Month</option>
                  <option value="3m">Last 3 Months</option>
                  <option value="6m">Last 6 Months</option>
                  <option value="1y">Last Year</option>
                  <option value="all">All Time</option>
                </select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {renderChart()}
          </CardContent>
        </Card>
        
        {/* History table */}
        <Card>
          <CardHeader>
            <CardTitle>Vital Statistics History</CardTitle>
            <CardDescription>
              Complete history of your recorded vital statistics
            </CardDescription>
          </CardHeader>
          <CardContent>
            {renderHistoryTable()}
          </CardContent>
        </Card>
        
        {/* Add vital stats form */}
        {showAddForm && (
          <VitalStatForm 
            onAddSuccess={handleAddVitalStat}
            onCancel={() => setShowAddForm(false)}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
