import { createClient } from '@supabase/supabase-js';

// ⚠️  Replace with your actual Supabase project values from:
// https://supabase.com/dashboard/project/_/settings/api
const SUPABASE_URL = 'https://xpkxsvfbufbqghxkxofs.supabase.co';
const PUBLISHABLE_KEY = 'sb_publishable_spKO3M5DqfHLWlnqK8QLQw_RoEl8xv-';

export const supabase = createClient(SUPABASE_URL, PUBLISHABLE_KEY);
