
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    console.log('Verifying article counts...');

    const { data: articles, error } = await supabase
        .from('articles')
        .select('slug, title, location');

    if (error) {
        console.error('Error:', error);
        return;
    }

    const counts: Record<string, number> = {};
    const listing: Record<string, string[]> = {};

    articles?.forEach(a => {
        // Normalize location for grouping (simple check)
        let key = 'Other';
        if (a.location?.includes('Bodrum')) key = 'Bodrum';
        else if (a.location?.includes('Fethiye')) key = 'Fethiye';
        else if (a.location?.includes('Şirince')) key = 'Şirince';
        else if (a.location?.includes('Sapanca')) key = 'Sapanca';

        counts[key] = (counts[key] || 0) + 1;
        if (!listing[key]) listing[key] = [];
        listing[key].push(a.title);
    });

    console.log('\n--- Summary ---');
    console.table(counts);

    console.log('\n--- Missing Check (Bodrum) ---');
    const expectedBodrum = [
        'Orak Adası', 'Yerel Lezzetler', 'Sarı Yaz', 'Instagram',
        'Arabasız', 'Beach Club', 'Halk Plajları', 'Nerede Kalınır'
    ];
    expectedBodrum.forEach(ex => {
        const found = listing['Bodrum']?.some(t => t.includes(ex) || t.includes(ex.split(' ')[0])); // loose match
        console.log(`[${found ? 'OK' : 'MISSING'}] ${ex}`);
    });

    console.log('\n--- Missing Check (Fethiye) ---');
    const expectedFethiye = ['Ne Zaman Gidilir', 'Çocuklu Aileler', 'Babadağ', 'Kelebekler', 'Kabak'];
    expectedFethiye.forEach(ex => {
        const found = listing['Fethiye']?.some(t => t.includes(ex));
        console.log(`[${found ? 'OK' : 'MISSING'}] ${ex}`);
    });

    console.log('\n--- Camlik Check ---');
    const camlik = articles?.find(a => a.slug.includes('camlik'));
    console.log(`Camlik location matches Sirince? ${camlik?.location?.includes('Şirince')}`);
}

run();
