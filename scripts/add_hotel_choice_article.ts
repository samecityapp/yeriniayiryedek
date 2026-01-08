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
    slug: 'how-to-choose-hotel-in-turkey-checklist-uk-guide',
    title: 'How to Choose a Hotel in Turkey: UK Traveller Checklist That Actually Works (No Hotel Names)',
    meta_description: 'Booking a hotel in Turkey from the UK? Use this practical checklist to choose the right area, room, board type and vibe—avoid surprises, save money, and get a smoother holiday. No hotel names.',
    primary_keyword: 'how to choose a hotel in Turkey',
    content: `<p><strong>Quick answer:</strong> Pick your <strong>area first</strong> (it defines your holiday), then choose your <strong>hotel vibe</strong> (quiet vs lively), then lock down the <strong>room position</strong> (sleep quality), and only then compare price. Most UK travellers do it backwards — they pick a deal first and then realise the base or vibe doesn’t match their trip.</p>

<p>This guide is written for UK travellers booking Turkey and wanting a holiday that feels smooth: no nasty surprises, no “this isn’t what we expected” moments, and no wasted money. We’ll keep it practical and simple.</p>

<p>Internal reads (placeholders):
<a href="/guide/all-inclusive-in-turkey-explained-uk-guide">All-Inclusive in Turkey Explained</a> •
<a href="/guide/what-beachfront-means-in-turkey-guide">What “Beachfront” Really Means in Turkey</a> •
<a href="/guide/quiet-sleep-in-turkey-avoid-noisy-rooms">Quiet Sleep in Turkey: Avoid Noisy Rooms</a> •
<a href="/guide/family-stays-in-turkey-what-to-check">Family Stays in Turkey: What to Check</a> •
<a href="/guide/adults-only-vibe-guide-turkey">Adults-Only Stays: Quiet vs Lively</a>
</p>

<!-- IMAGE_COVER_PLACEHOLDER -->

<hr/>

<h2>The UK traveller method: choose in this order (it works)</h2>
<ol>
  <li><strong>Base area</strong> (beach type, transport, evenings)</li>
  <li><strong>Holiday style</strong> (resort vs boutique vs aparthotel)</li>
  <li><strong>Board basis</strong> (B&amp;B / half board / all inclusive)</li>
  <li><strong>Sleep quality</strong> (room position + noise risk)</li>
  <li><strong>Family needs / accessibility</strong> (if relevant)</li>
  <li><strong>Only then compare price</strong></li>
</ol>

<p><strong>Simple rule:</strong> If you get the base area and the vibe right, most of the holiday feels right.</p>

<hr/>

<h2>Step 1: Pick the area first (this decides your holiday)</h2>
<p>Turkey has “same country, totally different holiday” regions. Before you open any booking page, answer this:</p>

<ul>
  <li><strong>Do we want walkable evenings?</strong> (Town base) or <strong>self-contained comfort</strong> (resort base)?</li>
  <li><strong>Do we want calm?</strong> or <strong>lively energy</strong>?</li>
  <li><strong>Do we want day trips?</strong> or <strong>mainly pool/beach time</strong>?</li>
</ul>

<p>UK-friendly tip: if you’re doing 7+ nights and you value rest, choose a base that makes evenings effortless and sleep easy.</p>

<hr/>

<h2>Step 2: Choose your hotel “type” (what style holiday do you want?)</h2>

<h3>Resort-style stay</h3>
<p>Best if you want a simple routine: pool, beach, food on-site, minimal planning. Works brilliantly for families and travellers who want to switch off.</p>

<h3>Boutique-style stay</h3>
<p>Best if you want charm, atmosphere and a more “explore and eat out” rhythm. Works well for couples and shorter breaks.</p>

<h3>Aparthotel / apartment-style stay</h3>
<p>Best if you want space, flexibility, and control over food. Often ideal for longer stays or families who want a calmer routine.</p>

<!-- IMAGE_RESORT_PLACEHOLDER -->

<p><strong>Simple rule:</strong> Don’t book a resort if your dream is exploring local cafés every night. Don’t book boutique if your dream is pool days with everything handled.</p>

<hr/>

<h2>Step 3: Choose board basis (UK-friendly, no confusion)</h2>
<ul>
  <li><strong>B&amp;B:</strong> best for exploring and eating out</li>
  <li><strong>Half board:</strong> good if you like one main meal on-site and flexibility outside</li>
  <li><strong>All inclusive:</strong> best if you want predictable costs and low-effort days</li>
</ul>

<p>Internal read: <a href="/guide/all-inclusive-in-turkey-explained-uk-guide">All-Inclusive in Turkey Explained</a>.</p>

<hr/>

<h2>Step 4: “Beachfront” and “private beach” — what UK travellers should verify</h2>
<p>These phrases can mean different things. Before you commit, check:</p>
<ul>
  <li><strong>Is the beach actually on-site?</strong> Or is it “near the beach”?</li>
  <li><strong>Is there a road to cross?</strong></li>
  <li><strong>Is it sand, pebble, or a platform?</strong> (This changes the whole day.)</li>
  <li><strong>What’s included?</strong> (Sunbeds, towels, drinks, snacks)</li>
</ul>

<p>Internal read: <a href="/guide/what-beachfront-means-in-turkey-guide">What “Beachfront” Means in Turkey</a>.</p>

<hr/>

<h2>Step 5: The sleep-quality checklist (this is where holidays are won)</h2>
<p>Many UK travellers lose sleep in Turkey because of room position — not because the hotel is “bad”. Fix it upfront with these checks:</p>

<ul>
  <li><strong>Avoid being above evening entertainment</strong> if you’re sensitive to noise.</li>
  <li><strong>Watch for “sea view” rooms facing bars or busy strips.</strong></li>
  <li><strong>Ask for a quieter room position</strong> (calmer side, higher floor if you like).</li>
  <li><strong>Consider family zones</strong> if you want calm early nights.</li>
</ul>

<p>Internal read: <a href="/guide/quiet-sleep-in-turkey-avoid-noisy-rooms">Quiet Sleep in Turkey: Avoid Noisy Rooms</a>.</p>

<!-- IMAGE_BOUTIQUE_PLACEHOLDER -->

<hr/>

<h2>Step 6: Choose based on who you’re travelling with</h2>

<h3>Couples</h3>
<ul>
  <li>Prioritise <strong>vibe</strong> and <strong>evenings</strong> (walkability + calm).</li>
  <li>Decide if you want <strong>lively</strong> or <strong>quiet</strong> — don’t sit in the middle unintentionally.</li>
</ul>

<h3>Families</h3>
<ul>
  <li>Prioritise <strong>shade, easy food, and pool setup</strong>.</li>
  <li>Check <strong>kids club</strong> and “family zones” if you want calmer sleep.</li>
</ul>

<h3>Friends trips</h3>
<ul>
  <li>Prioritise <strong>evening options</strong> and <strong>room setup</strong> (space matters).</li>
</ul>

<p>Internal read: <a href="/guide/family-stays-in-turkey-what-to-check">Family Stays in Turkey: What to Check</a>.</p>

<hr/>

<h2>Step 7: Avoid hidden costs (UK traveller quick scan)</h2>
<ul>
  <li><strong>Transfers:</strong> check if included, and how long they take</li>
  <li><strong>À la carte:</strong> is it included or extra?</li>
  <li><strong>Beach extras:</strong> are sunbeds/towels included?</li>
  <li><strong>Room upgrades:</strong> what does “sea view” really mean?</li>
</ul>

<hr/>

<h2>The “no-regrets” mini checklist (copy-paste)</h2>
<ul>
  <li>Our base area matches our trip style (calm/lively, walkable/resort)</li>
  <li>Our board basis matches how we like to holiday</li>
  <li>We checked what “beachfront/private beach” actually means</li>
  <li>We protected sleep by choosing a sensible room position</li>
  <li>We checked what’s included vs extra (so the budget stays predictable)</li>
</ul>

<hr/>

<h2>FAQs</h2>

<h3>What’s the most important thing when choosing a hotel in Turkey from the UK?</h3>
<p>Base area and vibe. If your base and vibe match your trip, everything else becomes easier.</p>

<h3>Is all inclusive worth it in Turkey for UK travellers?</h3>
<p>It’s worth it if you want predictable costs and low-effort days. If you love exploring and eating out, B&amp;B or half board can feel better.</p>

<h3>How do I avoid noisy rooms in Turkey hotels?</h3>
<p>Choose your base carefully, then request a quieter room position (away from entertainment zones and busy strips). Use our dedicated sleep guide for a practical checklist.</p>

<p><em>Last updated:</em> ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
`
};

async function run() {
    const timestamp = Date.now();
    console.log("🚀 Starting Hotel Choice Article Automation...");

    // SAFE PROMPTS for Authentic Feel
    const imagesToGenerate = [
        {
            placeholder: '<!-- IMAGE_COVER_PLACEHOLDER -->',
            filename: `turkey-hotel-balcony-sea-view-authentic-${timestamp}.jpg`,
            prompt: "View from a hotel balcony in Turkey looking out to the Aegean Sea. Comfortable chair, possibly a book or drink. Authentic, relaxed holiday vibe. Realistic travel photo."
        },
        {
            placeholder: '<!-- IMAGE_RESORT_PLACEHOLDER -->',
            filename: `turkey-hotel-pool-relaxing-authentic-${timestamp}.jpg`,
            prompt: "A relaxing hotel pool area in Turkey. Sunbeds, umbrellas, greenery. Calm atmosphere, not crowded. Authentic travel photography. Realistic bright day."
        },
        {
            placeholder: '<!-- IMAGE_BOUTIQUE_PLACEHOLDER -->',
            filename: `turkey-boutique-hotel-courtyard-authentic-${timestamp}.jpg`,
            prompt: "A charming boutique hotel courtyard in Turkey. Stone walls, bougainvillea flowers, small breakfast tables. Authentic and cozy atmosphere. Realistic."
        },
        {
            placeholder: '<!-- IMAGE_ROOM_PLACEHOLDER -->', // Note: I didn't put a placeholder for this in content, but keeping it in array for now in case I want to add it or just have it handy. Actually, let's remove it if unused to save quota, or add placeholder. I will stick to 3 images to be efficient as per previous patterns often using 3-4.
            // Let's add one more relevant one.
            filename: `turkey-hotel-breakfast-view-${timestamp}.jpg`,
            prompt: "A Turkish hotel breakfast spread with a view. Tea, olives, cheese, bread. Authentic and delicious. Realistic travel lifestyle photo."
        }
    ];

    // Logic to only process images that are actually in content? 
    // The script below processes all in array. I should ensure placeholders exist or remove unused ones.
    // I only added COVER, RESORT, BOUTIQUE placeholders in the content above. 
    // I'll stick to those 3 to match the content structure and save time/quota.

    const activeImages = imagesToGenerate.filter(img =>
        img.placeholder === '<!-- IMAGE_COVER_PLACEHOLDER -->' ||
        img.placeholder === '<!-- IMAGE_RESORT_PLACEHOLDER -->' ||
        img.placeholder === '<!-- IMAGE_BOUTIQUE_PLACEHOLDER -->'
    );

    let finalContent = ARTICLE_DATA.content;
    let coverImageUrl = '';

    for (const item of activeImages) {
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
        title: { en: ARTICLE_DATA.title, tr: "Türkiye'de Otel Seçimi Nasıl Yapılır? (TR Pasif)" },
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
        console.log("✅ Hotel Choice Article Added Successfully!");
        console.log("👉 Slug:", ARTICLE_DATA.slug);
    }
}

run();
