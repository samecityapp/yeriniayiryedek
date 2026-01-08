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
    slug: 'where-to-stay-in-alacati-best-areas-uk-guide',
    title: 'Where to Stay in Alaçatı: Best Areas for Boutique Vibes vs Beach Time (UK Guide)',
    meta_description: 'Not sure where to stay in Alaçatı? Choose between Alaçatı centre, quieter streets, and the beach/windsurf side—vibes, walking, noise, and who each area suits. UK-friendly, no hotel names.',
    primary_keyword: 'where to stay in Alaçatı',
    content: `<p><strong>Quick answer:</strong> Stay in <strong>Alaçatı Centre</strong> if you want stone-street atmosphere, boutique vibes, cafés, and walkable evenings. Choose a <strong>quieter edge of town</strong> if you want the same style but better sleep. Base closer to the <strong>windsurf / beach side</strong> if your holiday is about beach time and being near the water (often less “old town” charm, more practical beach days). If you want easy access to both, pick a base that’s <strong>close enough to walk into the centre</strong> but not right on the busiest evening streets.</p>

<p>Alaçatı is a brilliant UK-friendly short break base because it’s compact, atmospheric, and easy to enjoy without a packed itinerary. The key decision is simple: do you want your holiday to feel like <em>evenings in town</em> (centre), or <em>days by the water</em> (beach side)?</p>

<p>Internal reads (placeholders):
<a href="/guide/where-to-stay-in-izmir-weekend-guide">Where to Stay in Izmir (Weekend + Day Trips)</a> •
<a href="/guide/alacati-vs-cesme-which-base-suits-you">Alaçatı vs Çeşme: Which Base Suits You?</a> •
<a href="/guide/best-time-to-visit-aegean-coast">Best Time to Visit the Aegean Coast (Month-by-Month)</a> •
<a href="/guide/quiet-sleep-in-turkey-tips">Quiet Sleep in Turkey: How to Avoid Noisy Rooms</a> •
<a href="/guide/where-to-stay-in-turkey-couples-guide">Where to Stay in Turkey for Couples</a>
</p>

<!-- IMAGE_COVER_PLACEHOLDER -->

<hr/>

<h2>Pick your Alaçatı base in 60 seconds (UK travellers)</h2>
<ul>
  <li><strong>Stone-street atmosphere + boutique evenings</strong> → Alaçatı Centre</li>
  <li><strong>Same vibe, better sleep</strong> → quiet edge of town (walkable to centre)</li>
  <li><strong>Beach/water-first holiday (windsurf vibes)</strong> → beach side / water-adjacent base</li>
</ul>

<p><strong>Simple rule:</strong> Alaçatı is an <em>evening town</em> for most people. If you’re coming for the famous atmosphere, the centre (or a walkable quiet edge) usually wins.</p>

<hr/>

<h2>Alaçatı areas at a glance</h2>
<table>
  <thead>
    <tr>
      <th>Area style</th>
      <th>Best for</th>
      <th>Vibe</th>
      <th>What to expect</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Centre (old streets)</strong></td>
      <td>Couples, first-timers, short breaks</td>
      <td>Atmospheric, walkable, lively evenings</td>
      <td>Most “Alaçatı feeling”</td>
    </tr>
    <tr>
      <td><strong>Quiet edge of town</strong></td>
      <td>Better sleep + still walkable</td>
      <td>Calmer, practical</td>
      <td>Less noise, still easy access</td>
    </tr>
    <tr>
      <td><strong>Beach / windsurf side</strong></td>
      <td>Beach-first trips</td>
      <td>Water-focused, sporty</td>
      <td>More practical beach rhythm</td>
    </tr>
  </tbody>
</table>

<hr/>

<h2>1) Alaçatı Centre: the best choice for the “classic Alaçatı” experience</h2>
<p>If you’ve seen Alaçatı online and thought “that’s the vibe”, the centre is what you’re imagining: charming streets, boutique energy, and an easy evening routine where you can just wander and find your night.</p>

<h3>Choose Alaçatı Centre if…</h3>
<ul>
  <li>you want <strong>walkable evenings</strong> and atmosphere</li>
  <li>you’re doing a <strong>2–4 day</strong> UK-style short break</li>
  <li>you like “pick a place as you go” dinners and dessert strolls</li>
</ul>

<!-- IMAGE_CENTRE_PLACEHOLDER -->

<h3>Make the centre work better (sleep-friendly tip)</h3>
<ul>
  <li>If you’re sensitive to noise, choose a calmer street position and use:
    <a href="/guide/quiet-sleep-in-turkey-tips">Quiet Sleep in Turkey</a>.</li>
  <li>Do your exploring early evening, then keep later nights light if you want proper rest.</li>
</ul>

<hr/>

<h2>2) Quiet edge of town: the smartest “best of both” base</h2>
<p>This is often the sweet spot for UK travellers: you get Alaçatı’s atmosphere when you want it, but you’re not right in the busiest centre every night. It’s ideal for couples who want charm and comfort.</p>

<h3>Choose a quiet edge base if…</h3>
<ul>
  <li>you want <strong>easy sleep</strong> but don’t want to lose walkability</li>
  <li>you want the centre as an <strong>evening option</strong>, not a constant buzz</li>
  <li>you’re staying <strong>4–7 nights</strong> and need repeatable comfort</li>
</ul>

<p><strong>Best mindset:</strong> treat the centre like your “evening living room” and your base like your calm home.</p>

<hr/>

<h2>3) Beach / windsurf side: best for water-first days</h2>
<p>If your holiday is about beach time and being near the water, a base on the beach/windsurf side can make your days easier. This is the practical choice for travellers who want to spend most of their time by the sea and don’t need the old-street atmosphere on the doorstep.</p>

<h3>Choose the beach side if…</h3>
<ul>
  <li>your priority is <strong>being near the water</strong></li>
  <li>you want a sporty, beach-day rhythm</li>
  <li>you’re happy to go into the centre <strong>when you feel like it</strong></li>
</ul>

<!-- IMAGE_WINDSURF_PLACEHOLDER -->

<hr/>

<h2>Best base by traveller type (UK-friendly)</h2>

<h3>Couples</h3>
<ul>
  <li><strong>Most “Alaçatı magic”:</strong> Centre or quiet edge</li>
  <li><strong>Calm + comfort:</strong> quiet edge</li>
</ul>

<h3>Friends trips</h3>
<ul>
  <li><strong>Evenings-first:</strong> Centre</li>
  <li><strong>Beach-first:</strong> beach side</li>
</ul>

<h3>Longer stays (7+ nights)</h3>
<ul>
  <li><strong>Most repeatable:</strong> quiet edge (so you don’t burn out on the busiest streets)</li>
</ul>

<hr/>

<h2>How to choose without overthinking (the method that works)</h2>
<ul>
  <li><strong>If you’re coming for the vibe:</strong> stay centre or walkable quiet edge.</li>
  <li><strong>If you’re coming for beach time:</strong> stay beach side.</li>
  <li><strong>If you want both:</strong> choose quiet edge, and structure your trip: beach days + centre evenings.</li>
</ul>

<hr/>

<h2>Suggested 2–4 day flow (Alaçatı short break)</h2>
<ul>
  <li><strong>Day 1:</strong> arrive + centre stroll + relaxed dinner</li>
  <li><strong>Day 2:</strong> beach/water time + sunset + centre evening</li>
  <li><strong>Day 3:</strong> slow morning + cafés + one scenic nearby outing</li>
  <li><strong>Day 4 (optional):</strong> repeat your favourite vibe + easy departure</li>
</ul>

<hr/>

<h2>Common mistakes (framed positively)</h2>
<ul>
  <li><strong>Staying too central when you need sleep:</strong> choose the quiet edge and enjoy the centre as a “night out”.</li>
  <li><strong>Trying to plan every hour:</strong> Alaçatı is best when you wander.</li>
  <li><strong>Expecting a beach town feel in the centre:</strong> the centre is about atmosphere; the beach rhythm sits closer to the water side.</li>
</ul>

<hr/>

<h2>FAQs</h2>

<h3>What is the best area to stay in Alaçatı for UK travellers?</h3>
<p>Alaçatı Centre (or a walkable quiet edge) for the classic boutique vibe and evenings. Choose the beach/windsurf side if you’re coming mainly for water time.</p>

<h3>Is Alaçatı better for couples or families?</h3>
<p>Alaçatı is especially popular for couples and short breaks. Families can enjoy it too, but most families prefer a base with easier “all-day beach routine” unless they’re specifically coming for the atmosphere.</p>

<h3>Do I need a car in Alaçatı?</h3>
<p>Not always for a short break if you stay central, but a simple plan for beach access helps if you want to split time between town and water.</p>

<p><em>Last updated:</em> ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
`
};

async function run() {
    const timestamp = Date.now();
    console.log("🚀 Starting Alaçatı Article Automation...");

    // SAFE PROMPTS for Authentic Feel
    const imagesToGenerate = [
        {
            placeholder: '<!-- IMAGE_COVER_PLACEHOLDER -->',
            filename: `alacati-cover-overview-windmills-${timestamp}.jpg`,
            prompt: "Iconic stone windmills in Alacati, Turkey against a blue sky. Cobblestone street in foreground. Bougainvillea flowers. Authentic travel photo. Bright sunny day. Realistic colors. No filters."
        },
        {
            placeholder: '<!-- IMAGE_CENTRE_PLACEHOLDER -->',
            filename: `alacati-centre-stone-street-${timestamp}.jpg`,
            prompt: "A charming narrow street in Alacati centre. Stone houses with blue shutters. White tables and chairs outside cafes. Bougainvillea hanging. Soft afternoon light. Authentic village atmosphere. Realistic."
        },
        {
            placeholder: '<!-- IMAGE_WINDSURF_PLACEHOLDER -->',
            filename: `alacati-windsurf-beach-view-${timestamp}.jpg`,
            prompt: "Wide view of Alacati windsurfing bay. Turquoise shallow water. Colorful windsurf sails in the distance. Sandy beach in foreground. Bright sunny day. Sporty holiday vibe. Authentic photo."
        },
        {
            // Optional extra for quiet edge nuance if needed, or just insert at bottom if no placeholder
            // For now, I'll just generate it and maybe not use it if no placeholder, or I can insert it manually.
            // Let's stick to the 3 main ones + 1 extra generic
            placeholder: '',
            filename: `alacati-quiet-street-morning-${timestamp}.jpg`,
            prompt: "A quiet morning scene in a residential street of Alacati. Stone walls, olive tree, peaceful atmosphere. Soft morning sunlight. Authentic travel photography."
        }
    ];

    let finalContent = ARTICLE_DATA.content;
    let coverImageUrl = '';

    for (const item of imagesToGenerate) {
        if (!item.placeholder && !item.placeholder.includes('COVER')) await sleep(5000);
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
        title: { en: ARTICLE_DATA.title, tr: "Alaçatı'da Nerede Kalınır? (TR Pasif)" },
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
        console.log("✅ Alaçatı Article Added Successfully!");
        console.log("👉 Slug:", ARTICLE_DATA.slug);
    }
}

run();
