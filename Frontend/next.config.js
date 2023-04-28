/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  webpack(config, { isServer }) {
    config.experiments = { ...config.experiments, topLevelAwait: true };
    // if (!isServer) {
    //   config.resolve.fallback.fs = false;
    // }
    return config;
  },
};

export default nextConfig;
