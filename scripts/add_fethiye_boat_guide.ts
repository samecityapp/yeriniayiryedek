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
    slug: 'fethiye-boat-trips-what-to-expect-guide',
    title: 'Fethiye Boat Trips: What to Expect + How to Choose (UK Guide)',
    meta_description: 'Planning a boat trip in Fethiye? Compare 12 Islands, Ölüdeniz–Butterfly Valley and private boats. What’s included, what to pack, safety checks and booking questions.',
    content: `
<h1>Fethiye Boat Trips: What to Expect + How to Choose the Right One (Without Naming Companies)</h1>

<p><strong>Quick answer:</strong> The “best” Fethiye boat trip depends on your vibe. 
If you want a relaxed day of swimming stops in calm bays, choose a <strong>12 Islands / Göcek-style</strong> cruise. 
If you want dramatic scenery and a “wow” coastline moment, choose an <strong>Ölüdeniz → Butterfly Valley</strong> style day. 
If you want privacy and control (music, pace, stops), choose a <strong>private boat</strong>.</p>

<p>Before you book, decide where you’re staying:
<a href="/guide/where-to-stay-in-fethiye-best-areas-guide">Where to Stay in Fethiye (Best Areas)</a> and
<a href="/guide/oludeniz-vs-calis-vs-fethiye-where-to-stay">Ölüdeniz vs Çalış vs Centre (Quick Decision)</a>.
</p>

<hr/>

<!-- IMAGE_COVER_PLACEHOLDER -->

<h2>1) The main types of boat trips in Fethiye (choose by your personality)</h2>

<h3>A) “12 Islands / Göcek bays” day (best all-round holiday day)</h3>
<p>This is the classic: a full day cruising between small islands and sheltered bays with multiple swim breaks. It’s popular because it feels effortless and you get a lot of “turquoise water time” without planning your own route. Many itineraries describe stops around the islands/bays near Fethiye and Göcek.</p>
<ul>
  <li><strong>Best for:</strong> first-timers, families, anyone who wants a smooth “swim–sun–lunch–repeat” rhythm</li>
  <li><strong>Not ideal if:</strong> you want dramatic cliffs and a more “wild” coastline</li>
</ul>

<!-- IMAGE_12ISLANDS_PLACEHOLDER -->

<h3>B) “Ölüdeniz → Butterfly Valley + coves” day (best for big scenery)</h3>
<p>These trips lean into the famous Ölüdeniz coastline, often pairing it with dramatic stops like Butterfly Valley. Butterfly Valley is widely promoted as a nature-focused destination and is linked with hiking/nature travel.</p>
<ul>
  <li><strong>Best for:</strong> couples, photographers, travellers who want a standout “this is why we came” day</li>
  <li><strong>Not ideal if:</strong> you hate crowds or want quiet, slow bays all day</li>
</ul>

<!-- IMAGE_BUTTERFLY_PLACEHOLDER -->

<h3>C) “Sunset cruise” (best for short stays)</h3>
<p>If you only have 2–3 nights and don’t want to burn a full day, a short sunset cruise gives you the sea feeling without the full-day commitment.</p>

<h3>D) Private boat / private yacht day (best if control matters)</h3>
<p>If you care about:</p>
<ul>
  <li>how loud the music is</li>
  <li>how long you stay at each stop</li>
  <li>whether you can avoid peak-time crowds</li>
</ul>
<p>…private is the “guarantee” option. It costs more, but it removes 90% of friction.</p>

<hr/>

<h2>2) What’s usually included (and what you should never assume)</h2>
<p>Boat tours often market “lunch included” and multiple swim stops, but details vary by operator and season. Even tours with similar names can differ in route, timing, and inclusions.</p>

<h3>Usually included (common, not guaranteed)</h3>
<ul>
  <li>boat cruise + crew</li>
  <li>several swim stops</li>
  <li>lunch (often simple, “boat day” style)</li>
</ul>

<h3>Often NOT included (ask before you pay)</h3>
<ul>
  <li>drinks (sometimes water is fine, sometimes everything is paid)</li>
  <li>snorkel gear</li>
  <li>entry fees (if a specific protected area has an entrance fee)</li>
  <li>hotel transfers (sometimes optional)</li>
</ul>

<p><strong>Legal/accuracy policy:</strong> Don’t rely on TikTok/Instagram claims about “what’s included”. Ask the operator in writing (WhatsApp message is enough).</p>

<hr/>

<h2>3) The “guarantee” booking questions (copy/paste to WhatsApp)</h2>
<p>Send this list before booking. It instantly filters out messy operators and protects your day:</p>

<ul>
  <li><strong>Route today:</strong> “Which exact bays/islands will we stop at today? How many swim stops?”</li>
  <li><strong>Time at stops:</strong> “How long do we stay at each stop?”</li>
  <li><strong>Capacity:</strong> “What’s the maximum number of guests on the boat?”</li>
  <li><strong>Shade:</strong> “Is there enough shaded seating if we don’t want full sun?”</li>
  <li><strong>Food:</strong> “Is lunch included? What’s the menu? Any vegetarian option?”</li>
  <li><strong>Drinks:</strong> “What drinks are included vs paid?”</li>
  <li><strong>Toilet:</strong> “Is there a toilet onboard?”</li>
  <li><strong>Music:</strong> “Is it a party boat or relaxed?”</li>
  <li><strong>Safety:</strong> “Do you do a safety briefing? Are life jackets available for everyone?”</li>
  <li><strong>Cancellation:</strong> “What’s your cancellation policy if the sea/weather changes?”</li>
</ul>

<hr/>

<h2>4) Safety checks that keep it fully “legal and sensible”</h2>
<p>I’ll keep this simple: you’re not inspecting a ship, you’re making sure basic safety isn’t treated like a joke.</p>

<h3>Life jackets: the minimum standard</h3>
<p>Turkey’s maritime safety guidance emphasises that life jackets must be in good condition, stowed properly, and quickly accessible in an emergency (not locked away or buried).</p>

<p><strong>What you do as a guest:</strong> ask “Where are the life jackets?” in the first 2 minutes. If the answer is vague or defensive, that’s your sign.</p>

<h3>Capacity and weather discipline</h3>
<ul>
  <li>If the boat feels overcrowded, comfort drops and safety gets worse.</li>
  <li>If conditions are rough, good operators adjust route/stop choices. Don’t fight the sea; pick the best day you’re given.</li>
</ul>

<!-- IMAGE_PRIVATE_PLACEHOLDER -->

<hr/>

<h2>5) What to pack (UK travellers always forget one of these)</h2>
<ul>
  <li><strong>Sun protection:</strong> SPF + hat (boat sun is stronger than you expect)</li>
  <li><strong>Dry bag:</strong> for phone/wallet (cheap and lifesaving)</li>
  <li><strong>Light layer:</strong> it can get breezy when the boat is moving</li>
  <li><strong>Water shoes:</strong> helpful for rocky entries</li>
  <li><strong>Cash (small TRY):</strong> for small onboard extras/tips when needed</li>
  <li><strong>Motion sickness plan:</strong> if you’re sensitive, take your usual remedy before boarding</li>
</ul>

<hr/>

<h2>6) Which boat trip should YOU choose? (fast decision)</h2>
<ul>
  <li><strong>“I want the easiest best-day option” →</strong> 12 Islands / Göcek bays style</li>
  <li><strong>“I want dramatic scenery and a headline stop” →</strong> Ölüdeniz + Butterfly Valley style</li>
  <li><strong>“I hate crowds and want control” →</strong> private boat</li>
  <li><strong>“I only have a short stay” →</strong> sunset cruise</li>
</ul>

<hr/>

<h2>FAQs</h2>

<h3>Is the Fethiye 12 Islands boat trip worth it?</h3>
<p>Yes for most first-timers because it’s a simple full-day format with multiple swim stops around bays and islands near Fethiye/Göcek. The exact stops vary by operator/day.</p>

<h3>Is Butterfly Valley protected?</h3>
<p>It’s widely presented as a nature-focused destination and is treated as a protected/nature reserve area in common references. Always follow local rules on-site (especially for protected zones).</p>

<h3>What should I ask before booking any boat tour?</h3>
<p>Route, number of stops, time at stops, boat capacity, what’s included (food/drinks), toilet, shade, music style, cancellation policy, and where life jackets are stored.</p>

<p><em>Last updated:</em> ${new Date().toLocaleDateString('en-GB')}</p>
`
};

async function addFethiyeBoatGuideArticle() {
    const timestamp = Date.now();

    // --- Authentic Mode Prompts (Imagen 3) ---
    const imagesToGenerate = [
        {
            placeholder: '<!-- IMAGE_COVER_PLACEHOLDER -->',
            filename: `fethiye-boat-guide-cover-${timestamp}.jpg`,
            prompt: "A traditional wooden gulet boat sailing on clear turquoise water near Fethiye. Sunny day. People engaging in holiday activities on deck. Authentic travel photography."
        },
        {
            placeholder: '<!-- IMAGE_12ISLANDS_PLACEHOLDER -->',
            filename: `fethiye-12islands-swim-${timestamp}.jpg`,
            prompt: "People swimming around a boat in a small secluded bay in the 12 Islands region of Fethiye. Clear water. Pine trees on shore. Authentic summer holiday vibe."
        },
        {
            placeholder: '<!-- IMAGE_BUTTERFLY_PLACEHOLDER -->',
            filename: `fethiye-butterfly-valley-view-${timestamp}.jpg`,
            prompt: "A view of Butterfly Valley (Kelebekler Vadisi) beach from the sea. High cliffs on both sides. A boat approaching. Dramatic scenery. Authentic travel photography."
        },
        {
            placeholder: '<!-- IMAGE_PRIVATE_PLACEHOLDER -->',
            filename: `fethiye-private-boat-lunch-${timestamp}.jpg`,
            prompt: "Lunch table set on the deck of a private boat in Fethiye. Fresh mediterranean food. Sea view background. Relaxed luxury. Authentic travel experience."
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
        title: { en: ARTICLE_DATA.title, tr: "Fethiye Tekne Turları Rehberi: 12 Adalar mı, Kelebekler mi?" },
        meta_description: { en: ARTICLE_DATA.meta_description, tr: "Fethiye tekne turu seçerken nelere dikkat etmeli? 12 Adalar, Ölüdeniz, özel tekne kiralama ve fiyat ipuçları." },
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
        console.log("✅ Fethiye Boat Guide Article Added Successfully with Imagen 3 Images!");
    }
}

addFethiyeBoatGuideArticle();
