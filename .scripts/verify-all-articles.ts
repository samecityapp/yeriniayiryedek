
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

const expectedSlugs = [
    'sapanca-bungalov-kiralama-guvenlik-sahte-hesap', // Verified
    'istanbuldan-sapancaya-arabasiz-ulasim-yht-otobus-tren',
    'sapanca-masukiye-gunubirlik-rota-kahvalti-selale-atv',
    'sapanca-atv-zipline-paintball-rehberi',
    'cocuklu-aileler-icin-sapanca-puset-park-bisiklet',
    'sapanca-yerel-alisveris-rehberi-bal-ayva-cerkez-peyniri',
    'sapanca-sogucak-yaylasi-kalabaliktan-kacis-trekking',
    'bodrum-beach-club-rehberi-2025-giris-ucretleri-happy-hour-ortam-analizi',
    'cocuklu-aileler-icin-fethiye-sig-deniz-rehberi',
    'fethiye-nerede-kalinir-bolge-rehberi',
    'fethiye-ne-zaman-gidilir-ay-ay-analiz', // Fethiye Season (Corrected from reseed file)
    'sirince-st-john-kilisesi-dilek-havuzu-cirkince-efsane', // Verified
    'nesin-matematik-koyu-ziyaret-rehberi-sirince', // Verified
    'bodrum-instagramlik-yerler-begonvilli-sokaklar-fotograf-noktalari', // Verified
    'bodrum-arabasiz-tatil-rehberi-ulasim-tuyolari', // Verified
    'camlik-buharli-lokomotif-muzesi-rehberi-sirince' // Verified
];

async function run() {
    console.log('Verifying articles...');
    let allGood = true;

    for (const slug of expectedSlugs) {
        const { data: article, error } = await supabase
            .from('articles')
            .select('slug, title, cover_image_url, is_published')
            .eq('slug', slug)
            .single();

        if (error || !article) {
            console.error(`❌ MISSING: ${slug}`);
            allGood = false;
        } else {
            let status = '✅ OK';
            if (!article.is_published) {
                status = '⚠️  UNPUBLISHED';
                allGood = false;
            }
            if (!article.cover_image_url || article.cover_image_url.includes('YOUR_IMAGE') || article.cover_image_url.includes('placeholder')) {
                status = '⚠️  BAD IMAGE';
                allGood = false;
            }
            console.log(`${status}: ${slug} (${article.title.substring(0, 30)}...) [Img: ${article.cover_image_url?.substring(0, 25)}...]`);
        }
    }

    if (allGood) {
        console.log('\nAll expected articles are present and appear healthy.');
    } else {
        console.log('\nSome articles are missing or have issues.');
    }
}

run();
