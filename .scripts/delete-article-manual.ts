
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

const slugToDelete = 'sapanca-arabasiz-ulasim-rehberi-yht-otobus';

async function run() {
    console.log(`Checking for article: ${slugToDelete}`);

    // Check if exists
    const { data: existing, error: checkError } = await supabase
        .from('articles')
        .select('id, title')
        .eq('slug', slugToDelete)
        .single();

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "not found" which is fine
        console.error('Error checking article:', checkError.message);
        return;
    }

    if (!existing) {
        console.log('Article does not exist.');
        return;
    }

    console.log(`Found article: "${existing.title}". Deleting...`);

    const { error: deleteError } = await supabase
        .from('articles')
        .delete()
        .eq('slug', slugToDelete);

    if (deleteError) {
        console.error('Error deleting article:', deleteError.message);
    } else {
        console.log('Successfully deleted article.');
    }
}

run();
