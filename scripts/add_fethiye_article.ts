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
    slug: 'where-to-stay-in-fethiye-best-areas-uk-guide',
    title: 'Where to Stay in Fethiye: Ölüdeniz vs Hisarönü vs Çalış (Best Base for UK Travellers)',
    meta_description: 'Choosing between Ölüdeniz, Hisarönü and Çalış in Fethiye? Compare beaches, vibes, transport, nightlife, and who each area suits—UK-friendly, no hotel names.',
    primary_keyword: 'where to stay in Fethiye',
    content: `<p><strong>Quick answer:</strong> Choose <strong>Ölüdeniz</strong> if your priority is iconic beach scenery and a “wake up near the famous bit” holiday. Choose <strong>Hisarönü</strong> if you want a lively evening scene and you’re happy being a short ride from the beach. Choose <strong>Çalış</strong> if you want a relaxed, spacious feel with easy sunset evenings and a base that’s comfortable for longer stays.</p>

<p>Fethiye is one of the easiest UK-friendly destinations in Turkey because it works for so many trip styles: beach days, boat days, viewpoints, and gentle exploring. The key is picking the right base area—because each one feels like a different holiday.</p>

<p>Internal reads (placeholders):
<a href="/guide/where-to-stay-in-turkey-first-time-uk-guide">Where to Stay in Turkey (First-Time UK Travellers)</a> •
<a href="/guide/dalaman-airport-to-fethiye-transfer-options">Dalaman Airport to Fethiye/Ölüdeniz: Transfer Options</a> •
<a href="/guide/fethiye-itinerary-5-days-uk-friendly">Fethiye Itinerary: 5 Days (UK-Friendly)</a> •
<a href="/guide/oludeniz-beach-guide-best-plan">Ölüdeniz Guide: What to Do + Best Beach Plan</a> •
<a href="/guide/calis-beach-guide-sunset-walks">Çalış Beach Guide: Best Sunset Walks + Day Flow</a> •
<a href="/guide/fethiye-boat-trips-how-to-choose">Fethiye Boat Day: How to Choose a Good One</a>
</p>

<!-- IMAGE_COVER_PLACEHOLDER -->

<hr/>

<h2>Pick your Fethiye base in 60 seconds (UK travellers)</h2>
<ul>
  <li><strong>Iconic beach + postcard scenery</strong> → Ölüdeniz</li>
  <li><strong>Nightlife / lively evenings</strong> → Hisarönü</li>
  <li><strong>Relaxed base + sunsets + longer stay comfort</strong> → Çalış</li>
  <li><strong>Couples who want romantic pacing</strong> → Ölüdeniz or Çalış (depending on vibe)</li>
  <li><strong>Families who want easy routines</strong> → Çalış (often) or quieter parts near Ölüdeniz</li>
  <li><strong>Friends trip with social nights</strong> → Hisarönü</li>
</ul>

<p><strong>Simple rule:</strong> In Fethiye, pick your base based on your <em>evenings</em>. Your daytime adventures can happen from anywhere, but your evenings define how the holiday feels.</p>

<hr/>

<h2>At a glance: Ölüdeniz vs Hisarönü vs Çalış</h2>
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
      <td><strong>Ölüdeniz</strong></td>
      <td>Beach lovers, first-timers, couples</td>
      <td>Iconic, scenic, holiday-famous</td>
      <td>Beach-first days; popular in peak season</td>
    </tr>
    <tr>
      <td><strong>Hisarönü</strong></td>
      <td>Friends trips, lively evenings</td>
      <td>Social, energetic</td>
      <td>Short ride to the beach; nightlife focus</td>
    </tr>
    <tr>
      <td><strong>Çalış</strong></td>
      <td>Longer stays, relaxed pace, families</td>
      <td>Spacious, calm, sunset-friendly</td>
      <td>Comfortable base; easy evening walks</td>
    </tr>
  </tbody>
</table>

<hr/>

<h2>1) Ölüdeniz: best if you want the “iconic beach” holiday</h2>
<p>Ölüdeniz is for UK travellers who want that classic “this is why we came” feeling. It’s the base you choose when beach scenery is the main character and you want to be right there for morning swims and simple, beautiful days.</p>

<h3>Choose Ölüdeniz if…</h3>
<ul>
  <li>your priority is <strong>iconic beach scenery</strong></li>
  <li>you want a holiday that feels <strong>beach-first</strong> with minimal decision-making</li>
  <li>you’re doing <strong>3–5 nights</strong> and want a “single base, maximum holiday” plan</li>
  <li>you’re a couple who likes <strong>simple, scenic evenings</strong></li>
</ul>

<!-- IMAGE_OLUDENIZ_PLACEHOLDER -->

<h3>Best way to do Ölüdeniz (so it stays smooth)</h3>
<ul>
  <li><strong>Keep Day 1 and Day 2 beach-first.</strong> Don’t over-schedule immediately.</li>
  <li><strong>Add one “wow day” mid-trip:</strong> viewpoint / nature / boat day.</li>
  <li><strong>Evenings:</strong> keep it relaxed—pick one great dinner spot and make it a ritual.</li>
</ul>

<h3>Who Ölüdeniz suits most</h3>
<ul>
  <li><strong>Couples:</strong> yes (scenic, romantic pacing)</li>
  <li><strong>First-timers:</strong> yes (you’ll tick the headline experience)</li>
  <li><strong>Families:</strong> yes, if you choose a calm, routine-friendly setup</li>
</ul>

<p><strong>Internal link idea:</strong> pair this with <a href="/guide/oludeniz-beach-guide-best-plan">Ölüdeniz Guide</a> and <a href="/guide/fethiye-boat-trips-how-to-choose">Fethiye Boat Day</a>.</p>

<hr/>

<h2>2) Hisarönü: best for lively evenings (and a social holiday vibe)</h2>
<p>Hisarönü is a great choice if your group likes energy at night: going out after dinner, a busier evening scene, and a more social holiday feel. It’s also a popular “friends trip” base because your evenings are easy and your days can still be beach-focused with a short ride.</p>

<h3>Choose Hisarönü if…</h3>
<ul>
  <li>you want <strong>lively evenings</strong> as part of the holiday</li>
  <li>you’re travelling with friends and want a <strong>social base</strong></li>
  <li>you’re happy to <strong>travel a little</strong> for the beach experience</li>
</ul>

<!-- IMAGE_HISARONU_PLACEHOLDER -->

<h3>How to do Hisarönü properly (UK-friendly plan)</h3>
<ul>
  <li><strong>Daytime:</strong> plan your beach time in blocks (morning beach, afternoon rest).</li>
  <li><strong>Evenings:</strong> keep it simple—walkable plans, choose the vibe you want that night.</li>
  <li><strong>One day:</strong> do a boat day or a scenic nature day to add depth to the trip.</li>
</ul>

<h3>Who Hisarönü suits most</h3>
<ul>
  <li><strong>Friends trips:</strong> yes</li>
  <li><strong>Couples who want nightlife:</strong> yes</li>
  <li><strong>Families with small kids:</strong> usually better in Çalış or a calm beach base</li>
</ul>

<hr/>

<h2>3) Çalış: best for a relaxed base, easy sunsets, and longer stays</h2>
<p>Çalış is the “easy living” base. It’s a great pick when you want space, calm pacing, and evenings that feel effortless—sunset walks, relaxed meals, and a holiday rhythm that’s comfortable for 5–10 nights.</p>

<h3>Choose Çalış if…</h3>
<ul>
  <li>you want a <strong>relaxed, spacious</strong> feel</li>
  <li>you’re staying <strong>longer</strong> and want a base that’s easy day after day</li>
  <li>you like <strong>sunset evenings</strong> and calm routines</li>
  <li>you want a base that can handle <strong>mixed travel styles</strong> (beach days + exploring days)</li>
</ul>

<!-- IMAGE_CALIS_PLACEHOLDER -->

<h3>How to do Çalış (so it feels premium)</h3>
<ul>
  <li><strong>Build a simple daily rhythm:</strong> mornings for beach/boat plans, afternoons for rest, evenings for sunsets.</li>
  <li><strong>Choose 2–3 “big days” only</strong> across your whole stay (boat day + one nature day + one town day).</li>
  <li><strong>Keep the rest of the days light.</strong> That’s when Çalış shines.</li>
</ul>

<h3>Who Çalış suits most</h3>
<ul>
  <li><strong>Families:</strong> yes (easy routines)</li>
  <li><strong>Couples who want calm:</strong> yes</li>
  <li><strong>Travellers who hate rushing:</strong> yes</li>
</ul>

<p><strong>Internal link idea:</strong> pair this with <a href="/guide/calis-beach-guide-sunset-walks">Çalış Beach Guide</a> and <a href="/guide/fethiye-itinerary-5-days-uk-friendly">Fethiye Itinerary: 5 Days</a>.</p>

<hr/>

<h2>What about Fethiye Town (centre)?</h2>
<p>Some UK travellers prefer staying closer to Fethiye Town for a more “local, practical” base—especially if they like being near transport options, markets, and a wider choice of everyday cafés. If your holiday is a mix of exploring and relaxing (and you don’t need the beach right outside the door), Fethiye Town can be a smart base.</p>

<p><strong>Best for:</strong> travellers who like a “base camp” feel and plan multiple day trips.</p>

<hr/>

<h2>Best base by traveller type (UK-friendly)</h2>

<h3>Couples</h3>
<ul>
  <li><strong>Romantic + scenic:</strong> Ölüdeniz</li>
  <li><strong>Calm + sunset pacing:</strong> Çalış</li>
  <li><strong>Social nights:</strong> Hisarönü</li>
</ul>

<h3>Families</h3>
<ul>
  <li><strong>Easy routines:</strong> Çalış</li>
  <li><strong>Beach-first (choose calm setup):</strong> Ölüdeniz</li>
</ul>

<h3>Friends trips</h3>
<ul>
  <li><strong>Nightlife-first:</strong> Hisarönü</li>
  <li><strong>Balanced (day beach + evening variety):</strong> mix of Ölüdeniz access + social nights</li>
</ul>

<h3>Short stays (3–4 nights)</h3>
<ul>
  <li><strong>Best pick:</strong> Ölüdeniz (maximum “iconic” feeling in minimal time)</li>
</ul>

<h3>Longer stays (7–10 nights)</h3>
<ul>
  <li><strong>Best pick:</strong> Çalış (comfort and repeatable routines)</li>
</ul>

<hr/>

<h2>The “no-regrets” decision checklist</h2>
<ul>
  <li><strong>Do we care more about evenings or beaches?</strong> (evenings = Hisarönü/Town feel; beaches = Ölüdeniz; relaxed evenings = Çalış)</li>
  <li><strong>Are we okay with short rides for day trips and beaches?</strong> If yes, Hisarönü becomes a stronger option.</li>
  <li><strong>Are we staying 7+ nights?</strong> If yes, comfort bases like Çalış often feel better long-term.</li>
  <li><strong>Are we first-timers who want the headline experience?</strong> Ölüdeniz is usually the cleanest answer.</li>
</ul>

<hr/>

<h2>Easy planning: a 3–5 day flow (works from any base)</h2>
<ul>
  <li><strong>Day 1:</strong> settle in + beach / sunset evening</li>
  <li><strong>Day 2:</strong> main beach day (slow, simple)</li>
  <li><strong>Day 3:</strong> boat day (choose a comfortable pace)</li>
  <li><strong>Day 4:</strong> nature/viewpoint day OR town day</li>
  <li><strong>Day 5:</strong> repeat your favourite vibe + relaxed goodbye</li>
</ul>

<p>Internal link idea: <a href="/guide/fethiye-itinerary-5-days-uk-friendly">Fethiye Itinerary: 5 Days</a>.</p>

<hr/>

<h2>Common mistakes (framed positively)</h2>
<ul>
  <li><strong>Trying to do everything:</strong> Fethiye is better when you choose a few highlights and enjoy them properly.</li>
  <li><strong>Picking a base that doesn’t match your evenings:</strong> decide what you want your nights to feel like.</li>
  <li><strong>Stacking big day trips back-to-back:</strong> alternate “big day” with “beach day” for a smoother holiday.</li>
</ul>

<hr/>

<h2>FAQs</h2>

<h3>Is Ölüdeniz or Çalış better for UK travellers?</h3>
<p>Ölüdeniz is better if you want iconic beach scenery and a headline experience. Çalış is better if you want relaxed pacing, easy sunsets, and a base that feels comfortable for longer stays.</p>

<h3>Is Hisarönü far from the beach?</h3>
<p>Hisarönü is typically chosen as a lively base where you do beach time as a planned part of the day (a short ride), then enjoy social evenings back in the area.</p>

<h3>Where should families stay in Fethiye?</h3>
<p>Many families love Çalış for its relaxed routine. Ölüdeniz also works well if your family is beach-first and you keep the plan simple.</p>

<h3>Where should couples stay?</h3>
<p>Ölüdeniz for scenic romance, Çalış for calm sunset evenings, Hisarönü for a more lively nights-focused trip.</p>

<p><em>Last updated:</em> ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
`
};

async function run() {
    const timestamp = Date.now();
    console.log("🚀 Starting Fethiye Article Automation...");

    // SAFE PROMPTS - Authentic Style, Avoids unsafe keywords
    const imagesToGenerate = [
        {
            placeholder: '<!-- IMAGE_COVER_PLACEHOLDER -->',
            filename: `fethiye-cover-overview-scenic-${timestamp}.jpg`,
            prompt: "A stunning panoramic view of Oludeniz Blue Lagoon from above (Babadag). Turquoise water, white sand beach, lush green mountains in background. Authentic travel photography. Bright daylight. Realistic colors. No filters."
        },
        {
            placeholder: '<!-- IMAGE_OLUDENIZ_PLACEHOLDER -->',
            filename: `fethiye-oludeniz-beach-relax-${timestamp}.jpg`,
            prompt: "People relaxing on Oludeniz beach in Fethiye. Turquoise calm water. Paragliders in the distant sky. Bright sunny day. Authentic holiday vibe. Low angle perspective. Realistic textures."
        },
        {
            placeholder: '<!-- IMAGE_HISARONU_PLACEHOLDER -->',
            filename: `fethiye-hisaronu-evening-street-${timestamp}.jpg`,
            prompt: "Evening street scene in Hisaronu, Fethiye. Lively atmosphere, tourists walking, colorful shop lights. Warm summer night vibe. Authentic street photography. Depth of field."
        },
        {
            placeholder: '<!-- IMAGE_CALIS_PLACEHOLDER -->',
            filename: `fethiye-calis-sunset-promenade-${timestamp}.jpg`,
            prompt: "Sunset view from Calis beach promenade. Silhouette of palm trees. People walking along the coast. Golden hour light reflecting on the sea. Authentic travel photo. Calm atmosphere."
        },
        { // Extra context image
            filename: `fethiye-boat-trip-day-${timestamp}.jpg`,
            placeholder: '', // Just generating to have it, or could append at end if needed, but for now specific spots
            prompt: "A wooden gulet boat anchored in a clear turquoise bay near Fethiye. People swimming near the boat. Bright blue water. Authentic summer holiday vibe. Realistic."
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
        title: { en: ARTICLE_DATA.title, tr: "Fethiye'de Nerede Kalınır? (TR Pasif)" },
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
        console.log("✅ Fethiye Article Added Successfully!");
        console.log("👉 Slug:", ARTICLE_DATA.slug);
    }
}

run();
