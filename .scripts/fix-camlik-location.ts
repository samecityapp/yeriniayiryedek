
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    console.log('Updating Camlik Museum location...');

    const { error } = await supabase
        .from('articles')
        .update({ location: 'İzmir / Selçuk / Çamlık / Şirince' })
        .eq('slug', 'camlik-buharli-lokomotif-muzesi-rehberi-sirince');

    if (error) {
        console.error('Error updating article:', error);
    } else {
        console.log('Successfully updated article location.');
    }
}

run();
