/*
  # Create LoL Pickems Database Schema

  1. New Tables
    - `admin_config`
      - `id` (uuid, primary key)
      - `key` (text, unique) - Configuration key
      - `value` (jsonb) - Configuration value
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `tournament_settings`
      - `id` (uuid, primary key)
      - `name` (text) - Tournament name
      - `stage` (text) - groups, swiss, playoffs
      - `status` (text) - upcoming, active, completed
      - `teams` (jsonb) - Array of team objects
      - `matches` (jsonb) - Array of match objects
      - `bracket_data` (jsonb) - Bracket structure
      - `start_date` (timestamptz)
      - `end_date` (timestamptz)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `user_data`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `username` (text)
      - `is_admin` (boolean, default false)
      - `picks` (jsonb) - User's tournament picks
      - `score` (integer, default 0)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Admin policies: Only admins can modify admin_config and tournament_settings
    - User policies: Users can view tournament settings, manage their own data
    - Public can view tournament settings (read-only)
*/

CREATE TABLE IF NOT EXISTS admin_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS tournament_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  stage text NOT NULL DEFAULT 'groups',
  status text NOT NULL DEFAULT 'upcoming',
  teams jsonb NOT NULL DEFAULT '[]'::jsonb,
  matches jsonb NOT NULL DEFAULT '[]'::jsonb,
  bracket_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  start_date timestamptz,
  end_date timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  username text NOT NULL,
  is_admin boolean DEFAULT false,
  picks jsonb NOT NULL DEFAULT '{}'::jsonb,
  score integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE admin_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournament_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage admin_config"
  ON admin_config FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_data
      WHERE user_data.user_id = auth.uid()
      AND user_data.is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_data
      WHERE user_data.user_id = auth.uid()
      AND user_data.is_admin = true
    )
  );

CREATE POLICY "Everyone can view tournament_settings"
  ON tournament_settings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage tournament_settings"
  ON tournament_settings FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_data
      WHERE user_data.user_id = auth.uid()
      AND user_data.is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_data
      WHERE user_data.user_id = auth.uid()
      AND user_data.is_admin = true
    )
  );

CREATE POLICY "Users can view own user_data"
  ON user_data FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own user_data"
  ON user_data FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own user_data"
  ON user_data FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id AND is_admin = (SELECT is_admin FROM user_data WHERE user_id = auth.uid()));

CREATE POLICY "Admins can view all user_data"
  ON user_data FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_data ud
      WHERE ud.user_id = auth.uid()
      AND ud.is_admin = true
    )
  );

CREATE INDEX IF NOT EXISTS idx_user_data_user_id ON user_data(user_id);
CREATE INDEX IF NOT EXISTS idx_user_data_score ON user_data(score DESC);
CREATE INDEX IF NOT EXISTS idx_tournament_settings_status ON tournament_settings(status);