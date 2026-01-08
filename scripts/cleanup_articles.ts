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

const targetIds = [
    'b4ece3ec-71f4-4b37-9cfa-eccde7598f3a',
    '2fbd42e9-1703-4f36-95c6-cb8739c923b0',
    '1714f0fb-72c2-4a8e-8dd5-c9822567401c',
    'de4f0adf-1084-4fd7-8e1a-0af5e0109e69'
];

async function cleanupArticles() {
    console.log(`Starting cleanup for ${targetIds.length} articles...`);

    for (const id of targetIds) {
        const { data: art, error } = await supabase.from('articles').select('*').eq('id', id).single();
        if (error) {
            console.error(`Error fetching ${id}:`, error);
            continue;
        }

        const title = art.title || {};
        const content = art.content || {};
        const excerpt = art.excerpt || {};
        const meta = art.meta_description || {};

        if (title.tr) {
            console.log(`Removing TR title for ${id}: ${title.tr}`);
            delete title.tr;
        }
        if (content.tr) {
            console.log(`Removing TR content for ${id}`);
            delete content.tr;
        }
        // if (excerpt.tr) delete excerpt.tr;
        if (meta.tr) delete meta.tr;

        // Modify slug to prevent TR routing collision
        // Use slug_en if available logic, or just make it distinct
        const oldSlug = art.slug;
        let newSlug = oldSlug;
        if (oldSlug === art.slug_en) {
            newSlug = `${oldSlug}-en-only`;
            console.log(`Updating slug: ${oldSlug} -> ${newSlug}`);
        }

        const { error: updateError } = await supabase
            .from('articles')
            .update({
                title: title,
                content: content,
                // excerpt: excerpt,
                meta_description: meta,
                slug: newSlug
            })
            .eq('id', id);

        if (updateError) {
            console.error(`Failed to update ${id}:`, updateError);
        } else {
            console.log(`Successfully cleaned ${id}`);
        }
    }
}

cleanupArticles();
