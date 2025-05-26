/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        //destination: 'http://localhost:8000/api/:path*'
        destination: process.env.NEXT_PUBLIC_API_URL 
          ? `${process.env.NEXT_PUBLIC_API_URL}/api/:path*`
          : 'http://localhost:8000/api/:path*',
      },
    ];
  },
  experimental: {
    esmExternals: true
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.join(__dirname, 'src')
    };
    return config;
  },
};

module.exports = nextConfig; 