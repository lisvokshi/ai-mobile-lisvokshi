import { createClient } from '@supabase/supabase-js';

// 👇 Replace these with your real values from Supabase
const SUPABASE_URL = 'https://fzucupozmbdozguhcjuy.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ6dWN1cG96bWJkb3pndWhjanV5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwMDY2NjAsImV4cCI6MjA3NTU4MjY2MH0.vf5pZ8E26WclxZj0lmzIT3l9IXdGqnQJNV43uPJnuC4';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

