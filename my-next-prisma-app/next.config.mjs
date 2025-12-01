import pkg from "@next/bundle-analyzer";
const { withBundleAnalyzer } = pkg;

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable standalone output for Vercel (uses its own optimization)
  // output: process.env.NODE_ENV === "production" ? "standalone" : undefined,

  // Ignore ESLint/TypeScript during builds (warnings are logged but don't block)
  eslint: {
    ignoreDuringBuilds: true,
  },

  typescript: {
    ignoreBuildErrors: false, // Keep TypeScript checks strict
  },

  // Enable production optimizations
  reactStrictMode: true,

  // Optimize production builds
  poweredByHeader: false,
  compress: true, // Security headers for production
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
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
