import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: false,
  async rewrites() {
    return [
      {
        source: "/api/payment/:path*",
        destination: `${process.env.API_GATEWAY_URL}/api/payment/:path*`,
      },
    ]
  },
};

export default nextConfig;
