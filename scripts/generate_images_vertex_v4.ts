import { GoogleAuth } from 'google-auth-library';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });

// Configuration
const PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT_ID;
const LOCATION = 'us-central1';
const API_ENDPOINT = 'us-central1-aiplatform.googleapis.com';
const MODEL_ID = 'imagen-4.0-generate-001'; // Explicitly using Imagen 4

// Supabase Setup
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl!, supabaseKey!);

const ARTICLES_IMAGE_DIR = path.join(process.cwd(), 'public', 'images', 'articles');
if (!fs.existsSync(ARTICLES_IMAGE_DIR)) {
    fs.mkdirSync(ARTICLES_IMAGE_DIR, { recursive: true });
}

async function generateImageVertexV4(prompt: string, filename: string) {
    console.log(`🎨 Generating with Google Imagen 4: "${prompt.substring(0, 50)}..."`);

    // Custom Auth Client
    const auth = new GoogleAuth({
        keyFile: 'google-credentials.json',
        scopes: ['https://www.googleapis.com/auth/cloud-platform']
    });

    const client = await auth.getClient();
    const accessToken = await client.getAccessToken();

    if (!PROJECT_ID) {
        console.error("❌ GOOGLE_CLOUD_PROJECT_ID is missing in .env.local. Please add it.");
        return null;
    }

    const url = `https://${API_ENDPOINT}/v1/projects/${PROJECT_ID}/locations/${LOCATION}/publishers/google/models/${MODEL_ID}:predict`;

    const requestBody = {
        instances: [
            { prompt: prompt }
        ],
        parameters: {
            sampleCount: 1,
            aspectRatio: "16:9",
            safetySetting: "block_only_high",
            personGeneration: "allow_adult", // Sometimes needed for street scenes
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

        if (!data.predictions || data.predictions.length === 0) {
            throw new Error('No predictions returned from Vertex AI');
        }

        const base64Image = data.predictions[0].bytesBase64Encoded;
        const buffer = Buffer.from(base64Image, 'base64');

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

async function run() {
    // Imagen 4 Prompt Strategy: Raw, Imperfect, Authentic
    const prompt = "A candid, slightly imperfect iPhone photo of a busy street in Istanbul's Karakoy district. Overcast diffuse lighting. Authentic street photography. 35mm focal length. High texture detail on cobblestones. No AI smoothing, no HDR. Realistic colors.";
    const filename = `istanbul-cover-imagen4-${Date.now()}.jpg`;

    const url = await generateImageVertexV4(prompt, filename);

    if (url) {
        const slug = 'where-to-stay-in-istanbul-best-areas-guide';
        const { error } = await supabase.from('articles').update({ cover_image_url: url }).eq('slug', slug);
        if (!error) console.log("✅ Database updated with Imagen 4 cover.");
        else console.error("Database Update Error:", error);
    }
}

run();
