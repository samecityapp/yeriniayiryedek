-- Create offers table
CREATE TABLE IF NOT EXISTS offers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL,
  hotel_name TEXT NOT NULL,
  price TEXT NOT NULL, -- Storing as text to allow flexible formats like "29.000", "€100" etc or strictly "29.000"
  region TEXT NOT NULL, -- e.g. "Kapadokya", "İstanbul"
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add unique constraint on slug
CREATE UNIQUE INDEX IF NOT EXISTS offers_slug_idx ON offers (slug);

-- Enable Row Level Security
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;

-- Create policies (Adjust as needed for your auth setup, here allowing public read, admin write)
-- For simplicity in this project phase, we might allow public read and maybe public write if auth isn't fully strict yet, 
-- but ideally only authenticated admins can write.
-- Assuming service role usage for admin scripts/app, or public access for now:

CREATE POLICY "Enable read access for all users" ON offers
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON offers
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users only" ON offers
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users only" ON offers
  FOR DELETE USING (auth.role() = 'authenticated');
