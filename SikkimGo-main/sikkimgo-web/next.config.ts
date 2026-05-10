import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.sikkimdarshan.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'api.sikkimdarshan.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'www.sikkimeccl.gov.in',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'online.pubhtml5.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'online.visual-paradigm.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'heyzine.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cdnc.heyzine.com',
        port: '',
        pathname: '/**',
      }
    ],
  },
};

export default nextConfig;
