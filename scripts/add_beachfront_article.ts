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

const ARTICLE_DATA = {
    slug: 'what-beachfront-means-in-turkey-how-to-check-uk-guide',
    title: 'What “Beachfront” Means in Turkey: How UK Travellers Can Check Before Booking',
    meta_description: '“Beachfront” in Turkey can mean different things. Learn how to verify real beach access, sand vs pebble, roads, shuttles, and what’s included—so UK travellers avoid surprises. No hotel names.',
    primary_keyword: 'what beachfront means in Turkey',
    content: `<p><strong>Quick answer:</strong> In Turkey, “beachfront” can mean <strong>directly on the beach</strong>, <strong>across a road</strong>, <strong>near the beach</strong>, or <strong>access via shuttle</strong>. UK travellers should verify the <strong>exact path to the sea</strong>, the <strong>beach type</strong> (sand/pebble/platform), and what’s <strong>included vs extra</strong> (sunbeds, towels, snacks, drinks).</p>

<p>This is one of the biggest “surprise” areas for UK travellers — not because anyone is trying to trick you, but because travel listings use broad words that can hide practical details. This guide shows you how to check it properly in 5 minutes.</p>

<p>Internal reads (placeholders):
<a href="/guide/all-inclusive-in-turkey-explained-uk-guide">All-Inclusive in Turkey Explained</a> •
<a href="/guide/private-beach-in-turkey-what-it-includes">Private Beach in Turkey: What It Usually Includes</a> •
<a href="/guide/taxi-costs-in-turkey-what-to-avoid">Taxi Costs in Turkey: What to Avoid</a> •
<a href="/guide/quiet-sleep-in-turkey-avoid-noisy-rooms">Quiet Sleep in Turkey: Avoid Noisy Rooms</a>
</p>

<!-- IMAGE_COVER_PLACEHOLDER -->

<hr/>

<h2>The 4 types of “beachfront” you’ll see in Turkey</h2>

<h3>1) True beachfront (best-case scenario)</h3>
<p><strong>Meaning:</strong> You can walk out and you’re on the beach. No road. No shuttle. No “10 minutes away”.</p>
<p><strong>What it feels like:</strong> The easiest beach routine — especially for families and anyone who hates planning.</p>

<h3>2) Across-the-road beachfront</h3>
<p><strong>Meaning:</strong> The hotel is on the sea side but you cross a road or a pedestrian route to reach the beach.</p>
<p><strong>What to check:</strong> Is it a calm road, a busy road, or a dedicated crossing? With kids, this matters.</p>

<!-- IMAGE_PATH_PLACEHOLDER -->

<h3>3) “Near the beach” (walking distance but not on the sand)</h3>
<p><strong>Meaning:</strong> You can walk to the sea, but it’s not the hotel’s own beach frontage.</p>
<p><strong>What it feels like:</strong> Fine for adults and couples; can be annoying in high heat with kids and bags.</p>

<h3>4) Beach access via shuttle (or “our beach is at…”)</h3>
<p><strong>Meaning:</strong> The hotel has a beach area but it’s not right next to the property.</p>
<p><strong>What it feels like:</strong> Your beach day becomes a mini-plan. Works if the shuttle is frequent and simple.</p>

<hr/>

<h2>The UK traveller 5-minute verification checklist</h2>
<p>Before you book, verify these <strong>five</strong> things. It stops 90% of beach surprises.</p>

<h3>Check #1: The route — “how do I physically reach the sea?”</h3>
<ul>
  <li>Is it <strong>direct access</strong>, <strong>across a road</strong>, <strong>walking distance</strong>, or <strong>shuttle</strong>?</li>
  <li>If walking: is it flat and simple, or does it include hills/steps?</li>
</ul>

<h3>Check #2: The beach type — sand vs pebble vs platform</h3>
<ul>
  <li><strong>Sand:</strong> easiest for kids; classic “lie down all day” beach.</li>
  <li><strong>Pebble:</strong> can be beautiful and clear-water; many people prefer swim shoes.</li>
  <li><strong>Platform:</strong> common in some scenic areas; great for swimming, less “build sandcastles”.</li>
</ul>

<!-- IMAGE_PLATFORM_PLACEHOLDER -->

<p><strong>UK-friendly tip:</strong> If you have kids or hate discomfort underfoot, don’t assume “beachfront” means sand.</p>

<h3>Check #3: What’s included (this impacts budget)</h3>
<ul>
  <li>Are <strong>sunbeds and umbrellas</strong> included?</li>
  <li>Are <strong>towels</strong> included or paid?</li>
  <li>If all-inclusive: are <strong>beach drinks/snacks</strong> included or extra?</li>
</ul>

<h3>Check #4: The beach “setup” — is it actually comfortable?</h3>
<ul>
  <li>Is there <strong>shade</strong> in peak summer hours?</li>
  <li>Is the beach space generous or does it feel tight at busy times?</li>
  <li>Is it calm-water friendly or more “swim-only”?</li>
</ul>

<h3>Check #5: The “beach day friction” score</h3>
<p>Ask yourself: will a beach day be <strong>effortless</strong> or will it require constant small effort (walking, shuttles, carrying bags, crossing roads)?</p>

<p><strong>Simple scoring:</strong></p>
<ul>
  <li><strong>Effortless:</strong> true beachfront, easy access, shade, included sunbeds</li>
  <li><strong>Medium effort:</strong> across the road, short walk, some extras</li>
  <li><strong>High effort:</strong> shuttle-based, long walk, lots of add-ons</li>
</ul>

<hr/>

<h2>Common UK traveller misunderstandings (and the correct mental model)</h2>
<ul>
  <li><strong>“Beachfront = sand”</strong> → Not always. Verify sand/pebble/platform.</li>
  <li><strong>“Private beach = free”</strong> → Not always. Verify what’s included.</li>
  <li><strong>“Near the beach” is the same as on the beach</strong> → With heat and kids, it’s not.</li>
  <li><strong>“Shuttle to beach” is fine</strong> → It can be fine, but it changes the whole day rhythm.</li>
</ul>

<hr/>

<h2>Best choice by traveller type (UK-friendly)</h2>

<h3>Families</h3>
<ul>
  <li>Prioritise <strong>true beachfront</strong> and <strong>sand</strong> if possible.</li>
  <li>Minimise friction: avoid long walks or complex shuttle routines.</li>
</ul>

<h3>Couples</h3>
<ul>
  <li>Scenic pebble/platform beaches can be perfect if you mostly want swimming and views.</li>
  <li>Walkable “near the beach” can be fine if you like exploring.</li>
</ul>

<h3>Friends trips</h3>
<ul>
  <li>Focus on the day structure you want: effortless beach days or a more flexible plan.</li>
</ul>

<hr/>

<h2>FAQs</h2>

<h3>What does beachfront actually mean in Turkey?</h3>
<p>It can mean directly on the beach, across a road, walking distance, or beach access via shuttle. Always verify the physical route and the beach type.</p>

<h3>How can I check if a hotel is truly beachfront?</h3>
<p>Confirm the route to the sea (no shuttle, no long walk), check if there’s a road to cross, and verify the beach type and inclusions.</p>

<h3>Is “seafront” different from “beachfront”?</h3>
<p>Often yes. Seafront can mean the property faces the sea but doesn’t have direct sandy beach access (it might be a platform or a shoreline area). Verify the actual beach setup.</p>

<p><em>Last updated:</em> ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
`
};

async function run() {
    const timestamp = Date.now();
    console.log("🚀 Starting Beachfront Article Automation...");

    // SAFE PROMPTS for Authentic Feel
    const imagesToGenerate = [
        {
            placeholder: '<!-- IMAGE_COVER_PLACEHOLDER -->',
            filename: `turkey-beachfront-hotel-sunbed-view-authentic-${timestamp}.jpg`,
            prompt: "View from a sunbed on a Turkish hotel beach. Blue Aegean sea, sand and pebble mix. Authentic relaxed holiday atmosphere. Realistic travel photo. Bright day."
        },
        {
            placeholder: '<!-- IMAGE_PATH_PLACEHOLDER -->',
            filename: `turkey-hotel-path-to-beach-authentic-${timestamp}.jpg`,
            prompt: "A scenic path leading from a hotel garden to the beach in Turkey. Palm trees, flowers, blue sea in background. Authentic travel photography. Sunny day."
        },
        {
            placeholder: '<!-- IMAGE_PLATFORM_PLACEHOLDER -->',
            filename: `turkey-hotel-beach-platform-sea-view-${timestamp}.jpg`,
            prompt: "A wooden sunbathing platform over the turquoise sea at a Turkish hotel. People relaxing, ladder into water. Authentic Aegean coast vibe. Realistic."
        }
    ];

    let finalContent = ARTICLE_DATA.content;
    let coverImageUrl = '';

    for (const item of imagesToGenerate) {
        if (!item.placeholder.includes('COVER')) await sleep(5000);
        if (item.placeholder.includes('COVER')) await sleep(1000);

        const publicUrl = await generateImageVertex(item.prompt, item.filename);

        if (publicUrl) {
            if (item.placeholder.includes('COVER')) {
                coverImageUrl = publicUrl;
                finalContent = finalContent.replace(item.placeholder, '');
            } else if (item.placeholder) {
                const imgTag = `<img src="${publicUrl}" alt="${item.prompt}" class="w-full h-auto rounded-lg my-6 shadow-md" />`;
                finalContent = finalContent.replace(item.placeholder, imgTag);
            }
        } else {
            console.warn("⚠️ Image generation failed for:", item.filename);
            if (item.placeholder) finalContent = finalContent.replace(item.placeholder, '');
        }
    }

    // Insert into DB
    const { error } = await supabase.from('articles').upsert({
        slug: ARTICLE_DATA.slug,
        title: { en: ARTICLE_DATA.title, tr: "Türkiye'de Denize Sıfır Ne Demek? (TR Pasif)" },
        meta_description: { en: ARTICLE_DATA.meta_description, tr: "TR Pasif içerik." },
        content: { en: finalContent, tr: "<p>Bu içerik sadece İngilizce dilinde yayındadır.</p>" },
        cover_image_url: coverImageUrl,
        published_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    }, { onConflict: 'slug' });

    if (error) {
        console.error("❌ DB Insert Failed:", error);
    } else {
        console.log("✅ Beachfront Article Added Successfully!");
        console.log("👉 Slug:", ARTICLE_DATA.slug);
    }
}

run();
