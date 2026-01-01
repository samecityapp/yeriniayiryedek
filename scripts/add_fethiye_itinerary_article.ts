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
    slug: 'fethiye-itinerary-3-days-uk-friendly-plan',
    title: 'Fethiye Itinerary: 3 Days (UK-Friendly Plan Without Rushing)',
    meta_description: 'A practical 3-day Fethiye itinerary for UK travellers: the best bases, beach days (Ölüdeniz), boat day options, Kayaköy, Çalış sunsets and easy local transport tips.',
    content: `
<h1>Fethiye Itinerary (3 Days): A UK Traveller’s Plan That Actually Feels Like a Holiday</h1>

<p><strong>Quick answer:</strong> The best 3-day Fethiye plan is <strong>one “town + vibe” day</strong>, <strong>one “Ölüdeniz / beach” day</strong>, and <strong>one “boat day or Kayaköy / nature” day</strong>. The secret is not stuffing everything in — it’s choosing the right base and building one “hero” experience per day.</p>

<p>If you haven’t picked your base yet, start here:
<a href="/guide/where-to-stay-in-fethiye-best-areas-guide">Where to Stay in Fethiye (Best Areas: Ölüdeniz, Çalış, Centre, Kayaköy, Faralya)</a>.
For money planning:
<a href="/guide/cash-or-card-in-turkey">Cash or Card in Turkey? (UK Guide)</a>.
For safety basics:
<a href="/guide/is-turkey-safe-to-visit-uk-travel-checklist">Is Turkey Safe to Visit? (UK Checklist)</a>.
</p>

<hr/>

<!-- IMAGE_COVER_PLACEHOLDER -->

<h2>Before you go: choose your base (this decides your whole trip)</h2>
<p>Fethiye is not “one place” — it’s a region with different vibes. For a 3-day trip, choose one base and do day trips from it.</p>

<ul>
  <li><strong>Fethiye Centre:</strong> best if you want boat trips, restaurants, and easy day tours.</li>
  <li><strong>Çalış:</strong> best if you want calmer evenings, a long promenade and sunsets.</li>
  <li><strong>Ölüdeniz / Hisarönü / Ovacık:</strong> best if beach days and the lagoon are the main reason you came.</li>
</ul>

<p><strong>Rule for 3 days:</strong> Don’t change accommodation mid-trip. You lose too much time.</p>

<hr/>

<h2>How to get around (no-car friendly)</h2>
<p>You can do this itinerary without a car. The common approach is:</p>
<ul>
  <li><strong>Local minibuses (dolmuş)</strong> for area-to-area hops (easy and cheap in practice).</li>
  <li><strong>Short taxis</strong> for the “last 10 minutes” when you’re tired or carrying beach gear.</li>
  <li><strong>Boat tours</strong> if you want a full day that requires zero logistics.</li>
</ul>

<p><strong>No guesswork policy:</strong> Transport routes and timetables can change by season. If you’re relying on public transport for a specific connection, confirm the current schedule on the day (your accommodation can help, or use official/local operator info).</p>

<hr/>

<h2>The best 3-day Fethiye itinerary (UK-friendly pacing)</h2>

<h3>Day 1 — Fethiye “settle in” day: marina vibes, old town feel, and a sunset plan</h3>
<p><strong>Goal:</strong> arrive, get your bearings, and enjoy Fethiye without turning day one into a mission.</p>

<h4>Morning / early afternoon: arrive and keep it light</h4>
<ul>
  <li>Check in and do a <strong>short orientation walk</strong> around your base area.</li>
  <li>If you’re in <strong>Fethiye Centre</strong>, aim for a relaxed waterfront/marina stroll and a simple lunch.</li>
  <li>If you’re in <strong>Çalış</strong>, start with the promenade so you immediately feel the area’s rhythm.</li>
</ul>

<!-- IMAGE_MARINA_PLACEHOLDER -->

<h4>Late afternoon: “choose one” vibe activity</h4>
<p>Pick one depending on your mood:</p>
<ul>
  <li><strong>Option A (easy):</strong> café-hopping + a slow wander through local shopping streets.</li>
  <li><strong>Option B (views):</strong> a viewpoint/sunset spot (ask locally for the simplest one that’s open and accessible).</li>
  <li><strong>Option C (food-first):</strong> make day one about dinner — choose a place you’ll actually enjoy rather than chasing a “famous” spot.</li>
</ul>

<h4>Evening: choose your sunset style</h4>
<ul>
  <li><strong>Çalış-style:</strong> long sunset walk + dinner with sea air (classic and low-stress).</li>
  <li><strong>Centre-style:</strong> marina dinner + early night if you’re doing a boat day tomorrow.</li>
</ul>

<p><strong>UK traveller tip:</strong> don’t try to “see Ölüdeniz” on day one unless you have loads of spare time. Save it for a full beach day so it feels special.</p>

<hr/>

<h3>Day 2 — Ölüdeniz / Blue Lagoon day (the iconic Fethiye postcard)</h3>
<p><strong>Goal:</strong> treat this as a proper beach day, not a rushed photo-stop.</p>

<h4>Morning: go early for comfort</h4>
<ul>
  <li>Arrive in Ölüdeniz earlier in the day for a smoother start.</li>
  <li>Do one main beach focus: <strong>lagoon time</strong> or <strong>open beach time</strong> (depending on what you prefer that day).</li>
</ul>

<!-- IMAGE_LAGOOON_PLACEHOLDER -->

<h4>Midday: decide whether you’re “activity people”</h4>
<p>Pick one:</p>
<ul>
  <li><strong>Option A (relax):</strong> stay in beach mode — swim, lunch, shade, repeat.</li>
  <li><strong>Option B (signature experience):</strong> if paragliding is on your bucket list, this is the region where people typically plan it — but only do it with licensed, reputable providers and if conditions are suitable that day (operators will confirm go/no-go).</li>
</ul>

<h4>Afternoon: protect your energy</h4>
<ul>
  <li>Beach day success = leaving before you’re exhausted.</li>
  <li>Back at base: shower, slow dinner, early sleep if you’re doing a boat day tomorrow.</li>
</ul>

<p><strong>Money note:</strong> beach days involve small purchases (drinks/snacks/tips). Carry a bit of TRY cash and keep your card separate. Use the “pay in local currency” rule when paying by card.
<a href="/guide/cash-or-card-in-turkey">Cash or Card in Turkey? (UK Guide)</a></p>

<hr/>

<h3>Day 3 — Choose your “hero day”: Boat Day OR Kayaköy + nature</h3>
<p>Day 3 is where most travellers either have their best day… or waste time deciding what to do. Don’t drift. Choose one track:</p>

<h4>Track 1: Boat day (best if you want maximum holiday, minimal planning)</h4>
<p><strong>Why UK travellers love this:</strong> you pay once, logistics are handled, and you see bays you’d never reach easily by land.</p>

<ul>
  <li><strong>Morning:</strong> start early; bring sun protection and something light to cover up.</li>
  <li><strong>Day structure:</strong> swimming stops + relaxed lunch vibes (exact stops vary by operator and sea conditions).</li>
  <li><strong>Choose this track if:</strong> you want a day that feels like “I came to the Mediterranean”.</li>
</ul>

<p><strong>Legal/accuracy note:</strong> routes and inclusions vary by boat operator and season, so don’t assume every tour includes the same bays or meals — confirm the itinerary before paying.</p>

<!-- IMAGE_BOAT_PLACEHOLDER -->

<h4>Track 2: Kayaköy + slow countryside vibes (best if you want character and quiet)</h4>
<p><strong>Why it’s worth it:</strong> Kayaköy feels completely different from the beach zones — calmer, more atmospheric, and great for travellers who like “places with a story”.</p>

<ul>
  <li><strong>Morning:</strong> go early and take it slow; wear comfortable walking shoes.</li>
  <li><strong>Midday:</strong> lunch in a quiet spot (keep it simple; you’re here for the atmosphere).</li>
  <li><strong>Afternoon (optional):</strong> pair it with a beach stop on the way back <em>only if</em> it doesn’t turn into a stressful multi-stop sprint.</li>
</ul>

<h4>Track 3: Faralya / Kabak (nature-first day)</h4>
<p><strong>Choose this only if:</strong> you genuinely want a nature-led day and you’re okay with a more remote feel. This is less “classic beach resort day” and more “views, fresh air, slow pace”.</p>

<ul>
  <li><strong>Plan:</strong> go for one viewpoint / short walk rather than trying to “do everything”.</li>
  <li><strong>Pack:</strong> water, sun protection, and layers if you’ll stay until evening.</li>
</ul>

<p><strong>Tip:</strong> If you have only 3 days, don’t do both a boat day and a long remote nature day. Pick the one that matches your personality.</p>

<hr/>

<h2>Two alternative 3-day plans (pick your travel style)</h2>

<h3>Option A: “Beach-first” 3 days (best for pure holiday)</h3>
<ul>
  <li><strong>Day 1:</strong> settle-in + sunset (Çalış or centre)</li>
  <li><strong>Day 2:</strong> full Ölüdeniz / lagoon beach day</li>
  <li><strong>Day 3:</strong> boat day (minimum planning, maximum holiday)</li>
</ul>

<h3>Option B: “Balanced explorer” 3 days (best for variety)</h3>
<ul>
  <li><strong>Day 1:</strong> Fethiye centre vibe + food + light walking</li>
  <li><strong>Day 2:</strong> Ölüdeniz day (iconic scenery)</li>
  <li><strong>Day 3:</strong> Kayaköy + a calm beach stop if energy allows</li>
</ul>

<hr/>

<h2>Common mistakes (and the fixes)</h2>
<ul>
  <li><strong>Mistake:</strong> staying far from your main priority. <strong>Fix:</strong> choose base by what you’ll do most days.</li>
  <li><strong>Mistake:</strong> trying to do 6 stops in 3 days. <strong>Fix:</strong> one “hero” plan per day.</li>
  <li><strong>Mistake:</strong> leaving decisions until lunchtime. <strong>Fix:</strong> pick your Day 3 track the night before.</li>
  <li><strong>Mistake:</strong> relying on random transport assumptions. <strong>Fix:</strong> confirm routes/times locally because seasonality affects services.</li>
</ul>

<hr/>

<h2>Copy/paste checklist (UK travellers)</h2>
<ul>
  <li><strong>Choose your base:</strong> Centre / Çalış / Ölüdeniz-Hisarönü</li>
  <li><strong>Day 2:</strong> make Ölüdeniz a full beach day (don’t rush it)</li>
  <li><strong>Day 3:</strong> pick ONE: boat day OR Kayaköy OR nature day</li>
  <li><strong>Money:</strong> carry small TRY cash + card; pay in local currency when asked</li>
  <li><strong>Comfort:</strong> walking shoes + sun protection + power bank</li>
</ul>

<hr/>

<h2>FAQs</h2>

<h3>Is 3 days enough for Fethiye?</h3>
<p>Yes, if you keep it focused. The best formula is one town/vibe day, one Ölüdeniz day, and one “hero day” (boat or Kayaköy/nature).</p>

<h3>Can I do this itinerary without a car?</h3>
<p>Yes. Many travellers use local minibuses (dolmuş) and short taxis for the last leg. Confirm current routes and timetables locally because they can change with the season.</p>

<h3>Should I stay in Fethiye centre or Ölüdeniz?</h3>
<p>Stay in Ölüdeniz/Hisarönü if the lagoon and beach days are your main priority. Stay in Fethiye centre if you want a practical hub for tours, boat trips and eating out.</p>

<h3>What’s the best “one day” experience in Fethiye?</h3>
<p>For many visitors, a boat day is the easiest high-reward experience because it bundles scenery and swim stops into one simple plan — but confirm each operator’s route and inclusions.</p>

<p><em>Last updated:</em> ${new Date().toLocaleDateString('en-GB')}</p>
`
};

async function addFethiyeItineraryArticle() {
    const timestamp = Date.now();

    // --- Authentic Mode Prompts (Imagen 3) ---
    const imagesToGenerate = [
        {
            placeholder: '<!-- IMAGE_COVER_PLACEHOLDER -->',
            filename: `fethiye-itinerary-cover-${timestamp}.jpg`,
            prompt: "A relaxed view of Fethiye marina coastline with boats. Sunny morning light. Authentic travel photography. Calm atmosphere."
        },
        {
            placeholder: '<!-- IMAGE_MARINA_PLACEHOLDER -->',
            filename: `fethiye-marina-walk-${timestamp}.jpg`,
            prompt: "People walking along the Fethiye seaside promenade with palm trees and boats in the background. Sunset lighting. Authentic honest travel shot."
        },
        {
            placeholder: '<!-- IMAGE_LAGOOON_PLACEHOLDER -->',
            filename: `fethiye-oludeniz-swim-${timestamp}.jpg`,
            prompt: "People swimming in the crystal clear turquoise water of Oludeniz Blue Lagoon. Eye level perspective from water. Authentic fun holiday vibe."
        },
        {
            placeholder: '<!-- IMAGE_BOAT_PLACEHOLDER -->',
            filename: `fethiye-boat-trip-${timestamp}.jpg`,
            prompt: "A traditional wooden gulet boat anchored in a small turquoise bay near Fethiye. People jumping off. Sunny summer day. Authentic travel experience."
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
        title: { en: ARTICLE_DATA.title, tr: "Fethiye 3 Günlük Gezi Planı: Sıkışmadan Gezme Rehberi" },
        meta_description: { en: ARTICLE_DATA.meta_description, tr: "Fethiye'de 3 gün nasıl geçirilir? Ölüdeniz, tekne turu, Çalış gün batımı ve pratik ulaşım ipuçlarıyla örnek rota." },
        content: { en: finalContent, tr: "<p>Çeviri yakında...</p>" },
        location: { en: 'Fethiye', tr: 'Fethiye' },
        cover_image_url: coverImageUrl,
        published_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    }, { onConflict: 'slug' });

    if (error) {
        console.error("❌ DB Insert Failed:", error);
    } else {
        console.log("✅ Fethiye 3-Day Itinerary Article Added Successfully with Imagen 3 Images!");
    }
}

addFethiyeItineraryArticle();
