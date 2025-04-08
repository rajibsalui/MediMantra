"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { BarChart2, TrendingUp, CreditCard, Users } from "lucide-react";

// Sample data - in a real app, this would come from the API
const APPOINTMENT_DATA = [
  { month: "Jan", completed: 45, cancelled: 5, scheduled: 12 },
  { month: "Feb", completed: 50, cancelled: 8, scheduled: 15 },
  { month: "Mar", completed: 35, cancelled: 3, scheduled: 10 },
  { month: "Apr", completed: 55, cancelled: 7, scheduled: 18 },
  { month: "May", completed: 60, cancelled: 9, scheduled: 20 },
  { month: "Jun", completed: 48, cancelled: 6, scheduled: 14 },
];

const REVENUE_DATA = [
  { month: "Jan", amount: 45000 },
  { month: "Feb", amount: 52000 },
  { month: "Mar", amount: 38000 },
  { month: "Apr", amount: 61000 },
  { month: "May", amount: 67000 },
  { month: "Jun", amount: 58000 },
];

const PATIENT_DISTRIBUTION = [
  { name: "New", value: 35 },
  { name: "Returning", value: 65 },
];

const COLORS = ["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b"];

export default function AnalyticsDashboard({ dashboardStats }) {
  const [timeRange, setTimeRange] = useState("6m"); // 6 months default

  // Use real data if available, otherwise use sample data
  const appointmentData = dashboardStats?.appointmentsByMonth || APPOINTMENT_DATA;
  const revenueData = dashboardStats?.revenueByMonth || REVENUE_DATA;
  const patientDistribution = [
    { 
      name: "New", 
      value: dashboardStats?.newPatients || PATIENT_DISTRIBUTION[0].value 
    },
    { 
      name: "Returning", 
      value: dashboardStats?.returningPatients || PATIENT_DISTRIBUTION[1].value 
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold flex items-center">
          <BarChart2 className="w-5 h-5 mr-2 text-blue-500" />
          Analytics Dashboard
        </h2>
        <div className="flex space-x-2">
          <Button
            variant={timeRange === "1m" ? "default" : "outline"}
            size="sm"
            onClick={() => setTimeRange("1m")}
          >
            1M
          </Button>
          <Button
            variant={timeRange === "3m" ? "default" : "outline"}
            size="sm"
            onClick={() => setTimeRange("3m")}
          >
            3M
          </Button>
          <Button
            variant={timeRange === "6m" ? "default" : "outline"}
            size="sm"
            onClick={() => setTimeRange("6m")}
          >
            6M
          </Button>
          <Button
            variant={timeRange === "1y" ? "default" : "outline"}
            size="sm"
            onClick={() => setTimeRange("1y")}
          >
            1Y
          </Button>
        </div>
      </div>

      <Tabs defaultValue="appointments" className="w-full">
        <TabsList key="tabs-list" className="grid grid-cols-3 mb-4">
          <TabsTrigger value="appointments" className="flex items-center">
            <Users className="w-4 h-4 mr-2" />
            Appointments
          </TabsTrigger>
          <TabsTrigger value="revenue" className="flex items-center">
            <CreditCard className="w-4 h-4 mr-2" />
            Revenue
          </TabsTrigger>
          <TabsTrigger value="patients" className="flex items-center">
            <TrendingUp className="w-4 h-4 mr-2" />
            Patient Growth
          </TabsTrigger>
        </TabsList>

        <TabsContent value="appointments" className="mt-0">
          <Card className="p-4">
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={appointmentData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar
                    dataKey="completed"
                    name="Completed"
                    fill="#3b82f6"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="cancelled"
                    name="Cancelled"
                    fill="#ef4444"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="scheduled"
                    name="Scheduled"
                    fill="#10b981"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="revenue" className="mt-0">
          <Card className="p-4">
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={revenueData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => [`₹${value.toLocaleString()}`, "Revenue"]}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="amount"
                    name="Revenue"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="patients" className="mt-0">
          <Card className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col items-center justify-center">
                <h3 className="text-lg font-medium mb-4">Patient Distribution</h3>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={patientDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {patientDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value}%`, "Percentage"]} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="flex flex-col">
                <h3 className="text-lg font-medium mb-4">Patient Growth</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">New Patients</span>
                      <span className="text-sm font-medium">{dashboardStats?.newPatients || 35}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                      <div 
                        className="bg-blue-600 h-2.5 rounded-full" 
                        style={{ width: `${dashboardStats?.newPatients || 35}%` }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Returning Patients</span>
                      <span className="text-sm font-medium">{dashboardStats?.returningPatients || 65}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                      <div 
                        className="bg-purple-600 h-2.5 rounded-full" 
                        style={{ width: `${dashboardStats?.returningPatients || 65}%` }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Patient Satisfaction</span>
                      <span className="text-sm font-medium">{dashboardStats?.patientSatisfaction || 85}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                      <div 
                        className="bg-green-600 h-2.5 rounded-full" 
                        style={{ width: `${dashboardStats?.patientSatisfaction || 85}%` }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Appointment Completion Rate</span>
                      <span className="text-sm font-medium">{dashboardStats?.completionRate || 92}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                      <div 
                        className="bg-amber-600 h-2.5 rounded-full" 
                        style={{ width: `${dashboardStats?.completionRate || 92}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
