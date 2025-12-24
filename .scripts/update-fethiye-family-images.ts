
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

const slug = 'cocuklu-aileler-icin-fethiye-sig-deniz-rehberi';

async function run() {
    console.log(`Updating article: ${slug}`);

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

    // Define replacements (both for PLACEHOLDERS and potential earlier 'fixed' paths that might just point to non-existent webps)
    const replacements = [
        { old: 'YOUR_IMAGE_URL_HERE/oludeniz-lagun-calm.webp', new: '/images/blog/oludeniz_lagoon_shallow_water.png' },
        { old: '/images/blog/oludeniz-lagun-calm.webp', new: '/images/blog/oludeniz_lagoon_shallow_water.png' },

        { old: 'YOUR_IMAGE_URL_HERE/katranci-bay-nature.webp', new: '/images/blog/fethiye_katranci_bay_nature.png' },
        { old: '/images/blog/katranci-bay-nature.webp', new: '/images/blog/fethiye_katranci_bay_nature.png' },

        { old: 'YOUR_IMAGE_URL_HERE/family-beach-shaded.webp', new: '/images/blog/calis_beach_family_sunset.png' },
        { old: '/images/blog/family-beach-shaded.webp', new: '/images/blog/calis_beach_family_sunset.png' },

        { old: 'YOUR_IMAGE_URL_HERE/fethiye-family-cover.webp', new: '/images/blog/fethiye_family_cover.png' },
        { old: '/images/blog/fethiye-family-cover.webp', new: '/images/blog/fethiye_family_cover.png' }
    ];

    for (const rep of replacements) {
        // Replace all occurrences
        newContent = newContent.split(rep.old).join(rep.new);
    }

    // Also update cover_image_url
    const coverImageUrl = '/images/blog/fethiye_family_cover.png';

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
        console.log('Success! Article updated with new Fethiye Family images.');
    }
}

run();
