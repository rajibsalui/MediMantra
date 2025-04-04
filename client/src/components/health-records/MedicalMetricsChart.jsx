"use client";

import { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle, RefreshCw, ChevronDown } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function MedicalMetricsChart({ vitalStats, isLoading, error, onRetry }) {
  const [chartType, setChartType] = useState('bloodPressure');
  const [timeRange, setTimeRange] = useState('3m');
  
  // Filter data based on time range
  const getFilteredData = () => {
    if (!vitalStats || vitalStats.length === 0) return [];
    
    const now = new Date();
    let startDate;
    
    switch (timeRange) {
      case '1m':
        startDate = new Date(now.setMonth(now.getMonth() - 1));
        break;
      case '3m':
        startDate = new Date(now.setMonth(now.getMonth() - 3));
        break;
      case '6m':
        startDate = new Date(now.setMonth(now.getMonth() - 6));
        break;
      case '1y':
        startDate = new Date(now.setFullYear(now.getFullYear() - 1));
        break;
      default:
        startDate = new Date(now.setMonth(now.getMonth() - 3));
    }
    
    return vitalStats.filter(reading => new Date(reading.date) >= startDate)
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  };
  
  // Create chart data based on selected metric
  const createChartData = () => {
    const filteredData = getFilteredData();
    
    // Default empty data
    const emptyData = {
      labels: [],
      datasets: [
        {
          label: 'No Data Available',
          data: [],
          borderColor: 'rgba(99, 102, 241, 1)',
          backgroundColor: 'rgba(99, 102, 241, 0.2)',
          tension: 0.3,
        }
      ]
    };
    
    if (filteredData.length === 0) return emptyData;
    
    const labels = filteredData.map(item => {
      return new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    });
    
    switch (chartType) {
      case 'bloodPressure':
        return {
          labels,
          datasets: [
            {
              label: 'Systolic',
              data: filteredData.map(item => item.bloodPressure?.systolic),
              borderColor: 'rgba(239, 68, 68, 1)',
              backgroundColor: 'rgba(239, 68, 68, 0.2)',
              tension: 0.3,
            },
            {
              label: 'Diastolic',
              data: filteredData.map(item => item.bloodPressure?.diastolic),
              borderColor: 'rgba(59, 130, 246, 1)',
              backgroundColor: 'rgba(59, 130, 246, 0.2)',
              tension: 0.3,
            }
          ]
        };
        
      case 'heartRate':
        return {
          labels,
          datasets: [{
            label: 'Heart Rate (BPM)',
            data: filteredData.map(item => item.heartRate),
            borderColor: 'rgba(217, 70, 239, 1)',
            backgroundColor: 'rgba(217, 70, 239, 0.2)',
            tension: 0.3,
            fill: true,
          }]
        };
        
      case 'glucose':
        return {
          labels,
          datasets: [{
            label: 'Glucose Level (mg/dL)',
            data: filteredData.map(item => item.glucoseLevel),
            borderColor: 'rgba(251, 191, 36, 1)',
            backgroundColor: 'rgba(251, 191, 36, 0.2)',
            tension: 0.3,
            fill: true,
          }]
        };
        
      case 'weight':
        return {
          labels,
          datasets: [{
            label: 'Weight (kg)',
            data: filteredData.map(item => item.weight),
            borderColor: 'rgba(16, 185, 129, 1)',
            backgroundColor: 'rgba(16, 185, 129, 0.2)',
            tension: 0.3,
            fill: true,
          }]
        };
        
      default:
        return emptyData;
    }
  };
  
  // Chart options based on chart type
  const getChartOptions = () => {
    const baseOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
        },
        tooltip: {
          mode: 'index',
          intersect: false,
        },
      },
      scales: {
        x: {
          grid: {
            display: false,
          },
        },
        y: {
          beginAtZero: false,
          grid: {
            color: 'rgba(0, 0, 0, 0.05)',
          },
        },
      },
      interaction: {
        mode: 'nearest',
        axis: 'x',
        intersect: false
      }
    };
    
    // Customize based on chart type
    switch (chartType) {
      case 'bloodPressure':
        return {
          ...baseOptions,
          plugins: {
            ...baseOptions.plugins,
            title: {
              display: true,
              text: 'Blood Pressure (mmHg)'
            }
          },
          scales: {
            ...baseOptions.scales,
            y: {
              ...baseOptions.scales.y,
              min: 40,
              max: 180,
            }
          }
        };
      
      case 'heartRate':
        return {
          ...baseOptions,
          plugins: {
            ...baseOptions.plugins,
            title: {
              display: true,
              text: 'Heart Rate (BPM)'
            }
          },
          scales: {
            ...baseOptions.scales,
            y: {
              ...baseOptions.scales.y,
              min: 40,
              max: 120,
            }
          }
        };
        
      case 'glucose':
        return {
          ...baseOptions,
          plugins: {
            ...baseOptions.plugins,
            title: {
              display: true,
              text: 'Blood Glucose Level (mg/dL)'
            }
          }
        };
        
      case 'weight':
        return {
          ...baseOptions,
          plugins: {
            ...baseOptions.plugins,
            title: {
              display: true,
              text: 'Weight (kg)'
            }
          }
        };
        
      default:
        return baseOptions;
    }
  };
  
  if (isLoading) {
    return (
      <div className="min-h-[340px] flex flex-col justify-center items-center">
        <Loader2 className="h-8 w-8 text-blue-500 animate-spin mb-4" />
        <p className="text-gray-500">Loading health metrics...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-[340px] flex flex-col justify-center items-center">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h3 className="text-lg font-medium mb-2">Failed to load health metrics</h3>
        <p className="text-gray-500 mb-4">{error.message || 'An unknown error occurred'}</p>
        <Button onClick={onRetry} variant="outline" className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4" />
          Try Again
        </Button>
      </div>
    );
  }
  
  const chartData = createChartData();
  const chartOptions = getChartOptions();
  
  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h2 className="text-lg font-medium mb-2 sm:mb-0">Health Metrics</h2>
        
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Select value={chartType} onValueChange={setChartType}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Select metric" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="bloodPressure">Blood Pressure</SelectItem>
              <SelectItem value="heartRate">Heart Rate</SelectItem>
              <SelectItem value="glucose">Blood Glucose</SelectItem>
              <SelectItem value="weight">Weight</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-full sm:w-32">
              <SelectValue placeholder="Time Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1m">1 Month</SelectItem>
              <SelectItem value="3m">3 Months</SelectItem>
              <SelectItem value="6m">6 Months</SelectItem>
              <SelectItem value="1y">1 Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="h-[300px] w-full">
        {(vitalStats?.length && getFilteredData().length > 0) ? (
          <Line data={chartData} options={chartOptions} />
        ) : (
          <div className="h-full w-full flex flex-col justify-center items-center bg-gray-50 dark:bg-gray-800/30 rounded-lg border border-gray-200 dark:border-gray-700">
            <p className="text-gray-500 dark:text-gray-400 mb-2">No data available for this time period</p>
            <p className="text-sm text-gray-400 dark:text-gray-500">
              Health metrics will appear here once recorded
            </p>
          </div>
        )}
      </div>
      
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { title: 'Latest BP', value: vitalStats[0]?.bloodPressure ? `${vitalStats[0]?.bloodPressure.systolic}/${vitalStats[0]?.bloodPressure.diastolic}` : 'N/A', unit: 'mmHg', color: 'text-red-600' },
          { title: 'Heart Rate', value: vitalStats[0]?.heartRate || 'N/A', unit: 'BPM', color: 'text-purple-600' },
          { title: 'Glucose', value: vitalStats[0]?.glucoseLevel || 'N/A', unit: 'mg/dL', color: 'text-amber-600' },
          { title: 'Weight', value: vitalStats[0]?.weight || 'N/A', unit: 'kg', color: 'text-green-600' }
        ].map((metric, i) => (
          <div key={i} className="bg-gray-50 dark:bg-gray-800/30 p-3 rounded-lg text-center">
            <p className="text-gray-500 text-xs mb-1">{metric.title}</p>
            <p className={`${metric.color} font-semibold text-lg`}>
              {metric.value} <span className="text-xs font-normal">{metric.unit}</span>
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
