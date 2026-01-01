-- Add slug_en column to articles table
ALTER TABLE articles ADD COLUMN IF NOT EXISTS slug_en text;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_articles_slug_en ON articles(slug_en);

-- Add comment
COMMENT ON COLUMN articles.slug_en IS 'English localized slug for the article';
