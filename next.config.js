const withNextIntl = require('next-intl/plugin')('./src/i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // ⚠️ Dangereux: Ignore les erreurs TypeScript pendant la production build
    ignoreBuildErrors: true,
  },
  images: {
    domains: ['pbs.twimg.com', 'abs.twimg.com', 'cdn.bsky.app']
  },
  headers: async () => [
    {
      source: '/:path*',
      headers: [
        {
          key: 'X-DNS-Prefetch-Control',
          value: 'on'
        },
        {
          key: 'X-XSS-Protection',
          value: '1; mode=block'
        },
        {
          key: 'X-Frame-Options',
          value: 'DENY'
        },
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff'
        },
        {
          key: 'Referrer-Policy',
          value: 'origin-when-cross-origin'
        },
        {
          key: 'Permissions-Policy',
          value: 'camera=(), microphone=(), geolocation=()'
        }
      ]
    }
  ],
  output: 'standalone',
  experimental: {
    // Optimisations pour le développement
    workerThreads: true,
    cpus: 4
  },
  // Optimisations de développement
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      // Désactiver certaines optimisations en développement pour accélérer le rechargement
      config.optimization.splitChunks = false;
      config.optimization.runtimeChunk = false;
    }
    return config;
  }
};

module.exports = withNextIntl(nextConfig);