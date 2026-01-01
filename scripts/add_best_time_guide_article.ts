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
    slug: 'best-time-to-visit-turkey', // Assuming slug based on previous internal links
    title: 'Best Time to Visit Turkey: Month-by-Month (UK Guide)',
    meta_description: 'Plan your Turkey holiday from the UK with this month-by-month guide. Weather feel, crowds and the best regions for each season—without guesswork.',
    content: `
<h1>Best Time to Visit Turkey (Month-by-Month): A UK Traveller’s Planning Guide</h1>

<p><strong>Quick answer:</strong> For many UK travellers, the most comfortable “all-round” times are <strong>spring</strong> and <strong>early autumn</strong> when it’s easier to explore cities and enjoy the coast without peak-season intensity. <strong>Summer</strong> is best if you’re coming mainly for beaches and you’re happy with heat and higher demand. <strong>Winter</strong> works well for city breaks, slower travel and a different side of Turkey.</p>

<p>This guide helps you pick a travel month based on how you like to holiday — not just a generic “best month” answer. For region choices, you can also use:
<a href="/guide/where-to-stay-in-turkey-first-time-guide">Where to Stay in Turkey (UK First-Timer Area Guide)</a>.
</p>

<!-- IMAGE_COVER_PLACEHOLDER -->

<h2>How to choose your month (the UK-friendly method)</h2>
<p>Instead of asking “What’s the best time?”, ask this:</p>
<ul>
  <li><strong>Do you want beach-first or exploring-first?</strong> Beaches love summer; cities and long walks love shoulder seasons.</li>
  <li><strong>How do you handle heat?</strong> If you struggle with hot days, plan around comfort and pace.</li>
  <li><strong>What’s your crowd tolerance?</strong> Peak season feels different in popular spots.</li>
  <li><strong>Are you travelling around UK school holidays?</strong> If yes, pick the right base and keep logistics simple.</li>
</ul>

<h2>At a glance: best months by trip style</h2>
<table>
  <thead>
    <tr>
      <th>Your trip style</th>
      <th>Most comfortable seasons</th>
      <th>Why it works</th>
      <th>Plan for</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>City breaks (Istanbul-heavy)</td>
      <td>Spring + autumn + winter</td>
      <td>Easier walking and sightseeing pace</td>
      <td>Rainy-day backups in cooler months</td>
    </tr>
    <tr>
      <td>Beach holiday (switch-off)</td>
      <td>Late spring to early autumn</td>
      <td>Best conditions for sea-and-sun routines</td>
      <td>Peak summer heat and higher demand</td>
    </tr>
    <tr>
      <td>Balanced trip (Istanbul + coast)</td>
      <td>Spring + early autumn</td>
      <td>Comfortable mix of exploring and relaxing</td>
      <td>Booking timing for popular periods</td>
    </tr>
    <tr>
      <td>Cappadocia landscapes</td>
      <td>Spring + autumn</td>
      <td>Comfortable days for valleys and viewpoints</td>
      <td>Early mornings can feel cool</td>
    </tr>
    <tr>
      <td>Budget-focused travel</td>
      <td>Shoulder season + winter</td>
      <td>Often calmer pace and more choice</td>
      <td>Some coastal places feel quieter off-season</td>
    </tr>
  </tbody>
</table>

<!-- IMAGE_SPRING_PLACEHOLDER -->

<h2>Month-by-month: what Turkey feels like for UK travellers</h2>

<h3>January</h3>
<p><strong>Best for:</strong> city breaks, museums, cafés, slower travel, and travellers who don’t need beach days.</p>
<p>January suits UK travellers who want Istanbul at a calmer pace. You can build your days around neighbourhood time, food, and key sights without the pressure of “perfect beach weather”. Pack with layers and plan a couple of indoor-friendly days.</p>

<h3>February</h3>
<p><strong>Best for:</strong> similar to January — city breaks, quieter exploring, and a more local rhythm.</p>
<p>February can be ideal if you want Turkey without the busy-season feel. This is also a strong month for travellers who enjoy planning a relaxed itinerary with cafés, markets and museums.</p>

<h3>March</h3>
<p><strong>Best for:</strong> early spring city breaks and “start of the season” vibes.</p>
<p>March is a good transition month. It can be a smart choice for Istanbul and for travellers who want to explore without peak crowds, while accepting that beach time isn’t the main focus yet.</p>

<h3>April</h3>
<p><strong>Best for:</strong> Istanbul, cultural routes, and a comfortable exploring pace.</p>
<p>April is one of the easiest months for UK travellers who want a city-first or mixed itinerary. Days feel more “outdoor-friendly”, and you can build a trip around walking and sightseeing without the intensity of peak heat.</p>

<h3>May</h3>
<p><strong>Best for:</strong> the “balanced holiday” — exploring + coast in one trip.</p>
<p>May is often a sweet spot for UK travellers who want Istanbul plus a coastal base. It’s also great if you want beaches without the peak-summer intensity. This is a strong month for couples and first-timers who want the best of both worlds.</p>

<h3>June</h3>
<p><strong>Best for:</strong> beach holidays, coastal bases, and longer daylight days.</p>
<p>June works well if you want a beach-first holiday and you enjoy a lively summer atmosphere. If you’re mixing in city sightseeing, plan your days around comfort — early starts, slower midday pace, and evenings out.</p>

<h3>July</h3>
<p><strong>Best for:</strong> beach-first trips and travellers who don’t mind peak season energy.</p>
<p>July is peak summer. It suits UK travellers who want pool-and-sea routines, and who are happy with a higher-energy atmosphere in popular coastal areas. If you’re heat-sensitive, choose a base that makes “easy days” possible.</p>

<!-- IMAGE_SUMMER_PLACEHOLDER -->

<h3>August</h3>
<p><strong>Best for:</strong> beach holidays, family travel and school-holiday trips (with the right expectations).</p>
<p>August can be brilliant if you treat it as a pure beach holiday and you plan for comfort. Choose accommodation that supports easy routines (shade, pools, and minimal daily travel), and avoid overpacking the itinerary.</p>

<h3>September</h3>
<p><strong>Best for:</strong> one of the best all-round months — coast + exploring without peak intensity.</p>
<p>September is a favourite for many UK travellers because it often feels like summer with a calmer edge. It’s excellent for coastal bases and also works well for a mixed trip that includes a city stay.</p>

<h3>October</h3>
<p><strong>Best for:</strong> city breaks, mixed itineraries, and a calmer travel rhythm.</p>
<p>October can be a great choice if you want to explore comfortably and you’re not fixated on “every day must be a beach day”. It’s also strong for travellers who prefer a more relaxed pace and fewer crowds in popular places.</p>

<!-- IMAGE_AUTUMN_PLACEHOLDER -->

<h3>November</h3>
<p><strong>Best for:</strong> Istanbul, food-focused trips, museums, and slower travel.</p>
<p>November is ideal if you’re coming for culture, neighbourhood life and a cosy pace. Build your trip around flexible plans and include a couple of rainy-day options.</p>

<h3>December</h3>
<p><strong>Best for:</strong> winter city breaks and a calmer, more local-feeling Turkey.</p>
<p>December suits UK travellers who want a short city break and enjoy festive, wintery vibes. It’s not the month to plan a beach-led holiday — but it can be a brilliant time to experience Istanbul at a slower pace.</p>

<!-- IMAGE_WINTER_PLACEHOLDER -->

<h2>Best time by destination (quick picks)</h2>
<ul>
  <li><strong>Istanbul:</strong> best when you want comfortable walking days — spring and autumn are favourites, winter works well for museums and food-focused trips.</li>
  <li><strong>Antalya area (easy beach holiday):</strong> late spring through early autumn, depending on your heat comfort.</li>
  <li><strong>Fethiye area (scenery + bays):</strong> spring and early autumn are excellent for exploring, with summer best for beach-first routines.</li>
  <li><strong>Bodrum (Aegean vibe):</strong> late spring to early autumn depending on your crowd and heat tolerance.</li>
  <li><strong>Cappadocia:</strong> spring and autumn for comfortable exploring; plan for cool early mornings.</li>
</ul>

<h2>Common planning mistakes (and simple fixes)</h2>
<ul>
  <li><strong>Trying to do a city-heavy itinerary in peak heat.</strong> Fix: start early, slow down midday, and schedule indoor spots during the hottest hours.</li>
  <li><strong>Booking peak season without “comfort planning”.</strong> Fix: choose a base that supports easy routines (beach access, shade, pools, short travel days).</li>
  <li><strong>Mixing too many bases.</strong> Fix: pick one main base and add day trips, or keep it to two bases max.</li>
  <li><strong>Choosing dates without choosing your trip style.</strong> Fix: decide whether you’re beach-first or explore-first — then pick the month.</li>
</ul>

<h2>UK traveller checklists (copy/paste)</h2>

<h3>Beach-first checklist</h3>
<ul>
  <li>Choose a coastal base that matches your vibe: easy resort mode vs explore mode.</li>
  <li>Plan “comfort hours” in peak summer: early mornings and slower mid-days.</li>
  <li>Keep logistics light: fewer bases, fewer long travel days.</li>
  <li>Use area guides:
    <a href="/guide/where-to-stay-in-antalya-best-areas-guide">Where to Stay in Antalya</a>,
    <a href="/guide/where-to-stay-in-fethiye-best-areas-guide">Where to Stay in Fethiye</a>,
    <a href="/guide/where-to-stay-in-bodrum-best-areas-guide">Where to Stay in Bodrum</a>.
  </li>
</ul>

<h3>Explore-first checklist (Istanbul + Cappadocia)</h3>
<ul>
  <li>Choose months that support walking and outdoor time.</li>
  <li>Keep your itinerary realistic: one main zone per day.</li>
  <li>Use area guides:
    <a href="/guide/where-to-stay-in-istanbul-best-areas-guide">Where to Stay in Istanbul (Best Areas)</a>,
    <a href="/guide/where-to-stay-in-cappadocia-best-areas-guide">Where to Stay in Cappadocia</a>.
  </li>
</ul>

<h2>FAQs</h2>

<h3>What is the best time to visit Turkey from the UK?</h3>
<p>The best time depends on your trip style. Many UK travellers find spring and early autumn most comfortable for a mixed itinerary (city + coast). Summer suits beach-first holidays if you’re happy with heat and peak-season energy.</p>

<h3>When is Turkey busiest?</h3>
<p>Turkey tends to feel busiest in the main summer holiday period, especially in popular coastal destinations. If you prefer a calmer pace, choose shoulder seasons or focus on less hectic bases.</p>

<h3>Is Turkey worth visiting in October?</h3>
<p>Yes — especially if you want a calmer rhythm and you’re happy with a more flexible plan. October can be excellent for city breaks and mixed itineraries where exploring is as important as beach time.</p>

<h3>When is the best time for Istanbul?</h3>
<p>Istanbul is at its best when you can walk comfortably and enjoy neighbourhood life. Spring and autumn are favourites, while winter works well for museums, cafés and a slower city-break pace.</p>

<h3>When is the best time for Cappadocia?</h3>
<p>Spring and autumn are strong choices for comfortable exploring. Whatever month you choose, expect early mornings to feel cooler than mid-day.</p>

<p><em>Last updated:</em> ${new Date().toLocaleDateString('en-GB')}</p>
`
};

async function addBestTimeArticle() {
    const timestamp = Date.now();

    // --- Authentic Mode Prompts (Imagen 3) ---
    const imagesToGenerate = [
        {
            placeholder: '<!-- IMAGE_COVER_PLACEHOLDER -->',
            filename: `best-time-cover-${timestamp}.jpg`,
            prompt: "A collage style horizontal photo showing four distinct seasons in Turkey side by side. Left: snowy Istanbul street. Center left: Flower market in Spring. Center right: Sunny beach in Summer. Right: Autumn leaves in Cappadocia. Authentic travel photography style."
        },
        {
            placeholder: '<!-- IMAGE_SPRING_PLACEHOLDER -->',
            filename: `best-time-spring-${timestamp}.jpg`,
            prompt: "A candid photo of a street cafe in Istanbul in Spring. People wearing light jackets, sunglasses. Flowering trees in background. Soft diffuse sunlight. Authentic city break vibe. Unedited."
        },
        {
            placeholder: '<!-- IMAGE_SUMMER_PLACEHOLDER -->',
            filename: `best-time-summer-${timestamp}.jpg`,
            prompt: "POV shot from a sun lounger on a Turkish beach in peak summer. Blue sky, bright harsh sunlight. Sunglasses and iced drink in foreground. Vivid colors, authentic holiday feel. Heat haze."
        },
        {
            placeholder: '<!-- IMAGE_AUTUMN_PLACEHOLDER -->',
            filename: `best-time-autumn-${timestamp}.jpg`,
            prompt: "A wide shot of Cappadocia landscape in Autumn. Golden yellow grass, soft long shadows, late afternoon light. Quiet peaceful atmosphere. Realistic nature photography."
        },
        {
            placeholder: '<!-- IMAGE_WINTER_PLACEHOLDER -->',
            filename: `best-time-winter-${timestamp}.jpg`,
            prompt: "A cozy interior shot of a Turkish tea house in Winter. Steamy glass windows with rain outside. Warm indoor lighting. People chatting. Authentic local winter vibe. 35mm film grain."
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
        title: { en: ARTICLE_DATA.title, tr: "Türkiye'yi Ziyaret Etmek İçin En İyi Zaman (Ay Ay)" },
        meta_description: { en: ARTICLE_DATA.meta_description, tr: "Türkiye tatiliniz için en iyi zamanı planlayın. Hava durumu, kalabalıklar ve sezon rehberi." },
        content: { en: finalContent, tr: "<p>Çeviri yakında...</p>" },
        cover_image_url: coverImageUrl,
        published_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    }, { onConflict: 'slug' });

    if (error) {
        console.error("❌ DB Insert Failed:", error);
    } else {
        console.log("✅ Best Time Article Added Successfully with Imagen 3 Images!");
    }
}

addBestTimeArticle();
