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
    slug: 'where-to-stay-in-bodrum-best-areas-guide-uk',
    title: 'Where to Stay in Bodrum: Best Areas for Beaches vs Nightlife vs Quiet (UK Guide)',
    meta_description: 'Not sure where to stay in Bodrum? Compare Bodrum Town, Gümbet, Bitez, Ortakent, Yalıkavak, Türkbükü/Göltürkbükü, Gündoğan, Turgutreis and more—vibes, pros/cons, and who each suits. No hotel names.',
    primary_keyword: 'where to stay in Bodrum',
    content: `<p><strong>Quick answer:</strong> Stay in <strong>Bodrum Town</strong> if you want walkable evenings, harbour energy, and easy first-timer logistics. Choose <strong>Gümbet</strong> if nightlife and a lively scene are your priority. Pick <strong>Bitez</strong> for a calmer, easy beach routine close to town. Choose <strong>Ortakent</strong> for a practical “proper beach day” base. Go for <strong>Yalıkavak</strong> if you want a stylish marina atmosphere. Choose <strong>Gündoğan</strong> or <strong>Torba</strong> for a quieter, slower pace. Pick <strong>Turgutreis</strong> for sunsets and a laid-back coastal feel.</p>

<p>Bodrum is a peninsula — and each area feels like a different holiday. The best Bodrum trips happen when you choose one base that matches your rhythm, then explore one “corner” of the peninsula per day (instead of driving back and forth nonstop).</p>

<p>Internal reads (placeholders):
<a href="/guide/bodrum-itinerary-3-days-uk-friendly">Bodrum Itinerary: 3 Days (UK-Friendly)</a> •
<a href="/guide/bodrum-castle-history-and-visit-guide">Bodrum Castle: What to Know</a> •
<a href="/guide/mausoleum-at-halicarnassus-bodrum-guide">Mausoleum at Halicarnassus: What to Know</a> •
<a href="/guide/milas-bodrum-airport-to-city-transfer-guide">Milas–Bodrum Airport to Bodrum: Best Options</a> •
<a href="/guide/bodrum-vs-antalya-holiday-comparison">Bodrum vs Antalya: Which Is Better for UK Travellers?</a> •
<a href="/guide/best-time-to-visit-bodrum">Best Time to Visit Bodrum (Month-by-Month)</a>
</p>

<!-- IMAGE_COVER_PLACEHOLDER -->

<hr/>

<h2>Pick your Bodrum base in 60 seconds (UK-friendly)</h2>
<ul>
  <li><strong>First time in Bodrum + want walkability:</strong> Bodrum Town</li>
  <li><strong>Nightlife-first holiday:</strong> Gümbet</li>
  <li><strong>Calm beach days close to town:</strong> Bitez</li>
  <li><strong>Beach-first, practical and spacious:</strong> Ortakent</li>
  <li><strong>Stylish marina evenings:</strong> Yalıkavak</li>
  <li><strong>Quiet, slow Bodrum:</strong> Torba or Gündoğan</li>
  <li><strong>Sunsets + laid-back feel:</strong> Turgutreis</li>
</ul>

<p><strong>Simple rule:</strong> If you’ll be out every night, pick a base with easy evenings (Town / marina-style). If you’re beach-first, pick a base where the beach is effortless (Bitez / Ortakent / quieter bays).</p>

<hr/>

<h2>Bodrum areas at a glance</h2>
<table>
  <thead>
    <tr>
      <th>Area</th>
      <th>Best for</th>
      <th>Vibe</th>
      <th>What to know</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Bodrum Town</strong></td>
      <td>First-timers, couples, short stays</td>
      <td>Harbour energy, walkable evenings</td>
      <td>Great base; explore peninsula by day</td>
    </tr>
    <tr>
      <td><strong>Gümbet</strong></td>
      <td>Friends trips, nightlife</td>
      <td>Lively, energetic</td>
      <td>Choose this if nightlife is your main goal</td>
    </tr>
    <tr>
      <td><strong>Bitez</strong></td>
      <td>Calm beach + easy logistics</td>
      <td>Relaxed, family-friendly</td>
      <td>Close to town; gentle pace</td>
    </tr>
    <tr>
      <td><strong>Ortakent</strong></td>
      <td>Beach-first stays</td>
      <td>Spacious, practical</td>
      <td>Good “proper beach day” base</td>
    </tr>
    <tr>
      <td><strong>Yalıkavak</strong></td>
      <td>Marina vibe, stylish evenings</td>
      <td>Polished, scenic</td>
      <td>Great for sunset dinners and atmosphere</td>
    </tr>
    <tr>
      <td><strong>Türkbükü / Göltürkbükü</strong></td>
      <td>Social, upscale vibe</td>
      <td>Beach-club energy (seasonal)</td>
      <td>Pick if you want a “seen and social” summer feel</td>
    </tr>
    <tr>
      <td><strong>Gündoğan</strong></td>
      <td>Quiet couples, calm nights</td>
      <td>Low-key, relaxed</td>
      <td>Good if your priority is rest</td>
    </tr>
    <tr>
      <td><strong>Torba</strong></td>
      <td>Quiet + close-ish to town</td>
      <td>Calm, easy</td>
      <td>Good balance of quiet and access</td>
    </tr>
    <tr>
      <td><strong>Turgutreis</strong></td>
      <td>Sunsets, laid-back stays</td>
      <td>Open sea feel</td>
      <td>Great if you love evening light and calmer pace</td>
    </tr>
  </tbody>
</table>

<hr/>

<h2>1) Bodrum Town: the best first-timer base (walkable, easy, iconic)</h2>
<p>Bodrum Town is your safest “I want this trip to work” base. It’s walkable, it has the harbour atmosphere, and it’s ideal if you’re visiting for the first time or staying for a shorter trip.</p>

<h3>Choose Bodrum Town if…</h3>
<ul>
  <li>you want <strong>walkable evenings</strong> and harbour energy</li>
  <li>you like being close to cafés, shops and simple daily options</li>
  <li>you want to do the castle/Old Town moments easily</li>
</ul>

<!-- IMAGE_BODRUM_TOWN_PLACEHOLDER -->

<h3>Best way to do Bodrum Town</h3>
<p>Use it as a base and treat the peninsula like a menu: one area per day, then back to town for evenings. That’s the Bodrum sweet spot.</p>

<hr/>

<h2>2) Gümbet: best for nightlife and a lively friends trip</h2>
<p>Gümbet is the pick when your main goal is an energetic holiday: lively evenings, a social scene, and a “friends trip” feel. Choose it if nightlife is a feature, not an afterthought.</p>

<h3>Choose Gümbet if…</h3>
<ul>
  <li>you want a holiday that feels <strong>active and social</strong></li>
  <li>you’re travelling with friends and want a lively base</li>
</ul>

<!-- IMAGE_GUMBET_PLACEHOLDER -->

<p><strong>Better move for couples seeking calm:</strong> pick Town, Bitez, Ortakent, Torba, or Gündoğan.</p>

<hr/>

<h2>3) Bitez: calm beach days near town (family-friendly, relaxed)</h2>
<p>Bitez is a great middle-ground base: calmer than the busiest areas, but close enough to town that you can still enjoy Bodrum’s evening atmosphere without a complicated plan.</p>

<h3>Choose Bitez if…</h3>
<ul>
  <li>you want <strong>calm, easy beach days</strong></li>
  <li>you like the idea of being near town without staying in the busiest centre</li>
  <li>you’re travelling as a couple or family and want a gentle pace</li>
</ul>

<!-- IMAGE_BITEZ_PLACEHOLDER -->

<hr/>

<h2>4) Ortakent: beach-first, practical, and spacious</h2>
<p>Ortakent works well for UK travellers who want their Bodrum trip to be mostly about beach time. It’s a practical base: you build your days around comfortable beach routines, then add a few “nice” evenings out.</p>

<h3>Choose Ortakent if…</h3>
<ul>
  <li>your trip is <strong>beach-first</strong></li>
  <li>you want a base that feels straightforward and easy</li>
  <li>you like the idea of exploring different corners without being in the busiest centre</li>
</ul>

<hr/>

<h2>5) Yalıkavak: marina atmosphere and scenic, stylish evenings</h2>
<p>Yalıkavak is ideal if you want Bodrum to feel a bit more “marina chic”: scenic evenings, sunset dining, and a polished vibe. It’s especially good for couples who like atmosphere and beautiful views.</p>

<h3>Choose Yalıkavak if…</h3>
<ul>
  <li>you want <strong>stylish evenings</strong> and marina energy</li>
  <li>you enjoy a slightly more “polished” holiday feel</li>
  <li>sunset dinners are a big part of your trip plan</li>
</ul>

<!-- IMAGE_YALIKAVAK_PLACEHOLDER -->

<hr/>

<h2>6) Türkbükü / Göltürkbükü: social, summer, and “beach-club energy”</h2>
<p>This is the pick if you want a social summer scene. It’s often associated with a more “see and be seen” feel (especially in peak season). If your holiday goal is relaxed calm, choose a quieter bay instead.</p>

<hr/>

<h2>7) Torba and Gündoğan: quieter bases for real rest</h2>
<p>If your dream holiday day is “swim, read, eat well, sleep deeply”, these quieter areas are worth serious consideration. They’re great for couples and families who prioritise calm nights and low effort days.</p>

<h3>Choose Torba if…</h3>
<ul>
  <li>you want quiet but still want easier access to Bodrum Town</li>
  <li>you like a “calm base” with occasional town evenings</li>
</ul>

<h3>Choose Gündoğan if…</h3>
<ul>
  <li>you want a quieter bay feel and calmer nights</li>
  <li>you’re happy with a slower pace most days</li>
</ul>

<!-- IMAGE_GUNDOGAN_PLACEHOLDER -->

<hr/>

<h2>8) Turgutreis: sunsets and a laid-back, open-sea feel</h2>
<p>Turgutreis is often loved for its sunset energy and more open, coastal feel. It’s a great base if you like evenings that are calm, scenic, and consistently beautiful.</p>

<h3>Choose Turgutreis if…</h3>
<ul>
  <li>sunsets are part of your holiday happiness</li>
  <li>you want a calmer base with a “big sea” feeling</li>
</ul>

<hr/>

<h2>How to choose the right area (the method that never fails)</h2>
<p>Pick your base based on your default day:</p>
<ul>
  <li><strong>Walkable evenings + harbour:</strong> Bodrum Town</li>
  <li><strong>Nightlife-first:</strong> Gümbet</li>
  <li><strong>Calm beach days close to town:</strong> Bitez</li>
  <li><strong>Beach-first simplicity:</strong> Ortakent</li>
  <li><strong>Marina vibe + sunset dinners:</strong> Yalıkavak</li>
  <li><strong>Quiet rest and slow days:</strong> Torba / Gündoğan</li>
  <li><strong>Sunset coastal base:</strong> Turgutreis</li>
</ul>

<hr/>

<h2>Where to stay in Bodrum by traveller type (UK-friendly)</h2>

<h3>Couples</h3>
<ul>
  <li><strong>Best picks:</strong> Bodrum Town, Yalıkavak, Bitez, Torba</li>
  <li><strong>Choose based on:</strong> walkable evenings (Town) vs marina vibe (Yalıkavak) vs calm beach days (Bitez/Torba)</li>
</ul>

<h3>Families</h3>
<ul>
  <li><strong>Best picks:</strong> Bitez, Ortakent, Torba</li>
  <li><strong>Why:</strong> easy beach routines and calmer nights</li>
</ul>

<h3>Friends trips</h3>
<ul>
  <li><strong>Best picks:</strong> Gümbet (lively) or Bodrum Town (balanced)</li>
</ul>

<h3>Short stays (3–4 nights)</h3>
<ul>
  <li><strong>Best pick:</strong> Bodrum Town (most efficient base)</li>
</ul>

<hr/>

<h2>Planning tips that make Bodrum feel premium (without spending more)</h2>
<ul>
  <li><strong>One peninsula corner per day:</strong> you’ll enjoy more and travel less.</li>
  <li><strong>Do your culture anchors early:</strong> castle + Old Town moments, then relax.</li>
  <li><strong>Keep evenings simple:</strong> pick one great sunset spot and one easy dinner plan.</li>
</ul>

<hr/>

<h2>FAQs</h2>

<h3>Where is the best area to stay in Bodrum for first-timers from the UK?</h3>
<p>Bodrum Town is usually the easiest: walkable, iconic, and simple for short stays.</p>

<h3>Where should I stay in Bodrum for nightlife?</h3>
<p>Gümbet is the most nightlife-first base, while Bodrum Town gives a balanced mix.</p>

<h3>Where is best for quiet stays?</h3>
<p>Torba and Gündoğan are strong choices for calm nights and a slower pace, while Bitez also offers relaxed beach days close to town.</p>

<h3>Where is best for a beach-first holiday?</h3>
<p>Bitez and Ortakent are great for easy beach routines, depending on the vibe you want.</p>

<h3>Where is best for couples?</h3>
<p>Bodrum Town for walkable evenings, Yalıkavak for marina atmosphere, and Bitez/Torba for calmer, romantic pacing.</p>

<p><em>Last updated:</em> ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
`
};

async function run() {
    const timestamp = Date.now();
    console.log("🚀 Starting Bodrum Article Automation...");

    // SAFE PROMPTS (Avoids "party/alcohol" explicit triggers to be safe)
    const imagesToGenerate = [
        {
            placeholder: '<!-- IMAGE_COVER_PLACEHOLDER -->',
            filename: `bodrum-cover-overview-${timestamp}.jpg`,
            prompt: "A wide panoramic view of Bodrum Castle and the white-washed houses on the hillside. Crystal clear blue Aegean sea. Bougainvillea flowers in the foreground. Authentic travel photo. Bright daylight. No heavy editing. Realistic colors."
        },
        {
            placeholder: '<!-- IMAGE_BODRUM_TOWN_PLACEHOLDER -->',
            filename: `bodrum-town-harbour-${timestamp}.jpg`,
            prompt: "Bodrum marina harbour promenade in the evening. Sailboats docked. People walking along the palm-lined street. Warm sunset light. Authentic atmosphere. Street photography style."
        },
        {
            placeholder: '<!-- IMAGE_GUMBET_PLACEHOLDER -->',
            filename: `bodrum-gumbet-beach-day-${timestamp}.jpg`,
            prompt: "A lively beach scene in Gumbet, Bodrum. Sunbeds, umbrellas, people enjoying the sea. Bright turquoise shallow water. Energetic holiday atmosphere. Wide angle scenic shot. Realistic lighting."
        },
        {
            placeholder: '<!-- IMAGE_BITEZ_PLACEHOLDER -->',
            filename: `bodrum-bitez-calm-bay-${timestamp}.jpg`,
            prompt: "A peaceful curved bay in Bitez, Bodrum. Calm water, lush green citrus trees in the background. A relaxed beach cafe setting. Soft morning light. Authentic travel vibes. No filters."
        },
        {
            placeholder: '<!-- IMAGE_YALIKAVAK_PLACEHOLDER -->',
            filename: `bodrum-yalikavak-marina-evening-${timestamp}.jpg`,
            prompt: "Yalikavak palm marina area at twilight. Modern luxury architecture, calm water reflections. Elegant evening atmosphere. Authentic scenic photo. High quality texture."
        },
        { // Added one more for variety
            placeholder: '<!-- IMAGE_GUNDOGAN_PLACEHOLDER -->',
            filename: `bodrum-gundogan-pier-quiet-${timestamp}.jpg`,
            prompt: "A quiet wooden pier in Gundogan bay, Bodrum. Clear water. Peaceful morning atmosphere. Minimalist travel photo. Authentic colors. Relaxing vibe."
        }
    ];

    let finalContent = ARTICLE_DATA.content;
    let coverImageUrl = '';

    for (const item of imagesToGenerate) {
        if (!item.placeholder.includes('COVER')) await sleep(5000); // Buffer

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
        title: { en: ARTICLE_DATA.title, tr: "Bodrum'da Nerede Kalınır? (TR Pasif)" },
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
        console.log("✅ Bodrum Article Added Successfully!");
        console.log("👉 Slug:", ARTICLE_DATA.slug);
    }
}

run();
