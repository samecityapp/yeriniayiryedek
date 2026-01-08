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
    slug: 'eco-stays-in-turkey-how-uk-travellers-can-spot-real-practices',
    title: 'Eco Stays in Turkey: How UK Travellers Can Spot Real Eco Practices (Avoid Greenwashing)',
    meta_description: 'Want an eco-friendly stay in Turkey from the UK? Learn how to spot genuine sustainability (not marketing), what to check before booking, and which eco signals actually matter for travellers. No hotel names.',
    primary_keyword: 'eco stays in Turkey',
    content: `<p><strong>Quick answer:</strong> A genuinely eco-minded stay usually shows <strong>operational proof</strong> (how they run the property) not just eco-style décor or vague claims. UK travellers should check for: <strong>water management</strong>, <strong>energy efficiency</strong>, <strong>waste reduction</strong>, <strong>local sourcing</strong>, and <strong>realistic guest choices</strong> (towels/linen policy, refill stations). The strongest eco signals are the boring ones: systems, transparency, and consistency.</p>

<p>This guide helps you choose eco stays in Turkey that are actually doing the work — without needing to become an environmental auditor.</p>

<p>Internal reads (placeholders):
<a href="/guide/how-to-choose-hotel-in-turkey-checklist-uk-guide">How to Choose a Hotel in Turkey (Checklist)</a> •
<a href="/guide/turkey-costs-breakdown-cheapest-expensive-uk-guide">Turkey Costs: What to Expect (UK Guide)</a> •
<a href="/guide/eco-stays-what-to-ask-before-booking">Eco Stays: Questions to Ask Before Booking</a>
</p>

<!-- IMAGE_COVER_PLACEHOLDER -->

<hr/>

<h2>First: what “eco stay” can realistically mean in Turkey</h2>
<p>Turkey has a wide range of accommodation types: big resorts, boutique stays, aparthotels, rural escapes. “Eco” will look different depending on size and location. A small rural stay might be eco because it’s naturally low-impact; a larger property can be eco because it has strong systems and reduces waste at scale.</p>

<p><strong>Simple rule:</strong> Don’t judge eco by aesthetics. Judge by operations.</p>

<hr/>

<h2>The 5 eco signals that actually matter (UK traveller version)</h2>

<h3>1) Water management (Turkey’s most important practical eco topic)</h3>
<ul>
  <li>Low-flow taps/showers or water-efficient fixtures</li>
  <li>Clear towel/linen policy (not forced, but encouraged)</li>
  <li>Smart landscaping (not constant heavy watering)</li>
</ul>

<h3>2) Energy efficiency</h3>
<ul>
  <li>Energy-saving lighting and sensible cooling systems</li>
  <li>Key-card power systems (common, but still a good sign)</li>
  <li>Thoughtful design that reduces unnecessary cooling/heating demand</li>
</ul>

<h3>3) Waste reduction (the easiest to fake, but also easiest to check)</h3>
<ul>
  <li>Refill stations for water where possible</li>
  <li>Reduced single-use plastics (especially bottles and toiletry minis)</li>
  <li>Visible recycling approach (not perfect, but present and consistent)</li>
</ul>

<!-- IMAGE_REFILL_PLACEHOLDER -->

<h3>4) Local sourcing and community impact</h3>
<ul>
  <li>Local food sourcing where practical</li>
  <li>Local staff and fair employment signals</li>
  <li>Promotion of local businesses and experiences (not only “on-site everything”)</li>
</ul>

<h3>5) Transparency</h3>
<ul>
  <li>They explain what they do (clearly), not just “we love nature”.</li>
  <li>They admit limits and show ongoing improvements.</li>
</ul>

<p><strong>Simple rule:</strong> Eco claims without specifics are marketing.</p>

<hr/>

<h2>What “greenwashing” usually looks like (so you can spot it fast)</h2>
<ul>
  <li><strong>Vague language:</strong> “eco”, “green”, “sustainable” with no detail</li>
  <li><strong>One token action</strong> presented as full eco strategy (e.g., “we ask you to reuse towels” and nothing else)</li>
  <li><strong>Aesthetic eco cues</strong> (wood, plants, “eco” design) without operational proof</li>
  <li><strong>Only guest sacrifices</strong> (you must do everything) without the property doing the hard work</li>
</ul>

<p><strong>UK-friendly mindset:</strong> Real sustainability is mostly invisible work.</p>

<hr/>

<h2>What to ask before booking (copy-paste questions)</h2>
<p>If eco matters to you, ask 3–5 quick questions. You’ll learn more from the answer style than the answer itself.</p>

<ul>
  <li><strong>Which sustainability actions do you currently run day-to-day?</strong></li>
  <li><strong>How do you reduce single-use plastics on-site?</strong></li>
  <li><strong>Do you have refill water options or reduced bottle usage?</strong></li>
  <li><strong>How do you manage laundry (towels/linen) to reduce waste?</strong></li>
  <li><strong>Do you source food locally where possible?</strong></li>
</ul>

<p><strong>How to judge replies:</strong> Clear, specific, non-defensive answers = good sign. Copy-paste marketing paragraphs = weak sign.</p>

<hr/>

<h2>Eco stays by travel style (UK-friendly picks)</h2>

<h3>Couples</h3>
<ul>
  <li>Look for boutique eco stays where evenings are calm and the property is transparent about practices.</li>
</ul>

<h3>Families</h3>
<ul>
  <li>Prioritise practical eco features that also improve comfort: shade, water management, refill options, efficient cooling.</li>
</ul>

<h3>Long stays / slow travel</h3>
<ul>
  <li>Aparthotels or small properties can be naturally lower impact if you cook occasionally and reduce daily laundry demand.</li>
</ul>

<!-- IMAGE_LOCAL_FOOD_PLACEHOLDER -->

<hr/>

<h2>Eco vs comfort: the balanced approach (UK traveller truth)</h2>
<p>The best eco choice is one you can happily live with. If an “eco stay” makes you uncomfortable, you won’t enjoy it and you won’t repeat it. Aim for:</p>
<ul>
  <li>Real eco practices <strong>plus</strong> good sleep, shade, and practical comfort</li>
  <li>Small daily choices (towels/linen) that feel easy, not forced</li>
</ul>

<hr/>

<h2>Common mistakes (framed positively)</h2>
<ul>
  <li><strong>Choosing eco based on branding:</strong> verify the operational signals.</li>
  <li><strong>Assuming certifications solve everything:</strong> still check practical details for your stay.</li>
  <li><strong>Expecting perfect sustainability:</strong> choose the stay doing real work and improving over time.</li>
</ul>

<hr/>

<h2>FAQs</h2>

<h3>How can UK travellers find genuinely eco-friendly stays in Turkey?</h3>
<p>Look for operational proof: water/energy efficiency, reduced single-use plastics, waste management, local sourcing, and clear transparency about practices.</p>

<h3>Are eco stays in Turkey more expensive?</h3>
<p>Not always. Some eco practices reduce costs (energy/water efficiency). Price depends more on location and style than the eco label itself.</p>

<h3>What is the biggest greenwashing sign?</h3>
<p>Vague eco language with no specifics, or sustainability that relies only on guest sacrifices without visible operational action.</p>

<p><em>Last updated:</em> ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
`
};

async function run() {
    const timestamp = Date.now();
    console.log("🚀 Starting Eco Stays Article Automation...");

    // SAFE PROMPTS for Authentic Feel
    const imagesToGenerate = [
        {
            placeholder: '<!-- IMAGE_COVER_PLACEHOLDER -->',
            filename: `turkey-eco-hotel-greenery-authentic-${timestamp}.jpg`,
            prompt: "Exterior of a charming eco-friendly boutique hotel in Turkey, surrounded by lush green gardens and trees. Natural wood and stone materials. Sunlight filtering through leaves. Authentic travel photography. Realistic."
        },
        {
            placeholder: '<!-- IMAGE_REFILL_PLACEHOLDER -->',
            filename: `turkey-hotel-glass-water-refill-authentic-${timestamp}.jpg`,
            prompt: "A glass water bottle and glasses on a wooden table in a hotel room, next to a refill station or jug. Sunlight. Concept of zero waste in travel. Authentic photography. Realistic."
        },
        {
            placeholder: '<!-- IMAGE_LOCAL_FOOD_PLACEHOLDER -->',
            filename: `turkey-organic-farm-breakfast-authentic-${timestamp}.jpg`,
            prompt: "A fresh, organic Turkish breakfast spread on a table outdoors. Farm-to-table concept. Fresh tomatoes, olives, cheese, herbs. Natural light. Authentic food photography. Realistic."
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
        title: { en: ARTICLE_DATA.title, tr: "Türkiye'de Eko Oteller ve Yeşil Yıkama (Greenwashing) Rehberi (TR Pasif)" },
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
        console.log("✅ Eco Stays Article Added Successfully!");
        console.log("👉 Slug:", ARTICLE_DATA.slug);
    }
}

run();
