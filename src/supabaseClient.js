import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('[supabaseClient] URL:', supabaseUrl ? '✅ loaded' : '❌ MISSING — check Vercel env vars');
console.log('[supabaseClient] KEY:', supabaseAnonKey ? '✅ loaded' : '❌ MISSING — check Vercel env vars');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    '[supabaseClient] CRITICAL: Supabase credentials missing!\n' +
    'Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your Vercel Environment Variables,\n' +
    'then redeploy.'
  );
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);
