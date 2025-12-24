
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
            let value = match[2].trim();
            if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
                value = value.slice(1, -1);
            }
            envVars[match[1].trim()] = value;
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

const slug = 'bodrum-beach-club-rehberi-2025-giris-ucretleri-happy-hour-ortam-analizi';

async function run() {
    console.log(`Updating article: ${slug}`);

    // Get current article to preserve other fields if needed, or just overwrite content
    const { data: currentArticle, error: fetchError } = await supabase
        .from('articles')
        .select('content')
        .eq('slug', slug)
        .single();

    if (fetchError) {
        console.error('Error fetching article:', fetchError.message);
        return;
    }

    let newContent = currentArticle.content;

    // Replace placeholders with new image paths
    newContent = newContent.replace('/images/blog/placeholder_bodrum_beachclub_cover.png', '/images/blog/bodrum_beach_club_luxury_cover.png');
    newContent = newContent.replace('/images/blog/placeholder_bodrum_turkbuku.png', '/images/blog/bodrum_sea_lounge_deck.png');
    newContent = newContent.replace('/images/blog/placeholder_bodrum_yalikavak.png', '/images/blog/bodrum_beach_happy_hour_sunset.png');
    newContent = newContent.replace('/images/blog/placeholder_bodrum_torba.png', '/images/blog/bodrum_calm_family_beach_torba.png');

    // Also update cover_image_url
    const coverImageUrl = '/images/blog/bodrum_beach_club_luxury_cover.png';

    const { error: updateError } = await supabase
        .from('articles')
        .update({
            content: newContent,
            cover_image_url: coverImageUrl,
            updated_at: new Date().toISOString()
        })
        .eq('slug', slug);

    if (updateError) {
        console.error('Error updating article:', updateError.message);
    } else {
        console.log('Success! Article updated with new images.');
    }
}

run();
