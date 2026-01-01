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

        if (!data.predictions || data.predictions.length === 0) {
            console.error("❌ Vertex AI Response Error. Full Response:", JSON.stringify(data, null, 2));
            throw new Error('No predictions returned');
        }

        if (!data.predictions[0].bytesBase64Encoded) {
            console.error("❌ Missing bytesBase64Encoded in prediction:", JSON.stringify(data.predictions[0], null, 2));
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
        console.error("❌ Generation Failed:", error);
        return null;
    }
}


const ARTICLE_DATA = {
    slug: 'where-to-stay-in-fethiye-best-areas-guide',
    title: 'Where to Stay in Fethiye: Best Areas for UK Travellers (Ölüdeniz vs Hisarönü vs Çalış vs Fethiye Centre)',
    meta_description: 'Choose the best area to stay in Fethiye. Compare Ölüdeniz, Hisarönü, Çalış and Fethiye centre by vibe, beaches, nights and ease.',
    content: `
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

<p><em>Last updated:</em> ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
  `
};

async function addFethiyeArticle() {
    const timestamp = Date.now();

    const imagesToGenerate = [
        {
            placeholder: '<!-- IMAGE_COVER_PLACEHOLDER -->',
            filename: `fethiye-cover-${timestamp}.jpg`,
            prompt: "A breathtaking wide-angle shot of Oludeniz Blue Lagoon from above (Babadag paragliding view). Bright turquoise water meeting white sand. Lush green pine forests. Authentic summer holiday vibe, high resolution, photorealistic."
        },
        {
            placeholder: '<!-- IMAGE_OLUDENIZ_PLACEHOLDER -->',
            filename: `fethiye-oludeniz-beach-${timestamp}.jpg`,
            prompt: "A candid beach level shot of Oludeniz Belcekiz beach. Pebble texture, clear blue waves crashing gently. People sunbathing in distance. Paragliders in the sky. Bright natural lighting, realistic travel photography."
        },
        {
            placeholder: '<!-- IMAGE_HISARONU_PLACEHOLDER -->',
            filename: `fethiye-hisaronu-night-${timestamp}.jpg`,
            prompt: "A lively evening street scene in Hisaronu. Colorful lights of restaurants and shops. Tourists walking happily. Warm ambient lighting, energetic atmosphere. Handheld camera style, realistic sharp focus."
        },
        {
            placeholder: '<!-- IMAGE_CALIS_PLACEHOLDER -->',
            filename: `fethiye-calis-sunset-${timestamp}.jpg`,
            prompt: "Unforgettable sunset at Calis Beach. Silhouette of palm trees and people walking on the promenade. Orange and purple sky reflecting on the sea. Relaxed, romantic mood. Authentic golden hour photography."
        },
        {
            placeholder: '<!-- IMAGE_CENTER_PLACEHOLDER -->',
            filename: `fethiye-center-market-${timestamp}.jpg`,
            prompt: "A bustling scene at Fethiye Tuesday market or fish market. Fresh vegetables/fish on display. Locals and tourists shopping. Authentic Turkish market colors. Natural daylight, depth of field."
        }
    ];

    let finalContent = ARTICLE_DATA.content;
    let coverImageUrl = '';

    for (const item of imagesToGenerate) {
        const publicUrl = await generateImageVertexV4(item.prompt, item.filename);
        if (publicUrl) {
            if (item.placeholder.includes('COVER')) {
                coverImageUrl = publicUrl;
                // Don't remove cover placeholder, replace it with the image to show it at top of content if desired.
                // Or if the design uses cover_image_url only, then remove it.
                // User's Antalya script removed it from body. Let's stick to that pattern if cover_image_url handles the hero.
                // BUT, looking at Antalya content, it had the placeholder after the intro.
                // Let's replace it with the image tag to be safe and rich.
                // Correction: Antalya script logic was:
                /*
                    if (item.placeholder.includes('COVER')) {
                        coverImageUrl = publicUrl;
                        finalContent = finalContent.replace(item.placeholder, ''); // Remove placeholder from body
                    }
                */
                // I will follow the same pattern -> Cover image is for metadata hero, removed from body flow to avoid duplication.
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
        title: { en: ARTICLE_DATA.title, tr: "Fethiye'de Nerede Kalınır?" },
        meta_description: { en: ARTICLE_DATA.meta_description, tr: "Fethiye tatili için en iyi bölgeleri keşfedin." },
        content: { en: finalContent, tr: "<p>Çeviri yakında...</p>" },
        cover_image_url: coverImageUrl,
        // No category_id based on previous error
        published_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    }, { onConflict: 'slug' });

    if (error) {
        console.error("❌ DB Insert Failed:", error);
    } else {
        console.log("✅ Fethiye Article Added Successfully with Imagen 4 Images!");
    }
}

addFethiyeArticle();
