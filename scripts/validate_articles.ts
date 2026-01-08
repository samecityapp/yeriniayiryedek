import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load env from root
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkArticles() {
    console.log('Fetching articles...');
    const { data: articles, error } = await supabase
        .from('articles')
        .select('id, title, slug, slug_en, location, created_at');

    if (error) {
        console.error('Error fetching articles:', error);
        return;
    }

    // Filter for potential English slugs in the main 'slug' column
    // This column is typically for the default language (Turkish).
    const suspicious = articles.filter((a: any) => {
        const slug = a.slug || '';
        // Look for English words that wouldn't appear in Turkish slugs usually
        return slug.includes('itinerary') ||
            slug.includes('guide') ||
            slug.includes('days') ||
            slug.includes('uk-friendly') ||
            slug.includes('best-');
    });

    if (suspicious.length === 0) {
        console.log('No suspicious English slugs found in the default slug column.');
    } else {
        console.log('⚠️  Suspicious Articles (English slug in default column):');
        suspicious.forEach((a: any) => {
            console.log(`- [${a.id}] ${a.title} (Slug: ${a.slug})`);
        });
    }
}

checkArticles();
