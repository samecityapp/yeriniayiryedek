import { GoogleAuth } from 'google-auth-library';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });

// --- Configuration ---
const PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT_ID;
const LOCATION = 'us-central1';
const API_ENDPOINT = 'us-central1-aiplatform.googleapis.com';
const MODEL_ID = 'imagen-4.0-generate-001';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl!, supabaseKey!);

const ARTICLES_IMAGE_DIR = path.join(process.cwd(), 'public', 'images', 'articles');
if (!fs.existsSync(ARTICLES_IMAGE_DIR)) {
    fs.mkdirSync(ARTICLES_IMAGE_DIR, { recursive: true });
}

// Custom Auth Client for Vertex AI
async function generateImageVertexV4(prompt: string, filename: string) {
    console.log(`🎨 Generating ${filename} with Imagen 4...`);

    if (!fs.existsSync('google-credentials.json')) {
        console.error("❌ 'google-credentials.json' not found. Please provide the service account key.");
        return null;
    }

    const auth = new GoogleAuth({
        keyFile: 'google-credentials.json',
        scopes: ['https://www.googleapis.com/auth/cloud-platform']
    });

    const client = await auth.getClient();
    const accessToken = await client.getAccessToken();

    if (!PROJECT_ID) {
        console.error("❌ GOOGLE_CLOUD_PROJECT_ID is missing in .env.local");
        return null;
    }

    const url = `https://${API_ENDPOINT}/v1/projects/${PROJECT_ID}/locations/${LOCATION}/publishers/google/models/${MODEL_ID}:predict`;

    const requestBody = {
        instances: [{ prompt: prompt }],
        parameters: {
            sampleCount: 1,
            aspectRatio: "16:9",
            safetySetting: "block_only_high",
            personGeneration: "allow_adult",
        }
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken.token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`Vertex API Error: ${response.status} - ${errText}`);
        }

        const data = await response.json();
        if (!data.predictions || data.predictions.length === 0) throw new Error('No predictions returned');

        const base64Image = data.predictions[0].bytesBase64Encoded;
        const buffer = Buffer.from(base64Image, 'base64');

        const localPath = path.join(ARTICLES_IMAGE_DIR, filename);
        const publicUrl = `/images/articles/${filename}`;

        fs.writeFileSync(localPath, buffer);
        console.log(`✅ Saved: ${localPath}`);

        return publicUrl;
    } catch (error) {
        console.error("❌ Generation Failed:", error);
        return null;
    }
}

async function updateIstanbulArticleV4() {
    console.log('--- upgrading istanbul article to imagen 4 (ultra realism) ---');

    const timestamp = Date.now();

    // Prompt Strategy: "iPhone / Raw / Authentic"
    // We want to remove ALL "cinematic" or "AI" vibes.
    const prompts = [
        {
            key: 'IMAGE_COVER_PLACEHOLDER',
            filename: `istanbul-cover-v4-${timestamp}.jpg`,
            prompt: "A candid iPhone 15 photo of a narrow street in Galata, Istanbul. Overcast day, flat natural lighting. People walking, a street cat on the corner. Galata Tower visible in the background but not perfectly framed. Authentic street photography, raw jpg, slight noise, realistic colors."
        },
        {
            key: 'IMAGE_HISTORIC_PLACEHOLDER',
            filename: `istanbul-historic-v4-${timestamp}.jpg`,
            prompt: "A tourist snapshot of the Blue Mosque courtyard. Ordinary morning light, slightly cloudy. A few pigeons on the ground. Shot on a smartphone. Realistic textures of the stone pavement. Not edited, not vibrant."
        },
        {
            key: 'IMAGE_NEIGHBOURHOOD_PLACEHOLDER',
            filename: `istanbul-neighbourhood-v4-${timestamp}.jpg`,
            prompt: "A street-level photo of a small cafe in Cihangir. People sitting at small tables drinking tea. Cars parked on the side. Authentic chaotic Istanbul street vibe. Natural daylight. Shot on 35mm film, grainy texture."
        },
        {
            key: 'IMAGE_NIGHTLIFE_PLACEHOLDER',
            filename: `istanbul-nightlife-v4-${timestamp}.jpg`,
            prompt: "A low-light photo of Nevizade street at night. blurry movement of people. Neon restaurant signs reflecting on wet ground. High ISO, digital noise. Feels like a real night out photo. No perfect lighting."
        },
        {
            key: 'IMAGE_ASIAN_SIDE_PLACEHOLDER',
            filename: `istanbul-asian-side-v4-${timestamp}.jpg`,
            prompt: "A relaxed photo of Moda seaside park. Families sitting on the grass, young people chatting. The sea is calm. Sunset light is soft but not over-saturated. Realistic landscape photo from a phone."
        }
    ];

    // 1. Fetch current content
    const slug = 'where-to-stay-in-istanbul-best-areas-guide';
    const { data: article } = await supabase.from('articles').select('*').eq('slug', slug).single();

    if (!article) {
        console.error("Article not found!");
        return;
    }

    let contentObj = typeof article.content === 'string' ? JSON.parse(article.content) : article.content;
    let html = contentObj.en || '';

    // 2. Generate and Replace Images
    let coverImageUrl = article.cover_image_url;

    for (const item of prompts) {
        const newUrl = await generateImageVertexV4(item.prompt, item.filename);

        if (newUrl) {
            if (item.key === 'IMAGE_COVER_PLACEHOLDER') {
                coverImageUrl = newUrl;
                // Try to replace the old cover image in content if it exists
                // Matches any previous istanbul-guide-cover or istanbul-cover pattern
                html = html.replace(/\/images\/articles\/istanbul.*cover.*\.jpg/g, newUrl);
            } else {
                // Replace internal body images based on their previous filenames or placeholders
                // Since we know the previous script used specific filenames, we can try to replace them by pattern?
                // Or simpler: We don't have the original placeholders anymore.
                // We have to find the <img> tags. 
                // Logic: The previous script inserted <img src="..." ... >.
                // We can regex match based on the section context? Hard.

                // Easier: Re-inject the raw content with placeholders?
                // No, that overwrites manual edits.

                // Best approach for this script:
                // Construct a fresh content block using the RAW content from the *previous* script source if possible, 
                // OR regex replace the *specific* previous image files.

                // Previous filenames were: istanbul-historic-..., istanbul-neighbourhood-..., etc.
                // Let's replace by keyword match in the src.

                const keyword = item.key.replace('IMAGE_', '').replace('_PLACEHOLDER', '').toLowerCase().replace('_', '-');
                // e.g. "historic", "neighbourhood"

                const regex = new RegExp(`\/images\/articles\/istanbul-${keyword}-.*\\.jpg`, 'g');
                if (regex.test(html)) {
                    html = html.replace(regex, newUrl);
                    console.log(`Replaced image for ${keyword}`);
                } else {
                    console.warn(`Could not find existing image for ${keyword} to replace. Inserting manually?`);
                    // Fallback: If not found (maybe first run?), we can't easily insert. 
                    // But since we ran the previous script, they should be there.
                }
            }
        }
    }

    // 3. Update Supabase
    contentObj.en = html;

    const { error } = await supabase.from('articles').update({
        cover_image_url: coverImageUrl,
        content: JSON.stringify(contentObj),
        updated_at: new Date().toISOString()
    }).eq('slug', slug);

    if (error) console.error("Database Update Error:", error);
    else console.log("✅ Successfully upgraded Istanbul article to V4 (Imagen 4)!");
}

updateIstanbulArticleV4();
