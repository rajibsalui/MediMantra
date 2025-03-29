"use client";

import { Calendar, Clock } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function UpcomingAppointments() {
  // Sample data - would come from API in real app
  const appointments = [
    {
      id: 1,
      doctor: "Dr. Johnson",
      specialty: "Cardiologist",
      date: "2023-08-15",
      time: "10:30 AM",
      purpose: "Follow-up checkup",
      location: "Heart Care Center, Building A",
      status: "confirmed"
    },
    {
      id: 2,
      doctor: "Dr. Williams",
      specialty: "Endocrinologist",
      date: "2023-08-23",
      time: "2:15 PM",
      purpose: "Diabetes management",
      location: "Medical Center, Suite 305",
      status: "pending"
    }
  ];
  
  function getStatusBadge(status) {
    switch(status) {
      case "confirmed":
        return <Badge className="bg-green-100 text-green-800">Confirmed</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case "cancelled":
        return <Badge className="bg-red-100 text-red-800">Cancelled</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">Unknown</Badge>;
    }
  }
  
  function formatAppointmentDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  }

  return (
    <Card className="bg-white shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl text-gray-800">Upcoming Appointments</CardTitle>
      </CardHeader>
      <CardContent>
        {appointments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No upcoming appointments</p>
            <button className="btn btn-primary btn-sm mt-2 bg-blue-600 hover:bg-blue-700 text-white border-none">Schedule New Appointment</button>
          </div>
        ) : (
          <div className="space-y-4">
            {appointments.map((appointment) => (
              <div key={appointment.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-gray-800">{appointment.doctor}</h3>
                    <p className="text-sm text-gray-500">{appointment.specialty}</p>
                  </div>
                  {getStatusBadge(appointment.status)}
                </div>
                
                <div className="mt-3 space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar size={16} className="text-blue-600" />
                    <span className="text-gray-700">{formatAppointmentDate(appointment.date)}</span>
                    <Clock size={16} className="text-blue-600 ml-2" />
                    <span className="text-gray-700">{appointment.time}</span>
                  </div>
                  <p className="text-sm"><span className="text-gray-500">Purpose:</span> <span className="text-gray-700">{appointment.purpose}</span></p>
                  <p className="text-sm"><span className="text-gray-500">Location:</span> <span className="text-gray-700">{appointment.location}</span></p>
                </div>
                
                <div className="flex gap-2 mt-3">
                  <button className="btn btn-sm border-gray-300 text-gray-700 hover:bg-gray-100">Reschedule</button>
                  <button className="btn btn-sm btn-ghost text-red-600 hover:bg-red-50">Cancel</button>
                </div>
              </div>
            ))}
            
            <button className="btn w-full border-blue-600 text-blue-600 hover:bg-blue-50 hover:text-blue-700">Schedule New Appointment</button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
