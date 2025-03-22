/** @type {import('next').NextConfig} */

const nextConfig = {
    experimental: {
      serverActions: {
        allowedOrigins: [
          'https://focus-ga.my.site.com',
          'https://focus-ga.netlify.app',
        ],
      },
    },
  };

export default nextConfig;
