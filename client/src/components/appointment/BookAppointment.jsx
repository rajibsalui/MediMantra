import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { toast } from "react-hot-toast";
import { Calendar } from "../ui/calendar";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Textarea } from "../ui/textarea";
import { Loader2 } from "lucide-react";

const BookAppointment = ({ doctorId }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [doctor, setDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [appointmentType, setAppointmentType] = useState("in-person");
  const [reason, setReason] = useState("");

  // Fetch doctor details
  useEffect(() => {
    const fetchDoctor = async () => {
      if (!doctorId) return;
      
      setLoading(true);
      try {
        const response = await fetch(`/api/doctors/${doctorId}`);
        const data = await response.json();
        
        if (data.success) {
          setDoctor(data.data);
          fetchAvailability(selectedDate);
        } else {
          toast.error(data.message || "Failed to fetch doctor details");
        }
      } catch (error) {
        console.error("Error fetching doctor:", error);
        toast.error("Something went wrong. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchDoctor();
  }, [doctorId]);

  // Fetch available slots when date changes
  const fetchAvailability = async (date) => {
    if (!doctorId) return;
    
    setLoading(true);
    try {
      const formattedDate = date.toISOString().split('T')[0];
      const response = await fetch(`/api/doctors/${doctorId}/availability?date=${formattedDate}`);
      const data = await response.json();
      
      if (data.success) {
        // Filter only available slots
        const slots = data.data.availableSlots?.filter(slot => !slot.isBooked) || [];
        setAvailableSlots(slots);
        setSelectedSlot(""); // Reset selected slot
      } else {
        toast.error(data.message || "Failed to fetch availability");
        setAvailableSlots([]);
      }
    } catch (error) {
      console.error("Error fetching availability:", error);
      toast.error("Failed to load available slots");
      setAvailableSlots([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle date change
  const handleDateChange = (date) => {
    setSelectedDate(date);
    fetchAvailability(date);
  };

  // Handle appointment booking
  const handleBookAppointment = async () => {
    if (!selectedDate || !selectedSlot || !appointmentType) {
      toast.error("Please select date, time slot and appointment type");
      return;
    }

    setSubmitLoading(true);
    try {
      const response = await fetch("/api/patients/appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          doctorId,
          appointmentDate: selectedDate.toISOString(),
          appointmentTime: selectedSlot,
          appointmentType,
          reason,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Appointment booked successfully!");
        router.push("/patient/appointments");
      } else {
        toast.error(data.message || "Failed to book appointment");
      }
    } catch (error) {
      console.error("Error booking appointment:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading && !doctor) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Book an Appointment</CardTitle>
        <CardDescription>
          {doctor ? (
            <span>
              Schedule a visit with Dr. {doctor.user.firstName} {doctor.user.lastName}
            </span>
          ) : (
            "Select date and time for your appointment"
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium mb-2">Select Date</h3>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateChange}
              className="rounded-md border"
              disabled={(date) => {
                // Disable past dates and dates more than 30 days in the future
                const now = new Date();
                now.setHours(0, 0, 0, 0);
                const thirtyDaysLater = new Date();
                thirtyDaysLater.setDate(now.getDate() + 30);
                return date < now || date > thirtyDaysLater;
              }}
            />
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-2">Appointment Details</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Available Time Slots
                </label>
                {loading ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : availableSlots.length > 0 ? (
                  <div className="grid grid-cols-3 gap-2">
                    {availableSlots.map((slot) => (
                      <button
                        key={slot.startTime}
                        className={`px-3 py-2 text-sm border rounded-md ${
                          selectedSlot === slot.startTime
                            ? "bg-primary text-white"
                            : "hover:bg-gray-100 dark:hover:bg-gray-800"
                        }`}
                        onClick={() => setSelectedSlot(slot.startTime)}
                      >
                        {slot.startTime}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground p-2 bg-muted rounded-md">
                    No available slots for this date
                  </p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">
                  Appointment Type
                </label>
                <Select
                  value={appointmentType}
                  onValueChange={setAppointmentType}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="in-person">In-Person Visit</SelectItem>
                    <SelectItem value="video">Video Consultation</SelectItem>
                    <SelectItem value="phone">Phone Consultation</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">
                  Reason for Visit (Optional)
                </label>
                <Textarea
                  placeholder="Briefly describe your symptoms or reason for the appointment"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => router.back()}
        >
          Cancel
        </Button>
        <Button
          onClick={handleBookAppointment}
          disabled={!selectedSlot || submitLoading}
        >
          {submitLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Booking...
            </>
          ) : (
            "Book Appointment"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default BookAppointment;
