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
    slug: 'what-to-pack-for-turkey-holiday-list',
    title: 'What to Pack for Turkey: UK Holiday Packing List (2026)',
    meta_description: 'A UK-friendly Turkey packing list for city breaks and beach holidays. Clothes, footwear, plugs, meds and cultural tips—plus printable checklists.',
    content: `
<h1>What to Pack for Turkey: A UK Traveller’s Packing List (City Break + Beach Holiday)</h1>

<p><strong>Quick answer:</strong> Pack for <strong>your trip style</strong> (Istanbul city break vs beach holiday), then pack for <strong>comfort</strong> (walking shoes, layers, sun protection) and <strong>backup</strong> (power bank, copies of documents, a small first-aid kit). The biggest mistake UK travellers make is packing only for “hot weather” and forgetting how much walking and changing temperatures can affect the day.</p>

<p>If you’re still choosing where in Turkey you’ll base yourself, start here:
<a href="/guide/where-to-stay-in-turkey-first-time-guide">Where to Stay in Turkey (UK First-Timer Area Guide)</a>.
And if you’re planning dates:
<a href="/guide/best-time-to-visit-turkey">Best Time to Visit Turkey (Month-by-Month)</a>.
</p>

<hr/>

<!-- IMAGE_COVER_PLACEHOLDER -->

<h2>The only thing you need to decide first: your Turkey “style”</h2>
<p>Pick the box that matches your trip:</p>
<ul>
  <li><strong>Istanbul-heavy city break:</strong> lots of walking, cafés, museums, evenings out.</li>
  <li><strong>Coastal beach holiday:</strong> swimwear, sun protection, easy outfits, sandals.</li>
  <li><strong>Mixed trip (Istanbul + coast):</strong> you need both — but you can keep it light with smart layers.</li>
  <li><strong>Cappadocia:</strong> early mornings, outdoor viewpoints, layers, comfortable shoes.</li>
</ul>

<p>Area guides (choose your base):
<a href="/guide/where-to-stay-in-istanbul-best-areas-guide">Istanbul</a>,
<a href="/guide/where-to-stay-in-antalya-best-areas-guide">Antalya</a>,
<a href="/guide/where-to-stay-in-fethiye-best-areas-guide">Fethiye</a>,
<a href="/guide/where-to-stay-in-bodrum-best-areas-guide">Bodrum</a>,
<a href="/guide/where-to-stay-in-cappadocia-best-areas-guide">Cappadocia</a>.
</p>

<hr/>

<h2>Core essentials (pack these no matter where you go)</h2>

<h3>Documents + money</h3>
<ul>
  <li><strong>Passport</strong> + a digital photo/scan stored securely.</li>
  <li><strong>Travel insurance details</strong> (policy number + emergency contact).</li>
  <li><strong>Two payment methods:</strong> main card + backup card (kept separate).</li>
  <li><strong>Some cash in TRY</strong> for small purchases and backup.</li>
</ul>

<p>Money tips for UK travellers:
<a href="/guide/cash-or-card-in-turkey">Cash or Card in Turkey?</a>
</p>

<h3>Tech + power</h3>
<ul>
  <li><strong>Phone + charger</strong></li>
  <li><strong>Power bank</strong> (especially if you’ll use maps/camera all day)</li>
  <li><strong>Multi-USB plug</strong> if you’re travelling with a partner/friends</li>
  <li><strong>Headphones</strong> for flights and city travel</li>
</ul>

<h3>Health + comfort basics</h3>
<ul>
  <li><strong>Any prescription meds</strong> in original packaging</li>
  <li><strong>Plasters/blister pads</strong> (walking can surprise you)</li>
  <li><strong>Pain relief</strong> and any personal essentials you rely on</li>
  <li><strong>Hand sanitiser</strong> and tissues</li>
</ul>

<hr/>

<h2>What to wear in Turkey (UK-friendly, realistic)</h2>
<p>Turkey is diverse. What feels right depends on where you are and what you’re doing that day. The best approach is to pack <strong>light layers</strong> and choose outfits that work for walking.</p>

<h3>Clothing that works in most situations</h3>
<ul>
  <li><strong>Breathable tops</strong> you can mix and match</li>
  <li><strong>Lightweight trousers/skirts</strong> for evenings and city days</li>
  <li><strong>One “smart-casual” outfit</strong> for nicer dinners</li>
  <li><strong>A light jacket or overshirt</strong> for cooler evenings or air conditioning</li>
</ul>

<h3>Mosques and respectful dress (simple rule)</h3>
<p>If you plan to visit mosques, dress modestly out of respect. A light scarf or cover-up can make things easy without needing to overpack.</p>

<hr/>

<h2>Footwear: the most important “non-obvious” packing item</h2>
<p>If you do Istanbul or Cappadocia, shoes matter more than outfits.</p>
<ul>
  <li><strong>Comfortable walking trainers</strong> (your “city day” default)</li>
  <li><strong>Sandals you can walk in</strong> (not just pool slides)</li>
  <li><strong>Optional:</strong> slightly smarter footwear for evenings</li>
</ul>

<p><strong>Pro tip:</strong> If you’re prone to blisters, bring blister pads. They’re tiny but holiday-saving.</p>

<!-- IMAGE_CITY_WALK_PLACEHOLDER -->

<hr/>

<h2>Packing list for a beach holiday (Antalya / Fethiye / Bodrum)</h2>

<h3>Beach essentials</h3>
<ul>
  <li>Swimwear (2 if you can — so one can dry)</li>
  <li>Sun cream (high SPF) + lip SPF</li>
  <li>After-sun or soothing moisturiser</li>
  <li>Sunglasses + hat/cap</li>
  <li>Light cover-up for walking to lunch</li>
</ul>

<h3>Optional but useful</h3>
<ul>
  <li>Waterproof phone pouch (if you’re on boats/beaches often)</li>
  <li>Quick-dry towel (only if you prefer your own)</li>
  <li>Reusable water bottle</li>
</ul>

<p>Choose the right base area so your beach days are effortless:
<a href="/guide/where-to-stay-in-antalya-best-areas-guide">Antalya</a>,
<a href="/guide/where-to-stay-in-fethiye-best-areas-guide">Fethiye</a>,
<a href="/guide/where-to-stay-in-bodrum-best-areas-guide">Bodrum</a>.
</p>

<!-- IMAGE_BEACH_GEAR_PLACEHOLDER -->

<hr/>

<h2>Packing list for Istanbul (city break essentials)</h2>
<ul>
  <li>Comfortable trainers (walking is constant)</li>
  <li>Light layers (for changing temps and indoor air-con)</li>
  <li>Small crossbody bag with a zip</li>
  <li>Power bank (maps + photos)</li>
  <li>A “quiet night” item if you’re noise-sensitive (earplugs can help)</li>
</ul>

<p>Istanbul base choice matters a lot:
<a href="/guide/where-to-stay-in-istanbul-best-areas-guide">Where to Stay in Istanbul</a>.
</p>

<hr/>

<h2>Packing list for Cappadocia (the “early mornings” add-on)</h2>
<ul>
  <li>Layers for early starts (even if days warm up)</li>
  <li>Comfortable walking shoes</li>
  <li>Light rain/wind layer (just in case)</li>
  <li>Camera/phone storage space (you will take loads of photos)</li>
</ul>

<p>Choose the right base town/area:
<a href="/guide/where-to-stay-in-cappadocia-best-areas-guide">Where to Stay in Cappadocia</a>.
</p>

<!-- IMAGE_LAYERS_PLACEHOLDER -->

<hr/>

<h2>What NOT to pack (save space and stress)</h2>
<ul>
  <li><strong>Too many “just in case” outfits.</strong> Pack outfits that mix and match instead.</li>
  <li><strong>Unwalkable shoes.</strong> You’ll regret them in Istanbul and on uneven streets.</li>
  <li><strong>Loads of cash.</strong> Use a card-first plan plus a small TRY buffer.</li>
  <li><strong>Overly heavy luggage.</strong> Transfers and stairs can make this miserable.</li>
</ul>

<hr/>

<h2>Printable checklists (copy/paste)</h2>

<h3>Minimalist 7-day packing checklist</h3>
<ul>
  <li>Passport + copies</li>
  <li>2 cards + small TRY cash</li>
  <li>Phone + charger + power bank</li>
  <li>Walking shoes + sandals</li>
  <li>5–7 tops + 2–3 bottoms (mix & match)</li>
  <li>Light jacket/overshirt</li>
  <li>Swimwear + sun protection (if coast)</li>
  <li>Basic meds + blister pads</li>
</ul>

<h3>Safety + money checklist</h3>
<ul>
  <li>Keep backup card separate</li>
  <li>Use zipped crossbody bag in crowds</li>
  <li>Pay in TRY (not GBP) when asked</li>
  <li>Save emergency number and your accommodation address</li>
</ul>

<p>Money guide:
<a href="/guide/cash-or-card-in-turkey">Cash or Card in Turkey?</a>
<br/>
Safety guide:
<a href="/guide/is-turkey-safe-to-visit-uk-travel-checklist">Is Turkey Safe to Visit? (UK Checklist)</a>
</p>

<hr/>

<h2>FAQs</h2>

<h3>Do I need to pack lots of cash for Turkey?</h3>
<p>Most UK travellers don’t need to. A common approach is card for most spending plus a small TRY cash buffer for small purchases and backup.</p>

<h3>What should I wear in Turkey?</h3>
<p>Pack breathable, comfortable outfits for walking, plus a light layer for evenings and air-conditioned spaces. If you plan mosque visits, pack a modest cover-up option to make life easy.</p>

<h3>What’s the most important thing to pack for Istanbul?</h3>
<p>Comfortable walking shoes, a power bank, and layers. Istanbul is a walking city if you want to enjoy it properly.</p>

<h3>What’s the biggest packing mistake?</h3>
<p>Overpacking outfits and underpacking comfort items (walking shoes, sun protection, layers). Comfort usually matters more than having “one more nice top”.</p>

<p><em>Last updated:</em> ${new Date().toLocaleDateString('en-GB')}</p>
`
};

async function addPackingArticle() {
    const timestamp = Date.now();

    // --- Authentic Mode Prompts (Imagen 3) ---
    const imagesToGenerate = [
        {
            placeholder: '<!-- IMAGE_COVER_PLACEHOLDER -->',
            filename: `packing-cover-${timestamp}.jpg`,
            prompt: "A high quality flatlay photo of travel essentials for Turkey on a wooden surface. Passport, sunglasses, camera, walking shoes, Turkish Lira, sunscreen. Authentic travel preparation style. Bright natural light."
        },
        {
            placeholder: '<!-- IMAGE_CITY_WALK_PLACEHOLDER -->',
            filename: `packing-city-walk-${timestamp}.jpg`,
            prompt: "A close-up shot of feet wearing comfortable stylish walking trainers on a cobblestone street in Istanbul. Authentic travel perspective. Soft focus background."
        },
        {
            placeholder: '<!-- IMAGE_BEACH_GEAR_PLACEHOLDER -->',
            filename: `packing-beach-gear-${timestamp}.jpg`,
            prompt: "A beach bag with essentials spilling out on a sun lounger. Hat, book, sunscreen, water bottle. Sea in background. Authentic holiday vibe. Realistic colors."
        },
        {
            placeholder: '<!-- IMAGE_LAYERS_PLACEHOLDER -->',
            filename: `packing-cappadocia-layers-${timestamp}.jpg`,
            prompt: "A tourist in Cappadocia at sunrise, wearing layers (jacket, scarf) watching hot air balloons. Back view. Authentic early morning atmosphere. Soft cool light."
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
        title: { en: ARTICLE_DATA.title, tr: "Türkiye İçin Bavul Hazırlığı: Paketleme Listesi" },
        meta_description: { en: ARTICLE_DATA.meta_description, tr: "Şehir turu ve plaj tatili için eksiksiz Türkiye bavul hazırlama rehberi." },
        content: { en: finalContent, tr: "<p>Çeviri yakında...</p>" },
        cover_image_url: coverImageUrl,
        published_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    }, { onConflict: 'slug' });

    if (error) {
        console.error("❌ DB Insert Failed:", error);
    } else {
        console.log("✅ Packing List Article Added Successfully with Imagen 3 Images!");
    }
}

addPackingArticle();
