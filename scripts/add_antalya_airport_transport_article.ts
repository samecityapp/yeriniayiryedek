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
    slug: 'antalya-airport-to-city-centre-transport-guide',
    title: 'Antalya Airport (AYT) to City Centre: Tram, Bus, Shuttle & Taxi (UK-Friendly Guide)',
    meta_description: 'Landing at Antalya Airport (AYT)? Here’s the smooth way into the city: AntRay tram, city buses, terminal shuttles, taxis and simple planning tips—no stress, no hotel names.',
    content: `
<h1>Antalya Airport (AYT) to City Centre: The Smooth UK Arrival Guide (Tram, Bus, Shuttle, Taxi)</h1>

<p><strong>Quick answer:</strong> If you want the easiest “no-thinking” arrival, take an <strong>official taxi</strong> (or a pre-arranged transfer). If you want a great-value local option, use <strong>AntRay (tram)</strong> or <strong>municipality buses</strong>—and check live times in the <strong>Antalyakart</strong> app so your arrival feels effortless.</p>

<p>Internal reads (placeholders):
<a href="/guide/where-to-stay-in-antalya-best-areas-guide-uk">Where to Stay in Antalya (Best Areas)</a> •
<a href="/guide/antalya-itinerary-4-days-uk-friendly-guide">Antalya Itinerary: 4 Days (UK-Friendly)</a> •
<a href="/guide/antalya-old-town-kaleici-guide">Kaleiçi (Old Town): What to Know</a></p>

<hr/>

<!-- IMAGE_COVER_PLACEHOLDER -->

<h2>Step 1: Know your destination name (this makes everything easier)</h2>
<ul>
  <li><strong>Kaleiçi</strong> = Old Town / historic centre feel</li>
  <li><strong>Konyaaltı</strong> = long beach strip + city vibe</li>
  <li><strong>Lara</strong> = classic beach base feel</li>
  <li><strong>Otogar</strong> = intercity bus terminal</li>
</ul>

<p>Save your accommodation pin + the area name before you land.</p>

<hr/>

<h2>Option A: AntRay (tram) – easy, local, and very “Antalya”</h2>
<p>Antalya Airport’s own transport page states that <strong>AntRay</strong> operates between <strong>Airport – Meydan – Fatih</strong> and carries passengers on the route linking the airport with the city centre and the intercity bus terminal (Otogar).</p>

<p><strong>How to do it smoothly:</strong></p>
<ol>
  <li>Follow signs for <strong>public transport / AntRay</strong> after arrivals.</li>
  <li>Use the <strong>Antalyakart app</strong> to check the next departures (more on this below).</li>
  <li>If you’re heading to Kaleiçi, you can tram into central areas and then do a short final hop (walk/taxi/bus depending on your exact spot).</li>
</ol>

<p><strong>Tickets / payment:</strong> Antalya Ulaşım’s Antray rules list several accepted options, including <strong>Antalyakart</strong> cards and contactless bank cards (where available in the system).</p>

<p><strong>Live tram times:</strong> Antalya Ulaşım also publishes official AntRay departure times online.</p>

<!-- IMAGE_TRAM_PLACEHOLDER -->

<hr/>

<h2>Option B: Municipality buses – practical and widely used</h2>
<p>Antalya Airport confirms there are <strong>different bus services</strong> operating from the airport to the city centre and wider region, and that passenger transport is provided to the city centre or the intercity bus terminal by city buses.</p>

<p><strong>The best way to plan buses (official):</strong> The airport tells passengers to check bus departure times via the <strong>Antalyakart</strong> mobile app or by calling the <strong>Transportation Information Line</strong> at <strong>0242 606 07 07</strong>.</p>

<!-- IMAGE_BUS_PLACEHOLDER -->

<hr/>

<h2>Option C: Free terminal shuttle (between terminals)</h2>
<p>If you need to move between terminals, Antalya Airport states it runs <strong>free shuttle buses</strong> between Domestic/Terminal 1 and Terminal 2, departing every <strong>20 minutes</strong>.</p>

<hr/>

<h2>Option D: Official taxi / transfer – simplest door-to-door</h2>
<p>If you want the most comfortable “arrive and glide” experience (especially with luggage or family), taxi/transfer is the cleanest choice. Just show your exact map pin + area name (Kaleiçi / Konyaaltı / Lara), and you’re set.</p>

<!-- IMAGE_TAXI_PLACEHOLDER -->

<hr/>

<h2>Your “guaranteed smooth” move: use Antalyakart for live times</h2>
<p>The airport itself recommends Antalyakart for checking departure times.</p>

<p>The official Antalyakart app listing describes features like route planning and viewing vehicle arrival/departure times.</p>

<hr/>

<h2>Mini guide: which option suits which UK traveller?</h2>
<ul>
  <li><strong>First time in Antalya + want maximum ease:</strong> Taxi/transfer</li>
  <li><strong>Solo / light luggage / enjoy local travel:</strong> AntRay tram</li>
  <li><strong>Heading toward the bus terminal / connecting onward:</strong> Municipality buses (check in Antalyakart)</li>
  <li><strong>Need to move between terminals:</strong> Free shuttle every 20 minutes</li>
</ul>

<hr/>

<h2>FAQs</h2>

<h3>Is there public transport from Antalya Airport to the city centre?</h3>
<p>Yes. The airport states there are bus services and rail system services (AntRay) connecting the airport with the city centre and beyond.</p>

<h3>How do I check the latest bus departure times?</h3>
<p>Antalya Airport says you can check times in the Antalyakart mobile app or via the Transportation Information Line (0242 606 07 07).</p>

<h3>Does Antalya Airport have a shuttle between terminals?</h3>
<p>Yes—Antalya Airport states it operates free shuttles between terminals, departing every 20 minutes.</p>

<h3>Where can I see official AntRay departure times?</h3>
<p>Antalya Ulaşım provides an official AntRay departure times page online.</p>

<p><em>Last updated:</em> ${new Date().toLocaleDateString('en-GB')}</p>
`
};

async function addAntalyaAirportTransportArticle() {
    const timestamp = Date.now();

    // --- Authentic Mode Prompts (Imagen 3) ---
    const imagesToGenerate = [
        {
            placeholder: '<!-- IMAGE_COVER_PLACEHOLDER -->',
            filename: `antalya-airport-terminal-exterior-${timestamp}.jpg`,
            prompt: "Antalya Airport modern terminal exterior. Glass facade, travellers with luggage, blue sky, palm trees in foreground. Authentic travel photography."
        },
        {
            placeholder: '<!-- IMAGE_TRAM_PLACEHOLDER -->',
            filename: `antalya-airport-antray-tram-${timestamp}.jpg`,
            prompt: "AntRay modern tram waiting at the station platform. Antalya public transport vibe. Authentic city travel photography."
        },
        {
            placeholder: '<!-- IMAGE_BUS_PLACEHOLDER -->',
            filename: `antalya-airport-bus-stop-${timestamp}.jpg`,
            prompt: "Travellers waiting at a bus stop outside Antalya Airport. Public bus approaching. Sunny day. Authentic travel documentary style."
        },
        {
            placeholder: '<!-- IMAGE_TAXI_PLACEHOLDER -->',
            filename: `antalya-airport-taxi-rank-${timestamp}.jpg`,
            prompt: "Official yellow taxis lined up at Antalya Airport taxi rank. Drivers waiting near cars. Authentic travel transportation photography."
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
        title: { en: ARTICLE_DATA.title, tr: "Antalya Havalimanı (AYT) Şehir Merkezi Ulaşım Rehberi" },
        meta_description: { en: ARTICLE_DATA.meta_description, tr: "Antalya Havalimanı'ndan şehir merkezine nasıl gidilir? AntRay tramvay, otobüs, Havaş ve taksi seçenekleri." },
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
        console.log("✅ Antalya Airport Transport Article Added Successfully with Imagen 3 Images!");
    }
}

addAntalyaAirportTransportArticle();
