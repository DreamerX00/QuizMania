import pkg from "@next/bundle-analyzer";
const { withBundleAnalyzer } = pkg;

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Output configuration for Docker
  output: process.env.NODE_ENV === "production" ? "standalone" : undefined,

  // Only ignore ESLint/TypeScript in CI environments, not general production
  eslint: {
    ignoreDuringBuilds: process.env.CI === "true",
  },

  typescript: {
    ignoreBuildErrors: process.env.CI === "true",
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "placehold.co",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "img.clerk.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.clerk.dev",
        port: "",
        pathname: "/**",
      },
    ],
  },

  // Experimental features for Docker optimization
  experimental: {
    // Enable advanced features if needed
  },

  webpack: (config, { isServer }) => {
    // Fix for Prisma client module resolution
    if (isServer) {
      config.externals.push({
        "@prisma/client": "commonjs @prisma/client",
      });
    }

    return config;
  },
};

// Export with bundle analyzer when ANALYZE=true
export default process.env.ANALYZE === "true"
  ? withBundleAnalyzer({ enabled: true })(nextConfig)
  : nextConfig;
