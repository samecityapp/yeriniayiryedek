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
    slug: 'bodrum-itinerary-3-days-uk-friendly-guide',
    title: 'Bodrum Itinerary: 3 Days for UK Travellers (What to Do + Map-Logic)',
    meta_description: 'A practical 3-day Bodrum itinerary for UK travellers: Old Town, Bodrum Castle, Mausoleum ruins, marina walk, sunset spots and easy day trips—no hotel names.',
    content: `
<h1>Bodrum Itinerary: 3 Days for UK Travellers (Easy Plan, No Overthinking)</h1>

<p><strong>Quick answer:</strong> For a first Bodrum trip, do <strong>Old Town + landmarks</strong> on Day 1, a <strong>peninsula-style day</strong> (one key area + beach time) on Day 2, and keep Day 3 for <strong>sunset + flexible extras</strong>. Bodrum works best when you plan by <em>areas</em>, not by trying to “see everything”.</p>

<p>Start here if you haven’t chosen your base yet:
<a href="/guide/where-to-stay-in-bodrum-best-areas-guide">Where to Stay in Bodrum (Best Areas)</a> •
<a href="/guide/milas-bodrum-airport-to-bodrum-bus-shuttle-taxi">Milas–Bodrum Airport to Bodrum: How to Get There</a></p>

<hr/>

<!-- IMAGE_COVER_PLACEHOLDER -->

<h2>Before you begin: 3 rules that make Bodrum feel effortless</h2>
<ul>
  <li><strong>Rule #1: Pick one “main area” per day.</strong> Bodrum is a peninsula—jumping between far corners daily can waste your best hours.</li>
  <li><strong>Rule #2: Do your “must-see” early.</strong> Save the relaxed stuff (marina walk, slow dinner) for later.</li>
  <li><strong>Rule #3: Don’t lock your life to timetables.</strong> Transport times and entry fees can change; verify on the day (airport/operator or venue info).</li>
</ul>

<hr/>

<h2>Day 1 — Bodrum Town: Castle, Old Town wandering, and a marina evening</h2>

<h3>Morning: Bodrum Castle + waterfront loop</h3>
<p>Make Bodrum Castle your first anchor. It sits right by the harbour, so you can build a simple walking loop: castle → waterfront → old streets → coffee break.</p>

<p><strong>Do it like this:</strong></p>
<ul>
  <li>Go early and enjoy it before the day heats up.</li>
  <li>Walk the outer waterfront after—Bodrum feels “Bodrum” when you’re near the sea.</li>
  <li>Keep your pace slow: this is not a museum sprint day.</li>
</ul>

<p><em>Tip:</em> If anything like opening hours or ticket rules matters to your day, check the latest official listing at the entrance or official channels before you commit your schedule.</p>

<h3>Midday: Old Town drift (no rigid checklist)</h3>
<p>Instead of chasing ten micro-attractions, do one thing well: pick a few old-town streets near the centre and let the day breathe. This is where Bodrum’s “white walls + blue details” vibe shows up naturally.</p>

<!-- IMAGE_OLDTOWN_PLACEHOLDER -->

<h3>Late afternoon: The Mausoleum site (short, meaningful, easy)</h3>
<p>Next, visit the <strong>Mausoleum at Halicarnassus</strong> site. It’s a quick stop compared to the castle, but it’s a huge “history moment” because it’s tied to one of the Seven Wonders of the Ancient World.</p>

<p><strong>How to enjoy it:</strong></p>
<ul>
  <li>Go with the mindset of “I’m seeing where it was”, not “I’m seeing a giant intact monument”.</li>
  <li>Give yourself time to read the on-site info and take it in slowly.</li>
</ul>

<h3>Evening: Marina walk + simple dinner plan</h3>
<p>Finish Day 1 with an easy marina-and-seafront evening. Your goal is “pleasant and unforced”: a walk, a nice meal, and an early-ish night if you want a strong Day 2.</p>

<hr/>

<h2>Day 2 — Choose ONE peninsula vibe: (A) calm beach day, (B) marina scene, or (C) slow sunset town</h2>
<p>This day is where most UK travellers either fall in love with Bodrum or burn out. The trick is choosing a single vibe and committing to it.</p>

<h3>Option A: Calm beach-first day (Bitez or Ortakent/Yahşi style)</h3>
<p>If your idea of holiday happiness is: “swim → snack → read → swim again”, pick a calmer beach area. Keep the plan minimal, and you’ll feel genuinely rested.</p>
<ul>
  <li><strong>Best for:</strong> couples, families, anyone recovering from a busy life</li>
  <li><strong>Plan:</strong> beach time + one nice dinner, nothing else</li>
</ul>

<h3>Option B: Polished marina vibe (Yalıkavak style)</h3>
<p>If you want the “dress nicely, stroll, people-watch” version of Bodrum, pick a marina-style day. It’s less about sightseeing and more about atmosphere.</p>
<ul>
  <li><strong>Best for:</strong> grown-up trips, birthdays, “treat ourselves” holidays</li>
  <li><strong>Plan:</strong> lazy morning → afternoon stroll → golden-hour drink → dinner</li>
</ul>

<h3>Option C: Slow sunset + character (Gümüşlük style)</h3>
<p>If you want the softer, slower Bodrum, pick a sunset-focused area. Don’t book ten things. Build the whole day around one beautiful evening.</p>
<ul>
  <li><strong>Best for:</strong> people who want calm, conversation, and long dinners</li>
  <li><strong>Plan:</strong> easy daytime + arrive before sunset + stay put</li>
</ul>

<hr/>

<h2>Day 3 — Flexible “bonus day”: theatre viewpoint + shopping time + your favourite repeat</h2>

<h3>Morning: Antique Theatre viewpoint (short, high-impact)</h3>
<p>If you enjoy history with views, add the <strong>ancient theatre</strong> into Day 3. It’s a good “one hour” stop that gives you a different angle on Bodrum.</p>

<!-- IMAGE_THEATRE_PLACEHOLDER -->

<h3>Midday: Choose your repeat (this is the secret)</h3>
<p>Day 3 is not for cramming. It’s for repeating whatever made you happiest:</p>
<ul>
  <li>If Day 1 felt best: repeat Old Town + marina walk.</li>
  <li>If Day 2 felt best: repeat the same beach area and go deeper (swim more, walk more, relax more).</li>
  <li>If sunsets were your highlight: set up another golden-hour plan in a different spot.</li>
</ul>

<h3>Late afternoon: “last-day logistics” block (10 minutes that saves stress)</h3>
<ul>
  <li>Confirm your airport transfer plan and pickup point.</li>
  <li>Leave buffer time—traffic and conditions can affect plans.</li>
  <li>Keep your final evening simple and close to your base.</li>
</ul>

<!-- IMAGE_DINING_PLACEHOLDER -->

<hr/>

<h2>Where this itinerary works best (and when to tweak it)</h2>
<ul>
  <li><strong>Perfect for:</strong> first-time UK visitors, 3–5 night trips, couples, small groups</li>
  <li><strong>Tweak it if:</strong> you’re doing a longer stay—then you can add one proper day trip (but still keep “one area per day”).</li>
</ul>

<hr/>

<h2>Common mistakes (so you don’t waste your best hours)</h2>
<ul>
  <li><strong>Mistake:</strong> doing Castle + far peninsula corner + sunset on the other side all in one day.
      <strong>Fix:</strong> one area per day.</li>
  <li><strong>Mistake:</strong> planning your trip around exact online timetables.
      <strong>Fix:</strong> confirm on the day and keep buffer time.</li>
  <li><strong>Mistake:</strong> treating Bodrum like a checklist city.
      <strong>Fix:</strong> build your days around atmosphere and rhythm.</li>
</ul>

<hr/>

<h2>FAQs</h2>

<h3>Is Bodrum Castle worth it?</h3>
<p>Yes—it's Bodrum’s iconic landmark by the harbour and a strong Day 1 anchor.</p>

<h3>How long do I need for the Mausoleum site?</h3>
<p>It’s usually a shorter stop than the castle. Go for the historical meaning and on-site context.</p>

<h3>What’s the best base for this itinerary?</h3>
<p>Bodrum Town is the easiest first-timer base because Day 1 and Day 3 become walkable and simple.</p>

<h3>What’s the best way to avoid crowds?</h3>
<p>Do your “must-see” early, and plan your relaxed activities later in the day.</p>

<h3>Should I do a boat trip on a 3-day trip?</h3>
<p>Only if you’re happy swapping out one peninsula day. Don’t try to do everything.</p>

<h3>Do I need to pre-book everything?</h3>
<p>No—Bodrum is at its best when you keep one or two anchors and let the rest stay flexible.</p>

<p><em>Last updated:</em> ${new Date().toLocaleDateString('en-GB')}</p>
`
};

async function addBodrumItineraryArticle() {
    const timestamp = Date.now();

    // --- Authentic Mode Prompts (Imagen 3) ---
    const imagesToGenerate = [
        {
            placeholder: '<!-- IMAGE_COVER_PLACEHOLDER -->',
            filename: `bodrum-castle-harbour-view-${timestamp}.jpg`,
            prompt: "View of Bodrum Castle from the marina promenade. Yachts in foreground, castle in background. Golden hour light. Authentic travel photography."
        },
        {
            placeholder: '<!-- IMAGE_OLDTOWN_PLACEHOLDER -->',
            filename: `bodrum-old-town-street-${timestamp}.jpg`,
            prompt: "Narrow street in Bodrum old town. Whitewashed buildings with blue doors and bougainvillea flowers. Sunlight and shadows. Authentic cultural travel photography."
        },
        {
            placeholder: '<!-- IMAGE_THEATRE_PLACEHOLDER -->',
            filename: `bodrum-antique-theatre-view-${timestamp}.jpg`,
            prompt: "View from the Ancient Theatre of Halicarnassus looking down over Bodrum town and the sea. Historic stone seating. Sunny day. Authentic travel photography."
        },
        {
            placeholder: '<!-- IMAGE_DINING_PLACEHOLDER -->',
            filename: `bodrum-aegean-dining-${timestamp}.jpg`,
            prompt: "A table set for a nice dinner by the sea in Bodrum. Meze plates, glasses, relaxed summer evening vibe. Authentic food travel photography."
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
        title: { en: ARTICLE_DATA.title, tr: "Bodrum Gezi Rehberi: 3 Günlük Tatil Planı (Haritalı)" },
        meta_description: { en: ARTICLE_DATA.meta_description, tr: "Bodrum'da 3 gün nasıl geçer? Kale, Antik Tiyatro, plajlar ve gezilecek yerler. En iyi gezi rotası." },
        content: { en: finalContent, tr: "<p>Çeviri yakında...</p>" },
        location: { en: 'Bodrum', tr: 'Bodrum' },
        cover_image_url: coverImageUrl,
        published_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    }, { onConflict: 'slug' });

    if (error) {
        console.error("❌ DB Insert Failed:", error);
    } else {
        console.log("✅ Bodrum Itinerary Article Added Successfully with Imagen 3 Images!");
    }
}

addBodrumItineraryArticle();
