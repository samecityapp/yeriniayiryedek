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
    slug: 'antalya-itinerary-4-days-uk-friendly-guide',
    title: 'Antalya Itinerary: 4 Days for UK Travellers (Easy Plan, Best Areas)',
    meta_description: 'A practical 4-day Antalya itinerary for UK travellers: Kaleiçi Old Town, Konyaaltı beach time, waterfalls, ancient ruins day trip logic, and a smooth arrival plan—no hotel names.',
    content: `
<h1>Antalya Itinerary: 4 Days for UK Travellers (A Smooth Plan That Feels Like a Holiday)</h1>

<p><strong>Quick answer:</strong> Spend Day 1 in <strong>Kaleiçi (Old Town)</strong> for atmosphere and an easy first day. Do Day 2 as a <strong>beach + city</strong> day (Konyaaltı rhythm). Use Day 3 for a <strong>one big day trip</strong> (ancient sites OR nature, not both). Keep Day 4 flexible: a second beach moment, a short waterfall stop, and a final “Antalya glow” evening.</p>

<p>Internal reads (placeholders):
<a href="/guide/where-to-stay-in-antalya-best-areas-guide-uk">Where to Stay in Antalya (Best Areas)</a> •
<a href="/guide/antalya-airport-to-city-centre-transport-guide">Antalya Airport to City Centre: Transport Options</a> •
<a href="/guide/antalya-old-town-kaleici-guide">Kaleiçi (Old Town): What to Know</a> •
<a href="/guide/konyaalti-beach-city-guide">Konyaaltı: Beach + City Guide</a> •
<a href="/guide/best-day-trips-from-antalya-uk-guide">Best Day Trips from Antalya (No Hotel Names)</a>
</p>

<hr/>

<!-- IMAGE_COVER_PLACEHOLDER -->

<h2>Before you start: 5 rules that make Antalya feel effortless</h2>
<ul>
  <li><strong>Rule #1: Plan by “day themes”, not by a huge checklist.</strong> Antalya is best when each day has one main focus.</li>
  <li><strong>Rule #2: Build in “holiday time”.</strong> If every hour is scheduled, you’ll miss the relaxed magic.</li>
  <li><strong>Rule #3: Choose one base that matches your rhythm.</strong> Old Town charm (Kaleiçi), beach + city (Konyaaltı), easy beach feel (Lara).</li>
  <li><strong>Rule #4: Keep one day trip maximum.</strong> One memorable excursion beats three rushed ones.</li>
  <li><strong>Rule #5: Put your best walking in the first half of the day.</strong> Then keep afternoons lighter and more beach-friendly.</li>
</ul>

<hr/>

<h2>Where to base yourself for this itinerary</h2>
<p>This itinerary works from multiple bases, but each base changes the “feel”:</p>
<ul>
  <li><strong>Kaleiçi (Old Town):</strong> best for romance, atmosphere, walkable evenings.</li>
  <li><strong>Konyaaltı:</strong> best for beach days with city energy and a long promenade vibe.</li>
  <li><strong>Lara:</strong> best for a classic beach-first routine with comfort.</li>
</ul>

<p>If you haven’t chosen yet, read:
<a href="/guide/where-to-stay-in-antalya-best-areas-guide-uk">Where to Stay in Antalya (Best Areas)</a>.</p>

<hr/>

<h2>Day 1 — Kaleiçi (Old Town) + Harbour Atmosphere (the perfect “landing day”)</h2>
<p>Your first day should feel easy and beautiful. Kaleiçi is the ideal “UK arrival day” because you can just wander, eat well, and let Antalya introduce itself without a long commute.</p>

<!-- IMAGE_DAY1_PLACEHOLDER -->

<h3>Morning: A gentle Kaleiçi wander (no strict route)</h3>
<ul>
  <li>Start with a slow walk through the historic streets.</li>
  <li>Let yourself drift: Antalya’s charm shows up in details, not in rushing.</li>
  <li>Stop for a coffee or fresh juice whenever you feel like it.</li>
</ul>

<h3>Midday: Harbour moment + sea-view pause</h3>
<p>Antalya feels especially “Antalya” when you’re near the water. Do a relaxed harbour-area pause and take it in. Keep it simple: good views, good vibes.</p>

<h3>Afternoon: Choose one small “extra” (don’t stack five)</h3>
<ul>
  <li><strong>Option A:</strong> A relaxed café stop and shopping for small gifts.</li>
  <li><strong>Option B:</strong> A short museum-style stop if you love context (keep it light).</li>
  <li><strong>Option C:</strong> A scenic viewpoint moment, then back to wandering.</li>
</ul>

<h3>Evening: The Kaleiçi dinner plan (simple but perfect)</h3>
<p>Make your first evening all about atmosphere. Pick a place you like visually, order slowly, and enjoy the “holiday switch-on” feeling. If you’re jet-lagged, embrace an early night—Day 2 will be better for it.</p>

<hr/>

<h2>Day 2 — Konyaaltı beach rhythm + city comfort</h2>
<p>This day is designed to feel like an actual holiday (not a history exam). Konyaaltı works brilliantly for a long, easy beach stretch with cafés, strolling, and a relaxed pace.</p>

<!-- IMAGE_DAY2_PLACEHOLDER -->

<h3>Morning: Beach-first (arrive earlier for a calmer vibe)</h3>
<ul>
  <li>Bring: water, SPF, a hat, and something light to snack on.</li>
  <li>Do a “swim → rest → swim” rhythm rather than constant moving.</li>
</ul>

<h3>Midday: A simple lunch plan</h3>
<p>Keep lunch close to where you are. The whole point of Day 2 is to stay in “low effort, high enjoyment” mode.</p>

<h3>Afternoon: Add one short, easy city moment</h3>
<ul>
  <li><strong>Option A:</strong> Back to Kaleiçi for a second wander (you’ll notice new details).</li>
  <li><strong>Option B:</strong> A short shopping/café stop in a modern area.</li>
  <li><strong>Option C:</strong> A scenic coastal walk and photos, then relax.</li>
</ul>

<h3>Evening: Golden-hour stroll + dinner</h3>
<p>Antalya evenings are made for strolling. Keep it calm and enjoyable—this is the day you’ll sleep like a champion.</p>

<hr/>

<h2>Day 3 — Choose ONE “big day”: Ancient sites OR nature (not both)</h2>
<p>Day 3 is where many travellers overdo it. Don’t. Choose one “big story” and commit to it.</p>

<!-- IMAGE_DAY3_PLACEHOLDER -->

<h3>Option A: The Ancient Sites Day (culture without stress)</h3>
<p>If you want that “I stood in a real ancient place” feeling, choose one core cluster of sites and do it properly.</p>

<ul>
  <li><strong>Plan style:</strong> one main archaeological site + one supporting stop</li>
  <li><strong>Best for:</strong> first-time visitors who want a meaningful history day</li>
  <li><strong>How to enjoy it:</strong> go early, walk slowly, and don’t turn it into a sprint</li>
</ul>

<p><strong>Pro move:</strong> Pack a light layer and water, and plan a relaxed meal afterwards. Your day should feel rich, not rushed.</p>

<h3>Option B: The Nature Day (waterfalls + viewpoints + pure chill)</h3>
<p>If you want a calm day that still feels “special”, go nature-first. Antalya’s region has beautiful nature moments that pair perfectly with a relaxed holiday rhythm.</p>

<ul>
  <li><strong>Plan style:</strong> one waterfall stop + one scenic viewpoint moment + a slow lunch</li>
  <li><strong>Best for:</strong> families, couples, and anyone who wants a “refresh” day</li>
  <li><strong>How to enjoy it:</strong> treat it like a picnic-day energy, not a checklist</li>
</ul>

<h3>Option C (if you’re staying longer): The “sea day” upgrade</h3>
<p>If you love being on the water, Day 3 can become your “boat day” (depending on season and what you enjoy). Keep it simple: choose a reputable operator, go for comfort, and let the sea do the work.</p>

<hr/>

<h2>Day 4 — Flexible finale: one last highlight + a calm goodbye</h2>
<p>Day 4 is the “leave it beautiful” day. You want to go home feeling refreshed—not exhausted.</p>

<h3>Morning: Repeat your favourite vibe</h3>
<ul>
  <li>If you loved Kaleiçi: do one more wander with a coffee.</li>
  <li>If you loved the beach: do one final swim and slow morning.</li>
  <li>If you loved history: do a short second cultural stop (keep it light).</li>
</ul>

<h3>Midday: A short “easy win” stop (optional)</h3>
<p>If you want one more scenic moment, choose something close and simple (like a quick waterfall viewpoint). Keep it short and sweet.</p>

<h3>Afternoon: Pack + airport plan (10 minutes that saves your whole day)</h3>
<ul>
  <li>Confirm your airport transport plan and pickup point.</li>
  <li>Leave buffer time—arrivals and departures feel best when you’re not rushing.</li>
  <li>Have a calm early dinner if you fly out later.</li>
</ul>

<h3>Evening: The “Antalya goodbye” routine</h3>
<p>Pick one final stroll location (Old Town ambience or beach promenade vibe), take a few photos, then enjoy a relaxed meal. End on a high, calm note.</p>

<hr/>

<h2>What to pack for 4 days in Antalya (UK-friendly essentials)</h2>
<ul>
  <li>High SPF + sunglasses (Antalya sun feels generous)</li>
  <li>Comfortable walking shoes (Old Town streets are best explored slowly)</li>
  <li>Light layer for evenings by the sea</li>
  <li>Swimwear + quick-dry towel</li>
  <li>Power bank (you’ll take more photos than expected)</li>
</ul>

<hr/>

<h2>How to adjust this itinerary by base area</h2>

<h3>If you stay in Kaleiçi</h3>
<ul>
  <li>Make Day 1 and Day 4 extra easy and atmospheric.</li>
  <li>Do Konyaaltı on Day 2 as your beach reset.</li>
  <li>Choose one day trip on Day 3 and keep evenings calm.</li>
</ul>

<h3>If you stay in Konyaaltı</h3>
<ul>
  <li>Day 2 becomes effortless (beach on your doorstep).</li>
  <li>Day 1: plan a dedicated Old Town wander (easy, beautiful).</li>
  <li>Day 3: pick ancient sites OR nature and keep it clean.</li>
</ul>

<h3>If you stay in Lara</h3>
<ul>
  <li>You get a classic beach-first flow.</li>
  <li>Plan at least one Kaleiçi evening for atmosphere.</li>
  <li>Keep Day 3 as your one big excursion day.</li>
</ul>

<hr/>

<h2>Common planning mistakes (framed positively)</h2>
<ul>
  <li><strong>Trying to do too much:</strong> Antalya is better when you choose fewer things and enjoy them more.</li>
  <li><strong>Under-planning Day 1:</strong> Make Day 1 gentle; it sets the tone of the whole trip.</li>
  <li><strong>No buffer time:</strong> A little buffer makes travel days feel calm and premium.</li>
  <li><strong>Doing multiple big day trips:</strong> One great day trip beats three rushed ones.</li>
</ul>

<hr/>

<h2>FAQs</h2>

<h3>Is 4 days in Antalya enough?</h3>
<p>Yes—4 days is a sweet spot for a first trip: you can do Old Town atmosphere, a proper beach day, one day trip, and still have a relaxed finale.</p>

<h3>What’s the best area to stay for a first Antalya trip?</h3>
<p>Kaleiçi for charm and walkable evenings, Konyaaltı for beach + city balance, Lara for a classic beach-first routine.</p>

<h3>Should I do ancient sites or nature on my day trip?</h3>
<p>Choose based on your holiday mood: ancient sites if you want cultural depth, nature if you want pure refresh. Both are great—just don’t cram both into one day.</p>

<h3>How do I avoid feeling rushed?</h3>
<p>One main theme per day, one day trip maximum, and keep one flexible afternoon for pure holiday time.</p>

<h3>Is Antalya good for couples?</h3>
<p>Yes—especially if you include at least one Kaleiçi evening for atmosphere and one beach day for relaxation.</p>

<h3>Is Antalya good for families?</h3>
<p>Yes—beach bases like Konyaaltı or Lara make the day-to-day routine easy, and nature-style day trips are very family-friendly.</p>

<h3>What’s the best “first day” plan after landing?</h3>
<p>Keep it gentle: Kaleiçi wandering, harbour atmosphere, a relaxed meal, then an early night if you want a strong Day 2.</p>

<p><em>Last updated:</em> ${new Date().toLocaleDateString('en-GB')}</p>
`
};

async function addAntalyaItineraryArticle() {
    const timestamp = Date.now();

    // --- Authentic Mode Prompts (Imagen 3) ---
    const imagesToGenerate = [
        {
            placeholder: '<!-- IMAGE_COVER_PLACEHOLDER -->',
            filename: `antalya-itinerary-cover-${timestamp}.jpg`,
            prompt: "A collage or split view showing Antalya's variety: snippets of Kaleiçi streets, electric blue sea coast, and ancient ruins. Vibrant and inviting. Authentic travel photography."
        },
        {
            placeholder: '<!-- IMAGE_DAY1_PLACEHOLDER -->',
            filename: `antalya-itinerary-day1-kaleici-${timestamp}.jpg`,
            prompt: "Antalya Kaleiçi Old Town harbour area. Boats, historic walls, sea view, people walking. Golden hour. Authentic travel photography."
        },
        {
            placeholder: '<!-- IMAGE_DAY2_PLACEHOLDER -->',
            filename: `antalya-itinerary-day2-konyaalti-${timestamp}.jpg`,
            prompt: "Konyaaltı beach scene in Antalya. People relaxing on the long pebble beach, sea view, mountains in background. Relaxed holiday vibe. Authentic travel photography."
        },
        {
            placeholder: '<!-- IMAGE_DAY3_PLACEHOLDER -->',
            filename: `antalya-itinerary-day3-ancient-${timestamp}.jpg`,
            prompt: "Ancient Roman ruins in Antalya region (like Aspendos or Perge). Stone columns, theatre, blue sky. Historic atmosphere. Authentic travel photography."
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
        title: { en: ARTICLE_DATA.title, tr: "Antalya Gezi Rehberi: 4 Günlük Rota (Gezilecek Yerler)" },
        meta_description: { en: ARTICLE_DATA.meta_description, tr: "Antalya'da 4 gün ne yapılır? Kaleiçi, Konyaaltı, antik kentler ve şelalelerle dolu dolu bir Antalya gezi planı." },
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
        console.log("✅ Antalya 4-Day Itinerary Article Added Successfully with Imagen 3 Images!");
    }
}

addAntalyaItineraryArticle();
