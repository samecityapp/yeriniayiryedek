
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Manual env parsing
const envPath = path.join(process.cwd(), '.env.local');
let envContent = '';
try { envContent = fs.readFileSync(envPath, 'utf-8'); } catch (e) { }

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

if (!supabaseUrl || !supabaseKey) { console.error('Missing credentials'); process.exit(1); }

const supabase = createClient(supabaseUrl, supabaseKey);

const MIGRATIONS_DIR = path.join(process.cwd(), 'supabase/migrations');

const TARGET_FILES = [
    '20251221235000_add_sapanca_security_article.sql',
    '20251218143000_add_fethiye_season_article.sql',
    '20251220222000_add_sirince_st_john_article.sql',
    '20251220173000_add_nesin_math_village_article.sql',
    '20251220003500_add_bodrum_instagram_article.sql',
    '20251219114000_add_bodrum_transport_article.sql',
    '20251221153000_add_camlik_museum_article.sql'
];

function parseSqlValues(valuesStr: string): string[] {
    const values: string[] = [];
    let currentVal = '';
    let inString = false;

    for (let i = 0; i < valuesStr.length; i++) {
        const char = valuesStr[i];

        if (char === "'" && valuesStr[i + 1] === "'") {
            if (inString) currentVal += "'";
            i++;
        } else if (char === "'") {
            inString = !inString;
        } else if (char === "," && !inString) {
            values.push(currentVal.trim());
            currentVal = '';
        } else {
            currentVal += char;
        }
    }
    values.push(currentVal.trim());

    return values.map(v => {
        if (v.startsWith("'") && v.endsWith("'")) return v.slice(1, -1);
        if (v.toUpperCase() === 'TRUE') return 'true';
        if (v.toUpperCase() === 'FALSE') return 'false';
        return v;
    });
}

async function run() {
    console.log(`Starting targeted recovery for ${TARGET_FILES.length} articles...`);

    for (const file of TARGET_FILES) {
        const filePath = path.join(MIGRATIONS_DIR, file);
        if (!fs.existsSync(filePath)) {
            console.error(`❌ File not found: ${file}`);
            continue;
        }

        const content = fs.readFileSync(filePath, 'utf-8');
        const match = content.match(/VALUES\s*\(([\s\S]*?)\)\s*;/);

        if (!match) {
            console.warn(`⚠️  Could not parse VALUES in ${file}`);
            continue;
        }

        const values = parseSqlValues(match[1]);
        let articleData;

        // Logic from migrate-recent-articles.ts
        if (values.length === 11) {
            articleData = {
                title: values[1],
                slug: values[2],
                content: values[3],
                cover_image_url: values[4],
                location: values[5],
                meta_description: values[6],
                is_published: values[7] === 'true' || values[7] === 'TRUE',
                published_at: values[8],
                updated_at: new Date().toISOString()
            };
        } else if (values.length === 10) {
            articleData = {
                title: values[0],
                slug: values[1],
                content: values[2],
                cover_image_url: values[3],
                location: values[4],
                meta_description: values[5],
                is_published: values[6] === 'true' || values[6] === 'TRUE',
                published_at: values[7],
                updated_at: new Date().toISOString()
            };
        } else {
            console.warn(`⚠️  Skipping ${file}: Unexpected value count (${values.length})`);
            continue;
        }

        // Clean SQL keywords
        if (articleData.published_at && (
            articleData.published_at.toLowerCase().includes('now()') ||
            articleData.published_at.includes('CURRENT_TIMESTAMP')
        )) {
            articleData.published_at = new Date().toISOString();
        }

        const { error } = await supabase
            .from('articles')
            .upsert(articleData, { onConflict: 'slug' });

        if (error) {
            console.error(`❌ Failed ${file}:`, error.message);
        } else {
            console.log(`✅ Recovered: ${articleData.slug}`);
        }
    }
    console.log('Recovery complete.');
}

run();
