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
    slug: 'where-to-stay-in-kas-best-areas-uk-guide',
    title: 'Where to Stay in Kaş: Best Areas for Swim Spots, Views & Calm Nights (UK Guide)',
    meta_description: 'Where should you stay in Kaş? Compare Kaş Centre, the Peninsula, Çukurbağ Peninsula, nearby bays and quieter bases—views, swim spots, night vibe and who each suits. UK-friendly, no hotel names.',
    primary_keyword: 'where to stay in Kaş',
    content: `<p><strong>Quick answer:</strong> Stay in <strong>Kaş Centre</strong> if you want walkable evenings, easy access to cafés, and the classic Kaş “small town energy”. Choose the <strong>peninsula areas</strong> if your priority is sea views, swim platforms, and a quieter, more “switch-off” stay (you’ll usually travel a little for town). Pick a <strong>slower, slightly out-of-town</strong> base if you want maximum calm and are happy with a more private holiday rhythm.</p>

<p>Kaş is loved by UK travellers who want a calmer, more scenic Aegean/Mediterranean vibe without the “big resort town” feeling. The base decision is simple: do you want to <em>walk out every evening</em> (Centre) or do you want to <em>wake up to views and water</em> (peninsula/out-of-town)?</p>

<p>Internal reads (placeholders):
<a href="/guide/where-to-stay-in-turkey-couples-guide">Where to Stay in Turkey for Couples</a> •
<a href="/guide/kas-itinerary-4-days-uk-friendly">Kaş Itinerary: 4 Days (UK-Friendly)</a> •
<a href="/guide/best-day-trips-from-kas">Best Day Trips from Kaş</a> •
<a href="/guide/quiet-sleep-in-turkey-tips">Quiet Sleep in Turkey: How to Avoid Noisy Rooms</a> •
<a href="/guide/best-time-to-visit-turkey-month-by-month">Best Time to Visit Turkey (Month-by-Month)</a>
</p>

<!-- IMAGE_COVER_PLACEHOLDER -->

<hr/>

<h2>Pick your Kaş base in 60 seconds (UK travellers)</h2>
<ul>
  <li><strong>Walkable evenings + cafés + “little town” atmosphere</strong> → Kaş Centre</li>
  <li><strong>Sea views + swim platforms + calm nights</strong> → Peninsula areas (view-first base)</li>
  <li><strong>Maximum quiet and private pacing</strong> → slower out-of-town base</li>
</ul>

<p><strong>Simple rule:</strong> Kaş is about calm nights and beautiful water. Choose Centre if you want evening life on foot. Choose peninsula/out-of-town if you want the sea to be the main character.</p>

<hr/>

<h2>Kaş areas at a glance</h2>
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
      <td><strong>Kaş Centre</strong></td>
      <td>Couples, first-timers, short stays</td>
      <td>Walkable, atmospheric</td>
      <td>Easy evenings; compact town energy</td>
    </tr>
    <tr>
      <td><strong>Peninsula areas</strong></td>
      <td>View lovers, calm trips</td>
      <td>Scenic, switch-off</td>
      <td>More private; usually need short rides</td>
    </tr>
    <tr>
      <td><strong>Out-of-town calm base</strong></td>
      <td>Deep rest, privacy</td>
      <td>Quiet, slow</td>
      <td>Best for “do nothing” days + water time</td>
    </tr>
  </tbody>
</table>

<hr/>

<h2>1) Kaş Centre: best for walkable evenings and the classic Kaş vibe</h2>
<p>Kaş Centre is ideal if you want your holiday to feel effortless: you can stroll out for dinner, grab dessert after, and enjoy that “small town holiday” atmosphere without planning transport. It’s also the easiest base for first-time visitors.</p>

<h3>Choose Kaş Centre if…</h3>
<ul>
  <li>you want <strong>walkable evenings</strong> every night</li>
  <li>you like being near cafés, shops and simple daily options</li>
  <li>you’re doing a <strong>short stay</strong> and want maximum efficiency</li>
</ul>

<!-- IMAGE_KAS_CENTRE_PLACEHOLDER -->

<h3>What Kaş Centre feels like (UK-friendly expectation)</h3>
<p>It’s relaxed, scenic, and social in a calm way — more “evening stroll and good food” than “big nightlife”. If you want full-on nightlife energy, Kaş isn’t trying to be that, and that’s why people love it.</p>

<hr/>

<h2>2) Peninsula areas: sea views, swim platforms, and calm nights</h2>
<p>The peninsula areas around Kaş are often chosen by travellers who want to wake up to water and views. This style of base is great for couples who want a more private pace: swim, relax, enjoy the view, then head into town when you feel like it.</p>

<h3>Choose peninsula areas if…</h3>
<ul>
  <li>your priority is <strong>sea views</strong> and a scenic stay</li>
  <li>you want <strong>calm nights</strong> and a switch-off rhythm</li>
  <li>you’re happy to travel a little for town dinners</li>
</ul>

<!-- IMAGE_PENINSULA_PLACEHOLDER -->

<h3>How to make a peninsula stay easy</h3>
<ul>
  <li><strong>Plan “town evenings”</strong> on specific nights, not every night.</li>
  <li><strong>Keep day plans light.</strong> Your base is already the experience.</li>
  <li><strong>Choose one main day trip only</strong> during a short stay.</li>
</ul>

<hr/>

<h2>3) A slower out-of-town base: maximum calm for a true reset</h2>
<p>If your goal is deep rest, a slower base slightly outside the centre can work beautifully. This is the option for travellers who want a more private holiday — the kind where your day is: breakfast, swim, read, late lunch, sunset, sleep.</p>

<h3>Choose a slower out-of-town base if…</h3>
<ul>
  <li>you want a <strong>quiet, private</strong> trip</li>
  <li>you’re not bothered about walkable evening options every night</li>
  <li>you want the holiday to feel like a true reset</li>
</ul>

<!-- IMAGE_SLOW_BASE_PLACEHOLDER -->

<hr/>

<h2>Best Kaş base by traveller type (UK-friendly)</h2>

<h3>Couples</h3>
<ul>
  <li><strong>Atmosphere + easy dinners:</strong> Kaş Centre</li>
  <li><strong>Views + calm nights:</strong> Peninsula areas</li>
</ul>

<h3>Solo travellers</h3>
<ul>
  <li><strong>Easiest social + walkable:</strong> Kaş Centre</li>
  <li><strong>Quiet reset:</strong> peninsula/out-of-town if you prefer privacy</li>
</ul>

<h3>Friends trips</h3>
<ul>
  <li><strong>Best pick:</strong> Kaş Centre (easy evenings and plans)</li>
</ul>

<h3>Longer stays (7+ nights)</h3>
<ul>
  <li><strong>Most comfortable for slow travel:</strong> peninsula or calmer bases</li>
</ul>

<hr/>

<h2>Planning tips that make Kaş feel premium (without spending more)</h2>
<ul>
  <li><strong>Protect your evenings.</strong> Kaş is an evening town — dinners and strolls are the magic.</li>
  <li><strong>Do one “hero day”.</strong> One beautiful day trip is better than three rushed ones.</li>
  <li><strong>Alternate swim days and explore days.</strong> That keeps the trip calm and memorable.</li>
</ul>

<hr/>

<h2>Common mistakes (framed positively)</h2>
<ul>
  <li><strong>Trying to make Kaş a “party base”:</strong> it’s better as a calm, scenic base with great evenings.</li>
  <li><strong>Over-planning day trips:</strong> Kaş shines when your schedule stays light.</li>
  <li><strong>Choosing a base that fights your routine:</strong> if you love walkable evenings, don’t pick a base that requires constant rides.</li>
</ul>

<hr/>

<h2>FAQs</h2>

<h3>Where is the best area to stay in Kaş for UK travellers?</h3>
<p>Kaş Centre for walkable evenings and first-timer ease, peninsula areas for sea views and calm nights, and out-of-town bases for maximum quiet.</p>

<h3>Is Kaş good for couples?</h3>
<p>Yes—Kaş is one of the best couple-friendly bases in Turkey for scenic days and calm, memorable evenings.</p>

<h3>Do I need a car in Kaş?</h3>
<p>Not necessarily if you stay in the centre. If you choose a peninsula or quieter base, you’ll want a simple plan for short rides to town and day trips.</p>

<p><em>Last updated:</em> ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
`
};

async function run() {
    const timestamp = Date.now();
    console.log("🚀 Starting Kaş Article Automation...");

    // SAFE PROMPTS for Authentic Feel
    const imagesToGenerate = [
        {
            placeholder: '<!-- IMAGE_COVER_PLACEHOLDER -->',
            filename: `kas-cover-overview-sea-view-${timestamp}.jpg`,
            prompt: "A beautiful aerial view of Kas harbour and coastline. Turquoise water, white boats, mountains in background. Authentic travel photo. Bright sunny day. Realistic colors. No filters."
        },
        {
            placeholder: '<!-- IMAGE_KAS_CENTRE_PLACEHOLDER -->',
            filename: `kas-centre-evening-street-${timestamp}.jpg`,
            prompt: "Charming narrow stress in Kas centre with bougainvillea flowers. Evening light, warm lantern glow. People dining at tables outside. Authentic atmosphere. Romantic vibe."
        },
        {
            placeholder: '<!-- IMAGE_PENINSULA_PLACEHOLDER -->',
            filename: `kas-peninsula-swim-platform-${timestamp}.jpg`,
            prompt: "A private swim platform on the Kas peninsula. wooden deck, clear deep blue water. Sunbeds. Peaceful relaxation. Authentic holiday photo. Realistic textures."
        },
        {
            placeholder: '<!-- IMAGE_SLOW_BASE_PLACEHOLDER -->',
            filename: `kas-kaputas-beach-nearby-${timestamp}.jpg`,
            prompt: "A stunning view of Kaputas Beach near Kas from above. Golden sand, vibrant turquoise water between cliffs. Authentic travel photography. Bright daylight."
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
        title: { en: ARTICLE_DATA.title, tr: "Kaş'ta Nerede Kalınır? (TR Pasif)" },
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
        console.log("✅ Kaş Article Added Successfully!");
        console.log("👉 Slug:", ARTICLE_DATA.slug);
    }
}

run();
