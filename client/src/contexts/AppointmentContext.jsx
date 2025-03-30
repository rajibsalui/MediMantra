"use client";

import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useAuth } from "./AuthContext";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const AppointmentContext = createContext();

export const AppointmentProvider = ({ children }) => {
  const { token, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [appointmentDetails, setAppointmentDetails] = useState({
    doctor: null,
    date: new Date(),
    timeSlot: "",
    appointmentType: "in-person",
    reason: "",
    prescriptionFiles: []
  });

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
  const getAppointments = async (status = "") => {
    if (!token) {
      toast.error("Authentication required");
      return [];
    }

    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (status) params.append("status", status);

      const { data } = await axios.get(
        `${API_URL}/patients/appointments?${params.toString()}`, 
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
      toast.error("Authentication required");
      throw new Error("No authentication token available");
    }

    if (!appointmentDetails.doctor || !appointmentDetails.date || !appointmentDetails.timeSlot) {
      toast.error("Please select a doctor, date and time slot");
      throw new Error("Missing required appointment details");
    }

    try {
      setLoading(true);
      
      const appointmentData = {
        doctorId: appointmentDetails.doctor._id,
        appointmentDate: appointmentDetails.date.toISOString(),
        appointmentTime: appointmentDetails.timeSlot,
        appointmentType: appointmentDetails.appointmentType,
        reason: appointmentDetails.reason
      };
      
      const { data } = await axios.post(
        `${API_URL}/patients/appointments`, 
        appointmentData, 
        getAuthHeaders()
      );
      
      // Refresh appointments list
      await getAppointments();
      
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
      const formattedDate = date.toISOString().split('T')[0];
      const { data } = await axios.get(
        `${API_URL}/doctors/${doctorId}/availability?date=${formattedDate}`,
        getAuthHeaders()
      );
      
      return data.data || [];
    } catch (error) {
      console.error("Error fetching available time slots:", error);
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
        getAvailableTimeSlots
      }}
    >
      {children}
    </AppointmentContext.Provider>
  );
};

export const useAppointment = () => useContext(AppointmentContext);