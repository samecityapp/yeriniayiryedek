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
    slug: 'fethiye-to-oludeniz-how-to-get-there-dolmus-bus-taxi',
    title: 'Fethiye to Ölüdeniz: How to Get There (Dolmuş, Bus, Taxi)',
    meta_description: 'How to get from Fethiye to Ölüdeniz (Blue Lagoon): the direct public route via Ovacık/Hisarönü, what to ask for, timings, costs to confirm, and late-night tips.',
    content: `
<h1>Fethiye to Ölüdeniz: How to Get There (Simple, No-Stress Guide for UK Travellers)</h1>

<p><strong>Quick answer:</strong> The easiest public option is the direct route that runs <strong>Fethiye → Ovacık → Hisarönü → Ölüdeniz</strong>. On the official public network, this appears as <strong>MUTTAŞ line 3-40</strong> with published timetables for weekdays/weekends.</p>

<p>If you’re still deciding where to base yourself, read:
<a href="/guide/where-to-stay-in-fethiye-best-areas-guide">Where to Stay in Fethiye (Ölüdeniz vs Çalış vs Centre)</a>.</p>

<hr/>

<!-- IMAGE_COVER_PLACEHOLDER -->

<h2>Option 1 (Best value + easy): public minibus/bus via Ovacık & Hisarönü</h2>
<p>The standard public route between Fethiye and Ölüdeniz runs via <strong>Ovacık</strong> and <strong>Hisarönü</strong>. In the MUTTAŞ network this is listed as <strong>line 3-40</strong> with the route shown as <strong>Fethiye – Ovacık – Hisarönü – Ölüdeniz</strong>.</p>

<h3>How to do it (guarantee method)</h3>
<ol>
  <li>Go to the local public transport departure point in Fethiye and ask for: <strong>“Ölüdeniz dolmuş / Ölüdeniz bus”</strong>.</li>
  <li>Double-check the route is going via <strong>Ovacık</strong> and <strong>Hisarönü</strong> (that’s the normal line to Ölüdeniz).</li>
  <li>Pay on board using the current accepted method (cash is still the safest backup).</li>
  <li>Get off at the stop that matches where you’re staying (if unsure, show your location on your phone and ask the driver).</li>
</ol>

<h3>Timings (what’s safe to say)</h3>
<p>MUTTAŞ publishes scheduled departures for <strong>weekdays, Saturdays and Sundays</strong>. For example, the printed timetable shows early departures starting around <strong>06:45 from Fethiye</strong> and around <strong>06:50 from Ölüdeniz</strong> (exact schedules change, so check the official timetable before relying on a specific time).</p>

<p><strong>Pro rule:</strong> If you’re travelling very early or late, check the timetable that week and have a taxi as backup.</p>

<!-- IMAGE_DOLMUS_PLACEHOLDER -->

<hr/>

<h2>Option 2 (Easiest with luggage): taxi</h2>
<p>If you’re arriving with heavy luggage, travelling with kids, or landing late and just want the simplest door-to-door option, taxi is the friction-free choice.</p>

<ul>
  <li><strong>Best for:</strong> late arrivals, families, anyone who hates transfers</li>
  <li><strong>Reality check:</strong> travel time depends heavily on traffic and pickup point, so don’t plan tight connections</li>
</ul>

<p><strong>Copy/paste for drivers:</strong> “Ölüdeniz (Blue Lagoon area), please.”</p>

<!-- IMAGE_TAXI_PLACEHOLDER -->

<hr/>

<h2>Option 3 (Best for control): private transfer</h2>
<p>If you want a fixed pickup (especially from Dalaman Airport or a specific address) and you don’t want any on-the-day transport uncertainty, private transfer is the “set and forget” option.</p>

<ul>
  <li><strong>Best for:</strong> airport arrivals, groups, travellers with strict schedules</li>
  <li><strong>What to confirm:</strong> total price, pickup point, waiting time, and whether baggage is included</li>
</ul>

<hr/>

<h2>Common mistakes (and quick fixes)</h2>
<ul>
  <li><strong>Mistake:</strong> Getting on a vehicle that doesn’t actually go to Ölüdeniz. <strong>Fix:</strong> confirm “Ölüdeniz via Ovacık & Hisarönü” before boarding.</li>
  <li><strong>Mistake:</strong> Assuming night services run like daytime. <strong>Fix:</strong> check the official timetable for your date; keep taxi as fallback.</li>
  <li><strong>Mistake:</strong> Not carrying small cash. <strong>Fix:</strong> keep a little TRY for transport and small extras.</li>
</ul>

<hr/>

<h2>FAQs</h2>

<h3>Is there a direct bus from Fethiye to Ölüdeniz?</h3>
<p>Yes — the official MUTTAŞ listing shows a direct route <strong>Fethiye – Ovacık – Hisarönü – Ölüdeniz</strong> (line <strong>3-40</strong>) with published schedules.</p>

<h3>What time does the first bus run?</h3>
<p>The published timetable shows early departures starting around <strong>06:45 from Fethiye</strong> and around <strong>06:50 from Ölüdeniz</strong>, but always check the current timetable because schedules can change.</p>

<h3>What’s the easiest way with luggage?</h3>
<p>Taxi or private transfer — it’s door-to-door and removes all “where do I get off?” stress.</p>

<p><em>Last updated:</em> ${new Date().toLocaleDateString('en-GB')}</p>
`
};

async function addFethiyeTransportArticle() {
    const timestamp = Date.now();

    // --- Authentic Mode Prompts (Imagen 3) ---
    const imagesToGenerate = [
        {
            placeholder: '<!-- IMAGE_COVER_PLACEHOLDER -->',
            filename: `fethiye-transport-cover-${timestamp}.jpg`,
            prompt: "A winding coastal road view from Fethiye towards Ölüdeniz with pine trees and sea in the distance. Sunny day. Authentic road trip photography."
        },
        {
            placeholder: '<!-- IMAGE_DOLMUS_PLACEHOLDER -->',
            filename: `fethiye-dolmus-stop-${timestamp}.jpg`,
            prompt: "A white modern public minibus (dolmuş) driving on a road in Fethiye with green hills background. Authentic Turkish public transport photography."
        },
        {
            placeholder: '<!-- IMAGE_TAXI_PLACEHOLDER -->',
            filename: `fethiye-taxi-view-${timestamp}.jpg`,
            prompt: "Yellow taxi driving on a scenic road near Fethiye. Mountains in background. Authentic travel photography."
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
        title: { en: ARTICLE_DATA.title, tr: "Fethiye - Ölüdeniz Ulaşım: Otobüs, Dolmuş ve Taksi" },
        meta_description: { en: ARTICLE_DATA.meta_description, tr: "Fethiye'den Ölüdeniz'e nasıl gidilir? Dolmuş saatleri, taksi ve transfer seçenekleri. MUTTAŞ 3-40 hattı detayları." },
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
        console.log("✅ Fethiye Transport Article Added Successfully with Imagen 3 Images!");
    }
}

addFethiyeTransportArticle();
