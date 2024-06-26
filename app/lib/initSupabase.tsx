// import { createClient } from '@supabase/supabase-js';

// const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
// const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// export const supabase = createClient(supabaseUrl, supabaseAnonKey);

import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl: string = process.env.SUPABASE_URL || '';
const supabaseAnonKey: string = process.env.SUPABASE_ANON_KEY || '';

// const supabaseUrl: string = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
// const supabaseAnonKey: string = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase: SupabaseClient = createClient(
  supabaseUrl,
  supabaseAnonKey,
);

// export const supabase = createClient(supabaseUrl, supabaseAnonKey);
