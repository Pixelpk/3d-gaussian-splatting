import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "3d-models-viewer.s3.us-east-1.amazonaws.com",
        pathname: "/**",
      },
    ],
  },
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "@heroicons/react",
      "@radix-ui/react-icons",
    ],
    serverActions: {
      bodySizeLimit: "300mb",
    },
    middlewareClientMaxBodySize: "300mb", // Increase Edge runtime body size limit
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
};

export default nextConfig;
