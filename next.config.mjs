/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  images: {},
  env: {
    NEXT_PUBLIC_JWT_SECRET: process.env.JWT_SECRET,
  },
};

export default nextConfig;
