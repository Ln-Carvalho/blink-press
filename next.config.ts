import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: '/admin', destination: '/keystatic', permanent: false },
      { source: '/admin/:path*', destination: '/keystatic/:path*', permanent: false },
      { source: '/radar/perspectivas/:slug*', destination: '/radar/:slug*', permanent: true },
    ];
  },
};

export default nextConfig;
