import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.shopify.com',
      },
    ],
    // ✅ Enable modern image formats
    formats: ['image/avif', 'image/webp'],
    // ✅ Optimize image loading
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // ✅ Enable image optimization
    minimumCacheTTL: 86400, // 24 hours
  },
  // ✅ Enable compiler optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // ✅ Enable React optimizations
  reactStrictMode: true,
};

export default nextConfig;