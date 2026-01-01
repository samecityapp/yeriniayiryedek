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
    slug: 'where-to-stay-in-bodrum-best-areas-guide',
    title: 'Where to Stay in Bodrum: Best Areas for UK Travellers (No Hotel Names)',
    meta_description: 'Not sure where to stay in Bodrum? Compare Bodrum Town, Gümbet, Bitez, Ortakent, Yalıkavak, Türkbükü, Gümüşlük and more—vibe, pros/cons and who each suits.',
    content: `
<h1>Where to Stay in Bodrum: Best Areas for UK Travellers (No Hotel Names — Just the Right Base)</h1>

<p><strong>Quick answer:</strong> Stay in <strong>Bodrum Town (Centre)</strong> if you want walkable evenings, the marina, restaurants, and the easiest “do a bit of everything” base. Choose <strong>Bitez or Ortakent</strong> for a calmer beach-first trip. Choose <strong>Gümbet</strong> if nightlife is a priority. Choose <strong>Yalıkavak</strong> for a more upscale marina scene. Choose <strong>Gümüşlük</strong> for slower sunsets and an artsy feel. Choose <strong>Torba</strong> if you want a quieter, greener base close to Bodrum Town.</p>

<p>Bodrum isn’t just one town — it’s a peninsula with multiple resort areas, each with a different vibe.</p>

<p>Internal reads (placeholders): 
<a href="#">Bodrum Itinerary: 3 Days (UK-Friendly)</a> •
<a href="#">Milas–Bodrum Airport to Bodrum: How to Get There</a> •
<a href="/guide/cash-or-card-in-turkey-guide-for-uk-travellers">Cash or Card in Turkey? (UK Guide)</a>
</p>

<hr/>

<!-- IMAGE_COVER_PLACEHOLDER -->

<h2>Bodrum areas at a glance (pick your travel style)</h2>

<table>
  <thead>
    <tr>
      <th>What you want</th>
      <th>Best area</th>
      <th>Why it works</th>
      <th>Watch-outs</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Walkable evenings + restaurants + easiest base</td>
      <td><strong>Bodrum Town (Centre)</strong></td>
      <td>Marina feel, lots of choice, easiest logistics</td>
      <td>Busier in peak season</td>
    </tr>
    <tr>
      <td>Nightlife close to your accommodation</td>
      <td><strong>Gümbet</strong></td>
      <td>Lively, social, easy “friends trip” energy</td>
      <td>Can feel noisy if you want calm</td>
    </tr>
    <tr>
      <td>Relaxed beach days + calmer evenings</td>
      <td><strong>Bitez</strong></td>
      <td>Chilled pace, good for couples/families</td>
      <td>Less “big town” energy at night</td>
    </tr>
    <tr>
      <td>Family beach routine + space to breathe</td>
      <td><strong>Ortakent / Yahşi</strong></td>
      <td>Easy beach rhythm, good “holiday mode” base</td>
      <td>More spread out; you’ll plan your evenings</td>
    </tr>
    <tr>
      <td>Marina scene + upscale vibe</td>
      <td><strong>Yalıkavak</strong></td>
      <td>Polished evenings, marina atmosphere</td>
      <td>Often pricier; less “old town” feel</td>
    </tr>
    <tr>
      <td>Slow sunsets + artsy, quieter feel</td>
      <td><strong>Gümüşlük</strong></td>
      <td>Great for switching off and lingering dinners</td>
      <td>Not ideal if you want nightlife</td>
    </tr>
    <tr>
      <td>Quiet base close to town</td>
      <td><strong>Torba</strong></td>
      <td>Calmer, greener feel while staying near Bodrum Town</td>
      <td>Less walkable “town centre” vibe</td>
    </tr>
  </tbody>
</table>

<hr/>

<h2>1) Bodrum Town (Centre): best for first-timers and “easy logistics”</h2>

<p>If this is your first Bodrum trip from the UK, <strong>Bodrum Town</strong> is the safest base because you can keep decisions simple: dinner options on your doorstep, a marina-town feel, and the easiest starting point for day plans.</p>

<p>It’s also where you’ll find Bodrum’s most famous landmark right in the harbour area: <strong>Bodrum Castle (Castle of St Peter)</strong>, which is recognised on UNESCO’s Tentative List and sits on a small peninsula between two sheltered bays.</p>

<h3>Choose Bodrum Town if…</h3>
<ul>
  <li>you want a <strong>walkable evening routine</strong> (stroll → dinner → gelato → back)</li>
  <li>you like having lots of choice without overplanning</li>
  <li>you want the easiest base for a short stay (3–5 nights)</li>
</ul>

<h3>Don’t choose Bodrum Town if…</h3>
<ul>
  <li>you want “quiet countryside” vibes every night (look at Torba, Gümüşlük, parts of Ortakent instead)</li>
</ul>

<hr/>

<!-- IMAGE_YALIKAVAK_PLACEHOLDER -->

<h2>2) Gümbet: best for nightlife and friend trips</h2>

<p>Gümbet is a classic “lively base” choice. If your perfect holiday includes late nights and you don’t want to commute back to a quiet area afterwards, stay here. It’s also a practical base if your group wants beach time by day and a social vibe by night.</p>

<h3>Choose Gümbet if…</h3>
<ul>
  <li>nightlife is a <strong>top-3 priority</strong></li>
  <li>you’re travelling with friends and want energy around you</li>
</ul>

<h3>Watch-outs</h3>
<ul>
  <li>If you’re a light sleeper, pick accommodation carefully (the area can feel loud in peak season).</li>
</ul>

<hr/>

<h2>3) Bitez: best for relaxed beach days + calmer evenings</h2>

<p>Bitez suits UK travellers who want to actually feel rested. Think slower mornings, simple beach days, and evenings that are more “chat and chill” than “big night out”.</p>

<h3>Choose Bitez if…</h3>
<ul>
  <li>you want a calmer base but still want to reach town easily when you feel like it</li>
  <li>you’re travelling as a couple or family and your priority is comfort</li>
</ul>

<!-- IMAGE_BITEZ_PLACEHOLDER -->

<hr/>

<h2>4) Ortakent / Yahşi: best for family-friendly beach rhythm</h2>

<p>Ortakent/Yahşi works well when your holiday plan is built around a repeatable routine: beach time, food, rest, repeat. It’s especially good if you prefer a bit more space and you’re okay planning evenings (rather than just wandering out into a busy town centre).</p>

<h3>Choose Ortakent/Yahşi if…</h3>
<ul>
  <li>you want a <strong>beach-first base</strong></li>
  <li>you’re fine using taxis/local transport for specific nights out</li>
</ul>

<hr/>

<h2>5) Yalıkavak: best for marina vibes and a polished evening scene</h2>

<p>Yalıkavak is a strong pick if you love the “marina atmosphere”: waterfront walking, people-watching, and a more polished feel. It’s one of the areas visitors associate with a higher-end Bodrum experience (without needing to chase nightlife).</p>

<h3>Choose Yalıkavak if…</h3>
<ul>
  <li>you want an <strong>upscale</strong>, modern vibe</li>
  <li>your evenings are about nice food, harbour views and a calmer “grown-up” feel</li>
</ul>

<h3>Watch-outs</h3>
<ul>
  <li>It can be pricier and less “old-town Turkey” in tone.</li>
</ul>

<hr/>

<h2>6) Gümüşlük: best for slow sunsets and a “switch-off” trip</h2>

<p>Gümüşlük is for travellers who want a softer pace. It’s the kind of base where the highlight is often a long dinner, sunset light, and not having to prove you “did everything”.</p>

<h3>Choose Gümüşlük if…</h3>
<ul>
  <li>you want calm, character and slower evenings</li>
  <li>your trip is more about rest than nightlife</li>
</ul>

<!-- IMAGE_GUMUSLUK_PLACEHOLDER -->

<hr/>

<h2>7) Torba: best if you want quiet, but still want to be near Bodrum Town</h2>

<p>Torba is a great compromise base: you’re close enough to Bodrum Town for dinners and wandering, but you can sleep somewhere that feels quieter and greener.</p>

<hr/>

<h2>Airport reality (what UK travellers should plan around)</h2>

<p>For Bodrum, you’ll normally fly into <strong>Milas–Bodrum Airport</strong>. The airport’s official page lists multiple ways to get to/from the airport, including <strong>HAVAŞ shuttle</strong> services and <strong>Muttaş buses</strong>.</p>

<p><strong>No-fake-timings policy:</strong> transport schedules can change with season and conditions. MUTTAŞ also notes (on its own route pages) that listed times are planned and can change due to factors like weather/traffic, and that credit card payment is possible on vehicles.</p>

<p><strong>Practical tip:</strong> if you’re landing late, decide your “night-one plan” before you fly: either pre-book a transfer or be comfortable paying for a taxi so you don’t gamble with connections.</p>

<hr/>

<h2>Best area by traveller type (UK-focused)</h2>

<ul>
  <li><strong>First time in Bodrum:</strong> Bodrum Town (Centre)</li>
  <li><strong>Couples (calm + nice evenings):</strong> Bitez or Gümüşlük</li>
  <li><strong>Friends trip (social + nightlife):</strong> Gümbet (or Town if you want variety)</li>
  <li><strong>Families:</strong> Ortakent/Yahşi or Bitez</li>
  <li><strong>“Treat ourselves” trip:</strong> Yalıkavak</li>
  <li><strong>Short trip (3–4 nights):</strong> stay central to save time</li>
</ul>

<hr/>

<h2>Common mistakes (and the fixes)</h2>

<ul>
  <li><strong>Mistake:</strong> picking an area for one Instagram clip. <strong>Fix:</strong> pick the place you’ll enjoy every evening (your default routine matters most).</li>
  <li><strong>Mistake:</strong> staying too far from your main priority. <strong>Fix:</strong> beach-first = Bitez/Ortakent; nightlife-first = Gümbet; variety-first = Town.</li>
  <li><strong>Mistake:</strong> relying on old shuttle timetables. <strong>Fix:</strong> confirm current transport options on official airport/operator pages.</li>
</ul>

<hr/>

<h2>FAQs</h2>

<h3>What’s the best area to stay in Bodrum for first-timers?</h3>
<p>Bodrum Town (Centre) is usually the easiest first choice: it’s walkable, practical, and keeps your trip flexible.</p>

<h3>Where should I stay in Bodrum for nightlife?</h3>
<p>Gümbet is a common nightlife-first base, especially for friends trips.</p>

<h3>Where should couples stay for a calmer vibe?</h3>
<p>Bitez or Gümüşlük usually fits a calmer, slower pace.</p>

<h3>Is Bodrum just one town?</h3>
<p>No — Bodrum is a peninsula with multiple resort towns and areas, each with its own vibe.</p>

<h3>What airport do I fly into for Bodrum?</h3>
<p>Milas–Bodrum Airport is the typical arrival airport for the Bodrum peninsula.</p>

<h3>Does airport transport run on fixed times?</h3>
<p>Times can change. MUTTAŞ notes that published times are planned and may change due to conditions like traffic/weather. Always verify current details on the day.</p>

<p><em>Last updated:</em> ${new Date().toLocaleDateString('en-GB')}</p>
`
};

async function addBodrumAreasArticle() {
    const timestamp = Date.now();

    // --- Authentic Mode Prompts (Imagen 3) ---
    const imagesToGenerate = [
        {
            placeholder: '<!-- IMAGE_COVER_PLACEHOLDER -->',
            filename: `bodrum-town-castle-cover-${timestamp}.jpg`,
            prompt: "Bodrum Castle and marina view at golden hour. White boats, calm water, historic stone castle. Authentic travel photography."
        },
        {
            placeholder: '<!-- IMAGE_YALIKAVAK_PLACEHOLDER -->',
            filename: `bodrum-yalikavak-marina-${timestamp}.jpg`,
            prompt: "Yalıkavak Marina area in Bodrum. Modern promenade with palm trees, upscale cafes, and people walking. Authentic luxury travel vibe."
        },
        {
            placeholder: '<!-- IMAGE_BITEZ_PLACEHOLDER -->',
            filename: `bodrum-bitez-beach-calm-${timestamp}.jpg`,
            prompt: "Bitez beach in Bodrum. Calm shallow water, canvas sun umbrellas, relaxed sandy bay. Authentic summer holiday photography."
        },
        {
            placeholder: '<!-- IMAGE_GUMUSLUK_PLACEHOLDER -->',
            filename: `bodrum-gumusluk-sunset-dining-${timestamp}.jpg`,
            prompt: "Gümüşlük seaside dining tables with colourful lanterns at sunset. People eating near the water. Authentic Aegean atmosphere."
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
        title: { en: ARTICLE_DATA.title, tr: "Bodrum'da Nerede Kalınır: En İyi Bölgeler ve Oteller" },
        meta_description: { en: ARTICLE_DATA.meta_description, tr: "Bodrum'da nerede kalınır? Gümbet, Bitez, Yalıkavak ve Merkez karşılaştırması. Aileler, çiftler ve gençler için en iyi bölgeler." },
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
        console.log("✅ Bodrum Areas Article Added Successfully with Imagen 3 Images!");
    }
}

addBodrumAreasArticle();
