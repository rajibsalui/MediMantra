import type { NextConfig } from 'next';

// Import configuration from config.js
const config = require('./config');

const nextConfig: NextConfig = {
  images: {
    domains: ['plus.unsplash.com', 'images.unsplash.com','via.placeholder.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.unsplash.com',
      },
    ],
  },
  output: 'standalone',
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
    NEXT_PUBLIC_SOCKET_URL: process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000'
  },
  publicRuntimeConfig: config.publicRuntimeConfig,
  serverRuntimeConfig: config.serverRuntimeConfig,
  // Additional configuration to help with environment variable issues
  reactStrictMode: true,
  swcMinify: true
}

export default nextConfig;
