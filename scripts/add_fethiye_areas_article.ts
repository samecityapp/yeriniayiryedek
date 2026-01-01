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
    let baseDelay = 5000;

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
                if (response.status === 429) {
                    retries++;
                    const delay = baseDelay * (2 ** (retries - 1));
                    console.warn(`🔄 Rate limited (429). Retrying in ${delay / 1000}s...`);
                    await new Promise(res => setTimeout(res, delay));
                    continue;
                }
                throw new Error(`Vertex API Error: ${response.status}`);
            }

            const data = await response.json();
            const base64Image = data.predictions[0].bytesBase64Encoded;
            const buffer = Buffer.from(base64Image, 'base64');

            const localPath = path.join(ARTICLES_IMAGE_DIR, filename);
            const publicUrl = `/images/articles/${filename}`;

            fs.writeFileSync(localPath, buffer);
            console.log(`✅ Saved: ${localPath}`);

            return publicUrl;
        } catch (error) {
            if (retries >= maxRetries - 1) return null;
        }
    }
    return null;
}

const ARTICLE_DATA = {
    slug: 'where-to-stay-in-fethiye-best-areas-guide',
    title: 'Where to Stay in Fethiye: Best Areas for UK Travellers',
    meta_description: 'Choosing where to stay in Fethiye? Compare Ölüdeniz, Hisarönü/Ovacık, Çalış, Fethiye Centre, Kayaköy and Faralya/Kabak—vibe, pros/cons and transport tips.',
    content: `
<h1>Where to Stay in Fethiye: Best Areas for UK Travellers (No Hotel Names — Just the Right Base)</h1>

<p><strong>Quick answer:</strong> If your dream is the famous lagoon and beach days, choose <strong>Ölüdeniz</strong> (or <strong>Ovacık/Hisarönü</strong> just above it). If you want a calmer, flatter seafront with long walks and sunsets, <strong>Çalış</strong> is often the easiest base. If you want a practical base for boat trips, day tours and eating out, stay in <strong>Fethiye Centre</strong>. If you want “quiet Turkey” atmosphere, consider <strong>Kayaköy</strong>. If you want dramatic nature and a slower, wild-coast vibe, look at <strong>Faralya / Kabak</strong>.</p>

<p>This guide is written for UK travellers searching <em>“where to stay in Fethiye”</em>. The goal is simple: pick an area that matches your trip style so you don’t waste time commuting or end up in a vibe that doesn’t match your trip.</p>

<hr/>

<!-- IMAGE_COVER_PLACEHOLDER -->

<h2>Fethiye in one minute (so you choose the right base)</h2>
<ul>
  <li><strong>Fethiye Centre</strong> = practical hub (marina/town life/day trips).</li>
  <li><strong>Ölüdeniz</strong> = iconic beach + Blue Lagoon (close to Babadağ for paragliding).</li>
  <li><strong>Ovacık / Hisarönü</strong> = slightly inland above Ölüdeniz (often cooler evenings; easy access to Ölüdeniz by local routes).</li>
  <li><strong>Çalış</strong> = long seafront promenade, laid-back beach town vibe.</li>
  <li><strong>Kayaköy</strong> = peaceful, historic “ghost village” area.</li>
  <li><strong>Faralya / Kabak</strong> = nature-first, slower pace, scenic coast.</li>
</ul>

<hr/>

<h2>Best areas at a glance (pick your travel style)</h2>
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
      <td>The famous lagoon + classic Fethiye beach look</td>
      <td><strong>Ölüdeniz</strong></td>
      <td>Iconic Blue Lagoon & beach days; easy holiday feeling</td>
      <td>Busy in peak season; some areas are pricier</td>
    </tr>
    <tr>
      <td>Beach access but with “base flexibility”</td>
      <td><strong>Ovacık / Hisarönü</strong></td>
      <td>Close to Ölüdeniz; good for mixed days (beach + exploring)</td>
      <td>Not directly on the lagoon; you’ll travel down for beach time</td>
    </tr>
    <tr>
      <td>Calmer seafront + sunset walks</td>
      <td><strong>Çalış</strong></td>
      <td>Long promenade, restaurants and great sunsets</td>
      <td>Not the Blue Lagoon vibe; different kind of beach day</td>
    </tr>
    <tr>
      <td>Boat trips, eating out, day tours (most practical)</td>
      <td><strong>Fethiye Centre</strong></td>
      <td>Hub base; easiest for moving around</td>
      <td>Not a “step-out-onto-famous-beach” area</td>
    </tr>
    <tr>
      <td>Quiet, character, “old Turkey” atmosphere</td>
      <td><strong>Kayaköy</strong></td>
      <td>Peaceful, unique setting near Fethiye and Ölüdeniz</td>
      <td>Less convenient without a car/taxi for some plans</td>
    </tr>
    <tr>
      <td>Nature-first, slower, scenic coast</td>
      <td><strong>Faralya / Kabak</strong></td>
      <td>For hikers and switch-off trips</td>
      <td>More remote; best if you want fewer “town” conveniences</td>
    </tr>
  </tbody>
</table>

<hr/>

<h2>Ölüdeniz: best for the famous Blue Lagoon beach days</h2>
<p>Ölüdeniz is the “postcard” base. It’s a resort area close to Fethiye (often described as around 14km from Fethiye) and is famous for the lagoon beach and turquoise water.</p>

<h3>Choose Ölüdeniz if…</h3>
<ul>
  <li>your priority is <strong>beach days</strong> and that iconic lagoon scenery</li>
  <li>you want a simple holiday routine: swim → lunch → chill</li>
</ul>

<h3>Reality checks (so you don’t regret it)</h3>
<ul>
  <li><strong>It’s popular:</strong> the lagoon is within a protected nature park and can get crowded.</li>
  <li><strong>It’s also the paragliding zone:</strong> Babadağ above Ölüdeniz is widely known for paragliding flights down to the beach.</li>
</ul>

<!-- IMAGE_OLUDENIZ_PLACEHOLDER -->

<hr/>

<h2>Ovacık / Hisarönü: best “middle ground” base near Ölüdeniz</h2>
<p>If you like the idea of Ölüdeniz but want more flexibility (and often a bit more breathing space), Ovacık/Hisarönü is a strong base. The key reason it works: local public transport routes commonly connect <strong>Fethiye → Ovacık → Hisarönü → Ölüdeniz</strong>.</p>

<h3>Choose Ovacık/Hisarönü if…</h3>
<ul>
  <li>you want Ölüdeniz beach days but don’t need to sleep right next to the lagoon</li>
  <li>you want a base that can do “beach day” AND “explore day” without feeling stuck</li>
</ul>

<hr/>

<h2>Çalış: best for long sunset walks and a relaxed seafront vibe</h2>
<p>Çalış is a different kind of Fethiye holiday — less “Blue Lagoon postcard”, more “easy evenings and long walks”. Travellers consistently mention the <strong>long promenade</strong>, lots of places to eat, and memorable sunsets.</p>

<h3>Choose Çalış if…</h3>
<ul>
  <li>you want a <strong>calmer base</strong> with a simple daily rhythm</li>
  <li>you like a <strong>flat seafront</strong> you can walk any time of day</li>
</ul>

<h3>Not ideal if…</h3>
<ul>
  <li>your whole trip is “I want the lagoon look every day” — that’s Ölüdeniz territory</li>
</ul>

<hr/>

<h2>Fethiye Centre: best for “do a bit of everything” trips</h2>
<p>Fethiye Centre is the practical choice if you’re the kind of traveller who wants options: day tours, boat trips, eating out, and easy transport links. It’s also the easiest base if you’re arriving and leaving via Dalaman Airport and you want fewer moving parts.</p>

<h3>Airport reality (Dalaman)</h3>
<p>Many UK travellers fly into <strong>Dalaman Airport (DLM)</strong>. Route planners commonly state the road distance to Fethiye is around the mid-40km range and there are direct bus options depending on season/operator.</p>

<p><strong>Simple rule:</strong> If your flight lands late, a central base is usually the least stressful for night one.</p>

<!-- IMAGE_FETHIYE_CENTRE_PLACEHOLDER -->

<hr/>

<h2>Kayaköy: best for quiet atmosphere and a unique setting</h2>
<p>Kayaköy is known for its historic “ghost village” feel and is officially recognised as a heritage/archaeological site area. The Turkish Ministry of Culture and Tourism and Turkey’s museum portal both describe Kayaköy’s historical significance and protected status.</p>

<h3>Choose Kayaköy if…</h3>
<ul>
  <li>you want <strong>peace</strong> and atmosphere more than nightlife</li>
  <li>you’re happy doing short transfers/taxis for beach and town days</li>
</ul>

<!-- IMAGE_KAYAKOY_PLACEHOLDER -->

<hr/>

<h2>Faralya / Kabak: best for nature-first trips (hikers, switch-off holidays)</h2>
<p>If you want the “wild coast” side of this region — slower pace, scenic views, and a more nature-led trip — Faralya/Kabak is the shape. It also suits travellers interested in sections of the Lycian Way (the famous long-distance trail in this region).</p>

<h3>Choose Faralya/Kabak if…</h3>
<ul>
  <li>you want a <strong>digital detox</strong> vibe and you don’t need constant town convenience</li>
  <li>your trip is about <strong>views + nature + slowing down</strong></li>
</ul>

<hr/>

<h2>How to get around (the “don’t get stuck” transport note)</h2>
<p>Fethiye is built around local routes between the main bases. For example, MUTTAŞ lists a Fethiye–Ölüdeniz route that runs via <strong>Ovacık and Hisarönü</strong> (route info and timetables are published).</p>

<p><strong>Pro tip:</strong> Choose your base based on what you’ll do most days. If you plan “Ölüdeniz every day”, don’t stay too far away. If you plan “boat trips and tours”, centre is often easiest.</p>

<hr/>

<h2>Copy/paste decision checklist (UK travellers)</h2>
<ul>
  <li><strong>I want the famous lagoon scenery:</strong> Ölüdeniz</li>
  <li><strong>I want Ölüdeniz access but more base flexibility:</strong> Ovacık / Hisarönü</li>
  <li><strong>I want calm seafront + sunset walks:</strong> Çalış</li>
  <li><strong>I want the most practical hub:</strong> Fethiye Centre</li>
  <li><strong>I want quiet + unique atmosphere:</strong> Kayaköy</li>
  <li><strong>I want nature-first and slower pace:</strong> Faralya / Kabak</li>
</ul>

<hr/>

<h2>FAQs</h2>

<h3>Where is the best place to stay in Fethiye for first-timers?</h3>
<p>If you want the iconic lagoon beach look, pick Ölüdeniz. If you want a relaxed base with promenade walks and sunsets, Çalış is usually the easiest first-timer-friendly option.</p>

<h3>Is it better to stay in Ölüdeniz or Çalış?</h3>
<p>Ölüdeniz is for the lagoon and classic beach days (inside a protected nature park). Çalış is for a calmer seafront vibe with a long promenade and sunset walks.</p>

<h3>Can I get from Fethiye to Ölüdeniz easily without a car?</h3>
<p>Yes — official route listings include a Fethiye–Ölüdeniz service that runs via Ovacık and Hisarönü, and timetables are published.</p>

<h3>What airport do UK travellers use for Fethiye?</h3>
<p>Most fly into Dalaman (DLM). Travel planners commonly show direct bus options and a road distance around the mid-40km range.</p>

<p><em>Last updated:</em> ${new Date().toLocaleDateString('en-GB')}</p>
`
};

async function addFethiyeAreasArticle() {
    const timestamp = Date.now();

    // --- Authentic Mode Prompts (Imagen 3) ---
    const imagesToGenerate = [
        {
            placeholder: '<!-- IMAGE_COVER_PLACEHOLDER -->',
            filename: `fethiye-areas-cover-${timestamp}.jpg`,
            prompt: "A panoramic view of Fethiye bay with boats and green hills. Sunny day. Authentic Mediterranean coast travel photography."
        },
        {
            placeholder: '<!-- IMAGE_OLUDENIZ_PLACEHOLDER -->',
            filename: `fethiye-oludeniz-lagoon-${timestamp}.jpg`,
            prompt: "The famous Blue Lagoon in Ölüdeniz, Fethiye. Turquoise calm water. Pine trees. Authentic nature travel photography. High angle view."
        },
        {
            placeholder: '<!-- IMAGE_FETHIYE_CENTRE_PLACEHOLDER -->',
            filename: `fethiye-centre-harbour-${timestamp}.jpg`,
            prompt: "Fethiye harbour promenade with palm trees and parked gulets (boats). People walking. Authentic relaxed seaside town atmosphere."
        },
        {
            placeholder: '<!-- IMAGE_KAYAKOY_PLACEHOLDER -->',
            filename: `fethiye-kayakoy-ruins-${timestamp}.jpg`,
            prompt: "The stone ruins of Kayaköy ghost village on a hillside. Atmospheric and historic. Sunlight filtering through trees. Authentic cultural heritage photography."
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

    // Use UPSERT
    const { error } = await supabase.from('articles').upsert({
        slug: ARTICLE_DATA.slug,
        title: { en: ARTICLE_DATA.title, tr: "Fethiye'de Nerede Kalınır: En İyi Bölgeler Rehberi" },
        meta_description: { en: ARTICLE_DATA.meta_description, tr: "Ölüdeniz, Hisarönü, Çalış ve Fethiye Merkez konaklama rehberi. Hangi bölge kime uygun?" },
        content: { en: finalContent, tr: "<p>Çeviri yakında...</p>" },
        location: { en: 'Fethiye', tr: 'Fethiye' },
        cover_image_url: coverImageUrl,
        published_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    }, { onConflict: 'slug' });

    if (error) {
        console.error("❌ DB Insert Failed:", error);
    } else {
        console.log("✅ Fethiye Areas Article Added Successfully with Imagen 3 Images!");
    }
}

addFethiyeAreasArticle();
