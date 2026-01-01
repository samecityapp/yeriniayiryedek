import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl!, supabaseKey!);

async function update() {
    const publicUrl = '/images/articles/istanbul-guide-cover-iphone-final.jpg';
    const slug = 'where-to-stay-in-istanbul-best-areas-guide';

    const { error } = await supabase
        .from('articles')
        .update({ cover_image_url: publicUrl })
        .eq('slug', slug);

    if (error) console.error(error);
    else console.log('✅ Updated DB with iPhone final cover.');
}

update();
