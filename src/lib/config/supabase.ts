import { createClient } from '@supabase/supabase-js';

const getSupabaseConfig = () => {
  const mode = process.env.NODE_ENV === 'production' ? 'production' : 'test';

  if (mode === 'production') {
    return {
      url: process.env.SUPABASE_URL!,
      key: process.env.SUPABASE_ANON_KEY!,
    };
  }
  return {
    url: process.env.SUPABASE_TEST_URL!,
    key: process.env.SUPABASE_TEST_ANON_KEY!,
  };
};

const config = getSupabaseConfig();

export const supabase = createClient(config.url, config.key);

export const getMode = () => {
  return process.env.NODE_ENV === 'production' ? 'production' : 'test';
};
