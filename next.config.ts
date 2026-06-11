import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: '/admin', destination: '/keystatic', permanent: false },
      { source: '/admin/:path*', destination: '/keystatic/:path*', permanent: false },
    ];
  },
};

export default nextConfig;
