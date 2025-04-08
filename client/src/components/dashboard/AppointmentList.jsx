"use client";

import { Button } from "@/components/ui/button";
import { formatDate, formatTime } from "@/lib/utils";
import { Calendar, Clock, User, MapPin, Video } from "lucide-react";
import Link from "next/link";

export default function AppointmentList({ appointments = [], emptyMessage = "No appointments found" }) {
  if (!appointments || appointments.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-slate-500 dark:text-slate-400">{emptyMessage}</p>
        <Link href="/patient/appointments/book">
          <Button className="mt-4 bg-blue-600 hover:bg-blue-700 text-white">
            Book Appointment
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {appointments.map((appointment) => (
        <div 
          key={appointment._id} 
          className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 hover:shadow-md transition-shadow"
        >
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-medium text-slate-900 dark:text-white">
                Dr. {appointment.doctor?.user?.firstName} {appointment.doctor?.user?.lastName}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {appointment.doctor?.specialties?.[0] || "Specialist"}
              </p>
            </div>
            
            <div className="px-2 py-1 text-xs rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
              {appointment.appointmentType === "video" ? "Video Call" : "In-person"}
            </div>
          </div>
          
          <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center text-slate-600 dark:text-slate-300">
              <Calendar className="h-4 w-4 mr-2 text-slate-400 dark:text-slate-500" />
              {formatDate(appointment.appointmentDate)}
            </div>
            
            <div className="flex items-center text-slate-600 dark:text-slate-300">
              <Clock className="h-4 w-4 mr-2 text-slate-400 dark:text-slate-500" />
              {formatTime(appointment.appointmentTime)}
            </div>
            
            {appointment.appointmentType === "in-person" ? (
              <div className="flex items-center text-slate-600 dark:text-slate-300 col-span-2">
                <MapPin className="h-4 w-4 mr-2 text-slate-400 dark:text-slate-500" />
                {appointment.location || "Hospital Address"}
              </div>
            ) : (
              <div className="flex items-center text-slate-600 dark:text-slate-300 col-span-2">
                <Video className="h-4 w-4 mr-2 text-slate-400 dark:text-slate-500" />
                Video consultation link will be sent before appointment
              </div>
            )}
          </div>
          
          <div className="mt-4 flex justify-end space-x-2">
            <Link href={`/patient/appointments/${appointment._id}`}>
              <Button variant="outline" size="sm">
                View Details
              </Button>
            </Link>
          </div>
        </div>
      ))}
      
      <Link href="/patient/appointments" className="block">
        <Button variant="outline" className="w-full mt-2">
          View All Appointments
        </Button>
      </Link>
    </div>
  );
}
