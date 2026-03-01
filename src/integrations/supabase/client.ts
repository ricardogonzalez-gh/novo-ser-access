// Instituto Novo Ser — KPI Dashboard
// Supabase client with navigator.locks bypass
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://bcdodtyyoqlqhdnnqdds.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJjZG9kdHl5b3FscWhkbm5xZGRzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE2MTg5ODksImV4cCI6MjA4NzE5NDk4OX0.pfLkiebVn6I5JweSaj08e5bcr3rHQ2xCE0Lw26CZZzA";

// Custom lock that bypasses navigator.locks to prevent timeout errors
// in restricted environments (Lovable preview, cross-origin iframes)
const noOpLock = async <T>(
  _name: string,
  _acquireTimeout: number,
  fn: () => Promise<T>
): Promise<T> => {
  return await fn();
};

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
    lock: noOpLock,
  }
});