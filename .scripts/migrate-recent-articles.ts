
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Manual .env parser
function loadEnv() {
    const envPath = path.join(process.cwd(), '.env.local');
    if (fs.existsSync(envPath)) {
        const content = fs.readFileSync(envPath, 'utf-8');
        const env: Record<string, string> = {};
        content.split('\n').forEach(line => {
            const match = line.match(/^([^=]+)=(.*)$/);
            if (match) {
                const key = match[1].trim();
                const value = match[2].trim().replace(/^["']|["']$/g, '');
                env[key] = value;
            }
        });
        return env;
    }
    return {};
}

const env = loadEnv();
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase env vars. Please check .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const MIGRATIONS_DIR = path.join(process.cwd(), 'supabase/migrations');

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

async function migrate() {
    if (!fs.existsSync(MIGRATIONS_DIR)) {
        console.error('Migrations dir not found');
        return;
    }

    const files = fs.readdirSync(MIGRATIONS_DIR)
        .filter(f => f.endsWith('.sql'))
        .sort();

    // Process files from Dec 2025 onwards that are article additions
    // Including late November if needed, but user focused on "what we did" recently.
    // We'll broaden the filter slightly to catch the "Bodrum" series onwards.
    // Bodrum started 20251219.
    const targetFiles = files.filter(f => f.startsWith('202512') && f.includes('_article'));

    console.log(`Found ${targetFiles.length} article migration files.`);

    let successCount = 0;
    let failCount = 0;

    for (const file of targetFiles) {
        const content = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf-8');

        if (!content.match(/INSERT INTO\s+(public\.)?articles/i)) {
            continue;
        }

        const match = content.match(/VALUES\s*\(([\s\S]*?)\)\s*;/);
        if (!match) {
            console.warn(`⚠️  Skipping ${file}: Could not parse VALUES`);
            continue;
        }

        const values = parseSqlValues(match[1]);

        // Expecting: id, title, slug, content, cover, location, desc, published, pub_at, created, updated
        // Index mapping:
        // 0: id
        // 1: title
        // 2: slug
        // 3: content
        // 4: cover_image_url
        // 5: location
        // 6: meta_description
        // 7: is_published
        // 8: published_at

        // Check value count to determine mapping
        // Case A: 11 values (includes ID) -> Efes/Sirince style
        // 0: id, 1: title, 2: slug, 3: content, 4: cover, 5: location, 6: desc, 7: public, 8: pub_at, 9: created, 10: updated

        // Case B: 10 values (no ID) -> Bodrum/Fethiye style
        // 0: title, 1: slug, 2: content, 3: cover, 4: location, 5: desc, 6: public, 7: pub_at, 8: created, 9: updated

        let articleData;

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

        // Clean up SQL function calls from values if present (e.g. NOW(), CURRENT_TIMESTAMP, INTERVAL)
        if (articleData.published_at && (
            articleData.published_at.toLowerCase().includes('now()') ||
            articleData.published_at.includes('CURRENT_TIMESTAMP') ||
            articleData.published_at.includes('INTERVAL')
        )) {
            articleData.published_at = new Date().toISOString();
        }

        try {
            const { error } = await supabase
                .from('articles')
                .upsert(articleData, { onConflict: 'slug' });

            if (error) {
                console.error(`❌ Failed ${file} (${articleData.slug}):`, error.message);
                failCount++;
            } else {
                console.log(`✅ Applied ${file} -> ${articleData.slug}`);
                successCount++;
            }
        } catch (e) {
            console.error(`❌ Exception ${file}:`, e);
            failCount++;
        }
    }

    console.log(`\nMigration Summary: ${successCount} succeeded, ${failCount} failed.`);
}

migrate();
