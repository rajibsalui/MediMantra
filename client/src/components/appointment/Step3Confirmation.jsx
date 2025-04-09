"use client";

import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import Image from "next/image";
import { format } from "date-fns";
import { Check, Clock, Calendar as CalendarIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Step3Confirmation({
  selectedDoctor,
  selectedDate,
  selectedTimeSlot,
  appointmentDetails,
  prescriptionFiles = [],
  insuranceProviders = [], // Add default empty array
  onBack,
  onConfirm,
  isLoading
}) {
  const summaryRef = useRef(null);

  // GSAP animations
  useEffect(() => {
    gsap.from(".summary-animate", {
      scale: 0.95,
      // opacity: 0,
      stagger: 0.1,
      duration: 0.5
    });
  }, []);

  console.log("Selected Doctor:", selectedDoctor);
  // Safeguard against undefined selectedDoctor
  if (!selectedDoctor) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium mb-2 text-slate-900 dark:text-slate-100">No doctor selected</h3>
        <p className="text-slate-600 dark:text-slate-400 mb-6">Please go back and select a doctor</p>
        <Button onClick={onBack} className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white">Back to Doctor Selection</Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8" ref={summaryRef}>
      <Card className="border-none shadow-lg overflow-hidden summary-animate bg-white dark:bg-slate-800">
        <CardContent className="p-0">
          <div className="bg-green-50 dark:bg-green-900/20 border-b border-green-100 dark:border-green-900 p-6 text-center">
            <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-green-100 dark:bg-green-800 mb-4">
              <Check className="h-6 w-6 text-green-600 dark:text-green-300" />
            </div>
            <h2 className="text-2xl font-bold text-green-800 dark:text-green-300 mb-1">Appointment Ready!</h2>
            <p className="text-green-700 dark:text-green-400">Please review the details below and confirm</p>
          </div>

          <div className="p-6 space-y-6">
            <div className="flex items-center gap-4">
              <div className="relative h-20 w-20 rounded-md overflow-hidden">
                <Image
                  src={selectedDoctor.image || selectedDoctor.user?.profileImage || "/placeholder-doctor.jpg"}
                  alt={selectedDoctor.name || (selectedDoctor.user ? `Dr. ${selectedDoctor.user.firstName} ${selectedDoctor.user.lastName}` : 'Doctor')}
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <h3 className="font-bold text-xl text-slate-900 dark:text-slate-100">
                  {selectedDoctor.name || (selectedDoctor.user ? `Dr. ${selectedDoctor.user.firstName} ${selectedDoctor.user.lastName}` : 'Doctor')}
                </h3>
                {selectedDoctor.specialties && Array.isArray(selectedDoctor.specialties) ? (
                  selectedDoctor.specialties.map((spec, index) => (
                    <p key={index} className="text-slate-600 dark:text-slate-400">
                      {typeof spec === 'string' ? spec : spec.degree || ''}
                    </p>
                  ))
                ) : (
                  <p className="text-slate-600 dark:text-slate-400">{selectedDoctor.specialty || ''}</p>
                )}

                <div className="flex items-center gap-2 mt-1">
                  <Badge
                    variant="outline"
                    className="flex items-center gap-1 bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300"
                  >
                    <CalendarIcon className="h-3 w-3" />
                    {format(selectedDate, "MMMM d, yyyy")}
                  </Badge>
                  <Badge
                    variant="outline"
                    className="flex items-center gap-1 bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300"
                  >
                    <Clock className="h-3 w-3" />
                    {appointmentDetails?.displayTimeSlot || selectedTimeSlot}
                  </Badge>
                </div>
              </div>
            </div>

            <Separator className="dark:bg-slate-700" />

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Contact</span>
                <span className="font-medium text-slate-900 dark:text-slate-100">
                  {selectedDoctor.user?.phone ? `+91 ${selectedDoctor.user.phone}` : 'Contact information unavailable'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Duration</span>
                <span className="font-medium text-slate-900 dark:text-slate-100">30 minutes</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Appointment Type</span>
                <span className="font-medium text-slate-900 dark:text-slate-100">
                  {appointmentDetails?.appointmentType === 'video' ? 'Video consultation' :
                   appointmentDetails?.appointmentType === 'phone' ? 'Phone consultation' : 'In-person consultation'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Consultation Fee</span>
                <span className="font-medium text-slate-900 dark:text-slate-100">
                  ₹{selectedDoctor.consultationFee?.inPerson || selectedDoctor.price || 0}.00
                </span>
              </div>
              {prescriptionFiles?.length > 0 && (
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Medical Records</span>
                  <span className="font-medium text-slate-900 dark:text-slate-100">{prescriptionFiles.length} files uploaded</span>
                </div>
              )}
            </div>

            <Separator className="dark:bg-slate-700" />

            <div className="flex justify-between font-bold text-lg text-slate-900 dark:text-slate-100">
              <span>Total</span>
              <span>₹{selectedDoctor.consultationFee?.inPerson || selectedDoctor.price || 0}.00</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="summary-animate space-y-6">
        <Card className="border-none shadow-md bg-white dark:bg-slate-800">
          <CardHeader>
            <CardTitle className="text-lg text-slate-900 dark:text-slate-100">Payment Method</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="card">
              <TabsList key="tabs-list" className="grid w-full grid-cols-3 mb-6 bg-slate-100 dark:bg-slate-900">
                <TabsTrigger value="card" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:text-slate-900 dark:data-[state=active]:text-slate-100 data-[state=inactive]:text-slate-600 dark:data-[state=inactive]:text-slate-400">Credit Card</TabsTrigger>
                <TabsTrigger value="paypal" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:text-slate-900 dark:data-[state=active]:text-slate-100 data-[state=inactive]:text-slate-600 dark:data-[state=inactive]:text-slate-400">PayPal</TabsTrigger>
                <TabsTrigger value="insurance" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:text-slate-900 dark:data-[state=active]:text-slate-100 data-[state=inactive]:text-slate-600 dark:data-[state=inactive]:text-slate-400">Insurance</TabsTrigger>
              </TabsList>
              <TabsContent value="card">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="cardName" className="text-slate-900 dark:text-slate-200">Name on Card</Label>
                    <Input id="cardName" placeholder="John Doe" className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cardNumber" className="text-slate-900 dark:text-slate-200">Card Number</Label>
                    <Input id="cardNumber" placeholder="1234 5678 9012 3456" className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="expiry" className="text-slate-900 dark:text-slate-200">Expiry Date</Label>
                      <Input id="expiry" placeholder="MM/YY" className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cvc" className="text-slate-900 dark:text-slate-200">CVC</Label>
                      <Input id="cvc" placeholder="123" className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400" />
                    </div>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="paypal">
                <div className="text-center py-8 space-y-4">
                  <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                    <p className="text-blue-700 dark:text-blue-400 font-bold text-xl">P</p>
                  </div>
                  <p className="text-slate-700 dark:text-slate-300">You will be redirected to PayPal to complete your payment</p>
                </div>
              </TabsContent>
              <TabsContent value="insurance">
                <div className="space-y-4">
                  <p className="text-slate-600 dark:text-slate-400">Please note that co-pays may apply based on your insurance coverage</p>
                  <div className="space-y-2">
                    <Label htmlFor="insuranceName" className="text-slate-900 dark:text-slate-200">Insurance Provider</Label>
                    <Select>
                      <SelectTrigger id="insuranceName" className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100">
                        <SelectValue placeholder="Select insurance provider" className="text-slate-500 dark:text-slate-400" />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
                        {insuranceProviders?.map(provider => (
                          <SelectItem
                            key={provider}
                            value={provider.toLowerCase().replace(/\s+/g, '-')}
                            className="text-slate-900 dark:text-slate-100"
                          >
                            {provider}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="memberId" className="text-slate-900 dark:text-slate-200">Member ID</Label>
                    <Input id="memberId" placeholder="Enter your member ID" className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="groupNumber" className="text-slate-900 dark:text-slate-200">Group Number</Label>
                    <Input id="groupNumber" placeholder="Enter your group number" className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400" />
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={onBack}
            disabled={isLoading}
            className="border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Back to Details
          </Button>
          <Button
            size="lg"
            className="min-w-[180px] bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white"
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                Confirm Appointment
                <Check className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}