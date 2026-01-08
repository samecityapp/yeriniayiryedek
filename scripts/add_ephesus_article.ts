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
    slug: 'where-to-stay-near-ephesus-selcuk-vs-kusadasi-uk-guide',
    title: 'Where to Stay Near Ephesus: Selçuk vs Kuşadası (Best Base for UK Travellers)',
    meta_description: 'Visiting Ephesus and not sure where to base yourself? Compare Selçuk vs Kuşadası for UK travellers—access, vibe, evenings, day trips and how many nights to stay. No hotel names.',
    primary_keyword: 'where to stay near Ephesus',
    content: `<p><strong>Quick answer:</strong> Choose <strong>Selçuk</strong> if you want the most efficient Ephesus-focused base with a calmer, more local feel and very easy early-morning access. Choose <strong>Kuşadası</strong> if you want a bigger resort-town setup with more seaside energy, more evening choice, and a beach-holiday feel alongside your Ephesus visit.</p>

<p>For most UK travellers who care primarily about Ephesus, <strong>Selçuk is the cleaner choice</strong>. For travellers who want Ephesus as a “highlight day” inside a broader coastal holiday, <strong>Kuşadası can make more sense</strong>.</p>

<p>Internal reads (placeholders):
<a href="/guide/ephesus-ancient-city-guide-best-timing">Ephesus Guide: What to Know + Best Timing</a> •
<a href="/guide/where-to-stay-in-izmir-weekend-guide">Where to Stay in Izmir (Weekend + Day Trips)</a> •
<a href="/guide/izmir-weekend-itinerary-uk-friendly">Izmir Weekend Guide (UK-Friendly)</a> •
<a href="/guide/best-time-to-visit-aegean-coast">Best Time to Visit the Aegean Coast</a> •
<a href="/guide/turkey-itinerary-7-days-classic-route">Turkey Itinerary 7 Days: Classic Route</a>
</p>

<!-- IMAGE_COVER_PLACEHOLDER -->

<hr/>

<h2>Pick your base in 60 seconds (UK travellers)</h2>
<ul>
  <li><strong>“We’re here mainly for Ephesus and want the easiest plan”</strong> → Selçuk</li>
  <li><strong>“We want Ephesus + a seaside resort town feel”</strong> → Kuşadası</li>
  <li><strong>“We want calm evenings and early starts”</strong> → Selçuk</li>
  <li><strong>“We want more evening choice and holiday buzz”</strong> → Kuşadası</li>
</ul>

<p><strong>Simple rule:</strong> If your ideal day is “early Ephesus, slow lunch, calm evening” choose Selçuk. If your ideal day is “Ephesus, then swim and a lively seaside evening” choose Kuşadası.</p>

<hr/>

<h2>Selçuk vs Kuşadası at a glance</h2>
<table>
  <thead>
    <tr>
      <th>Category</th>
      <th>Selçuk</th>
      <th>Kuşadası</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Best for</strong></td>
      <td>Ephesus-first trips, calm pacing</td>
      <td>Coastal holiday + Ephesus day</td>
    </tr>
    <tr>
      <td><strong>Access to Ephesus</strong></td>
      <td>Fast, easy, early-start friendly</td>
      <td>Doable, but typically more travel time</td>
    </tr>
    <tr>
      <td><strong>Evenings</strong></td>
      <td>Calm, simple, local feel</td>
      <td>More choice, seaside energy</td>
    </tr>
    <tr>
      <td><strong>Holiday vibe</strong></td>
      <td>Historic-town base</td>
      <td>Resort-town base</td>
    </tr>
    <tr>
      <td><strong>Best length of stay</strong></td>
      <td>1–2 nights</td>
      <td>2–5+ nights (if beach holiday)</td>
    </tr>
  </tbody>
</table>

<hr/>

<h2>Option 1: Selçuk (best for Ephesus-first, calm and efficient)</h2>
<p>Selçuk is the smart base if Ephesus is your main mission. It’s built for early mornings and “do the big site properly” pacing. For UK travellers, this is often the best way to experience Ephesus without turning the day into a long, tiring commute.</p>

<h3>Choose Selçuk if…</h3>
<ul>
  <li>you want the <strong>easiest early start</strong> for Ephesus</li>
  <li>you like a <strong>calmer evening</strong> and a more local town feel</li>
  <li>you’re doing Ephesus as a key cultural highlight (not just a quick stop)</li>
</ul>

<!-- IMAGE_SELCUK_PLACEHOLDER -->

<h3>How Selçuk makes your Ephesus day better</h3>
<ul>
  <li><strong>Early access:</strong> you can start the day earlier and avoid the heaviest crowds.</li>
  <li><strong>Better pacing:</strong> you can return for a rest, then do an easy evening.</li>
  <li><strong>Less stress:</strong> fewer moving parts in the plan.</li>
</ul>

<h3>How many nights in Selçuk?</h3>
<ul>
  <li><strong>1 night</strong> is enough if you want one strong Ephesus day.</li>
  <li><strong>2 nights</strong> is ideal if you want a slower pace and one extra half-day nearby.</li>
</ul>

<p><strong>UK-friendly approach:</strong> arrive afternoon, do a calm evening, do Ephesus early next morning, then enjoy a slow lunch and move on.</p>

<hr/>

<h2>Option 2: Kuşadası (best for seaside holiday energy + Ephesus as a highlight)</h2>
<p>Kuşadası works well if you want the Ephesus day but also want your base to feel like a seaside holiday — more evening choice, more “walk out and find something” energy, and a more resort-town atmosphere.</p>

<h3>Choose Kuşadası if…</h3>
<ul>
  <li>you want a <strong>seaside base</strong> with more holiday buzz</li>
  <li>you want Ephesus as a <strong>single highlight day</strong> within a broader coastal stay</li>
  <li>you like having more evening options without planning too much</li>
</ul>

<!-- IMAGE_KUSADASI_PLACEHOLDER -->

<h3>How to do Kuşadası without turning Ephesus into a long day</h3>
<ul>
  <li><strong>Start early:</strong> treat Ephesus as a morning mission.</li>
  <li><strong>Keep the rest of the day light:</strong> lunch + swim time beats over-scheduling.</li>
  <li><strong>Don’t stack big activities:</strong> Ephesus is the main “big” day.</li>
</ul>

<hr/>

<h2>Best base by traveller type (UK-friendly)</h2>

<h3>Short cultural stop (1–2 nights)</h3>
<ul>
  <li><strong>Best pick:</strong> Selçuk</li>
</ul>

<h3>Coastal holiday with a culture day</h3>
<ul>
  <li><strong>Best pick:</strong> Kuşadası</li>
</ul>

<h3>Couples (calm and romantic pacing)</h3>
<ul>
  <li><strong>Best pick:</strong> Selçuk for calm evenings, Kuşadası for seaside energy</li>
</ul>

<h3>Families</h3>
<ul>
  <li><strong>Best pick:</strong> depends on your holiday style — Selçuk for simplicity, Kuşadası for beach-holiday rhythm</li>
</ul>

<hr/>

<h2>The no-regrets plan (two simple templates)</h2>

<h3>Template A: Selçuk base (Ephesus-first)</h3>
<ul>
  <li><strong>Day 1:</strong> arrive + relaxed evening</li>
  <li><strong>Day 2:</strong> Ephesus early + slow lunch + optional extra nearby</li>
  <li><strong>Day 3:</strong> move on</li>
</ul>

<h3>Template B: Kuşadası base (holiday + highlight day)</h3>
<ul>
  <li><strong>Day 1–2:</strong> beach and relaxed town evenings</li>
  <li><strong>Day 3:</strong> Ephesus early + calm afternoon</li>
  <li><strong>Day 4+:</strong> continue holiday rhythm</li>
</ul>

<hr/>

<h2>FAQs</h2>

<h3>Is Selçuk or Kuşadası better for visiting Ephesus?</h3>
<p>Selçuk is usually better if Ephesus is your main focus because it’s closer and makes early starts easier. Kuşadası is better if you want a seaside resort-town base with Ephesus as a highlight day.</p>

<h3>How many nights do I need near Ephesus?</h3>
<p>One night can be enough for a strong Ephesus day, but two nights is ideal if you want a calmer pace and one extra half-day.</p>

<h3>Can I visit Ephesus as a day trip from Izmir?</h3>
<p>Yes — Izmir can work as a base for day trips, but if Ephesus is your priority and you want an early, low-stress start, Selçuk is usually the smoother option.</p>

<p><em>Last updated:</em> ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
`
};

async function run() {
    const timestamp = Date.now();
    console.log("🚀 Starting Ephesus Article Automation...");

    // SAFE PROMPTS for Authentic Feel
    const imagesToGenerate = [
        {
            placeholder: '<!-- IMAGE_COVER_PLACEHOLDER -->',
            filename: `ephesus-cover-library-celsus-${timestamp}.jpg`,
            prompt: "The Library of Celsus at Ephesus ancient city. Majestic Roman ruins. Sunlight hitting the marble columns. Authentic historic travel photography. Realistic colors. No heavy filters."
        },
        {
            placeholder: '<!-- IMAGE_SELCUK_PLACEHOLDER -->',
            filename: `selcuk-town-authentic-view-${timestamp}.jpg`,
            prompt: "View of Selcuk town with the Basilica of St. John ruins on the hill. Sleepy Turkish town atmosphere. Storks nesting on pillars. Authentic travel photo. Bright daylight."
        },
        {
            placeholder: '<!-- IMAGE_KUSADASI_PLACEHOLDER -->',
            filename: `kusadasi-coast-harbour-view-${timestamp}.jpg`,
            prompt: "Wide view of Kusadasi harbour and Pigeon Island castle. Blue sea, cruise ships in distance. Seaside resort town vibe. Authentic travel photography. Sunny day."
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
        title: { en: ARTICLE_DATA.title, tr: "Efes Yakınlarında Nerede Kalınır? Selçuk vs Kuşadası (TR Pasif)" },
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
        console.log("✅ Ephesus Article Added Successfully!");
        console.log("👉 Slug:", ARTICLE_DATA.slug);
    }
}

run();
