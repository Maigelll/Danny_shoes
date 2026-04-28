import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@dannyshoes/shared'],
  experimental: { typedRoutes: true },
};

export default nextConfig;
