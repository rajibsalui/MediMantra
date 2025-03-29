"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  Clock, 
  MapPin, 
  Award, 
  Calendar, 
  Star, 
  Phone, 
  Mail, 
  Globe, 
  CheckCircle, 
  MessageCircle,
  Clock8,
  Stethoscope,
  Languages,
  Users,
  BookOpen
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";


// Enhanced doctor data with complete fields for all doctors
const doctorsData = [
    {
      id: "1",
      name: "Dr. Sarah Johnson",
      specialty: "Cardiologist",
      experience: "15+ years",
      hospital: "Downtown Medical Center",
      image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=2070&auto=format&fit=crop",
      qualification: "MD, Harvard Medical School",
      bio: "Dr. Johnson is a board-certified cardiologist specializing in preventive cardiology and heart disease management with over 15 years of experience helping patients improve their cardiovascular health.",
      schedule: "Mon, Tue, Wed, Fri: 9:00 AM - 5:00 PM",
      ratings: 4.9,
      address: "123 Medical Plaza Dr, Suite 300, Metropolis, CA 90001",
      website: "heartcaremetropolis.com",
      services: [
        "Cardiovascular Risk Assessment",
        "Echocardiography",
        "ECG/EKG Testing",
        "Stress Testing",
        "Cardiac Rehabilitation",
        "Preventive Cardiology"
      ],
      languages: ["English", "Spanish", "French"],
      certifications: [
        "American Board of Internal Medicine",
        "American College of Cardiology"
      ],
      education: [
        { degree: "MD in Cardiovascular Medicine", institution: "Harvard Medical School", year: "2005-2009" },
        { degree: "Residency in Internal Medicine", institution: "Massachusetts General Hospital", year: "2009-2012" },
        { degree: "Fellowship in Cardiology", institution: "Stanford Medical Center", year: "2012-2015" }
      ],
      insurance: ["Blue Cross Blue Shield", "Aetna", "UnitedHealthcare", "Medicare", "Cigna"],
      reviews: [
        { id: "r1", name: "James Wilson", rating: 5, comment: "Dr. Johnson is extremely thorough and takes time to explain everything." },
        { id: "r2", name: "Maria Garcia", rating: 5, comment: "Amazing doctor! Dr. Johnson discovered a heart condition other doctors missed for years." },
        { id: "r3", name: "Robert Chen", rating: 4, comment: "Very knowledgeable and professional. Sometimes the wait time can be long." },
        { id: "r4", name: "Sarah Thompson", rating: 5, comment: "Dr. Johnson has been my cardiologist for 5+ years. Always compassionate and up-to-date." }
      ],
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
      bio: "Dr. Chen specializes in medical dermatology, cosmetic procedures, and skin cancer treatment with a focus on minimally invasive techniques and personalized treatment plans.",
      schedule: "Mon, Wed, Thu, Fri: 9:00 AM - 5:00 PM",
      ratings: 4.8,
      address: "456 Dermatology Way, Suite 200, Westside, CA 90210",
      website: "westsidedermatology.com",
      services: ["Medical Dermatology", "Cosmetic Procedures", "Skin Cancer Treatment", "Acne Management"],
      languages: ["English", "Mandarin", "Cantonese"],
      certifications: ["American Board of Dermatology"],
      education: [
        { degree: "MD", institution: "Johns Hopkins School of Medicine", year: "2010-2014" },
        { degree: "Residency in Dermatology", institution: "University of California San Francisco", year: "2014-2017" },
        { degree: "Fellowship in Cosmetic Dermatology", institution: "New York University", year: "2017-2018" }
      ],
      insurance: ["Blue Cross Blue Shield", "Cigna", "Aetna"],
      reviews: [
        { id: "r1", name: "Lisa Johnson", rating: 5, comment: "Dr. Chen completely cleared my persistent acne when other treatments failed." },
        { id: "r2", name: "Michael Wong", rating: 5, comment: "Excellent bedside manner and very knowledgeable about the latest skin treatments." },
        { id: "r3", name: "Jennifer Smith", rating: 4, comment: "Professional and thorough. The wait time can be long, but worth it." }
      ],
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
      bio: "Dr. Patel is an expert in treating neurological disorders including migraines, epilepsy, and movement disorders. She employs the latest diagnostic technologies and treatment approaches to provide comprehensive care.",
      schedule: "Tue, Wed, Thu, Sat: 9:00 AM - 5:00 PM",
      ratings: 4.7,
      address: "789 Neurology Blvd, Suite 400, Metropolis, CA 90002",
      website: "metropolisneurology.com",
      services: [
        "Neurological Evaluations",
        "EMG/Nerve Conduction Studies",
        "EEG Testing",
        "Headache Management",
        "Movement Disorder Treatment",
        "Epilepsy Management"
      ],
      languages: ["English", "Hindi", "Gujarati"],
      certifications: [
        "American Board of Psychiatry and Neurology",
        "American Academy of Neurology"
      ],
      education: [
        { degree: "MD", institution: "Stanford University Medical Center", year: "2007-2011" },
        { degree: "Residency in Neurology", institution: "UCSF Medical Center", year: "2011-2014" },
        { degree: "Fellowship in Epilepsy", institution: "Cleveland Clinic", year: "2014-2016" }
      ],
      insurance: ["Blue Cross Blue Shield", "UnitedHealthcare", "Medicare", "Kaiser Permanente"],
      reviews: [
        { id: "r1", name: "David Rosen", rating: 5, comment: "Dr. Patel is incredible! She finally diagnosed my condition after years of uncertainty." },
        { id: "r2", name: "Sophia Lee", rating: 4, comment: "Very thorough and explains everything clearly. The office can be busy though." },
        { id: "r3", name: "James Rodriguez", rating: 5, comment: "Amazing neurologist who truly listens to patients. She's been managing my epilepsy for years." },
        { id: "r4", name: "Emma Clark", rating: 5, comment: "Dr. Patel takes her time and doesn't rush appointments. Highly recommended." }
      ],
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
      bio: "Dr. Rodriguez specializes in sports medicine and minimally invasive joint replacement surgery. With over two decades of experience, he has helped thousands of patients return to active, pain-free lives.",
      schedule: "Mon, Tue, Thu, Fri: 9:00 AM - 5:00 PM",
      ratings: 4.9,
      address: "1010 Ortho Circle, Suite 500, Metropolis, CA 90003",
      website: "advancedortho.org",
      services: [
        "Joint Replacement Surgery",
        "Sports Medicine",
        "Arthroscopic Surgery",
        "Fracture Care",
        "Orthopedic Trauma",
        "Rehabilitation Services"
      ],
      languages: ["English", "Spanish"],
      certifications: [
        "American Board of Orthopedic Surgery",
        "American Academy of Orthopedic Surgeons"
      ],
      education: [
        { degree: "MD", institution: "Columbia University College of Physicians", year: "1998-2002" },
        { degree: "Residency in Orthopedic Surgery", institution: "Hospital for Special Surgery", year: "2002-2007" },
        { degree: "Fellowship in Sports Medicine", institution: "Andrews Institute", year: "2007-2008" }
      ],
      insurance: ["Blue Cross Blue Shield", "Aetna", "UnitedHealthcare", "Medicare", "Cigna", "Humana"],
      reviews: [
        { id: "r1", name: "Thomas Miller", rating: 5, comment: "Dr. Rodriguez performed my knee replacement. I'm back to hiking pain-free!" },
        { id: "r2", name: "Patricia Johnson", rating: 5, comment: "Outstanding surgeon with excellent bedside manner. Very trustworthy." },
        { id: "r3", name: "Robert Williams", rating: 4, comment: "Knowledgeable doctor who explains procedures in detail. Highly recommended." },
        { id: "r4", name: "Karen Davis", rating: 5, comment: "Dr. Rodriguez fixed my shoulder after two other surgeons said it couldn't be done." }
      ],
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
      bio: "Dr. Washington provides comprehensive healthcare for children from birth through adolescence with a focus on developmental pediatrics and preventive care. She believes in partnering with parents to ensure optimal health for every child.",
      schedule: "Mon, Wed, Thu, Fri, Sat: 8:00 AM - 4:00 PM",
      ratings: 4.9,
      address: "555 Children's Way, Metropolis, CA 90004",
      website: "childrenswellnesscenter.com",
      services: [
        "Well-Child Visits",
        "Vaccinations",
        "Development Screening",
        "Acute Care",
        "Behavioral Health",
        "Adolescent Medicine"
      ],
      languages: ["English", "French"],
      certifications: [
        "American Board of Pediatrics",
        "Fellow of the American Academy of Pediatrics"
      ],
      education: [
        { degree: "MD", institution: "Yale School of Medicine", year: "2011-2015" },
        { degree: "Residency in Pediatrics", institution: "Boston Children's Hospital", year: "2015-2018" },
        { degree: "Fellowship in Developmental Pediatrics", institution: "Cincinnati Children's Hospital", year: "2018-2020" }
      ],
      insurance: ["Blue Cross Blue Shield", "Aetna", "UnitedHealthcare", "Tricare", "Medicaid", "CHIP"],
      reviews: [
        { id: "r1", name: "Jennifer Adams", rating: 5, comment: "Dr. Washington is amazing with my twins! Patient, kind, and thorough." },
        { id: "r2", name: "Michael Smith", rating: 5, comment: "Best pediatrician we've ever had. She makes my shy daughter feel comfortable." },
        { id: "r3", name: "Sarah Johnson", rating: 5, comment: "Dr. Washington takes time to answer all our questions and never rushes." },
        { id: "r4", name: "David Lee", rating: 4, comment: "Great doctor who truly cares about her patients. The wait can be long sometimes." }
      ],
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
      bio: "Dr. Kim specializes in mood disorders, anxiety, and ADHD management with a holistic approach to mental health. He combines medication management with therapeutic techniques to provide comprehensive psychiatric care.",
      schedule: "Tue, Wed, Fri: 10:00 AM - 6:00 PM",
      ratings: 4.6,
      address: "888 Wellness Blvd, Suite 300, Metropolis, CA 90005",
      website: "mindfulpsychiatry.health",
      services: [
        "Psychiatric Evaluation",
        "Medication Management",
        "Psychotherapy",
        "ADHD Assessment",
        "Anxiety Treatment",
        "Depression Management"
      ],
      languages: ["English", "Korean"],
      certifications: [
        "American Board of Psychiatry and Neurology",
        "American Psychiatric Association"
      ],
      education: [
        { degree: "MD", institution: "NYU School of Medicine", year: "2004-2008" },
        { degree: "Residency in Psychiatry", institution: "Columbia University Medical Center", year: "2008-2012" },
        { degree: "Fellowship in Psychopharmacology", institution: "Massachusetts General Hospital", year: "2012-2013" }
      ],
      insurance: ["Blue Cross Blue Shield", "Aetna", "UnitedHealthcare", "Medicare", "Optum"],
      reviews: [
        { id: "r1", name: "Rebecca Martinez", rating: 5, comment: "Dr. Kim is compassionate and non-judgmental. He's helped me tremendously." },
        { id: "r2", name: "Jason Taylor", rating: 4, comment: "Very knowledgeable doctor who takes a balanced approach to medication." },
        { id: "r3", name: "Emily Chen", rating: 5, comment: "Dr. Kim listens actively and creates personalized treatment plans. Highly recommend!" }
      ],
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
      bio: "Dr. Thompson treats hormonal imbalances and metabolic disorders with particular expertise in diabetes management and thyroid conditions. She emphasizes patient education and lifestyle modifications alongside medical interventions.",
      schedule: "Mon, Thu, Fri, Sat: 9:00 AM - 5:00 PM",
      ratings: 4.8,
      address: "777 Endocrine Drive, Suite 100, Metropolis, CA 90006",
      website: "metabolicspecialists.com",
      services: [
        "Diabetes Management",
        "Thyroid Disorders",
        "Hormone Replacement Therapy",
        "Adrenal Disorders",
        "Osteoporosis Treatment",
        "Weight Management"
      ],
      languages: ["English", "Portuguese"],
      certifications: [
        "American Board of Internal Medicine",
        "American Association of Clinical Endocrinologists"
      ],
      education: [
        { degree: "MD", institution: "Mayo Clinic School of Medicine", year: "2007-2011" },
        { degree: "Residency in Internal Medicine", institution: "Johns Hopkins Hospital", year: "2011-2014" },
        { degree: "Fellowship in Endocrinology", institution: "UCSF Medical Center", year: "2014-2016" }
      ],
      insurance: ["Blue Cross Blue Shield", "Aetna", "UnitedHealthcare", "Medicare", "Cigna"],
      reviews: [
        { id: "r1", name: "Daniel Garcia", rating: 5, comment: "Dr. Thompson has helped me manage my diabetes better than any doctor I've seen." },
        { id: "r2", name: "Sarah Miller", rating: 4, comment: "Very thorough and explains complex hormonal issues in understandable terms." },
        { id: "r3", name: "John Wilson", rating: 5, comment: "Finally got my thyroid issues under control thanks to Dr. Thompson!" }
      ],
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
      bio: "Dr. Johnson provides comprehensive eye care including LASIK surgery, cataract treatment, and glaucoma management. His surgical precision and investment in cutting-edge technology ensure optimal outcomes for his patients.",
      schedule: "Mon, Tue, Wed, Fri: 9:00 AM - 5:00 PM",
      ratings: 4.7,
      address: "2020 Vision Street, Suite 400, Metropolis, CA 90007",
      website: "clearvisioneye.com",
      services: [
        "Comprehensive Eye Exams",
        "LASIK Surgery",
        "Cataract Surgery",
        "Glaucoma Treatment",
        "Corneal Disorders",
        "Diabetic Eye Care"
      ],
      languages: ["English", "Spanish"],
      certifications: [
        "American Board of Ophthalmology",
        "American Academy of Ophthalmology"
      ],
      education: [
        { degree: "MD", institution: "Baylor College of Medicine", year: "2002-2006" },
        { degree: "Residency in Ophthalmology", institution: "Wills Eye Hospital", year: "2006-2010" },
        { degree: "Fellowship in Cornea and Refractive Surgery", institution: "Bascom Palmer Eye Institute", year: "2010-2011" }
      ],
      insurance: ["Blue Cross Blue Shield", "VSP", "EyeMed", "Medicare", "Aetna", "UnitedHealthcare"],
      reviews: [
        { id: "r1", name: "Laura Chen", rating: 5, comment: "Dr. Johnson performed my LASIK surgery and I couldn't be happier with the results!" },
        { id: "r2", name: "Robert Davis", rating: 4, comment: "Very professional and knowledgeable. The office staff is friendly too." },
        { id: "r3", name: "Michelle Wong", rating: 5, comment: "Dr. Johnson diagnosed my rare eye condition when two other doctors missed it." }
      ],
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
      bio: "Dr. Martinez provides comprehensive women's health services including prenatal care, gynecological exams, and minimally invasive surgeries. She is committed to empowering women through personalized healthcare and education.",
      schedule: "Tue, Wed, Thu, Sat: 9:00 AM - 5:00 PM",
      ratings: 4.9,
      address: "1212 Women's Health Way, Metropolis, CA 90008",
      website: "womenswellnesspavillion.com",
      services: [
        "Prenatal Care",
        "Well-Woman Exams",
        "Gynecological Surgery",
        "Family Planning",
        "Menopause Management",
        "High-Risk Pregnancy Care"
      ],
      languages: ["English", "Spanish", "Italian"],
      certifications: [
        "American Board of Obstetrics and Gynecology",
        "Fellow of the American College of Obstetricians and Gynecologists"
      ],
      education: [
        { degree: "MD", institution: "UCLA School of Medicine", year: "2005-2009" },
        { degree: "Residency in OB/GYN", institution: "Cedars-Sinai Medical Center", year: "2009-2013" },
        { degree: "Fellowship in Minimally Invasive Gynecologic Surgery", institution: "Mayo Clinic", year: "2013-2015" }
      ],
      insurance: ["Blue Cross Blue Shield", "Aetna", "UnitedHealthcare", "Medicare", "Cigna", "Kaiser Permanente"],
      reviews: [
        { id: "r1", name: "Jessica Wilson", rating: 5, comment: "Dr. Martinez delivered both my children. She's amazing and so supportive!" },
        { id: "r2", name: "Amanda Garcia", rating: 5, comment: "The best OB/GYN I've ever had. She takes time to listen and explain everything." },
        { id: "r3", name: "Rachel Smith", rating: 5, comment: "Dr. Martinez performed my surgery with minimal scarring and quick recovery." },
        { id: "r4", name: "Tiffany Johnson", rating: 4, comment: "Very knowledgeable and compassionate doctor. Sometimes runs behind schedule." }
      ],
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
      bio: "Dr. Wilson specializes in digestive health, including treatment of IBS, GERD, and inflammatory bowel diseases. He is known for his patient-centered approach and expertise in advanced endoscopic procedures.",
      schedule: "Mon, Wed, Thu, Fri: 9:00 AM - 5:00 PM",
      ratings: 4.8,
      address: "505 Digestive Drive, Suite 200, Metropolis, CA 90009",
      website: "digestivehealthinstitute.com",
      services: [
        "Colonoscopy",
        "Upper Endoscopy",
        "GERD Management",
        "IBS Treatment",
        "Inflammatory Bowel Disease Care",
        "Liver Disease Management"
      ],
      languages: ["English", "German"],
      certifications: [
        "American Board of Internal Medicine",
        "American College of Gastroenterology"
      ],
      education: [
        { degree: "MD", institution: "University of Pennsylvania School of Medicine", year: "2000-2004" },
        { degree: "Residency in Internal Medicine", institution: "Massachusetts General Hospital", year: "2004-2007" },
        { degree: "Fellowship in Gastroenterology", institution: "Mayo Clinic", year: "2007-2010" }
      ],
      insurance: ["Blue Cross Blue Shield", "Aetna", "UnitedHealthcare", "Medicare", "Cigna", "Humana"],
      reviews: [
        { id: "r1", name: "Steven Clark", rating: 5, comment: "Dr. Wilson diagnosed my celiac disease after years of suffering. Life-changing!" },
        { id: "r2", name: "Katherine Rodriguez", rating: 4, comment: "Very thorough and explains procedures clearly. Makes you feel at ease." },
        { id: "r3", name: "William Johnson", rating: 5, comment: "Dr. Wilson's treatment plan for my Crohn's disease has been extremely effective." },
        { id: "r4", name: "Elizabeth Thompson", rating: 5, comment: "Excellent doctor who spends time with patients and answers all questions." }
      ],
      nextAvailable: "Tomorrow",
      price: 195,
    }
];

export default function DoctorDetail({ params }) {
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  
  useEffect(() => {
    const id = typeof params === 'object' ? params.id : null;
    if (id) {
      const foundDoctor = doctorsData.find(doc => doc.id === id);
      setDoctor(foundDoctor);
    }
    setLoading(false);
  }, [params]);

  const getTimeSlots = (day) => {
    const slots = [
      "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM", 
      "11:00 AM", "11:30 AM", "1:00 PM", "1:30 PM",
      "2:00 PM", "2:30 PM", "3:00 PM", "3:30 PM", "4:00 PM"
    ];
    return slots.map(slot => ({
      time: slot,
      available: Math.random() > 0.3
    }));
  };

  const getNextDays = () => {
    const days = [];
    const today = new Date();
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      days.push({
        date: date,
        dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
        dayNumber: date.getDate(),
        month: date.toLocaleDateString('en-US', { month: 'short' }),
        timeSlots: getTimeSlots(i)
      });
    }
    return days;
  };

  const availableDays = getNextDays();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gray-50">
        <h1 className="text-3xl font-bold mb-4 text-gray-900">Doctor Not Found</h1>
        <p className="mb-8 text-gray-600">The doctor you're looking for doesn't exist or has been removed.</p>
        <Link href="/doctors">
          <Button variant="outline">Back to Doctors</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="relative bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Link href="/doctors" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6">
            <ArrowLeft size={18} className="mr-2" />
            Back to Doctors
          </Link>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-white rounded-xl overflow-hidden shadow-md"
              >
                <div className="relative h-64 w-full">
                  <Image 
                    src={doctor.image} 
                    alt={doctor.name}
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <Badge className="bg-blue-100 text-blue-800 border-none">
                      {doctor.specialty}
                    </Badge>
                    <span className="text-sm font-medium text-emerald-600 flex items-center">
                      <Clock size={14} className="mr-1" />
                      {doctor.nextAvailable}
                    </span>
                  </div>
                  
                  <h1 className="text-2xl font-bold text-gray-800 mb-2">{doctor.name}</h1>
                  
                  <div className="flex items-center mb-4">
                    <div className="flex text-yellow-400 mr-2">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={16}
                          className={`${
                            i < Math.floor(doctor.ratings) ? "fill-yellow-400" : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600">
                      {doctor.ratings} ({doctor.reviews?.length || 0} reviews)
                    </span>
                  </div>
                  
                  <Separator className="my-4" />
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center text-gray-700">
                      <Award className="h-5 w-5 mr-3 text-blue-600" />
                      <span>{doctor.qualification}</span>
                    </div>
                    
                    <div className="flex items-center text-gray-700">
                      <Clock className="h-5 w-5 mr-3 text-blue-600" />
                      <span>{doctor.experience} experience</span>
                    </div>
                    
                    <div className="flex items-center text-gray-700">
                      <MapPin className="h-5 w-5 mr-3 text-blue-600" />
                      <span>{doctor.hospital}</span>
                    </div>
                    
                    {doctor.website && (
                      <div className="flex items-center text-gray-700">
                        <Globe className="h-5 w-5 mr-3 text-blue-600" />
                        <a href={`https://${doctor.website}`} className="text-blue-600 hover:underline">
                          {doctor.website}
                        </a>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center bg-gray-100 rounded-lg px-3 py-1.5">
                      <span className="font-semibold text-gray-800">${doctor.price}</span>
                      <span className="text-gray-500 ml-1">/ visit</span>
                    </div>
                    
                    <Button variant="outline" size="sm" className="border-blue-500 text-blue-600 hover:bg-blue-50">
                      <Phone size={16} className="mr-2" />
                      Contact
                    </Button>
                  </div>
                  
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                    Book Appointment
                  </Button>
                </div>
              </motion.div>
            </div>
            
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Tabs defaultValue="about" className="w-full">
                  <TabsList className="bg-white rounded-lg shadow-sm mb-6 w-full">
                    <TabsTrigger value="about" className="flex-1 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600">
                      About
                    </TabsTrigger>
                    <TabsTrigger value="schedule" className="flex-1 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600">
                      Schedule
                    </TabsTrigger>
                    <TabsTrigger value="education" className="flex-1 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600">
                      Education
                    </TabsTrigger>
                    <TabsTrigger value="reviews" className="flex-1 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600">
                      Reviews
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="about">
                    <Card>
                      <CardContent className="p-6">
                        <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                          <Stethoscope className="h-5 w-5 mr-2 text-blue-600" />
                          About Dr. {doctor.name.split(' ')[1]}
                        </h3>
                        
                        <p className="text-gray-700 mb-6 leading-relaxed">
                          {doctor.bio}
                        </p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                          <div className="bg-blue-50 rounded-lg p-5">
                            <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                              <MapPin className="h-4 w-4 mr-2 text-blue-600" />
                              Practice Location
                            </h4>
                            <p className="text-gray-700">{doctor.address || "Location information not available"}</p>
                          </div>
                          
                          <div className="bg-blue-50 rounded-lg p-5">
                            <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                              <Clock8 className="h-4 w-4 mr-2 text-blue-600" />
                              Working Hours
                            </h4>
                            <p className="text-gray-700">{doctor.schedule}</p>
                          </div>
                        </div>
                        
                        {doctor.services && doctor.services.length > 0 && (
                          <>
                            <h4 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
                              <CheckCircle className="h-5 w-5 mr-2 text-blue-600" />
                              Services
                            </h4>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 mb-8">
                              {doctor.services.map((service, index) => (
                                <div key={index} className="flex items-center">
                                  <div className="h-2 w-2 rounded-full bg-blue-600 mr-2" />
                                  <span className="text-gray-700">{service}</span>
                                </div>
                              ))}
                            </div>
                          </>
                        )}
                        
                        {doctor.languages && doctor.languages.length > 0 && (
                          <>
                            <h4 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
                              <Languages className="h-5 w-5 mr-2 text-blue-600" />
                              Languages
                            </h4>
                            
                            <div className="flex flex-wrap gap-2 mb-8">
                              {doctor.languages.map((language, index) => (
                                <Badge key={index} variant="secondary" className="bg-gray-100 text-gray-700 hover:bg-gray-200">
                                  {language}
                                </Badge>
                              ))}
                            </div>
                          </>
                        )}
                        
                        {doctor.certifications && doctor.certifications.length > 0 && (
                          <>
                            <h4 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
                              <Award className="h-5 w-5 mr-2 text-blue-600" />
                              Board Certifications
                            </h4>
                            
                            <div className="space-y-2">
                              {doctor.certifications.map((cert, index) => (
                                <div key={index} className="flex items-center">
                                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                                  <span className="text-gray-700">{cert}</span>
                                </div>
                              ))}
                            </div>
                          </>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  <TabsContent value="schedule">
                    <Card>
                      <CardContent className="p-6">
                        <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                          <Calendar className="h-5 w-5 mr-2 text-blue-600" />
                          Book an Appointment
                        </h3>
                        
                        <p className="text-gray-600 mb-6">
                          Select a date and time to schedule your appointment with Dr. {doctor.name.split(' ')[1]}
                        </p>
                        
                        <div className="mb-6">
                          <h4 className="text-gray-700 font-medium mb-3">Available Dates</h4>
                          <div className="flex overflow-x-auto horizontal-scroll pb-2 gap-2">
                            {availableDays.map((day, index) => (
                              <button
                                key={index}
                                onClick={() => setSelectedDate(index)}
                                className={`flex flex-col items-center min-w-[80px] p-3 rounded-lg border transition-colors ${
                                  selectedDate === index 
                                    ? 'border-blue-600 bg-blue-50 text-blue-600' 
                                    : 'border-gray-200 hover:border-blue-300'
                                }`}
                              >
                                <span className="text-sm font-medium">{day.dayName}</span>
                                <span className="text-lg font-semibold">{day.dayNumber}</span>
                                <span className="text-sm text-gray-500">{day.month}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                        
                        {selectedDate !== null && (
                          <div className="mb-6">
                            <h4 className="text-gray-700 font-medium mb-3">Available Time Slots</h4>
                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                              {availableDays[selectedDate].timeSlots.map((slot, index) => (
                                <button
                                  key={index}
                                  disabled={!slot.available}
                                  onClick={() => setSelectedTimeSlot(slot.available ? slot.time : null)}
                                  className={`py-2 px-1 rounded text-sm text-center transition-colors ${
                                    !slot.available 
                                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                      : selectedTimeSlot === slot.time
                                        ? 'bg-blue-600 text-white'
                                        : 'border border-gray-200 hover:border-blue-300 text-gray-700'
                                  }`}
                                >
                                  {slot.time}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {doctor.insurance && doctor.insurance.length > 0 && (
                          <div className="bg-blue-50 rounded-lg p-4 mb-6">
                            <h4 className="font-medium text-gray-800 mb-2">Insurance Accepted</h4>
                            <div className="flex flex-wrap gap-2">
                              {doctor.insurance.map((ins, index) => (
                                <Badge key={index} variant="outline" className="bg-white">
                                  {ins}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        <Button 
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white" 
                          disabled={!selectedTimeSlot}
                        >
                          Confirm Appointment
                          {selectedTimeSlot && selectedDate !== null && (
                            <span className="ml-1">
                              {` for ${availableDays[selectedDate].dayName}, ${availableDays[selectedDate].month} ${availableDays[selectedDate].dayNumber} at ${selectedTimeSlot}`}
                            </span>
                          )}
                        </Button>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  <TabsContent value="education">
                    <Card>
                      <CardContent className="p-6">
                        <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                          <BookOpen className="h-5 w-5 mr-2 text-blue-600" />
                          Education & Training
                        </h3>
                        
                        {doctor.education && doctor.education.length > 0 ? (
                          <div className="space-y-8">
                            {doctor.education.map((edu, index) => (
                              <div key={index} className="relative pl-8 pb-6">
                                <div className="absolute left-0 top-0 h-full w-0.5 bg-blue-100" />
                                <div className="absolute left-[-8px] top-1 h-4 w-4 rounded-full border-4 border-blue-600 bg-white" />
                                
                                <h4 className="text-lg font-medium text-gray-800 mb-1">{edu.degree}</h4>
                                <p className="text-gray-700 mb-1">{edu.institution}</p>
                                <p className="text-sm text-gray-500">{edu.year}</p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-500">Education information not available</p>
                        )}
                        
                        <Separator className="my-6" />
                        
                        <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                          <Award className="h-5 w-5 mr-2 text-blue-600" />
                          Professional Memberships
                        </h3>
                        
                        <ul className="list-disc pl-5 text-gray-700 space-y-2">
                          <li>American College of {doctor.specialty}s</li>
                          <li>American Medical Association</li>
                          <li>State Medical Society</li>
                        </ul>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  <TabsContent value="reviews">
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex justify-between items-center mb-6">
                          <h3 className="text-xl font-semibold text-gray-800 flex items-center">
                            <MessageCircle className="h-5 w-5 mr-2 text-blue-600" />
                            Patient Reviews ({doctor.reviews?.length || 0})
                          </h3>
                          
                          <div className="flex items-center">
                            <div className="flex text-yellow-400 mr-2">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  size={18}
                                  className={`${
                                    i < Math.floor(doctor.ratings) ? "fill-yellow-400" : ""
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="font-medium text-gray-800">{doctor.ratings}</span>
                          </div>
                        </div>
                        
                        <div className="h-[400px] overflow-y-auto pr-4 hide-scrollbar">
                          {doctor.reviews && doctor.reviews.length > 0 ? (
                            <div className="space-y-6">
                              {doctor.reviews.map((review) => (
                                <div key={review.id} className="bg-white rounded-lg border border-gray-100 p-4 shadow-sm">
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="font-medium text-gray-800">{review.name}</span>
                                    <div className="flex text-yellow-400">
                                      {[...Array(5)].map((_, i) => (
                                        <Star
                                          key={i}
                                          size={14}
                                          className={`${
                                            i < review.rating ? "fill-yellow-400" : "text-gray-200"
                                          }`}
                                        />
                                      ))}
                                    </div>
                                  </div>
                                  <p className="text-gray-600">{review.comment}</p>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="flex flex-col items-center justify-center h-full text-center">
                              <MessageCircle className="h-12 w-12 text-gray-300 mb-2" />
                              <p className="text-gray-500">No reviews yet</p>
                              <p className="text-gray-400 text-sm">Be the first to leave a review for Dr. {doctor.name.split(' ')[1]}</p>
                            </div>
                          )}
                        </div>
                        
                        <div className="mt-6 flex justify-center">
                          <Button variant="outline" className="border-blue-500 text-blue-600 hover:bg-blue-50">
                            Write a Review
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
