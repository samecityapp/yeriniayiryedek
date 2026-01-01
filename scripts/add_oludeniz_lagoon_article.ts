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
    slug: 'oludeniz-blue-lagoon-visitor-guide',
    title: 'Ölüdeniz Blue Lagoon (Turkey): How to Visit + What to Expect (UK-Friendly Guide)',
    meta_description: 'How to visit the Blue Lagoon in Ölüdeniz: entry fees, best time to go, parking tips, what to pack and simple transport from Fethiye (UK traveller guide).',
    content: `
<h1>Ölüdeniz Blue Lagoon (Turkey): How to Visit + What to Expect (UK-Friendly Guide)</h1>

<p><strong>Quick answer:</strong> The Blue Lagoon at Ölüdeniz is a protected nature-park style beach area where the water is famously calm and photogenic. Go early for the best experience, bring sun protection, and don’t assume the same rules/fees every year — check current entry/parking pricing at the gate or the official protected-area tariff.</p>

<p>Useful reads on YeriniAyir:
<a href="/guide/fethiye-to-oludeniz-how-to-get-there-dolmus-bus-taxi">Fethiye to Ölüdeniz: How to Get There</a> •
<a href="/guide/where-to-stay-in-fethiye-best-areas-guide">Where to Stay in Fethiye (Best Areas)</a> •
<a href="/guide/fethiye-boat-trips-what-to-expect-guide">Fethiye Boat Trips: How to Choose</a>
</p>

<hr/>

<!-- IMAGE_COVER_PLACEHOLDER -->

<h2>What is the Blue Lagoon in Ölüdeniz?</h2>
<p>“Blue Lagoon” usually refers to the Kumburnu side of Ölüdeniz — the sheltered, lagoon-like section that people picture when they search “Blue Lagoon Turkey”. It’s managed as a protected area, so expect structured entry, facilities, and seasonal rules rather than a totally free-for-all beach day.</p>

<hr/>

<h2>How to get to the Ölüdeniz Blue Lagoon from Fethiye (the simple way)</h2>
<p>If you’re staying in Fethiye, the most straightforward public option is the official local line that runs <strong>Fethiye → Ovacık → Hisarönü → Ölüdeniz</strong> (MUTTAŞ line <strong>3-40</strong>). MUTTAŞ publishes route details and notes that posted times are planned departures and can change due to traffic or conditions.</p>

<ul>
  <li><strong>Ask for:</strong> “Ölüdeniz (Blue Lagoon / Kumburnu)”</li>
  <li><strong>Pro move:</strong> If you’re travelling early/late, check the current 3-40 timetable before you leave.</li>
</ul>

<!-- IMAGE_TRANSPORT_PLACEHOLDER -->

<hr/>

<h2>Entry fees & parking: what to do (without getting caught out)</h2>
<p>Because this is a protected-area style site, there is typically an <strong>entry fee</strong> (and sometimes a separate <strong>vehicle/parking fee</strong> depending on how you enter). Fees can change by year/season, so don’t rely on old blog posts or social media screenshots.</p>

<p><strong>Guarantee method:</strong></p>
<ul>
  <li>Check the <strong>official protected-area fee tariff</strong> (DKMP) for up-to-date vehicle entry pricing, and</li>
  <li>Confirm the day’s entry/parking price at the gate signage before you commit.</li>
</ul>
<p>DKMP publishes annual “protected areas” fee tariffs (including vehicle entry tariffs).</p>

<!-- IMAGE_GATE_PLACEHOLDER -->

<hr/>

<h2>Best time to visit (the crowd + comfort strategy)</h2>
<ul>
  <li><strong>Best time of day:</strong> Early morning (less crowded, easier photos, calmer start).</li>
  <li><strong>Most relaxed months:</strong> Shoulder season (spring/early summer or early autumn) tends to feel smoother than peak summer.</li>
  <li><strong>If you’re going in peak months:</strong> Treat it like a “go early, leave before you’re drained” beach day.</li>
</ul>

<hr/>

<h2>What to pack (UK travellers always thank themselves for this)</h2>
<ul>
  <li><strong>High SPF + hat</strong> (lagoon sun hits harder than it looks)</li>
  <li><strong>Water shoes</strong> (useful if you end up on pebbly edges)</li>
  <li><strong>Dry bag</strong> for phone/wallet</li>
  <li><strong>Light layer</strong> for the ride back (breezy when moving)</li>
  <li><strong>Small cash in TRY</strong> (for small extras if needed)</li>
</ul>

<hr/>

<h2>Rules & respect (keep it legal, keep it beautiful)</h2>
<p>Because this is a managed natural area, rules can be stricter than a normal beach.</p>

<ul>
  <li><strong>No “fire” assumptions:</strong> Local official information states that barbecues are banned between <strong>May–October</strong> (seasonal rule).</li>
  <li><strong>Leave no trace:</strong> Protected areas stay enjoyable only if visitors don’t treat them like a bin.</li>
  <li><strong>Follow staff guidance:</strong> When it’s busy, rules are enforced more tightly.</li>
</ul>

<hr/>

<h2>Blue Lagoon vs the “main Ölüdeniz beach”: which one should you choose?</h2>
<ul>
  <li><strong>Choose the Blue Lagoon (Kumburnu side) if:</strong> you want the calm, sheltered, “postcard” water look and an easy swim.</li>
  <li><strong>Choose the main beach vibe if:</strong> you want more open-beach energy and you don’t care about the lagoon shape.</li>
</ul>

<!-- IMAGE_SWIM_PLACEHOLDER -->

<hr/>

<h2>FAQs</h2>

<h3>Is Ölüdeniz Blue Lagoon a protected area?</h3>
<p>Yes — it’s treated as a managed, protected nature-park style area (expect structured entry and rules).</p>

<h3>How do I get to Ölüdeniz from Fethiye by public transport?</h3>
<p>MUTTAŞ publishes an official route for <strong>Fethiye → Ovacık → Hisarönü → Ölüdeniz</strong> (line 3-40) and provides timetable pages (times can vary with conditions).</p>

<h3>How much is the entrance fee?</h3>
<p>Fees can change by season/year. The safest approach is to check DKMP’s current protected-area tariff (especially vehicle entry) and confirm the day’s entry/parking fee at the gate.</p>

<p><em>Last updated:</em> ${new Date().toLocaleDateString('en-GB')}</p>
`
};

async function addOludenizLagoonArticle() {
    const timestamp = Date.now();

    // --- Authentic Mode Prompts (Imagen 3) ---
    const imagesToGenerate = [
        {
            placeholder: '<!-- IMAGE_COVER_PLACEHOLDER -->',
            filename: `oludeniz-lagoon-cover-${timestamp}.jpg`,
            prompt: "High angle panoramic view of Ölüdeniz Blue Lagoon (Kumburnu). Turquoise calm water, white sand spit, pine covered hills, paragliders in the distant sky. Authentic travel photography, sunny day."
        },
        {
            placeholder: '<!-- IMAGE_TRANSPORT_PLACEHOLDER -->',
            filename: `oludeniz-bus-view-${timestamp}.jpg`,
            prompt: "A view from inside a bus/dolmus arriving at Ölüdeniz. Sea view visible through the window. Road with pine trees. Authentic traveller perspective."
        },
        {
            placeholder: '<!-- IMAGE_GATE_PLACEHOLDER -->',
            filename: `oludeniz-entrance-sign-${timestamp}.jpg`,
            prompt: "The entrance gate area of Ölüdeniz Tabiat Parkı (Nature Park). Signage, people walking in with beach gear. Bright daylight. Authentic travel logistics shot."
        },
        {
            placeholder: '<!-- IMAGE_SWIM_PLACEHOLDER -->',
            filename: `oludeniz-calm-swim-${timestamp}.jpg`,
            prompt: "Relaxed swimming in the shallow calm waters of the Blue Lagoon. Clear water, happy people, green hills in background. Authentic summer holiday vibe."
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
        title: { en: ARTICLE_DATA.title, tr: "Ölüdeniz Blue Lagoon Giriş Rehberi: Ücretler ve Ulaşım" },
        meta_description: { en: ARTICLE_DATA.meta_description, tr: "Ölüdeniz Kumburnu (Blue Lagoon) giriş ücreti, otopark, en iyi saatler ve ulaşım ipuçları. Korunan alan kuralları." },
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
        console.log("✅ Ölüdeniz Blue Lagoon Article Added Successfully with Imagen 3 Images!");
    }
}

addOludenizLagoonArticle();
