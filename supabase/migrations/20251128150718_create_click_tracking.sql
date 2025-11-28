/*
  # Click Tracking System for Revenue Analytics

  1. New Tables
    - `hotel_clicks`
      - `id` (uuid, primary key) - Unique click identifier
      - `hotel_id` (uuid, foreign key) - Links to hotels table
      - `created_at` (timestamptz) - When the click happened
      - `user_ip` (text) - User IP for spam detection (optional)
      - `user_agent` (text) - Device/browser info (optional)
      - `referrer` (text) - Where the user came from (optional)

  2. Security
    - Enable RLS on `hotel_clicks` table
    - Add policies for authenticated admin users to read analytics
    - Allow public insert for tracking (no auth required for clicks)

  3. Indexes
    - Index on `hotel_id` for fast analytics queries
    - Index on `created_at` for time-based reports
    - Composite index on `hotel_id` and `created_at` for filtered queries
*/

-- Create hotel_clicks table
CREATE TABLE IF NOT EXISTS hotel_clicks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hotel_id uuid NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now() NOT NULL,
  user_ip text,
  user_agent text,
  referrer text
);

-- Enable Row Level Security
ALTER TABLE hotel_clicks ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anyone to insert clicks (public tracking)
CREATE POLICY "Anyone can track hotel clicks"
  ON hotel_clicks
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Policy: Only authenticated users can view all clicks
CREATE POLICY "Authenticated users can view all clicks"
  ON hotel_clicks
  FOR SELECT
  TO authenticated
  USING (true);

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_hotel_clicks_hotel_id
  ON hotel_clicks(hotel_id);

CREATE INDEX IF NOT EXISTS idx_hotel_clicks_created_at
  ON hotel_clicks(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_hotel_clicks_hotel_created
  ON hotel_clicks(hotel_id, created_at DESC);

-- Add comment for documentation
COMMENT ON TABLE hotel_clicks IS 'Tracks user clicks on hotel booking buttons for revenue analytics and reporting';