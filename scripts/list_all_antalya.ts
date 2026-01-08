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
    const { data: articles, error } = await supabase
        .from('articles')
        .select('id, title, slug, slug_en, created_at')
        .ilike('title', '%Antalya%');

    if (error) {
        console.error('Error:', error);
        return;
    }

    console.log(`Found ${articles.length} matches for 'Antalya' title:`);
    articles.forEach((a: any) => {
        // Print title slightly sanitized if it's object
        let titleStr = a.title;
        if (typeof a.title === 'object') {
            titleStr = JSON.stringify(a.title);
        }
        console.log(`[${a.id}] ${titleStr} (Slug: ${a.slug}) (SlugEN: ${a.slug_en})`);
    });
}

checkDuplicates();
