import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Types for our database tables
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type InventoryItem = Database['public']['Tables']['inventory_items']['Row'];
export type Sale = Database['public']['Tables']['sales']['Row'];
export type Recipe = Database['public']['Tables']['recipes']['Row'];
export type StoreSetting = Database['public']['Tables']['store_settings']['Row'];