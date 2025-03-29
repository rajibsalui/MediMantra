"use client";

import { useRef, useEffect, useState } from "react";
import Image from "next/image";
import { format } from "date-fns";
import { gsap } from "gsap";
import { Search, CalendarDays, FileText, CalendarIcon, Clock, Star, MapPin, ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export default function Step1DoctorSelection({ 
  doctors, 
  specialties, 
  selectedDoctor,
  selectedDate,
  selectedTimeSlot,
  searchTerm,
  selectedSpecialty,
  onDoctorSelect, 
  onDateSelect,
  onTimeSlotSelect,
  onSearchChange,
  onSpecialtyChange,
  getAvailableTimeSlots,
  onNext
}) {
  const stepsRef = useRef(null);
  const doctorsRef = useRef(null);
  const [timeSlotDialogOpen, setTimeSlotDialogOpen] = useState(false);
  
  // Filter doctors based on search and specialty
  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch = doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecialty = selectedSpecialty === "" || 
                            doctor.specialty.toLowerCase() === selectedSpecialty.toLowerCase();
    return matchesSearch && matchesSpecialty;
  });
  
  // GSAP animations
  useEffect(() => {
    // Steps animation
    gsap.from(".step-item", {
      scrollTrigger: {
        trigger: stepsRef.current,
        start: "top 80%"
      },
      y: 30,
      stagger: 0.2,
      duration: 0.6
    });
    
    // Doctor cards animation
    gsap.from(".doctor-card", {
      scrollTrigger: {
        trigger: doctorsRef.current,
        start: "top 80%"
      },
      y: 40,
      stagger: 0.15,
      duration: 0.7
    });
  }, []);
  
  return (
    <div className="space-y-8">
      {/* Process explanation */}
      <div ref={stepsRef} className="grid md:grid-cols-3 gap-6 mb-8">
        {[
          { 
            icon: <Search className="h-6 w-6 text-blue-500" />, 
            title: "Find Your Doctor", 
            desc: "Search by specialty, name, or browse our top-rated physicians." 
          },
          { 
            icon: <CalendarDays className="h-6 w-6 text-blue-500" />, 
            title: "Choose a Time Slot", 
            desc: "Select from available dates and times that work for your schedule." 
          },
          { 
            icon: <FileText className="h-6 w-6 text-blue-500" />, 
            title: "Complete Booking", 
            desc: "Fill in your information and we'll confirm your appointment." 
          },
        ].map((step, i) => (
          <Card key={i} className="step-item border-none shadow-md">
            <CardHeader>
              <div className="h-12 w-12 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center mb-4">
                {step.icon}
              </div>
              <CardTitle>{step.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{step.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search and filter */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-md">
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="search">Search Doctors</Label>
            <div className="relative mt-1.5">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input 
                id="search"
                placeholder="Doctor name or specialty..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="specialty">Specialty</Label>
            <Select onValueChange={onSpecialtyChange} value={selectedSpecialty}>
              <SelectTrigger id="specialty" className="mt-1.5">
                <SelectValue placeholder="Select specialty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Specialties</SelectItem>
                {specialties.map((specialty) => (
                  <SelectItem key={specialty} value={specialty}>
                    {specialty}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="date">Appointment Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="date"
                  variant="outline"
                  className="w-full justify-start text-left font-normal mt-1.5"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(selectedDate, "PPP")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={onDateSelect}
                  initialFocus
                  disabled={(date) => date < new Date()}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>

      {/* Doctor list */}
      <div ref={doctorsRef} className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            {filteredDoctors.length} Doctors Available
          </h2>
          <Select defaultValue="recommended">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recommended">Recommended</SelectItem>
              <SelectItem value="rating">Highest Rating</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
              <SelectItem value="availability">Earliest Available</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {filteredDoctors.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto h-16 w-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mb-4">
              <Search className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium mb-2">No doctors match your search</h3>
            <p className="text-muted-foreground">Try adjusting your filters or search term</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {filteredDoctors.map((doctor) => (
              <Card 
                key={doctor.id} 
                className={cn(
                  "doctor-card border overflow-hidden transition-all hover:shadow-lg",
                  selectedDoctor?.id === doctor.id ? "ring-2 ring-blue-500" : ""
                )}
              >
                <div className="flex flex-col md:flex-row h-full">
                  {/* Doctor image */}
                  <div className="md:w-1/3 h-48 md:h-auto relative">
                    <Image
                      src={doctor.image}
                      alt={doctor.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  
                  {/* Doctor info */}
                  <div className="p-5 flex flex-col flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-bold text-lg">{doctor.name}</h3>
                        <p className="text-muted-foreground">{doctor.specialty}</p>
                      </div>
                      <Badge 
                        variant="outline" 
                        className="flex items-center gap-1 bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800"
                      >
                        <Star className="h-3 w-3 fill-current" />
                        {doctor.rating}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-y-2 mb-4 text-sm">
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>{doctor.experience}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{doctor.location}</span>
                      </div>
                      <div>
                        <Badge className="bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400">
                          ${doctor.price} / visit
                        </Badge>
                      </div>
                      <div>
                        <span className="text-green-600 font-medium">{doctor.nextAvailable}</span>
                      </div>
                    </div>
                    
                    <div className="mt-auto">
                      <Button 
                        onClick={() => {
                          onDoctorSelect(doctor);
                          if (doctor.id === selectedDoctor?.id) {
                            setTimeSlotDialogOpen(true);
                          }
                        }}
                        className="w-full"
                        variant={selectedDoctor?.id === doctor.id ? "default" : "outline"}
                      >
                        {selectedDoctor?.id === doctor.id ? "Select Time" : "Select"}
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
      
      {/* Time slot selection popup */}
      <Dialog open={timeSlotDialogOpen && !!selectedDoctor} onOpenChange={setTimeSlotDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Select Time Slot</DialogTitle>
          </DialogHeader>
          
          <div className="my-6">
            <h3 className="font-medium mb-2">Available on {format(selectedDate, "EEEE, MMMM d")}</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {getAvailableTimeSlots().map((time) => (
                <Button
                  key={time}
                  variant={selectedTimeSlot === time ? "default" : "outline"}
                  className={cn(
                    "text-sm h-10",
                    selectedTimeSlot === time ? "bg-blue-600" : ""
                  )}
                  onClick={() => onTimeSlotSelect(time)}
                >
                  {time}
                </Button>
              ))}
            </div>
          </div>
          
          <DialogFooter className="sm:justify-end">
            <Button 
              variant="outline" 
              onClick={() => setTimeSlotDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={() => {
                if (selectedTimeSlot) {
                  setTimeSlotDialogOpen(false);
                  onNext();
                }
              }}
              disabled={!selectedTimeSlot}
            >
              Confirm
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Next button - now outside the main flow */}
      <div className="pt-8 flex justify-end">
        <Button 
          size="lg"
          onClick={() => {
            if (selectedDoctor && !selectedTimeSlot) {
              setTimeSlotDialogOpen(true);
            } else if (selectedDoctor && selectedTimeSlot) {
              onNext();
            }
          }}
          disabled={!selectedDoctor}
          className="min-w-[150px]"
        >
          {selectedTimeSlot ? "Continue" : "Select Time"}
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}