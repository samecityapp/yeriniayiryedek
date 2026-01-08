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

async function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function generateImageVertex(prompt: string, filename: string, retries = 3) {
    console.log(`🎨 Generating ${filename} with Imagen 3...`);

    const localPath = path.join(ARTICLES_IMAGE_DIR, filename);
    if (fs.existsSync(localPath)) {
        console.log(`⏩ File exists, skipping: ${filename}`);
        return `/images/articles/${filename}`;
    }

    const auth = new GoogleAuth({
        keyFile: 'google-credentials.json',
        scopes: ['https://www.googleapis.com/auth/cloud-platform']
    });

    const client = await auth.getClient();
    const accessToken = await client.getAccessToken();
    const url = `https://${API_ENDPOINT}/v1/projects/${PROJECT_ID}/locations/${LOCATION}/publishers/google/models/${MODEL_ID}:predict`;

    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            if (attempt > 1) await sleep(20000);

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken.token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    instances: [{ prompt }],
                    parameters: { sampleCount: 1, aspectRatio: "16:9", safetySetting: "block_only_high", personGeneration: "allow_adult" }
                })
            });

            if (!response.ok) {
                if (response.status === 429) {
                    console.warn(`⏳ Quota exceeded (429). Waiting 30s before retry ${attempt + 1}...`);
                    await sleep(30000);
                    continue;
                }
                throw new Error(`Vertex API Error: ${response.status}`);
            }

            const data = await response.json();
            if (!data.predictions?.[0]?.bytesBase64Encoded) throw new Error('No predictions');

            fs.writeFileSync(localPath, Buffer.from(data.predictions[0].bytesBase64Encoded, 'base64'));
            console.log(`✅ Saved: ${localPath}`);
            return `/images/articles/${filename}`;
        } catch (error) {
            console.error(`❌ Attempt ${attempt} failed:`, error);
            if (attempt === retries) return null;
        }
    }
    return null;
}

const ARTICLE_DATA = {
    slug: 'pet-friendly-stays-in-turkey-rules-fees-uk-travellers-guide',
    title: 'Pet-Friendly Stays in Turkey: Rules, Fees & the Details UK Travellers Usually Miss (No Hotel Names)',
    meta_description: 'Travelling to Turkey with a pet from the UK? Learn how pet-friendly stays work—fees, size limits, beach access, room rules, cleaning deposits, and practical tips to avoid surprises. No hotel names.',
    primary_keyword: 'pet-friendly stays in Turkey',
    content: `<p><strong>Quick answer:</strong> “Pet-friendly” in Turkey can mean anything from “pets allowed with clear rules” to “pets allowed but with strict limits and extra charges”. UK travellers should verify: <strong>pet size/weight limits</strong>, <strong>fees/deposits</strong>, <strong>where pets are allowed on-site</strong> (rooms only vs common areas), <strong>beach access rules</strong>, and <strong>what happens if your pet is left alone in the room</strong>.</p>

<p>This guide is for UK travellers who want a smooth stay with a pet — no awkward check-in surprises, no hidden rules, and no stress about where your dog can actually go.</p>

<p>Internal reads (placeholders):
<a href="/guide/how-to-choose-hotel-in-turkey-checklist-uk-guide">How to Choose a Hotel in Turkey (Checklist)</a> •
<a href="/guide/cash-or-card-in-turkey-uk-guide">Cash or Card in Turkey? (UK Guide)</a> •
<a href="/guide/driving-in-turkey-as-uk-traveller-guide">Driving in Turkey as a UK Traveller</a> •
<a href="/guide/where-to-stay-in-turkey-solo-travellers-guide-uk">Solo Travel Bases in Turkey</a>
</p>

<!-- IMAGE_COVER_PLACEHOLDER -->

<hr/>

<h2>First: what “pet-friendly” usually means (UK-friendly definition)</h2>
<p>In practice, there are <strong>three</strong> levels of pet-friendly stays you’ll encounter in Turkey:</p>

<h3>1) “Pets accepted” (basic permission)</h3>
<ul>
  <li>Pets are allowed, but rules are minimal and may be case-by-case.</li>
  <li>Risk: unclear boundaries (where pets can go, what fees apply).</li>
</ul>

<h3>2) “Pet-friendly with rules” (best-case for travellers)</h3>
<ul>
  <li>Clear fee policy, size limits, and on-site access rules.</li>
  <li>This is the sweet spot: predictable and low-stress.</li>
</ul>

<h3>3) “Pet-friendly but restricted” (common in some places)</h3>
<ul>
  <li>Pets allowed in rooms only, limited areas, strict times, or extra deposits.</li>
  <li>Not automatically bad — but you must know the limits before booking.</li>
</ul>

<p><strong>Simple rule:</strong> True pet-friendly is <strong>clarity</strong>, not just permission.</p>

<hr/>

<h2>The UK traveller pet checklist (verify before you book)</h2>
<p>Copy-paste these questions when messaging a property. If they answer clearly, you’re already in safer territory.</p>

<h3>1) Size / breed / number limits</h3>
<ul>
  <li>Is there a <strong>weight limit</strong>?</li>
  <li>Are certain breeds restricted?</li>
  <li>How many pets per room are allowed?</li>
</ul>

<h3>2) Fees, deposits and cleaning charges</h3>
<ul>
  <li>Is the pet fee <strong>per night</strong> or <strong>per stay</strong>?</li>
  <li>Is there a <strong>refundable deposit</strong>?</li>
  <li>Are there extra cleaning fees regardless of length?</li>
</ul>

<p><strong>UK-friendly tip:</strong> Ask for the total in writing so you don’t get “policy confusion” at check-in.</p>

<h3>3) Where your pet is allowed on-site</h3>
<ul>
  <li>Rooms only, or also garden/outdoor zones?</li>
  <li>Are pets allowed in lobby areas?</li>
  <li>Are pets allowed near pool areas? (Often not.)</li>
</ul>

<!-- IMAGE_ACCESS_PLACEHOLDER -->

<h3>4) Food and dining rules (where trips can get awkward)</h3>
<ul>
  <li>Can your pet sit with you in outdoor dining spaces?</li>
  <li>Is there any designated outdoor area?</li>
</ul>

<h3>5) Leaving your pet alone in the room</h3>
<ul>
  <li>Is it allowed to leave your pet alone?</li>
  <li>If yes, are there conditions (crate required, time limit, do-not-disturb sign)?</li>
</ul>

<h3>6) Beach access reality (very location dependent)</h3>
<ul>
  <li>Are pets allowed on the beach nearby?</li>
  <li>Are there time restrictions (early morning / late evening)?</li>
  <li>If the property has a “private beach section”, are pets allowed there?</li>
</ul>

<p><strong>Simple rule:</strong> “Pet-friendly hotel” does not automatically mean “dog-friendly beach”. Treat those as separate checks.</p>

<hr/>

<h2>Best accommodation type for travelling with a pet (UK-friendly)</h2>

<h3>Aparthotel / apartment-style stays (often easiest)</h3>
<p>If you’re travelling with a pet, more space and flexible routine can make everything easier: feeding, downtime, and not worrying about shared indoor spaces.</p>

<h3>Boutique stays with outdoor space (often very comfortable)</h3>
<p>Properties with gardens/terraces can feel naturally pet-friendly — as long as the rules are clear.</p>

<h3>Large resorts (possible, but often restricted)</h3>
<p>Some larger properties allow pets, but access can be limited (common areas, beaches, pools). If you choose this route, you must confirm the practical day plan.</p>

<!-- IMAGE_ROOM_PLACEHOLDER -->

<hr/>

<h2>How to plan your day so it actually works with a pet</h2>
<p>The best pet trips are built around a calm daily rhythm:</p>
<ul>
  <li><strong>Morning:</strong> long walk + breakfast plan that works (outdoor seating helps)</li>
  <li><strong>Midday:</strong> shade + cool time (Turkey heat can be intense)</li>
  <li><strong>Late afternoon:</strong> second long walk + your main outing</li>
  <li><strong>Evenings:</strong> simple dinner plan + easy return</li>
</ul>

<p><strong>Heat tip (UK travellers):</strong> If you’re travelling in warmer months, your pet’s comfort will often decide your schedule. Shade and water access matter more than “busy sightseeing”.</p>

<hr/>

<h2>Transport tips (without overcomplicating)</h2>
<ul>
  <li><strong>Car travel:</strong> often the simplest for pet flexibility (stops, water, shade).</li>
  <li><strong>City travel:</strong> choose a walkable base so you don’t rely on long transport hops.</li>
  <li><strong>Day trips:</strong> do fewer, better trips. Pet travel is smoother when you keep the plan simple.</li>
</ul>

<p>Related: <a href="/guide/driving-in-turkey-as-uk-traveller-guide">Driving in Turkey as a UK Traveller</a>.</p>

<hr/>

<h2>Common mistakes (framed positively)</h2>
<ul>
  <li><strong>Not confirming fees in writing:</strong> always get the total cost clearly.</li>
  <li><strong>Assuming pet-friendly means pet-welcome everywhere:</strong> check common areas, dining, and beach rules.</li>
  <li><strong>Planning like you’re travelling without a pet:</strong> build the day around shade, water, and calm pacing.</li>
</ul>

<hr/>

<h2>FAQs</h2>

<h3>Are pet-friendly hotels common in Turkey?</h3>
<p>They exist across many areas, but the definition of “pet-friendly” varies. The key is to confirm rules, fees, and where pets are allowed on-site.</p>

<h3>Do pet-friendly stays in Turkey charge extra fees?</h3>
<p>Often yes. Fees can be per night or per stay, and some places also require a refundable deposit or cleaning fee. Always confirm before booking.</p>

<h3>Can I take my dog to the beach in Turkey?</h3>
<p>It depends on the local beach rules and whether the beach is public or hotel-managed. Confirm this separately — don’t assume “pet-friendly stay” equals “dog-friendly beach”.</p>

<p><em>Last updated:</em> ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
`
};

async function run() {
    const timestamp = Date.now();
    console.log("🚀 Starting Pet-Friendly Stays Article Automation...");

    // SAFE PROMPTS for Authentic Feel
    const imagesToGenerate = [
        {
            placeholder: '<!-- IMAGE_COVER_PLACEHOLDER -->',
            filename: `turkey-hotel-garden-dog-friendly-authentic-${timestamp}.jpg`,
            prompt: "A happy medium-sized dog on a leash relaxing in a green hotel garden in Turkey. Sunny day, grass, shade. Authentic travel photography. Realistic."
        },
        {
            placeholder: '<!-- IMAGE_ACCESS_PLACEHOLDER -->',
            filename: `turkey-pet-friendly-outdoor-cafe-vibe-${timestamp}.jpg`,
            prompt: "A dog sitting quietly under an outdoor cafe table at a Turkish hotel or restaurant. People enjoying breakfast nearby. Relaxed atmosphere. Authentic travel photography. Realistic."
        },
        {
            placeholder: '<!-- IMAGE_ROOM_PLACEHOLDER -->',
            filename: `turkey-hotel-room-pet-setup-authentic-${timestamp}.jpg`,
            prompt: "A pet-friendly hotel room setup in Turkey with a dog bed and water bowl on the floor near a balcony door. Clean, sunny room. No people. Authentic interior photography. Realistic."
        }
    ];

    let finalContent = ARTICLE_DATA.content;
    let coverImageUrl = '';

    for (const item of imagesToGenerate) {
        if (!item.placeholder.includes('COVER')) await sleep(5000);
        if (item.placeholder.includes('COVER')) await sleep(1000);

        const publicUrl = await generateImageVertex(item.prompt, item.filename);

        if (publicUrl) {
            if (item.placeholder.includes('COVER')) {
                coverImageUrl = publicUrl;
                finalContent = finalContent.replace(item.placeholder, '');
            } else if (item.placeholder) {
                const imgTag = `<img src="${publicUrl}" alt="${item.prompt}" class="w-full h-auto rounded-lg my-6 shadow-md" />`;
                finalContent = finalContent.replace(item.placeholder, imgTag);
            }
        } else {
            console.warn("⚠️ Image generation failed for:", item.filename);
            if (item.placeholder) finalContent = finalContent.replace(item.placeholder, '');
        }
    }

    // Insert into DB
    const { error } = await supabase.from('articles').upsert({
        slug: ARTICLE_DATA.slug,
        title: { en: ARTICLE_DATA.title, tr: "Türkiye'de Evcil Hayvan Dostu Oteller: Kurallar ve Ücretler (TR Pasif)" },
        meta_description: { en: ARTICLE_DATA.meta_description, tr: "TR Pasif içerik." },
        content: { en: finalContent, tr: "<p>Bu içerik sadece İngilizce dilinde yayındadır.</p>" },
        cover_image_url: coverImageUrl,
        published_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    }, { onConflict: 'slug' });

    if (error) {
        console.error("❌ DB Insert Failed:", error);
    } else {
        console.log("✅ Pet-Friendly Stays Article Added Successfully!");
        console.log("👉 Slug:", ARTICLE_DATA.slug);
    }
}

run();
