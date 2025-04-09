"use client";

// This file provides fallback values for environment variables
// and ensures they're always available to the client-side code

// Define default values
const DEFAULT_API_URL = "http://localhost:5000/api";
const DEFAULT_SOCKET_URL = "http://localhost:5000";

// Initialize with default values
let apiUrl = DEFAULT_API_URL;
let socketUrl = DEFAULT_SOCKET_URL;

// Safely access environment variables
try {
  // Access Next.js public environment variables
  // These are safe to use in both client and server contexts
  if (process.env.NEXT_PUBLIC_API_URL) {
    apiUrl = process.env.NEXT_PUBLIC_API_URL;
  }
  if (process.env.NEXT_PUBLIC_SOCKET_URL) {
    socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL;
  }

  // For client-side only, we can try to get runtime config
  // This is wrapped in a condition to avoid issues during SSR
  if (typeof window !== 'undefined') {
    // We use a synchronous require for getConfig to avoid issues with dynamic imports during SSR
    try {
      // Using a safer approach that won't break SSR
      const getConfig = require('next/config').default;
      const { publicRuntimeConfig } = getConfig() || { publicRuntimeConfig: {} };

      if (publicRuntimeConfig) {
        if (publicRuntimeConfig.API_URL) {
          apiUrl = publicRuntimeConfig.API_URL;
        }
        if (publicRuntimeConfig.SOCKET_URL) {
          socketUrl = publicRuntimeConfig.SOCKET_URL;
        }
      }
    } catch (configError) {
      // Silently fail and use the values we already have
      console.warn("Could not load runtime config, using environment variables or defaults");
    }
  }
} catch (error) {
  console.warn("Error accessing environment variables:", error);
  // Continue with default values
}

export const API_URL = apiUrl;
export const SOCKET_URL = socketUrl;

// Export a default config object for convenience
export default {
  API_URL,
  SOCKET_URL
};
