import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function checkArticle() {
    const slug = 'where-to-stay-in-bodrum-best-areas-guide-uk';
    console.log(`🔍 Checking for slug: ${slug}`);

    const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('slug', slug)
        .single();

    if (error) {
        console.error("❌ Error fetching article:", error);
    } else {
        console.log("✅ Article found!");
        console.log("Title (en):", data.title?.en || data.title);
        console.log("ID:", data.id);
    }
}

checkArticle();
