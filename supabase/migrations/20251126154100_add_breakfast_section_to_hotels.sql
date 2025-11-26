/*
  # Add Breakfast Section to Hotels

  1. Changes
    - Add `breakfast_description` column to hotels table for storing breakfast text content
    - Add `breakfast_images` column to hotels table for storing array of breakfast image URLs (max 3 images)
  
  2. Details
    - `breakfast_description` is optional text field for describing the hotel's breakfast offerings
    - `breakfast_images` is a JSON array that can hold up to 3 image URLs
    - Both fields are nullable - if not filled in admin, the breakfast section won't display on frontend
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'hotels' AND column_name = 'breakfast_description'
  ) THEN
    ALTER TABLE hotels ADD COLUMN breakfast_description text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'hotels' AND column_name = 'breakfast_images'
  ) THEN
    ALTER TABLE hotels ADD COLUMN breakfast_images jsonb DEFAULT '[]'::jsonb;
  END IF;
END $$;