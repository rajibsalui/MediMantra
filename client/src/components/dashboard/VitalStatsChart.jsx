"use client";

import { useState } from "react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
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

export default function VitalStatsChart({ data = {} }) {
  const [metric, setMetric] = useState("bloodPressure");
  const [timeRange, setTimeRange] = useState("6m"); // 6 months default
  
  // Handle empty or invalid data
  if (!data || !data.labels || !data.datasets) {
    return (
      <div className="text-center py-8">
        <p className="text-slate-500 dark:text-slate-400">No vital statistics data available</p>
      </div>
    );
  }
  
  // Prepare chart data based on selected metric
  const prepareChartData = () => {
    const { labels, datasets } = data;
    
    // Filter data based on time range
    const filteredLabels = filterDataByTimeRange(labels);
    const startIndex = labels.length - filteredLabels.length;
    
    if (metric === "bloodPressure") {
      return filteredLabels.map((date, index) => ({
        date,
        systolic: datasets.bloodPressure.systolic[startIndex + index],
        diastolic: datasets.bloodPressure.diastolic[startIndex + index]
      }));
    } else {
      return filteredLabels.map((date, index) => ({
        date,
        value: datasets[metric][startIndex + index]
      }));
    }
  };
  
  // Filter data based on selected time range
  const filterDataByTimeRange = (labels) => {
    const months = {
      "1m": 1,
      "3m": 3,
      "6m": 6,
      "1y": 12,
      "all": labels.length
    };
    
    const count = months[timeRange] || 6;
    return labels.slice(-count);
  };
  
  // Get unit for the selected metric
  const getUnit = () => {
    const units = {
      bloodPressure: "mmHg",
      heartRate: "BPM",
      temperature: "°C",
      respiratoryRate: "breaths/min",
      oxygenSaturation: "%",
      weight: "kg"
    };
    
    return units[metric] || "";
  };
  
  // Format the chart data
  const chartData = prepareChartData();
  
  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Vital Statistics</h2>
        
        <div className="flex space-x-2 mt-2 sm:mt-0">
          <Select value={metric} onValueChange={setMetric}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select metric" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="bloodPressure">Blood Pressure</SelectItem>
              <SelectItem value="heartRate">Heart Rate</SelectItem>
              <SelectItem value="temperature">Temperature</SelectItem>
              <SelectItem value="respiratoryRate">Respiratory Rate</SelectItem>
              <SelectItem value="oxygenSaturation">Oxygen Saturation</SelectItem>
              <SelectItem value="weight">Weight</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1m">1 Month</SelectItem>
              <SelectItem value="3m">3 Months</SelectItem>
              <SelectItem value="6m">6 Months</SelectItem>
              <SelectItem value="1y">1 Year</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
            <XAxis dataKey="date" />
            <YAxis unit={getUnit()} />
            <Tooltip />
            <Legend />
            
            {metric === "bloodPressure" ? (
              <>
                <Line 
                  type="monotone" 
                  dataKey="systolic" 
                  stroke="#ef4444" 
                  strokeWidth={2} 
                  dot={{ r: 4 }} 
                  name="Systolic"
                />
                <Line 
                  type="monotone" 
                  dataKey="diastolic" 
                  stroke="#3b82f6" 
                  strokeWidth={2} 
                  dot={{ r: 4 }} 
                  name="Diastolic"
                />
              </>
            ) : (
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="#3b82f6" 
                strokeWidth={2} 
                dot={{ r: 4 }} 
                name={metric.charAt(0).toUpperCase() + metric.slice(1).replace(/([A-Z])/g, ' $1')}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { 
            title: 'Latest BP', 
            value: data.data?.[0]?.bloodPressure ? 
              `${data.data[0].bloodPressure.systolic}/${data.data[0].bloodPressure.diastolic}` : 
              'N/A', 
            unit: 'mmHg', 
            color: 'text-red-600 dark:text-red-400' 
          },
          { 
            title: 'Heart Rate', 
            value: data.data?.[0]?.heartRate || 'N/A', 
            unit: 'BPM', 
            color: 'text-purple-600 dark:text-purple-400' 
          },
          { 
            title: 'Oxygen', 
            value: data.data?.[0]?.oxygenSaturation || 'N/A', 
            unit: '%', 
            color: 'text-blue-600 dark:text-blue-400' 
          },
          { 
            title: 'Weight', 
            value: data.data?.[0]?.weight || 'N/A', 
            unit: 'kg', 
            color: 'text-green-600 dark:text-green-400' 
          }
        ].map((stat, i) => (
          <div 
            key={i} 
            className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg text-center border border-slate-200 dark:border-slate-700"
          >
            <p className="text-slate-500 dark:text-slate-400 text-xs mb-1">{stat.title}</p>
            <p className={`text-lg font-semibold ${stat.color}`}>
              {stat.value} <span className="text-xs font-normal">{stat.unit}</span>
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
