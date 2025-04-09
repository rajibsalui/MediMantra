/** @type {import('next').NextConfig} */

// Import configuration from config.js
const config = require('./config');

const nextConfig = {
  images: {
    domains: ['plus.unsplash.com', 'images.unsplash.com','via.placeholder.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.unsplash.com',
      },
    ],
  },
  // Removed static export to support dynamic routes
  // output: 'export',
  distDir: 'dist',
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
    NEXT_PUBLIC_SOCKET_URL: process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000'
  },
  publicRuntimeConfig: config.publicRuntimeConfig,
  serverRuntimeConfig: config.serverRuntimeConfig,
  // Additional configuration
  reactStrictMode: true
}

module.exports = nextConfig;
