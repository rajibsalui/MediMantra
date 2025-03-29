"use client";

import React, { createContext, useState, useContext, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "react-hot-toast";

// Create context
const AuthContext = createContext();

// Custom hook to use auth context
export const useAuth = () => useContext(AuthContext);

// API URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Check if user is authenticated on mount
  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem("accessToken");
      
      if (storedToken) {
        try {
          // Set default auth header
          axios.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`;
          
          // Fetch current user
          const { data } = await axios.get(`${API_URL}/auth/current-user`);
          
          setUser(data.data);
          setToken(storedToken);
        } catch (error) {
          console.error("Auth check error:", error);
          
          // If token is invalid or expired, try to refresh
          const refreshToken = localStorage.getItem("refreshToken");
          if (refreshToken) {
            try {
              await refreshAccessToken(refreshToken);
            } catch (refreshError) {
              // Clear auth state if refresh fails
              localStorage.removeItem("accessToken");
              localStorage.removeItem("refreshToken");
              delete axios.defaults.headers.common["Authorization"];
            }
          }
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Register user
  const register = async (userData, role = "patient") => {
    try {
      setLoading(true);
      const endpoint = "/auth/register";
      const { data } = await axios.post(`${API_URL}${endpoint}`, userData);
      
      // Store tokens if returned immediately
      if (data.token) {
        localStorage.setItem("accessToken", data.token);
        axios.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;
      }
      
      // Set user if available
      if (data.user) {
        setUser(data.user);
        setToken(data.token);
      }
      
      return data;
    } catch (error) {
      const message = error.response?.data?.message || "Registration failed";
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  // Login user
  const login = async (credentials) => {
    try {
      setLoading(true);
      
      const { data } = await axios.post(`${API_URL}/auth/login`, credentials);
      
      // Store token
      if (data.token) {
        localStorage.setItem("accessToken", data.token);
        localStorage.setItem("userId", data.user.id);
        axios.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;
      }
      
      setUser(data.user);
      setToken(data.token);
      
      return data;
    } catch (error) {
      const message = error.response?.data?.message || "Login failed";
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  // Logout user
  const logout = async () => {
    try {
      setLoading(true);
      
      // Call API to invalidate token on server
      if (token) {
        await axios.post(`${API_URL}/auth/logout`);
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Clear state and storage
      setUser(null);
      setToken(null);
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      delete axios.defaults.headers.common["Authorization"];
      setLoading(false);
      
      // Redirect to login
      router.push("/login");
    }
  };

  // Refresh access token
  const refreshAccessToken = async (refreshToken) => {
    try {
      setLoading(true);
      const { data } = await axios.post(`${API_URL}/auth/refresh-token`, { refreshToken });
      
      // Store new access token
      localStorage.setItem("accessToken", data.accessToken);
      axios.defaults.headers.common["Authorization"] = `Bearer ${data.accessToken}`;
      
      setToken(data.accessToken);
      
      return data;
    } catch (error) {
      const message = error.response?.data?.message || "Failed to refresh token";
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  // Password reset request
  const forgotPassword = async (email) => {
    try {
      setLoading(true);
      const { data } = await axios.post(`${API_URL}/auth/forgot-password`, { email });
      return data;
    } catch (error) {
      const message = error.response?.data?.message || "Failed to send reset link";
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  // Reset password with token
  const resetPassword = async (token, password) => {
    try {
      setLoading(true);
      const { data } = await axios.post(`${API_URL}/auth/reset-password`, { token, password });
      return data;
    } catch (error) {
      const message = error.response?.data?.message || "Password reset failed";
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  // Change password
  const changePassword = async (currentPassword, newPassword) => {
    try {
      setLoading(true);
      const { data } = await axios.put(`${API_URL}/auth/change-password`, {
        currentPassword,
        newPassword
      });
      return data;
    } catch (error) {
      const message = error.response?.data?.message || "Password change failed";
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  // Verify email
  const verifyEmail = async (token) => {
    try {
      setLoading(true);
      const { data } = await axios.post(`${API_URL}/auth/verify-email`, { token });
      return data;
    } catch (error) {
      const message = error.response?.data?.message || "Email verification failed";
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  // Resend verification email
  const resendVerificationEmail = async (email) => {
    try {
      setLoading(true);
      const { data } = await axios.post(`${API_URL}/auth/resend-verification-email`, { email });
      return data;
    } catch (error) {
      const message = error.response?.data?.message || "Failed to resend verification email";
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  // Verify phone number
  const verifyPhone = async (phone, otp) => {
    try {
      setLoading(true);
      const { data } = await axios.post(`${API_URL}/auth/verify-phone`, { phone, otp });
      return data;
    } catch (error) {
      const message = error.response?.data?.message || "Phone verification failed";
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  // Get current user profile
  const getCurrentUser = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${API_URL}/auth/current-user`);
      setUser(data.data);
      return data;
    } catch (error) {
      const message = error.response?.data?.message || "Failed to get user profile";
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  // Social login (Google)
  const googleLogin = async (idToken) => {
    try {
      setLoading(true);
      const { data } = await axios.post(`${API_URL}/auth/google`, { idToken });
      
      // Store token
      if (data.token) {
        localStorage.setItem("accessToken", data.token);
        axios.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;
      }
      
      setUser(data.user);
      setToken(data.token);
      
      return data;
    } catch (error) {
      const message = error.response?.data?.message || "Google login failed";
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  // Social login (Facebook)
  const facebookLogin = async (accessToken, userId) => {
    try {
      setLoading(true);
      const { data } = await axios.post(`${API_URL}/auth/facebook`, { 
        accessToken, 
        userId 
      });
      
      // Store token
      if (data.token) {
        localStorage.setItem("accessToken", data.token);
        axios.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;
      }
      
      setUser(data.user);
      setToken(data.token);
      
      return data;
    } catch (error) {
      const message = error.response?.data?.message || "Facebook login failed";
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  // Update user profile
  const updateProfile = async (profileData) => {
    try {
      setLoading(true);
      const { data } = await axios.put(`${API_URL}/auth/profile`, profileData);
      
      // Update user state with new profile data
      setUser(prevUser => ({
        ...prevUser,
        ...data.data
      }));
      
      return data;
    } catch (error) {
      const message = error.response?.data?.message || "Profile update failed";
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user,
        register,
        login,
        logout,
        refreshAccessToken,
        forgotPassword,
        resetPassword,
        changePassword,
        verifyEmail,
        resendVerificationEmail,
        verifyPhone,
        getCurrentUser,
        googleLogin,
        facebookLogin,
        updateProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;