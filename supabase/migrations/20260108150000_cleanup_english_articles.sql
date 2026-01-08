-- Cleanup Turkish translations from English-only articles
-- Problem: These articles were meant to be English-only but had Turkish content/slugs added.
-- Solution: Remove TR localization keys and rename primary slug to avoid TR route collision.

UPDATE public.articles
SET
  title = title::jsonb - 'tr',
  content = content::jsonb - 'tr',
  meta_description = meta_description::jsonb - 'tr',
  slug = slug || '-en-only'
WHERE id IN (
    'b4ece3ec-71f4-4b37-9cfa-eccde7598f3a',
    '2fbd42e9-1703-4f36-95c6-cb8739c923b0',
    '1714f0fb-72c2-4a8e-8dd5-c9822567401c',
    'de4f0adf-1084-4fd7-8e1a-0af5e0109e69'
);

-- Ensure updated_at is refreshed
UPDATE public.articles
SET updated_at = NOW()
WHERE id IN (
    'b4ece3ec-71f4-4b37-9cfa-eccde7598f3a',
    '2fbd42e9-1703-4f36-95c6-cb8739c923b0',
    '1714f0fb-72c2-4a8e-8dd5-c9822567401c',
    'de4f0adf-1084-4fd7-8e1a-0af5e0109e69'
);
