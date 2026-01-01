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
if (!fs.existsSync(ARTICLES_IMAGE_DIR)) {
    fs.mkdirSync(ARTICLES_IMAGE_DIR, { recursive: true });
}

// --- Imagen 3 Generation Function with Retry ---
async function generateImageVertex(prompt: string, filename: string) {
    console.log(`🎨 Generating ${filename} with Imagen 3 (Authentic Mode)...`);

    if (!fs.existsSync('google-credentials.json')) {
        console.error("❌ 'google-credentials.json' missing.");
        return null;
    }

    const auth = new GoogleAuth({
        keyFile: 'google-credentials.json',
        scopes: ['https://www.googleapis.com/auth/cloud-platform']
    });

    const client = await auth.getClient();
    const accessToken = await client.getAccessToken();

    if (!PROJECT_ID) {
        console.error("❌ GOOGLE_CLOUD_PROJECT_ID missing.");
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

    let retries = 0;
    const maxRetries = 5;
    let baseDelay = 5000;

    while (retries < maxRetries) {
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
                if (response.status === 429) {
                    retries++;
                    const delay = baseDelay * (2 ** (retries - 1));
                    console.warn(`🔄 Rate limited (429). Retrying in ${delay / 1000}s...`);
                    await new Promise(res => setTimeout(res, delay));
                    continue;
                }
                throw new Error(`Vertex API Error: ${response.status}`);
            }

            const data = await response.json();
            const base64Image = data.predictions[0].bytesBase64Encoded;
            const buffer = Buffer.from(base64Image, 'base64');

            const localPath = path.join(ARTICLES_IMAGE_DIR, filename);
            const publicUrl = `/images/articles/${filename}`;

            fs.writeFileSync(localPath, buffer);
            console.log(`✅ Saved: ${localPath}`);

            return publicUrl;
        } catch (error) {
            if (retries >= maxRetries - 1) return null;
        }
    }
    return null;
}

const ARTICLE_DATA = {
    slug: 'bodrum-castle-history-and-visitor-guide',
    title: 'Bodrum Castle: What to Know Before You Go (UK Visitor Guide)',
    meta_description: 'Visiting Bodrum Castle? A UK-friendly guide to what it is, what you’ll see, how to plan your visit, and how to pair it with a perfect Bodrum day—no hotel names.',
    content: `
<h1>Bodrum Castle (Castle of St Peter): What to Know Before You Go (UK-Friendly Guide)</h1>

<p><strong>Quick answer:</strong> Bodrum Castle is the landmark you’ll naturally gravitate to if you stay in Bodrum Town. It’s right by the harbour, easy to combine with an Old Town wander, and it’s one of the best “Day 1 anchors” because it immediately gives you Bodrum’s atmosphere: sea views, history, and that classic waterfront energy.</p>

<p>Planning your base first makes everything easier:
<a href="/guide/where-to-stay-in-bodrum-best-areas-guide">Where to Stay in Bodrum (Best Areas)</a> •
<a href="/guide/milas-bodrum-airport-to-bodrum-bus-shuttle-taxi">Milas–Bodrum Airport to Bodrum: How to Get There</a> •
<a href="/guide/bodrum-itinerary-3-days-uk-friendly-guide">Bodrum Itinerary: 3 Days (UK-Friendly)</a>
</p>

<hr/>

<!-- IMAGE_COVER_PLACEHOLDER -->

<h2>What is Bodrum Castle?</h2>
<p>Bodrum Castle (often called the <strong>Castle of St Peter</strong>) is a historic fortress sitting right on the edge of the sea, between two small sheltered harbour areas. It’s one of those places where you don’t need to be a history expert to enjoy it — the setting alone makes it worth your time.</p>

<p><strong>Why UK travellers love it:</strong> it’s scenic, walkable from the centre, and it works as a “first-day highlight” even if you only have a short stay.</p>

<hr/>

<h2>What you’ll actually do there (realistic expectations)</h2>
<p>Think of Bodrum Castle as three experiences in one:</p>

<ul>
  <li><strong>Sea-view walking:</strong> you’ll get different angles over the harbour and coastline.</li>
  <li><strong>Fortress atmosphere:</strong> stone walls, towers, and that “Mediterranean stronghold” feeling.</li>
  <li><strong>Museum-style sections:</strong> there are curated areas inside that add context and make the visit feel richer than “just a view”.</li>
</ul>

<p><strong>Best mindset:</strong> go slowly and enjoy the setting. This isn’t a place you rush through.</p>

<!-- IMAGE_COURTYARD_PLACEHOLDER -->

<hr/>

<h2>The best time to visit (comfort-first strategy)</h2>
<p>I won’t give fixed opening times here because they can change, but here’s the reliable strategy:</p>
<ul>
  <li><strong>Go earlier in the day</strong> for a calmer pace and better comfort.</li>
  <li><strong>Leave your sunset slot free</strong> for the harbour/marina area afterwards — that’s when Bodrum feels extra special.</li>
</ul>

<p><strong>Simple check:</strong> if your day depends on opening hours, confirm the current schedule at the venue’s official listing or at the entrance signage.</p>

<hr/>

<h2>How long to plan for Bodrum Castle</h2>
<p>Most visitors are happiest when they allow enough time to:</p>
<ul>
  <li>walk the castle at a relaxed pace,</li>
  <li>pause at the best viewpoints,</li>
  <li>and take in the museum-style sections without rushing.</li>
</ul>

<p><strong>Practical rule:</strong> don’t cram it between too many other stops. Make it your “main anchor” for that half of the day.</p>

<!-- IMAGE_MUSEUM_PLACEHOLDER -->

<hr/>

<h2>How to pair Bodrum Castle with a perfect Bodrum day</h2>

<h3>Plan A: “Classic Bodrum Town day” (best for first-timers)</h3>
<ol>
  <li><strong>Morning:</strong> Bodrum Castle (slow pace, photos, views)</li>
  <li><strong>Midday:</strong> Old Town wander + easy lunch nearby</li>
  <li><strong>Afternoon:</strong> Mausoleum site (short, meaningful stop) or a relaxed café break</li>
  <li><strong>Evening:</strong> marina/harbour stroll + dinner</li>
</ol>

<h3>Plan B: “History + beach balance” (best if you want a swim day too)</h3>
<ol>
  <li><strong>Morning:</strong> Bodrum Castle</li>
  <li><strong>Midday:</strong> quick Old Town loop + lunch</li>
  <li><strong>Afternoon:</strong> beach time (choose one area and stay there)</li>
  <li><strong>Evening:</strong> back to town for a waterfront walk</li>
</ol>

<p><strong>Why this works:</strong> you get Bodrum’s iconic landmark without sacrificing the holiday feel.</p>

<hr/>

<h2>What to bring (small things that improve the day)</h2>
<ul>
  <li><strong>Comfortable shoes</strong> (stone surfaces and steps are part of the experience)</li>
  <li><strong>Water</strong> (especially in warmer months)</li>
  <li><strong>A light layer</strong> if you’ll be near the sea later in the day</li>
  <li><strong>Power bank</strong> (you’ll take more photos than you expect)</li>
</ul>

<hr/>

<h2>Photos: how to get the best shots (without overplanning)</h2>
<ul>
  <li><strong>Harbour-facing viewpoints</strong> give the “Bodrum postcard” look.</li>
  <li><strong>Golden-hour light</strong> makes the stone textures look amazing, but you don’t need to force it — Bodrum light is friendly most of the day.</li>
  <li><strong>One simple rule:</strong> take your wide shots early, then enjoy the rest without living behind the camera.</li>
</ul>

<!-- IMAGE_VIEWPOINT_PLACEHOLDER -->

<hr/>

<h2>Common mistakes (so your visit stays enjoyable)</h2>
<ul>
  <li><strong>Mistake:</strong> trying to combine castle + far peninsula corner + sunset on the opposite side in one day. 
      <strong>Fix:</strong> keep your castle day mostly in Bodrum Town.</li>
  <li><strong>Mistake:</strong> rushing through like it’s a tick-box. 
      <strong>Fix:</strong> slow pace = better views, better photos, better mood.</li>
  <li><strong>Mistake:</strong> not checking current hours when your day is tight. 
      <strong>Fix:</strong> confirm official hours on the day if it matters to your plan.</li>
</ul>

<hr/>

<h2>FAQs</h2>

<h3>Is Bodrum Castle worth it?</h3>
<p>Yes — it’s Bodrum Town’s iconic landmark, beautifully positioned by the sea, and it’s an easy “anchor” that makes your trip feel complete even on a short stay.</p>

<h3>Do I need to book ahead?</h3>
<p>Usually you can visit as part of a normal day out. If you’re travelling in peak season or your schedule is tight, just check the current entry setup and hours on the day.</p>

<h3>Can I combine Bodrum Castle with other attractions?</h3>
<p>Yes — it pairs perfectly with Old Town wandering, the marina walk, and one additional short history stop. Keep it simple so you don’t rush.</p>

<h3>Is it family-friendly?</h3>
<p>Yes, as long as everyone has comfortable shoes and you take it at a calm pace.</p>

<h3>What area should I stay in to visit the castle easily?</h3>
<p>Bodrum Town (Centre) is the easiest base — you can walk or do short hops without planning your day around transport.</p>

<h3>What’s the best way to plan transport from the airport?</h3>
<p>Choose based on your landing time and comfort: public options are great in daytime; taxi/transfer is the easiest when you want door-to-door simplicity.</p>

<p><em>Last updated:</em> ${new Date().toLocaleDateString('en-GB')}</p>
`
};

async function addBodrumCastleArticle() {
    const timestamp = Date.now();

    // --- Authentic Mode Prompts (Imagen 3) ---
    const imagesToGenerate = [
        {
            placeholder: '<!-- IMAGE_COVER_PLACEHOLDER -->',
            filename: `bodrum-castle-main-towers-${timestamp}.jpg`,
            prompt: "Bodrum Castle of St Peter exterior view. Stone towers rising above the blue sea. Sunny day with clear sky. Authentic historic travel photography."
        },
        {
            placeholder: '<!-- IMAGE_COURTYARD_PLACEHOLDER -->',
            filename: `bodrum-castle-inner-courtyard-${timestamp}.jpg`,
            prompt: "Inside Bodrum Castle courtyard. Stone walls, pine trees, and a peaceful atmosphere. Sunlight filtering through leaves. Authentic cultural photography."
        },
        {
            placeholder: '<!-- IMAGE_MUSEUM_PLACEHOLDER -->',
            filename: `bodrum-castle-museum-hall-${timestamp}.jpg`,
            prompt: "Museum of Underwater Archaeology exhibit inside Bodrum Castle. Ancient amphoras displayed in a stone hall. Atmospheric lighting. Authentic museum photography."
        },
        {
            placeholder: '<!-- IMAGE_VIEWPOINT_PLACEHOLDER -->',
            filename: `bodrum-castle-arch-view-${timestamp}.jpg`,
            prompt: "View of Bodrum harbour and white houses with bougainvillea seen through a stone archway of Bodrum Castle. Authentic travel POV."
        }
    ];

    let finalContent = ARTICLE_DATA.content;
    let coverImageUrl = '';

    for (const item of imagesToGenerate) {
        const publicUrl = await generateImageVertex(item.prompt, item.filename);
        if (publicUrl) {
            if (item.placeholder.includes('COVER')) {
                coverImageUrl = publicUrl;
                finalContent = finalContent.replace(item.placeholder, '');
            } else {
                const imgTag = `<img src="${publicUrl}" alt="${item.prompt}" class="w-full h-auto rounded-lg my-6 shadow-md" />`;
                finalContent = finalContent.replace(item.placeholder, imgTag);
            }
        }
    }

    // Use UPSERT
    const { error } = await supabase.from('articles').upsert({
        slug: ARTICLE_DATA.slug,
        title: { en: ARTICLE_DATA.title, tr: "Bodrum Kalesi Gezi Rehberi: Giriş, Tarih ve Müze" },
        meta_description: { en: ARTICLE_DATA.meta_description, tr: "Bodrum Kalesi hakkında bilinmesi gerekenler. Sualtı Arkeoloji Müzesi, manzaralar ve ziyaret ipuçları." },
        content: { en: finalContent, tr: "<p>Çeviri yakında...</p>" },
        location: { en: 'Bodrum', tr: 'Bodrum' },
        cover_image_url: coverImageUrl,
        published_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    }, { onConflict: 'slug' });

    if (error) {
        console.error("❌ DB Insert Failed:", error);
    } else {
        console.log("✅ Bodrum Castle Article Added Successfully with Imagen 3 Images!");
    }
}

addBodrumCastleArticle();
