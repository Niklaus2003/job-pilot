import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  serverExternalPackages: ["mammoth"],
  async rewrites() {
    const backendUrl = process.env.BACKEND_API_URL || "http://127.0.0.1:8000";
    return [
      {
        source: "/api/backend/:path*",
        destination: `${backendUrl}/api/backend/:path*`,
      },
    ];
  },
};

export default nextConfig;
