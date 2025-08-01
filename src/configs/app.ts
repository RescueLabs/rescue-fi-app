import { AppMode } from '@/types/app';

export const getMode = (): AppMode => {
  const mode = process.env.APP_MODE || process.env.NODE_ENV;

  switch (mode) {
    case 'production':
      return 'production';
    case 'test':
    case 'development':
      return 'test';
    case 'local_test':
      return 'local_test';
    case 'local':
      return 'local';
    default:
      return 'test'; // Default to test mode
  }
};

export const getSupportedChains = (
  mode: AppMode,
): 'mainnet' | 'testnet' | 'both' => {
  switch (mode) {
    case 'production':
      return 'mainnet';
    case 'test':
      return 'testnet';
    case 'local_test':
    case 'local':
      return 'both';
    default:
      return 'testnet';
  }
};
