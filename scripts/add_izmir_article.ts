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
    slug: 'where-to-stay-in-izmir-weekend-guide',
    title: 'Where to Stay in Izmir: Best Areas for a UK Weekend + Easy Day Trips (British Guide)',
    meta_description: 'Planning a weekend in Izmir from the UK? Compare Alsancak, Konak, Karşıyaka, Bornova and Çeşme/Alaçatı-style add-ons—vibes, transport, and the best bases for day trips. No hotel names.',
    primary_keyword: 'where to stay in Izmir',
    content: `<p><strong>Quick answer:</strong> For most UK travellers doing a long weekend, <strong>Alsancak</strong> is the easiest base (walkable, lively, lots of food options). Choose <strong>Konak</strong> if you want classic “city-centre” convenience and sightseeing efficiency. Choose <strong>Karşıyaka</strong> if you want a local-feeling waterfront vibe across the bay with great evening strolls. Consider <strong>Bornova</strong> only if you have a specific reason (events/visiting friends) — most visitors prefer staying closer to the waterfront areas.</p>

<p>Izmir is a very UK-friendly city break because it’s relaxed, easy to navigate, and works brilliantly as a base for day trips (without trying to cram Turkey into 48 hours). The smart strategy is: <strong>pick one walkable base</strong>, then add <strong>one “hero” day trip</strong>.</p>

<p>Internal reads (placeholders):
<a href="/guide/izmir-weekend-itinerary-uk-friendly">Izmir Itinerary: 3 Days (UK Weekend Plan)</a> •
<a href="/guide/where-to-stay-near-ephesus-selcuk-vs-kusadasi-uk-guide">Ephesus Base: Selçuk vs Kuşadası</a> •
<a href="/guide/where-to-stay-in-alacati-best-areas-uk-guide">Where to Stay in Alaçatı (Boutique vs Beach)</a> •
<a href="/guide/best-time-to-visit-aegean-coast">Best Time to Visit the Aegean Coast</a> •
<a href="/guide/where-to-stay-in-turkey-first-time-uk-travellers">Where to Stay in Turkey (First-Time UK Travellers)</a>
</p>

<!-- IMAGE_COVER_PLACEHOLDER -->

<hr/>

<h2>Pick your Izmir base in 60 seconds (UK travellers)</h2>
<ul>
  <li><strong>First time + want the easiest weekend base</strong> → Alsancak</li>
  <li><strong>City-centre sights + transport convenience</strong> → Konak</li>
  <li><strong>Local waterfront vibe + calmer evenings</strong> → Karşıyaka</li>
  <li><strong>Using Izmir as a hub for day trips</strong> → Alsancak or Konak (most efficient)</li>
</ul>

<p><strong>Simple rule:</strong> For a UK-style weekend trip, you want a base where evenings are effortless (walk out, eat well, stroll the waterfront). Alsancak and Karşıyaka are especially strong for that.</p>

<hr/>

<h2>Izmir areas at a glance</h2>
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
      <td><strong>Alsancak</strong></td>
      <td>UK weekends, first-timers, food & evenings</td>
      <td>Lively, walkable, easy</td>
      <td>Great base for eating, strolling, simple plans</td>
    </tr>
    <tr>
      <td><strong>Konak</strong></td>
      <td>Sightseeing efficiency, transport convenience</td>
      <td>Classic city-centre feel</td>
      <td>Good for “do the sights” weekends</td>
    </tr>
    <tr>
      <td><strong>Karşıyaka</strong></td>
      <td>Local vibe, calmer waterfront evenings</td>
      <td>Relaxed, residential, scenic</td>
      <td>Feels more local; great promenade energy</td>
    </tr>
    <tr>
      <td><strong>Bornova</strong></td>
      <td>Specific reasons (events/visiting)</td>
      <td>Inland, practical</td>
      <td>Less “city break vibe” for most visitors</td>
    </tr>
  </tbody>
</table>

<hr/>

<h2>1) Alsancak: best all-round base for a UK weekend</h2>
<p>Alsancak is the easiest “I want this weekend to work” choice. It’s walkable, lively without being overwhelming, and it makes evenings effortless — which matters a lot on a 2–3 day trip.</p>

<h3>Choose Alsancak if…</h3>
<ul>
  <li>you want a <strong>walkable base</strong> with loads of food and café choices</li>
  <li>you want your weekend to feel easy, not planned to death</li>
  <li>you want a good balance of city energy and relaxed pacing</li>
</ul>

<!-- IMAGE_ALSANCAK_PLACEHOLDER -->

<h3>Best way to do Alsancak</h3>
<ul>
  <li><strong>Daytime:</strong> pick one core plan (market/sight/seafront).</li>
  <li><strong>Evenings:</strong> keep it simple — dinner + waterfront stroll.</li>
  <li><strong>One day:</strong> add one “hero” day trip (see the section below).</li>
</ul>

<hr/>

<h2>2) Konak: best for classic city-centre convenience</h2>
<p>Konak is ideal if you want the “central base” feeling and a weekend that leans more sightseeing-first. It’s efficient: you can tick off key city moments without spending your short trip commuting.</p>

<h3>Choose Konak if…</h3>
<ul>
  <li>you want <strong>classic city-centre convenience</strong></li>
  <li>you want your weekend to feel structured and efficient</li>
  <li>you’re treating Izmir as a gateway for day trips and want quick transport access</li>
</ul>

<!-- IMAGE_KONAK_PLACEHOLDER -->

<hr/>

<h2>3) Karşıyaka: best for a local-feeling waterfront weekend</h2>
<p>Karşıyaka is a great choice if you like the idea of a more local vibe. It’s relaxed, scenic, and brilliant for evening promenades. UK travellers often love it because it feels less “touristy” and more like living in the city for a few days.</p>

<h3>Choose Karşıyaka if…</h3>
<ul>
  <li>you want a <strong>calmer pace</strong> with a strong local feel</li>
  <li>you love <strong>waterfront walks</strong> and relaxed evenings</li>
  <li>you’re happy prioritising vibe over being right in the central tourist zone</li>
</ul>

<p><strong>Best mindset:</strong> choose Karşıyaka if your weekend is about enjoying the city rather than “ticking every sight”.</p>

<!-- IMAGE_KARSIYAKA_PLACEHOLDER -->

<hr/>

<h2>4) Bornova: when it makes sense (and when it doesn’t)</h2>
<p>Bornova can be practical for specific reasons, but for most UK visitors it doesn’t deliver the classic “seaside city break” feeling. If you want that Izmir magic — waterfront evenings, strolls, and easy café life — you’ll usually be happier in Alsancak/Konak/Karşıyaka.</p>

<hr/>

<h2>The best day trips from Izmir (UK-friendly, low-stress picks)</h2>
<p>On a weekend, aim for <strong>one day trip</strong> maximum. Two day trips turns Izmir into a transport mission and you lose the city-break joy.</p>

<h3>Hero day trip option A: Ephesus (culture highlight)</h3>
<p>If you want one “wow” cultural day, Ephesus is the headline choice. Keep it simple: go early, walk slowly, and don’t stack a second major site that day.</p>
<p>Base logic: <a href="/guide/where-to-stay-near-ephesus-selcuk-vs-kusadasi-uk-guide">Selçuk vs Kuşadası (Ephesus base)</a>.</p>

<h3>Hero day trip option B: Alaçatı / Çeşme vibe (boutique + beach feel)</h3>
<p>If you want a coastal vibe day — boutique streets, cafés, and water time — this is your move. It’s perfect for UK travellers who want a day that feels “Aegean holiday” without changing hotels.</p>
<p>Base logic: <a href="/guide/where-to-stay-in-alacati-best-areas-uk-guide">Where to Stay in Alaçatı</a>.</p>

<h3>Hero day trip option C: Slow coastal town day</h3>
<p>If you just want a relaxed day out: pick one coastal spot, do a long lunch, and return for an easy Izmir evening. This is the “holiday feeling” option.</p>

<hr/>

<h2>Best area in Izmir by traveller type (UK-friendly)</h2>

<h3>Couples</h3>
<ul>
  <li><strong>Best all-round:</strong> Alsancak</li>
  <li><strong>More local and calm:</strong> Karşıyaka</li>
</ul>

<h3>Friends weekend</h3>
<ul>
  <li><strong>Best pick:</strong> Alsancak (easy evenings and food options)</li>
</ul>

<h3>First-time city-break visitors</h3>
<ul>
  <li><strong>Best pick:</strong> Alsancak or Konak</li>
</ul>

<h3>Weekend + day trip travellers</h3>
<ul>
  <li><strong>Most efficient:</strong> Alsancak/Konak</li>
</ul>

<hr/>

<h2>How to make an Izmir weekend feel premium (without spending more)</h2>
<ul>
  <li><strong>Choose a walkable base.</strong> It saves time and makes nights easy.</li>
  <li><strong>Do one hero day trip only.</strong> Then enjoy Izmir properly.</li>
  <li><strong>Protect one slow evening.</strong> The waterfront stroll is part of the point.</li>
</ul>

<hr/>

<h2>Common mistakes (framed positively)</h2>
<ul>
  <li><strong>Over-planning day trips:</strong> one is perfect; two is usually too much for a UK weekend.</li>
  <li><strong>Staying far inland:</strong> Izmir’s magic is the waterfront vibe and evenings.</li>
  <li><strong>Treating Izmir like a checklist city:</strong> it’s better as a relaxed, lived-in weekend.</li>
</ul>

<hr/>

<h2>FAQs</h2>

<h3>What is the best area to stay in Izmir for UK travellers?</h3>
<p>Alsancak is the easiest all-round base for a weekend. Konak is best for city-centre convenience. Karşıyaka is great for a local-feeling waterfront vibe.</p>

<h3>Is Izmir worth visiting for a weekend from the UK?</h3>
<p>Yes — especially if you want a relaxed city break with great evenings and the option of one excellent day trip (Ephesus or Alaçatı-style Aegean vibe).</p>

<h3>How many days in Izmir is enough?</h3>
<p>For most UK travellers, 2–3 days is perfect. Add one day trip at most to keep the weekend enjoyable.</p>

<p><em>Last updated:</em> ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
`
};

async function run() {
    const timestamp = Date.now();
    console.log("🚀 Starting Izmir Article Automation...");

    // SAFE PROMPTS for Authentic Feel
    const imagesToGenerate = [
        {
            placeholder: '<!-- IMAGE_COVER_PLACEHOLDER -->',
            filename: `izmir-cover-clock-tower-sunset-${timestamp}.jpg`,
            prompt: "The iconic Izmir Clock Tower (Saat Kulesi) in Konak Square at sunset. Warm golden light. Palm trees, historical architecture. Authentic travel photo. Realistic."
        },
        {
            placeholder: '<!-- IMAGE_ALSANCAK_PLACEHOLDER -->',
            filename: `izmir-alsancak-kordon-view-${timestamp}.jpg`,
            prompt: "The Kordon seafront promenade in Izmir Alsancak. People sitting on grass, walking by the sea. Relaxed city atmosphere. Aegean Sea view with ships. Authentic travel photography. Bright day."
        },
        {
            placeholder: '<!-- IMAGE_KONAK_PLACEHOLDER -->',
            filename: `izmir-konak-kemeralti-bazaar-${timestamp}.jpg`,
            prompt: "A busy street in Kemeralti Bazaar, Izmir. Historic shops, locals exploring. Authentic Turkish market vibe. Colorful and textured. Realistic street photography."
        },
        {
            placeholder: '<!-- IMAGE_KARSIYAKA_PLACEHOLDER -->',
            filename: `izmir-karsiyaka-ferry-view-${timestamp}.jpg`,
            prompt: "View from an Izmir ferry looking towards Karsiyaka. Blue sea, seagulls, city skyline in background. Authentic commute. Bright sunny day. Realistic."
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
        title: { en: ARTICLE_DATA.title, tr: "İzmir'de Nerede Kalınır? Hafta Sonu Rehberi (TR Pasif)" },
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
        console.log("✅ Izmir Article Added Successfully!");
        console.log("👉 Slug:", ARTICLE_DATA.slug);
    }
}

run();
