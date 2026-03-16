// next.config.js

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'utfs.io',  // UploadThing image URLs
      },
      {
        protocol: 'https',
        hostname: '*.uploadthing.com',
      },
    ],
  },
  // Enable strict mode for better debugging
  reactStrictMode: true,
}

module.exports = nextConfig