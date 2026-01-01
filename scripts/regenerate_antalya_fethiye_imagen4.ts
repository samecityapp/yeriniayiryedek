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

// --- DATA ---

const ANTALYA_DATA = {
  slug: 'where-to-stay-in-antalya-best-areas-guide',
  // We only need slug to update, but we will re-construct content to embed new images
  // Content structure is assumed to be the same as 'add_antalya_guide_article.ts'
  originalTitle: { en: 'Where to Stay in Antalya: Best Areas for UK Travellers (Lara vs Konyaaltı vs Belek vs Kaleiçi)' },
  images: [
    {
      placeholder: '<!-- IMAGE_COVER_PLACEHOLDER -->',
      filenamePrefix: 'antalya-cover',
      prompt: "A raw, handheld wide shot of Antalya's cliffs meeting the Mediterranean sea. Shot on iPhone 15. Natural harsh daylight, slightly overexposed sky. Authentic tourist photo, no filters, film grain. Real life colors."
    },
    {
      placeholder: '<!-- IMAGE_LARA_PLACEHOLDER -->',
      filenamePrefix: 'antalya-lara-beach',
      prompt: "Eye-level shot of Lara Beach from a sunbed perspective. Feet visible at bottom blur. Golden sand, blue sky. Slightly tilted horizon. Authentic beach day vibe, unedited, direct sunlight."
    },
    {
      placeholder: '<!-- IMAGE_BELEK_PLACEHOLDER -->',
      filenamePrefix: 'antalya-belek-golf',
      prompt: "A candid photo of a golf course path in Belek. Morning mist, dew on grass. Not a brochure shot. Natural lighting, soft, quiet atmosphere. Shot on 35mm film."
    },
    {
      placeholder: '<!-- IMAGE_KONYAALTI_PLACEHOLDER -->',
      filenamePrefix: 'antalya-konyaalti',
      prompt: "Street photography style shot of Konyaalti promenade. People walking, biking. Mountains in background with atmospheric haze. Realistic colors, not saturated. Authentic city beach vibe."
    },
    {
      placeholder: '<!-- IMAGE_KALEICI_PLACEHOLDER -->',
      filenamePrefix: 'antalya-kaleici-oldtown',
      prompt: "A POV shot walking down a narrow street in Kaleici. Shadow and light contrast. Old stones, street cat. Handheld feel, slightly imperfect focus. Authentic travel memory."
    }
  ]
};

const FETHIYE_DATA = {
  slug: 'where-to-stay-in-fethiye-best-areas-guide',
  originalTitle: { en: 'Where to Stay in Fethiye: Best Areas for UK Travellers (Ölüdeniz vs Hisarönü vs Çalış vs Fethiye Centre)' },
  images: [
    {
      placeholder: '<!-- IMAGE_COVER_PLACEHOLDER -->',
      filenamePrefix: 'fethiye-cover',
      prompt: "A paraglider's POV shot looking down at Oludeniz Blue Lagoon. GoPro style wide angle. Hiking boots visible in frame edge. Real turquoise water color, not oversaturated. Authentic adventure photo, sun flare."
    },
    {
      placeholder: '<!-- IMAGE_OLUDENIZ_PLACEHOLDER -->',
      filenamePrefix: 'fethiye-oludeniz-beach',
      prompt: "Crowded beach day at Oludeniz. Eye level. Colorful umbrellas, pebbles, clear water. People swimming naturally. Raw summer vibe, bright sunlight, harsh shadows. Authentic vacation snap."
    },
    {
      placeholder: '<!-- IMAGE_HISARONU_PLACEHOLDER -->',
      filenamePrefix: 'fethiye-hisaronu-night',
      prompt: "Night shot of a busy street in Hisaronu. Neon lights reflecting on pavement. Motion blur of people walking. Grainy, high ISO, handheld night photography. Authentic lively atmosphere."
    },
    {
      placeholder: '<!-- IMAGE_CALIS_PLACEHOLDER -->',
      filenamePrefix: 'fethiye-calis-sunset',
      prompt: "A relaxed photo of Calis beach promenade at sunset. Silhouettes of people. Warm orange light. Not perfectly composed. Shot on smartphone. Authentic sunset watching vibe."
    },
    {
      placeholder: '<!-- IMAGE_CENTER_PLACEHOLDER -->',
      filenamePrefix: 'fethiye-center-market',
      prompt: "Close up, eye-level shot inside Fethiye fish market. Steam rising, fresh fish on ice, locals bargaining. chaotic but cozy. Authentic market colors, depth of field."
    }
  ]
};

async function updateArticleImages(articleData: typeof ANTALYA_DATA) {
  console.log(`\n🔄 Updating ${articleData.slug}...`);

  // 1. Fetch current content to preserve text
  const { data: currentArticle, error: fetchError } = await supabase
    .from('articles')
    .select('content')
    .eq('slug', articleData.slug)
    .single();

  if (fetchError || !currentArticle) {
    console.error(`❌ Could not fetch article ${articleData.slug}:`, fetchError);
    return;
  }

  let rawContent = currentArticle.content.en;
  // We need to revert the Image Tags to Placeholders to re-inject new ones?
  // OR we can just regenerate the HTML from scratch if we had the source.
  // Since I don't want to parse HTML to find and replace <img> tags, 
  // I will grab the RAW HTML from the previous scripts (hardcoded below) and re-process it.
  // This is safer to ensure clean state.

  let baseContent = '';
  if (articleData.slug.includes('antalya')) {
    baseContent = `
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
    <a href="/guide/best-time-to-visit-turkey">Best Time to Visit Turkey (Month-by-Month)</a>
  </li>
  <li><strong>Overall trip plan:</strong> if Antalya is one base in a bigger trip, anchor it here:
    <a href="/guide/where-to-stay-in-turkey-first-time-guide">Where to Stay in Turkey (UK First-Timer Area Guide)</a>
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

<p><em>Last updated:</em> ${new Date().toLocaleDateString('en-GB')}</p>
        `;
  } else if (articleData.slug.includes('fethiye')) {
    baseContent = `
<h1>Where to Stay in Fethiye: Best Areas for UK Travellers (Ölüdeniz vs Hisarönü vs Çalış vs Fethiye Centre)</h1>

<p><strong>Quick answer:</strong> If you want the classic turquoise-water holiday feel, choose <strong>Ölüdeniz</strong>. If you want a lively, social base with lots happening in the evenings, <strong>Hisarönü</strong> can suit you. If you want a calmer seaside rhythm with long evening walks and a more local feel, <strong>Çalış</strong> is often a great match. If you want flexibility, markets, and an “everyday Turkey” base with easy transport options, choose <strong>Fethiye centre</strong>.</p>

<p>If Fethiye is part of your first Turkey trip, start with:
<a href="/guide/where-to-stay-in-turkey-first-time-guide">Where to Stay in Turkey (UK First-Timer Area Guide)</a>.
For season planning, use:
<a href="/guide/best-time-to-visit-turkey">Best Time to Visit Turkey (Month-by-Month)</a>.
</p>

<!-- IMAGE_COVER_PLACEHOLDER -->

<h2>What people mean by “Fethiye” (region vs town)</h2>
<p>When UK travellers say “we’re staying in Fethiye”, they might mean the <strong>town centre</strong> or one of the nearby <strong>coastal areas</strong>. These options can feel like totally different holidays. Your best choice depends on one thing: <strong>what you want your daily routine to look like</strong>.</p>

<h2>Fethiye at a glance: choose the right base by vibe</h2>
<table>
  <thead>
    <tr>
      <th>What you want</th>
      <th>Best base</th>
      <th>Why it suits UK travellers</th>
      <th>Watch-outs</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Iconic scenery + “postcard” coastal vibe</td>
      <td>Ölüdeniz</td>
      <td>Strong holiday feel and stunning nature nearby</td>
      <td>Can feel busy in peak season; choose a calmer street if you value sleep</td>
    </tr>
    <tr>
      <td>Lively evenings + social holiday energy</td>
      <td>Hisarönü</td>
      <td>Easy for nights out and a more upbeat atmosphere</td>
      <td>Not beach-front; plan how you’ll do beach days</td>
    </tr>
    <tr>
      <td>Calmer seaside base + evening walks</td>
      <td>Çalış</td>
      <td>Relaxed rhythm, good for slow mornings and easy evenings</td>
      <td>Choose based on your beach preference and day-trip style</td>
    </tr>
    <tr>
      <td>Flexibility + markets + transport ease</td>
      <td>Fethiye centre</td>
      <td>Best “base camp” for exploring the wider area</td>
      <td>Less “beach on the doorstep” feel unless you plan for it</td>
    </tr>
  </tbody>
</table>

<h2>The 60-second decision method (pick your daily routine)</h2>
<ul>
  <li><strong>If your dream day is beach-first:</strong> start with Ölüdeniz (or choose a base that makes beach time easy).</li>
  <li><strong>If your dream day is exploring + variety:</strong> Fethiye centre is often the easiest base to organise.</li>
  <li><strong>If your dream day includes lively nights:</strong> Hisarönü may fit better.</li>
  <li><strong>If your dream day is calm, walk, dinner, repeat:</strong> Çalış can be ideal.</li>
</ul>

<h2>Ölüdeniz: best for “classic coastal Turkey”</h2>
<p>Ölüdeniz is the name many UK travellers recognise first — and for good reason. It’s a strong choice if you want that unmistakable holiday atmosphere, dramatic scenery, and a base that feels like you’re properly “on the coast”.</p>

<!-- IMAGE_OLUDENIZ_PLACEHOLDER -->

<ul>
  <li><strong>Best for:</strong> first-time visitors who want iconic views, couples, travellers who want a beach-led trip.</li>
  <li><strong>Vibe:</strong> holiday-first, nature-and-sea focused.</li>
  <li><strong>Choose Ölüdeniz if:</strong> you want your base to feel like the destination, not just a place to sleep.</li>
</ul>

<h3>Ölüdeniz booking tips (UK-friendly)</h3>
<ul>
  <li><strong>Sleep matters:</strong> if you’re a light sleeper, prioritise quieter streets and accommodation known for calm nights.</li>
  <li><strong>Plan a “mix” week:</strong> do beach days plus a couple of exploring days, rather than trying to pack everything into daily hopping.</li>
  <li><strong>Keep expectations realistic:</strong> peak season can feel busy — go early in the day for your calm moments.</li>
</ul>

<h2>Hisarönü: best for lively evenings and a social base</h2>
<p>Hisarönü is often chosen by travellers who want a more energetic base, with a holiday strip feel and plenty happening in the evenings. It can be a good fit if your trip includes going out, meeting people, or you simply like a “busy holiday vibe”.</p>

<!-- IMAGE_HISARONU_PLACEHOLDER -->

<ul>
  <li><strong>Best for:</strong> friends trips, travellers who enjoy nightlife, anyone who wants a lively base.</li>
  <li><strong>Vibe:</strong> upbeat, social, evening-focused.</li>
  <li><strong>Choose Hisarönü if:</strong> you prefer a base where nights feel easy and active.</li>
</ul>

<h3>Hisarönü reality check</h3>
<ul>
  <li><strong>Beach logistics:</strong> plan how you’ll do beach time (and how often). Pick this base because you like the vibe, not because you want “step-out-and-swim”.</li>
  <li><strong>Noise awareness:</strong> if quiet nights are important, choose carefully within the area.</li>
</ul>

<h2>Çalış: best for calm seaside rhythm and easy evenings</h2>
<p>Çalış suits UK travellers who like a slower pace: long evening walks, casual meals, and a base that feels relaxed rather than “full holiday rush”. It’s also a good choice if you want somewhere that still feels like a real place when you’re not sightseeing.</p>

<!-- IMAGE_CALIS_PLACEHOLDER -->

<ul>
  <li><strong>Best for:</strong> couples, families who want calm evenings, travellers who prefer a steady routine.</li>
  <li><strong>Vibe:</strong> relaxed, seaside, walk-and-dinner friendly.</li>
  <li><strong>Choose Çalış if:</strong> you want comfort and calm, with exploring as an add-on.</li>
</ul>

<h3>Çalış tips for choosing the right spot</h3>
<ul>
  <li><strong>Walkability wins:</strong> choose a spot where you can easily walk to evening food options without relying on transport every night.</li>
  <li><strong>Beach preference:</strong> decide what “a good beach day” looks like for you, then match your base accordingly.</li>
</ul>

<h2>Fethiye centre: best “base camp” for exploring</h2>
<p>If you like the idea of having options every day — markets, local food, different day-trip directions — Fethiye centre can be the easiest place to base yourself. It’s particularly useful if you want to explore without feeling locked into one beach strip.</p>

<!-- IMAGE_CENTER_PLACEHOLDER -->

<ul>
  <li><strong>Best for:</strong> explorers, travellers who want flexibility, anyone who wants a more local rhythm.</li>
  <li><strong>Vibe:</strong> town life, variety, practical and convenient.</li>
  <li><strong>Choose Fethiye centre if:</strong> you want to build beach days and excursions into your trip rather than having them “built in”.</li>
</ul>

<h3>How to make Fethiye centre work for a beach-led holiday</h3>
<ul>
  <li><strong>Pick your “main beach days”</strong> in advance, so you don’t spend mornings deciding where to go.</li>
  <li><strong>Group activities:</strong> do day trips in clusters so you’re not bouncing around randomly.</li>
</ul>

<h2>Best base by traveller type (quick picks)</h2>
<ul>
  <li><strong>First-time UK couples:</strong> Ölüdeniz for iconic scenery, or Çalış for calm evenings.</li>
  <li><strong>Friends who want nights out:</strong> Hisarönü (if you prioritise the lively vibe).</li>
  <li><strong>Families:</strong> often Çalış for calm routines, or a quieter part of Ölüdeniz if beach-first is the goal.</li>
  <li><strong>Explorers:</strong> Fethiye centre as a practical base camp.</li>
</ul>

<h2>Common Fethiye mistakes (and how to avoid them)</h2>
<ul>
  <li><strong>Choosing “Fethiye” without choosing the area.</strong> Fix: decide whether you want beach-first (Ölüdeniz), nightlife (Hisarönü), calm seaside (Çalış), or flexible exploring (centre).</li>
  <li><strong>Booking a lively strip when you want sleep.</strong> Fix: prioritise side streets and calm-night setups.</li>
  <li><strong>Trying to change bases too often.</strong> Fix: pick one base and do day trips instead of constant packing.</li>
  <li><strong>Assuming every beach day is effortless.</strong> Fix: choose a base that matches how you want to do beach days (walkable vs planned trips).</li>
</ul>

<h2>Booking checklist (copy/paste before you book)</h2>
<ul>
  <li><strong>Define your vibe:</strong> iconic beach / nightlife / calm seaside / flexible town base.</li>
  <li><strong>Pick the area:</strong> Ölüdeniz, Hisarönü, Çalış, or Fethiye centre.</li>
  <li><strong>Protect your sleep:</strong> avoid the loudest streets if you’re sensitive to noise.</li>
  <li><strong>Plan your “must-do” days:</strong> choose 2–3 core activities so your week doesn’t become decision fatigue.</li>
  <li><strong>Money plan:</strong> decide your approach early:
    <a href="/guide/cash-or-card-in-turkey">Cash or Card in Turkey?</a>
  </li>
  <li><strong>Season reality:</strong> match your plans to your travel month:
    <a href="/guide/best-time-to-visit-turkey">Best Time to Visit Turkey (Month-by-Month)</a>
  </li>
</ul>

<h2>FAQs (UK travellers)</h2>

<h3>Is Ölüdeniz or Çalış better for a first trip?</h3>
<p>Ölüdeniz is better if you want the classic, scenic, beach-led holiday feel. Çalış is often better if you want calmer evenings and a steady, relaxed routine.</p>

<h3>Is Hisarönü a good base if I don’t care about nightlife?</h3>
<p>It can still work, but it’s usually chosen for its lively, social atmosphere. If you want calm, you’ll likely prefer Çalış, Fethiye centre, or a quieter setup elsewhere.</p>

<h3>Where should families stay in the Fethiye area?</h3>
<p>Many families prefer areas that support easy routines and calm evenings. Choose based on your priorities: beach-first convenience vs a calmer base with flexible day plans.</p>

<h3>Should I stay in Fethiye centre and do day trips, or stay on the coast?</h3>
<p>Stay in the centre if you want flexibility and variety. Stay on the coast if you want your base to feel like the holiday destination and you prefer beach days to be the default.</p>

<h3>How many days do I need in Fethiye?</h3>
<p>It works well as a main base for a week-style holiday, but it can also be a shorter add-on. The best length depends on whether you want a calm routine or lots of day trips.</p>

<h3>What’s the biggest mistake people make when booking?</h3>
<p>Not choosing the area based on their daily routine. “Fethiye” is not one single experience — the base you choose shapes the whole trip.</p>

<p><em>Last updated:</em> ${new Date().toLocaleDateString('en-GB')}</p>
        `;
  }

  let finalContent = baseContent;
  let coverImageUrl = '';
  const timestamp = Date.now();

  for (const item of articleData.images) {
    const filename = `${item.filenamePrefix}-${timestamp}.jpg`;
    const publicUrl = await generateImageVertexV4(item.prompt, filename);

    if (publicUrl) {
      if (item.placeholder.includes('COVER')) {
        coverImageUrl = publicUrl;
        // As per previous decision, we might want to keep the hero image ONLY in metadata
        // But previously for Antalya we removed it from body.
        // Let's stick to consistent removal from body if Cover.
        finalContent = finalContent.replace(item.placeholder, '');
      } else {
        const imgTag = `<img src="${publicUrl}" alt="${item.prompt}" class="w-full h-auto rounded-lg my-6 shadow-md" />`;
        finalContent = finalContent.replace(item.placeholder, imgTag);
      }
    }
  }

  // Update DB
  const { error: upsertError } = await supabase
    .from('articles')
    .update({
      content: { en: finalContent, tr: "<p>Çeviri yakında...</p>" },
      cover_image_url: coverImageUrl,
      updated_at: new Date().toISOString()
    })
    .eq('slug', articleData.slug);

  if (upsertError) {
    console.error(`❌ Failed to update ${articleData.slug}:`, upsertError);
  } else {
    console.log(`✅ Successfully regenerated images for ${articleData.slug}`);
  }
}

async function run() {
  await updateArticleImages(ANTALYA_DATA);
  await updateArticleImages(FETHIYE_DATA);
}

run();
