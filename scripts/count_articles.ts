import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function count() {
    const { count, error } = await supabase
        .from('articles')
        .select('*', { count: 'exact', head: true });

    if (error) {
        console.error('Error counting articles:', error);
    } else {
        console.log(`Total articles in DB: ${count}`);
    }
}

count();
