import { createClient } from '@supabase/supabase-js';
import Replicate from 'replicate';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import https from 'https';

dotenv.config({ path: '.env.local' });

// --- Configuration ---
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const replicateToken = process.env.REPLICATE_API_TOKEN;

if (!supabaseUrl || !supabaseKey || !replicateToken) {
    console.error('Missing environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const replicate = new Replicate({ auth: replicateToken });

const ARTICLES_IMAGE_DIR = path.join(process.cwd(), 'public', 'images', 'articles');

async function downloadImage(url: string, filepath: string): Promise<void> {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            if (res.statusCode !== 200) { reject(new Error(`Failed to download: ${res.statusCode}`)); return; }
            const fileStream = fs.createWriteStream(filepath);
            res.pipe(fileStream);
            fileStream.on('finish', () => { fileStream.close(); resolve(); });
            fileStream.on('error', reject);
        }).on('error', reject);
    });
}

async function regenerateCover() {
    const slug = 'where-to-stay-in-turkey-first-time-guide';
    const filename = `uk-guide-cover-real-${Date.now()}.jpg`;

    // Highly realistic photo prompt
    const prompt = "A high-angle, authentic lifestyle photograph of a traditional Turkish breakfast spread on a balcony in Kalkan, Turkey, overlooking the deep blue Mediterranean sea. A glass of Turkish tea (cay) catching the sunlight, fresh olives, simit, and white cheese on a textured wooden table. Background features blurred white-washed stone villas and pink bougainvillea. Shot on Kodak Portra 400 film, 35mm lens. Natural hard morning lighting, slight grain, high texture detail, photorealistic, no AI smoothing.";

    console.log(`Generating realistic cover for: ${slug}`);
    console.log(`Prompt: ${prompt}`);

    try {
        const output = await replicate.run("black-forest-labs/flux-1.1-pro", {
            input: {
                prompt: prompt,
                aspect_ratio: "16:9",
                output_format: "jpg",
                safety_tolerance: 2,
            },
        });

        let imageUrl = '';
        if (typeof output === 'string') imageUrl = output;
        else if (Array.isArray(output) && output.length > 0) imageUrl = output[0];
        else imageUrl = String(output);

        const localPath = path.join(ARTICLES_IMAGE_DIR, filename);
        const publicUrl = `/images/articles/${filename}`;

        await downloadImage(imageUrl, localPath);
        console.log(`Saved locally: ${localPath}`);

        // Update DB
        const { error } = await supabase
            .from('articles')
            .update({ cover_image_url: publicUrl })
            .eq('slug', slug);

        if (error) console.error('DB Update Error:', error);
        else console.log('✅ Database updated with new realistic cover image.');

        // Also update the content if the old placeholder was there? 
        // The previous script replaced the placeholder. 
        // Ideally we should replace the FIRST image in the content if we want consistent internal images, 
        // but the user mostly complained about the cover. Let's stick to cover_image_url for now.
        // If the content has the old image embedded, we might want to update that too.

        // Let's fetch content to see if we need to replace the first img src
        const { data: article } = await supabase.from('articles').select('content').eq('slug', slug).single();
        if (article && article.content) {
            let contentObj = typeof article.content === 'string' ? JSON.parse(article.content) : article.content;
            let html = contentObj.en || '';

            // Naive replace of the first image source if it matches our old pattern or simply the top image
            // The previous script inserted: <img src="/images/articles/uk-guide-cover-..." ... />
            // Let's replace the first occurrence of /images/articles/uk-guide-cover-

            const regex = /\/images\/articles\/uk-guide-cover-[0-9]+\.jpg/;
            if (regex.test(html)) {
                console.log('Found old cover image in content, replacing...');
                const newHtml = html.replace(regex, publicUrl);
                contentObj.en = newHtml;

                await supabase
                    .from('articles')
                    .update({ content: JSON.stringify(contentObj) })
                    .eq('slug', slug);
                console.log('✅ Article content updated with new image URL.');
            }
        }

    } catch (err) {
        console.error('Error:', err);
    }
}

regenerateCover();
