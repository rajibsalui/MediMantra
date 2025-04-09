"use client";

// This file provides fallback values for environment variables
// and ensures they're always available to the client-side code

// Define default values
const DEFAULT_API_URL = "http://localhost:5000/api";
const DEFAULT_SOCKET_URL = "http://localhost:5000";

// Try to get values from process.env, fallback to defaults if not available
let apiUrl = DEFAULT_API_URL;
let socketUrl = DEFAULT_SOCKET_URL;

// Safely access environment variables
try {
  // First try process.env (for build-time env vars)
  if (typeof process !== 'undefined' && process.env) {
    if (process.env.NEXT_PUBLIC_API_URL) {
      apiUrl = process.env.NEXT_PUBLIC_API_URL;
    }
    if (process.env.NEXT_PUBLIC_SOCKET_URL) {
      socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL;
    }
  }

  // Try to load from next/config (for runtime config)
  if (typeof window !== 'undefined') {
    // Only import getConfig on the client side
    import('next/config').then(({ default: getConfig }) => {
      const { publicRuntimeConfig } = getConfig() || { publicRuntimeConfig: {} };
      if (publicRuntimeConfig) {
        if (publicRuntimeConfig.API_URL) {
          apiUrl = publicRuntimeConfig.API_URL;
        }
        if (publicRuntimeConfig.SOCKET_URL) {
          socketUrl = publicRuntimeConfig.SOCKET_URL;
        }
      }
    }).catch(() => {
      // Ignore errors, use defaults
    });
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
