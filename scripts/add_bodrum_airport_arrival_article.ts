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
    slug: 'milas-bodrum-airport-to-bodrum-bus-shuttle-taxi', // Matching user request SEO Title implied slug or logical one. User didn't give explicit slug, I'll use a clean one.
    // User primary keyword: Milas–Bodrum Airport to Bodrum
    // User Title: Milas–Bodrum Airport to Bodrum: Bus, Shuttle, Taxi & Transfers (UK Guide)
    title: 'Milas–Bodrum Airport to Bodrum: Bus, Shuttle, Taxi & Transfers (UK Guide)',
    meta_description: 'Landing at Milas–Bodrum Airport (BJV)? Here’s how to reach Bodrum Town: MUTTAŞ public buses, HAVAŞ shuttles, taxi and private transfers—plus what to check.',
    content: `
<h1>Milas–Bodrum Airport (BJV) to Bodrum: The Practical UK Arrival Guide (Bus, Shuttle, Taxi)</h1>

<p><strong>Quick answer:</strong> If you want the simplest door-to-door arrival, book a <strong>private transfer</strong> or take an <strong>official taxi</strong>. If you want the best-value public option, use <strong>MUTTAŞ public buses</strong> (and consider <strong>HAVAŞ shuttle</strong> depending on your timing). Always confirm the latest pickup point and service details on the airport/operator pages on your travel day.</p>

<p>Internal reads (placeholders):
<a href="/guide/where-to-stay-in-bodrum-best-areas-guide">Where to Stay in Bodrum (Best Areas)</a> •
<a href="/guide/bodrum-itinerary-3-days-uk-friendly-guide">Bodrum Itinerary: 3 Days (UK-Friendly)</a> •
<a href="/guide/bodrum-castle-history-and-visitor-guide">Bodrum Castle: What to Know Before You Go</a>
</p>

<hr/>

<!-- IMAGE_COVER_PLACEHOLDER -->

<h2>First: don’t mix up “Bodrum” (town) with the whole peninsula</h2>
<p>“Bodrum” can mean <strong>Bodrum Town (Centre)</strong> or it can mean the wider peninsula (areas like Yalıkavak, Bitez, Gümüşlük, etc.). Before you choose transport, save your exact accommodation pin and confirm which area you’re heading to.</p>

<hr/>

<h2>Option 1 (Best value): MUTTAŞ public buses</h2>
<p>Milas–Bodrum Airport’s official site lists reaching the airport via <strong>MUTTAŞ buses</strong> and links directly to the MUTTAŞ network for details.</p>

<h3>How to use it (simple steps)</h3>
<ol>
  <li>At arrivals, follow signs for transportation and look for information about <strong>MUTTAŞ</strong> services.</li>
  <li>Confirm the direction and stop: “Is this going to <strong>Bodrum Bus Terminal</strong>?”</li>
  <li>Keep a backup plan if you land very late (taxi/transfer), because public services can be less convenient late at night.</li>
</ol>

<h3>Payment and “schedule reality” (what MUTTAŞ itself says)</h3>
<p>MUTTAŞ route pages explicitly note that you can pay by <strong>credit card on all vehicles</strong>, and that listed times are <strong>planned departure times</strong> that can change due to conditions like weather, traffic, breakdowns or accidents.</p>

<p><strong>Practical rule:</strong> treat any timetable you see online as “current intent”, not a promise. Verify on the day.</p>

<!-- IMAGE_BUS_PLACEHOLDER -->

<hr/>

<h2>Option 2: HAVAŞ shuttle (airport-linked coach service)</h2>
<p>The airport also lists access via <strong>HAVAŞ shuttle services</strong>.</p>

<p><strong>How to use it:</strong> confirm where HAVAŞ boards (airport signage/desk) and whether it suits your exact destination area (town centre vs peninsula area). If the shuttle drops you at a central point, you can continue by local transport or taxi for the final stretch.</p>

<hr/>

<h2>Option 3: Official taxi (fastest “right now” option)</h2>
<p>Taxi is the simplest choice if you:</p>
<ul>
  <li>land late,</li>
  <li>have heavy luggage,</li>
  <li>are travelling with kids,</li>
  <li>or just want to check in quickly with zero connections.</li>
</ul>

<h3>Taxi checklist</h3>
<ul>
  <li>Use the official airport taxi rank.</li>
  <li>Show your exact accommodation pin and say the area clearly (e.g., “Bodrum Town Centre” or your peninsula area).</li>
  <li>Confirm payment method before you leave the airport area.</li>
</ul>

<!-- IMAGE_TAXI_PLACEHOLDER -->

<hr/>

<h2>Option 4: Private transfer (best “guarantee” for UK travellers)</h2>
<p>Private transfer is the cleanest option if you want a fixed pickup, clear pricing upfront, and support if your flight is delayed.</p>

<h3>Copy/paste questions before you pay</h3>
<ul>
  <li>“Is the price total or per person?”</li>
  <li>“How long do you wait if my flight is delayed?”</li>
  <li>“Where exactly will you meet me (which exit)?”</li>
  <li>“Is luggage included?”</li>
  <li>“Can you send driver name + plate number on the day?”</li>
</ul>

<hr/>

<h2>Helpful detail: Bodrum Bus Terminal ↔ Airport public buses</h2>
<p>The airport’s “Public Buses” page describes shuttles between <strong>Bodrum Bus Terminal and Milas–Bodrum Airport</strong>, and also mentions a second line between <strong>Muğla Menteşe Bus Station and the airport</strong>. It notes that services for departure flights leave the Bodrum Bus Terminal <strong>about 2 hours before the flight time</strong>, and it lists intermediate pickup points (such as Torba junction underpass and in front of Güvercinlik Metro).</p>

<p><strong>Use this wisely:</strong> it’s a helpful rule of thumb, but still confirm the current departure plan on the day—especially in peak season.</p>

<hr/>

<h2>What to do if you land late (simple decision tree)</h2>
<ul>
  <li><strong>If it’s late and you just want sleep:</strong> private transfer or official taxi.</li>
  <li><strong>If it’s daytime and you’re budget-focused:</strong> MUTTAŞ public bus (and consider HAVAŞ if it matches your route).</li>
  <li><strong>If you’re heading to a quieter peninsula area:</strong> transfer/taxi often saves you a second transport step.</li>
</ul>

<p>Reason: MUTTAŞ notes that planned times can change due to conditions, so late-night arrivals are when you want the least “timing risk.”</p>

<hr/>

<h2>Two things to do in Bodrum when you arrive (bonus for UK first-timers)</h2>
<p>If you’re staying in Bodrum Town, the main landmark is <strong>Bodrum Castle</strong> (Castle of St. Peter), built by the Knights of St John between <strong>1406–1522</strong> on a rocky peninsula between two sheltered harbours; Bodrum Municipality notes it’s used today as the <strong>Museum of Underwater Archaeology</strong>.</p>

<hr/>

<h2>FAQs</h2>

<h3>How do I get from Bodrum Airport to Bodrum Town by public transport?</h3>
<p>The airport lists <strong>MUTTAŞ buses</strong> and provides a link to the MUTTAŞ site for routes and details.</p>

<h3>Are HAVAŞ shuttles available from Milas–Bodrum Airport?</h3>
<p>Yes—Milas–Bodrum Airport lists access via <strong>HAVAŞ shuttle services</strong>.</p>

<h3>Do MUTTAŞ timetables change?</h3>
<p>MUTTAŞ states that listed times are planned and can change due to conditions like weather, traffic, breakdowns or accidents.</p>

<h3>Can I pay by card on MUTTAŞ?</h3>
<p>MUTTAŞ route pages state you can pay by credit card on all vehicles.</p>

<h3>What’s the easiest choice for families?</h3>
<p>Private transfer or official taxi—less luggage stress and no second step.</p>

<h3>What’s the best base for first-time Bodrum visitors?</h3>
<p>Bodrum Town (Centre) is usually the easiest if you want walkable evenings and simple logistics.</p>

<p><em>Last updated:</em> ${new Date().toLocaleDateString('en-GB')}</p>
`
};

async function addBodrumAirportArticle() {
    const timestamp = Date.now();

    // --- Authentic Mode Prompts (Imagen 3) ---
    const imagesToGenerate = [
        {
            placeholder: '<!-- IMAGE_COVER_PLACEHOLDER -->',
            filename: `bodrum-airport-exterior-${timestamp}.jpg`,
            prompt: "Exterior view of Milas-Bodrum Airport (BJV) terminal entrance. Sunny day, travelers with luggage. Modern glass architecture. Authentic travel photography."
        },
        {
            placeholder: '<!-- IMAGE_BUS_PLACEHOLDER -->',
            filename: `bodrum-muttas-bus-${timestamp}.jpg`,
            prompt: "White MUTTAŞ airport bus parked at Milas-Bodrum Airport curb. People loading suitcases in the hold. Sunny blue sky. Authentic transit photography."
        },
        {
            placeholder: '<!-- IMAGE_TAXI_PLACEHOLDER -->',
            filename: `bodrum-airport-taxi-rank-${timestamp}.jpg`,
            prompt: "Yellow taxis lined up at Milas-Bodrum Airport official taxi rank. Drivers waiting. Travellers getting into cars. Authentic travel service photography."
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
        title: { en: ARTICLE_DATA.title, tr: "Milas-Bodrum Havalimanı - Bodrum Şehir Merkezi Ulaşım" },
        meta_description: { en: ARTICLE_DATA.meta_description, tr: "Bodrum Havalimanı'ndan merkeze nasıl gidilir? Muttaş, Havaş, taksi ve transfer seçenekleri. Ücretler ve saatler." },
        content: { en: finalContent, tr: "<p>Çeviri yakında...</p>" },
        location: { en: 'Bodrum', tr: 'Bodrum' },
        cover_image_url: coverImageUrl,
        published_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    }, { onConflict: 'slug' });

    if (error) {
        console.error("❌ DB Insert Failed:", error);
    } else {
        console.log("✅ Bodrum Airport Article Added Successfully with Imagen 3 Images!");
    }
}

addBodrumAirportArticle();
