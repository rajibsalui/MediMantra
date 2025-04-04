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
  const { user, isAuthenticated, token } = useAuth();
  const [doctor, setDoctor] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [dashboardStats, setDashboardStats] = useState({
    totalPatients: 0,
    totalAppointments: 0,
    totalRevenue: 0,
    averageRating: 0,
    upcomingAppointments: 0,
    pendingAppointments: 0
  });
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState({
    profile: false,
    appointments: false,
    patients: false,
    reviews: false,
    stats: false
  });

  // Configure axios with auth token
  const getAuthHeaders = () => {
    return {
      headers: {
        Authorization: `Bearer ${token}`
      }
    };
  };

  // Fetch doctor profile when authenticated
  useEffect(() => {
    if (isAuthenticated && user?.role === "doctor" && token) {
      getDoctorProfile();
    }
  }, [isAuthenticated, user, token]);

  // Get doctor profile
  const getDoctorProfile = async () => {
    if (!token) {
      console.warn("No authentication token available");
      return null;
    }

    try {
      setDataLoading(prev => ({ ...prev, profile: true }));
      const { data } = await axios.get(
        `${API_URL}/doctors/profile`, 
        getAuthHeaders()
      );
      setDoctor(data.data);
      return data.data;
    } catch (error) {
      const message = error.response?.data?.message || "Failed to fetch doctor profile";
      console.error("Error fetching doctor profile:", error);
      return null;
    } finally {
      setDataLoading(prev => ({ ...prev, profile: false }));
    }
  };

  // Get doctor appointments
  const getDoctorAppointments = async (filters = {}) => {
    if (!token) {
      return [];
    }

    try {
      setDataLoading(prev => ({ ...prev, appointments: true }));
      // Construct query params from filters
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      const { data } = await axios.get(
        `${API_URL}/doctors/appointments?${params.toString()}`, 
        getAuthHeaders()
      );
      setAppointments(data.data);
      return data.data;
    } catch (error) {
      console.error("Error fetching doctor appointments:", error);
      return [];
    } finally {
      setDataLoading(prev => ({ ...prev, appointments: false }));
    }
  };

  // Get dashboard stats
  const getDashboardStats = async () => {
    if (!token) {
      return null;
    }

    try {
      setDataLoading(prev => ({ ...prev, stats: true }));
      const { data } = await axios.get(
        `${API_URL}/doctors/dashboard-stats`, 
        getAuthHeaders()
      );
      setDashboardStats(data.data);
      return data.data; 
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      // Set fallback stats with dummy data for testing
      const fallbackStats = {
        totalPatients: 45,
        totalAppointments: 120,
        totalRevenue: 12500,
        averageRating: 4.7,
        upcomingAppointments: 8,
        pendingAppointments: 3,
        recentPatients: [],
        appointmentsByStatus: {
          completed: 85,
          upcoming: 25,
          cancelled: 10
        },
        revenueByMonth: [
          { month: "Jan", amount: 800 },
          { month: "Feb", amount: 1200 },
          { month: "Mar", amount: 900 },
          { month: "Apr", amount: 1500 },
          { month: "May", amount: 2100 },
          { month: "Jun", amount: 1800 }
        ]
      };
      setDashboardStats(fallbackStats);
      return fallbackStats;
    } finally {
      setDataLoading(prev => ({ ...prev, stats: false }));
    }
  };

  // Get doctor's patients
  const getDoctorPatients = async () => {
    if (!token) {
      return [];
    }

    try {
      setDataLoading(prev => ({ ...prev, patients: true }));
      const { data } = await axios.get(
        `${API_URL}/doctors/patients`, 
        getAuthHeaders()
      );
      setPatients(data.data);
      return data.data;
    } catch (error) {
      console.error("Error fetching doctor patients:", error);
      return [];
    } finally {
      setDataLoading(prev => ({ ...prev, patients: false }));
    }
  };

  // Get doctor reviews
  const getDoctorReviews = async () => {
    if (!token) {
      return [];
    }

    try {
      setDataLoading(prev => ({ ...prev, reviews: true }));
      const { data } = await axios.get(
        `${API_URL}/doctors/reviews`, 
        getAuthHeaders()
      );
      setReviews(data.data);
      return data.data;
    } catch (error) {
      console.error("Error fetching doctor reviews:", error);
      return [];
    } finally {
      setDataLoading(prev => ({ ...prev, reviews: false }));
    }
  };

  // Update appointment status
  const updateAppointmentStatus = async (appointmentId, status) => {
    if (!token) {
      toast.error("Authentication required");
      throw new Error("No authentication token available");
    }

    try {
      setLoading(true);
      const { data } = await axios.put(
        `${API_URL}/doctors/appointments/${appointmentId}/status`, 
        { status }, 
        getAuthHeaders()
      );
      // Refresh appointments list
      getDoctorAppointments();
      toast.success(`Appointment ${status} successfully`);
      return data;
    } catch (error) {
      const message = error.response?.data?.message || `Failed to update appointment status`;
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
        getDoctorProfile,
        getDoctorAppointments,
        getDoctorPatients,
        getDoctorReviews,
        getDashboardStats,
        updateAppointmentStatus
      }}
    >
      {children}
    </DoctorContext.Provider>
  );
};

export default DoctorContext;