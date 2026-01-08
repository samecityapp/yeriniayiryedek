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
    slug: 'adults-only-stays-in-turkey-how-to-choose-uk-guide',
    title: 'Adults-Only Stays in Turkey: How UK Travellers Choose the Right Vibe (Quiet vs Lively)',
    meta_description: 'Booking adults-only in Turkey from the UK? Learn how to choose the right vibe—quiet luxury vs lively social—plus the checklist UK travellers need to avoid booking the “wrong” atmosphere. No hotel names.',
    primary_keyword: 'adults-only stays in Turkey',
    content: `<p><strong>Quick answer:</strong> “Adults-only” in Turkey doesn’t automatically mean “quiet”. Some adults-only stays are designed for <strong>peace and privacy</strong>; others are designed for <strong>social energy</strong> with entertainment and late nights. UK travellers should choose adults-only based on <strong>vibe first</strong>, then confirm <strong>room position</strong>, <strong>evening noise</strong>, and <strong>what’s included</strong>.</p>

<p>This guide helps you avoid the #1 adults-only mistake: booking adults-only expecting calm, then landing in a lively “holiday energy” property (or the opposite). Neither is bad — it’s just about choosing intentionally.</p>

<p>Internal reads (placeholders):
<a href="/guide/how-to-choose-hotel-in-turkey-checklist-uk-guide">How to Choose a Hotel in Turkey (Checklist)</a> •
<a href="/guide/all-inclusive-in-turkey-explained-uk-guide">All-Inclusive in Turkey Explained</a> •
<a href="/guide/quiet-sleep-in-turkey-avoid-noisy-rooms">Quiet Sleep in Turkey: Avoid Noisy Rooms</a> •
<a href="/guide/private-beach-in-turkey-usually-includes-extras-uk-travellers-miss">Private Beach in Turkey: What It Includes</a> •
<a href="/guide/where-to-stay-in-turkey-couples-guide">Where to Stay in Turkey for Couples</a>
</p>

<!-- IMAGE_COVER_PLACEHOLDER -->

<hr/>

<h2>Step 1: Decide which adults-only you actually want</h2>
<p>There are two main adults-only styles. Pick one — and you’ll immediately filter out the wrong options.</p>

<h3>A) Quiet adults-only (relaxation-first)</h3>
<ul>
  <li><strong>Best for:</strong> couples who want calm, rest, and early nights</li>
  <li><strong>Holiday rhythm:</strong> slow mornings, beach/pool, quiet evenings</li>
  <li><strong>What matters:</strong> room position, noise control, calm zones</li>
</ul>

<h3>B) Lively adults-only (social energy)</h3>
<ul>
  <li><strong>Best for:</strong> friends/couples who want a social holiday</li>
  <li><strong>Holiday rhythm:</strong> daytime music, entertainment, late dinners</li>
  <li><strong>What matters:</strong> event schedule, bar zones, vibe consistency</li>
</ul>

<!-- IMAGE_VIBE_PLACEHOLDER -->

<p><strong>Simple rule:</strong> Adults-only removes kids. It doesn’t remove music, events, or nightlife. You still need to choose vibe.</p>

<hr/>

<h2>Step 2: Use the UK traveller “vibe test” (fast and accurate)</h2>
<p>Before booking, answer these honestly:</p>
<ul>
  <li>Do we want to be asleep by <strong>11pm</strong> most nights?</li>
  <li>Do we want a <strong>quiet pool</strong> vibe or a <strong>music</strong> vibe?</li>
  <li>Do we want to leave the property in the evenings, or stay in?</li>
  <li>Do we care more about <strong>peace</strong> or <strong>atmosphere</strong>?</li>
</ul>

<p><strong>If you answered “sleep matters”,</strong> you’re in the quiet adults-only camp. Protect that choice with the checklist below.</p>

<hr/>

<h2>Step 3: The adults-only checklist (what UK travellers should verify)</h2>

<h3>1) Evening noise risk (the deal-breaker)</h3>
<ul>
  <li>Is there <strong>evening entertainment</strong>? How often?</li>
  <li>Where is the entertainment area relative to rooms?</li>
  <li>Is there a <strong>quiet wing</strong> or calm zone?</li>
</ul>

<p>Pair this with: <a href="/guide/quiet-sleep-in-turkey-avoid-noisy-rooms">Quiet Sleep in Turkey</a>.</p>

<h3>2) Pool and beach vibe (quiet vs music)</h3>
<ul>
  <li>Is there a “quiet pool” concept or is it a social pool atmosphere?</li>
  <li>Does the beach area feel calm, or like a beach club?</li>
</ul>

<!-- IMAGE_POOL_PLACEHOLDER -->

<h3>3) Food rhythm (what kind of evenings do you want?)</h3>
<ul>
  <li>Do you want calm dinners or late-night energy?</li>
  <li>If all-inclusive: are there time windows that force your schedule?</li>
</ul>

<h3>4) “Adults-only” scope (this matters)</h3>
<ul>
  <li>Is the entire property adults-only, or only certain zones?</li>
  <li>If it’s zones: are the quiet zones genuinely quiet?</li>
</ul>

<h3>5) Room positioning (protect the holiday)</h3>
<ul>
  <li>Avoid rooms above bars or near late-night zones if you want calm.</li>
  <li>Request a quieter position if you’re noise-sensitive.</li>
</ul>

<hr/>

<h2>Adults-only + all-inclusive: a UK-friendly reality check</h2>
<p>Adults-only all-inclusive can be brilliant value if your goal is predictable costs and a simple routine. But it’s only “perfect” if the vibe matches your sleep and evening preferences.</p>

<ul>
  <li><strong>Quiet all-inclusive:</strong> best for proper rest and reset.</li>
  <li><strong>Lively all-inclusive:</strong> best for social energy and entertainment.</li>
</ul>

<p>Read: <a href="/guide/all-inclusive-in-turkey-explained-uk-guide">All-Inclusive in Turkey Explained</a>.</p>

<hr/>

<h2>Best adults-only choice by UK traveller type</h2>

<h3>Couples (romantic reset)</h3>
<ul>
  <li>Choose <strong>quiet adults-only</strong>, prioritise calm zones + room position.</li>
</ul>

<h3>Friends trips (social holiday)</h3>
<ul>
  <li>Choose <strong>lively adults-only</strong>, prioritise event schedule + bar zones.</li>
</ul>

<h3>“We want both” travellers</h3>
<ul>
  <li>Choose a base with <strong>separate zones</strong> (quiet daytime areas + optional evening energy), and protect sleep with room choice.</li>
</ul>

<hr/>

<h2>Common mistakes (framed positively)</h2>
<ul>
  <li><strong>Assuming adults-only means silent:</strong> it only means no kids — vibe still varies.</li>
  <li><strong>Not checking where rooms sit:</strong> room position can make or break the trip.</li>
  <li><strong>Booking lively when you want rest:</strong> decide your sleep goal first, then book.</li>
</ul>

<hr/>

<h2>FAQs</h2>

<h3>Are adults-only hotels in Turkey always quiet?</h3>
<p>No. Some are quiet and relaxation-first; others are social and entertainment-led. Choose based on vibe and verify evening noise risk.</p>

<h3>Is adults-only worth it for UK couples?</h3>
<p>Yes if you want a child-free environment and a certain vibe. It’s most worth it when you pick the right style (quiet vs lively) for your trip.</p>

<h3>How do I avoid booking the wrong adults-only vibe?</h3>
<p>Decide whether you want quiet or lively first, then verify evening entertainment, pool/beach vibe, and room positioning.</p>

<p><em>Last updated:</em> ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
`
};

async function run() {
    const timestamp = Date.now();
    console.log("🚀 Starting Adults-Only Article Automation...");

    // SAFE PROMPTS for Authentic Feel
    const imagesToGenerate = [
        {
            placeholder: '<!-- IMAGE_COVER_PLACEHOLDER -->',
            filename: `turkey-adults-only-hotel-sunset-drink-authentic-${timestamp}.jpg`,
            prompt: "Two drinks on a table at an adults-only hotel restaurant in Turkey, sunset view over the sea. Calm, romantic, sophisticated atmosphere. Authentic travel photography. Realistic."
        },
        {
            placeholder: '<!-- IMAGE_VIBE_PLACEHOLDER -->',
            filename: `turkey-adults-only-pool-reading-calm-${timestamp}.jpg`,
            prompt: "A quiet adults-only hotel pool in Turkey. Someone reading a book on a sunbed. Calm blue water. No noise, relaxation focus. Authentic travel photo. Realistic."
        },
        {
            placeholder: '<!-- IMAGE_POOL_PLACEHOLDER -->',
            filename: `turkey-adults-only-evening-vibe-authentic-${timestamp}.jpg`,
            prompt: "Evening atmosphere at a stylish adults-only hotel bar in Turkey. Soft lighting, people chatting, relaxed social vibe. Authentic travel photography. Realistic."
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
        title: { en: ARTICLE_DATA.title, tr: "Türkiye'de Yetişkin Otelleri: Vibe Seçimi (TR Pasif)" },
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
        console.log("✅ Adults-Only Article Added Successfully!");
        console.log("👉 Slug:", ARTICLE_DATA.slug);
    }
}

run();
