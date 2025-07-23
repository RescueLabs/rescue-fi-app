import { createClient } from '@supabase/supabase-js';

const getSupabaseConfig = () => {
  const mode = process.env.NODE_ENV === 'production' ? 'production' : 'test';

  if (mode === 'production') {
    return {
      url: process.env.SUPABASE_URL!,
      key: process.env.SUPABASE_SERVICE_ROLE_KEY!, // Use service role key for backend operations
    };
  }
  return {
    url: process.env.SUPABASE_TEST_URL!,
    key: process.env.SUPABASE_TEST_SERVICE_ROLE_KEY!, // Use service role key for backend operations
  };
};

const config = getSupabaseConfig();

export const supabase = createClient(config.url, config.key);

export const getMode = () => {
  return process.env.NODE_ENV === 'production' ? 'production' : 'test';
};
