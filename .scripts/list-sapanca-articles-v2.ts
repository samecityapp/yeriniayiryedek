
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load .env.local
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    console.log('URL:', supabaseUrl ? 'Found' : 'Missing');
    console.log('Key:', supabaseKey ? 'Found' : 'Missing');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    console.log('Listing all articles with "sapanca" in slug...');
    const { data: articles, error } = await supabase
        .from('articles')
        .select('slug, title, is_published')
        .ilike('slug', '%sapanca%');

    if (error) {
        console.error('Error:', error.message);
        return;
    }

    if (!articles || articles.length === 0) {
        console.log('No Sapanca articles found.');
    } else {
        console.log(`Found ${articles.length} articles:`);
        articles.forEach(a => {
            console.log(`- [${a.slug}] (${a.is_published ? 'Published' : 'Draft'}) - ${a.title}`);
        });
    }
}

run();
