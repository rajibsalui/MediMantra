"use client";

import { useState } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  ResponsiveContainer 
} from 'recharts';
import { ButtonGroup } from '@/components/ui/button-group';
import { Button } from '@/components/ui/button';

export default function MedicalMetricsChart() {
  const [activeMetric, setActiveMetric] = useState('bloodPressure');
  const [timeRange, setTimeRange] = useState('6m');
  
  // Sample data - would come from API in real app
  const bloodPressureData = [
    { date: 'Jan', systolic: 120, diastolic: 80 },
    { date: 'Feb', systolic: 125, diastolic: 82 },
    { date: 'Mar', systolic: 118, diastolic: 79 },
    { date: 'Apr', systolic: 122, diastolic: 81 },
    { date: 'May', systolic: 126, diastolic: 83 },
    { date: 'Jun', systolic: 120, diastolic: 80 },
  ];
  
  const glucoseData = [
    { date: 'Jan', value: 100 },
    { date: 'Feb', value: 110 },
    { date: 'Mar', value: 95 },
    { date: 'Apr', value: 105 },
    { date: 'May', value: 98 },
    { date: 'Jun', value: 102 },
  ];
  
  const weightData = [
    { date: 'Jan', value: 71 },
    { date: 'Feb', value: 70.5 },
    { date: 'Mar', value: 70 },
    { date: 'Apr', value: 69.8 },
    { date: 'May', value: 69.5 },
    { date: 'Jun', value: 70 },
  ];

  // Determine which data set to display
  let chartData, chartTitle, unit;
  switch (activeMetric) {
    case 'bloodPressure':
      chartData = bloodPressureData;
      chartTitle = "Blood Pressure";
      unit = "mmHg";
      break;
    case 'glucose':
      chartData = glucoseData;
      chartTitle = "Blood Glucose";
      unit = "mg/dL";
      break;
    case 'weight':
      chartData = weightData;
      chartTitle = "Weight";
      unit = "kg";
      break;
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h2 className="text-xl font-semibold mb-2 sm:mb-0 text-gray-800">{chartTitle}</h2>
        
        <div className="flex space-x-2">
          <ButtonGroup>
            <Button 
              size="sm" 
              variant={activeMetric === 'bloodPressure' ? 'default' : 'outline'} 
              onClick={() => setActiveMetric('bloodPressure')}
              className={activeMetric === 'bloodPressure' ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'text-gray-700 hover:bg-gray-100'}
            >
              BP
            </Button>
            <Button 
              size="sm" 
              variant={activeMetric === 'glucose' ? 'default' : 'outline'} 
              onClick={() => setActiveMetric('glucose')}
              className={activeMetric === 'glucose' ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'text-gray-700 hover:bg-gray-100'}
            >
              Glucose
            </Button>
            <Button 
              size="sm" 
              variant={activeMetric === 'weight' ? 'default' : 'outline'} 
              onClick={() => setActiveMetric('weight')}
              className={activeMetric === 'weight' ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'text-gray-700 hover:bg-gray-100'}
            >
              Weight
            </Button>
          </ButtonGroup>
          
          <ButtonGroup>
            <Button 
              size="sm" 
              variant={timeRange === '1m' ? 'default' : 'outline'} 
              onClick={() => setTimeRange('1m')}
              className={timeRange === '1m' ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'text-gray-700 hover:bg-gray-100'}
            >
              1M
            </Button>
            <Button 
              size="sm" 
              variant={timeRange === '6m' ? 'default' : 'outline'} 
              onClick={() => setTimeRange('6m')}
              className={timeRange === '6m' ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'text-gray-700 hover:bg-gray-100'}
            >
              6M
            </Button>
            <Button 
              size="sm" 
              variant={timeRange === '1y' ? 'default' : 'outline'} 
              onClick={() => setTimeRange('1y')}
              className={timeRange === '1y' ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'text-gray-700 hover:bg-gray-100'}
            >
              1Y
            </Button>
          </ButtonGroup>
        </div>
      </div>
        
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} stroke="#e5e7eb" />
            <XAxis dataKey="date" stroke="#6b7280" />
            <YAxis unit={unit} stroke="#6b7280" />
            <Tooltip contentStyle={{ backgroundColor: "white", borderColor: "#e5e7eb" }} />
            <Legend />
            {activeMetric === 'bloodPressure' ? (
              <>
                <Line type="monotone" dataKey="systolic" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="diastolic" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 4 }} />
              </>
            ) : (
              <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
