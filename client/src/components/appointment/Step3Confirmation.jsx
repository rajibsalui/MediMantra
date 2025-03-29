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
  prescriptionFiles,
  insuranceProviders,
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
  
  // Safeguard against undefined selectedDoctor
  if (!selectedDoctor) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium mb-2">No doctor selected</h3>
        <p className="text-muted-foreground mb-6">Please go back and select a doctor</p>
        <Button onClick={onBack}>Back to Doctor Selection</Button>
      </div>
    );
  }
  
  return (
    <div className="max-w-3xl mx-auto space-y-8" ref={summaryRef}>
      <Card className="border-none shadow-lg overflow-hidden summary-animate">
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
                  src={selectedDoctor.image}
                  alt={selectedDoctor.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <h3 className="font-bold text-xl">{selectedDoctor.name}</h3>
                <p className="text-muted-foreground">{selectedDoctor.specialty}</p>
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
                    {selectedTimeSlot}
                  </Badge>
                </div>
              </div>
            </div>

            <Separator />
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Location</span>
                <span className="font-medium">{selectedDoctor.location}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Duration</span>
                <span className="font-medium">30 minutes</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Appointment Type</span>
                <span className="font-medium">In-person consultation</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Consultation Fee</span>
                <span className="font-medium">${selectedDoctor.price}.00</span>
              </div>
              {prescriptionFiles.length > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Medical Records</span>
                  <span className="font-medium">{prescriptionFiles.length} files uploaded</span>
                </div>
              )}
            </div>
            
            <Separator />
            
            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>${selectedDoctor.price}.00</span>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="summary-animate space-y-6">
        <Card className="border-none shadow-md">
          <CardHeader>
            <CardTitle className="text-lg">Payment Method</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="card">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="card">Credit Card</TabsTrigger>
                <TabsTrigger value="paypal">PayPal</TabsTrigger>
                <TabsTrigger value="insurance">Insurance</TabsTrigger>
              </TabsList>
              <TabsContent value="card">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="cardName">Name on Card</Label>
                    <Input id="cardName" placeholder="John Doe" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cardNumber">Card Number</Label>
                    <Input id="cardNumber" placeholder="1234 5678 9012 3456" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="expiry">Expiry Date</Label>
                      <Input id="expiry" placeholder="MM/YY" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cvc">CVC</Label>
                      <Input id="cvc" placeholder="123" />
                    </div>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="paypal">
                <div className="text-center py-8 space-y-4">
                  <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                    <p className="text-blue-700 dark:text-blue-400 font-bold text-xl">P</p>
                  </div>
                  <p>You will be redirected to PayPal to complete your payment</p>
                </div>
              </TabsContent>
              <TabsContent value="insurance">
                <div className="space-y-4">
                  <p className="text-muted-foreground">Please note that co-pays may apply based on your insurance coverage</p>
                  <div className="space-y-2">
                    <Label htmlFor="insuranceName">Insurance Provider</Label>
                    <Select>
                      <SelectTrigger id="insuranceName">
                        <SelectValue placeholder="Select insurance provider" />
                      </SelectTrigger>
                      <SelectContent>
                        {insuranceProviders.map(provider => (
                          <SelectItem 
                            key={provider} 
                            value={provider.toLowerCase().replace(/\s+/g, '-')}
                          >
                            {provider}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="memberId">Member ID</Label>
                    <Input id="memberId" placeholder="Enter your member ID" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="groupNumber">Group Number</Label>
                    <Input id="groupNumber" placeholder="Enter your group number" />
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
          >
            Back to Details
          </Button>
          <Button 
            size="lg"
            className="min-w-[180px]"
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