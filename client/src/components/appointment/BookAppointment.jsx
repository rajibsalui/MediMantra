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
        <Loader2 className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-500" />
      </div>
    );
  }

  return (
    <Card className="w-full max-w-4xl mx-auto border dark:border-slate-800 bg-white dark:bg-slate-950">
      <CardHeader className="dark:border-slate-800">
        <CardTitle className="text-slate-900 dark:text-slate-100">Book an Appointment</CardTitle>
        <CardDescription className="text-slate-600 dark:text-slate-400">
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
            <h3 className="text-lg font-medium mb-2 text-slate-900 dark:text-slate-100">Select Date</h3>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateChange}
              className="rounded-md border dark:border-slate-800"
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
            <h3 className="text-lg font-medium mb-2 text-slate-900 dark:text-slate-100">Appointment Details</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-slate-900 dark:text-slate-200">
                  Available Time Slots
                </label>
                {loading ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-6 w-6 animate-spin text-blue-600 dark:text-blue-500" />
                  </div>
                ) : availableSlots.length > 0 ? (
                  <div className="grid grid-cols-3 gap-2">
                    {availableSlots.map((slot) => (
                      <button
                        key={slot.startTime}
                        className={`px-3 py-2 text-sm border rounded-md ${
                          selectedSlot === slot.startTime
                            ? "bg-blue-600 dark:bg-blue-700 text-white"
                            : "border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                        }`}
                        onClick={() => setSelectedSlot(slot.startTime)}
                      >
                        {slot.startTime}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-600 dark:text-slate-400 p-2 bg-slate-100 dark:bg-slate-800 rounded-md">
                    No available slots for this date
                  </p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1 text-slate-900 dark:text-slate-200">
                  Appointment Type
                </label>
                <Select
                  value={appointmentType}
                  onValueChange={setAppointmentType}
                >
                  <SelectTrigger className="border dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-slate-900 dark:border-slate-700">
                    <SelectItem value="in-person" className="dark:text-slate-100">In-Person Visit</SelectItem>
                    <SelectItem value="video" className="dark:text-slate-100">Video Consultation</SelectItem>
                    <SelectItem value="phone" className="dark:text-slate-100">Phone Consultation</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1 text-slate-900 dark:text-slate-200">
                  Reason for Visit (Optional)
                </label>
                <Textarea
                  placeholder="Briefly describe your symptoms or reason for the appointment"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                  className="border dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus-visible:ring-blue-500 dark:focus-visible:ring-blue-400 placeholder:text-slate-500 dark:placeholder:text-slate-400"
                />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between border-t dark:border-slate-800">
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          Cancel
        </Button>
        <Button
          onClick={handleBookAppointment}
          disabled={!selectedSlot || submitLoading}
          className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white"
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
