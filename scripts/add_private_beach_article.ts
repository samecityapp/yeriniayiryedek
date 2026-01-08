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
    slug: 'private-beach-in-turkey-usually-includes-extras-uk-travellers-miss',
    title: 'Private Beach in Turkey: What It Usually Includes (and the Extras UK Travellers Miss)',
    meta_description: '“Private beach” in Turkey isn’t always the same thing. Learn what’s typically included (sunbeds, towels, snacks), what may cost extra, and how UK travellers can check before booking. No hotel names.',
    primary_keyword: 'private beach in Turkey',
    content: `<p><strong>Quick answer:</strong> In Turkey, “private beach” usually means the hotel has a <strong>designated beach area</strong> reserved for its guests (not a fully “closed” public beach in the UK sense). What’s included varies: <strong>sunbeds/umbrellas</strong> are often included, <strong>towels</strong> may be included or require a deposit, and <strong>food/drinks</strong> can be fully included (some all-inclusive setups) or charged separately (especially if the beach area operates more like a beach club).</p>

<p>This guide is for UK travellers who want a smooth beach day without unexpected add-ons. We’ll keep it simple and practical, with a checklist you can use in minutes.</p>

<p>Internal reads (placeholders):
<a href="/guide/what-beachfront-means-in-turkey-how-to-check-uk-guide">What “Beachfront” Means in Turkey</a> •
<a href="/guide/all-inclusive-in-turkey-explained-uk-guide">All-Inclusive in Turkey Explained</a> •
<a href="/guide/cash-or-card-in-turkey-uk-guide">Cash or Card in Turkey? (UK Guide)</a> •
<a href="/guide/tipping-in-turkey-uk-guide">Tipping in Turkey (UK-Friendly)</a>
</p>

<!-- IMAGE_COVER_PLACEHOLDER -->

<hr/>

<h2>What “private beach” usually means (UK-friendly definition)</h2>
<p>In most Turkey holiday regions, beaches are public by nature, but hotels can operate a <strong>private section</strong> with their own sunbeds, umbrellas, staff, and sometimes a beach bar. So “private” often means:</p>

<ul>
  <li><strong>Reserved sunbed area</strong> for hotel guests</li>
  <li><strong>Hotel-managed setup</strong> (umbrellas, beach staff, sometimes service)</li>
  <li><strong>Controlled access</strong> in practice (usually via wristband/card/guest check)</li>
</ul>

<p><strong>Simple rule:</strong> Think “private section” rather than “a beach nobody else can ever step onto”.</p>

<hr/>

<h2>What’s typically included (and what isn’t)</h2>

<h3>Usually included</h3>
<ul>
  <li><strong>Sunbeds + umbrellas</strong> (often included for guests)</li>
  <li><strong>Basic beach facilities</strong> (showers/changing areas) depending on setup</li>
  <li><strong>Access</strong> (you won’t pay an entry fee as a hotel guest in many setups)</li>
</ul>

<h3>Sometimes included (depends on the hotel/board basis)</h3>
<ul>
  <li><strong>Beach towels</strong> (may be free, deposit-based, or limited exchange)</li>
  <li><strong>Water + soft drinks</strong> (commonly included in all-inclusive setups)</li>
  <li><strong>Snacks</strong> (can be included, time-limited, or extra)</li>
</ul>

<!-- IMAGE_SETUP_PLACEHOLDER -->

<h3>Often extra / where surprises happen</h3>
<ul>
  <li><strong>À la carte food</strong> on the beach (especially in “beach club style” setups)</li>
  <li><strong>Premium drinks</strong> (even when some drinks are included)</li>
  <li><strong>Front-row sunbed upgrades</strong> (cabana, “VIP bed”, special zones)</li>
  <li><strong>Water sports</strong> (usually separate operators and separate fees)</li>
</ul>

<p><strong>UK-friendly tip:</strong> If your holiday budget depends on “we won’t spend much during the day”, you must confirm the food/drink setup on the private beach.</p>

<hr/>

<h2>The UK traveller “no surprise” checklist (5-minute check)</h2>
<p>Ask or verify these before booking. You’re not being picky — you’re protecting your budget and your day-to-day comfort.</p>

<ul>
  <li><strong>1) Sunbeds:</strong> Included for guests? Any “premium” paid zones?</li>
  <li><strong>2) Towels:</strong> Free? Deposit? Limits on exchanges?</li>
  <li><strong>3) Drinks:</strong> Included on the beach, or only at the main bar?</li>
  <li><strong>4) Snacks/lunch:</strong> Included? Where? At what times?</li>
  <li><strong>5) Shade:</strong> Is there enough shade in peak summer?</li>
  <li><strong>6) Beach type:</strong> Sand / pebble / platform (affects comfort and shoes)</li>
  <li><strong>7) Access route:</strong> Direct / across a road / shuttle (affects the “friction”)</li>
</ul>

<p>Pair this with: <a href="/guide/what-beachfront-means-in-turkey-how-to-check-uk-guide">Beachfront Meaning Guide</a>.</p>

<hr/>

<h2>Private beach vs beach club: the difference UK travellers should know</h2>
<p>This matters because it changes your daily spending.</p>

<h3>Private beach (hotel-managed section)</h3>
<ul>
  <li>Designed for hotel guests</li>
  <li>Often includes sunbeds and basic setup</li>
  <li>Food/drinks depend on board basis</li>
</ul>

<h3>Beach club style (even if attached to a hotel)</h3>
<ul>
  <li>Feels like a venue with a menu and paid extras</li>
  <li>Can include minimum spend, premium beds, or paid zones</li>
  <li>More “day out” vibe than “included beach day”</li>
</ul>

<!-- IMAGE_BEACH_CLUB_PLACEHOLDER -->

<p><strong>Simple rule:</strong> If it looks like a venue, expect venue-style extras unless clearly stated otherwise.</p>

<hr/>

<h2>Best private beach setup by traveller type (UK-friendly)</h2>

<h3>Families</h3>
<ul>
  <li>Prioritise <strong>shade</strong>, <strong>sand</strong> if possible, and <strong>included snacks/drinks</strong>.</li>
  <li>Minimise friction: the easiest family beach day is “walk out and everything is there”.</li>
</ul>

<h3>Couples</h3>
<ul>
  <li>Scenic pebble/platform beaches can be perfect if you mostly want swimming and views.</li>
  <li>Beach club style can be fun — just budget for it.</li>
</ul>

<h3>Friends trips</h3>
<ul>
  <li>Decide if you want a <strong>budget-controlled day</strong> (included setup) or a <strong>beach club day</strong> (spend-heavy but fun).</li>
</ul>

<hr/>

<h2>How to keep costs predictable (UK traveller budgeting)</h2>
<ul>
  <li>If you’re all-inclusive, confirm whether beach bar/snacks are included.</li>
  <li>Assume premium beds and water sports are extra unless clearly included.</li>
  <li>Carry a small “beach extras” buffer in your budget (it protects the holiday mood).</li>
</ul>

<hr/>

<h2>FAQs</h2>

<h3>Does “private beach” in Turkey mean the beach is closed to the public?</h3>
<p>Usually it means a hotel-managed section reserved for guests rather than a fully closed public beach. Access control is often practical (wristbands/guest checks).</p>

<h3>Are sunbeds free on private beaches in Turkey?</h3>
<p>Often yes for hotel guests, but some setups have premium paid zones or cabanas. Always check.</p>

<h3>Are food and drinks included on a private beach?</h3>
<p>Sometimes. In all-inclusive setups they may be included, but in beach club style setups many items can be extra. Verify before you book.</p>

<p><em>Last updated:</em> ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
`
};

async function run() {
    const timestamp = Date.now();
    console.log("🚀 Starting Private Beach Article Automation...");

    // SAFE PROMPTS for Authentic Feel
    const imagesToGenerate = [
        {
            placeholder: '<!-- IMAGE_COVER_PLACEHOLDER -->',
            filename: `turkey-private-beach-setup-authentic-${timestamp}.jpg`,
            prompt: "A well-organized private beach area in Turkey. Rows of sunbeds with identical umbrellas. Clean sand or pebbles. Clear blue sea. Authentic travel photography. Realistic sunny day."
        },
        {
            placeholder: '<!-- IMAGE_SETUP_PLACEHOLDER -->',
            filename: `turkey-beach-towel-sunbed-detail-${timestamp}.jpg`,
            prompt: "Close up detail of a sunbed on a Turkish beach with a rolled towel and a refreshing drink. Authentic relaxing holiday vibe. Focused and realistic."
        },
        {
            placeholder: '<!-- IMAGE_BEACH_CLUB_PLACEHOLDER -->',
            filename: `turkey-beach-club-style-authentic-${timestamp}.jpg`,
            prompt: "A stylish beach club area in Turkey with comfortable lounge seating and a wooden deck. People relaxing. Authentic Aegean summer vibe. Realistic."
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
    // Note: internal link placeholders were manually replaced in the content above with mostly logical guesses or previous paths. 
    // User didn't strictly provide slugs for 'money-cash-or-card', 'turkey-tipping-guide', so I mapped them to likely 'uk-guide' slugs or standard ones.
    // If they don't exist yet, they will be 404s but that is expected if those articles aren't added yet. 
    // The user only provided these 4 new articles in this session.

    const { error } = await supabase.from('articles').upsert({
        slug: ARTICLE_DATA.slug,
        title: { en: ARTICLE_DATA.title, tr: "Türkiye'de Özel Plaj Ne Demek? (TR Pasif)" },
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
        console.log("✅ Private Beach Article Added Successfully!");
        console.log("👉 Slug:", ARTICLE_DATA.slug);
    }
}

run();
