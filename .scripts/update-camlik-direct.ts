
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Manual env parsing to avoid package issues
const envPath = path.join(process.cwd(), '.env.local');
let envContent = '';
try {
    envContent = fs.readFileSync(envPath, 'utf-8');
} catch (e) {
    console.error('Could not read .env.local');
    process.exit(1);
}

const envVars: Record<string, string> = {};
envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
        envVars[match[1].trim()] = match[2].trim().replace(/^['"]|['"]$/g, '');
    }
});

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = envVars.SUPABASE_SERVICE_ROLE_KEY; // Must use service role for updates if RLS is strict

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing credentials in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    console.log('Updating Camlik location...');
    const { error } = await supabase
        .from('articles')
        .update({ location: 'İzmir / Selçuk / Çamlık / Şirince' })
        .eq('slug', 'camlik-buharli-lokomotif-muzesi-rehberi-sirince');

    if (error) {
        console.error('Error:', error);
    } else {
        console.log('Success: Camlik location updated.');
    }
}

run();
