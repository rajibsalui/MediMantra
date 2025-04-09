"use client";

import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useAuth } from "./AuthContext";
import { API_URL } from "@/config/environment";

// Helper function to create a single time slot from start and end time
const generateTimeSlots = (startTime, endTime) => {
  // Create a single slot with the exact start and end time
  return [{
    startTime: startTime,
    endTime: endTime,
    displayTime: `${startTime} - ${endTime}`,
    isAvailable: true
  }];
};

const AppointmentContext = createContext();

export const AppointmentProvider = ({ children }) => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [appointmentDetails, setAppointmentDetails] = useState({
    doctor: null,
    date: new Date(),
    timeSlot: "",
    displayTimeSlot: "", // Added for storing formatted time slot display
    appointmentType: "in-person",
    reason: "",
    prescriptionFiles: []
  });

  // console.log(token)

  // Headers helper function
  const getAuthHeaders = () => ({
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  // Clear appointment details
  const clearAppointmentDetails = () => {
    setAppointmentDetails({
      doctor: null,
      date: new Date(),
      timeSlot: "",
      appointmentType: "in-person",
      reason: "",
      prescriptionFiles: []
    });
  };

  // Update appointment details
  const updateAppointmentDetails = (field, value) => {
    setAppointmentDetails(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Get all patient appointments
  const getAppointments = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Authentication required");
      return [];
    }

    try {
      setLoading(true);
      // const params = new URLSearchParams();
      // if (status) params.append("status", status);

      const { data } = await axios.get(
        `${API_URL}/patients/appointments`,
        getAuthHeaders()
      );

      setAppointments(data.data);
      return data.data;
    } catch (error) {
      const message = error.response?.data?.message || "Failed to fetch appointments";
      toast.error(message);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Book appointment
  const bookAppointment = async () => {
    if (!token) {
      // console.log("No token found");
      toast.error("Authentication required");
      throw new Error("No authentication token available");
    }

    if (!appointmentDetails.doctor || !appointmentDetails.date || !appointmentDetails.timeSlot) {
      // console.log("Missing appointment details", appointmentDetails);
      toast.error("Please select a doctor, date and time slot");
      throw new Error("Missing required appointment details");
    }

    try {
      setLoading(true);
      // console.log("Booking appointment with details:", appointmentDetails.date);
      // Extract the correct doctor ID (handle different possible formats)
      let doctorId;
      if (!appointmentDetails.doctor) {
        console.error('Doctor object is missing');
        toast.error('Please select a doctor');
        throw new Error('Doctor object is missing');
      } else if (appointmentDetails.doctor._id) {
        doctorId = appointmentDetails.doctor._id;
      } else if (appointmentDetails.doctor.id) {
        doctorId = appointmentDetails.doctor.id;
      } else {
        console.error('Doctor object does not have a valid ID:', appointmentDetails.doctor);
        toast.error('Invalid doctor information. Please try again.');
        throw new Error('Invalid doctor ID');
      }

      const appointmentData = {
        doctorId: doctorId,
        appointmentDate: appointmentDetails.date.toISOString(),
        appointmentTime: appointmentDetails.timeSlot,
        appointmentType: appointmentDetails.appointmentType,
        reason: appointmentDetails.reason
      };

      console.log('Sending appointment data:', appointmentData);

      // console.log("Appointment data:", appointmentData);

      const data  = await axios.post(
        `${API_URL}/patients/appointments`,
        appointmentData,
        getAuthHeaders()
      );
      // console.log( "data", data.data)
      // Refresh appointments list
       await getAppointments();
      // console.log(apt)

      // Clear the appointment details
      clearAppointmentDetails();

      toast.success("Appointment booked successfully");
      return data.data;
    } catch (error) {
      const message = error.response?.data?.message || "Failed to book appointment";
      toast.error(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  // Cancel appointment
  const cancelAppointment = async (appointmentId, reason) => {
    if (!token) {
      toast.error("Authentication required");
      throw new Error("No authentication token available");
    }

    try {
      setLoading(true);
      const { data } = await axios.put(
        `${API_URL}/patients/appointments/${appointmentId}/cancel`,
        { reason },
        getAuthHeaders()
      );

      // Refresh appointments list
      await getAppointments();

      toast.success("Appointment cancelled successfully");
      return data;
    } catch (error) {
      const message = error.response?.data?.message || "Failed to cancel appointment";
      toast.error(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  // Get available time slots for a doctor on a specific date
  const getAvailableTimeSlots = async (doctorId, date) => {
    if (!doctorId || !date) {
      return [];
    }

    try {
      // Ensure we're using the date without time component
      // Shift the date one day ahead
      const dateObj = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1, 0, 0, 0, 0);
      const formattedDate = dateObj.toISOString().split('T')[0];

      console.log(`Original date: ${date.toISOString().split('T')[0]}, Shifted date: ${formattedDate}`);

      console.log(`Fetching slots for doctor ${doctorId} on date ${formattedDate}`);

      const { data } = await axios.get(
        `${API_URL}/doctors/${doctorId}/availability?date=${formattedDate}`,
        getAuthHeaders()
      );

      // Get the doctor's availability data
      const availabilityData = data.data || [];

      // Check if we have any availability data
      if (availabilityData.length === 0) {
        console.log('No availability data for', formattedDate);
        return [];
      }

      // Store the generated time slots
      const generatedSlots = [];

      // Process each availability period
      availabilityData.forEach(availabilitySlot => {
        if (!availabilitySlot.isAvailable) return;

        // Parse start and end times
        const startTime = availabilitySlot.startTime;
        const endTime = availabilitySlot.endTime;

        console.log(`Processing availability: ${startTime} - ${endTime}`);

        // Generate a single slot with the exact start and end time
        const timeSlot = generateTimeSlots(startTime, endTime);
        generatedSlots.push(...timeSlot);
      });

      console.log('Generated slots for', formattedDate, ':', generatedSlots);
      return generatedSlots;
    } catch (error) {
      console.error("Error fetching available time slots:", error);
      return [];
    }
  };

  // Check doctor availability for a specific date
  const checkDateAvailability = async (doctorId, date) => {
    if (!doctorId || !date) {
      return false;
    }

    try {
      // Ensure we're using the date without time component
      // No need to shift the date here as getAvailableTimeSlots already shifts it
      const dateWithoutTime = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);

      // Get available slots for this date
      const slots = await getAvailableTimeSlots(doctorId, dateWithoutTime);

      // Log the result for debugging
      console.log(`Date ${dateWithoutTime.toISOString().split('T')[0]} has ${slots.length} available slots`);

      return slots.length > 0;
    } catch (error) {
      console.error("Error checking date availability:", error);
      return false;
    }
  };

  // Get available dates for a doctor (next 30 days)
  const getAvailableDates = async (doctorId) => {
    if (!doctorId) {
      return [];
    }

    try {
      const availableDates = [];
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Set to midnight

      console.log(`Getting available dates for doctor ${doctorId} starting from ${today.toISOString().split('T')[0]}`);

      // Check next 30 days
      for (let i = 0; i < 30; i++) {
        // Create a new date object for each day, setting it to midnight
        // Use a clean date object to avoid time zone issues
        const currentDate = new Date(today);
        // Shift dates one day ahead by adding 1 to the day calculation
        currentDate.setDate(today.getDate() + i + 1);

        // Format date as YYYY-MM-DD for consistent comparison
        const dateStr = currentDate.toISOString().split('T')[0];
        console.log(`Checking availability for date: ${dateStr}`);

        const isAvailable = await checkDateAvailability(doctorId, currentDate);
        if (isAvailable) {
          console.log(`Date available: ${dateStr}`);
          availableDates.push(currentDate);
        }
      }

      return availableDates;
    } catch (error) {
      console.error("Error getting available dates:", error);
      return [];
    }
  };

  // Load appointments on mount
  useEffect(() => {
    if (token) {
      getAppointments();
    }
  }, [token]);

  return (
    <AppointmentContext.Provider
      value={{
        loading,
        appointments,
        appointmentDetails,
        updateAppointmentDetails,
        clearAppointmentDetails,
        getAppointments,
        bookAppointment,
        cancelAppointment,
        getAvailableTimeSlots,
        checkDateAvailability,
        getAvailableDates
      }}
    >
      {children}
    </AppointmentContext.Provider>
  );
};

export const useAppointment = () => useContext(AppointmentContext);