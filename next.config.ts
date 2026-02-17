import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 's3c.nyc3.cdn.digitaloceanspaces.com',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 's3i.nyc3.cdn.digitaloceanspaces.com',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'santerialacatedral.com.ar',
        pathname: '**',
      },
    ],
  },
};

export default nextConfig;
