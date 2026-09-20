/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  async rewrites() {
    return [
      {
        // /api から始まるリクエストをすべてバックエンド Pod へプロキシ
        source: '/api/:path*',
        destination: process.env.BACKEND_URL 
          ? `${process.env.BACKEND_URL}/api/:path*`
          : 'http://backend.bluestarth.svc.cluster.local:4000/api/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
