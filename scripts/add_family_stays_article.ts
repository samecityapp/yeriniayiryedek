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
    slug: 'family-stays-in-turkey-what-uk-parents-should-check',
    title: 'Family Stays in Turkey: What UK Parents Should Check (Pools, Food, Shade & Kids Clubs)',
    meta_description: 'Booking a family hotel in Turkey from the UK? Use this practical checklist to choose the right setup—pools, shade, beach type, food rhythm, kids clubs, room layout and sleep tips. No hotel names.',
    primary_keyword: 'family stays in Turkey',
    content: `<p><strong>Quick answer:</strong> For UK families, the best stay is the one that makes the <strong>daily routine easy</strong>: shade at the right hours, kid-friendly pools, simple food options, a beach setup that matches your children’s age, and a room layout that protects sleep. If you get those right, the holiday feels effortless.</p>

<p>This guide is written for UK parents booking Turkey and wanting a smooth holiday — not a constant “where’s the next snack / shade / nap” mission.</p>

<p>Internal reads (placeholders):
<a href="/guide/all-inclusive-in-turkey-explained-uk-guide">All-Inclusive in Turkey Explained</a> •
<a href="/guide/what-beachfront-means-in-turkey-how-to-check-uk-guide">What “Beachfront” Means in Turkey</a> •
<a href="/guide/private-beach-in-turkey-usually-includes-extras-uk-travellers-miss">Private Beach: What’s Included</a> •
<a href="/guide/quiet-sleep-in-turkey-avoid-noisy-rooms">Quiet Sleep in Turkey (Family Edition)</a> •
<a href="/guide/turkey-with-kids-itinerary-7-days">Turkey With Kids: 7-Day Low-Stress Itinerary</a>
</p>

<!-- IMAGE_COVER_PLACEHOLDER -->

<hr/>

<h2>The UK family method: choose based on the daily routine</h2>
<p>Family holidays are won on the boring stuff: shade, snacks, naps, and how easy it is to get from room → pool → food → room again.</p>

<p><strong>So choose in this order:</strong></p>
<ol>
  <li><strong>Base area</strong> (heat, beach type, transport)</li>
  <li><strong>Resort vs apartment style</strong> (how managed you want life to be)</li>
  <li><strong>Pools + shade setup</strong> (daily comfort)</li>
  <li><strong>Food rhythm</strong> (how easy meals/snacks are)</li>
  <li><strong>Room layout + sleep protection</strong></li>
  <li><strong>Kids club / activities</strong> (if you’ll use them)</li>
</ol>

<hr/>

<h2>Family checklist: what to verify before booking (UK-friendly)</h2>

<h3>1) Pool setup (the biggest daily impact)</h3>
<ul>
  <li><strong>Kids’ pool:</strong> is there a shallow pool suitable for your child’s age?</li>
  <li><strong>Water slides:</strong> great if your kids love them, but check if that means a louder pool zone.</li>
  <li><strong>Shade near pools:</strong> this is a hidden deal-breaker in summer.</li>
  <li><strong>Pool hours:</strong> can you do an early swim and a late swim?</li>
</ul>

<!-- IMAGE_POOL_PLACEHOLDER -->

<p><strong>UK-parent tip:</strong> A brilliant pool with no shade can still become stressful. Shade is a feature, not a bonus.</p>

<hr/>

<h3>2) Beach reality (sand vs pebble vs platform)</h3>
<p>For families, “beachfront” isn’t the question — <strong>beach type</strong> is.</p>
<ul>
  <li><strong>Sand:</strong> easiest for toddlers and classic beach days.</li>
  <li><strong>Pebble:</strong> can be beautiful; many families prefer swim shoes.</li>
  <li><strong>Platform:</strong> great for swimming; less ideal for small kids who want to play on sand.</li>
</ul>

<p>Read: <a href="/guide/what-beachfront-means-in-turkey-how-to-check-uk-guide">What “Beachfront” Means in Turkey</a>.</p>

<hr/>

<h3>3) Shade and heat strategy (this protects the mood)</h3>
<ul>
  <li>Is there <strong>natural shade</strong> (trees/covered areas) or only umbrellas?</li>
  <li>Are there <strong>indoor cool zones</strong> you can use mid-day?</li>
  <li>Is the walk from room to pool/beach in full sun?</li>
</ul>

<p><strong>Simple rule:</strong> If shade is weak, the whole holiday becomes harder between late morning and mid-afternoon.</p>

<hr/>

<h3>4) Food rhythm (snacks matter more than you think)</h3>
<ul>
  <li><strong>Meal times:</strong> do they match your family routine?</li>
  <li><strong>Snack options:</strong> is there easy access to snacks and drinks during the day?</li>
  <li><strong>Kid-friendly basics:</strong> can your child reliably eat something simple?</li>
  <li><strong>All-inclusive clarity:</strong> what’s included vs what’s extra?</li>
</ul>

<!-- IMAGE_FOOD_PLACEHOLDER -->

<p>Read: <a href="/guide/all-inclusive-in-turkey-explained-uk-guide">All-Inclusive in Turkey Explained</a>.</p>

<hr/>

<h3>5) Room layout (the sleep-protection checklist)</h3>
<p>Family holidays can collapse if sleep collapses. Before booking, think like this:</p>
<ul>
  <li><strong>Space:</strong> will you feel cramped at bedtime?</li>
  <li><strong>Separation:</strong> is there any separation between adult downtime and kids’ sleep?</li>
  <li><strong>Noise risk:</strong> avoid rooms near evening entertainment if your kids sleep early.</li>
  <li><strong>Cooling:</strong> confirm good air con comfort (summer matters).</li>
</ul>

<p>Read: <a href="/guide/quiet-sleep-in-turkey-avoid-noisy-rooms">Quiet Sleep in Turkey</a>.</p>

<hr/>

<h3>6) Kids club and activities (only if you’ll actually use them)</h3>
<ul>
  <li><strong>Age range:</strong> is it suitable for your child’s age?</li>
  <li><strong>Schedule:</strong> does it run at times you’ll use (not just “exists”)?</li>
  <li><strong>Language:</strong> will your child feel comfortable?</li>
  <li><strong>Evening mini-disco / activities:</strong> fun for some families, too much for others — choose your vibe.</li>
</ul>

<!-- IMAGE_KIDS_CLUB_PLACEHOLDER -->

<p><strong>UK-parent tip:</strong> A “kids club” label is not enough. The schedule and vibe matter more.</p>

<hr/>

<h3>7) Stroller / buggy reality (hidden friction)</h3>
<ul>
  <li>Are there lots of <strong>steps</strong> between room, pool and beach?</li>
  <li>Is the base spread out (long walks in heat)?</li>
  <li>Is the surface stroller-friendly?</li>
</ul>

<hr/>

<h3>8) Transfers and travel day stress</h3>
<ul>
  <li>How long is the transfer from the airport to your base area?</li>
  <li>Will arrival time land in “overtired chaos” hours?</li>
  <li>Is there easy access to food/drinks on arrival?</li>
</ul>

<p><strong>Simple rule:</strong> The easiest family holidays are the ones with a manageable travel day.</p>

<hr/>

<h2>Best accommodation type for UK families (quick guide)</h2>

<h3>All-inclusive resort (most common choice)</h3>
<ul>
  <li><strong>Best for:</strong> predictable costs, zero planning</li>
  <li><strong>Watch-outs:</strong> make sure vibe isn’t too loud for early sleepers</li>
</ul>

<h3>Aparthotel / apartment-style</h3>
<ul>
  <li><strong>Best for:</strong> space, flexible meals, calmer routine</li>
  <li><strong>Watch-outs:</strong> you’ll self-manage food and daily rhythm more</li>
</ul>

<hr/>

<h2>The “no-regrets” family mini checklist (copy-paste)</h2>
<ul>
  <li>There is reliable <strong>shade</strong> where we’ll spend the day</li>
  <li>Pool setup fits our kids’ ages</li>
  <li>Beach type matches our family (sand/pebble/platform)</li>
  <li>Food and snacks are easy at the times we need them</li>
  <li>Room layout protects sleep (and we avoided noisy zones)</li>
  <li>Transfer time works for our travel day energy</li>
</ul>

<hr/>

<h2>Common mistakes (framed positively)</h2>
<ul>
  <li><strong>Choosing based only on star rating:</strong> family comfort is about shade, food rhythm, and pool setup.</li>
  <li><strong>Ignoring beach type:</strong> sand vs pebble vs platform changes the day.</li>
  <li><strong>Not protecting sleep:</strong> room position matters more than people realise.</li>
</ul>

<hr/>

<h2>FAQs</h2>

<h3>Is Turkey good for family holidays from the UK?</h3>
<p>Yes — it can be excellent, especially when you choose a base and accommodation that makes daily life easy: shade, pools, and predictable food options.</p>

<h3>What should UK parents prioritise when booking a family stay in Turkey?</h3>
<p>Shade, pool setup, beach type, food/snack rhythm, and room layout for sleep.</p>

<h3>Is all-inclusive worth it for families in Turkey?</h3>
<p>Often yes, because it simplifies meals and costs. Just choose the right vibe and protect sleep with room position.</p>

<p><em>Last updated:</em> ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
`
};

async function run() {
    const timestamp = Date.now();
    console.log("🚀 Starting Family Stays Article Automation...");

    // SAFE PROMPTS for Authentic Feel
    const imagesToGenerate = [
        {
            placeholder: '<!-- IMAGE_COVER_PLACEHOLDER -->',
            filename: `turkey-family-hotel-pool-authentic-${timestamp}.jpg`,
            prompt: "A relaxed family-friendly hotel pool in Turkey. Clear blue water, lots of shade from trees or umbrellas. Parents watching kids play. Bright sunny day. Authentic travel photography. Realistic."
        },
        {
            placeholder: '<!-- IMAGE_POOL_PLACEHOLDER -->',
            filename: `turkey-kids-shallow-pool-shade-${timestamp}.jpg`,
            prompt: "A shallow swimming pool for children at a Turkish resort with plenty of shade. Safe and fun environment. Authentic holiday vibe. Realistic."
        },
        {
            placeholder: '<!-- IMAGE_FOOD_PLACEHOLDER -->',
            filename: `turkey-family-snack-time-authentic-${timestamp}.jpg`,
            prompt: "Family eating a casual snack at a shaded outdoor table in a Turkish hotel. Fruit and simple food. Happy relaxed atmosphere. Authentic travel photography. Realistic."
        },
        {
            placeholder: '<!-- IMAGE_KIDS_CLUB_PLACEHOLDER -->',
            filename: `turkey-kids-club-outdoor-play-area-${timestamp}.jpg`,
            prompt: "An outdoor play area at a hotel kids club in Turkey. Colorful slides or swings on grass. Safe and shaded. Authentic travel photography. Realistic."
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
        title: { en: ARTICLE_DATA.title, tr: "Türkiye'de Aile Tatili: Ebeveynler İçin Kontrol Listesi (TR Pasif)" },
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
        console.log("✅ Family Stays Article Added Successfully!");
        console.log("👉 Slug:", ARTICLE_DATA.slug);
    }
}

run();
