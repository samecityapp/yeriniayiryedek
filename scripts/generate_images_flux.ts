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
    console.error('Missing environment variables: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, or REPLICATE_API_TOKEN');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const replicate = new Replicate({
    auth: replicateToken,
});

// Directory to save images
const ARTICLES_IMAGE_DIR = path.join(process.cwd(), 'public', 'images', 'articles');

if (!fs.existsSync(ARTICLES_IMAGE_DIR)) {
    fs.mkdirSync(ARTICLES_IMAGE_DIR, { recursive: true });
}

// Function to download image
async function downloadImage(url: string, filepath: string): Promise<void> {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            if (res.statusCode !== 200) {
                reject(new Error(`Failed to download image: ${res.statusCode}`));
                return;
            }
            const fileStream = fs.createWriteStream(filepath);
            res.pipe(fileStream);
            fileStream.on('finish', () => {
                fileStream.close();
                resolve();
            });
            fileStream.on('error', (err) => {
                fs.unlink(filepath, () => { }); // Delete failed file
                reject(err);
            });
        }).on('error', (err) => {
            fs.unlink(filepath, () => { });
            reject(err);
        });
    });
}

async function generateImages() {
    console.log('--- Starting Flux Image Generation ---');

    // 1. Check for command line argument (slug)
    const targetSlug = process.argv[2];

    let query = supabase
        .from('articles')
        .select('id, slug, title, location');

    if (targetSlug) {
        console.log(`Targeting specific article: ${targetSlug}`);
        query = query.eq('slug', targetSlug);
    } else {
        // Default behavior: find missing covers
        query = query.is('cover_image_url', null).limit(5);
    }

    const { data: articles, error } = await query;

    if (error) {
        console.error('Error fetching articles:', error);
        return;
    }

    if (!articles || articles.length === 0) {
        console.log('No articles found without cover images.');
        return;
    }

    console.log(`Found ${articles.length} articles needing images.`);

    for (const article of articles) {
        const slug = article.slug;
        const titleStr = typeof article.title === 'string' ? article.title : JSON.stringify(article.title);

        // Parse title if it's JSON to get English or Turkish
        let promptTitle = titleStr;
        try {
            if (titleStr.trim().startsWith('{')) {
                const parsed = JSON.parse(titleStr);
                promptTitle = parsed.en || parsed.tr || titleStr;
            }
        } catch (e) { }

        // Construct Prompt
        // Enhancing with quality keywords and specific location context
        const prompt = `A cinematic, high-resolution photo of ${promptTitle}. Location: ${article.location}. 
    Style: Professional travel photography, golden hour lighting, clear sky, vibrant colors, photorealistic, 4k, incredibly detailed. 
    No text overlay.`;

        console.log(`\nGenerating for: [${slug}]`);
        console.log(`Prompt: ${prompt.substring(0, 100)}...`);

        try {
            // Call Flux 1.1 Pro
            const output = await replicate.run("black-forest-labs/flux-1.1-pro", {
                input: {
                    prompt: prompt,
                    aspect_ratio: "16:9",
                    output_format: "jpg",
                    safety_tolerance: 2,
                },
            });

            // Output should be a readable stream or URL. 
            // For flux-1.1-pro, it typically returns a URL or file object.
            // Let's assume URL for now based on typical output.

            console.log('Generation successful. Downloading...');

            // The output from replicate.run depends on the model.
            // Flux usually simply returns a URL or an array with a URL.
            // We will handle generic response.
            let imageUrl = '';
            if (typeof output === 'string') {
                imageUrl = output;
            } else if (Array.isArray(output) && output.length > 0) {
                imageUrl = output[0]; // Often comes as an array
            } else if (typeof output === 'object' && output !== null) {
                // Sometimes it returns a stream, but client usage usually resolves it.
                // Let's inspect if needed, but standard usage is URL.
                imageUrl = String(output);
            }

            if (!imageUrl || !imageUrl.startsWith('http')) {
                console.error('Unexpected output format from Replicate:', output);
                continue;
            }

            const filename = `${slug}.jpg`;
            const localPath = path.join(ARTICLES_IMAGE_DIR, filename);
            const publicUrl = `/images/articles/${filename}`; // This is what we save to DB

            await downloadImage(imageUrl, localPath);
            console.log(`Saved to: ${localPath}`);

            // Update Database
            const { error: updateError } = await supabase
                .from('articles')
                .update({ cover_image_url: publicUrl })
                .eq('id', article.id);

            if (updateError) {
                console.error(`Failed to update DB for ${slug}:`, updateError);
            } else {
                console.log(`✅ Database updated for ${slug}`);
            }

        } catch (err) {
            console.error(`Error generating image for ${slug}:`, err);
        }
    }

    console.log('\n--- Generation Process Complete ---');
}

generateImages();
