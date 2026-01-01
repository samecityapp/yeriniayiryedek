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
    let baseDelay = 5000; // 5 seconds start

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
                const errText = await response.text();
                // If Rate Limit, retry
                if (response.status === 429) {
                    retries++;
                    const delay = baseDelay * (2 ** (retries - 1));
                    console.warn(`🔄 Rate limited (429). Retrying in ${delay / 1000}s... (Attempt ${retries}/${maxRetries})`);
                    await new Promise(res => setTimeout(res, delay));
                    continue;
                }
                throw new Error(`Vertex API Error: ${response.status} - ${errText}`);
            }

            const data = await response.json();

            if (!data.predictions || data.predictions.length === 0) {
                console.error("❌ Vertex AI Response Error.", JSON.stringify(data, null, 2));
                throw new Error('No predictions returned');
            }

            if (!data.predictions[0].bytesBase64Encoded) {
                console.error("❌ Missing bytesBase64Encoded:", JSON.stringify(data.predictions[0], null, 2));
                throw new Error('Invalid prediction structure');
            }

            const base64Image = data.predictions[0].bytesBase64Encoded;
            const buffer = Buffer.from(base64Image, 'base64');

            const localPath = path.join(ARTICLES_IMAGE_DIR, filename);
            const publicUrl = `/images/articles/${filename}`;

            fs.writeFileSync(localPath, buffer);
            console.log(`✅ Saved: ${localPath}`);

            return publicUrl;
        } catch (error) {
            if (retries >= maxRetries - 1) {
                console.error("❌ Generation Failed after retries:", error);
                return null;
            }
            console.error("❌ Generation Failed:", error);
            return null;
        }
    }
    return null;
}

const ARTICLE_DATA = {
    slug: 'turkey-itinerary-7-days-first-time',
    title: 'Turkey Itinerary (7 Days): The Best First-Time Plan for UK Travellers (Istanbul + Coast)',
    meta_description: 'A practical 7-day Turkey itinerary for UK first-timers: Istanbul + coast. Day-by-day plan, base choices, pacing tips and common mistakes.',
    content: `
<h1>Turkey Itinerary (7 Days): The Best First-Time Plan for UK Travellers (Istanbul + Coast)</h1>

<p><strong>Quick answer:</strong> The most reliable first-timer plan is <strong>3 days in Istanbul + 4 days on the coast</strong>. It gives you culture, food and iconic sights <em>plus</em> proper holiday relaxation. The key is not trying to “see all of Turkey” in one week — it’s choosing <strong>one coastal base</strong> and doing it well.</p>

<p>If you haven’t picked your base areas yet, start here first:
<a href="/guide/where-to-stay-in-turkey-first-time-guide">Where to Stay in Turkey (UK First-Timer Area Guide)</a>.
For Istanbul neighbourhood choice:
<a href="/guide/where-to-stay-in-istanbul-best-areas-guide">Where to Stay in Istanbul</a>.
And for season comfort:
<a href="/guide/best-time-to-visit-turkey">Best Time to Visit Turkey (Month-by-Month)</a>.
</p>

<hr/>

<!-- IMAGE_COVER_PLACEHOLDER -->

<h2>Before you start: choose your “coast style” (this changes everything)</h2>
<p>Pick <strong>one</strong> coastal base that matches your vibe:</p>
<ul>
  <li><strong>Easy beach holiday:</strong> Antalya area
    (<a href="/guide/where-to-stay-in-antalya-best-areas-guide">Where to Stay in Antalya</a>)</li>
  <li><strong>Scenery + bays + boat days:</strong> Fethiye area
    (<a href="/guide/where-to-stay-in-fethiye-best-areas-guide">Where to Stay in Fethiye</a>)</li>
  <li><strong>Aegean vibe + evenings out:</strong> Bodrum area
    (<a href="/guide/where-to-stay-in-bodrum-best-areas-guide">Where to Stay in Bodrum</a>)</li>
</ul>

<p><strong>Rule:</strong> Don’t try to do Antalya + Fethiye + Bodrum in one week. You’ll lose your holiday to packing and transfers.</p>

<hr/>

<h2>The best 7-day Turkey itinerary (low-stress, first-time friendly)</h2>

<h3>Day 1 — Arrive in Istanbul + settle into your neighbourhood</h3>
<ul>
  <li>Check in, then do a <strong>light first day</strong>: a neighbourhood walk, a simple dinner, early night if you’ve travelled far.</li>
  <li><strong>Goal:</strong> don’t turn arrival day into a checklist marathon.</li>
</ul>

<p><strong>Tip:</strong> Choose your Istanbul base based on how you like to spend evenings (quiet vs lively):
<a href="/guide/where-to-stay-in-istanbul-best-areas-guide">Where to Stay in Istanbul</a>.
</p>

<h3>Day 2 — Classic sights day (one “main zone” only)</h3>
<p>Pick one major sightseeing zone and do it properly. Don’t zig-zag across the city.</p>
<ul>
  <li><strong>Morning:</strong> historic sights cluster</li>
  <li><strong>Afternoon:</strong> slow pace, cafés, and one extra sight if energy is good</li>
  <li><strong>Evening:</strong> dinner in your base area (protect your sleep)</li>
</ul>

<p><strong>Goal:</strong> a great day, not a perfect spreadsheet day.</p>

<h3>Day 3 — Neighbourhood + food + views (the “Istanbul vibe” day)</h3>
<ul>
  <li>Choose a neighbourhood known for cafés, street life and strolling.</li>
  <li>Add one viewpoint or “wow moment” so the day feels special.</li>
  <li><strong>Night:</strong> pack lightly for tomorrow if you’re flying to the coast.</li>
</ul>

<!-- IMAGE_ISTANBUL_PLACEHOLDER -->

<p><strong>Tip:</strong> Istanbul works best when you leave space for wandering — it’s how you find the moments you remember.</p>

<h3>Day 4 — Travel to the coast + switch into holiday mode</h3>
<p>This is a transition day. Keep it simple:</p>
<ul>
  <li>Travel to your chosen coastal base.</li>
  <li>Do a <strong>short walk</strong>, a relaxed meal, and an early night.</li>
</ul>

<p>Pick your base area carefully (it shapes your whole coastal experience):</p>
<ul>
  <li><a href="/guide/where-to-stay-in-antalya-best-areas-guide">Where to Stay in Antalya</a></li>
  <li><a href="/guide/where-to-stay-in-fethiye-best-areas-guide">Where to Stay in Fethiye</a></li>
  <li><a href="/guide/where-to-stay-in-bodrum-best-areas-guide">Where to Stay in Bodrum</a></li>
</ul>

<h3>Day 5 — Beach day (make it properly relaxing)</h3>
<ul>
  <li>Do a true “holiday day”: beach/pool, slow lunch, zero guilt.</li>
  <li><strong>Optional:</strong> one short activity (sunset viewpoint or calm evening walk).</li>
</ul>

<p><strong>First-time UK traveller tip:</strong> Don’t waste the first full beach day deciding “where should we go?” Choose the simplest option and enjoy it.</p>

<h3>Day 6 — One excursion day (choose ONE signature experience)</h3>
<p>Pick one “hero experience” based on your base:</p>
<ul>
  <li><strong>Antalya area:</strong> choose one major day trip or one “nature + scenery” day</li>
  <li><strong>Fethiye area:</strong> a boat day or bays-focused day is often the signature move</li>
  <li><strong>Bodrum area:</strong> a beach-hopping day or a relaxed “town + evening” plan works well</li>
</ul>

<p><strong>Rule:</strong> One excursion day is enough for a 7-day first trip. Too many day trips turns your holiday into commuting.</p>

<!-- IMAGE_COAST_PLACEHOLDER -->

<h3>Day 7 — Slow morning + wrap-up + fly home (or one last calm day)</h3>
<ul>
  <li>Slow breakfast, short walk, last swim if possible.</li>
  <li>Keep the final day flexible and low-stress.</li>
</ul>

<hr/>

<h2>Alternative 7-day itineraries (choose based on your travel style)</h2>

<h3>Option A: Istanbul (4) + coast (3) — city lovers</h3>
<p>If you love cities more than beaches, shift one day from the coast to Istanbul. This works best outside peak heat when you’ll enjoy walking and neighbourhood time.</p>

<h3>Option B: Istanbul (2) + coast (5) — pure relaxation</h3>
<p>If your main goal is beach, this is the simplest switch-off plan. Keep Istanbul short and treat it as a “taster”.</p>

<h3>Option C: Istanbul (3) + Cappadocia (2) + coast (2) — only if you’re fast-moving</h3>
<p>This is a more ambitious plan and can feel rushed. If you do it, keep transfers tight and accept that you won’t “do everything”. For Cappadocia base choice:
<a href="/guide/where-to-stay-in-cappadocia-best-areas-guide">Where to Stay in Cappadocia</a>.
</p>

<hr/>

<!-- IMAGE_CAPPADOCIA_PLACEHOLDER -->

<h2>How to avoid the 5 biggest first-time mistakes</h2>
<ul>
  <li><strong>Mistake 1: Too many bases.</strong> Fix: max two bases (Istanbul + one coast) for a first trip.</li>
  <li><strong>Mistake 2: Planning Istanbul like a tiny city.</strong> Fix: one main zone per day, no zig-zagging.</li>
  <li><strong>Mistake 3: Overloading excursions.</strong> Fix: one “hero day” is enough in a week.</li>
  <li><strong>Mistake 4: Choosing the coast without choosing the area.</strong> Fix: pick the base area first:
    <a href="/guide/where-to-stay-in-antalya-best-areas-guide">Antalya</a>,
    <a href="/guide/where-to-stay-in-fethiye-best-areas-guide">Fethiye</a>,
    <a href="/guide/where-to-stay-in-bodrum-best-areas-guide">Bodrum</a>.</li>
  <li><strong>Mistake 5: Ignoring comfort/season reality.</strong> Fix: plan month-by-month:
    <a href="/guide/best-time-to-visit-turkey">Best Time to Visit Turkey</a>.</li>
</ul>

<hr/>

<h2>Copy/paste planning checklist (UK travellers)</h2>
<ul>
  <li><strong>Choose 2 bases max:</strong> Istanbul + one coastal base.</li>
  <li><strong>Pick your coastal style:</strong> Antalya (easy), Fethiye (scenery), Bodrum (Aegean vibe).</li>
  <li><strong>Plan Istanbul by zones:</strong> one main area per day.</li>
  <li><strong>Keep excursions minimal:</strong> one “hero day” only.</li>
  <li><strong>Money plan:</strong>
    <a href="/guide/cash-or-card-in-turkey">Cash or Card in Turkey?</a></li>
  <li><strong>Safety basics:</strong>
    <a href="/guide/is-turkey-safe-to-visit-uk-travel-checklist">Is Turkey Safe to Visit? (UK Checklist)</a></li>
</ul>

<hr/>

<h2>FAQs</h2>

<h3>Is 7 days enough for Turkey?</h3>
<p>Yes, if you keep it focused. The best first-time plan is Istanbul + one coastal base. Trying to cover multiple coastal regions in one week usually feels rushed.</p>

<h3>What’s the best 7-day Turkey itinerary for first-timers?</h3>
<p>For most UK travellers: 3 days Istanbul + 4 days on the coast. It’s balanced and low-stress, and it gives you both iconic culture and real holiday time.</p>

<h3>Do I need a car for this itinerary?</h3>
<p>Not for a first trip. Many travellers do Istanbul + coast using flights/transfers and local transport. A car only helps if you’re doing a road-trip style route.</p>

<h3>Which coast is best for a first trip: Antalya, Fethiye or Bodrum?</h3>
<p>Choose based on your vibe: Antalya for “easy mode”, Fethiye for scenery and bays, Bodrum for Aegean atmosphere and evenings out. Use the area guides to pick the right base.</p>

<p><em>Last updated:</em> ${new Date().toLocaleDateString('en-GB')}</p>
`
};

async function addItineraryArticle() {
    const timestamp = Date.now();

    // --- Authentic Mode Prompts (Imagen 3) ---
    const imagesToGenerate = [
        {
            placeholder: '<!-- IMAGE_COVER_PLACEHOLDER -->',
            filename: `itinerary-cover-${timestamp}.jpg`,
            prompt: "A split composition travel photo showing Istanbul (Galata Tower view) on left and a Turquoise coast beach on right. Authentic travel inspiration style. Warm sunlight. Realistic colors."
        },
        {
            placeholder: '<!-- IMAGE_ISTANBUL_PLACEHOLDER -->',
            filename: `itinerary-istanbul-ferry-${timestamp}.jpg`,
            prompt: "A candid shot from the back of an Istanbul ferry in Bosphorus. Seagulls flying. Silhouette of mosques in background. Golden hour light. Authentic commuter/travel moment."
        },
        {
            placeholder: '<!-- IMAGE_COAST_PLACEHOLDER -->',
            filename: `itinerary-coast-relax-${timestamp}.jpg`,
            prompt: "A relaxed point-of-view shot from a sun lounger or seaside cafe in Turkey. Cold drink, book, blue sea in background. Authentic holiday relaxation vibe. Shallow depth of field."
        },
        {
            placeholder: '<!-- IMAGE_CAPPADOCIA_PLACEHOLDER -->',
            filename: `itinerary-cappadocia-alt-${timestamp}.jpg`,
            prompt: "A wide shot of hiking in Cappadocia valleys. People walking on a trail. Unique rock formations. Authentic adventure photography. Early morning light."
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

    const { error } = await supabase.from('articles').upsert({
        slug: ARTICLE_DATA.slug,
        title: { en: ARTICLE_DATA.title, tr: "Türkiye Gezi Rotası (7 Gün): İlk Kez Gelecekler İçin Plan" },
        meta_description: { en: ARTICLE_DATA.meta_description, tr: "Türkiye'ye ilk kez gelecekler için 7 günlük ideal İstanbul ve sahil rotası." },
        content: { en: finalContent, tr: "<p>Çeviri yakında...</p>" },
        cover_image_url: coverImageUrl,
        published_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    }, { onConflict: 'slug' });

    if (error) {
        console.error("❌ DB Insert Failed:", error);
    } else {
        console.log("✅ Itinerary Article Added Successfully with Imagen 3 Images!");
    }
}

addItineraryArticle();
