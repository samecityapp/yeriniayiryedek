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
    slug: 'where-to-stay-in-turkey-solo-travellers-guide-uk',
    title: 'Where to Stay in Turkey for Solo Travellers: Safer Bases + Easy Transport (UK Guide)',
    meta_description: 'Solo trip to Turkey from the UK? Choose the best bases for safety, easy transport and a smooth first-time experience—city breaks, coastal towns and calm regions. No hotel names.',
    primary_keyword: 'where to stay in Turkey for solo travellers',
    content: `<p><strong>Quick answer:</strong> For a first solo trip from the UK, <strong>Istanbul</strong> is the easiest city base (choose a well-connected neighbourhood with plenty of people around in the evenings). For a calm “wow scenery” trip, <strong>Cappadocia</strong> is a great solo base because the day structure is simple. For a relaxed coastal solo break with great evenings, <strong>Kaş</strong> is a strong pick. For an easy long-weekend vibe, <strong>Izmir</strong> works well as a low-stress city break and day-trip hub.</p>

<p>This guide is written for UK solo travellers who want a trip that feels <strong>safe, simple, and enjoyable</strong> — without turning planning into a stress project. The biggest difference-maker isn’t “Turkey vs somewhere else”. It’s choosing a base with <strong>easy transport, walkable evenings, and a simple day rhythm</strong>.</p>

<p><strong>Important note:</strong> “Safety” is about practical choices: base area, late-night habits, transport decisions, and keeping plans simple. In this guide we keep everything calm and practical — no fear-mongering.</p>

<p>Internal reads (placeholders):
<a href="/guide/is-turkey-safe-uk-tourists-practical-checklist">Is Turkey Safe for UK Tourists? (Practical Checklist)</a> •
<a href="/guide/solo-female-travel-in-turkey-practical-tips">Solo Female Travel in Turkey (Practical Tips)</a> •
<a href="/guide/where-to-stay-in-istanbul-best-areas-guide">Where to Stay in Istanbul (Best Areas)</a> •
<a href="/guide/where-to-stay-in-cappadocia-best-towns-guide">Where to Stay in Cappadocia (Best Towns)</a> •
<a href="/guide/where-to-stay-in-kas-best-areas-uk-guide">Where to Stay in Kaş (Best Areas)</a> •
<a href="/guide/where-to-stay-in-izmir-weekend-guide">Where to Stay in Izmir (Best Areas)</a>
</p>

<!-- IMAGE_COVER_PLACEHOLDER -->

<hr/>

<h2>Pick your solo base in 60 seconds (UK travellers)</h2>
<ul>
  <li><strong>First solo trip, want the easiest logistics</strong> → Istanbul</li>
  <li><strong>Want calm “wow scenery” without complex planning</strong> → Cappadocia</li>
  <li><strong>Want a relaxed coastal town with great evenings</strong> → Kaş</li>
  <li><strong>Want a chilled city break with day-trip options</strong> → Izmir</li>
</ul>

<p><strong>Simple rule:</strong> For solo travel, pick a base where your evenings are easy and safe-feeling: well-lit areas, plenty of people around, and straightforward transport.</p>

<hr/>

<h2>Best solo-friendly bases in Turkey (UK-friendly shortlist)</h2>
<table>
  <thead>
    <tr>
      <th>Base</th>
      <th>Best for</th>
      <th>Solo vibe</th>
      <th>Why it works</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Istanbul</strong></td>
      <td>First-timers, long weekends</td>
      <td>Busy, social, lots to do</td>
      <td>Transport + choice + energy</td>
    </tr>
    <tr>
      <td><strong>Cappadocia</strong></td>
      <td>“Wow scenery” trips</td>
      <td>Calm, structured days</td>
      <td>Easy day rhythm; memorable moments</td>
    </tr>
    <tr>
      <td><strong>Izmir</strong></td>
      <td>City break + day trips</td>
      <td>Relaxed, coastal city</td>
      <td>Low-stress weekend pacing</td>
    </tr>
    <tr>
      <td><strong>Kaş</strong></td>
      <td>Coastal reset</td>
      <td>Calm, scenic evenings</td>
      <td>Great strolls; slow travel friendly</td>
    </tr>
    <tr>
      <td><strong>Fethiye (base choice matters)</strong></td>
      <td>Variety trips</td>
      <td>Flexible</td>
      <td>Beach + boat day flow</td>
    </tr>
  </tbody>
</table>

<hr/>

<h2>1) Istanbul solo: best for ease, transport and “always something happening”</h2>
<p>Istanbul is the easiest solo choice because it has a clear city-break structure: you can explore neighbourhoods by day and keep evenings simple. It’s busy — which many solo travellers find reassuring — and it offers a lot of choice in how social you want to be.</p>

<h3>Choose Istanbul if…</h3>
<ul>
  <li>you want <strong>strong transport</strong> and lots of options</li>
  <li>you’re travelling solo for the first time and want a “big city” baseline</li>
  <li>you like mixing sights, cafés and relaxed evenings</li>
</ul>

<!-- IMAGE_ISTANBUL_SOLO_PLACEHOLDER -->

<h3>Solo-friendly base strategy (no neighbourhood names here)</h3>
<ul>
  <li>Pick a base that’s <strong>well-connected</strong> and feels busy in the evenings.</li>
  <li>Avoid bases that require <strong>long, isolated walks late at night</strong>.</li>
  <li>Keep dinner plans in areas that feel comfortable for you (busy but not chaotic).</li>
</ul>

<p>Read: <a href="/guide/where-to-stay-in-istanbul-best-areas-guide">Where to Stay in Istanbul</a>.</p>

<hr/>

<h2>2) Cappadocia solo: best “wow scenery” with a simple day rhythm</h2>
<p>Cappadocia is solo-friendly because your days naturally have structure: scenic viewpoints, easy tours/activities, relaxed meals, early nights if you want them. It’s great if you want a memorable trip without complex logistics.</p>

<h3>Choose Cappadocia if…</h3>
<ul>
  <li>you want a trip that feels special and photogenic</li>
  <li>you like a calmer pace and early mornings</li>
  <li>you want a “few highlights, done properly” kind of trip</li>
</ul>

<p>Read: <a href="/guide/where-to-stay-in-cappadocia-best-towns-guide">Where to Stay in Cappadocia</a>.</p>

<!-- IMAGE_CAPPADOCIA_SOLO_PLACEHOLDER -->

<hr/>

<h2>3) Izmir solo: best for a chilled weekend with optional day trips</h2>
<p>Izmir works well for solo travellers who want a relaxed coastal city. You can create a low-stress routine: waterfront walks, cafés, one nice dinner, and one optional day trip if you want it.</p>

<p>Read: <a href="/guide/where-to-stay-in-izmir-weekend-guide">Where to Stay in Izmir</a>.</p>

<hr/>

<h2>4) Kaş solo: calm coastal evenings and swim-spot days</h2>
<p>Kaş is ideal if your solo trip goal is calm: swim time, great evening strolls, and a small-town base that feels easy. It’s not a “party place”, it’s a “feel good, sleep well” place.</p>

<p>Read: <a href="/guide/where-to-stay-in-kas-best-areas-uk-guide">Where to Stay in Kaş</a>.</p>

<!-- IMAGE_KAS_SOLO_PLACEHOLDER -->

<hr/>

<h2>5) Fethiye solo: variety trip (base choice matters)</h2>
<p>Fethiye can be excellent solo because it offers variety without complicated planning: beach days, boat day, viewpoint day. Pick a base that matches your vibe (calm vs lively) and keep your itinerary light.</p>

<p>Read: <a href="/guide/where-to-stay-in-fethiye-best-areas-uk-guide">Where to Stay in Fethiye</a>.</p>

<hr/>

<h2>Practical solo safety habits (UK-friendly, calm, real-world)</h2>
<ul>
  <li><strong>Choose a well-connected base.</strong> The easier your transport, the safer you’ll feel.</li>
  <li><strong>Keep evenings simple.</strong> Great dinner, nice walk, early night — that’s a perfect solo rhythm.</li>
  <li><strong>Trust your comfort level.</strong> If a street feels too quiet late at night, choose a busier route next time.</li>
  <li><strong>Don’t overshare location details.</strong> Especially in live social posts.</li>
  <li><strong>Have a “backup plan”.</strong> Know how you’ll get back if plans change.</li>
</ul>

<hr/>

<h2>Best solo base by trip style (UK-friendly)</h2>
<ul>
  <li><strong>3–4 day city break:</strong> Istanbul</li>
  <li><strong>4–6 day “special scenery” trip:</strong> Cappadocia</li>
  <li><strong>7-day relaxed reset:</strong> Kaş or a calm coastal base</li>
  <li><strong>Weekend with one day trip:</strong> Izmir</li>
</ul>

<hr/>

<h2>FAQs</h2>

<h3>Is Turkey good for solo travellers from the UK?</h3>
<p>Yes — especially if you choose a base with easy transport and a simple day rhythm. The trip tends to feel best when evenings are easy and you don’t over-plan.</p>

<h3>Where should solo female travellers stay in Turkey?</h3>
<p>Many solo female travellers prefer bases that feel busy and well-connected (Istanbul) or calm and structured (Cappadocia), plus small towns with easy evening routines (Kaş). The base area matters more than the country-level question.</p>

<h3>What is the easiest solo itinerary in Turkey?</h3>
<p>Istanbul for a long weekend, or Cappadocia for 2–4 nights, or a split trip of Istanbul + one calm region.</p>

<p><em>Last updated:</em> ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
`
};

async function run() {
    const timestamp = Date.now();
    console.log("🚀 Starting Turkey Solo Article Automation...");

    // SAFE PROMPTS for Authentic Feel
    const imagesToGenerate = [
        {
            placeholder: '<!-- IMAGE_COVER_PLACEHOLDER -->',
            filename: `turkey-solo-travel-istanbul-ferry-view-${timestamp}.jpg`,
            prompt: "A solo traveller looking at the view from an Istanbul ferry connecting Europe and Asia. Seagulls, Bosphorus blue water. Authentic travel lifestyle. Realistic, sunny day."
        },
        {
            placeholder: '<!-- IMAGE_ISTANBUL_SOLO_PLACEHOLDER -->',
            filename: `turkey-solo-istanbul-beyoglu-tram-${timestamp}.jpg`,
            prompt: "Istiklal Street in Beyoglu, Istanbul. Historic red tram, people walking, shops and cafes. Lively, safe, and busy atmosphere. Authentic street photography. Realistic."
        },
        {
            placeholder: '<!-- IMAGE_CAPPADOCIA_SOLO_PLACEHOLDER -->',
            filename: `turkey-solo-cappadocia-hike-view-${timestamp}.jpg`,
            prompt: "A solo hiker looking at the fairy chimneys in Cappadocia Valleys. Golden hour light. Peaceful and scenic nature. Authentic adventure travel photo. Realistic."
        },
        {
            placeholder: '<!-- IMAGE_KAS_SOLO_PLACEHOLDER -->',
            filename: `turkey-solo-kas-harbour-tea-${timestamp}.jpg`,
            prompt: "A relaxing tea break at a cafe in Kas harbour. View of fishing boats and Greek island Meis in distance. Calm, safe, authentic Turkish coastal vibe. Realistic."
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
        title: { en: ARTICLE_DATA.title, tr: "Türkiye'de Solo Gezginler İçin Nerede Kalınır? (TR Pasif)" },
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
        console.log("✅ Turkey Solo Article Added Successfully!");
        console.log("👉 Slug:", ARTICLE_DATA.slug);
    }
}

run();
