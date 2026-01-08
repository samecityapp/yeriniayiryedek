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
    slug: 'spa-and-hammam-hotels-in-turkey-whats-worth-paying-for-uk-guide',
    title: 'Spa & Hammam Hotels in Turkey: What’s Worth Paying For (UK Guide)',
    meta_description: 'Booking a spa or hammam hotel in Turkey from the UK? Learn what’s genuinely worth paying for, what’s often just marketing, and the checklist to choose the right spa setup. No hotel names.',
    primary_keyword: 'spa and hammam hotels in Turkey',
    content: `<p><strong>Quick answer:</strong> A hotel spa in Turkey is worth paying for when it improves your <strong>daily comfort</strong> (heated indoor pool in shoulder season, good relaxation areas, consistent quality). A hammam is worth it when it’s done as a <strong>proper experience</strong> (clean, calm, well-run) rather than a quick upsell. UK travellers should verify <strong>what’s included for free</strong> (sauna/steam/indoor pool) vs what’s <strong>paid treatments</strong> (massage, scrubs, private rooms).</p>

<p>This guide is practical: it helps you choose a spa/hammam setup that genuinely improves your holiday — without overpaying for a “spa label” that doesn’t deliver.</p>

<p>Internal reads (placeholders):
<a href="/guide/hotels-with-heated-pools-in-turkey-where-to-find-uk-guide">Hotels With Heated Pools in Turkey</a> •
<a href="/guide/ultra-all-inclusive-in-turkey-explained-expectations-uk-guide">Ultra All Inclusive Explained</a> •
<a href="/guide/hidden-costs-in-turkey-resorts-uk-guide">Hidden Costs in Turkey Resorts</a> •
<a href="/guide/best-time-to-visit-turkey-weather-guide-uk">Best Time to Visit Turkey</a>
</p>

<!-- IMAGE_COVER_PLACEHOLDER -->

<hr/>

<h2>Hotel spa vs a “proper hammam experience” (UK-friendly explanation)</h2>
<p>UK travellers often mix these up. They’re related, but not the same.</p>

<h3>Hotel spa</h3>
<ul>
  <li>Usually includes facilities like <strong>sauna/steam</strong>, sometimes an <strong>indoor pool</strong>, and relaxation areas.</li>
  <li>Treatments (massage, scrubs) are usually <strong>extra</strong>.</li>
  <li>Value depends on how often you’ll actually use it.</li>
</ul>

<h3>Hammam experience</h3>
<ul>
  <li>Can be part of a hotel spa, or offered as an experience-style service.</li>
  <li>Value depends on <strong>cleanliness</strong>, <strong>calm</strong>, and <strong>how it’s run</strong>.</li>
  <li>Best enjoyed when you’re not rushed and you choose a calm time of day.</li>
</ul>

<!-- IMAGE_HAMMAM_PLACEHOLDER -->

<p><strong>Simple rule:</strong> A spa label doesn’t guarantee a great experience. Setup and operations matter.</p>

<hr/>

<h2>When a spa hotel is genuinely worth it (UK traveller scenarios)</h2>

<h3>1) Shoulder season travel (spring/autumn)</h3>
<p>If you’re visiting Turkey when pool temperatures can vary, a strong spa with an indoor pool or heated setup can be the difference between “we enjoyed every day” and “we waited for warmth”.</p>
<p>Read: <a href="/guide/hotels-with-heated-pools-in-turkey-where-to-find-uk-guide">Heated Pools in Turkey</a>.</p>

<h3>2) You want a low-effort “reset” holiday</h3>
<p>If your goal is relaxation, a spa can turn the whole trip into an easy rhythm: morning swim, long lunch, spa/steam, calm dinner.</p>

<h3>3) You’re doing a walking-heavy trip</h3>
<p>City breaks and scenic regions can involve a lot of walking. A decent sauna/steam setup can feel genuinely valuable for recovery.</p>

<h3>4) You’re travelling as a couple and want “slow evenings”</h3>
<p>A good spa adds a romantic, calm option that doesn’t depend on nightlife or constant planning.</p>

<hr/>

<h2>What’s usually worth paying for (and why)</h2>

<h3>Worth paying for (if quality is good)</h3>
<ul>
  <li><strong>Massage</strong> when you want real relaxation and recovery</li>
  <li><strong>Hammam scrub/foam experience</strong> as a “Turkey moment” (done calmly and cleanly)</li>
  <li><strong>Private sessions</strong> if you value privacy and quiet</li>
</ul>

<h3>Sometimes worth paying for</h3>
<ul>
  <li><strong>Day-pass style upgrades</strong> if you’re not staying at a resort but want a spa day</li>
  <li><strong>Specialty treatments</strong> if you care about a specific outcome</li>
</ul>

<!-- IMAGE_TREATMENT_PLACEHOLDER -->

<p><strong>UK-friendly tip:</strong> If you only want “a bit of relaxation”, don’t pay for a full treatment menu. Use included facilities and do one high-quality session.</p>

<hr/>

<h2>What’s often just marketing (don’t overpay)</h2>
<ul>
  <li><strong>“Spa” label</strong> that only means a small room and a menu</li>
  <li><strong>Overpromised facilities</strong> (tiny sauna, no relaxation area, cramped layout)</li>
  <li><strong>Hammam as an upsell machine</strong> rather than a calm experience</li>
  <li><strong>Indoor pool that’s not comfortable</strong> (cold, crowded, limited hours)</li>
</ul>

<p><strong>Simple rule:</strong> A real spa feels like a place you want to spend time — not a corridor you walk through once.</p>

<hr/>

<h2>The UK traveller spa checklist (verify these before booking)</h2>

<h3>1) What’s included for free?</h3>
<ul>
  <li>Is the <strong>sauna/steam</strong> included?</li>
  <li>Is the <strong>indoor pool</strong> included?</li>
  <li>Are there <strong>time restrictions</strong> or access rules?</li>
</ul>

<h3>2) The “comfort” questions</h3>
<ul>
  <li>Is there a <strong>relaxation area</strong> (somewhere to actually chill)?</li>
  <li>Does it feel calm, or is it a busy pass-through zone?</li>
  <li>Is it usable at the times you’ll want it (e.g., after dinner)?</li>
</ul>

<h3>3) Hammam clarity</h3>
<ul>
  <li>Is there a hammam facility as part of the spa, or only bookable treatments?</li>
  <li>Is it positioned as a calm experience or as a sales funnel?</li>
</ul>

<h3>4) Treatment pricing and expectations</h3>
<ul>
  <li>What’s the price range for basic massage?</li>
  <li>How long are sessions and what do they include?</li>
  <li>Are there “packages” that push you to spend more than you need?</li>
</ul>

<p>Pair with: <a href="/guide/hidden-costs-in-turkey-resorts-uk-guide">Hidden Costs in Turkey Resorts</a>.</p>

<hr/>

<h2>How to get the best spa value (UK-friendly strategy)</h2>
<ul>
  <li><strong>Use included facilities daily</strong> if you’re paying for a spa hotel.</li>
  <li><strong>Book one “hero” treatment</strong> rather than many average ones.</li>
  <li><strong>Choose timing smartly:</strong> go when it’s calmer for a better experience.</li>
  <li><strong>Don’t treat it as a luxury badge.</strong> Treat it as a comfort feature.</li>
</ul>

<hr/>

<h2>Common mistakes (framed positively)</h2>
<ul>
  <li><strong>Booking a spa hotel in summer just because it says “spa”:</strong> if you won’t use it, you’re paying for a label.</li>
  <li><strong>Assuming hammam is always included:</strong> often it’s a paid treatment experience.</li>
  <li><strong>Not checking indoor pool comfort:</strong> an indoor pool can be “exists” but not enjoyable.</li>
</ul>

<hr/>

<h2>FAQs</h2>

<h3>Are hotel hammams in Turkey worth it?</h3>
<p>They can be — when the setup is clean, calm and well-run, and you treat it as an experience rather than a rushed add-on.</p>

<h3>What is usually free in a hotel spa in Turkey?</h3>
<p>It varies. Often sauna/steam and sometimes an indoor pool are included, while massages and scrubs are paid. Always verify what’s included.</p>

<h3>How do I avoid overpaying for a spa hotel?</h3>
<p>Check what’s included, confirm the spa has real relaxation spaces, and plan to actually use the facilities. Otherwise, choose a non-spa base and book one great experience separately.</p>

<p><em>Last updated:</em> ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
`
};

async function run() {
    const timestamp = Date.now();
    console.log("🚀 Starting Spa & Hammam Article Automation...");

    // SAFE PROMPTS for Authentic Feel
    const imagesToGenerate = [
        {
            placeholder: '<!-- IMAGE_COVER_PLACEHOLDER -->',
            filename: `turkey-hotel-hammam-interior-authentic-${timestamp}.jpg`,
            prompt: "Interior of a traditional Turkish hammam in a luxury hotel. Marble basins, warm lighting, steam. No people. Authentic architectural photography. Realistic."
        },
        {
            placeholder: '<!-- IMAGE_HAMMAM_PLACEHOLDER -->',
            filename: `turkey-spa-relaxation-area-calm-${timestamp}.jpg`,
            prompt: "A quiet relaxation area in a hotel spa in Turkey. Comfortable loungers, soft light, tea service. Peaceful atmosphere. Authentic travel photography. Realistic."
        },
        {
            placeholder: '<!-- IMAGE_TREATMENT_PLACEHOLDER -->',
            filename: `turkey-spa-massage-room-setup-${timestamp}.jpg`,
            prompt: "A prepared massage room in a high-end Turkish hotel spa. Clean towels, candles, essential oils. Warm ambiance. Authentic interior photography. Realistic."
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
        title: { en: ARTICLE_DATA.title, tr: "Türkiye'de Spa ve Hamam Otelleri: Neye Değer? (TR Pasif)" },
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
        console.log("✅ Spa & Hammam Article Added Successfully!");
        console.log("👉 Slug:", ARTICLE_DATA.slug);
    }
}

run();
