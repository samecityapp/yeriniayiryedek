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

async function checkDuplicates() {
    // Check for articles with "Antalya" in title
    const { data: articles, error } = await supabase
        .from('articles')
        .select('id, title, slug, slug_en, created_at');

    if (error) {
        console.error('Error:', error);
        return;
    }

    // Filter for specific user example
    const targets = articles.filter((a: any) => {
        const slug = (a.slug || '').toLowerCase();
        // Look for the specific one
        return slug.includes('antalya-itinerary-4-days');
    });

    console.log(`Found ${targets.length} matches for 'antalya-itinerary-4-days':`);
    targets.forEach((a: any) => {
        console.log(JSON.stringify(a, null, 2));
    });
}

checkDuplicates();
