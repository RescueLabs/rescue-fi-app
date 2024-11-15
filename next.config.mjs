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
};

export default nextConfig;
