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
    slug: 'antalya-airport-to-city-transfers-guide',
    title: 'Antalya Airport (AYT) to City: Best Transfer Options to Kaleiçi, Konyaaltı & Lara (UK-Friendly Guide)',
    meta_description: 'Landing at Antalya Airport (AYT)? Compare tram, bus and taxi options to Kaleiçi (Old Town), Konyaaltı and Lara—plus easy tips to avoid stress.',
    content: `
<h1>Antalya Airport (AYT) to City: Best Transfer Options to Kaleiçi, Konyaaltı & Lara (UK-Friendly Guide)</h1>

<p><strong>Quick answer:</strong> For most UK travellers, the simplest options are <strong>AntRay (tram)</strong> into the city for budget travel, or an <strong>official taxi</strong> for comfort — especially if you land late, have lots of luggage, or want door-to-door. Antalya Airport also points travellers to <strong>Antalyakart</strong> for public transport times.</p>

<p>If you’re still deciding which area suits you best, read:
<a href="/guide/where-to-stay-in-antalya-best-areas-guide">Where to Stay in Antalya (Best Areas for UK Travellers)</a>.</p>

<hr/>

<!-- IMAGE_COVER_PLACEHOLDER -->

<h2>Step 0: Know your terminal (and the free terminal shuttle)</h2>
<ul>
  <li>Antalya Airport operates a <strong>free shuttle</strong> between terminals (useful if you arrive at one terminal but your transport stop is at another).</li>
  <li>Shuttles depart regularly and stops are in front of the departures areas.</li>
</ul>

<hr/>

<h2>Option A (Best budget + reliable): AntRay tram from the airport</h2>
<p>Antalya Airport confirms that <strong>AntRay</strong> provides services on the route <strong>Airport – Meydan – Fatih</strong> and carries passengers between the airport, city centre and key points like the intercity bus terminal (Otogar).</p>

<h3>When to choose the tram</h3>
<ul>
  <li>You’re travelling light (or don’t mind a short walk/transfer)</li>
  <li>You want predictable public transport</li>
  <li>You’re staying somewhere that’s easy to reach from a central stop (or you’re happy to take a short taxi at the end)</li>
</ul>

<h3>How to do it (simple steps)</h3>
<ol>
  <li>Follow “Tram / AntRay” signs from arrivals.</li>
  <li>Use your transport card/payment method as required.</li>
  <li>Ride AntRay towards the city and get off at the most convenient central stop for your area.</li>
  <li>Finish with a short walk or short official taxi if needed.</li>
</ol>

<p><strong>Important:</strong> For the most accurate departure times, Antalya Airport advises checking the <strong>Antalyakart mobile app</strong> or calling their transport information line.</p>

<!-- IMAGE_TRAM_PLACEHOLDER -->

<hr/>

<h2>Option B (Most flexible): City buses + Antalyakart app</h2>
<p>Antalya Airport’s official guidance points travellers to the <strong>Antalyakart</strong> system for public transport timings and suggests checking schedules via the app or the transport information line.</p>

<h3>When to choose buses</h3>
<ul>
  <li>You want the cheapest option and you’re comfortable with local-style travel</li>
  <li>You’re staying in a district that buses serve more directly than the tram</li>
  <li>You don’t mind that routes/timetables can vary by time of day</li>
</ul>

<h3>How to do it (guarantee method)</h3>
<ol>
  <li>At the airport, identify the correct bus stop for public transport.</li>
  <li>Open <strong>Antalyakart app</strong> and search your destination area (Kaleiçi / Konyaaltı / Lara) to find the best route at that moment.</li>
  <li>Take the bus to the closest major stop, then walk or take a short official taxi.</li>
</ol>

<hr/>

<h2>Option C (Easiest with luggage): Official airport taxi</h2>
<p>If you want door-to-door (especially late arrivals, families, heavy luggage), use the official taxi ranks at the airport.</p>

<ul>
  <li>Antalya Airport states there are <strong>taxi stands in front of arrival exits of all terminals</strong>.</li>
  <li>It also notes drivers have <strong>special airport identification tags</strong> and there’s a fare signboard near the taxi rank.</li>
</ul>

<h3>Taxi “boring rules” (do this every time)</h3>
<ul>
  <li>Use the <strong>official rank</strong> only (no random offers inside the terminal).</li>
  <li>Take a quick photo of the taxi details if you like (easy peace of mind).</li>
  <li>If you’re travelling with kids or lots of bags, taxi is often worth it.</li>
</ul>

<!-- IMAGE_TAXI_PLACEHOLDER -->

<hr/>

<h2>Best option by destination (Kaleiçi vs Konyaaltı vs Lara)</h2>

<h3>Kaleiçi (Old Town)</h3>
<ul>
  <li><strong>Best for:</strong> Tram to city + short final taxi/walk, OR official taxi door-to-door.</li>
  <li><strong>Why:</strong> Old Town streets can be narrow and the “last 10 minutes” is the part that’s easiest by foot or short taxi.</li>
</ul>

<h3>Konyaaltı</h3>
<ul>
  <li><strong>Best for:</strong> Official taxi (simplest), or Tram into city + public transport connection (use Antalyakart app).</li>
  <li><strong>Why:</strong> It’s a long coastal zone — the exact “right stop” depends on where you’re staying.</li>
</ul>

<h3>Lara</h3>
<ul>
  <li><strong>Best for:</strong> Official taxi (easy), or public transport route found via Antalyakart app at your arrival time.</li>
  <li><strong>Why:</strong> Lara is a broad area and routes can vary; app-based routing prevents wrong turns.</li>
</ul>

<hr/>

<h2>Common arrival mistakes (and quick fixes)</h2>
<ul>
  <li><strong>Mistake:</strong> Landing late and trying to “figure it out” outside. <strong>Fix:</strong> take an official taxi for night one, learn public transport next day.</li>
  <li><strong>Mistake:</strong> Guessing tram/bus times. <strong>Fix:</strong> use the Antalyakart app or the official info line.</li>
  <li><strong>Mistake:</strong> Using unofficial taxi offers. <strong>Fix:</strong> always use the taxi rank at arrivals.</li>
</ul>

<hr/>

<h2>Copy/paste: AYT arrival checklist (UK travellers)</h2>
<ul>
  <li>Decide: <strong>tram (budget)</strong> vs <strong>official taxi (comfort)</strong></li>
  <li>If public transport: check <strong>Antalyakart app</strong> for live times</li>
  <li>If taxi: use <strong>official taxi rank</strong> at arrivals (all terminals)</li>
  <li>If you need to move terminals: use the <strong>free airport shuttle</strong></li>
</ul>

<hr/>

<h2>FAQs</h2>

<h3>Is there a tram from Antalya Airport to the city?</h3>
<p>Yes — Antalya Airport states that AntRay runs between the airport and the city via the Airport–Meydan–Fatih route.</p>

<h3>How do I check Antalya Airport public transport times?</h3>
<p>The airport advises using the Antalyakart mobile app or calling the transport information line.</p>

<h3>Where do I find official taxis at Antalya Airport?</h3>
<p>The airport states taxi stands are located in front of arrivals exits of all terminals and drivers have airport ID tags.</p>

<p><em>Last updated:</em> ${new Date().toLocaleDateString('en-GB')}</p>
`
};

async function addAntalyaAirportArticle() {
    const timestamp = Date.now();

    // --- Authentic Mode Prompts (Imagen 3) ---
    const imagesToGenerate = [
        {
            placeholder: '<!-- IMAGE_COVER_PLACEHOLDER -->',
            filename: `antalya-airport-cover-${timestamp}.jpg`,
            prompt: "Travelers walking with luggage outside Antalya Airport terminal. Sunny day. Palm trees visible. Authentic travel documentary style."
        },
        {
            placeholder: '<!-- IMAGE_TRAM_PLACEHOLDER -->',
            filename: `antalya-antray-tram-${timestamp}.jpg`,
            prompt: "Modern AntRay tram stopping at a station in Antalya. People waiting. Daylight. Authentic public transport photography."
        },
        {
            placeholder: '<!-- IMAGE_TAXI_PLACEHOLDER -->',
            filename: `antalya-airport-taxi-${timestamp}.jpg`,
            prompt: "Yellow official taxis lined up at the Antalya Airport taxi rank. Professional, organized queuing. Authentic travel logistics."
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
        title: { en: ARTICLE_DATA.title, tr: "Antalya Havalimanı - Şehir Merkezi Ulaşım Rehberi" },
        meta_description: { en: ARTICLE_DATA.meta_description, tr: "Antalya Havalimanı'ndan Kaleiçi, Konyaaltı ve Lara'ya ulaşım: Tramvay, otobüs ve taksi seçenekleri." },
        content: { en: finalContent, tr: "<p>Çeviri yakında...</p>" },
        location: { en: 'Antalya', tr: 'Antalya' },
        cover_image_url: coverImageUrl,
        published_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    }, { onConflict: 'slug' });

    if (error) {
        console.error("❌ DB Insert Failed:", error);
    } else {
        console.log("✅ Antalya Airport Article Added Successfully with Imagen 3 Images!");
    }
}

addAntalyaAirportArticle();
