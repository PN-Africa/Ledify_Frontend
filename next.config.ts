import type { NextConfig } from "next";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },

  // Forward preview/download requests to the backend,
  // so iframes load them from our own address
  async rewrites() {
    return [
      {
        source: "/api/webpages/:path*",
        destination: `${API_URL}/api/webpages/:path*`,
      },
      {
        source: "/api/documents/:path*",
        destination: `${API_URL}/api/documents/:path*`,
      },
      {
        source: "/api/presentations/:path*",
        destination: `${API_URL}/api/presentations/:path*`,
      },
    ];
  },
};

export default nextConfig;