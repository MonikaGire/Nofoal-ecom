/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      { source: '/return-policy.html', destination: '/return-policy', permanent: true },
    ];
  },

  // Proxy /api/* to Express backend
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/:path*`,
      },
      {
        source: '/uploads/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/uploads/:path*`,
      },
    ];
  },

  // Allow images from localhost in development
  images: {
    domains: ['localhost', 'nofoal-server.up.railway.app'],
  },

  // Keep existing asset paths working
  async headers() {
    return [
      {
        source: '/asset/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
