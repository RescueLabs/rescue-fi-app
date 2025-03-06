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
    WALLET_CONNECT_PROJECT_ID: process.env.WALLET_CONNECT_PROJECT_ID,
  },
};

export default nextConfig;
