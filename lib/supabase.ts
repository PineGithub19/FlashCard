import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_PROJECT_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_ANON_KEY || '';
console.log(supabaseUrl, supabaseKey)
if (!supabaseUrl || !supabaseKey) {
    console.warn('Missing Supabase environment variables: PROJECT_URL or ANON_KEY');
}

export const supabase = createClient(supabaseUrl, supabaseKey);
