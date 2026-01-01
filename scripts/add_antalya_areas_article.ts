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
    slug: 'where-to-stay-in-antalya-best-areas-guide', // Keeping consistent slug format
    title: 'Where to Stay in Antalya: Best Areas for UK Travellers',
    meta_description: 'Choosing where to stay in Antalya? Compare Kaleiçi, Konyaaltı, Lara, Belek, Side and Kemer—who each area suits, vibe, pros/cons and easy airport tips.',
    content: `
<h1>Where to Stay in Antalya: Best Areas for UK Travellers (No Hotel Names — Just the Right Neighbourhood)</h1>

<p><strong>Quick answer:</strong> If you want a <strong>city break + beach</strong>, pick <strong>Konyaaltı</strong> (seafront vibe) or <strong>Lara</strong> (sandy beach zone). If you want <strong>history and atmosphere</strong>, stay in <strong>Kaleiçi (Old Town)</strong>. If you want a classic <strong>resort-style holiday</strong>, look at <strong>Belek</strong> or <strong>Side</strong>. If you want <strong>mountains + sea</strong>, <strong>Kemer</strong> is the move.</p>

<p>This guide is written for UK travellers searching “where to stay in Antalya”, and it focuses on <strong>choosing the right area</strong> so you don’t waste time commuting or end up in a vibe that doesn’t match your trip.</p>

<hr/>

<!-- IMAGE_COVER_PLACEHOLDER -->

<h2>Antalya 101: “Antalya city” vs “Antalya region”</h2>
<p>When people say “Antalya”, they might mean either:</p>
<ul>
  <li><strong>Antalya City</strong> (Kaleiçi, Konyaaltı, Lara) — great if you want restaurants, walks, and day trips, or</li>
  <li><strong>Antalya Region</strong> (Kemer, Belek, Side and more) — resort areas spread along the coast.</li>
</ul>

<p>One simple way to visualise the coast: travellers often describe the main resort belt running west-to-east as <strong>Kemer → Kaleiçi → Lara → Belek → Side → Alanya</strong> (with smaller areas in between).</p>

<hr/>

<h2>Best areas at a glance (pick your trip style)</h2>
<table>
  <thead>
    <tr>
      <th>What you want</th>
      <th>Best area</th>
      <th>Why it works</th>
      <th>Watch-outs</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Old Town charm + walkable evenings</td>
      <td><strong>Kaleiçi (Old Town)</strong></td>
      <td>History, atmosphere, “proper Turkey” feel</td>
      <td>Not a wide sandy beach base</td>
    </tr>
    <tr>
      <td>City + beach + local life</td>
      <td><strong>Konyaaltı</strong></td>
      <td>Long beachfront, city energy, easy day plans</td>
      <td>Choose carefully if you want very quiet nights</td>
    </tr>
    <tr>
      <td>Sandy beach focus + easy holiday rhythm</td>
      <td><strong>Lara</strong> / <strong>Kundu</strong></td>
      <td>Beach-first, relaxed, good for families</td>
      <td>More “holiday zone”, less “old town vibe”</td>
    </tr>
    <tr>
      <td>Resort-style, often all-inclusive feel</td>
      <td><strong>Belek</strong></td>
      <td>Purpose-built holiday zone (great if you want to switch off)</td>
      <td>Not the best if you want city wandering every day</td>
    </tr>
    <tr>
      <td>Big beach holiday + lots of choice</td>
      <td><strong>Side</strong> (Manavgat area)</td>
      <td>Classic resort energy, beach time + excursions</td>
      <td>Further from Antalya city; plan day trips</td>
    </tr>
    <tr>
      <td>Mountains + sea scenery</td>
      <td><strong>Kemer</strong></td>
      <td>Dramatic coastline, outdoorsy options</td>
      <td>More “coastal town/resort” than city break</td>
    </tr>
  </tbody>
</table>

<hr/>

<h2>Kaleiçi (Old Town): best for history + atmosphere</h2>
<p>Kaleiçi is the “postcard Antalya” feeling — historic streets, evening walks, and an easy base if you care more about vibe than a big beach right outside your door.</p>
<ul>
  <li><strong>Best for:</strong> couples, first-timers who want character, short city breaks</li>
  <li><strong>You’ll love it if:</strong> your ideal evening is wandering, dinner, and a slow stroll</li>
  <li><strong>Not ideal if:</strong> your priority is a long sandy beach holiday</li>
</ul>

<p><strong>Local tip:</strong> If your trip is 3–4 nights, Kaleiçi + one beach day (Konyaaltı or Lara) is a solid “UK long-weekend” formula.</p>

<!-- IMAGE_KALEICI_PLACEHOLDER -->

<hr/>

<h2>Konyaaltı: best all-round “Antalya city + beach” base</h2>
<p>Konyaaltı is for travellers who want the comfort of staying in the city while still having a proper seafront vibe. It’s one of the two headline beach zones of Antalya city.</p>
<ul>
  <li><strong>Best for:</strong> friends trips, food-led trips, people who want flexible day plans</li>
  <li><strong>Vibe:</strong> beachfront walks, cafés, a more “lived-in” Antalya feel</li>
  <li><strong>Choose Konyaaltı if:</strong> you want to mix beach time with exploring</li>
</ul>

<!-- IMAGE_KONYAALTI_PLACEHOLDER -->

<hr/>

<h2>Lara (and nearby Kundu): best for sandy beach holidays</h2>
<p>If your mental picture is “wake up → beach → lunch → sunset”, Lara makes that easy. Official tourism info highlights Lara as a sandy beach area east of the city centre.</p>
<ul>
  <li><strong>Best for:</strong> families, beach-first trips, travellers who want a simple holiday routine</li>
  <li><strong>Vibe:</strong> relaxed, holiday-forward, less focused on old-town exploring</li>
  <li><strong>Choose Lara if:</strong> sand and sea is the centre of the trip</li>
</ul>

<hr/>

<h2>Belek: best for “switch off” resort-style trips</h2>
<p>Belek is built for holiday mode. If you’re the type who doesn’t want to plan much, and you want your days to run on autopilot, this is the right shape of trip.</p>
<ul>
  <li><strong>Best for:</strong> pure relaxation, families, travellers who want an easy, contained holiday</li>
  <li><strong>Not ideal if:</strong> you want to spend every evening wandering different city neighbourhoods</li>
</ul>

<hr/>

<h2>Side: best for classic beach holiday energy</h2>
<p>Side is one of the most popular resort areas along the Antalya coast. Many travellers choose it for a straightforward “beach holiday + excursions” setup.</p>
<ul>
  <li><strong>Best for:</strong> longer stays (5–10 nights), families, travellers who like organised day trips</li>
  <li><strong>Watch-out:</strong> it’s a region base — plan your Antalya city day(s) rather than trying to do it constantly</li>
</ul>

<!-- IMAGE_SIDE_PLACEHOLDER -->

<hr/>

<h2>Kemer: best for scenery (mountains-meet-sea)</h2>
<p>Kemer sits on a dramatic stretch of coast and is often chosen for the combination of sea views and outdoor feel.</p>
<ul>
  <li><strong>Best for:</strong> travellers who want nature scenery, coastal-town vibe, and excursions</li>
  <li><strong>Choose Kemer if:</strong> you want “Mediterranean coast” visuals more than city life</li>
</ul>

<hr/>

<h2>Airport reality: pick an area that matches your arrival style</h2>
<p>Antalya Airport (AYT) states there are bus and rail system services that connect passengers from the airport to Antalya city centre and beyond.</p>

<p><strong>Simple rule:</strong> if you land late, don’t choose a base that requires a complicated multi-transfer journey on night one. Start easy, then explore.</p>

<hr/>

<h2>Copy/paste decision checklist (UK travellers)</h2>
<ul>
  <li><strong>I want history + character:</strong> Kaleiçi</li>
  <li><strong>I want city + beach balance:</strong> Konyaaltı</li>
  <li><strong>I want sandy beach and an easy holiday routine:</strong> Lara / Kundu</li>
  <li><strong>I want to fully switch off in resort mode:</strong> Belek</li>
  <li><strong>I want a classic beach holiday base:</strong> Side</li>
  <li><strong>I want mountains + sea scenery:</strong> Kemer</li>
</ul>

<hr/>

<h2>FAQs</h2>

<h3>What’s the best area to stay in Antalya for first-timers?</h3>
<p>If you want atmosphere and walkable evenings, choose Kaleiçi. If you want beach time and flexibility, Konyaaltı is the easiest all-round base.</p>

<h3>Is Lara or Konyaaltı better?</h3>
<p>Pick Lara if you want a sandy beach holiday routine. Pick Konyaaltı if you want more of a city vibe with beach access and flexible day plans. Both are highlighted as Antalya’s key beach zones.</p>

<h3>Where should I stay in Antalya for a resort-style holiday?</h3>
<p>Belek and Side are commonly chosen resort areas along the Antalya coast.</p>

<p><em>Last updated:</em> ${new Date().toLocaleDateString('en-GB')}</p>
`
};

async function addAntalyaAreasArticle() {
    const timestamp = Date.now();

    // --- Authentic Mode Prompts (Imagen 3) ---
    const imagesToGenerate = [
        {
            placeholder: '<!-- IMAGE_COVER_PLACEHOLDER -->',
            filename: `antalya-areas-cover-${timestamp}.jpg`,
            prompt: "A beautiful view of Antalya's coast showing both mountains and sea. Golden hour. High quality travel photography. Authentic atmosphere."
        },
        {
            placeholder: '<!-- IMAGE_KALEICI_PLACEHOLDER -->',
            filename: `antalya-kaleici-street-${timestamp}.jpg`,
            prompt: "A narrow cobblestone street in Antalya Old Town (Kaleiçi) with historic wooden ottoman houses and bougainvillea flowers. Ambient evening light. Authentic travel vibes."
        },
        {
            placeholder: '<!-- IMAGE_KONYAALTI_PLACEHOLDER -->',
            filename: `antalya-konyaalti-beach-${timestamp}.jpg`,
            prompt: "Konyaalti beach in Antalya with pebbles and clear blue water. Mountains in the background. People walking on the promenade. Relaxed sunny day. Authentic wide shot."
        },
        {
            placeholder: '<!-- IMAGE_SIDE_PLACEHOLDER -->',
            filename: `antalya-side-ruins-${timestamp}.jpg`,
            prompt: "The Temple of Apollo in Side at sunset. Ancient columns against a sea backdrop. Warm lighting. Authentic historical site photography."
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

    // Use UPSERT to handle potential re-runs
    const { error } = await supabase.from('articles').upsert({
        slug: ARTICLE_DATA.slug,
        title: { en: ARTICLE_DATA.title, tr: "Antalya'da Nerede Kalınır: En İyi Bölgeler" },
        meta_description: { en: ARTICLE_DATA.meta_description, tr: "Antalya'da konaklama rehberi: Kaleiçi, Konyaaltı, Lara, Belek, Side ve Kemer karşılaştırması." },
        content: { en: finalContent, tr: "<p>Çeviri yakında...</p>" },
        location: { en: 'Antalya', tr: 'Antalya' },
        cover_image_url: coverImageUrl,
        published_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    }, { onConflict: 'slug' });

    if (error) {
        console.error("❌ DB Insert Failed:", error);
    } else {
        console.log("✅ Antalya Areas Article Added Successfully with Imagen 3 Images!");
    }
}

addAntalyaAreasArticle();
