"use client";

import React, { createContext, useState, useContext, useEffect, useCallback, useMemo, useRef } from "react";
import axios from "axios";
import { API_URL } from "@/config/environment";

// Create context
const DoctorListContext = createContext();

// Custom hook to use doctor list context
export const useDoctorList = () => useContext(DoctorListContext);

// Create a simple cache outside component to persist between renders
const cache = {
  allDoctors: {
    data: null,
    timestamp: null,
    expiryTime: 5 * 60 * 1000, // 5 minutes
  },
  doctorsBySpecialty: {},
  searchResults: {}
};

export const DoctorListProvider = ({ children }) => {
  const [doctors, setDoctors] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [loading, setLoading] = useState(false); // Start with loading false to prevent immediate loading
  const [error, setError] = useState(null);

  // Use useRef instead of state for activeRequest to avoid re-renders
  const activeRequestRef = useRef(null);

  // Extract unique specialties from doctors list
  const extractSpecialties = useCallback((doctorsList) => {
    if (!doctorsList || !Array.isArray(doctorsList)) return [];

    const allSpecialties = doctorsList.reduce((acc, doctor) => {
      if (doctor.specialties && Array.isArray(doctor.specialties)) {
        doctor.specialties.forEach(specialty => {
          if (!acc.includes(specialty)) {
            acc.push(specialty);
          }
        });
      }
      return acc;
    }, []);

    return allSpecialties.sort();
  }, []);

  // Check if cache is valid
  const isCacheValid = useCallback((cacheEntry) => {
    return (
      cacheEntry?.data &&
      cacheEntry?.timestamp &&
      Date.now() - cacheEntry.timestamp < cacheEntry.expiryTime
    );
  }, []);

  // Fetch all doctors with caching - main fix for infinite loop
  const fetchAllDoctors = useCallback(async (forceRefresh = false) => {
    // Return cached data if valid
    if (!forceRefresh && isCacheValid(cache.allDoctors)) {
      setDoctors(cache.allDoctors.data);
      setSpecialties(extractSpecialties(cache.allDoctors.data));
      return;
    }

    // Cancel any ongoing request to prevent duplicate API calls
    if (activeRequestRef.current) {
      activeRequestRef.current.cancel("Operation canceled due to new request");
    }

    // Create a new cancellation token
    const cancelTokenSource = axios.CancelToken.source();
    activeRequestRef.current = cancelTokenSource;

    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(`${API_URL}/doctors`, {
        cancelToken: cancelTokenSource.token
      });

      if (response.data.success) {
        // Update cache
        cache.allDoctors = {
          data: response.data.data,
          timestamp: Date.now(),
          expiryTime: 5 * 60 * 1000
        };

        setDoctors(response.data.data);
        console.log(response.data)
        // Extract and set specialties
        const allSpecialties = extractSpecialties(response.data.data);
        setSpecialties(allSpecialties);
      } else {
        setError(response.data.message || "Failed to fetch doctors");
      }
    } catch (err) {
      if (!axios.isCancel(err)) {
        console.error("Error fetching doctors:", err);
        setError("Failed to load doctors. Please try again later.");

        // Set fallback data for development
        const fallbackData = [
          {
            _id: "d1",
            user: {
              firstName: "John",
              lastName: "Smith",
              profileImage: "/doctors/doctor-1.jpg"
            },
            specialties: ["Cardiology"],
            averageRating: 4.8,
            experience: 15,
            clinicDetails: {
              address: {
                city: "New York"
              }
            },
            consultationFee: {
              inPerson: 150
            }
          },
          // Other fallback doctors...
        ];

        setDoctors(fallbackData);
        setSpecialties(["Cardiology", "Dermatology", "Neurology", "Pediatrics", "Orthopedics"]);
      }
    } finally {
      setLoading(false);
      // Don't reset activeRequestRef here - only null it when component unmounts or when request completes normally
    }
  }, [extractSpecialties, isCacheValid]); // Remove activeRequest dependency

  // Initial fetch of doctors
  useEffect(() => {
    let isMounted = true;

    const loadInitialData = async () => {
      // Don't show loading indicator for initial data if cache is available
      if (isCacheValid(cache.allDoctors)) {
        if (isMounted) {
          setDoctors(cache.allDoctors.data);
          setSpecialties(extractSpecialties(cache.allDoctors.data));
        }
      } else {
        try {
          if (isMounted) setLoading(true);

          const cancelTokenSource = axios.CancelToken.source();
          activeRequestRef.current = cancelTokenSource;

          const response = await axios.get(`${API_URL}/doctors`, {
            cancelToken: cancelTokenSource.token
          });

          if (response.data.success && isMounted) {
            // Update cache
            cache.allDoctors = {
              data: response.data.data,
              timestamp: Date.now(),
              expiryTime: 5 * 60 * 1000
            };

            setDoctors(response.data.data);
            setSpecialties(extractSpecialties(response.data.data));
          }
        } catch (err) {
          if (!axios.isCancel(err) && isMounted) {
            console.error("Error in initial data fetch:", err);
            // Use fallback data similar to fetchAllDoctors
          }
        } finally {
          if (isMounted) setLoading(false);
        }
      }
    };

    loadInitialData();

    // Cleanup function to cancel any ongoing requests when component unmounts
    return () => {
      isMounted = false;
      if (activeRequestRef.current) {
        activeRequestRef.current.cancel("Component unmounted");
        activeRequestRef.current = null;
      }
    };
  }, [extractSpecialties, isCacheValid]); // Run this effect only once

  // Create a stable debounce function that doesn't change on re-renders
  const debounce = useCallback((fn, delay) => {
    let timeoutId;
    return (...args) => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => fn(...args), delay);
    };
  }, []);

  // Search doctors by name or specialty with debounce
  const searchDoctorsImpl = useCallback(async (query) => {
    if (!query) {
      if (isCacheValid(cache.allDoctors)) {
        setDoctors(cache.allDoctors.data);
        return;
      }
      fetchAllDoctors();
      return;
    }

    // Check cache for this search query
    const cacheKey = query.toLowerCase().trim();
    if (isCacheValid(cache.searchResults[cacheKey])) {
      setDoctors(cache.searchResults[cacheKey].data);
      return;
    }

    // Cancel any ongoing request
    if (activeRequestRef.current) {
      activeRequestRef.current.cancel("Operation canceled due to new request");
    }

    const cancelTokenSource = axios.CancelToken.source();
    activeRequestRef.current = cancelTokenSource;

    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(`${API_URL}/doctors/search?query=${query}`, {
        cancelToken: cancelTokenSource.token
      });

      if (response.data.success) {
        // Update cache
        cache.searchResults[cacheKey] = {
          data: response.data.data,
          timestamp: Date.now(),
          expiryTime: 2 * 60 * 1000 // 2 minutes for search results
        };

        setDoctors(response.data.data);
      } else {
        setError(response.data.message || "Failed to search doctors");
      }
    } catch (err) {
      if (!axios.isCancel(err)) {
        console.error("Error searching doctors:", err);
        setError("Failed to search doctors. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  }, [fetchAllDoctors, isCacheValid]);

  // Create a stable search function with debounce
  const searchDoctors = useMemo(() =>
    debounce(searchDoctorsImpl, 300),
    [searchDoctorsImpl, debounce]
  );

  // Filter doctors by specialty with caching
  const filterBySpecialty = useCallback(async (specialty) => {
    if (!specialty) {
      // If no specialty selected, use cached data if available
      if (isCacheValid(cache.allDoctors)) {
        setDoctors(cache.allDoctors.data);
        return;
      }
      fetchAllDoctors();
      return;
    }

    // Check cache for this specialty
    if (isCacheValid(cache.doctorsBySpecialty[specialty])) {
      setDoctors(cache.doctorsBySpecialty[specialty].data);
      return;
    }

    // Cancel any ongoing request
    if (activeRequestRef.current) {
      activeRequestRef.current.cancel("Operation canceled due to new request");
    }

    const cancelTokenSource = axios.CancelToken.source();
    activeRequestRef.current = cancelTokenSource;

    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(`${API_URL}/doctors/specialty/${specialty}`, {
        cancelToken: cancelTokenSource.token
      });

      if (response.data.success) {
        // Update cache
        cache.doctorsBySpecialty[specialty] = {
          data: response.data.data,
          timestamp: Date.now(),
          expiryTime: 5 * 60 * 1000 // 5 minutes for specialty filters
        };

        setDoctors(response.data.data);
      } else {
        setError(response.data.message || "Failed to filter doctors");
      }
    } catch (err) {
      if (!axios.isCancel(err)) {
        console.error("Error filtering doctors:", err);
        setError("Failed to filter doctors. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  }, [fetchAllDoctors, isCacheValid]);

  // Manual refresh function
  const refreshDoctors = useCallback(() => {
    fetchAllDoctors(true);
  }, [fetchAllDoctors]);

  // Memoized context value to prevent unnecessary re-renders
  const value = useMemo(() => ({
    doctors,
    specialties,
    loading,
    error,
    searchDoctors,
    filterBySpecialty,
    refreshDoctors
  }), [doctors, specialties, loading, error, searchDoctors, filterBySpecialty, refreshDoctors]);

  return (
    <DoctorListContext.Provider value={value}>
      {children}
    </DoctorListContext.Provider>
  );
};

export default DoctorListContext;
