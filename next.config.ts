import type { NextConfig } from "next";

const API_URL = process.env.NEXT_PUBLIC_API_URL;


if (!API_URL) {
  throw new Error(
    "NEXT_PUBLIC_API_URL is missing. Add it to .env.local (local) or to the hosting env settings (deploy)."
  );
}
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