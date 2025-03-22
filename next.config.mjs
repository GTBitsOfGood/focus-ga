/** @type {import('next').NextConfig} */

// next.config.mjs
const nextConfig = {
    experimental: {
      serverActions: {
        allowedOrigins: [
          'https://focus-ga.my.site.com',
          'https://focus-ga.netlify.app',
        ],
      },
    },
    async headers() {
      return [
        {
          source: '/:path*',
          headers: [
            { key: 'x-forwarded-host', value: 'focus-ga.netlify.app' },
            { key: 'origin', value: 'focus-ga.netlify.app' },
          ],
        },
      ];
    },
  };

export default nextConfig;
