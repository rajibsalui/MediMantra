"use client";

import { useEffect, useState, use } from "react";
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
import { doctorsData } from "@/data/doctors";

export default function DoctorDetail({ params }) {
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  
  useEffect(() => {
    // Unwrap params using React.use()
    const unwrappedParams = typeof params === 'object' && params instanceof Promise ? use(params) : params;
    const id = unwrappedParams?.id;
    
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
