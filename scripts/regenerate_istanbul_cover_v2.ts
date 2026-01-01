import { createClient } from '@supabase/supabase-js';
import Replicate from 'replicate';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import https from 'https';

dotenv.config({ path: '.env.local' });

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
    const slug = 'where-to-stay-in-istanbul-best-areas-guide';
    const filename = `istanbul-guide-cover-v3-${Date.now()}.jpg`;

    // Prompt Strategy V3: Editorial / Documentary
    // Avoiding "Cinematic", "Golden Hour" which can look fake.
    // Focusing on "Neutral colors", "Sharp", "Daylight", "Travel Documentary".
    const prompt = "A high-quality editorial travel photograph of a busy street in Galata, Istanbul. Mid-day overcast soft lighting (neutral white balance). A red tram passing in the background. Pedestrians walking. Sharp details, realistic textures on the cobblestones. Style of Condé Nast Traveler. 50mm lens. No vignette, no filters, no AI smoothing. Ultra-realistic.";

    console.log(`Generating V3 Editorial cover for: ${slug}`);
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
        else console.log('✅ Database updated with V3 cover image.');

    } catch (err) {
        console.error('Error:', err);
    }
}

regenerateCover();
