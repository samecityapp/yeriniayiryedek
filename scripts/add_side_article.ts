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
    slug: 'where-to-stay-in-side-best-areas-uk-guide',
    title: 'Where to Stay in Side: Best Areas for Easy Beaches + Old Town Access (UK Guide)',
    meta_description: 'Choosing where to stay in Side? Compare Side Old Town, Kumköy, Evrenseki, Sorgun, Titreyengöl and nearby areas—beach quality, vibe, transport and who each suits. UK-friendly, no hotel names.',
    primary_keyword: 'where to stay in Side',
    content: `<p><strong>Quick answer:</strong> Stay near <strong>Side Old Town</strong> if you want atmosphere, walkable evenings, and quick access to historic sights. Choose <strong>Kumköy</strong> or <strong>Evrenseki</strong> if your priority is an easy beach routine with lots of holiday infrastructure. Pick <strong>Sorgun</strong> if you want a calmer, greener feel with a more “switch off” pace. Consider <strong>Titreyengöl</strong> if you like nature-adjacent calm and you’re happy being slightly outside the centre.</p>

<p>Side is one of the easiest “UK package-holiday-friendly” bases in Turkey because it combines <strong>proper beach days</strong> with a <strong>historic old-town atmosphere</strong>. The only real question is: do you want your evenings to feel <em>historic and walkable</em>, or do you want your days to be <em>beach-first and effortless</em>?</p>

<p>Internal reads (placeholders):
<a href="/guide/where-to-stay-in-antalya-best-areas-guide">Where to Stay in Antalya (Best Areas)</a> •
<a href="/guide/antalya-for-families-best-areas-to-stay">Antalya for Families: Best Areas</a> •
<a href="/guide/all-inclusive-holiday-in-turkey-explained">All-Inclusive in Turkey Explained</a> •
<a href="/guide/all-inclusive-family-checklist">All-Inclusive for Families (UK Parent Checklist)</a> •
<a href="/guide/antalya-airport-to-city-centre-transport-guide">Antalya Airport to Resort Areas: Options</a> •
<a href="/guide/best-day-trips-from-antalya">Best Day Trips from Side (Easy Options)</a>
</p>

<!-- IMAGE_COVER_PLACEHOLDER -->

<hr/>

<h2>Pick your Side base in 60 seconds (UK travellers)</h2>
<ul>
  <li><strong>Old Town evenings + history vibe</strong> → Side Old Town / near the historic centre</li>
  <li><strong>Easy beach routine + family-friendly setup</strong> → Kumköy or Evrenseki</li>
  <li><strong>Calmer, greener, more relaxed pacing</strong> → Sorgun</li>
  <li><strong>Nature-adjacent calm, happy to be slightly outside</strong> → Titreyengöl</li>
</ul>

<p><strong>Simple rule:</strong> If your holiday is mostly “swim, eat, rest”, go beach-area first (Kumköy/Evrenseki). If you want to walk out and feel atmosphere every night, stay closer to Side Old Town.</p>

<hr/>

<h2>Side areas at a glance</h2>
<table>
  <thead>
    <tr>
      <th>Area</th>
      <th>Best for</th>
      <th>Vibe</th>
      <th>What to expect</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Side Old Town / Centre</strong></td>
      <td>Couples, first-timers, short stays</td>
      <td>Atmosphere, walkable evenings</td>
      <td>Historic streets + easy sightseeing</td>
    </tr>
    <tr>
      <td><strong>Kumköy</strong></td>
      <td>Families, beach-first stays</td>
      <td>Holiday infrastructure, easy</td>
      <td>Effortless beach days, lots nearby</td>
    </tr>
    <tr>
      <td><strong>Evrenseki</strong></td>
      <td>Resort-style holidays</td>
      <td>Comfort-first, simple routine</td>
      <td>Beach days built into the plan</td>
    </tr>
    <tr>
      <td><strong>Sorgun</strong></td>
      <td>Calm couples, relaxed weeks</td>
      <td>Greener, quieter</td>
      <td>More “switch off” feeling</td>
    </tr>
    <tr>
      <td><strong>Titreyengöl</strong></td>
      <td>Quiet, nature-adjacent stays</td>
      <td>Calm, slightly removed</td>
      <td>Good if you like slower days</td>
    </tr>
  </tbody>
</table>

<hr/>

<h2>1) Side Old Town / centre: best for atmosphere and walkable evenings</h2>
<p>Choose the Side historic-centre area if you want your evenings to feel special: strolling after dinner, harbour-style views, and quick access to the historic sights that make Side feel like Side.</p>

<h3>Choose Side Old Town if…</h3>
<ul>
  <li>you want <strong>walkable evenings</strong> and atmosphere</li>
  <li>you’re doing a <strong>short stay</strong> and want maximum “sense of place”</li>
  <li>you like the idea of mixing beach time with easy sightseeing</li>
</ul>

<!-- IMAGE_SIDE_OLD_TOWN_PLACEHOLDER -->

<h3>Best way to do it</h3>
<p>Do beach time earlier, then keep evenings for the Old Town vibe. That’s when Side feels most memorable.</p>

<hr/>

<h2>2) Kumköy: easiest family beach routine (UK-friendly)</h2>
<p>Kumköy suits UK travellers who want the simple holiday flow: breakfast, pool/beach, lunch, rest, repeat. It’s a classic “make life easy” base—especially with kids.</p>

<h3>Choose Kumköy if…</h3>
<ul>
  <li>you want <strong>beach-first days</strong> and minimal planning</li>
  <li>you’re travelling with children and want an easy routine</li>
  <li>your trip is about <strong>rest and comfort</strong> more than ticking landmarks</li>
</ul>

<!-- IMAGE_KUMKOY_PLACEHOLDER -->

<hr/>

<h2>3) Evrenseki: comfort-first, resort-style simplicity</h2>
<p>Evrenseki is for travellers who like a polished, easy holiday routine and want their days to be effortless. It’s popular for travellers who want everything “ready-made”: beach, food options, and simple day-to-day comfort.</p>

<h3>Choose Evrenseki if…</h3>
<ul>
  <li>you want a <strong>resort-style</strong> holiday rhythm</li>
  <li>you care about an easy, repeatable routine</li>
  <li>you’re travelling with a mixed group and want “everyone happy” simplicity</li>
</ul>

<hr/>

<h2>4) Sorgun: calmer, greener, more switch-off</h2>
<p>Sorgun is a strong choice if you want Side but you don’t want constant buzz. It often feels greener and calmer—ideal for couples and families who want a quieter week.</p>

<h3>Choose Sorgun if…</h3>
<ul>
  <li>you want a more <strong>relaxed</strong> base</li>
  <li>you like the idea of a greener setting</li>
  <li>you still want access to Side’s atmosphere when you feel like it</li>
</ul>

<!-- IMAGE_SORGUN_PLACEHOLDER -->

<hr/>

<h2>5) Titreyengöl: nature-adjacent calm for slower days</h2>
<p>Titreyengöl is for travellers who want calm and are happy to be slightly outside the centre. If your holiday goal is to properly decompress, this can be a good base style.</p>

<hr/>

<h2>Best base by traveller type (UK-friendly)</h2>

<h3>Couples</h3>
<ul>
  <li><strong>Atmosphere + evenings:</strong> Side Old Town</li>
  <li><strong>Quiet and relaxed:</strong> Sorgun or Titreyengöl</li>
</ul>

<h3>Families</h3>
<ul>
  <li><strong>Lowest stress routine:</strong> Kumköy or Evrenseki</li>
  <li><strong>Calmer week:</strong> Sorgun</li>
</ul>

<h3>Friends trips</h3>
<ul>
  <li><strong>Balanced (day beach + evening atmosphere):</strong> Side Old Town area</li>
</ul>

<h3>Short stays (3–4 nights)</h3>
<ul>
  <li><strong>Best pick:</strong> Side Old Town (maximum “Side feeling” fast)</li>
</ul>

<h3>Longer stays (7+ nights)</h3>
<ul>
  <li><strong>Best pick:</strong> Kumköy/Evrenseki for easy routines, Sorgun for calmer pacing</li>
</ul>

<hr/>

<h2>Side planning tips that make the trip feel easier</h2>
<ul>
  <li><strong>Don’t over-plan.</strong> Side is best when you keep 1–2 outings and let the rest be beach time.</li>
  <li><strong>Pick one evening “walk” ritual.</strong> That’s often the memory-maker for UK travellers.</li>
  <li><strong>Keep one day flexible.</strong> The best holidays have a spare day.</li>
</ul>

<hr/>

<h2>FAQs</h2>

<h3>What is the best area to stay in Side for UK travellers?</h3>
<p>For atmosphere and walkable evenings, stay near Side Old Town. For easy beach routines (especially families), Kumköy or Evrenseki. For calmer pacing, Sorgun or Titreyengöl.</p>

<h3>Is Side good for families?</h3>
<p>Yes—Side is one of the easiest family bases because you can build simple beach days and add just one or two outings.</p>

<h3>Where should couples stay in Side?</h3>
<p>Couples often love Side Old Town for atmosphere, or Sorgun for a quieter, more switch-off pace.</p>

<p><em>Last updated:</em> ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
`
};

async function run() {
    const timestamp = Date.now();
    console.log("🚀 Starting Side Article Automation...");

    // SAFE PROMPTS - Authentic Style
    const imagesToGenerate = [
        {
            placeholder: '<!-- IMAGE_COVER_PLACEHOLDER -->',
            filename: `side-cover-overview-temple-${timestamp}.jpg`,
            prompt: "The Temple of Apollo in Side at sunset. Ancient columns against a warm sky and sea. Authentic historic travel photo. Realistic lighting. No heavy editing."
        },
        {
            placeholder: '<!-- IMAGE_SIDE_OLD_TOWN_PLACEHOLDER -->',
            filename: `side-old-town-street-walk-${timestamp}.jpg`,
            prompt: "A narrow stone street in Side Old Town. Souvenir shops, historic ruins mixed with daily life. People walking. Authentic street photography. Bright daylight."
        },
        {
            placeholder: '<!-- IMAGE_KUMKOY_PLACEHOLDER -->',
            filename: `side-kumkoy-beach-day-${timestamp}.jpg`,
            prompt: "A wide sandy beach in Kumkoy, Side. Sunbeds, umbrellas, people relaxing. Clear blue sky. Typical easy holiday atmosphere. Authentic beach photo. Realistic colors."
        },
        {
            placeholder: '<!-- IMAGE_SORGUN_PLACEHOLDER -->',
            filename: `side-sorgun-pine-forest-path-${timestamp}.jpg`,
            prompt: "A peaceful walking path in Sorgun pine forest, near Side. Green trees, soft sunlight filtering through. Calm tranquil atmosphere. Authentic nature photo."
        }
    ];

    let finalContent = ARTICLE_DATA.content;
    let coverImageUrl = '';

    for (const item of imagesToGenerate) {
        if (!item.placeholder.includes('COVER')) await sleep(5000);

        const publicUrl = await generateImageVertex(item.prompt, item.filename);

        if (publicUrl) {
            if (item.placeholder.includes('COVER')) {
                coverImageUrl = publicUrl;
                finalContent = finalContent.replace(item.placeholder, '');
            } else {
                const imgTag = `<img src="${publicUrl}" alt="${item.prompt}" class="w-full h-auto rounded-lg my-6 shadow-md" />`;
                finalContent = finalContent.replace(item.placeholder, imgTag);
            }
        } else {
            console.warn("⚠️ Image generation failed for:", item.filename);
            finalContent = finalContent.replace(item.placeholder, '');
        }
    }

    // Insert into DB
    const { error } = await supabase.from('articles').upsert({
        slug: ARTICLE_DATA.slug,
        title: { en: ARTICLE_DATA.title, tr: "Side'de Nerede Kalınır? (TR Pasif)" },
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
        console.log("✅ Side Article Added Successfully!");
        console.log("👉 Slug:", ARTICLE_DATA.slug);
    }
}

run();
