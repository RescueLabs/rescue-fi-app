import { createClient } from '@supabase/supabase-js';

export type AppMode = 'production' | 'test' | 'local_test' | 'local';

const getSupabaseConfig = (mode: AppMode) => {
  switch (mode) {
    case 'production':
      return {
        url: process.env.SUPABASE_URL!,
        key: process.env.SUPABASE_SERVICE_ROLE_KEY!, // Use service role key for backend operations
      };
    case 'test':
    case 'local_test':
      return {
        url: process.env.SUPABASE_TEST_URL!,
        key: process.env.SUPABASE_TEST_SERVICE_ROLE_KEY!, // Use service role key for backend operations
      };
    case 'local':
      // Local mode doesn't use database
      return {
        url: '',
        key: '',
      };
    default:
      throw new Error(`Unknown mode: ${mode}`);
  }
};

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

const config = getSupabaseConfig(getMode());

export const supabase = createClient(config.url, config.key);

export const shouldUseDatabase = (mode: AppMode): boolean => {
  return mode !== 'local';
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
