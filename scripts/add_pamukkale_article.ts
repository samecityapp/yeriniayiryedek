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
    slug: 'where-to-stay-in-pamukkale-best-area-uk-guide',
    title: 'Where to Stay in Pamukkale: Best Area + How Many Nights You Really Need (UK Guide)',
    meta_description: 'Planning Pamukkale? Learn the best area to stay (Pamukkale village vs Denizli), how many nights you really need, and the easiest UK-friendly plan for terraces + ancient sights. No hotel names.',
    primary_keyword: 'where to stay in Pamukkale',
    content: `<p><strong>Quick answer:</strong> Stay in <strong>Pamukkale village</strong> if you want the simplest plan and the easiest early access to the terraces and the ancient-site atmosphere. Stay in <strong>Denizli</strong> if you want a bigger city base with more everyday choice and you’re happy to travel to Pamukkale for your main visit.</p>

<p>Most UK travellers who are coming specifically for Pamukkale will find that <strong>Pamukkale village is the most efficient base</strong> — especially if you want to start early and keep the day calm. Denizli makes more sense if Pamukkale is a day trip inside a wider itinerary and you prefer a city base.</p>

<p>Internal reads (placeholders):
<a href="/guide/turkey-itinerary-7-days-classic-route">Turkey Itinerary 7 Days: Classic Route</a> •
<a href="/guide/turkey-itinerary-10-days-istanbul-cappadocia-coast">Turkey Itinerary 10 Days: Istanbul + Cappadocia + Coast</a> •
<a href="/guide/best-time-to-visit-turkey-month-by-month">Best Time to Visit Turkey (Month-by-Month)</a> •
<a href="/guide/izmir-weekend-itinerary-uk-friendly">Izmir Weekend Guide (UK-Friendly)</a> •
<a href="/guide/where-to-stay-near-ephesus-selcuk-vs-kusadasi-uk-guide">Ephesus Base: Selçuk vs Kuşadası</a>
</p>

<!-- IMAGE_COVER_PLACEHOLDER -->

<hr/>

<h2>Pick your Pamukkale base in 60 seconds (UK travellers)</h2>
<ul>
  <li><strong>“Pamukkale is the main reason we’re coming”</strong> → Pamukkale village</li>
  <li><strong>“We want the calmest, easiest early start”</strong> → Pamukkale village</li>
  <li><strong>“Pamukkale is a day trip in a bigger route”</strong> → Denizli (city base)</li>
  <li><strong>“We like having more everyday choice at night”</strong> → Denizli</li>
</ul>

<p><strong>Simple rule:</strong> If you’re doing Pamukkale properly (terraces + ancient site) and want it to feel relaxed, stay in Pamukkale village for at least one night.</p>

<hr/>

<h2>Pamukkale village vs Denizli at a glance</h2>
<table>
  <thead>
    <tr>
      <th>Category</th>
      <th>Pamukkale village</th>
      <th>Denizli</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Best for</strong></td>
      <td>Efficient Pamukkale visit, calm pacing</td>
      <td>City base + day trip to Pamukkale</td>
    </tr>
    <tr>
      <td><strong>Access</strong></td>
      <td>Closest and easiest</td>
      <td>Requires travel to Pamukkale</td>
    </tr>
    <tr>
      <td><strong>Evening vibe</strong></td>
      <td>Quiet, simple, early night feel</td>
      <td>More everyday choice</td>
    </tr>
    <tr>
      <td><strong>Best length</strong></td>
      <td>1 night (2 if slow travel)</td>
      <td>0–1 night if using as a stop</td>
    </tr>
  </tbody>
</table>

<hr/>

<h2>How many nights in Pamukkale do you really need?</h2>

<h3>Most UK travellers: <strong>1 night</strong> (the sweet spot)</h3>
<p>One night is usually perfect: you arrive, rest, then do Pamukkale early the next morning. This makes the experience calmer and often more enjoyable because you’re not squeezing everything into a rushed day trip.</p>

<h3>If you love slow travel: <strong>2 nights</strong></h3>
<p>Two nights works if you want a gentle pace: one day for Pamukkale + the ancient site, and one day that stays lighter (photos, relaxed walking, slower meals).</p>

<h3>If your itinerary is tight: <strong>0 nights</strong> (day trip)</h3>
<p>A day trip is doable, but it’s more tiring and less “holiday-feeling”. If Pamukkale is a must-see highlight for you, one night usually feels worth it.</p>

<hr/>

<h2>Option 1: Pamukkale village (best for early access and calm pacing)</h2>
<p>Pamukkale village suits UK travellers who want their day to feel easy. You can wake up, start early, and enjoy the terraces and the ancient site with less rush.</p>

<h3>Choose Pamukkale village if…</h3>
<ul>
  <li>you want the <strong>simplest plan</strong> and the easiest morning</li>
  <li>you want the day to feel <strong>relaxed</strong> rather than packed</li>
  <li>you’re happy with a quieter evening and an early night</li>
</ul>

<!-- IMAGE_VILLAGE_PLACEHOLDER -->

<h3>Best way to do Pamukkale from the village (UK-friendly flow)</h3>
<ul>
  <li><strong>Arrive afternoon</strong>, keep the evening calm.</li>
  <li><strong>Start early next morning</strong> for your main visit.</li>
  <li><strong>Do one slow lunch</strong>, then move on or enjoy a relaxed second half-day.</li>
</ul>

<hr/>

<h2>Option 2: Denizli (best if you prefer a city base)</h2>
<p>Denizli can work well if you want more everyday choice at night and you’re treating Pamukkale as a day trip inside a bigger route. It’s a practical base if you like city convenience.</p>

<h3>Choose Denizli if…</h3>
<ul>
  <li>you want a <strong>city base</strong> with more evening options</li>
  <li>Pamukkale is <strong>one highlight day</strong> in a longer itinerary</li>
  <li>you don’t mind building a travel leg into your Pamukkale day</li>
</ul>

<!-- IMAGE_DENIZLI_PLACEHOLDER -->

<p><strong>UK-friendly tip:</strong> If you base in Denizli, start your Pamukkale day early so the rest of your day stays calm.</p>

<hr/>

<h2>The no-regrets plan (two templates)</h2>

<h3>Template A: 1 night in Pamukkale village (recommended)</h3>
<ul>
  <li><strong>Day 1:</strong> arrive + early night</li>
  <li><strong>Day 2:</strong> Pamukkale terraces + ancient site in the morning + slow lunch + move on</li>
</ul>

<h3>Template B: Denizli base (day trip style)</h3>
<ul>
  <li><strong>Day 1:</strong> Denizli evening base</li>
  <li><strong>Day 2:</strong> early start → Pamukkale main visit → return / continue route</li>
</ul>

<hr/>

<h2>Planning tips that make Pamukkale feel better</h2>
<ul>
  <li><strong>Start early.</strong> It’s the easiest way to keep the experience calm and photo-friendly.</li>
  <li><strong>Keep footwear simple.</strong> You’ll want something you can comfortably walk in and remove easily.</li>
  <li><strong>Don’t over-schedule the same day.</strong> Pamukkale is a “main event” day.</li>
</ul>

<hr/>

<h2>Common mistakes (framed positively)</h2>
<ul>
  <li><strong>Trying to squeeze Pamukkale into a rushed day:</strong> one night makes the whole experience smoother.</li>
  <li><strong>Stacking another big attraction on the same day:</strong> make Pamukkale your main highlight.</li>
  <li><strong>Picking a base that fights your energy:</strong> if you want calm, stay in the village.</li>
</ul>

<hr/>

<h2>FAQs</h2>

<h3>Where is the best area to stay for Pamukkale?</h3>
<p>Pamukkale village is the easiest base for early access and a calm visit. Denizli is better if you prefer a city base and plan to visit Pamukkale as a day trip.</p>

<h3>Is one night in Pamukkale enough?</h3>
<p>Yes—one night is the sweet spot for most UK travellers. It allows an early start and a relaxed main visit without rushing.</p>

<h3>Can I do Pamukkale as a day trip?</h3>
<p>Yes, it’s doable. But if Pamukkale is a key highlight for you, staying one night usually makes the experience far more enjoyable.</p>

<p><em>Last updated:</em> ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
`
};

async function run() {
    const timestamp = Date.now();
    console.log("🚀 Starting Pamukkale Article Automation...");

    // SAFE PROMPTS for Authentic Feel
    const imagesToGenerate = [
        {
            placeholder: '<!-- IMAGE_COVER_PLACEHOLDER -->',
            filename: `pamukkale-cover-terraces-authentic-${timestamp}.jpg`,
            prompt: "Wide view of Pamukkale white travertine terraces with turquoise water pools. Natural geological formation. Authentic travel photo. Soft daylight. Blue sky. Realistic textures."
        },
        {
            placeholder: '<!-- IMAGE_VILLAGE_PLACEHOLDER -->',
            filename: `pamukkale-village-view-terraces-${timestamp}.jpg`,
            prompt: "View of Pamukkale travertines from the village town below. Small hotels, local streets. Authentic Turkish village atmosphere. Sunset light. Realistic."
        },
        {
            placeholder: '<!-- IMAGE_DENIZLI_PLACEHOLDER -->',
            filename: `denizli-city-street-view-${timestamp}.jpg`,
            prompt: "A lively street in Denizli city centre. Modern Turkish city life. People walking, shops, cafes. Authentic urban travel photography. Bright daylight."
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
        title: { en: ARTICLE_DATA.title, tr: "Pamukkale'de Nerede Kalınır? (TR Pasif)" },
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
        console.log("✅ Pamukkale Article Added Successfully!");
        console.log("👉 Slug:", ARTICLE_DATA.slug);
    }
}

run();
