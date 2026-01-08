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
    slug: 'hotels-with-heated-pools-in-turkey-where-to-find-uk-guide',
    title: 'Hotels With Heated Pools in Turkey: Where to Find Them + When It Matters (UK Guide)',
    meta_description: 'Want a warm pool in Turkey? Learn when heated pools actually matter for UK travellers, which regions are most likely to offer them, what “heated” really means, and how to check before booking. No hotel names.',
    primary_keyword: 'hotels with heated pools in Turkey',
    content: `<p><strong>Quick answer:</strong> Heated pools matter most for UK travellers visiting Turkey in <strong>shoulder season</strong> (spring/autumn) and <strong>winter</strong>, or if you’re booking a resort mainly for pool time. The highest chance of true heated pools is usually in <strong>large resort regions</strong> and in properties with <strong>indoor pools/spa facilities</strong>. But “heated” isn’t a standard promise — you must verify <strong>which pool</strong> is heated, <strong>when</strong>, and <strong>to what temperature range</strong>.</p>

<p>This guide is designed to stop the classic disappointment: booking for “heated pool” and arriving to find the outdoor pool is still cold (or heated only on certain dates).</p>

<p>Internal reads (placeholders):
<a href="/guide/best-time-to-visit-turkey-weather-guide-uk">Best Time to Visit Turkey (Month-by-Month)</a> •
<a href="/guide/turkey-in-april-weather-places-uk-guide">Turkey in April: Best Places</a> •
<a href="/guide/turkey-in-october-weather-places-uk-guide">Turkey in October: Best Picks</a> •
<a href="/guide/all-inclusive-in-turkey-explained-uk-guide">All-Inclusive in Turkey Explained</a> •
<a href="/guide/family-stays-in-turkey-what-uk-parents-should-check">Family Stays in Turkey: What to Check</a>
</p>

<!-- IMAGE_COVER_PLACEHOLDER -->

<hr/>

<h2>When heated pools actually matter (UK traveller reality)</h2>
<p>Many UK travellers assume “Turkey = warm pool”. In peak summer, that’s often fine. Outside peak summer, a heated pool can be the difference between “pool day” and “pool look”.</p>

<h3>Heated pools matter most if you’re travelling:</h3>
<ul>
  <li><strong>March–April</strong> (spring shoulder season)</li>
  <li><strong>October–November</strong> (autumn shoulder season)</li>
  <li><strong>Winter months</strong> (if you’re chasing a mild break)</li>
</ul>

<p><strong>Simple rule:</strong> If your holiday happiness depends on swimming, treat heated pool as a must-check feature, not a nice-to-have.</p>

<hr/>

<h2>What “heated pool” can mean (and why UK travellers get caught out)</h2>
<p>There are three common versions:</p>

<h3>1) Indoor pool heated (most common)</h3>
<p>This is often part of a spa setup. Good for shoulder season and winter, but it’s a different vibe than outdoor sun swimming.</p>

<!-- IMAGE_INDOOR_POOL_PLACEHOLDER -->

<h3>2) Outdoor pool heated (best-case, but not always)</h3>
<p>Some resorts heat an outdoor pool in shoulder season. This is the “dream” setup — but it often depends on dates and the property’s policy.</p>

<h3>3) “Heated when needed” (the vague version)</h3>
<p>This can mean heated occasionally, or heated only to a modest level. You must verify details.</p>

<p><strong>UK-friendly tip:</strong> Always ask: <strong>Which pool is heated?</strong> Indoor only isn’t the same as outdoor heated.</p>

<hr/>

<h2>Where you’re most likely to find heated pools in Turkey (region logic, no hotel names)</h2>
<p>Heated pools are more common where resorts cater to longer seasons and where guests expect shoulder-season comfort.</p>

<h3>Higher likelihood areas</h3>
<ul>
  <li><strong>Large resort coast regions</strong> with big facilities and spa setups</li>
  <li><strong>City hotels with spa facilities</strong> (often indoor heated pools)</li>
  <li><strong>Properties marketed for off-season stays</strong> (they’re built to keep guests comfortable)</li>
</ul>

<h3>Lower likelihood areas</h3>
<ul>
  <li><strong>Small boutique bases</strong> focused on charm rather than facilities</li>
  <li><strong>Very small properties</strong> where heating a pool isn’t practical or cost-effective</li>
</ul>

<p><strong>Simple rule:</strong> The bigger and more facility-led the property, the higher the chance of a genuine heated pool.</p>

<hr/>

<h2>The UK traveller verification checklist (copy-paste question set)</h2>
<p>Before booking, confirm these in writing (message/email) where possible:</p>
<ul>
  <li><strong>1) Which pool is heated?</strong> (Indoor? Outdoor? Both?)</li>
  <li><strong>2) Is heating active during our dates?</strong></li>
  <li><strong>3) What is the target temperature range?</strong> (You don’t need a perfect number — you need reassurance it’s genuinely warm.)</li>
  <li><strong>4) Are there any hours/limits?</strong> (Sometimes indoor pools have spa hours.)</li>
  <li><strong>5) Is the heated pool included for all guests?</strong> (Any access restrictions?)</li>
</ul>

<!-- IMAGE_CHECKLIST_PLACEHOLDER -->

<p><strong>Bonus check:</strong> Ask whether the heated pool is the main pool or a separate smaller pool. That changes the holiday feel.</p>

<hr/>

<h2>Heated pools + family travel (UK parents)</h2>
<p>If you’re travelling with kids in shoulder season, heated pools can transform the day — because kids will actually use the pool instead of just circling it.</p>

<ul>
  <li>Prioritise <strong>shallow heated pool access</strong> if your children are small.</li>
  <li>Verify <strong>indoor pool rules</strong> (some spas limit hours for kids).</li>
</ul>

<p>Read: <a href="/guide/family-stays-in-turkey-what-uk-parents-should-check">Family Stays in Turkey: What to Check</a>.</p>

<hr/>

<h2>Heated pools + all inclusive: what UK travellers should know</h2>
<ul>
  <li>In shoulder season, resorts may centre the day around <strong>indoor facilities</strong>.</li>
  <li>Outdoor heated pools (if available) can be the “best value” feature — because you still get sun + swim.</li>
  <li>Heated pool availability can change by season — confirm for your exact dates.</li>
</ul>

<hr/>

<h2>Common mistakes (framed positively)</h2>
<ul>
  <li><strong>Assuming “heated pool” means outdoor:</strong> often it’s indoor only. Ask.</li>
  <li><strong>Not checking dates:</strong> heating can be seasonal.</li>
  <li><strong>Not checking access:</strong> some heated pools are spa-zone with time rules.</li>
</ul>

<hr/>

<h2>FAQs</h2>

<h3>Do hotels in Turkey have heated pools?</h3>
<p>Some do, especially larger resorts and properties with spa facilities. But “heated” varies by pool type and season, so it must be verified.</p>

<h3>When do UK travellers need a heated pool in Turkey?</h3>
<p>Most in spring/autumn shoulder season and winter. In peak summer it matters less unless you’re very temperature-sensitive.</p>

<h3>How can I confirm a heated pool before booking?</h3>
<p>Ask which pool is heated (indoor/outdoor), whether heating is active on your dates, the target temperature range, and any access rules.</p>

<p><em>Last updated:</em> ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
`
};

async function run() {
    const timestamp = Date.now();
    console.log("🚀 Starting Heated Pools Article Automation...");

    // SAFE PROMPTS for Authentic Feel
    const imagesToGenerate = [
        {
            placeholder: '<!-- IMAGE_COVER_PLACEHOLDER -->',
            filename: `turkey-heated-outdoor-pool-steam-authentic-${timestamp}.jpg`,
            prompt: "Outdoor hotel swimming pool in Turkey with visible steam rising from the warm water in cool air. People swimming comfortably. Authentic travel photography. Realistic atmospheric shot."
        },
        {
            placeholder: '<!-- IMAGE_INDOOR_POOL_PLACEHOLDER -->',
            filename: `turkey-hotel-indoor-pool-spa-authentic-${timestamp}.jpg`,
            prompt: "A calm indoor swimming pool at a Turkish hotel spa. Warm lighting, loungers by the water. Relaxing atmosphere. Authentic travel photography. Realistic."
        },
        {
            placeholder: '<!-- IMAGE_CHECKLIST_PLACEHOLDER -->',
            filename: `turkey-poolside-checklist-vibe-${timestamp}.jpg`,
            prompt: "A notebook and pen on a table by a hotel pool in Turkey, with a phone showing a travel app. Sunlight. Authentic holiday planning vibe. Realistic."
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
        title: { en: ARTICLE_DATA.title, tr: "Türkiye'de Isıtmalı Havuzlu Oteller: Nerede Bulunur? (TR Pasif)" },
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
        console.log("✅ Heated Pools Article Added Successfully!");
        console.log("👉 Slug:", ARTICLE_DATA.slug);
    }
}

run();
