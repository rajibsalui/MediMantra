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
  // Add this to handle build errors more gracefully
  onError: async (err: Error) => {
    console.error('Next.js build error:', err);
  },
}

export default nextConfig;

