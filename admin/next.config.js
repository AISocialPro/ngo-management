/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Enable the app router if you’re using /app
  experimental: { appDir: true },
  images: { domains: ["randomuser.me", "cdn-icons-png.flaticon.com"] },
};

module.exports = nextConfig;
