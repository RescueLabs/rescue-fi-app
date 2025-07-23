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
    BACKEND_WALLET_ADDRESS: process.env.BACKEND_WALLET_ADDRESS,
    RESCUROOOR_CONTRACT_ADDRESS: process.env.RESCUROOOR_CONTRACT_ADDRESS,
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    SUPABASE_TEST_URL: process.env.SUPABASE_TEST_URL,
    SUPABASE_TEST_SERVICE_ROLE_KEY: process.env.SUPABASE_TEST_SERVICE_ROLE_KEY,
    SEPOLIA_RPC_URL:
      process.env.SEPOLIA_RPC_URL ||
      'https://eth-sepolia.g.alchemy.com/v2/1R4Kc4n_iDlbyyzhGugVQFZfxoE7lrAb',
    ARBITRUM_SEPOLIA_RPC_URL:
      process.env.ARBITRUM_SEPOLIA_RPC_URL ||
      'https://arb-sepolia.g.alchemy.com/v2/1R4Kc4n_iDlbyyzhGugVQFZfxoE7lrAb',
    BSC_TESTNET_RPC_URL:
      process.env.BSC_TESTNET_RPC_URL ||
      'https://bnb-testnet.g.alchemy.com/v2/1R4Kc4n_iDlbyyzhGugVQFZfxoE7lrAb',
    BASE_SEPOLIA_RPC_URL:
      process.env.BASE_SEPOLIA_RPC_URL ||
      'https://base-sepolia.g.alchemy.com/v2/1R4Kc4n_iDlbyyzhGugVQFZfxoE7lrAb',
    OPTIMISM_SEPOLIA_RPC_URL:
      process.env.OPTIMISM_SEPOLIA_RPC_URL ||
      'https://opt-sepolia.g.alchemy.com/v2/1R4Kc4n_iDlbyyzhGugVQFZfxoE7lrAb',
    ETHEREUM_RPC_URL:
      process.env.ETHEREUM_RPC_URL || 'https://ethereum-rpc.publicnode.com',
    ARBITRUM_RPC_URL:
      process.env.ARBITRUM_RPC_URL || 'https://arbitrum-one.publicnode.com',
    BSC_RPC_URL: process.env.BSC_RPC_URL || 'https://bsc-dataseed1.binance.org',
    BASE_RPC_URL: process.env.BASE_RPC_URL || 'https://mainnet.base.org',
    OPTIMISM_RPC_URL:
      process.env.OPTIMISM_RPC_URL || 'https://mainnet.optimism.io',
    ETHERSCAN_API_KEY: process.env.ETHERSCAN_API_KEY || '',
  },
  reactStrictMode: true,
  webpack: (config) => {
    config.resolve.fallback = { fs: false, net: false, tls: false };
    config.externals.push('pino-pretty', 'lokijs', 'encoding');
    return config;
  },
};

export default nextConfig;
