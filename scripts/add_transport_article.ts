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
    slug: 'how-to-get-around-istanbul-transport-guide',
    title: 'How to Get Around Istanbul: Transport Guide for UK Tourists',
    meta_description: 'A UK-friendly guide to Istanbul transport: Istanbulkart, trams, metro, ferries and airport transfers. Simple routes, mistakes to avoid and tips.',
    content: `
<h1>How to Get Around Istanbul: A Simple Transport Guide for UK Travellers (Istanbulkart, Tram, Metro, Ferries + Airport Transfers)</h1>

<p><strong>Quick answer:</strong> The easiest way to move around Istanbul is to use an <strong>Istanbulkart</strong> and build your days around a few key lines — especially the <strong>T1 tram</strong> for classic sightseeing. For airports, use <strong>official public transport</strong> (metro/bus) or a reputable transfer rather than guessing on arrival.</p>

<p>If you’re still choosing where to base yourself, start here:
<a href="/guide/where-to-stay-in-istanbul-best-areas-guide">Where to Stay in Istanbul (Best Areas)</a>.
For safety basics (including taxi rules):
<a href="/guide/is-turkey-safe-to-visit-uk-travel-checklist">Is Turkey Safe to Visit? (UK Checklist)</a>.
</p>

<hr/>

<!-- IMAGE_COVER_PLACEHOLDER -->

<h2>1) Istanbulkart: the one thing that makes transport easy</h2>

<p><strong>Istanbulkart</strong> is the city’s transport payment card and works across major public transport types (bus, metro, tram, ferries, etc.). You top it up with TRY and tap in/out where required.</p>

<h3>What UK travellers should know (the “no surprises” version)</h3>
<ul>
  <li><strong>Buy + top up:</strong> You’ll need to load Turkish lira onto it for travel.</li>
  <li><strong>Don’t over-top-up:</strong> Tourist guidance notes that leftover balance typically won’t be refunded at the end of your visit, so load sensibly.</li>
  <li><strong>Fares change:</strong> Instead of guessing, you can check current official fares on Metro İstanbul’s “Tickets and Fares” page.</li>
</ul>

<h3>Where Istanbulkart is most useful</h3>
<ul>
  <li>Airport-to-city journeys (when using metro/buses that accept it)</li>
  <li>Tram and metro sightseeing days</li>
  <li>Ferry hops (a great “Istanbul experience” in itself)</li>
</ul>

<!-- IMAGE_ISTANBULKART_PLACEHOLDER -->

<hr/>

<h2>2) The tourist “golden line”: T1 tram (your Istanbul cheat code)</h2>

<p>If you’re visiting the classic sights, the <strong>T1 Kabataş–Bağcılar tram</strong> is the route you’ll probably use most. It passes major sightseeing stops including <strong>Karaköy, Eminönü, Sirkeci, Gülhane, Sultanahmet, Beyazıt/Grand Bazaar</strong> and more.</p>

<h3>T1 tram: why it’s perfect for UK first-timers</h3>
<ul>
  <li><strong>Simple:</strong> fewer “where am I?” moments</li>
  <li><strong>Walkable sightseeing:</strong> get off, explore, get back on</li>
  <li><strong>Connects key zones:</strong> Historic Peninsula + waterfront + transfers</li>
</ul>

<p><strong>Pro tip:</strong> Don’t try to cross the entire city multiple times per day. Plan one main zone in the morning, one in the afternoon.</p>

<hr/>

<h2>3) Metro, funiculars, and “linking” neighbourhoods</h2>

<p>Istanbul’s network is big. Instead of memorising everything, use two principles:</p>
<ul>
  <li><strong>Principle A:</strong> Use T1 for the historic core.</li>
  <li><strong>Principle B:</strong> Use metro/funicular links to move between major neighbourhood clusters (especially if your base is Karaköy/Galata/Taksim/Şişli areas).</li>
</ul>

<p>For official service info and timetables, Metro İstanbul publishes line details and updates.</p>

<!-- IMAGE_METRO_PLACEHOLDER -->

<hr/>

<h2>4) Ferries: the easiest “wow moment” transport in Istanbul</h2>

<p>Even if you’re not a “public transport person”, ferries are worth doing at least once. They turn travel time into sightseeing. Istanbulkart can be used across ferries as part of the wider public transport system.</p>

<h3>Best ferry use-cases for tourists</h3>
<ul>
  <li><strong>European ↔ Asian side hop</strong> (for a different vibe and food scene)</li>
  <li><strong>Sunset ride</strong> when you want a calm break from crowds</li>
</ul>

<p>If you base yourself on the Asian side (Kadıköy), ferries become part of your daily routine:
<a href="/guide/where-to-stay-in-istanbul-best-areas-guide">Best Areas to Stay in Istanbul</a>.
</p>

<!-- IMAGE_FERRY_PLACEHOLDER -->

<hr/>

<h2>5) Airports: how to get into the city without getting stressed</h2>

<p>Istanbul has two main airports people talk about: <strong>IST (Istanbul Airport)</strong> and <strong>SAW (Sabiha Gökçen)</strong>. Your best route depends on your accommodation area, time of day, and luggage tolerance.</p>

<p>This section focuses on <strong>IST</strong> using official information sources.</p>

<h3>Option A (IST): Metro M11</h3>
<p>Istanbul Airport has a metro connection via the <strong>M11 line</strong> (Gayrettepe–Istanbul Airport–Halkalı route, with sections operational). For the most reliable “what’s running right now”, check the airport’s official transport pages and Metro İstanbul updates.</p>

<p><strong>Choose M11 if:</strong> you prefer predictable travel and you’re comfortable with transfers to reach your exact neighbourhood.</p>

<h3>Option B (IST): HAVAIST airport buses (tourist-friendly)</h3>
<p>HAVAIST operates official airport bus routes from IST. The Istanbul Airport website lists HAVAIST routes and (for some routes) prices and peron information — including routes such as <strong>Sultanahmet</strong> and <strong>Aksaray</strong> which many tourists use.</p>

<p><strong>Choose HAVAIST if:</strong> you want a direct-ish option with luggage, and you’re staying in a zone served by a route listed on the airport site.</p>

<h3>Option C: Taxi / private transfer (only if you follow the rules)</h3>
<p>Taxi can be fine, but only if you treat it like a “boring process”: registered taxi, meter expectations, and no unofficial rides. The UK Foreign Office warns against getting into unofficial taxis.</p>
<p><a href="/guide/is-turkey-safe-to-visit-uk-travel-checklist">Is Turkey Safe to Visit? (UK Checklist)</a></p>

<hr/>

<h2>6) The easiest way to plan your day (3 ready-made “transport days”)</h2>

<h3>Day type 1: Historic sights day (low friction)</h3>
<ul>
  <li>Base near <strong>Sultanahmet/Sirkeci</strong> or get there early</li>
  <li>Use <strong>T1 tram</strong> for stop-to-stop sightseeing</li>
  <li>Walk between nearby sights, take breaks, don’t rush</li>
</ul>

<h3>Day type 2: Beyoğlu/Galata/Karaköy lifestyle day</h3>
<ul>
  <li>Stay in <strong>Karaköy/Galata</strong> or arrive there mid-morning</li>
  <li>Walk more, use short links (tram/metro) when tired</li>
  <li>Evening: dinner + views + calm walk</li>
</ul>

<h3>Day type 3: Asian side day (Kadıköy vibe)</h3>
<ul>
  <li>Take a ferry for the experience (and the views)</li>
  <li>Spend time on food streets and cafés</li>
  <li>Return before late-night fatigue kicks in</li>
</ul>

<hr/>

<h2>7) Mistakes that ruin Istanbul transport (and the fixes)</h2>
<ul>
  <li><strong>Mistake:</strong> trying to do 6 areas in one day. <strong>Fix:</strong> 1–2 zones max.</li>
  <li><strong>Mistake:</strong> relying on taxis for everything. <strong>Fix:</strong> use T1/metro/ferries for the bulk, taxi only when it truly saves time.</li>
  <li><strong>Mistake:</strong> topping up loads “just in case”. <strong>Fix:</strong> top up in smaller rounds since refunds aren’t the norm for visitors.</li>
  <li><strong>Mistake:</strong> not checking official airport routes. <strong>Fix:</strong> use IST airport transport pages for the latest HAVAIST route list and details.</li>
</ul>

<hr/>

<h2>Copy/paste: UK traveller transport checklist</h2>
<ul>
  <li><strong>Get an Istanbulkart</strong> and top up in TRY (don’t overdo it).</li>
  <li><strong>Use T1 tram</strong> for classic sightseeing zones.</li>
  <li><strong>Do ferries at least once</strong> (it’s transport + sightseeing).</li>
  <li><strong>From IST:</strong> check official options (M11 metro / HAVAIST routes).</li>
  <li><strong>Taxi rule:</strong> avoid unofficial rides; keep it boring and safe.</li>
</ul>

<hr/>

<h2>FAQs</h2>

<h3>What’s the best way to get around Istanbul as a tourist?</h3>
<p>Use Istanbulkart and build your sightseeing around the T1 tram for the historic core, plus metro/ferry links for neighbourhood hops.</p>

<h3>Is Istanbulkart worth it for a short trip?</h3>
<p>Yes for most visitors, because it works across major public transport modes. Just top up sensibly because visitor balances aren’t typically refunded at the end of your trip.</p>

<h3>What’s the easiest public transport line for first-timers?</h3>
<p>The T1 tram is the simplest “tourist backbone” because it runs through many key sightseeing stops including Sultanahmet and Eminönü.</p>

<h3>How do I get from Istanbul Airport (IST) to the city?</h3>
<p>Use official options like the M11 metro and HAVAIST airport buses. The Istanbul Airport site lists transport options and HAVAIST routes.</p>

<p><em>Last updated:</em> ${new Date().toLocaleDateString('en-GB')}</p>
`
};

async function addTransportArticle() {
    const timestamp = Date.now();

    // --- Authentic Mode Prompts (Imagen 3) ---
    const imagesToGenerate = [
        {
            placeholder: '<!-- IMAGE_COVER_PLACEHOLDER -->',
            filename: `transport-cover-${timestamp}.jpg`,
            prompt: "A high quality photo of the red T1 tram in Istanbul passing by historic buildings in Sultanahmet. Soft sunlight. Pedestrians blurred in motion. Authentic city travel atmosphere."
        },
        {
            placeholder: '<!-- IMAGE_ISTANBULKART_PLACEHOLDER -->',
            filename: `transport-istanbulkart-${timestamp}.jpg`,
            prompt: "A close-up of a hand holding an Istanbulkart (transport card) at a metro turnstile. Focus on the card. Authentic commuter perspective. Realistic depth of field."
        },
        {
            placeholder: '<!-- IMAGE_METRO_PLACEHOLDER -->',
            filename: `transport-metro-sign-${timestamp}.jpg`,
            prompt: "A modern Istanbul Metro station signage ('M' logo) with escalator in background. Clean, well-lit underground station. Authentic public transport guidance."
        },
        {
            placeholder: '<!-- IMAGE_FERRY_PLACEHOLDER -->',
            filename: `transport-ferry-view-${timestamp}.jpg`,
            prompt: "A view from the back of an Istanbul ferry in Bosphorus, looking at the city silhouette/skyline. People enjoying tea. Seagulls. Golden hour light. Authentic travel experience."
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

    const { error } = await supabase.from('articles').upsert({
        slug: ARTICLE_DATA.slug,
        title: { en: ARTICLE_DATA.title, tr: "İstanbul Ulaşım Rehberi: Metro, Tramvay ve Feribot" },
        meta_description: { en: ARTICLE_DATA.meta_description, tr: "İstanbulkart, tramvay hatları ve havalimanı ulaşımı için kapsamlı turist rehberi." },
        content: { en: finalContent, tr: "<p>Çeviri yakında...</p>" },
        location: { en: 'Istanbul', tr: 'İstanbul' }, // Assigning to Istanbul category
        cover_image_url: coverImageUrl,
        published_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    }, { onConflict: 'slug' });

    if (error) {
        console.error("❌ DB Insert Failed:", error);
    } else {
        console.log("✅ Transport Article Added Successfully with Imagen 3 Images!");
    }
}

addTransportArticle();
