"use client";

// This file provides fallback values for environment variables
// and ensures they're always available to the client-side code

export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
export const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000";

// Export a default config object for convenience
export default {
  API_URL,
  SOCKET_URL
};
