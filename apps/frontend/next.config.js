const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone',
    // Ensure correct workspace root is used in a monorepo during output file tracing
    // to avoid Next.js inferring the repository root lockfile.
    outputFileTracingRoot: path.join(__dirname, '../..'),
    reactStrictMode: true,
    trailingSlash: true,
    images: {
      remotePatterns: [
        {
          protocol: 'https',
          hostname: 'campomaq.blob.core.windows.net',
          pathname: '/**',
        },
      ],
      // OR if you want to allow multiple domains:
      // domains: ['campomaq.blob.core.windows.net'],
    },
    webpack(config) {
      config.module.rules.push({
        test: /\.(mp4|webm)$/,
        use: {
          loader: 'file-loader',
          options: {
            publicPath: '/_next/static/videos/',
            outputPath: 'static/videos/',
            name: '[name].[hash].[ext]',
          },
        },
      })
      return config
    },
  }
   
  module.exports = nextConfig