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
    slug: 'where-to-stay-in-marmaris-best-areas-uk-guide',
    title: 'Where to Stay in Marmaris: Best Areas & What to Expect (UK Guide)',
    meta_description: 'Choosing where to stay in Marmaris? Compare Marmaris Centre, Siteler, İçmeler, Armutalan, Turunç and nearby bases—vibes, pros/cons, beaches, nightlife and who each suits. UK-friendly, no hotel names.',
    primary_keyword: 'where to stay in Marmaris',
    content: `<p><strong>Quick answer:</strong> Stay in <strong>Marmaris Centre</strong> if you want maximum walkability, a busy resort-town feel, and lots of evening options. Choose <strong>Siteler</strong> if you want to be close to the centre but prefer a more “beach strip” setup. Pick <strong>İçmeler</strong> if you want a more relaxed family-friendly base with an easier beach routine. Choose <strong>Turunç</strong> if you want a smaller, calmer bay feel. Consider <strong>Armutalan</strong> if you want a practical base that can be good value and you’re happy to travel a bit for the beach/centre.</p>

<p>Marmaris is great for UK travellers who like a holiday that feels “alive”: you can walk out and find food, shops, boat trips and evening energy without building a complicated plan. The key is choosing an area that matches your sleep and beach routine.</p>

<p>Internal reads (placeholders):
<a href="/guide/fethiye-vs-marmaris-which-is-better">Fethiye vs Marmaris: Which Base Is Better?</a> •
<a href="/guide/marmaris-itinerary-4-days-uk-friendly">Marmaris Itinerary: 4 Days (UK-Friendly)</a> •
<a href="/guide/marmaris-day-trips-guide">Best Day Trips from Marmaris</a> •
<a href="/guide/dalaman-airport-to-marmaris-transfer-options">Dalaman Airport to Marmaris: Transfer Options</a> •
<a href="/guide/quiet-sleep-in-turkey-tips">Quiet Sleep in Turkey: Avoid Noisy Rooms</a> •
<a href="/guide/all-inclusive-holiday-in-turkey-explained">All-Inclusive in Turkey Explained</a>
</p>

<!-- IMAGE_COVER_PLACEHOLDER -->

<hr/>

<h2>Pick your Marmaris base in 60 seconds (UK travellers)</h2>
<ul>
  <li><strong>Walkable nights + busy resort-town energy</strong> → Marmaris Centre</li>
  <li><strong>Close to centre but a bit more “beach strip”</strong> → Siteler</li>
  <li><strong>Family-friendly + calmer + easy beach days</strong> → İçmeler</li>
  <li><strong>Small bay, slower pace, real rest</strong> → Turunç</li>
  <li><strong>Practical base (often good value), okay with short rides</strong> → Armutalan</li>
</ul>

<p><strong>Simple rule:</strong> Decide what you want your evenings to feel like. Marmaris days are easy everywhere — Marmaris nights are where your base choice really matters.</p>

<hr/>

<h2>Marmaris areas at a glance</h2>
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
      <td><strong>Marmaris Centre</strong></td>
      <td>First-timers, short stays, nightlife</td>
      <td>Busy, lively, walkable</td>
      <td>Most action; easiest evenings</td>
    </tr>
    <tr>
      <td><strong>Siteler</strong></td>
      <td>Beach + access to centre</td>
      <td>Beach strip feel</td>
      <td>Easy to dip into the centre</td>
    </tr>
    <tr>
      <td><strong>İçmeler</strong></td>
      <td>Families, couples, calmer weeks</td>
      <td>Relaxed, easy, beach-first</td>
      <td>Smoother pace than the centre</td>
    </tr>
    <tr>
      <td><strong>Armutalan</strong></td>
      <td>Value seekers, practical stays</td>
      <td>Residential-ish, practical</td>
      <td>Short rides to beach/centre</td>
    </tr>
    <tr>
      <td><strong>Turunç</strong></td>
      <td>Quiet couples, slow travel</td>
      <td>Small bay, calm nights</td>
      <td>More “escape” feeling</td>
    </tr>
  </tbody>
</table>

<hr/>

<h2>1) Marmaris Centre: best for walkability and evening options</h2>
<p>Marmaris Centre is the classic pick if you want to walk to dinner, browse shops, and feel that “holiday town energy” every night. It’s efficient: you don’t need to plan much to have a full day.</p>

<h3>Choose Marmaris Centre if…</h3>
<ul>
  <li>you want <strong>walkable evenings</strong> with lots of choice</li>
  <li>you like a busier holiday vibe where things feel “alive”</li>
  <li>you’re doing a <strong>short stay</strong> and want maximum convenience</li>
</ul>

<!-- IMAGE_MARMARIS_CENTRE_PLACEHOLDER -->

<h3>Make it work better (sleep + calm)</h3>
<ul>
  <li>If you’re sensitive to noise, prioritise a calmer street position and use our guide:
    <a href="/guide/quiet-sleep-in-turkey-tips">Quiet Sleep in Turkey</a>.</li>
  <li>Build “calm evenings” into the week even if you stay central.</li>
</ul>

<hr/>

<h2>2) Siteler: a beach-strip base that stays close to the centre</h2>
<p>Siteler is a strong middle-ground: you keep the centre within easy reach, but your day-to-day can feel more like a beach strip routine. It’s popular for travellers who want convenience without being in the busiest part of town every single night.</p>

<h3>Choose Siteler if…</h3>
<ul>
  <li>you want <strong>beach time</strong> plus easy access to town</li>
  <li>you prefer a slightly calmer base than the core centre</li>
  <li>you like the idea of “dip into town” evenings</li>
</ul>

<hr/>

<h2>3) İçmeler: the easiest relaxed base (families love it)</h2>
<p>İçmeler is a favourite for UK travellers who want Marmaris but with a more relaxed, repeatable routine. It’s especially good for families and couples who want beach days and calm evenings.</p>

<h3>Choose İçmeler if…</h3>
<ul>
  <li>you want a <strong>calmer pace</strong> than Marmaris Centre</li>
  <li>you want an <strong>easy beach day routine</strong></li>
  <li>you’re staying <strong>7+ nights</strong> and want comfort that stays smooth</li>
</ul>

<!-- IMAGE_ICMELER_PLACEHOLDER -->

<h3>Best way to do İçmeler</h3>
<ul>
  <li>Build your week around simple beach days.</li>
  <li>Add 1–2 “bigger” days: a boat day + one scenic outing.</li>
  <li>Keep the rest of the days light — that’s how İçmeler feels premium.</li>
</ul>

<hr/>

<h2>4) Armutalan: practical base (often good value)</h2>
<p>Armutalan can work well if you want Marmaris access but are happy to travel a little to the beach or centre. It’s often chosen by travellers who prioritise a practical base and plan to explore.</p>

<h3>Choose Armutalan if…</h3>
<ul>
  <li>you’re looking for a <strong>practical, value-led</strong> base</li>
  <li>you’re comfortable using short rides to reach the best spots</li>
  <li>you like having an easy “base camp” rather than being in the busiest centre</li>
</ul>

<!-- IMAGE_ARMUTALAN_PLACEHOLDER -->

<hr/>

<h2>5) Turunç: small bay, calm nights, true switch-off</h2>
<p>Turunç is for travellers who want to slow down. It’s a smaller bay feel where your holiday becomes “swim, rest, eat well, repeat”. If you’re trying to properly decompress, Turunç is a strong pick.</p>

<h3>Choose Turunç if…</h3>
<ul>
  <li>you want <strong>calm nights</strong> and a quieter base</li>
  <li>you’re a couple who likes a slower, more scenic pace</li>
  <li>you want the trip to feel like an <strong>escape</strong></li>
</ul>

<!-- IMAGE_TURUNC_PLACEHOLDER -->

<hr/>

<h2>Best base by traveller type (UK-friendly)</h2>

<h3>Couples</h3>
<ul>
  <li><strong>Walkable evenings + energy:</strong> Centre</li>
  <li><strong>Calm + beach days:</strong> İçmeler</li>
  <li><strong>Quiet escape:</strong> Turunç</li>
</ul>

<h3>Families</h3>
<ul>
  <li><strong>Most “easy routine”:</strong> İçmeler</li>
  <li><strong>Close to everything (older kids):</strong> Siteler</li>
  <li><strong>Calm base:</strong> Turunç</li>
</ul>

<h3>Friends trips</h3>
<ul>
  <li><strong>Lively nights:</strong> Centre</li>
  <li><strong>Balanced:</strong> Centre or Siteler</li>
</ul>

<h3>Short stays (3–4 nights)</h3>
<ul>
  <li><strong>Best pick:</strong> Marmaris Centre (maximum efficiency)</li>
</ul>

<h3>Longer stays (7–10 nights)</h3>
<ul>
  <li><strong>Best pick:</strong> İçmeler (repeatable comfort)</li>
</ul>

<hr/>

<h2>Planning tips that make Marmaris feel easier</h2>
<ul>
  <li><strong>Choose a base that matches your evenings.</strong> This is the #1 lever.</li>
  <li><strong>Keep day trips light.</strong> Marmaris is best when you don’t rush the week.</li>
  <li><strong>Mix “big day” and “easy day”.</strong> Beach day after a boat day is the perfect rhythm.</li>
</ul>

<hr/>

<h2>FAQs</h2>

<h3>What is the best area to stay in Marmaris for UK travellers?</h3>
<p>Marmaris Centre for walkable nights and convenience, İçmeler for calmer family-friendly beach routines, Siteler for a beach-strip base close to town, Turunç for a quieter escape.</p>

<h3>Is İçmeler better than Marmaris Centre?</h3>
<p>İçmeler is better if you want calmer pacing and easy beach routines. The centre is better if you want walkable nightlife and a busy resort-town feel.</p>

<h3>Where should families stay in Marmaris?</h3>
<p>İçmeler is often the easiest for families thanks to its relaxed pace and beach-first routine.</p>

<h3>Where should couples stay for a quiet week?</h3>
<p>İçmeler or Turunç are strong options for calm nights and slower days, while the centre suits couples who want more evening energy.</p>

<p><em>Last updated:</em> ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
`
};

async function run() {
    const timestamp = Date.now();
    console.log("🚀 Starting Marmaris Article Automation...");

    // SAFE PROMPTS for Authentic Feel
    const imagesToGenerate = [
        {
            placeholder: '<!-- IMAGE_COVER_PLACEHOLDER -->',
            filename: `marmaris-cover-overview-castle-${timestamp}.jpg`,
            prompt: "Panoramic view of Marmaris harbour and castle. Blue sea, yachts docked. Green pine mountains in background. Authentic travel photo. Bright sunny day. Realistic colors. No filters."
        },
        {
            placeholder: '<!-- IMAGE_MARMARIS_CENTRE_PLACEHOLDER -->',
            filename: `marmaris-centre-walkable-street-${timestamp}.jpg`,
            prompt: "A lively pedestrian street in Marmaris centre. Palm trees, shops, people walking. Sunny afternoon atmosphere. Authentic street photography. Depth of field."
        },
        {
            placeholder: '<!-- IMAGE_ICMELER_PLACEHOLDER -->',
            filename: `marmaris-icmeler-beach-calm-${timestamp}.jpg`,
            prompt: "A relaxed beach scene in Icmeler, Marmaris. Calm water, mountains close to shore. Families relaxing. Soft morning light. Authentic holiday vibe. Realistic textures."
        },
        {
            placeholder: '<!-- IMAGE_ARMUTALAN_PLACEHOLDER -->',
            filename: `marmaris-armutalan-street-view-${timestamp}.jpg`,
            prompt: "A typical street view in Armutalan, Marmaris. Residential holiday area, green trees, mountain backdrop. Quiet afternoon. Authentic travel photo. Realistic."
        },
        {
            placeholder: '<!-- IMAGE_TURUNC_PLACEHOLDER -->',
            filename: `marmaris-turunc-bay-view-${timestamp}.jpg`,
            prompt: "View of Turunc bay from above. Small boat in turquoise water. Peaceful cove surrounded by green hills. Authentic scenic photo. Bright daylight. No heavy editing."
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
        title: { en: ARTICLE_DATA.title, tr: "Marmaris'te Nerede Kalınır? (TR Pasif)" },
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
        console.log("✅ Marmaris Article Added Successfully!");
        console.log("👉 Slug:", ARTICLE_DATA.slug);
    }
}

run();
