import pkg from '@next/bundle-analyzer';
const { withBundleAnalyzer } = pkg;

/** @type {import('next').NextConfig} */
const nextConfig = {
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
};

// Export with bundle analyzer when ANALYZE=true
export default process.env.ANALYZE === 'true' 
  ? withBundleAnalyzer({ enabled: true })(nextConfig)
  : nextConfig; 