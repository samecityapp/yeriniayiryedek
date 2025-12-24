
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const envPath = path.join(process.cwd(), '.env.local');
let envContent = '';
try { envContent = fs.readFileSync(envPath, 'utf-8'); } catch (e) { }

const envVars: Record<string, string> = {};
if (envContent) {
    envContent.split('\n').forEach(line => {
        const match = line.match(/^([^=]+)=(.*)$/);
        if (match) { envVars[match[1].trim()] = match[2].trim().replace(/^['"]|['"]$/g, ''); }
    });
}

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = envVars.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) { console.error('Missing Supabase credentials'); process.exit(1); }

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    console.log('Listing all articles with "sapanca" in slug...');
    const { data: articles, error } = await supabase
        .from('articles')
        .select('slug, title, is_published')
        .ilike('slug', '%sapanca%');

    if (error) {
        console.error('Error:', error.message);
        return;
    }

    if (!articles || articles.length === 0) {
        console.log('No Sapanca articles found.');
    } else {
        console.log(`Found ${articles.length} articles:`);
        articles.forEach(a => {
            console.log(`- [${a.slug}] (${a.is_published ? 'Published' : 'Draft'}) - ${a.title}`);
        });
    }
}

run();
