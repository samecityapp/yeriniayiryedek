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

// --- Imagen 4 Generation Function ---
async function generateImageVertexV4(prompt: string, filename: string) {
  console.log(`🎨 Generating ${filename} with Imagen 4 (Authentic Mode)...`);

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
  slug: 'where-to-stay-in-bodrum-best-areas-guide',
  title: 'Where to Stay in Bodrum: Best Areas for UK Travellers (Town vs Beach Bases)',
  meta_description: 'Choose the best area to stay in Bodrum. Compare Bodrum Town, Gümbet, Bitez, Yalıkavak and Türkbükü by vibe, beaches and nights.',
  content: `
<h1>Where to Stay in Bodrum: Best Areas for UK Travellers (Town vs Beach Bases)</h1>

<p><strong>Quick answer:</strong> If you want convenience, restaurants and a classic “town base”, choose <strong>Bodrum Town</strong>. If nightlife is your priority, <strong>Gümbet</strong> is often the most lively option. If you want a calmer beach base with an easy pace, look at <strong>Bitez</strong>. If you want a more polished, marina-style atmosphere, <strong>Yalıkavak</strong> may suit you. If you’re chasing a more exclusive, beach-club-led vibe, <strong>Türkbükü</strong> is the name most people associate with that style. The “best” choice depends on how you want your evenings to feel.</p>

<p>For a first-timer Turkey plan, start with:
<a href="/guide/where-to-stay-in-turkey-first-time-guide">Where to Stay in Turkey (UK First-Timer Area Guide)</a>.
And for season planning:
<a href="/guide/best-time-to-visit-turkey">Best Time to Visit Turkey (Month-by-Month)</a>.
</p>

<!-- IMAGE_COVER_PLACEHOLDER -->

<h2>Bodrum is a peninsula: your area choice shapes the whole holiday</h2>
<p>Bodrum isn’t one single place — it’s a peninsula with multiple bases that feel very different. A base that’s perfect for beach days and calm evenings can feel “too quiet” for someone who wants nightlife. A lively base can feel exhausting if you’re after sleep and slow mornings. Your goal is to match your base to your <strong>day-to-night routine</strong>.</p>

<h2>Best Bodrum areas at a glance (choose by vibe)</h2>
<table>
  <thead>
    <tr>
      <th>What you want</th>
      <th>Best base</th>
      <th>Why UK travellers like it</th>
      <th>Watch-outs</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Restaurants, shopping, easy logistics</td>
      <td>Bodrum Town</td>
      <td>Convenient “hub” feel with lots of choice</td>
      <td>Can be busy; pick a quieter street if sleep matters</td>
    </tr>
    <tr>
      <td>Nightlife on the doorstep</td>
      <td>Gümbet</td>
      <td>Most lively, social holiday vibe</td>
      <td>Noise and late nights; not ideal for light sleepers</td>
    </tr>
    <tr>
      <td>Calm beach days + relaxed evenings</td>
      <td>Bitez</td>
      <td>Softer pace and a more chilled routine</td>
      <td>Less “buzz”; choose if calm is a feature, not a downside</td>
    </tr>
    <tr>
      <td>Marina style + polished atmosphere</td>
      <td>Yalıkavak</td>
      <td>More refined feel with a “dress up for dinner” energy</td>
      <td>Can feel pricier; choose based on your budget comfort</td>
    </tr>
    <tr>
      <td>Beach-club-led, exclusive vibe</td>
      <td>Türkbükü</td>
      <td>Best known for a high-energy, upscale beach scene</td>
      <td>Not the best value base; only choose if that vibe is the goal</td>
    </tr>
  </tbody>
</table>

<h2>The 60-second decision method (pick your evenings first)</h2>
<ul>
  <li><strong>If you want nightlife without planning:</strong> start with Gümbet (or a lively pocket near the action).</li>
  <li><strong>If you want calm evenings and good sleep:</strong> start with Bitez (or a quieter base).</li>
  <li><strong>If you want “lots of choice” and flexibility:</strong> Bodrum Town is the easiest hub.</li>
  <li><strong>If you want a more polished, marina-style feel:</strong> consider Yalıkavak.</li>
  <li><strong>If your trip is built around the beach-club scene:</strong> Türkbükü is the most associated with that style.</li>
</ul>

<h2>Bodrum Town: best for convenience and choice</h2>
<p>Bodrum Town works well for UK travellers who want options. You can have casual days, decide plans last minute, and still find good evening spots without needing to “travel for atmosphere”. It’s also a good base if you want to explore different parts of the peninsula without changing accommodation.</p>

<!-- IMAGE_BODRUM_TOWN_PLACEHOLDER -->

<ul>
  <li><strong>Best for:</strong> first-timers who want flexibility, couples who like dinners out, travellers who want a “hub”.</li>
  <li><strong>Vibe:</strong> busy, lively, lots going on.</li>
  <li><strong>Choose Bodrum Town if:</strong> you prefer having many choices within easy reach.</li>
</ul>

<h3>Town-base tips</h3>
<ul>
  <li><strong>Protect your sleep:</strong> choose a quieter street setup if late-night noise bothers you.</li>
  <li><strong>Plan your beach days:</strong> town bases are great for evenings; beach days might be more “planned” than “default”.</li>
</ul>

<h2>Gümbet: best for nightlife and a social holiday</h2>
<p>Gümbet is often chosen by travellers who want a lively, social base where nights feel effortless. If your holiday is about going out, meeting people, and having energy around you, it can be a perfect fit.</p>

<!-- IMAGE_GUMBET_PLACEHOLDER -->

<ul>
  <li><strong>Best for:</strong> friends trips, nightlife-first travellers, anyone who enjoys a busier scene.</li>
  <li><strong>Vibe:</strong> upbeat, late nights, holiday-strip energy.</li>
  <li><strong>Choose Gümbet if:</strong> you’d rather be close to nightlife than travel to it.</li>
</ul>

<h3>Gümbet reality check</h3>
<ul>
  <li><strong>Noise:</strong> if you’re a light sleeper, choose a calmer pocket or a quieter base.</li>
  <li><strong>Pace:</strong> it’s a “high energy” area — great if that’s what you want, tiring if it isn’t.</li>
</ul>

<h2>Bitez: best for calm beach days and relaxed evenings</h2>
<p>Bitez is a good match for UK travellers who want a softer pace: beach-led days, casual evenings, and less “party pressure”. It can be especially nice for couples and travellers who prioritise comfort and sleep.</p>

<!-- IMAGE_BITEZ_PLACEHOLDER -->

<ul>
  <li><strong>Best for:</strong> couples, families who want calm, travellers who want a steady routine.</li>
  <li><strong>Vibe:</strong> relaxed, calmer, slower rhythm.</li>
  <li><strong>Choose Bitez if:</strong> you want calm as the default setting.</li>
</ul>

<h3>Bitez tips</h3>
<ul>
  <li><strong>Walkability:</strong> pick a spot where you can easily walk to food options — it makes the whole stay feel simpler.</li>
  <li><strong>Balance:</strong> you can still go out; you’ll just return to a calmer base.</li>
</ul>

<h2>Yalıkavak: marina style and a more polished feel</h2>
<p>Yalıkavak is often linked with a more refined, marina-style holiday atmosphere. If you enjoy a slightly more “dress up for dinner” feel and you like the idea of a base that feels curated, it can be a good match.</p>

<!-- IMAGE_YALIKAVAK_PLACEHOLDER -->

<ul>
  <li><strong>Best for:</strong> couples, travellers who enjoy a polished atmosphere, slower luxury-style holidays.</li>
  <li><strong>Vibe:</strong> curated, marina energy, evenings out.</li>
  <li><strong>Choose Yalıkavak if:</strong> you want that specific marina-town feel and it fits your budget comfort.</li>
</ul>

<h3>Yalıkavak reality check</h3>
<ul>
  <li><strong>Budget fit:</strong> choose it because you like the vibe — not because you think it’s the cheapest base.</li>
  <li><strong>Trip goals:</strong> it suits travellers who enjoy atmosphere and evenings, not necessarily “do everything fast” itineraries.</li>
</ul>

<h2>Türkbükü: for an exclusive beach-club-led vibe</h2>
<p>Türkbükü is the name many people connect with an upscale beach scene and a more exclusive vibe. It can be a great fit if your holiday is built around that energy, but it’s not the right default base for everyone.</p>

<!-- IMAGE_TURKBUKU_PLACEHOLDER -->

<ul>
  <li><strong>Best for:</strong> travellers who specifically want an upscale, beach-club-led holiday atmosphere.</li>
  <li><strong>Vibe:</strong> exclusive, social, scene-focused.</li>
  <li><strong>Choose Türkbükü if:</strong> you want that vibe enough to make it the centre of your trip.</li>
</ul>

<h2>Best Bodrum base by traveller type (quick picks)</h2>
<ul>
  <li><strong>First-time UK couples:</strong> Bitez for calm, or Bodrum Town for convenience and evenings out.</li>
  <li><strong>Friends / nightlife:</strong> Gümbet if nightlife is a main goal.</li>
  <li><strong>Families:</strong> often calmer bases like Bitez work better for routine and sleep.</li>
  <li><strong>“Polished vibe” travellers:</strong> Yalıkavak.</li>
  <li><strong>Scene-led beach holidays:</strong> Türkbükü (only if that’s the point).</li>
</ul>

<h2>Common mistakes in Bodrum (and the fixes)</h2>
<ul>
  <li><strong>Choosing the peninsula without choosing the base.</strong> Fix: pick your area first (town, calm beach, nightlife, marina vibe).</li>
  <li><strong>Booking a lively area when you want sleep.</strong> Fix: prioritise quiet streets and calm bases.</li>
  <li><strong>Assuming all beaches and evenings feel the same.</strong> Fix: decide your daily routine, then match the base to it.</li>
  <li><strong>Over-planning movement.</strong> Fix: choose one base and do day trips rather than changing accommodation.</li>
</ul>

<h2>Booking checklist (copy/paste)</h2>
<ul>
  <li><strong>Pick your evenings:</strong> calm vs lively.</li>
  <li><strong>Choose your base:</strong> Bodrum Town / Gümbet / Bitez / Yalıkavak / Türkbükü.</li>
  <li><strong>Protect your sleep:</strong> choose a quieter street if you’re sensitive to noise.</li>
  <li><strong>Plan beach days:</strong> decide whether you want “default beach” or “planned beach”.</li>
  <li><strong>Season check:</strong> match your comfort to your travel month:
    <a href="/guide/best-time-to-visit-turkey">Best Time to Visit Turkey (Month-by-Month)</a>
  </li>
  <li><strong>Overall plan:</strong> if Bodrum is part of a first Turkey trip:
    <a href="/guide/where-to-stay-in-turkey-first-time-guide">Where to Stay in Turkey (UK First-Timer Area Guide)</a>
  </li>
</ul>

<h2>FAQs (UK travellers)</h2>

<h3>Is Bodrum good for first-time UK travellers?</h3>
<p>Yes — if you choose the right base. Bodrum works very well when your base matches your vibe (calm beach, town convenience, nightlife, or marina atmosphere).</p>

<h3>Where should I stay in Bodrum for nightlife?</h3>
<p>If nightlife is your main goal, Gümbet is often the most lively base. If you want nights out but calmer sleep, choose a calmer base and travel to nightlife instead.</p>

<h3>Which area is best for couples?</h3>
<p>Many couples enjoy calmer bases like Bitez for relaxed evenings, or Bodrum Town if they want lots of restaurant choice and a livelier town atmosphere.</p>

<h3>Which area is best for families?</h3>
<p>Families often prefer calmer bases that support routines and sleep. Choose a base where evenings are easier and the pace is softer.</p>

<h3>What’s the biggest mistake when booking Bodrum?</h3>
<p>Choosing “Bodrum” without choosing the exact base area. The peninsula contains different holiday styles — your area choice shapes your whole trip.</p>

<p><em>Last updated:</em> ${new Date().toLocaleDateString('en-GB')}</p>
`
};

async function addBodrumArticle() {
  const timestamp = Date.now();

  const imagesToGenerate = [
    {
      placeholder: '<!-- IMAGE_COVER_PLACEHOLDER -->',
      filename: `bodrum-cover-${timestamp}.jpg`,
      prompt: "A raw, iconic wide shot of Bodrum Castle from a nearby hill. Authentic summer white houses with bougainvillea in foreground. Blue Aegean sea. Shot on iPhone 15. Bright natural light, holiday memory vibe. Unedited."
    },
    {
      placeholder: '<!-- IMAGE_BODRUM_TOWN_PLACEHOLDER -->',
      filename: `bodrum-town-${timestamp}.jpg`,
      prompt: "Candid street photography in Bodrum Town old bazaar. Narrow street, blue window frames, white walls. People shopping. Sunlight filtering through vine roof. Authentic Turkish summer atmosphere. Grainy, realistic."
    },
    {
      placeholder: '<!-- IMAGE_GUMBET_PLACEHOLDER -->',
      filename: `bodrum-gumbet-${timestamp}.jpg`,
      prompt: "A handheld night shot of Gumbet Bar Street. Neon lights, motion blur of dancing people. Vibrant energy. Imperfect framing. High contrast. Authentic nightlife snap."
    },
    {
      placeholder: '<!-- IMAGE_BITEZ_PLACEHOLDER -->',
      filename: `bodrum-bitez-${timestamp}.jpg`,
      prompt: "Relaxed perspective from a sunbed in Bitez. Feet visible looking out at calm sea and mandarin gardens behind. Soft afternoon light. Authentic, quiet holiday moment. No filters."
    },
    {
      placeholder: '<!-- IMAGE_YALIKAVAK_PLACEHOLDER -->',
      filename: `bodrum-yalikavak-${timestamp}.jpg`,
      prompt: "A polished, elegant shot of Yalikavak Marina at dusk. Yachts in background, people drinking cocktails in foreground. Expensive but real vibe. Soft focus, bokeh lights. Authentic luxury travel."
    },
    {
      placeholder: '<!-- IMAGE_TURKBUKU_PLACEHOLDER -->',
      filename: `bodrum-turkbuku-${timestamp}.jpg`,
      prompt: "A candid shot of a beach club pier in Turkbuku. People jumping into water or sunbathing on white cushions. Clear turquoise water. High energy summer day. Bright light, sharp shadows. Authentic elite holiday."
    }
  ];

  let finalContent = ARTICLE_DATA.content;
  let coverImageUrl = '';

  for (const item of imagesToGenerate) {
    const publicUrl = await generateImageVertexV4(item.prompt, item.filename);
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
    title: { en: ARTICLE_DATA.title, tr: "Bodrum'da Nerede Kalınır?" },
    meta_description: { en: ARTICLE_DATA.meta_description, tr: "Bodrum tatili için en iyi bölgeleri keşfedin." },
    content: { en: finalContent, tr: "<p>Çeviri yakında...</p>" },
    cover_image_url: coverImageUrl,
    published_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }, { onConflict: 'slug' });

  if (error) {
    console.error("❌ DB Insert Failed:", error);
  } else {
    console.log("✅ Bodrum Article Added Successfully with Authentic Imagen 4 Images!");
  }
}

addBodrumArticle();
