/** @type {import('next').NextConfig} */
const nextConfig = {
  // Change the port to 3001 to avoid conflicts with the API server
  experimental: {
    appDir: true
  }
};

module.exports = nextConfig;
