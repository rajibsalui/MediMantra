"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, Calendar as CalendarIcon, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function DoctorAvailabilityCalendar({
  doctor,
  selectedDate,
  selectedTimeSlot,
  onDateSelect,
  onTimeSlotSelect,
  getAvailableTimeSlots,
  getAvailableDates = null
}) {
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [availableDates, setAvailableDates] = useState([]);
  const [loadingDates, setLoadingDates] = useState(false);

  // Fetch available dates when doctor changes
  useEffect(() => {
    if (!doctor) return;

    // Skip if getAvailableDates is not provided
    if (!getAvailableDates) {
      setLoadingDates(false);
      return;
    }

    const fetchAvailableDates = async () => {
      setLoadingDates(true);
      try {
        const doctorId = doctor._id || doctor.id;
        if (doctorId) {
          console.log(`Fetching available dates for doctor ${doctorId}`);
          const dates = await getAvailableDates(doctorId);

          // Log the dates for debugging
          if (dates && dates.length > 0) {
            console.log('Available dates:', dates.map(d => d.toISOString().split('T')[0]));
          } else {
            console.log('No available dates returned');
          }

          setAvailableDates(dates || []);
        }
      } catch (error) {
        console.error("Error fetching available dates:", error);
        setAvailableDates([]);
      } finally {
        setLoadingDates(false);
      }
    };

    fetchAvailableDates();
  }, [getAvailableDates]);

  // Helper function to check if a date is in the available dates
  const isDateAvailable = (date) => {
    if (!date || availableDates.length === 0) return false;

    // Get the date string for the current date
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

    // Log for debugging
    console.log(`Checking if date ${dateStr} is available in calendar view`);

    // Check if this date is in the available dates
    const isAvailable = availableDates.some(d => {
      const availableDateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const result = dateStr === availableDateStr;
      console.log(`  Comparing with available date ${availableDateStr}: ${result}`);
      return result;
    });

    return isAvailable;
  };

  // Fetch available time slots when date changes
  useEffect(() => {
    if (!doctor || !selectedDate || !getAvailableTimeSlots) return;

    // Check if the selected date is in the available dates
    const available = isDateAvailable(selectedDate);
    console.log(`Selected date is available: ${available}`);

    // Only fetch time slots if the date is available
    if (!available) {
      setAvailableSlots([]);
      return;
    }

    const fetchTimeSlots = async () => {
      setLoadingSlots(true);
      try {
        // Format the selected date for logging
        const dateStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;
        console.log(`Fetching time slots for date: ${dateStr}`);

        const slots = await getAvailableTimeSlots(selectedDate);
        console.log(`Received ${slots?.length || 0} slots for date ${dateStr}:`, slots);

        setAvailableSlots(slots || []);
      } catch (error) {
        console.error("Error fetching time slots:", error);
        setAvailableSlots([]);
      } finally {
        setLoadingSlots(false);
      }
    };

    fetchTimeSlots();
  }, [doctor, selectedDate, getAvailableTimeSlots, availableDates]);

  // Format the selected date for display
  const formattedSelectedDate = selectedDate
    ? format(selectedDate, "EEEE, MMMM d, yyyy")
    : null;

  return (
    <div className="space-y-6">
      {/* Calendar Section Header */}
      <div className="flex flex-col space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
            Schedule Appointment
          </h2>
          {selectedDate && (
            <div className="hidden md:block text-sm text-slate-600 dark:text-slate-300">
              {formattedSelectedDate}
            </div>
          )}
        </div>
        <div className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded-md self-start">
          Note: Appointments are for the day after the selected date
        </div>
      </div>

      {/* Legend for the calendar */}
      <div className="flex flex-wrap gap-4 text-sm items-center">
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded-full bg-blue-500"></div>
          <span className="text-slate-700 dark:text-slate-300">Available Dates</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded-full bg-green-500"></div>
          <span className="text-slate-700 dark:text-slate-300">Today</span>
        </div>
        {selectedDate && (
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded-full bg-purple-500"></div>
            <span className="text-slate-700 dark:text-slate-300">Selected Date</span>
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Calendar */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-md border border-slate-100 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <CalendarIcon className="h-4 w-4" />
              Select Date
            </h3>
            {loadingDates && (
              <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center">
                <Loader2 className="h-3 w-3 animate-spin mr-1" />
                Loading...
              </span>
            )}
          </div>

          {loadingDates ? (
            <div className="space-y-2">
              <Skeleton className="h-48 w-full rounded-md" />
            </div>
          ) : (
            <div className="transition-all duration-200 ease-in-out">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => {
                  // Format the selected date for logging
                  const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
                  console.log(`User selected date: ${dateStr}`);

                  // Check if this date is in the available dates
                  const isAvailable = isDateAvailable(date);
                  console.log(`Is date ${dateStr} available? ${isAvailable}`);

                  // Call the provided onDateSelect function
                  onDateSelect(date);

                  // Clear time slots when date changes
                  setAvailableSlots([]);
                }}
                disabled={(date) => {
                  const today = new Date();
                  const isBeforeToday =
                    date < new Date(today.getFullYear(), today.getMonth(), today.getDate());
                  return isBeforeToday;
                }}
                className="border-slate-200 dark:border-slate-700 rounded-lg"
                modifiers={{
                  highlighted: (date) => {
                    // Use the isDateAvailable helper function
                    return isDateAvailable(date);
                  },
                  today: (date) => {
                    const today = new Date();
                    return date.getDate() === today.getDate() &&
                           date.getMonth() === today.getMonth() &&
                           date.getFullYear() === today.getFullYear();
                  },
                  selected: (date) => {
                    if (!selectedDate) return false;

                    return date.getDate() === selectedDate.getDate() &&
                           date.getMonth() === selectedDate.getMonth() &&
                           date.getFullYear() === selectedDate.getFullYear();
                  }
                }}
                modifiersClassNames={{
                  highlighted: "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 font-medium",
                  today: "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 font-bold border border-green-200 dark:border-green-800",
                  selected: "bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 font-bold border border-purple-300 dark:border-purple-700"
                }}
                classNames={{
                  day_selected: "bg-blue-600 text-white hover:bg-blue-700",
                  day_today: "border border-slate-300 dark:border-slate-600",
                }}
              />
            </div>
          )}

          {/* Selected date (mobile view) */}
          {selectedDate && (
            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 md:hidden">
              <p className="text-sm font-medium text-slate-900 dark:text-white">Selected:</p>
              <p className="text-sm text-slate-700 dark:text-slate-300">{formattedSelectedDate}</p>
            </div>
          )}
        </div>

        {/* Time slots */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-md border border-slate-100 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Available Time Slots
            </h3>
            {selectedDate && loadingSlots && (
              <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center">
                <Loader2 className="h-3 w-3 animate-spin mr-1" />
                Loading slots...
              </span>
            )}
          </div>

          {loadingSlots ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <Skeleton key={i} className="h-10 w-full rounded-md" />
                ))}
              </div>
            </div>
          ) : availableSlots.length > 0 ? (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {availableSlots.map((slot) => {
                  // Handle different slot formats
                  const startTime = typeof slot === 'string' ? slot : slot.startTime;
                  // Use displayTime from slot or create one from start time
                  const displayTime = slot.displayTime || startTime;

                  if (!startTime) return null;

                  const isSelected = selectedTimeSlot === startTime;

                  return (
                    <Button
                      key={startTime}
                      variant={isSelected ? "default" : "outline"}
                      className={cn(
                        "text-sm h-auto py-2 transition-all duration-200 ease-in-out relative",
                        isSelected
                          ? "bg-blue-600 dark:bg-blue-700 text-white shadow-md border-transparent"
                          : "border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/80"
                      )}
                      onClick={() => {
                        // Call the provided onTimeSlotSelect function
                        onTimeSlotSelect(startTime);
                      }}
                    >
                      <div className="flex flex-col items-center w-full">
                        <div className="flex items-center mb-1">
                          <Clock className="h-3 w-3 mr-1.5" />
                          <span>{displayTime}</span>
                        </div>
                        {isSelected && (
                          <CheckCircle2 className="h-3 w-3 absolute -top-1 -right-1 text-green-500 bg-white dark:bg-slate-800 rounded-full" />
                        )}
                      </div>
                    </Button>
                  );
                })}
              </div>

              {selectedTimeSlot && (
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700">
                  <p className="text-sm text-slate-600 dark:text-slate-400 flex items-center">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                    Selected time: <span className="font-medium ml-1">
                      {availableSlots.find(slot => slot.startTime === selectedTimeSlot)?.displayTime || selectedTimeSlot}
                    </span>
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-10 px-4">
              {selectedDate ? (
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center mb-3">
                    <AlertCircle className="h-8 w-8 text-amber-500 dark:text-amber-400" />
                  </div>
                  <p className="font-medium text-slate-800 dark:text-slate-200">No available slots for the day after this date</p>
                  <p className="text-sm mt-1 text-slate-500 dark:text-slate-400">
                    {isDateAvailable(selectedDate)
                      ? "There are no time slots available for the day after this date."
                      : "Please select a date highlighted in blue on the calendar."}
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center mb-3">
                    <CalendarIcon className="h-8 w-8 text-blue-500 dark:text-blue-400" />
                  </div>
                  <p className="font-medium text-slate-800 dark:text-slate-200">Select a date</p>
                  <p className="text-sm mt-1 text-slate-500 dark:text-slate-400">To see available appointment times</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
