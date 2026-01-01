import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function check() {
    const slug = 'where-to-stay-in-antalya-best-areas-guide';
    const { data, error } = await supabase.from('articles').select('*').eq('slug', slug);
    console.log('Article found:', data?.length);
    if (error) console.error(error);

    if (data && data.length > 0) {
        console.log('Title:', data[0].title);
        console.log('Cover:', data[0].cover_image_url);
    }
}

check();
