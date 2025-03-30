"use client";

import React, { createContext, useState, useContext, useEffect } from "react";
import axios from "axios";

// Create context
const DoctorListContext = createContext();

// Custom hook to use doctor list context
export const useDoctorList = () => useContext(DoctorListContext);

// API URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export const DoctorListProvider = ({ children }) => {
  const [doctors, setDoctors] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Fetch all doctors
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await axios.get(`${API_URL}/doctors`);
           console.log(response.data);
           
        if (response.data.success) {
          setDoctors(response.data.data);
          
          // Extract unique specialties from doctors
          const allSpecialties = response.data.data.reduce((acc, doctor) => {
            if (doctor.specialties && Array.isArray(doctor.specialties)) {
              doctor.specialties.forEach(specialty => {
                if (!acc.includes(specialty)) {
                  acc.push(specialty);
                }
              });
            }
            return acc;
          }, []);
          
          setSpecialties(allSpecialties.sort());
        } else {
          setError(response.data.message || "Failed to fetch doctors");
        }
      } catch (err) {
        console.error("Error fetching doctors:", err);
        setError("Failed to load doctors. Please try again later.");
        
        // Set fallback data for development
        setDoctors([
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
          {
            _id: "d2",
            user: {
              firstName: "Emily",
              lastName: "Johnson",
              profileImage: "/doctors/doctor-2.jpg"
            },
            specialties: ["Dermatology"],
            averageRating: 4.7,
            experience: 10,
            clinicDetails: {
              address: {
                city: "Boston"
              }
            },
            consultationFee: {
              inPerson: 120
            }
          },
          {
            _id: "d3",
            user: {
              firstName: "Michael",
              lastName: "Chen",
              profileImage: "/doctors/doctor-3.jpg"
            },
            specialties: ["Neurology"],
            averageRating: 4.9,
            experience: 12,
            clinicDetails: {
              address: {
                city: "Chicago"
              }
            },
            consultationFee: {
              inPerson: 170
            }
          },
          {
            _id: "d4",
            user: {
              firstName: "Sarah",
              lastName: "Garcia",
              profileImage: "/doctors/doctor-4.jpg"
            },
            specialties: ["Pediatrics"],
            averageRating: 4.6,
            experience: 8,
            clinicDetails: {
              address: {
                city: "Los Angeles"
              }
            },
            consultationFee: {
              inPerson: 130
            }
          }
        ]);
        
        setSpecialties(["Cardiology", "Dermatology", "Neurology", "Pediatrics", "Orthopedics"]);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  // Search doctors by name or specialty
  const searchDoctors = async (query) => {
    if (!query) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(`${API_URL}/doctors/search?query=${query}`);
      
      if (response.data.success) {
        setDoctors(response.data.data);
      } else {
        setError(response.data.message || "Failed to search doctors");
      }
    } catch (err) {
      console.error("Error searching doctors:", err);
      setError("Failed to search doctors. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Filter doctors by specialty
  const filterBySpecialty = async (specialty) => {
    if (!specialty) {
      // If no specialty selected, fetch all doctors
      try {
        setLoading(true);
        setError(null);
        
        const response = await axios.get(`${API_URL}/doctors`);
        
        if (response.data.success) {
          setDoctors(response.data.data);
        } else {
          setError(response.data.message || "Failed to fetch doctors");
        }
      } catch (err) {
        console.error("Error fetching doctors:", err);
        setError("Failed to load doctors. Please try again later.");
      } finally {
        setLoading(false);
      }
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(`${API_URL}/doctors/specialty/${specialty}`);
      
      if (response.data.success) {
        setDoctors(response.data.data);
      } else {
        setError(response.data.message || "Failed to filter doctors");
      }
    } catch (err) {
      console.error("Error filtering doctors:", err);
      setError("Failed to filter doctors. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DoctorListContext.Provider
      value={{
        doctors,
        specialties,
        loading,
        error,
        searchDoctors,
        filterBySpecialty
      }}
    >
      {children}
    </DoctorListContext.Provider>
  );
};

export default DoctorListContext;
