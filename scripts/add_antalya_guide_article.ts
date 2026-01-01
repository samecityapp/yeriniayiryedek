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
const MODEL_ID = 'imagen-4.0-generate-001';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const ARTICLES_IMAGE_DIR = path.join(process.cwd(), 'public', 'images', 'articles');
if (!fs.existsSync(ARTICLES_IMAGE_DIR)) {
  fs.mkdirSync(ARTICLES_IMAGE_DIR, { recursive: true });
}

// --- Imagen 4 Generation Function ---
async function generateImageVertexV4(prompt: string, filename: string) {
  console.log(`🎨 Generating ${filename} with Imagen 4 (Ultra Realistic)...`);

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

    // DEBUG: Log structure if prediction is missing
    if (!data.predictions || data.predictions.length === 0) {
      console.error("❌ Vertex AI Response Error. Full Response:", JSON.stringify(data, null, 2));
      throw new Error('No predictions returned');
    }

    // Safety: Check if bytesBase64Encoded exists
    if (!data.predictions[0].bytesBase64Encoded) {
      console.error("❌ Missing bytesBase64Encoded in prediction:", JSON.stringify(data.predictions[0], null, 2));
      throw new Error('Invalid prediction structure');
    }

    const base64Image = data.predictions[0].bytesBase64Encoded;
    const buffer = Buffer.from(base64Image, 'base64');

    // Save locally
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
  slug: 'where-to-stay-in-antalya-best-areas-guide',
  title: 'Where to Stay in Antalya: Best Areas for UK Travellers (Lara vs Konyaaltı vs Belek vs Kaleiçi)',
  meta_description: 'Choose the best area to stay in Antalya for your Turkey holiday. Compare Lara, Konyaaltı, Belek and Kaleiçi by vibe, beaches and ease.',
  content: `
<p><strong>Quick answer:</strong> If you want an easy, facilities-first beach holiday, look at <strong>Lara</strong> or <strong>Belek</strong>. If you want a more “city + beach” feel with walkability and local restaurants, <strong>Konyaaltı</strong> is often the best fit. If you want atmosphere, history and evenings in charming streets, choose <strong>Kaleiçi (Old Town)</strong> — and treat beach time as an add-on rather than the whole plan.</p>

<p>If Antalya is part of a bigger first trip, use this pillar first:
<a href="/guide/where-to-stay-in-turkey-first-time-guide">Where to Stay in Turkey (UK First-Timer Area Guide)</a>.
And if you’re picking dates, see:
<a href="/guide/best-time-to-visit-turkey">Best Time to Visit Turkey (Month-by-Month)</a>.
</p>

<!-- IMAGE_COVER_PLACEHOLDER -->

<h2>Antalya “region” vs Antalya “city” (don’t get caught by wording)</h2>
<p>When people say “Antalya”, they can mean two different things:</p>
<ul>
  <li><strong>Antalya city</strong> (urban base with beaches and neighbourhood life), and</li>
  <li><strong>the wider Antalya coast</strong> (areas designed for resort-style holidays).</li>
</ul>
<p>Both can be great — but they suit different travellers. The right area choice will save you time, money, and stress.</p>

<h2>Best Antalya areas at a glance (choose by holiday style)</h2>
<table>
  <thead>
    <tr>
      <th>What you want</th>
      <th>Best area</th>
      <th>Why UK travellers like it</th>
      <th>Watch-outs</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Easy beach holiday, minimal planning</td>
      <td>Lara</td>
      <td>Convenient, holiday-focused, simple “switch-off” vibe</td>
      <td>Less local wandering; pick it if you want on-site comfort</td>
    </tr>
    <tr>
      <td>Golf / resort-style calm + facilities</td>
      <td>Belek</td>
      <td>Purpose-built holiday feel; great for families and relaxation</td>
      <td>Not about city life; you’ll travel for “town” atmosphere</td>
    </tr>
    <tr>
      <td>City + beach + walkability</td>
      <td>Konyaaltı</td>
      <td>Great for cafés, evening walks, and flexible day plans</td>
      <td>Feels more “city” than “resort”; choose based on your pace</td>
    </tr>
    <tr>
      <td>Atmosphere, history, charming evenings</td>
      <td>Kaleiçi (Old Town)</td>
      <td>Memorable character and a classic Turkey feel</td>
      <td>Best for atmosphere; beach days may take extra effort</td>
    </tr>
  </tbody>
</table>

<h2>How to choose your Antalya base (the 60-second method)</h2>
<ul>
  <li><strong>If you want pool/beach days with the least thinking:</strong> Lara or Belek.</li>
  <li><strong>If you want to walk out for dinner and feel city life:</strong> Konyaaltı.</li>
  <li><strong>If you want romance, history and “evening atmosphere”:</strong> Kaleiçi.</li>
  <li><strong>If you’re travelling with kids:</strong> prioritise shade, easy food options, and low-effort beach access.</li>
</ul>

<h2>Lara: easiest “holiday mode” base</h2>
<p>Lara is a strong choice when you want the simplest version of an Antalya holiday: beach time, pool time, and straightforward logistics. It suits UK travellers who want to relax first and explore second.</p>

<!-- IMAGE_LARA_PLACEHOLDER -->

<ul>
  <li><strong>Best for:</strong> first-time Turkey beach holidays, families, couples who want comfort, travellers who like an easy routine.</li>
  <li><strong>Vibe:</strong> holiday-focused and convenient.</li>
  <li><strong>Choose Lara if:</strong> your ideal day is breakfast → pool/beach → dinner → early-ish night.</li>
</ul>

<h3>What to check before booking in Lara</h3>
<ul>
  <li><strong>Beach access:</strong> confirm what “beachfront” means for the place you choose.</li>
  <li><strong>Evenings:</strong> if you want lots of independent restaurants, Lara may feel more self-contained.</li>
  <li><strong>Noise preference:</strong> decide if you want lively entertainment or quieter nights.</li>
</ul>

<h2>Belek: facilities-first relaxation (and a calmer rhythm)</h2>
<p>Belek works best when your priority is a laid-back, resort-style holiday. It’s popular with travellers who want a calm pace and lots of on-site options — especially families and anyone who prefers “everything handled” style holidays.</p>

<!-- IMAGE_BELEK_PLACEHOLDER -->

<ul>
  <li><strong>Best for:</strong> families, relaxation-focused trips, travellers who prefer a calm and predictable holiday day-to-day.</li>
  <li><strong>Vibe:</strong> purpose-built holiday calm.</li>
  <li><strong>Choose Belek if:</strong> you’re happy trading city life for comfort and simplicity.</li>
</ul>

<h3>Belek tips (UK-friendly)</h3>
<ul>
  <li><strong>Plan one or two “out days”</strong> if you still want a bit of sightseeing — otherwise you’ll naturally stay in holiday mode.</li>
  <li><strong>Heat management:</strong> in peak summer, shade and pool time can matter more than “activities”.</li>
</ul>

<h2>Konyaaltı: the “city + beach” base (best all-rounder for many)</h2>
<p>If you want to feel like you’re in a real place — not only a holiday complex — Konyaaltı is often the best match. It suits UK travellers who want beach time but also want to walk out for coffee, browse local spots, and keep evenings flexible.</p>

<!-- IMAGE_KONYAALTI_PLACEHOLDER -->

<ul>
  <li><strong>Best for:</strong> couples, friends trips, travellers who like variety, anyone who wants walkability.</li>
  <li><strong>Vibe:</strong> more local movement, more choice, more independence.</li>
  <li><strong>Choose Konyaaltı if:</strong> you want a balance of relaxing and exploring without switching bases.</li>
</ul>

<h3>How to pick the right Konyaaltı spot</h3>
<ul>
  <li><strong>Walk-to-dinner test:</strong> you’ll enjoy the area more if you can easily walk to a few evening options.</li>
  <li><strong>Beach comfort:</strong> check what your typical beach day would look like (easy access vs more effort).</li>
  <li><strong>Your plan:</strong> if you want day trips, choose a location that makes leaving and returning straightforward.</li>
</ul>

<h2>Kaleiçi (Old Town): atmosphere, charm and memorable evenings</h2>
<p>Kaleiçi is about character. If your Antalya plan is “a bit of beach, but mostly atmosphere”, it can be brilliant. It’s also a strong choice if you want romantic evenings, wandering streets, and a more historic feel.</p>

<!-- IMAGE_KALEICI_PLACEHOLDER -->

<ul>
  <li><strong>Best for:</strong> couples, short stays, travellers who value atmosphere over resort facilities.</li>
  <li><strong>Vibe:</strong> historic, charming, walk-and-wander.</li>
  <li><strong>Choose Kaleiçi if:</strong> you want your accommodation area to feel like part of the experience.</li>
</ul>

<h3>Old Town reality check</h3>
<ul>
  <li><strong>Beach days:</strong> you can still do beach time, but it may be less “step outside and swim” compared with other areas.</li>
  <li><strong>Streets:</strong> charming areas often mean tighter streets and a more “boutique” feel.</li>
  <li><strong>Sleep:</strong> if you’re sensitive to noise, pick a quieter street setup.</li>
</ul>

<h2>Antalya for families: the low-stress approach</h2>
<p>Families usually enjoy Antalya most when the base supports easy days. Instead of trying to “see everything”, plan for comfort and add one or two simple excursions.</p>
<ul>
  <li><strong>Best base types:</strong> Lara or Belek for facility-heavy ease; Konyaaltı if you prefer more independence and eating out.</li>
  <li><strong>What matters most:</strong> shade, pool time, easy food, and short travel days.</li>
</ul>

<h2>Common Antalya base mistakes (and how to avoid them)</h2>
<ul>
  <li><strong>Booking “Antalya” without choosing the area.</strong> Fix: decide whether you want city-life (Konyaaltı/Kaleiçi) or resort-life (Lara/Belek).</li>
  <li><strong>Choosing by photos only.</strong> Fix: choose by daily routine (walkability, dinners, beach access) first.</li>
  <li><strong>Underestimating summer comfort.</strong> Fix: in peak heat, prioritise shade, pools, and a base that keeps days easy.</li>
  <li><strong>Expecting every area to feel the same.</strong> Fix: each base has a different “holiday personality”.</li>
</ul>

<h2>Booking checklist (copy/paste)</h2>
<ul>
  <li><strong>Define your holiday style:</strong> resort relaxation vs city flexibility.</li>
  <li><strong>Choose your base area:</strong> Lara / Belek / Konyaaltı / Kaleiçi.</li>
  <li><strong>Confirm beach access:</strong> don’t assume “beachfront” means the same everywhere.</li>
  <li><strong>Plan your evenings:</strong> on-site entertainment vs walking out for dinner.</li>
  <li><strong>Season check:</strong> match your comfort level to your travel month:
    <a href="[INTERNAL_LINK: best-time-to-visit]">Best Time to Visit Turkey (Month-by-Month)</a>
  </li>
  <li><strong>Overall trip plan:</strong> if Antalya is one base in a bigger trip, anchor it here:
    <a href="[INTERNAL_LINK: where-to-stay-turkey]">Where to Stay in Turkey (UK First-Timer Area Guide)</a>
  </li>
</ul>

<h2>FAQs</h2>

<h3>Which is better for UK travellers: Lara or Konyaaltı?</h3>
<p>Lara is usually better for an easy, holiday-focused stay where you want comfort and minimal planning. Konyaaltı is better if you want city life, cafés, and more flexibility day-to-day.</p>

<h3>Is Belek only for golf?</h3>
<p>No. Belek often suits travellers who want a calm, facilities-first holiday. It can work very well for families and anyone who wants a relaxed rhythm.</p>

<h3>Is Kaleiçi a good base for a beach holiday?</h3>
<p>Kaleiçi is best if atmosphere and history are a priority and beach time is a secondary goal. If you want beach-first convenience, Lara or Belek is usually a better fit.</p>

<h3>What’s the easiest base for families?</h3>
<p>Many families prefer Lara or Belek because days are simpler and facilities are designed for low-stress routines. If you prefer eating out and walking, Konyaaltı can also work well.</p>

<h3>How do I avoid choosing the wrong area in Antalya?</h3>
<p>Choose the area based on your daily routine: do you want to walk out for dinner, or do you want everything on-site? That one decision usually makes the right base obvious.</p>

<p><em>Last updated:</em> ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
  `
};

async function addAntalyaArticle() {
  const timestamp = 1767113865066; // Static timestamp to reuse existing images

  // --- Prompt Strategy: "Amateur / iPhone / Raw" for max realism ---
  const imagesToGenerate = [
    {
      placeholder: '<!-- IMAGE_COVER_PLACEHOLDER -->',
      filename: `antalya-cover-${timestamp}.jpg`,
      prompt: "A wide shot of Antalya's cliffs meeting the Mediterranean sea. Authentic bright daylight. No filters. Shot on iPhone 15. Realistic blue sea color, slightly imperfect framing. People walking in a park nearby."
    },
    {
      placeholder: '<!-- IMAGE_LARA_PLACEHOLDER -->',
      filename: `antalya-lara-beach-${timestamp}.jpg`,
      prompt: "A candid photo of a sandy beach in Lara, Antalya. Rows of colorful umbrellas and sunbeds on golden sand. Bright clear blue sky. 'Resort holiday' vibe. Raw jpg quality. Wide angle shot, no people close up."
    },
    {
      placeholder: '<!-- IMAGE_BELEK_PLACEHOLDER -->',
      filename: `antalya-belek-golf-${timestamp}.jpg`,
      prompt: "A peaceful photo of a golf resort garden in Belek. Pine trees, green grass, sprinkler water mist. Soft morning light. Relaxed atmosphere. Authentic travel photo. No people."
    },
    {
      placeholder: '<!-- IMAGE_KONYAALTI_PLACEHOLDER -->',
      filename: `antalya-konyaalti-${timestamp}.jpg`,
      prompt: "A street-level photo of the Konyaalti beach promenade. Beydaglari mountains looming huge in the background. People biking and walking. Pebble beach texture. Realistic city-beach vibe. Morning light."
    },
    {
      placeholder: '<!-- IMAGE_KALEICI_PLACEHOLDER -->',
      filename: `antalya-kaleici-oldtown-${timestamp}.jpg`,
      prompt: "A close-up vertical shot of a narrow street in Kaleici (Old Town). Wooden historic houses, a street cat sleeping, sunlight hitting the cobblestones. Texture-heavy, sharp, unedited. Authentic Turkish atmosphere."
    }
  ];

  let finalContent = ARTICLE_DATA.content;
  let coverImageUrl = '';

  // Reuse existing images
  for (const item of imagesToGenerate) {
    // const publicUrl = await generateImageVertexV4(item.prompt, item.filename);
    // Reuse existing file path
    const publicUrl = `/images/articles/${item.filename}`;

    if (item.placeholder.includes('COVER')) {
      coverImageUrl = publicUrl;
      finalContent = finalContent.replace(item.placeholder, ''); // Remove placeholder from body
    } else {
      const imgTag = `<img src="${publicUrl}" alt="${item.prompt}" class="w-full h-auto rounded-lg my-6 shadow-md" />`;
      finalContent = finalContent.replace(item.placeholder, imgTag);
    }
  }

  // Ensure Internal Links are preserved (they are already in content)
  // Insert into DB
  const { error } = await supabase.from('articles').upsert({
    slug: ARTICLE_DATA.slug,
    title: { en: ARTICLE_DATA.title, tr: "Antalya'da Nerede Kalınır?" }, // Basic TR Title fallback
    meta_description: { en: ARTICLE_DATA.meta_description, tr: "Antalya tatili için en iyi bölgeleri keşfedin." },
    content: { en: finalContent, tr: "<p>Çeviri yakında...</p>" }, // Placeholder TR
    cover_image_url: coverImageUrl,
    // category_id removed due to schema error
    published_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }, { onConflict: 'slug' });

  if (error) {
    console.error("❌ DB Insert Failed:", error);
  } else {
    console.log("✅ Antalya Article Added Successfully with Imagen 4 Images!");
  }
}

addAntalyaArticle();
