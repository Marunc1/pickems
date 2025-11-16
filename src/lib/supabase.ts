import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Team {
  id: string;
  name: string;
  tag: string;
  region?: string; // Made optional
  logo?: string;  // Made optional
  // Removed group?: string;
}

export interface Tournament {
  id: string;
  name: string;
  stage: string;
  status: string;
  teams: Team[];
  matches: any[];
  bracket_data: any;
  start_date: string;
  end_date: string;
  created_at: string;
  updated_at: string;
  locked_rounds?: string[]; // Added locked_rounds to Tournament interface
}

export interface UserData {
  id: string;
  user_id: string;
  username: string;
  is_admin: boolean;
  picks: any;
  score: number;
  created_at: string;
  updated_at: string;
}

export interface AdminConfig {
  id: string;
  key: string;
  value: any;
  created_at: string;
  updated_at: string;
}