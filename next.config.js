/** @type {import('next').NextConfig} */
const nextConfig = {
  // Change the port to 3001 to avoid conflicts with the API server
  experimental: {
    appDir: true
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
