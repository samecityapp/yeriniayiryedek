import { helpers } from '@google-cloud/aiplatform';
import { GoogleAuth } from 'google-auth-library';
import fs from 'fs';
import path from 'path';
import https from 'https';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });

// Configuration
const PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT_ID; // User needs to add this
const LOCATION = 'us-central1'; // Imagen is usually here
const API_ENDPOINT = 'us-central1-aiplatform.googleapis.com';
const MODEL_ID = 'imagegeneration@006'; // Imagen 3 model ID (or 'imagen-3.0-generate-001' if available)

// Supabase Setup
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl!, supabaseKey!);

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

async function generateImageVertex(prompt: string, filename: string) {
    console.log(`🎨 Generating with Google Imagen 3: "${prompt.substring(0, 50)}..."`);

    // Custom Auth Client using the JSON file we expect
    const auth = new GoogleAuth({
        keyFile: 'google-credentials.json',
        scopes: ['https://www.googleapis.com/auth/cloud-platform']
    });

    const client = await auth.getClient();
    const accessToken = await client.getAccessToken();

    if (!PROJECT_ID) {
        console.error("❌ GOOGLE_CLOUD_PROJECT_ID is missing in .env.local");
        return;
    }

    // Prediction Request to Vertex AI REST API
    // We use REST manually because the Node SDK for Imagen specific parameters can be tricky, 
    // but let's try to use the raw fetch with the token we got.

    const url = `https://${API_ENDPOINT}/v1/projects/${PROJECT_ID}/locations/${LOCATION}/publishers/google/models/${MODEL_ID}:predict`;

    const requestBody = {
        instances: [
            { prompt: prompt }
        ],
        parameters: {
            sampleCount: 1,
            aspectRatio: "16:9",
            safetySetting: "block_only_high" // Allow some creative freedom
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
        // Imagen response format: predictions[0].bytesBase64Encoded
        if (!data.predictions || data.predictions.length === 0) {
            throw new Error('No predictions returned');
        }

        const base64Image = data.predictions[0].bytesBase64Encoded;
        const buffer = Buffer.from(base64Image, 'base64');

        // Save Local
        const localPath = path.join(ARTICLES_IMAGE_DIR, filename);
        const publicUrl = `/images/articles/${filename}`;

        fs.writeFileSync(localPath, buffer);
        console.log(`✅ Saved locally: ${localPath}`);

        return publicUrl;

    } catch (error) {
        console.error("❌ Generation Failed:", error);
        return null;
    }
}

// Example Execution for Istanbul Cover
async function run() {
    const prompt = "A candid iPhone 15 photo of a street near Galata Tower, Istanbul. Overcast day, flat natural lighting. Just a normal day, people walking, a street cat. Slightly imperfect composition, not professional. Realistic digital noise, unedited, raw jpg quality.";
    const filename = `istanbul-cover-imagen-${Date.now()}.jpg`;

    const url = await generateImageVertex(prompt, filename);

    if (url) {
        // Update DB
        const slug = 'where-to-stay-in-istanbul-best-areas-guide';
        const { error } = await supabase.from('articles').update({ cover_image_url: url }).eq('slug', slug);
        if (!error) console.log("✅ Database updated");
    }
}

run();
