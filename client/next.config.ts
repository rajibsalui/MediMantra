import type { NextConfig } from 'next';

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
}

export default nextConfig;

