"use client";

import React, { createContext, useState, useContext, useEffect } from "react";
import axios from "axios";
import { useAuth } from "./AuthContext";
import { toast } from "react-hot-toast";

// Create context
const DoctorContext = createContext();

// Custom hook to use doctor context
export const useDoctor = () => useContext(DoctorContext);

// API URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export const DoctorProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [doctor, setDoctor] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState({
    appointments: false,
    patients: false,
    reviews: false,
    dashboard: false,
  });
  const [doctorError, setDoctorError] = useState(null);

  // Fetch doctor profile when authenticated
  useEffect(() => {
    if (isAuthenticated && user?.role === "doctor") {
      getDoctorProfile();
    }
  }, [isAuthenticated, user]);

  // Get doctor profile
  const getDoctorProfile = async () => {
    try {
      setLoading(true);
      setDoctorError(null);
      const { data } = await axios.get(`${API_URL}/doctors/profile`);
      setDoctor(data.data);
      return data.data;
    } catch (error) {
      const message = error.response?.data?.message || "Failed to fetch doctor profile";
      setDoctorError(message);
      console.error("Error fetching doctor profile:", error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Update doctor profile
  const updateDoctorProfile = async (profileData) => {
    try {
      setLoading(true);
      const { data } = await axios.put(`${API_URL}/doctors/profile`, profileData);
      setDoctor(data.data);
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

  // Get doctor appointments
  const getDoctorAppointments = async (filters = {}) => {
    try {
      setDataLoading(prev => ({ ...prev, appointments: true }));
      // Construct query params from filters
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      const { data } = await axios.get(`${API_URL}/doctors/appointments?${params.toString()}`);
      setAppointments(data.data);
      return data;
    } catch (error) {
      const message = error.response?.data?.message || "Failed to fetch appointments";
      toast.error(message);
      throw new Error(message);
    } finally {
      setDataLoading(prev => ({ ...prev, appointments: false }));
    }
  };

  // Get doctor patients
  const getDoctorPatients = async (filters = {}) => {
    try {
      setDataLoading(prev => ({ ...prev, patients: true }));
      // Construct query params from filters
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      const { data } = await axios.get(`${API_URL}/doctors/patients?${params.toString()}`);
      setPatients(data.data);
      return data;
    } catch (error) {
      const message = error.response?.data?.message || "Failed to fetch patients";
      toast.error(message);
      throw new Error(message);
    } finally {
      setDataLoading(prev => ({ ...prev, patients: false }));
    }
  };

  // Get doctor reviews
  const getDoctorReviews = async () => {
    try {
      setDataLoading(prev => ({ ...prev, reviews: true }));
      const { data } = await axios.get(`${API_URL}/doctors/reviews`);
      setReviews(data.data);
      return data.data;
    } catch (error) {
      const message = error.response?.data?.message || "Failed to fetch reviews";
      toast.error(message);
      throw new Error(message);
    } finally {
      setDataLoading(prev => ({ ...prev, reviews: false }));
    }
  };

  // Get dashboard stats
  const getDashboardStats = async () => {
    try {
      setDataLoading(prev => ({ ...prev, dashboard: true }));
      const { data } = await axios.get(`${API_URL}/doctors/dashboard-stats`);
      setDashboardStats(data.data);
      return data.data;
    } catch (error) {
      const message = error.response?.data?.message || "Failed to fetch dashboard statistics";
      toast.error(message);
      throw new Error(message);
    } finally {
      setDataLoading(prev => ({ ...prev, dashboard: false }));
    }
  };

  // Update doctor availability
  const updateAvailability = async (availabilityData) => {
    try {
      setLoading(true);
      const { data } = await axios.put(`${API_URL}/doctors/availability`, { availability: availabilityData });
      // Update doctor object with new availability
      setDoctor(prev => ({ ...prev, availability: data.data }));
      toast.success("Availability updated successfully");
      return data;
    } catch (error) {
      const message = error.response?.data?.message || "Failed to update availability";
      toast.error(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  // Toggle availability status
  const toggleAvailability = async () => {
    try {
      setLoading(true);
      const { data } = await axios.put(`${API_URL}/doctors/toggle-availability`);
      setDoctor(prev => ({ ...prev, isAvailable: data.data.isAvailable }));
      toast.success(data.message);
      return data;
    } catch (error) {
      const message = error.response?.data?.message || "Failed to toggle availability";
      toast.error(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  // Upload verification documents
  const uploadVerificationDocuments = async (formData) => {
    try {
      setLoading(true);
      const { data } = await axios.post(`${API_URL}/doctors/verification-documents`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      // Update doctor state with new documents
      await getDoctorProfile();
      toast.success("Documents uploaded successfully");
      return data;
    } catch (error) {
      const message = error.response?.data?.message || "Failed to upload documents";
      toast.error(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  // Add education
  const addEducation = async (educationData) => {
    try {
      setLoading(true);
      const { data } = await axios.post(`${API_URL}/doctors/education`, educationData);
      // Update doctor state with new education
      setDoctor(prev => ({ ...prev, qualifications: data.data }));
      toast.success("Education added successfully");
      return data;
    } catch (error) {
      const message = error.response?.data?.message || "Failed to add education";
      toast.error(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  // Remove education
  const removeEducation = async (educationId) => {
    try {
      setLoading(true);
      const { data } = await axios.delete(`${API_URL}/doctors/education/${educationId}`);
      // Update doctor state with updated qualifications
      setDoctor(prev => ({ ...prev, qualifications: data.data }));
      toast.success("Education removed successfully");
      return data;
    } catch (error) {
      const message = error.response?.data?.message || "Failed to remove education";
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
      const { data } = await axios.put(`${API_URL}/doctors/profile-image`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      // Update doctor state with new image
      await getDoctorProfile();
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

  // Delete doctor account
  const deleteAccount = async () => {
    try {
      setLoading(true);
      const { data } = await axios.delete(`${API_URL}/doctors`);
      toast.success("Account deleted successfully");
      return data;
    } catch (error) {
      const message = error.response?.data?.message || "Failed to delete account";
      toast.error(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DoctorContext.Provider
      value={{
        doctor,
        appointments,
        patients,
        reviews,
        dashboardStats,
        loading,
        dataLoading,
        error: doctorError,
        getDoctorProfile,
        updateDoctorProfile,
        getDoctorAppointments,
        getDoctorPatients,
        getDoctorReviews,
        getDashboardStats,
        updateAvailability,
        toggleAvailability,
        uploadVerificationDocuments,
        addEducation,
        removeEducation,
        updateProfileImage,
        deleteAccount,
      }}
    >
      {children}
    </DoctorContext.Provider>
  );
};

export default DoctorContext;