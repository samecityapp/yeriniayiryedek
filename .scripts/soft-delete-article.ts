
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const slugToDelete = 'sapanca-arabasiz-ulasim-rehberi-yht-otobus';

async function run() {
    console.log(`Attempting soft delete (unpublish) for: ${slugToDelete}`);

    const { error, count } = await supabase
        .from('articles')
        .update({ is_published: false, slug: `deleted-${slugToDelete}-${Date.now()}` })
        .eq('slug', slugToDelete)
        .select();

    if (error) {
        console.error('Error updating:', error.message);
    } else {
        console.log(`Updated rows: ${count}`);
        if (count === 1) {
            console.log('SUCCESS: Article unpublished and renamed.');
        } else {
            console.log('FAILED: Could not update row (RLS policy?)');
        }
    }
}

run();
