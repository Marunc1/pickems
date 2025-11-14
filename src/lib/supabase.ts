// Fișierul de configurare a bazei de date nu mai este necesar în frontend.
// Această secțiune este eliminată, deoarece conexiunea se face în api.php.

/*
// Importul și crearea clientului Supabase sunt eliminate:
// import { createClient } from '@supabase/supabase-js';
// const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
// const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
// if (!supabaseUrl || !supabaseAnonKey) {
//   throw new Error('Missing Supabase environment variables');
// }
// export const supabase = createClient(supabaseUrl, supabaseAnonKey);
*/

// --- Interfețele de tip (Typescript Interfaces) adaptate pentru MySQL/Frontend ---

/**
 * Reprezintă o echipă de LoL stocată în array-ul `teams` din tournament_settings.
 * ID-ul este acum un string (UUID în MySQL este CHAR(36)).
 */
export interface Team {
  id: string;
  name: string;
  region: string;
  logo: string;
  group?: string;
}

/**
 * Reprezintă setările unui turneu din tabela `tournament_settings`.
 * `jsonb` este înlocuit cu tipul general `any` sau `object`.
 */
export interface Tournament {
  id: string; // CHAR(36) în MySQL
  name: string;
  stage: 'groups' | 'swiss' | 'playoffs' | string;
  status: 'upcoming' | 'active' | 'completed' | string;
  teams: Team[]; // Stocat ca JSON în MySQL
  matches: any[]; // Stocat ca JSON în MySQL
  bracket_data: any; // Stocat ca JSON în MySQL
  start_date: string; // DATETIME în MySQL, returnat ca string în JS
  end_date: string;   // DATETIME în MySQL, returnat ca string în JS
  created_at: string; // TIMESTAMP în MySQL, returnat ca string în JS
  updated_at: string; // TIMESTAMP în MySQL, returnat ca string în JS
}

/**
 * Reprezintă datele unui utilizator din tabela `user_data`.
 * `user_id` este acum un string, nu un UUID referențiat de `auth.users`.
 */
export interface UserData {
  id: string; // CHAR(36) în MySQL
  user_id: string; // ID-ul unic al utilizatorului (string/UUID)
  username: string;
  is_admin: boolean;
  picks: any; // Stocat ca JSON în MySQL
  score: number; // Integer în MySQL
  created_at: string;
  updated_at: string;
}

/**
 * Reprezintă o înregistrare de configurare din tabela `admin_config`.
 */
export interface AdminConfig {
  id: string; // CHAR(36) în MySQL
  key: string;
  value: any; // Stocat ca JSON în MySQL
  created_at: string;
  updated_at: string;
}