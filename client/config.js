// This file provides fallback values for environment variables
// and ensures they're always available to the client-side code

// Define default values
const DEFAULT_API_URL = "http://localhost:5000/api";
const DEFAULT_SOCKET_URL = "http://localhost:5000";

// Export configuration
module.exports = {
  publicRuntimeConfig: {
    API_URL: process.env.NEXT_PUBLIC_API_URL || DEFAULT_API_URL,
    SOCKET_URL: process.env.NEXT_PUBLIC_SOCKET_URL || DEFAULT_SOCKET_URL
  },
  serverRuntimeConfig: {
    API_URL: process.env.NEXT_PUBLIC_API_URL || DEFAULT_API_URL,
    SOCKET_URL: process.env.NEXT_PUBLIC_SOCKET_URL || DEFAULT_SOCKET_URL
  }
};
