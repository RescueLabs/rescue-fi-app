/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        hostname: 'assets.aceternity.com',
        protocol: 'https',
      },
      {
        hostname: 'www.buymeacoffee.com',
        protocol: 'https',
      },
    ],
  },
  env: {
    MEV_AUTH_SIGNER_PRIVATE_KEY: process.env.MEV_AUTH_SIGNER_PRIVATE_KEY,
  }
};

export default nextConfig;
