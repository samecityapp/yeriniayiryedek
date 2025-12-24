
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Manual env parsing
const envPath = path.join(process.cwd(), '.env.local');
let envContent = '';
try {
    envContent = fs.readFileSync(envPath, 'utf-8');
} catch (e) {
    console.log('Could not read .env.local', e);
}

const envVars: Record<string, string> = {};
if (envContent) {
    envContent.split('\n').forEach(line => {
        const match = line.match(/^([^=]+)=(.*)$/);
        if (match) {
            envVars[match[1].trim()] = match[2].trim().replace(/^['"]|['"]$/g, '');
        }
    });
}

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = envVars.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    console.log('Starting image URL fix...');

    // 1. Fetch articles with bad URLs
    const { data: articles, error } = await supabase
        .from('articles')
        .select();
        .or('cover_image_url.ilike.%YOUR_IMAGE_URL_HERE%,content.ilike.%YOUR_IMAGE_URL_HERE%');

    if (error) {
        console.error('Error fetching articles:', error);
        return;
    }

    console.log(`Found ${articles.length} articles to fix.`);

    for (const article of articles) {
        console.log(`Fixing: ${article.slug}`);

        let updates: any = {};
        let changed = false;

        // Fix cover image
        if (article.cover_image_url && article.cover_image_url.includes('YOUR_IMAGE_URL_HERE/')) {
            updates.cover_image_url = article.cover_image_url.replace('YOUR_IMAGE_URL_HERE/', '/images/blog/');
            changed = true;
            console.log(`  Cover: ${article.cover_image_url} -> ${updates.cover_image_url}`);
        }

        // Fix content
        if (article.content && article.content.includes('YOUR_IMAGE_URL_HERE/')) {
            updates.content = article.content.split('YOUR_IMAGE_URL_HERE/').join('/images/blog/');
            changed = true;
            console.log(`  Content: Replaced placeholders.`);
        }

        if (changed) {
            const { error: updateError } = await supabase
                .from('articles')
                .update(updates)
                .eq('id', article.id);

            if (updateError) {
                console.error(`  Failed to update ${article.slug}:`, updateError.message);
            } else {
                console.log(`  Success!`);
            }
        } else {
            console.log('  No changes needed (maybe unmatched pattern?)');
        }
    }

    console.log('Done.');
}

run();
