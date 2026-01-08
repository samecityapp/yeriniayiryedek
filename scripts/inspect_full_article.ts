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

async function inspectArticle() {
    const { data: article, error } = await supabase
        .from('articles')
        .select('*')
        .eq('id', 'de4f0adf-1084-4fd7-8e1a-0af5e0109e69')
        .single();

    if (error) {
        console.error('Error fetching article:', error);
        return;
    }

    console.log('Full article structure:');
    console.log(JSON.stringify(article, null, 2));
}

inspectArticle();
