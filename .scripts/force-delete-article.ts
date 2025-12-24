
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
    console.log(`Checking for article: ${slugToDelete}`);

    // Check count
    const { count, error: countError } = await supabase
        .from('articles')
        .select();
        .eq('slug', slugToDelete);

    console.log(`Initial count: ${count}`);

    if (count && count > 0) {
        console.log(`Deleting ${slugToDelete}...`);
        const { error: deleteError, count: deletedCount } = await supabase
            .from('articles')
            .delete({ count: 'exact' })
            .eq('slug', slugToDelete);

        if (deleteError) {
            console.error('Error deleting:', deleteError.message);
        } else {
            console.log(`Deleted rows: ${deletedCount}`);
        }
    } else {
        console.log('Article already gone.');
    }

    // Double check
    const { count: finalCount } = await supabase
        .from('articles')
        .select('*', { count: 'exact', head: true })
        .eq('slug', slugToDelete);

    console.log(`Final count: ${finalCount}`);

    if (finalCount === 0) {
        console.log('VERIFIED: Article is deleted.');
    } else {
        console.error('WARNING: Article still exists!');
    }
}

run();
