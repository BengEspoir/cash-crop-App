/** @type {import('next').NextConfig} */
const apiProxyTarget = (
  process.env.API_PROXY_TARGET || 'https://cash-crop-app-production-9f79.up.railway.app'
).replace(new RegExp('/+$'), '');

const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api',
        destination: `${apiProxyTarget}/api`,
      },
      {
        source: '/api/:path*',
        destination: `${apiProxyTarget}/api/:path*`,
      },
    ];
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: '*.supabase.co' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'plus.unsplash.com' },
    ],
  },
};

module.exports = nextConfig;
