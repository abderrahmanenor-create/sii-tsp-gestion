import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  // Autoriser les origines de développement pour le preview
  allowedDevOrigins: [
    'preview-chat-710f87eb-adb8-41bd-9393-eccc7f37b62c.space.z.ai',
    'localhost:3000'
  ],
  // Configuration des images
  images: {
    remotePatterns: [],
    unoptimized: true,
  },
  // PWA Configuration
  headers: async () => {
    return [
      {
        source: '/sw.js',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
          {
            key: 'Service-Worker-Allowed',
            value: '/',
          },
        ],
      },
    ];
  },
};

export default nextConfig;