"use client";

import React, { createContext, useState, useContext, useEffect } from "react";
import axios from "axios";
import { useAuth } from "./AuthContext";
import { toast } from "react-hot-toast";

// Create context
const PatientContext = createContext();

// Custom hook to use patient context
export const usePatient = () => useContext(PatientContext);

// API URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export const PatientProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [patient, setPatient] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [appointmentsLoading, setAppointmentsLoading] = useState(false);
  const [patientError, setPatientError] = useState(null);

  // Fetch patient profile when authenticated
  useEffect(() => {
    if (isAuthenticated && user?.role === "patient") {
      getPatientProfile();
    }
  }, [isAuthenticated, user]);

  // Get patient profile
  const getPatientProfile = async () => {
    try {
      setLoading(true);
      setPatientError(null);
      const { data } = await axios.get(`${API_URL}/patients/profile`);
      setPatient(data.data);
      return data.data;
    } catch (error) {
      const message = error.response?.data?.message || "Failed to fetch patient profile";
      setPatientError(message);
      console.error("Error fetching patient profile:", error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Update patient profile
  const updatePatientProfile = async (profileData) => {
    try {
      setLoading(true);
      const { data } = await axios.put(`${API_URL}/patients/profile`, profileData);
      setPatient(data.data);
      toast.success("Profile updated successfully");
      return data.data;
    } catch (error) {
      const message = error.response?.data?.message || "Failed to update profile";
      toast.error(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  // Get patient appointments
  const getPatientAppointments = async (filters = {}) => {
    try {
      setAppointmentsLoading(true);
      // Construct query params from filters
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      const { data } = await axios.get(`${API_URL}/patients/appointments?${params.toString()}`);
      setAppointments(data.data);
      return data;
    } catch (error) {
      const message = error.response?.data?.message || "Failed to fetch appointments";
      toast.error(message);
      throw new Error(message);
    } finally {
      setAppointmentsLoading(false);
    }
  };

  // Book appointment
  const bookAppointment = async (appointmentData) => {
    try {
      setLoading(true);
      const { data } = await axios.post(`${API_URL}/patients/appointments`, appointmentData);
      // Refresh appointments list
      getPatientAppointments();
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
    try {
      setLoading(true);
      const { data } = await axios.put(`${API_URL}/patients/appointments/${appointmentId}/cancel`, { reason });
      // Refresh appointments list
      getPatientAppointments();
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

  // Update profile image
  const updateProfileImage = async (formData) => {
    try {
      setLoading(true);
      const { data } = await axios.put(`${API_URL}/patients/profile-image`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      // Update patient state with new image
      await getPatientProfile();
      toast.success("Profile image updated successfully");
      return data;
    } catch (error) {
      const message = error.response?.data?.message || "Failed to update profile image";
      toast.error(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PatientContext.Provider
      value={{
        patient,
        appointments,
        loading,
        appointmentsLoading,
        error: patientError,
        getPatientProfile,
        updatePatientProfile,
        getPatientAppointments,
        bookAppointment,
        cancelAppointment,
        updateProfileImage,
      }}
    >
      {children}
    </PatientContext.Provider>
  );
};

export default PatientContext;