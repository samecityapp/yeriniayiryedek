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
    slug: 'dalaman-airport-to-oludeniz-transfers-guide',
    title: 'Dalaman Airport to Ölüdeniz: Best Ways to Reach the Blue Lagoon',
    meta_description: 'Landing at Dalaman (DLM)? Here’s how to get to Ölüdeniz, Hisarönü or Ovacık: shuttle/bus, taxi or private transfer—plus late arrival tips and mistakes to avoid.',
    content: `
<h1>Dalaman Airport (DLM) to Ölüdeniz / Hisarönü / Ovacık: The UK Arrival Guide (Blue Lagoon Without Stress)</h1>

<p><strong>Quick answer:</strong> If you want the simplest door-to-door arrival, choose a <strong>private transfer</strong> (especially for late landings or families). If you want the cheapest mainstream option, use an <strong>airport shuttle/bus</strong> and connect onwards from Fethiye. If you’re arriving late or travelling heavy, <strong>taxi/transfer</strong> usually saves the night.</p>

<p>First, make sure you’ve chosen the right base:
<a href="/guide/where-to-stay-in-fethiye-best-areas-guide">Where to Stay in Fethiye (Best Areas)</a> and
<a href="/guide/oludeniz-vs-calis-vs-fethiye-where-to-stay">Ölüdeniz vs Çalış vs Fethiye Centre: Where to Stay</a>.
</p>

<hr/>

<!-- IMAGE_COVER_PLACEHOLDER -->

<h2>1) Know your destination (this matters more than people think)</h2>
<p>“Ölüdeniz” is often used loosely, but for arrivals you need to be specific:</p>
<ul>
  <li><strong>Ölüdeniz (Blue Lagoon area):</strong> you want the lagoon/beach zone.</li>
  <li><strong>Hisarönü:</strong> inland above Ölüdeniz; great base if you want nightlife/energy and quick access down to the lagoon.</li>
  <li><strong>Ovacık:</strong> similar “above Ölüdeniz” base, often calmer; works well for mixed days.</li>
</ul>

<p><strong>Arrival tip:</strong> save a screenshot of your exact accommodation pin. Drivers and shuttle staff can help faster when you show the map rather than trying to pronounce a small street name.</p>

<hr/>

<h2>2) Best option by traveller type (UK intent)</h2>
<ul>
  <li><strong>Families / heavy luggage:</strong> private transfer (least friction).</li>
  <li><strong>Couples (short trip):</strong> private transfer if landing late; shuttle if daytime and you’re patient.</li>
  <li><strong>Solo / budget travellers:</strong> airport shuttle/bus + connect from Fethiye.</li>
  <li><strong>Late arrivals:</strong> private transfer or taxi (don’t gamble the first night).</li>
</ul>

<hr/>

<h2>3) Option A: Airport shuttle/bus (budget-friendly, but involves a connection)</h2>
<p>Dalaman Airport lists <strong>Havaş</strong> and <strong>MUTTAŞ</strong> as providers running services between the airport and destinations including <strong>Fethiye</strong>. </p>

<p><strong>Important reality:</strong> Most airport shuttles get you to <strong>Fethiye</strong> first, then you continue onward to Ölüdeniz/Hisarönü/Ovacık by local transport or taxi. That’s why this option is best for daytime arrivals.</p>

<!-- IMAGE_SHUTTLE_PLACEHOLDER -->

<h3>How to do it (simple steps)</h3>
<ol>
  <li>After arrivals, follow signs or ask staff: <strong>“Fethiye shuttle / bus”</strong>.</li>
  <li>Confirm the operator and destination: <strong>“Does this go to Fethiye?”</strong></li>
  <li>Once in Fethiye, continue to Ölüdeniz/Hisarönü/Ovacık by local route or a short taxi, depending on your energy.</li>
</ol>

<h3>Timing reality (no fake promises)</h3>
<p>Shuttle times can be seasonal and affected by real-world conditions. MUTTAŞ explicitly notes that published departure times are planned and can change due to factors like traffic or conditions. </p>

<p><strong>Guarantee method:</strong> on your travel day, verify the latest departure info via the operator’s official channels or the airport desk/signage, then decide whether you’re comfortable connecting onward.</p>

<h3>Tickets & payment (what matters on arrival)</h3>
<p>MUTTAŞ states credit card payments are accepted on their vehicles, but it’s still smart to carry a bit of TRY cash as backup for small transport steps or late-night options. </p>

<hr/>

<h2>4) Option B: Taxi (fastest “now” solution, but costs more)</h2>
<p>Taxi is the simplest “I want to arrive and stop thinking” option when:</p>
<ul>
  <li>you land late,</li>
  <li>you’re travelling with kids,</li>
  <li>you have heavy luggage,</li>
  <li>or you value sleep more than saving money.</li>
</ul>

<h3>Taxi sanity checklist</h3>
<ul>
  <li>Use official airport taxi ranks only.</li>
  <li>Show your exact map pin and say clearly: <strong>“Ölüdeniz / Hisarönü / Ovacık”</strong>.</li>
  <li>Agree on the approach to payment (card vs cash) before you leave the airport area.</li>
</ul>

<!-- IMAGE_TRANSFER_PLACEHOLDER -->

<hr/>

<h2>5) Option C: Private transfer (best “guarantee” for UK travellers)</h2>
<p>Private transfer is the best pick if you want:</p>
<ul>
  <li>fixed pickup,</li>
  <li>clear pricing upfront,</li>
  <li>support if the flight is delayed.</li>
</ul>

<h3>Copy/paste questions before you pay</h3>
<ul>
  <li>“Is the price total or per person?”</li>
  <li>“How long will you wait if my flight is delayed?”</li>
  <li>“Where exactly will you meet me (which exit)?”</li>
  <li>“Is luggage included?”</li>
  <li>“Can you send the driver name and plate number on the day?”</li>
</ul>

<hr/>

<h2>6) The late-night arrival decision tree (use this)</h2>
<ul>
  <li><strong>If you land late AND you’re going to Ölüdeniz/Hisarönü/Ovacık:</strong> choose private transfer (best reliability).</li>
  <li><strong>If transfer isn’t available:</strong> take an official taxi.</li>
  <li><strong>If you land daytime and you’re budget-focused:</strong> shuttle/bus to Fethiye, then continue onward.</li>
</ul>

<p>Reason: MUTTAŞ notes planned times can change; on late arrivals you don’t want to rely on perfect timing plus an extra connection. </p>

<hr/>

<h2>7) Mistakes that ruin the first night (and fixes)</h2>
<ul>
  <li><strong>Mistake:</strong> booking “Ölüdeniz” but not knowing if you’re actually in Hisarönü/Ovacık. <strong>Fix:</strong> confirm the exact area before choosing transfer type.</li>
  <li><strong>Mistake:</strong> assuming the shuttle will match your landing perfectly. <strong>Fix:</strong> verify on the day; have transfer/taxi backup.</li>
  <li><strong>Mistake:</strong> arriving with no cash at all. <strong>Fix:</strong> keep small TRY as an emergency layer.</li>
  <li><strong>Mistake:</strong> trying to “wing it” with multiple connections after midnight. <strong>Fix:</strong> pay for simplicity on night one.</li>
</ul>

<hr/>

<h2>Copy/paste checklist (do this at arrivals)</h2>
<ul>
  <li>Save your accommodation pin + address screenshot</li>
  <li>Decide: shuttle to Fethiye (budget) vs transfer/taxi (comfort)</li>
  <li>If shuttle: confirm it’s going to <strong>Fethiye</strong> (then connect onward)</li>
  <li>If transfer: confirm meeting point + waiting time for delays</li>
  <li>Carry small TRY cash + your card separately</li>
</ul>

<hr/>

<h2>FAQs</h2>

<h3>Is there a direct bus from Dalaman Airport to Ölüdeniz?</h3>
<p>Airport shuttles are commonly routed to <strong>Fethiye</strong> first, then you continue to Ölüdeniz/Hisarönü/Ovacık. Dalaman Airport lists Havaş and MUTTAŞ services to destinations including Fethiye. </p>

<h3>What’s the easiest option with luggage?</h3>
<p>Private transfer (or official taxi) — it’s door-to-door and avoids a late connection.</p>

<h3>Do shuttle/bus times change?</h3>
<p>They can. MUTTAŞ notes published times are planned and can change due to conditions like traffic. </p>

<h3>Can I pay by card on MUTTAŞ?</h3>
<p>MUTTAŞ states credit card payments are accepted on their vehicles. </p>

<h3>Should I stay in Ölüdeniz or Hisarönü/Ovacık?</h3>
<p>Stay in Ölüdeniz if lagoon/beach days are the priority. Stay in Hisarönü/Ovacık if you want a base above the lagoon with flexible access down to it.</p>

<h3>What should I confirm before booking a transfer?</h3>
<p>Total price, meeting point, delay policy, luggage included, and driver/vehicle details on the day.</p>

<p><em>Last updated:</em> ${new Date().toLocaleDateString('en-GB')}</p>
`
};

async function addDalamanOludenizArticle() {
    const timestamp = Date.now();

    // --- Authentic Mode Prompts (Imagen 3) ---
    const imagesToGenerate = [
        {
            placeholder: '<!-- IMAGE_COVER_PLACEHOLDER -->',
            filename: `dalaman-oludeniz-arrival-${timestamp}.jpg`,
            prompt: "Travellers sitting in a comfortable transfer van driving from Dalaman to Fethiye. Sunny coast road visible through window. Authentic travel documentary style."
        },
        {
            placeholder: '<!-- IMAGE_SHUTTLE_PLACEHOLDER -->',
            filename: `dalaman-airport-shuttle-${timestamp}.jpg`,
            prompt: "A white airport shuttle bus (coach style) parked at Dalaman Airport arrival curb. People loading suitcases. Sunny day. Authentic transit photography."
        },
        {
            placeholder: '<!-- IMAGE_TRANSFER_PLACEHOLDER -->',
            filename: `dalaman-private-transfer-${timestamp}.jpg`,
            prompt: "A private black transfer van waiting at Dalaman Airport designated pick up area. Driver holding a name sign (blurred text). Authentic travel service photography."
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
        title: { en: ARTICLE_DATA.title, tr: "Dalaman Havalimanı - Ölüdeniz Ulaşım Rehberi" },
        meta_description: { en: ARTICLE_DATA.meta_description, tr: "Dalaman'dan Ölüdeniz'e nasıl gidilir? Havaş, Muttaş saatleri, taksi ücretleri ve özel transfer seçenekleri." },
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
        console.log("✅ Dalaman-Ölüdeniz Article Added Successfully with Imagen 3 Images!");
    }
}

addDalamanOludenizArticle();
