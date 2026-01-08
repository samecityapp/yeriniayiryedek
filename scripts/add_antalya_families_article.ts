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
const MODEL_ID = 'imagen-3.0-generate-001'; // Explicitly Imagen 3

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const ARTICLES_IMAGE_DIR = path.join(process.cwd(), 'public', 'images', 'articles');
if (!fs.existsSync(ARTICLES_IMAGE_DIR)) {
    fs.mkdirSync(ARTICLES_IMAGE_DIR, { recursive: true });
}

// --- Imagen 3 Generation Function ---
async function generateImageVertex(prompt: string, filename: string) {
    console.log(`🎨 Generating ${filename} with Imagen 3...`);

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
            throw new Error(`Vertex API Error: ${response.status} - ${errText}`);
        }

        const data = await response.json();

        if (!data.predictions || data.predictions.length === 0) {
            throw new Error('No predictions returned');
        }

        const base64Image = data.predictions[0].bytesBase64Encoded;
        const buffer = Buffer.from(base64Image, 'base64');

        const localPath = path.join(ARTICLES_IMAGE_DIR, filename);
        const publicUrl = `/images/articles/${filename}`;

        fs.writeFileSync(localPath, buffer);
        console.log(`✅ Saved: ${localPath}`);

        return publicUrl;
    } catch (error) {
        console.error("❌ Generation Failed:", error);
        return null;
    }
}

const ARTICLE_DATA = {
    slug: 'antalya-for-families-best-areas-to-stay',
    title: 'Antalya for Families: Best Areas to Stay (Beaches, Pools, Day Trips) — UK Guide',
    meta_description: 'Planning Antalya with kids? Compare Lara, Belek, Konyaaltı, Kaleiçi and Side-style bases for families—what each area suits, easy day trips, and a UK parent checklist. No hotel names.',
    primary_keyword: 'Antalya for families best areas to stay',
    content: `<p><strong>Quick answer:</strong> For the easiest family holiday routine, <strong>Lara</strong> and <strong>Belek</strong> are usually the smoothest picks (beach-first, simple days, minimal planning). If you want a family trip with more “city options” and a promenade vibe, choose <strong>Konyaaltı</strong>. If you want charm for evenings and short walks (with older kids), consider <strong>Kaleiçi</strong>—but most families prefer a beach base and visit Kaleiçi as a half-day.</p>

<p>Internal reads (placeholders): 
<a href="/guide/where-to-stay-in-antalya-best-areas-guide">Where to Stay in Antalya (Best Areas)</a> •
<a href="/guide/antalya-itinerary-4-days">Antalya Itinerary: 4 Days (UK-Friendly)</a> •
<a href="/guide/best-day-trips-from-antalya">Best Day Trips from Antalya</a> •
<a href="/guide/antalya-airport-to-city-centre-transport-guide">Antalya Airport to City Centre</a> •
<a href="/guide/turkey-with-kids-7-days">Turkey With Kids: 7-Day Low-Stress Itinerary</a> •
<a href="/guide/all-inclusive-family-checklist">All-Inclusive for Families: UK Parent Checklist</a>
</p>

<!-- IMAGE_COVER_PLACEHOLDER -->

<hr/>

<h2>The family base decision in 60 seconds (pick your default day)</h2>
<ul>
  <li><strong>“We want pool/beach days on repeat with zero stress” →</strong> Lara or Belek</li>
  <li><strong>“We want beach + city comforts (cafés, walks, variety)” →</strong> Konyaaltı</li>
  <li><strong>“We want character evenings and short strolls (older kids)” →</strong> Kaleiçi (Old Town)</li>
  <li><strong>“We want a beach base with an ‘old town’ feel nearby” →</strong> consider a Side-style base for a longer family stay</li>
</ul>

<p><strong>Simple rule:</strong> With kids, your base matters more than your day trip list. A base that fits your routine turns the whole holiday into easy mode.</p>

<hr/>

<h2>Antalya family areas at a glance</h2>
<table>
  <thead>
    <tr>
      <th>Area</th>
      <th>Best for</th>
      <th>Family vibe</th>
      <th>Why families choose it</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Lara</strong></td>
      <td>Families who want “easy beach holiday”</td>
      <td>Beach-first, simple routine</td>
      <td>Minimal planning: swim, rest, repeat</td>
    </tr>
    <tr>
      <td><strong>Belek</strong></td>
      <td>Resort-first trips, younger kids</td>
      <td>All-in-one holiday style</td>
      <td>Everything in one place: easy days</td>
    </tr>
    <tr>
      <td><strong>Konyaaltı</strong></td>
      <td>Beach + city balance, teens</td>
      <td>Promenade, cafés, variety</td>
      <td>Great for walks + “something to do” daily</td>
    </tr>
    <tr>
      <td><strong>Kaleiçi</strong></td>
      <td>Older kids, short breaks</td>
      <td>Charm + evenings</td>
      <td>Walkable atmosphere; best as a “visit” too</td>
    </tr>
    <tr>
      <td><strong>Side-style base</strong></td>
      <td>Longer family stays</td>
      <td>Beach + history atmosphere</td>
      <td>Good mix of easy days + sense of place</td>
    </tr>
  </tbody>
</table>

<hr/>

<h2>1) Lara: the easiest “family beach holiday” base</h2>
<p>Lara is ideal if your goal is a classic family holiday rhythm: comfortable mornings, easy beach time, and no complicated logistics. It suits families who want the day to run itself.</p>

<h3>Choose Lara if…</h3>
<ul>
  <li>you want a <strong>simple routine</strong> that works with naps and early dinners</li>
  <li>your priority is <strong>beach time</strong> and relaxed family days</li>
  <li>you want the holiday to feel “effortless”</li>
</ul>

<!-- IMAGE_LARA_PLACEHOLDER -->

<h3>Make Lara even smoother (UK parent moves)</h3>
<ul>
  <li><strong>Plan one half-day trip maximum</strong> during your stay (kids enjoy the beach rhythm more than constant moving)</li>
  <li><strong>Do your exploring early</strong>, then keep afternoons easy</li>
</ul>

<hr/>

<h2>2) Belek: resort-first, especially good with younger kids</h2>
<p>Belek is great when you want the all-in-one holiday style: minimal decisions, predictable days, and a setup that makes family routines easy. It’s often a favourite for younger kids because the day can be built around pools, shade, and short walking distances.</p>

<h3>Choose Belek if…</h3>
<ul>
  <li>you want <strong>maximum relaxation</strong> with minimal planning</li>
  <li>you’re travelling with <strong>younger kids</strong> and want easy routines</li>
  <li>your group has mixed ages and you want “something for everyone” in one place</li>
</ul>

<!-- IMAGE_BELEK_PLACEHOLDER -->

<p><strong>Best mindset:</strong> Belek is at its best when you embrace the “stay put” holiday and add just one special outing.</p>

<hr/>

<h2>3) Konyaaltı: best for families who want beach + city life</h2>
<p>Konyaaltı is a strong choice if your family enjoys having options: beach time, promenade walks, cafés, and a feeling that there’s always an easy plan even if the day changes.</p>

<h3>Choose Konyaaltı if…</h3>
<ul>
  <li>you like a <strong>promenade stroll</strong> as part of your daily routine</li>
  <li>you want <strong>beach time</strong> plus city comforts (food options, quick errands)</li>
  <li>you’re travelling with <strong>teens</strong> or older kids who like variety</li>
</ul>

<!-- IMAGE_KONYAALTI_PLACEHOLDER -->

<h3>Family comfort tip</h3>
<p>Konyaaltı days work best when you keep the plan light: beach + one small extra (ice cream stop, short viewpoint, relaxed dinner). That’s the formula.</p>

<hr/>

<h2>4) Kaleiçi (Old Town): lovely for evenings, best with older kids</h2>
<p>Kaleiçi is perfect for atmosphere—especially in the evenings. For families, it’s often best as a “half-day visit” rather than the main base, unless you’re doing a short city break with older kids.</p>

<h3>Choose Kaleiçi if…</h3>
<ul>
  <li>your kids are <strong>older</strong> and enjoy walking + exploring</li>
  <li>you want a <strong>short break</strong> that feels charming and walkable</li>
  <li>you like the idea of <strong>historic streets</strong> and harbour atmosphere</li>
</ul>

<!-- IMAGE_KALEICI_PLACEHOLDER -->

<p><strong>Better move for most families:</strong> stay in Lara/Konyaaltı/Belek and do Kaleiçi as your “special evening” outing.</p>

<hr/>

<h2>5) Side-style base: great for longer stays with easy beach days</h2>
<p>If you’re staying longer and want a family-friendly base that blends easy beach days with a strong sense of place, a Side-style base is worth considering. It’s the sort of choice families make when they want “simple days” but also want the holiday to feel memorable.</p>

<hr/>

<h2>Best day trips from Antalya with kids (keep it light)</h2>
<p>With children, day trips are best when they’re <strong>simple</strong>, not ambitious. Choose one “big” day at most, and keep the rest of the holiday beach-first.</p>

<ul>
  <li><strong>Easy scenic half-day:</strong> a waterfall viewpoint + a relaxed meal</li>
  <li><strong>One “wow” history day:</strong> one major ancient site (go early, walk slowly, finish with an easy evening)</li>
  <li><strong>Nature day:</strong> a national-park style outing if your family loves outdoors</li>
</ul>

<p>More detail here:
<a href="/guide/best-day-trips-from-antalya">Best Day Trips from Antalya (UK-Friendly)</a></p>

<hr/>

<h2>The UK parent checklist (no regrets booking)</h2>

<h3>Room & sleep</h3>
<ul>
  <li>Can we get <strong>family rooms</strong> or connecting rooms?</li>
  <li>Is there <strong>air conditioning</strong> and can we control it?</li>
  <li>Is the room likely to be <strong>quiet enough</strong> for early bedtimes?</li>
</ul>

<h3>Pools & shade</h3>
<ul>
  <li>Is there a <strong>kids’ pool</strong> and shaded seating nearby?</li>
  <li>Is there a sensible routine for towels/sunbeds (so the day stays smooth)?</li>
</ul>

<h3>Food</h3>
<ul>
  <li>Do they have <strong>child-friendly options</strong> and flexible meal times?</li>
  <li>Is there somewhere easy to grab a snack without turning it into a mission?</li>
</ul>

<h3>Getting around</h3>
<ul>
  <li>How far is it from the airport, and what’s the easiest arrival option for our family?</li>
  <li>Can we do a simple day trip without a long, tiring day?</li>
</ul>

<p>Use this too:
<a href="/guide/all-inclusive-family-checklist">All-Inclusive for Families (UK Parent Checklist)</a></p>

<hr/>

<h2>Common planning mistakes (framed positively)</h2>
<ul>
  <li><strong>Over-scheduling:</strong> pick one main plan per day and leave space for rest.</li>
  <li><strong>Choosing a base that doesn’t match your routine:</strong> beach-first families are happiest in Lara/Belek.</li>
  <li><strong>Trying to do too many day trips:</strong> one memorable outing beats three rushed days.</li>
</ul>

<hr/>

<h2>FAQs</h2>

<h3>What’s the best area to stay in Antalya for families from the UK?</h3>
<p>For the easiest routine, Lara or Belek. For beach + city variety, Konyaaltı. For charm evenings with older kids, Kaleiçi (often best as a visit).</p>

<h3>Is Antalya good for a family holiday?</h3>
<p>Yes—especially if you choose a base that matches your family’s rhythm and keep day trips light.</p>

<h3>Where should we stay with toddlers?</h3>
<p>Belek or Lara tend to feel simplest because you can keep the day routine consistent and avoid too much moving around.</p>

<h3>Where should we stay with teenagers?</h3>
<p>Konyaaltı is often a strong pick thanks to the promenade vibe and daily variety, while still keeping beach time easy.</p>

<h3>Should we do a city base or beach base?</h3>
<p>If your family is beach-first, choose a beach base and visit the Old Town for one evening. If you love walking and atmosphere (older kids), a short city break base can work well.</p>

<p><em>Last updated:</em> ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
`
};

async function run() {
    const timestamp = Date.now();
    console.log("🚀 Starting Antalya Family Article Automation...");

    const imagesToGenerate = [
        {
            placeholder: '<!-- IMAGE_COVER_PLACEHOLDER -->',
            filename: `antalya-family-cover-uk-${timestamp}.jpg`,
            prompt: "A candid iPhone photo of a family (parents and kids, viewed from behind or distance) walking near the Antalya cliffs/seafront. Bright authentic daylight. Blue sky, Mediterranean sea. 'Real holiday' vibe. slightly imperfect composition. No AI gloss. 35mm. Realistic colors."
        },
        {
            placeholder: '<!-- IMAGE_LARA_PLACEHOLDER -->',
            filename: `antalya-lara-family-beach-${timestamp}.jpg`,
            prompt: "A realistic beach scene in Lara, Antalya. Sandy beach, some colorful towels and umbrellas. Families playing in the sand in the distance (safe distance, no faces). Bright sunny day. Authentic travel photo style. Low angle shot."
        },
        {
            placeholder: '<!-- IMAGE_BELEK_PLACEHOLDER -->',
            filename: `antalya-belek-family-resort-${timestamp}.jpg`,
            prompt: "A peaceful resort garden in Belek. Green lawn, pine trees, a swimming pool in the background. Soft morning light. A relaxed 'holiday morning' atmosphere. Authentic colors, no HDR."
        },
        {
            placeholder: '<!-- IMAGE_KONYAALTI_PLACEHOLDER -->',
            filename: `antalya-konyaalti-promenade-family-${timestamp}.jpg`,
            prompt: "Konyaalti beach promenade in Antalya. People walking and biking. Mountains in the background. Real life street photography style. Sunny day. Authentic textures."
        },
        {
            placeholder: '<!-- IMAGE_KALEICI_PLACEHOLDER -->',
            filename: `antalya-kaleici-evening-family-${timestamp}.jpg`,
            prompt: "Evening twilight in Antalya Old Town (Kaleici). Warm street lights, stone paved narrow street. A family walking in the distance. Cozy atmosphere. Authentic / raw photo style. No bokeh overkill."
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
        } else {
            console.warn("⚠️ Image generation failed for:", item.filename);
            // Remove placeholder anyway to avoid broken text
            finalContent = finalContent.replace(item.placeholder, '');
        }
    }

    // Insert into DB
    const { error } = await supabase.from('articles').upsert({
        slug: ARTICLE_DATA.slug,
        title: { en: ARTICLE_DATA.title, tr: "Antalya Aile Tatili Rehberi (TR Pasif)" }, // TR hidden/passive
        meta_description: { en: ARTICLE_DATA.meta_description, tr: "TR Pasif" },
        content: { en: finalContent, tr: "<p>Bu içerik sadece İngilizce dilinde yayındadır.</p>" },
        cover_image_url: coverImageUrl,
        published_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    }, { onConflict: 'slug' });

    if (error) {
        console.error("❌ DB Insert Failed:", error);
    } else {
        console.log("✅ Article Added Successfully!");
        console.log("👉 Slug:", ARTICLE_DATA.slug);
    }
}

run();
