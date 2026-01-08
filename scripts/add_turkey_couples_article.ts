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
    slug: 'where-to-stay-in-turkey-couples-guide',
    title: 'Where to Stay in Turkey for Couples: Most Romantic Regions & Best Areas (UK Guide)',
    meta_description: 'Planning a couple’s trip to Turkey from the UK? Find the most romantic regions and the best areas to stay—city breaks, beach escapes, cave-town vibes and calm coastal bases. No hotel names.',
    primary_keyword: 'where to stay in Turkey for couples',
    content: `<p><strong>Quick answer:</strong> For a romantic city break, base in <strong>Istanbul</strong> (choose a neighbourhood that matches your vibe). For a “wow scenery” couples trip, <strong>Cappadocia</strong> is the headline. For a stylish Aegean escape, choose <strong>Bodrum</strong> (marina-and-sunset energy). For a calm, scenic coastal reset, choose <strong>Kaş</strong> or <strong>Fethiye</strong> (beach days + beautiful evenings).</p>

<p>This guide is written for UK travellers planning Turkey as a couple — which usually means one of three things: <strong>(1) a long weekend, (2) a 7–10 night beach escape, or (3) a split trip</strong> (city + scenery). The secret is picking a base that makes evenings effortless: the best couple trips are built on great evenings.</p>

<p>Internal reads (placeholders):
<a href="/guide/where-to-stay-in-istanbul-best-areas-guide">Where to Stay in Istanbul (Best Areas)</a> •
<a href="/guide/where-to-stay-in-cappadocia-best-towns-guide">Where to Stay in Cappadocia (Best Towns)</a> •
<a href="/guide/where-to-stay-in-bodrum-best-areas-guide-uk">Where to Stay in Bodrum (Best Areas)</a> •
<a href="/guide/where-to-stay-in-fethiye-best-areas-uk-guide">Where to Stay in Fethiye (Ölüdeniz vs Hisarönü vs Çalış)</a> •
<a href="/guide/where-to-stay-in-kas-best-areas-uk-guide">Where to Stay in Kaş (Best Areas)</a> •
<a href="/guide/best-time-to-visit-turkey-month-by-month">Best Time to Visit Turkey (Month-by-Month)</a>
</p>

<!-- IMAGE_COVER_PLACEHOLDER -->

<hr/>

<h2>Pick your romantic Turkey base in 60 seconds (UK couples)</h2>
<ul>
  <li><strong>3–4 nights, city break energy</strong> → Istanbul (romance = neighbourhood choice)</li>
  <li><strong>4–6 nights, “wow scenery” trip</strong> → Cappadocia (town choice matters)</li>
  <li><strong>7–10 nights, stylish Aegean romance</strong> → Bodrum (area choice matters)</li>
  <li><strong>7–10 nights, calm coastal reset</strong> → Kaş or Fethiye</li>
  <li><strong>Split trip (best of everything)</strong> → Istanbul + Cappadocia OR Istanbul + Aegean coast</li>
</ul>

<p><strong>Simple rule:</strong> Couples trips become romantic when logistics are easy. Choose places where you can have beautiful evenings without constant transport stress.</p>

<hr/>

<h2>The most romantic regions in Turkey (UK-friendly shortlist)</h2>
<table>
  <thead>
    <tr>
      <th>Region</th>
      <th>Best for</th>
      <th>Romance style</th>
      <th>Best length</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Istanbul</strong></td>
      <td>Long weekends</td>
      <td>Neighbourhood strolls + views</td>
      <td>3–5 nights</td>
    </tr>
    <tr>
      <td><strong>Cappadocia</strong></td>
      <td>“Wow scenery” couples trip</td>
      <td>Sunrise moments + cave-town atmosphere</td>
      <td>2–4 nights</td>
    </tr>
    <tr>
      <td><strong>Bodrum</strong></td>
      <td>Stylish Aegean romance</td>
      <td>Sunset dinners + marina vibe</td>
      <td>5–10 nights</td>
    </tr>
    <tr>
      <td><strong>Kaş</strong></td>
      <td>Calm coastal reset</td>
      <td>Swim spots + quiet nights</td>
      <td>4–10 nights</td>
    </tr>
    <tr>
      <td><strong>Fethiye</strong></td>
      <td>Variety trip (beach + boat days)</td>
      <td>Iconic scenery + easy day flow</td>
      <td>5–10 nights</td>
    </tr>
    <tr>
      <td><strong>Alaçatı (Aegean)</strong></td>
      <td>Boutique short breaks</td>
      <td>Stone-street evenings + cafés</td>
      <td>2–4 nights</td>
    </tr>
  </tbody>
</table>

<hr/>

<h2>1) Istanbul for couples: the romance is in the neighbourhood choice</h2>
<p>Istanbul is romantic when you choose a base that matches your couple style: calm and scenic, or lively and social. UK travellers often love Istanbul because it delivers “big city excitement” with very memorable evenings.</p>

<h3>Best Istanbul base styles for couples (no hotel names)</h3>
<ul>
  <li><strong>Views + classic romance feel:</strong> choose a base that supports sunset walks and iconic scenery.</li>
  <li><strong>Food + lively evenings:</strong> choose a base where you can wander and pick your night.</li>
  <li><strong>Calm and comfortable:</strong> choose somewhere that makes sleep easy after long walking days.</li>
</ul>

<p>Read: <a href="/guide/where-to-stay-in-istanbul-best-areas-guide">Where to Stay in Istanbul (Best Areas)</a>.</p>

<!-- IMAGE_ISTANBUL_PLACEHOLDER -->

<hr/>

<h2>2) Cappadocia for couples: the “wow scenery” pick</h2>
<p>If you want the trip to feel like a once-in-a-lifetime moment, Cappadocia is the cleanest answer. It’s built for couples: slow mornings, scenic viewpoints, and a rhythm that naturally feels romantic.</p>

<h3>How to make Cappadocia feel romantic (without over-planning)</h3>
<ul>
  <li><strong>Stay 2–4 nights.</strong> One night is usually too rushed.</li>
  <li><strong>Do one sunrise moment.</strong> Keep the rest of the day gentle.</li>
  <li><strong>Pick a base town that matches your pace.</strong> (We cover the best towns in the Cappadocia base guide.)</li>
</ul>

<p>Read: <a href="/guide/where-to-stay-in-cappadocia-best-towns-guide">Where to Stay in Cappadocia (Best Towns)</a>.</p>

<!-- IMAGE_CAPPADOCIA_PLACEHOLDER -->

<hr/>

<h2>3) Bodrum for couples: stylish, sunset-led romance</h2>
<p>Bodrum is romantic when you choose the right area. For couples, it’s less about “doing everything” and more about choosing a base that gives you beautiful evenings and a calm daytime flow.</p>

<h3>Best Bodrum area styles for couples (no hotel names)</h3>
<ul>
  <li><strong>Marina + sunset dinners:</strong> a polished, scenic base.</li>
  <li><strong>Walkable evenings + variety:</strong> a more central, easy base.</li>
  <li><strong>Quiet reset:</strong> calmer bays and quieter corners.</li>
</ul>

<p>Read: <a href="/guide/where-to-stay-in-bodrum-best-areas-guide-uk">Where to Stay in Bodrum (Best Areas)</a>.</p>

<!-- IMAGE_BODRUM_PLACEHOLDER -->

<hr/>

<h2>4) Kaş for couples: calm nights and beautiful swim spots</h2>
<p>Kaş is one of Turkey’s best couple bases if you want calm, scenic days and truly relaxed evenings. It’s not trying to be loud or busy — it’s a “slow, beautiful” holiday.</p>

<p>Read: <a href="/guide/where-to-stay-in-kas-best-areas-uk-guide">Where to Stay in Kaş (Best Areas)</a>.</p>

<hr/>

<h2>5) Fethiye for couples: variety without stress</h2>
<p>Fethiye is ideal if you want a romantic trip that also includes variety: iconic beach days, a boat day, a viewpoint day — without turning the holiday into a constant travel mission.</p>

<h3>Best Fethiye base styles for couples (no hotel names)</h3>
<ul>
  <li><strong>Iconic scenery base:</strong> for “postcard” days</li>
  <li><strong>Relaxed sunset base:</strong> for calm evenings and comfort</li>
  <li><strong>Lively evenings base:</strong> for social nights (if you want that)</li>
</ul>

<p>Read: <a href="/guide/where-to-stay-in-fethiye-best-areas-uk-guide">Where to Stay in Fethiye</a>.</p>

<hr/>

<h2>6) Alaçatı for couples: boutique vibe short breaks</h2>
<p>Alaçatı is perfect for a couple-style short break: stone streets, cafés, and evenings that feel effortless. It’s romantic because it’s simple.</p>

<p>Read: <a href="/guide/where-to-stay-in-alacati-best-areas-uk-guide">Where to Stay in Alaçatı</a>.</p>

<hr/>

<h2>The “most romantic” choice depends on your couple style</h2>
<ul>
  <li><strong>If you love big-city energy:</strong> Istanbul</li>
  <li><strong>If you want wow scenery:</strong> Cappadocia</li>
  <li><strong>If you want stylish sunsets:</strong> Bodrum</li>
  <li><strong>If you want quiet swim days:</strong> Kaş</li>
  <li><strong>If you want variety without stress:</strong> Fethiye</li>
</ul>

<hr/>

<h2>Two UK-friendly templates (copy-paste planning)</h2>

<h3>Template A: 7-day “best of” couples trip</h3>
<ul>
  <li><strong>3–4 nights:</strong> Istanbul</li>
  <li><strong>3–4 nights:</strong> Cappadocia <em>or</em> Aegean coast (Bodrum/Fethiye/Kaş)</li>
</ul>

<h3>Template B: 10-day slow romantic trip</h3>
<ul>
  <li><strong>3 nights:</strong> Istanbul</li>
  <li><strong>3 nights:</strong> Cappadocia</li>
  <li><strong>4 nights:</strong> Aegean/Mediterranean coast (choose one base)</li>
</ul>

<hr/>

<h2>Common mistakes (framed positively)</h2>
<ul>
  <li><strong>Trying to do too many regions:</strong> romance improves when you slow down.</li>
  <li><strong>Picking the wrong base area:</strong> choose for your evenings (walkable, calm, or stylish).</li>
  <li><strong>Over-planning every day:</strong> leave space for slow meals and sunset moments.</li>
</ul>

<hr/>

<h2>FAQs</h2>

<h3>What is the most romantic place in Turkey for UK couples?</h3>
<p>Cappadocia is the “wow scenery” romantic pick, Istanbul is best for city-break romance, and Kaş/Fethiye/Bodrum are great for coastal romance depending on your vibe.</p>

<h3>Is Turkey good for a couples holiday from the UK?</h3>
<p>Yes — especially if you choose one main base that matches your pace, then build the trip around easy evenings and a few standout days.</p>

<h3>How many days do couples need in Turkey?</h3>
<p>For a meaningful couples trip, 7–10 days is ideal. For a long weekend, Istanbul is the easiest romantic option.</p>

<p><em>Last updated:</em> ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
`
};

async function run() {
    const timestamp = Date.now();
    console.log("🚀 Starting Turkey Couples Article Automation...");

    // SAFE PROMPTS for Authentic Feel
    const imagesToGenerate = [
        {
            placeholder: '<!-- IMAGE_COVER_PLACEHOLDER -->',
            filename: `turkey-couples-cappadocia-sunrise-balloons-${timestamp}.jpg`,
            prompt: "Epic view of hot air balloons flying over Cappadocia chimneys at sunrise. Soft golden hour light. Romantic and authentic travel photography. Realistic stunning landscape."
        },
        {
            placeholder: '<!-- IMAGE_ISTANBUL_PLACEHOLDER -->',
            filename: `turkey-couples-istanbul-galata-view-${timestamp}.jpg`,
            prompt: "A romantic view in Istanbul overlooking the Bosphorus and Galata Tower at twilight. Warm evening city lights. Authentic atmosphere on a rooftop terrace. Realistic travel photo."
        },
        {
            placeholder: '<!-- IMAGE_CAPPADOCIA_PLACEHOLDER -->',
            filename: `turkey-couples-cappadocia-cave-hotel-${timestamp}.jpg`,
            prompt: "A charming cave hotel terrace in Cappadocia with Turkish carpets and cushions. View of the unique rock formations. Authentic and cozy atmosphere. Soft daylight."
        },
        {
            placeholder: '<!-- IMAGE_BODRUM_PLACEHOLDER -->',
            filename: `turkey-couples-bodrum-sunset-dining-${timestamp}.jpg`,
            prompt: "A romantic seaside dinner setting in Bodrum at sunset. White tablecloth, Aegean sea view, silhouette of Bodrum castle in distance. Authentic stylish travel photo. Realistic."
        }
    ];

    let finalContent = ARTICLE_DATA.content;
    let coverImageUrl = '';

    for (const item of imagesToGenerate) {
        if (!item.placeholder.includes('COVER')) await sleep(5000);
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
        title: { en: ARTICLE_DATA.title, tr: "Türkiye'de Çiftler İçin Nerede Kalınır? (TR Pasif)" },
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
        console.log("✅ Turkey Couples Article Added Successfully!");
        console.log("👉 Slug:", ARTICLE_DATA.slug);
    }
}

run();
