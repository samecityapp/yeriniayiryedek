import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { GoogleAuth } from 'google-auth-library';
import fs from 'fs';
import path from 'path';

dotenv.config({ path: '.env.local' });

// Configuration
const PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT_ID;
const LOCATION = 'us-central1';
const API_ENDPOINT = 'us-central1-aiplatform.googleapis.com';
const MODEL_ID = 'imagen-3.0-generate-001';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const ARTICLES_IMAGE_DIR = path.join(process.cwd(), 'public', 'images', 'articles');

async function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function generateImageVertex(prompt: string, filename: string, retries = 3) {
    console.log(`🎨 Generating ${filename} with Imagen 3...`);

    const localPath = path.join(ARTICLES_IMAGE_DIR, filename);
    if (fs.existsSync(localPath)) {
        console.log(`⏩ File exists, skipping: ${filename}`);
        return `/images/articles/${filename}`;
    }

    const auth = new GoogleAuth({
        keyFile: 'google-credentials.json',
        scopes: ['https://www.googleapis.com/auth/cloud-platform']
    });

    const client = await auth.getClient();
    const accessToken = await client.getAccessToken();
    const url = `https://${API_ENDPOINT}/v1/projects/${PROJECT_ID}/locations/${LOCATION}/publishers/google/models/${MODEL_ID}:predict`;

    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            if (attempt > 1) await sleep(20000);

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken.token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    instances: [{ prompt }],
                    parameters: { sampleCount: 1, aspectRatio: "16:9", safetySetting: "block_only_high", personGeneration: "allow_adult" }
                })
            });

            if (!response.ok) {
                if (response.status === 429) {
                    console.warn(`⏳ Quota exceeded (429). Waiting 30s before retry ${attempt + 1}...`);
                    await sleep(30000);
                    continue;
                }
                throw new Error(`Vertex API Error: ${response.status}`);
            }

            const data = await response.json();
            if (!data.predictions?.[0]?.bytesBase64Encoded) throw new Error('No predictions');

            fs.writeFileSync(localPath, Buffer.from(data.predictions[0].bytesBase64Encoded, 'base64'));
            console.log(`✅ Saved: ${localPath}`);
            return `/images/articles/${filename}`;
        } catch (error) {
            console.error(`❌ Attempt ${attempt} failed:`, error);
            if (attempt === retries) return null;
        }
    }
    return null;
}

const SLUG = 'family-stays-in-turkey-what-uk-parents-should-check';

async function run() {
    const timestamp = Date.now();
    console.log("🚀 Starting Family Stays REPAIR...");

    // SAFE PROMPTS (No people/kids)
    const repairImages = [
        {
            role: 'COVER',
            placeholder: '<!-- IMAGE_COVER_PLACEHOLDER -->', // Note: original script might have removed this if it "failed" or kept it. 
            // We will blindly try to generate and replace/insert.
            filename: `turkey-family-hotel-pool-safe-authentic-${timestamp}.jpg`,
            prompt: "A beautiful hotel swimming pool area in Turkey with colorful towels on sunbeds and parasols. Shallow section visible. Clear blue sky. Authentic holiday atmosphere. Realistic."
        },
        {
            role: 'FOOD',
            placeholder: '<!-- IMAGE_FOOD_PLACEHOLDER -->',
            filename: `turkey-hotel-snack-table-view-${timestamp}.jpg`,
            prompt: "A close up of a table set with fresh orange juice and fruit slices by a pool in Turkey. Sunny day. Authentic travel photography. Realistic."
        },
        {
            role: 'KIDS_CLUB',
            placeholder: '<!-- IMAGE_KIDS_CLUB_PLACEHOLDER -->',
            filename: `turkey-kids-playground-colorful-${timestamp}.jpg`,
            prompt: "A colorful outdoor playground with slides and swings on a green lawn at a Turkish hotel. Sunny day. Empty, no people. Authentic travel photography. Realistic."
        }
    ];

    // Fetch current content from DB
    const { data: article, error: fetchError } = await supabase
        .from('articles')
        .select('content, cover_image_url')
        .eq('slug', SLUG)
        .single();

    if (fetchError || !article) {
        console.error("❌ Could not fetch article to repair:", fetchError);
        return;
    }

    let finalContent = article.content;
    let coverImageUrl = article.cover_image_url;

    for (const item of repairImages) {
        // Check if we need to generate this image
        // If it's a cover and cover_image_url is empty, OR if content still has placeholder
        const needsGeneration =
            (item.role === 'COVER' && !coverImageUrl) ||
            (item.placeholder && finalContent.includes(item.placeholder)) ||
            (item.role === 'FOOD' && !finalContent.includes('turkey-family-snack-time')) || // approximate check if old one exists
            (item.role === 'KIDS_CLUB' && finalContent.includes('IMAGE_KIDS_CLUB_PLACEHOLDER'));

        if (needsGeneration) {
            console.log(`🔧 Repairing ${item.role}...`);
            const publicUrl = await generateImageVertex(item.prompt, item.filename);

            if (publicUrl) {
                if (item.role === 'COVER') {
                    coverImageUrl = publicUrl;
                    // Also try to remove placeholder if it exists
                    finalContent = finalContent.replace('<!-- IMAGE_COVER_PLACEHOLDER -->', '');
                } else {
                    const imgTag = `<img src="${publicUrl}" alt="${item.prompt}" class="w-full h-auto rounded-lg my-6 shadow-md" />`;

                    // Replace placeholder if exists
                    if (finalContent.includes(item.placeholder)) {
                        finalContent = finalContent.replace(item.placeholder, imgTag);
                    } else {
                        // Placeholder was stripped. Use text anchors.
                        if (item.role === 'FOOD') {
                            // Try to toggle it after the list in section 4
                            const anchor = '<h3>4) Food rhythm (snacks matter more than you think)</h3>';
                            const listEnd = '</ul>';
                            const insertionPoint = finalContent.indexOf(listEnd, finalContent.indexOf(anchor));
                            if (insertionPoint !== -1) {
                                finalContent = finalContent.slice(0, insertionPoint + 5) + '\n' + imgTag + finalContent.slice(insertionPoint + 5);
                            }
                        }
                        if (item.role === 'KIDS_CLUB') {
                            const anchor = '<h3>6) Kids club and activities (only if you’ll actually use them)</h3>';
                            const listEnd = '</ul>';
                            const insertionPoint = finalContent.indexOf(listEnd, finalContent.indexOf(anchor));
                            if (insertionPoint !== -1) {
                                finalContent = finalContent.slice(0, insertionPoint + 5) + '\n' + imgTag + finalContent.slice(insertionPoint + 5);
                            }
                        }
                    }
                }
            }
        }
    }

    // Double check placeholders - if any remain, strip them
    finalContent = finalContent.replace(/<!-- IMAGE_[A-Z_]+_PLACEHOLDER -->/g, '');

    const { error } = await supabase.from('articles').update({
        content: finalContent,
        cover_image_url: coverImageUrl,
        updated_at: new Date().toISOString()
    }).eq('slug', SLUG);

    if (error) {
        console.error("❌ repair DB Update Failed:", error);
    } else {
        console.log("✅ Family Stays Article REPAIRED Successfully!");
    }
}

run();
