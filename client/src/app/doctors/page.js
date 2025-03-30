"use client";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { SearchIcon } from "lucide-react";
import DoctorList from "@/components/doctors/DoctorList";
import { BackgroundBeams } from "@/components/ui/background-beams";
import { SparklesCore } from "@/components/ui/sparkles";
import { doctorsData } from "@/data/doctors";

export default function DoctorsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [doctors, setDoctors] = useState([]);

  useEffect(() => {
    // In a real app, fetch doctors from an API
    setDoctors(doctorsData);
  }, []);

  const filteredDoctors = doctors.filter((doctor) => {
    return (
      doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.hospital.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="relative min-h-screen w-full bg-gray-50 antialiased">
      <BackgroundBeams className="opacity-20" />
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-16 relative">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-800 mb-6">
            Find the Right Doctor
          </h1>
          <div className="h-[40px] w-[400px] mx-auto">
            <SparklesCore
              background="transparent"
              minSize={0.4}
              maxSize={1}
              particleDensity={100}
              className="w-full h-full"
              particleColor="#3B82F6"
            />
          </div>
          <p className="text-xl text-gray-600 mt-4">
            Search from our network of qualified medical professionals
          </p>
        </div>

        <div className="relative max-w-md mx-auto mb-12">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <SearchIcon className="h-5 w-5 text-gray-500" />
          </div>
          <Input
            type="text"
            placeholder="Search by name, specialty, or hospital..."
            className="pl-10 bg-white text-gray-800 border-gray-300 focus:ring-blue-500 focus:border-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <DoctorList doctors={filteredDoctors} />
      </div>
    </div>
  );
}
