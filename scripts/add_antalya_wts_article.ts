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
    slug: 'where-to-stay-in-antalya-best-areas-guide-uk',
    title: 'Where to Stay in Antalya: Best Areas for UK Travellers (No Hotel Names)',
    meta_description: 'Not sure where to stay in Antalya? Compare Kaleiçi, Konyaaltı, Lara, Belek, Kemer, Side and more—vibe, pros/cons, beach style and who each area suits.',
    content: `
<h1>Where to Stay in Antalya: Best Areas for UK Travellers (No Hotel Names — Just the Right Base)</h1>

<p><strong>Quick answer:</strong> Stay in <strong>Kaleiçi (Old Town)</strong> if you want history, character streets, and a “walk out and wander” holiday. Stay in <strong>Konyaaltı</strong> if you want a long, lively beach strip with easy city access. Stay in <strong>Lara</strong> if you want a classic sandy-beach holiday feel and straightforward comfort. Choose <strong>Belek</strong> for a resort-first trip (especially golf and families). Choose <strong>Kemer</strong> for mountain-meets-sea scenery. Choose <strong>Side</strong> for a beach holiday with ancient-site atmosphere built in.</p>

<p>Antalya isn’t one single “resort”. It’s a whole coastline of different experiences: beaches, history, nature, and multiple bases that can feel like completely different holidays. The secret to loving Antalya is choosing an area that matches your daily rhythm.</p>

<p>Internal reads (placeholders):
<a href="/guide/where-to-stay-in-antalya-best-areas-guide-uk">Where to Stay in Antalya (Best Areas)</a> •
<a href="/guide/antalya-itinerary-4-days-uk-friendly-guide">Antalya Itinerary: 4 Days (UK-Friendly)</a> •
<a href="/guide/antalya-airport-to-city-centre-transport-guide">Antalya Airport to City: Transport Options</a> •
<a href="/guide/turkey-cash-or-card-travel-money-guide">Cash or Card in Turkey? (UK Guide)</a>
</p>

<hr/>

<!-- IMAGE_COVER_PLACEHOLDER -->

<h2>Pick your Antalya base in 60 seconds (UK-friendly)</h2>
<ul>
  <li><strong>“I want charming streets, history and atmosphere” →</strong> Kaleiçi (Old Town)</li>
  <li><strong>“I want beach + city energy together” →</strong> Konyaaltı</li>
  <li><strong>“I want an easy beach holiday base” →</strong> Lara</li>
  <li><strong>“We want a resort-first holiday (less planning)” →</strong> Belek</li>
  <li><strong>“I want dramatic scenery: mountains + sea” →</strong> Kemer</li>
  <li><strong>“I want beach days + ancient vibes nearby” →</strong> Side</li>
</ul>

<hr/>

<h2>Antalya areas at a glance (what each place feels like)</h2>

<div class="overflow-x-auto">
<table>
  <thead>
    <tr>
      <th>Area</th>
      <th>Best for</th>
      <th>Vibe</th>
      <th>Good to know</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Kaleiçi (Old Town)</strong></td>
      <td>Couples, first-timers, culture lovers</td>
      <td>Historic streets, harbour atmosphere</td>
      <td>More about character than “big beach resort”</td>
    </tr>
    <tr>
      <td><strong>Konyaaltı</strong></td>
      <td>Beach + city balance, groups</td>
      <td>Long beach strip, lively and practical</td>
      <td>Pebble beach in many sections; great for strolling</td>
    </tr>
    <tr>
      <td><strong>Lara</strong></td>
      <td>Easy beach holidays, families</td>
      <td>Sandy beach feel, straightforward comfort</td>
      <td>Good if you want “holiday mode” without overplanning</td>
    </tr>
    <tr>
      <td><strong>Belek</strong></td>
      <td>Resort-first trips, golf, families</td>
      <td>Relaxed, self-contained holiday style</td>
      <td>Ideal if you prefer staying mostly “in one place”</td>
    </tr>
    <tr>
      <td><strong>Kemer</strong></td>
      <td>Scenery lovers, outdoorsy travellers</td>
      <td>Mountains meet the sea</td>
      <td>Great for that “nature backdrop” feeling</td>
    </tr>
    <tr>
      <td><strong>Side</strong></td>
      <td>Beach + history atmosphere</td>
      <td>Holiday base with ancient-site energy nearby</td>
      <td>Good if you want “something extra” beyond the beach</td>
    </tr>
  </tbody>
</table>
</div>

<hr/>

<h2>1) Kaleiçi (Antalya Old Town): best for charm, history, and walkable evenings</h2>
<p>Kaleiçi is your pick if you want your holiday to feel like a story. Think narrow historic streets, a photogenic harbour area, and that feeling of stepping out and discovering something new without needing a full day plan.</p>

<p><strong>Choose Kaleiçi if…</strong></p>
<ul>
  <li>you love character neighbourhoods and you enjoy wandering</li>
  <li>you want a “romantic” base for evenings</li>
  <li>you prefer culture + atmosphere over resort-only routine</li>
</ul>

<p><strong>Kaleiçi isn’t your best match if…</strong></p>
<ul>
  <li>you want a big, wide, resort-style beach right outside your door every day</li>
  <li>you want a super-quiet “do nothing” base (you’ll probably prefer Belek or a calmer beach area)</li>
</ul>

<!-- IMAGE_KALEICI_PLACEHOLDER -->

<hr/>

<h2>2) Konyaaltı: best for beach + city life in one place</h2>
<p>Konyaaltı is one of the easiest bases for UK travellers who want a lively beach routine without being far from city comfort. It’s a long stretch, and it suits people who love “morning swim, afternoon café, evening stroll” days.</p>

<p><strong>Choose Konyaaltı if…</strong></p>
<ul>
  <li>you want a beach base with lots of day-to-day options nearby</li>
  <li>you like a slightly more “local city beach” atmosphere</li>
  <li>you want a practical base for a first Antalya trip</li>
</ul>

<p><strong>How to enjoy it best:</strong> build your trip around simple rhythms rather than trying to do ten separate day trips. Antalya is at its best when you mix a few “anchor moments” with relaxed beach time.</p>

<!-- IMAGE_KONYAALTI_PLACEHOLDER -->

<hr/>

<h2>3) Lara: best for a classic easy beach holiday feel</h2>
<p>Lara is a strong choice if you want your trip to feel straightforward: beach time, comfort, and a holiday flow that doesn’t require constant planning. It’s especially popular with families and anyone who wants “we land, we relax, we enjoy”.</p>

<p><strong>Choose Lara if…</strong></p>
<ul>
  <li>you want a classic beach holiday base</li>
  <li>you prefer “simple and comfortable” over “busy and exploratory”</li>
  <li>you’re travelling with family and want easy routines</li>
</ul>

<hr/>

<h2>4) Belek: best for resort-first trips (especially families and golf)</h2>
<p>Belek is ideal if you want a holiday where the main goal is relaxing in one base. It suits UK travellers who don’t want to plan every day and would rather have a “holiday bubble” with optional outings.</p>

<p><strong>Choose Belek if…</strong></p>
<ul>
  <li>your holiday goal is maximum rest with minimum decisions</li>
  <li>you’re travelling with family and want an easy setup</li>
  <li>you like golf/resort-style experiences</li>
</ul>

<hr/>

<h2>5) Kemer: best for mountains + sea scenery (nature-feel holiday)</h2>
<p>Kemer is where you go when the backdrop matters. If you love looking up and seeing dramatic nature while you’re near the coast, this is the kind of base that makes you feel like you’ve truly “gone away”.</p>

<p><strong>Choose Kemer if…</strong></p>
<ul>
  <li>you want scenery that feels different from a flat beach strip</li>
  <li>you like mixing relaxed days with a bit of outdoorsy energy</li>
</ul>

<!-- IMAGE_KEMER_PLACEHOLDER -->

<hr/>

<h2>6) Side: best for beach days with an “ancient world” atmosphere</h2>
<p>Side is a great pick if you want a beach holiday but you also want that extra layer of history-in-the-air. It’s a strong “couples or families” base because it balances relaxed days with easy cultural atmosphere.</p>

<p><strong>Choose Side if…</strong></p>
<ul>
  <li>you want beach time plus a strong sense of place</li>
  <li>you like the idea of culture without needing a full-on “history trip”</li>
</ul>

<hr/>

<h2>How to choose the right area (the method that never fails)</h2>
<p>Instead of choosing an area because it’s famous, choose it based on your <strong>default daily routine</strong>:</p>
<ul>
  <li><strong>If your dream day is “wander + coffee + pretty streets”:</strong> Kaleiçi</li>
  <li><strong>If your dream day is “beach + cafés + evening walk”:</strong> Konyaaltı</li>
  <li><strong>If your dream day is “swim + rest + repeat”:</strong> Lara or Belek</li>
  <li><strong>If your dream day is “sea + nature views”:</strong> Kemer</li>
  <li><strong>If your dream day is “beach + historic atmosphere”:</strong> Side</li>
</ul>

<hr/>

<h2>Trip length strategy (UK travellers)</h2>
<ul>
  <li><strong>3–4 nights:</strong> choose one base (Kaleiçi or Konyaaltı often works brilliantly) and keep your plan compact.</li>
  <li><strong>5–7 nights:</strong> one base still works; add 1–2 “anchor days” and keep the rest relaxed.</li>
  <li><strong>10+ nights:</strong> you can consider splitting bases (e.g., a few nights Kaleiçi + beach base), but only if you enjoy moving hotels.</li>
</ul>

<hr/>

<h2>Smart planning tips (positive, no stress)</h2>
<ul>
  <li><strong>Tip:</strong> Save your accommodation pin and the area name (Kaleiçi / Konyaaltı / Lara etc.). It makes arrivals smoother.</li>
  <li><strong>Tip:</strong> If you want to do “a lot”, choose a base that reduces daily travel time (usually Kaleiçi or Konyaaltı).</li>
  <li><strong>Tip:</strong> If you want maximum rest, choose a base that reduces daily decisions (often Lara or Belek).</li>
</ul>

<hr/>

<h2>FAQs</h2>

<h3>What’s the best area to stay in Antalya for first-timers from the UK?</h3>
<p>Kaleiçi if you want charm and history, Konyaaltı if you want a practical beach + city balance, or Lara if you want a simple beach holiday base.</p>

<h3>Where should couples stay?</h3>
<p>Kaleiçi for romance and atmosphere, or Lara/Konyaaltı if you want beach days with easy evenings.</p>

<h3>Where should families stay?</h3>
<p>Lara or Belek are popular “easy routine” choices. Konyaaltı can also work well if you want beach + city energy together.</p>

<h3>Is Konyaaltı a sandy beach?</h3>
<p>Konyaaltı is known for a long shoreline that’s often pebbly in many sections (with clear water), which many travellers enjoy for its scenery and promenade feel.</p>

<h3>Is Lara a major beach area?</h3>
<p>Yes — Lara is commonly listed alongside Konyaaltı as one of Antalya’s key beach areas, and many travellers choose it for a classic beach holiday feel.</p>

<h3>How do I choose between Kaleiçi and the beach areas?</h3>
<p>If you want “walkable historic evenings”, choose Kaleiçi. If you want “beach routine first”, choose Konyaaltı or Lara.</p>

<p><em>Last updated:</em> ${new Date().toLocaleDateString('en-GB')}</p>
`
};

async function addAntalyaWtsArticle() {
    const timestamp = Date.now();

    // --- Authentic Mode Prompts (Imagen 3) ---
    const imagesToGenerate = [
        {
            placeholder: '<!-- IMAGE_COVER_PLACEHOLDER -->',
            filename: `antalya-wts-cover-overview-${timestamp}.jpg`,
            prompt: "A panoramic view of Antalya's coastline featuring the sea, cliffs, and the city skyline with distant mountains. Sunny day. Authentic travel photography."
        },
        {
            placeholder: '<!-- IMAGE_KALEICI_PLACEHOLDER -->',
            filename: `antalya-kaleici-street-vibe-${timestamp}.jpg`,
            prompt: "Narrow cobbled street in Antalya Old Town (Kaleiçi) with historic Ottoman houses, bougainvillea, and warm sunlight. Authentic cultural travel photography."
        },
        {
            placeholder: '<!-- IMAGE_KONYAALTI_PLACEHOLDER -->',
            filename: `antalya-konyaalti-promenade-${timestamp}.jpg`,
            prompt: "Konyaaltı Beach promenade in Antalya. People walking, palm trees, blue sea, and mountains in the background. Relaxed holiday vibe. Authentic travel photography."
        },
        {
            placeholder: '<!-- IMAGE_KEMER_PLACEHOLDER -->',
            filename: `antalya-kemer-landscape-${timestamp}.jpg`,
            prompt: "Scenic view of Kemer coast near Antalya where pine-covered mountains meet the blue sea. Natural beauty. Authentic nature travel photography."
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
        title: { en: ARTICLE_DATA.title, tr: "Antalya'da Nerede Kalınır? En İyi Bölgeler ve Otel Önerileri" },
        meta_description: { en: ARTICLE_DATA.meta_description, tr: "Antalya'da nerede kalınır? Kaleiçi, Konyaaltı, Lara, Belek, Kemer ve Side bölgelerinin karşılaştırması ve tavsiyeler." },
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
        console.log("✅ Antalya Where to Stay Article Added Successfully with Imagen 3 Images!");
    }
}

addAntalyaWtsArticle();
