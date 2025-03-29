"use client";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { SearchIcon } from "lucide-react";
import DoctorList from "@/components/doctors/DoctorList";
import { BackgroundBeams } from "@/components/ui/background-beams";
import { SparklesCore } from "@/components/ui/sparkles";

// Enhanced doctor data imported from data.js
const doctorsData = [
  {
    id: "1",
    name: "Dr. Sarah Johnson",
    specialty: "Cardiologist",
    experience: "15+ years",
    hospital: "Downtown Medical Center",
    image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=2070&auto=format&fit=crop",
    qualification: "MD, Harvard Medical School",
    bio: "Dr. Johnson is a board-certified cardiologist specializing in preventive cardiology and heart disease management.",
    schedule: "Mon, Tue, Wed, Fri: 9:00 AM - 5:00 PM",
    ratings: 4.9,
    reviews: 124,
    nextAvailable: "Today",
    price: 150,
  },
  {
    id: "2",
    name: "Dr. James Chen",
    specialty: "Dermatologist",
    experience: "10+ years",
    hospital: "Westside Skin Clinic",
    image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=2070&auto=format&fit=crop",
    qualification: "MD, Johns Hopkins School of Medicine",
    bio: "Dr. Chen specializes in medical dermatology, cosmetic procedures, and skin cancer treatment.",
    schedule: "Mon, Wed, Thu, Fri: 9:00 AM - 5:00 PM",
    ratings: 4.8,
    reviews: 97,
    nextAvailable: "Tomorrow",
    price: 175,
  },
  {
    id: "3",
    name: "Dr. Amara Patel",
    specialty: "Neurologist",
    experience: "12+ years",
    hospital: "Neurology Partners Medical Group",
    image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?q=80&w=2070&auto=format&fit=crop",
    qualification: "MD, Stanford University Medical Center",
    bio: "Dr. Patel is an expert in treating neurological disorders including migraines, epilepsy, and movement disorders.",
    schedule: "Tue, Wed, Thu, Sat: 9:00 AM - 5:00 PM",
    ratings: 4.7,
    reviews: 112,
    nextAvailable: "Today",
    price: 200,
  },
  {
    id: "4",
    name: "Dr. Michael Rodriguez",
    specialty: "Orthopedic Surgeon",
    experience: "20+ years",
    hospital: "Advanced Orthopedic Center",
    image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=2070&auto=format&fit=crop",
    qualification: "MD, Columbia University College of Physicians",
    bio: "Dr. Rodriguez specializes in sports medicine and minimally invasive joint replacement surgery.",
    schedule: "Mon, Tue, Thu, Fri: 9:00 AM - 5:00 PM",
    ratings: 4.9,
    reviews: 156,
    nextAvailable: "Next week",
    price: 225,
  },
  {
    id: "5",
    name: "Dr. Emily Washington",
    specialty: "Pediatrician",
    experience: "8+ years",
    hospital: "Children's Wellness Center",
    image: "https://images.unsplash.com/photo-1551601651-2a8555f1a136?q=80&w=2070&auto=format&fit=crop",
    qualification: "MD, Yale School of Medicine",
    bio: "Dr. Washington provides comprehensive healthcare for children from birth through adolescence with a focus on developmental pediatrics.",
    schedule: "Mon, Wed, Thu, Fri, Sat: 8:00 AM - 4:00 PM",
    ratings: 4.9,
    reviews: 203,
    nextAvailable: "Today",
    price: 135,
  },
  {
    id: "6",
    name: "Dr. Robert Kim",
    specialty: "Psychiatrist",
    experience: "14+ years",
    hospital: "Mindful Psychiatry Associates",
    image: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?q=80&w=2070&auto=format&fit=crop",
    qualification: "MD, NYU School of Medicine",
    bio: "Dr. Kim specializes in mood disorders, anxiety, and ADHD management with a holistic approach to mental health.",
    schedule: "Tue, Wed, Fri: 10:00 AM - 6:00 PM",
    ratings: 4.6,
    reviews: 78,
    nextAvailable: "3 days",
    price: 190,
  },
  {
    id: "7",
    name: "Dr. Olivia Thompson",
    specialty: "Endocrinologist",
    experience: "11+ years",
    hospital: "Metabolic & Hormone Specialists",
    image: "https://images.unsplash.com/photo-1584516297938-039c5beefb5d?q=80&w=2070&auto=format&fit=crop",
    qualification: "MD, Mayo Clinic School of Medicine",
    bio: "Dr. Thompson treats hormonal imbalances and metabolic disorders with particular expertise in diabetes management and thyroid conditions.",
    schedule: "Mon, Thu, Fri, Sat: 9:00 AM - 5:00 PM",
    ratings: 4.8,
    reviews: 92,
    nextAvailable: "Tomorrow",
    price: 165,
  },
  {
    id: "8",
    name: "Dr. Marcus Johnson",
    specialty: "Ophthalmologist",
    experience: "16+ years",
    hospital: "Clear Vision Eye Center",
    image: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?q=80&w=2070&auto=format&fit=crop",
    qualification: "MD, Baylor College of Medicine",
    bio: "Dr. Johnson provides comprehensive eye care including LASIK surgery, cataract treatment, and glaucoma management.",
    schedule: "Mon, Tue, Wed, Fri: 9:00 AM - 5:00 PM",
    ratings: 4.7,
    reviews: 114,
    nextAvailable: "2 days",
    price: 180,
  },
  {
    id: "9",
    name: "Dr. Sophia Martinez",
    specialty: "OB/GYN",
    experience: "13+ years",
    hospital: "Women's Wellness Pavilion",
    image: "https://images.unsplash.com/photo-1651008376811-b90baee60c1f?q=80&w=2070&auto=format&fit=crop",
    qualification: "MD, UCLA School of Medicine",
    bio: "Dr. Martinez provides comprehensive women's health services including prenatal care, gynecological exams, and minimally invasive surgeries.",
    schedule: "Tue, Wed, Thu, Sat: 9:00 AM - 5:00 PM",
    ratings: 4.9,
    reviews: 187,
    nextAvailable: "Today",
    price: 160,
  },
  {
    id: "10",
    name: "Dr. David Wilson",
    specialty: "Gastroenterologist",
    experience: "18+ years",
    hospital: "Digestive Health Institute",
    image: "https://images.unsplash.com/photo-1612531385446-f7e6d131e1d0?q=80&w=2070&auto=format&fit=crop",
    qualification: "MD, University of Pennsylvania School of Medicine",
    bio: "Dr. Wilson specializes in digestive health, including treatment of IBS, GERD, and inflammatory bowel diseases.",
    schedule: "Mon, Wed, Thu, Fri: 9:00 AM - 5:00 PM",
    ratings: 4.8,
    reviews: 105,
    nextAvailable: "Tomorrow",
    price: 195,
  },
];

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
