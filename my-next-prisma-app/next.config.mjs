import pkg from '@next/bundle-analyzer';
const { withBundleAnalyzer } = pkg;

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Output configuration for Docker
  output: process.env.NODE_ENV === 'production' ? 'standalone' : undefined,
  
  // Disable ESLint during build for production
  eslint: {
    ignoreDuringBuilds: process.env.NODE_ENV === 'production',
  },
  
  // Disable TypeScript errors during build for production
  typescript: {
    ignoreBuildErrors: process.env.NODE_ENV === 'production',
  },
  
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  
  // Experimental features for Docker optimization
  experimental: {
    // Enable advanced features if needed
  },
};

// Export with bundle analyzer when ANALYZE=true
export default process.env.ANALYZE === 'true' 
  ? withBundleAnalyzer({ enabled: true })(nextConfig)
  : nextConfig; 