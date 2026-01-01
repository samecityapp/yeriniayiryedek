import { createClient } from '@supabase/supabase-js';
import Replicate from 'replicate';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import https from 'https';

dotenv.config({ path: '.env.local' });

// --- Configuration ---
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const replicateToken = process.env.REPLICATE_API_TOKEN;

if (!supabaseUrl || !supabaseKey || !replicateToken) {
    console.error('Missing environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const replicate = new Replicate({ auth: replicateToken });

const ARTICLES_IMAGE_DIR = path.join(process.cwd(), 'public', 'images', 'articles');
if (!fs.existsSync(ARTICLES_IMAGE_DIR)) {
    fs.mkdirSync(ARTICLES_IMAGE_DIR, { recursive: true });
}

// Download helper
async function downloadImage(url: string, filepath: string): Promise<void> {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            if (res.statusCode !== 200) {
                reject(new Error(`Failed to download: ${res.statusCode}`));
                return;
            }
            const fileStream = fs.createWriteStream(filepath);
            res.pipe(fileStream);
            fileStream.on('finish', () => { fileStream.close(); resolve(); });
            fileStream.on('error', (err) => { fs.unlink(filepath, () => { }); reject(err); });
        }).on('error', (err) => { fs.unlink(filepath, () => { }); reject(err); });
    });
}

// Flux Generation Helper
async function generateFluxImage(prompt: string, filename: string): Promise<string | null> {
    console.log(`Generating image for: ${filename}`);
    console.log(`Prompt: ${prompt}`);

    try {
        const output = await replicate.run("black-forest-labs/flux-1.1-pro", {
            input: {
                prompt: prompt,
                aspect_ratio: "16:9",
                output_format: "jpg",
                safety_tolerance: 2,
            },
        });

        let imageUrl = '';
        if (typeof output === 'string') imageUrl = output;
        else if (Array.isArray(output) && output.length > 0) imageUrl = output[0];
        else imageUrl = String(output);

        if (!imageUrl.startsWith('http')) throw new Error('Invalid output URL');

        const localPath = path.join(ARTICLES_IMAGE_DIR, filename);
        const publicUrl = `/images/articles/${filename}`;

        await downloadImage(imageUrl, localPath);
        console.log(`Saved: ${localPath}`);
        return publicUrl;
    } catch (err) {
        console.error(`Failed to generate ${filename}:`, err);
        return null;
    }
}

const articleData = {
    slug: 'where-to-stay-in-turkey-first-time-guide',
    title: {
        tr: 'Türkiye\'de Nerede Kalınır: İlk Kez Gelecekler İçin Rehber', // Placeholder translation
        en: 'Where to Stay in Turkey: UK First-Timer Area Guide'
    },
    meta_description: {
        tr: 'İngiliz gezginler için Türkiye\'de konaklama rehberi. Bölge karşılaştırmaları, bütçe ipuçları ve sıkça sorulan sorular.', // Placeholder
        en: 'Choose the best place to stay in Turkey as a UK traveller. Compare regions by vibe, budget and style, plus mistakes to avoid and FAQs.'
    },
    location: 'Turkey',
    content_raw: `
<h1>Where to Stay in Turkey for First-Time UK Travellers (Best Regions by Travel Style)</h1>

<p><strong>Quick answer:</strong> If it’s your first trip, choose one “base” that matches your holiday style. Pick <strong>Istanbul</strong> for a culture-heavy city break, <strong>the Antalya area</strong> for an easy beach holiday, <strong>the Dalaman coast (Fethiye area)</strong> for scenery and boat days, <strong>Bodrum</strong> for Aegean vibes and evenings out, or <strong>Cappadocia</strong> for the bucket-list landscapes. If you want a balanced first trip, the easiest combo is <strong>Istanbul + one coastal base</strong>.</p>

<p>Want the detailed area guides? Start here:
<a href="#">Where to Stay in Istanbul (Best Areas)</a>,
<a href="#">Where to Stay in Antalya</a>,
<a href="#">Where to Stay in Fethiye</a>,
<a href="#">Where to Stay in Bodrum</a>,
<a href="#">Where to Stay in Cappadocia</a>.
</p>

<!-- IMAGE_COVER_PLACEHOLDER -->

<h2>Why “where you stay” matters more than you think</h2>
<p>Turkey rewards good base choices. Pick the wrong area and you can end up spending your holiday stuck in traffic, relying on taxis, or feeling like you’re in the “right region” but the <em>wrong vibe</em>. Pick the right area and everything feels easy: food spots are nearby, beach days are effortless, and day trips make sense.</p>

<h2>A simple 60-second method to choose your base</h2>
<p>Answer these four questions honestly. Most first-timers make the decision harder than it needs to be.</p>
<ul>
  <li><strong>What’s the main goal?</strong> Culture, beach, relaxation, scenery, nightlife, or a mix.</li>
  <li><strong>Do you want “easy mode” or “explore mode”?</strong> Resorts are easy mode. Smaller towns and coasts are explore mode.</li>
  <li><strong>How do you feel about heat and crowds?</strong> Peak summer is a different holiday than spring/autumn.</li>
  <li><strong>One base or two?</strong> For first-timers, one base is the calmest. Two bases works if they’re logically paired (e.g., Istanbul + coast, or Istanbul + Cappadocia).</li>
</ul>

<h2>Turkey at a glance: pick a region by travel style</h2>
<table>
  <thead>
    <tr>
      <th>What you want</th>
      <th>Best base region</th>
      <th>Why it suits UK travellers</th>
      <th>Watch-outs</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Culture + food + iconic sights</td>
      <td>Istanbul</td>
      <td>Perfect city break energy; easy to fill 3–5 days</td>
      <td>Traffic; “central” is a trap—choose the right area instead</td>
    </tr>
    <tr>
      <td>Easy beach holiday (minimal planning)</td>
      <td>Antalya area</td>
      <td>Convenient beach days, simple transfers, lots of facilities</td>
      <td>Some areas feel resort-focused; choose based on vibe</td>
    </tr>
    <tr>
      <td>Scenery + bays + boat day</td>
      <td>Dalaman coast (Fethiye area)</td>
      <td>Relaxed pace with variety; great for couples and explorers</td>
      <td>Without a plan, you can waste time choosing day trips</td>
    </tr>
    <tr>
      <td>Aegean style + evenings out</td>
      <td>Bodrum</td>
      <td>Great mix of beach, town life and nightlife (by area)</td>
      <td>Area choice matters a lot; some spots are lively late</td>
    </tr>
    <tr>
      <td>Bucket-list landscapes</td>
      <td>Cappadocia</td>
      <td>Unique, memorable, totally different from the coast</td>
      <td>Not a beach trip; plan early mornings and short distances</td>
    </tr>
    <tr>
      <td>Families with kids</td>
      <td>Antalya area</td>
      <td>Facilities-heavy holiday; easiest logistics</td>
      <td>Heat management in summer; prioritise shade/pools</td>
    </tr>
  </tbody>
</table>

<h2>Istanbul: best for a first-time culture hit</h2>
<!-- IMAGE_ISTANBUL_PLACEHOLDER -->
<p>If your “Turkey” dream includes skyline views, historic sights and eating well, Istanbul is the strongest first base. The mistake UK travellers make is trying to be “close to everything”. Istanbul doesn’t work like that. It works when you choose an area with the right vibe and transport options, then build your days around it.</p>

<ul>
  <li><strong>Choose Istanbul if:</strong> you want a proper city break, neighbourhood cafés, museums, markets and late dinners.</li>
  <li><strong>Keep it short if:</strong> you only want sun-and-pool days and you get tired of big-city energy quickly.</li>
  <li><strong>First-timer move:</strong> do <strong>one major area per day</strong> instead of zig-zagging across the city.</li>
</ul>

<p>To choose the right neighbourhood, use:
<a href="#">Where to Stay in Istanbul (Best Areas)</a>.
If you’re deciding airports, read:
<a href="#">IST vs SAW: Which Istanbul Airport?</a>.
</p>

<h3>UK-friendly Istanbul stay tips (no stress version)</h3>
<ul>
  <li><strong>Walkability beats “central”.</strong> Being able to walk to breakfast and a few evening spots matters more than shaving 10 minutes off a taxi.</li>
  <li><strong>Noise is real.</strong> If sleep is important, avoid streets known for late-night venues and choose accommodation with good soundproofing or quieter side streets.</li>
  <li><strong>Don’t over-plan.</strong> Istanbul rewards wandering. Leave space for neighbourhood time.</li>
</ul>

<h2>Antalya area: easiest beach holiday for UK travellers</h2>
<!-- IMAGE_ANTALYA_PLACEHOLDER -->
<p>If you want a straightforward beach holiday—especially if you’re travelling with family—the Antalya area is often the simplest option. The key is choosing an area that matches your pace: some parts are designed for “everything on-site”, while others suit travellers who want more local movement.</p>

<ul>
  <li><strong>Choose Antalya area if:</strong> you want convenience, beaches, pools, and minimal logistics.</li>
  <li><strong>Best for:</strong> families, first-time resort holidays, travellers who want to switch off.</li>
  <li><strong>Good to know:</strong> “the Antalya area” includes different styles of stay—your experience depends on the exact base.</li>
</ul>

<p>Pick the right base area here:
<a href="#">Where to Stay in Antalya</a>.
</p>

<h3>How to pick the right Antalya base (quick checklist)</h3>
<ul>
  <li><strong>Beach type:</strong> do you want a beach you can walk to easily, or are you happy with short rides?</li>
  <li><strong>Evenings:</strong> calm resort evenings vs restaurants and a bit of atmosphere.</li>
  <li><strong>Day trips:</strong> if you plan excursions, choose a base that makes them straightforward.</li>
</ul>

<h2>Dalaman coast (Fethiye area): scenery, bays and a relaxed rhythm</h2>
<!-- IMAGE_FETHIYE_PLACEHOLDER -->
<p>This is a brilliant first-timer choice if you want coastal Turkey with variety. The Fethiye area gives you a mix of beaches, viewpoints, bays, and easy excursions—without the feeling that you must stay “inside the resort bubble”. It’s ideal for UK travellers who like a holiday with a bit of exploring.</p>

<ul>
  <li><strong>Choose this region if:</strong> you want scenery, a calmer pace, and the option for boat days or beach-hopping.</li>
  <li><strong>Best for:</strong> couples, friends trips, and travellers who like a flexible plan.</li>
  <li><strong>Good to know:</strong> different bases suit different vibes—choose the base first, then decide day trips.</li>
</ul>

<p>Choose your base with:
<a href="#">Where to Stay in Fethiye</a>.
</p>

<h3>What UK travellers tend to love here</h3>
<ul>
  <li><strong>Mix-and-match days:</strong> beach day, then boat day, then a viewpoint day—without changing accommodation.</li>
  <li><strong>Relaxed evenings:</strong> many spots are calmer than full-on party destinations.</li>
</ul>

<h2>Bodrum: Aegean vibes, beaches and evenings out</h2>
<p>Bodrum can feel more “Aegean” in style—think lively evenings, beach clubs in some areas, and quieter, view-focused corners in others. It works extremely well for first-timers if you choose your base based on your nightlife tolerance.</p>

<ul>
  <li><strong>Choose Bodrum if:</strong> you want beach time plus a bit of atmosphere at night.</li>
  <li><strong>Best for:</strong> couples, groups of friends, travellers who like a stylish feel.</li>
  <li><strong>Good to know:</strong> the wrong area can feel too loud (or too quiet). Decide your vibe first.</li>
</ul>

<p>Use:
<a href="#">Where to Stay in Bodrum</a>
to choose the right base.</p>

<h2>Cappadocia: the bucket-list landscapes (not a beach add-on)</h2>
<!-- IMAGE_CAPPADOCIA_PLACEHOLDER -->
<p>Cappadocia is the “wow” region: unusual landscapes, early mornings, and a totally different side of Turkey. But it’s not a beach destination and it shouldn’t be squeezed into a rushed schedule. First-timers enjoy it most when they treat it as its own base and keep their days simple.</p>

<ul>
  <li><strong>Choose Cappadocia if:</strong> you want a unique, memorable experience beyond the coast.</li>
  <li><strong>Best for:</strong> couples, photographers, first-timers who want a standout highlight.</li>
  <li><strong>Good to know:</strong> choose a base town/area that reduces commuting between activities.</li>
</ul>

<p>Start here:
<a href="#">Where to Stay in Cappadocia</a>.
</p>

<h2>The best first-timer plan: 1 base vs 2 bases</h2>
<h3>Option A: One base (simplest)</h3>
<p>Pick one region and do it properly. This is the least stressful plan and works well if you have a shorter holiday or you want maximum relaxation.</p>

<h3>Option B: Two bases (best balance)</h3>
<ul>
  <li><strong>Istanbul + one coastal base</strong> (Antalya area / Fethiye area / Bodrum) — culture + relax.</li>
  <li><strong>Istanbul + Cappadocia</strong> — a more “bucket list” style trip with less beach focus.</li>
</ul>

<p>For season planning, use:
<a href="#">Best Time to Visit Turkey (Month-by-Month)</a>.
</p>

<h2>How to choose the right area within a region (this is where people mess up)</h2>
<p>Once you pick a region, the real decision is the <strong>area</strong>. Two places in the same region can feel like totally different holidays.</p>

<ul>
  <li><strong>Walkable vs drive/taxi-based:</strong> Do you want to stroll to dinner, or are you fine relying on transport?</li>
  <li><strong>Quiet vs lively:</strong> If you sleep lightly, prioritise quieter areas and accommodation.</li>
  <li><strong>Beach access:</strong> “Beachfront” wording varies—confirm what access actually looks like.</li>
  <li><strong>Family needs:</strong> Shade, pools, and easy food options matter more than “influencer views”.</li>
</ul>

<h2>Booking checklist for UK travellers (copy/paste before you book)</h2>
<ul>
  <li><strong>Confirm the area name.</strong> Don’t just book “Turkey / Antalya / Bodrum” and hope for the best.</li>
  <li><strong>Check transfer reality.</strong> A place can look close on a map but feel far in real travel time.</li>
  <li><strong>Verify “beachfront”.</strong> Is it direct access, a short walk, or a shuttle? Clarify before paying.</li>
  <li><strong>Protect your sleep.</strong> If you want quiet nights, avoid known nightlife strips and pick quieter streets.</li>
  <li><strong>Plan payments.</strong> Decide how you’ll handle money and cards:
    <a href="#">Cash or Card in Turkey?</a>
  </li>
</ul>

<h2>Common first-timer mistakes (and the fixes)</h2>
<ul>
  <li><strong>Trying to do everything in one trip.</strong> Fix: choose one theme (city / coast / Cappadocia) and do it well.</li>
  <li><strong>Choosing by photos only.</strong> Fix: choose by area logistics first, aesthetics second.</li>
  <li><strong>Changing accommodation too often.</strong> Fix: pick a strong base and add day trips.</li>
  <li><strong>Ignoring season reality.</strong> Fix: plan your day around comfort (heat, crowds) and pick the right base style.</li>
  <li><strong>Over-optimising “central”.</strong> Fix: prioritise walkability and vibe over a pin on a map.</li>
</ul>

<h2>FAQs (UK travellers)</h2>

<h3>Is it better to start in Istanbul or go straight to the coast?</h3>
<p>Start in Istanbul if you want culture and iconic sights. Go straight to the coast if your priority is pure relaxation. If you have enough time, Istanbul + one coastal base is the easiest balanced plan.</p>

<h3>Which region is best for a first Turkey beach holiday from the UK?</h3>
<p>The Antalya area is typically the easiest “plug-and-play” option. If you want more scenery and variety, the Fethiye area on the Dalaman coast is a strong alternative.</p>

<h3>Is Cappadocia worth it on a first trip?</h3>
<p>Yes if you want a standout, unique landscape experience. Treat it as its own base rather than trying to squeeze it into a rushed schedule.</p>

<h3>How many bases should I do on my first Turkey holiday?</h3>
<p>One base is the calmest. Two bases can work very well if you keep the split logical (Istanbul + coast, or Istanbul + Cappadocia).</p>

<h3>How do I avoid booking the wrong area?</h3>
<p>Decide your non-negotiables first (quiet nights, walkability, beach access, family facilities). Then choose an area that matches those needs instead of trying to be “close to everything”.</p>

<h3>Do I need a car in Turkey?</h3>
<p>Not for a first trip. Many holidays work well with transfers, taxis and organised day trips. Hire a car only if you’re specifically planning a road trip-style itinerary.</p>

<h3>What’s the easiest way to plan the season and weather side?</h3>
<p>Use a month-by-month approach and match your base to your comfort level:
<a href="#">Best Time to Visit Turkey (Month-by-Month)</a>.</p>

<p><em>Last updated: ${new Date().toLocaleDateString('en-GB')}</em></p>
`
};

async function execute() {
    console.log('--- Adding Article & Generating Flux Images ---');

    // 1. Generate Images
    const timestamp = Date.now();

    // Define prompts
    const prompts = [
        {
            key: 'IMAGE_COVER_PLACEHOLDER',
            filename: `uk-guide-cover-${timestamp}.jpg`,
            prompt: "A cinematic, high-resolution collage or landscape showing the diversity of Turkey: Istanbul's historic skyline meeting the turquoise Mediterranean coast. Golden hour lighting, professional travel photography style, 4k detail, photorealistic."
        },
        {
            key: 'IMAGE_ISTANBUL_PLACEHOLDER',
            filename: `uk-guide-istanbul-${timestamp}.jpg`,
            prompt: "Istanbul skyline at sunset featuring Hagia Sophia minarets and the Bosphorus strait with ferries. Cinematic lighting, moody but vibrant, photorealistic, high resolution."
        },
        {
            key: 'IMAGE_ANTALYA_PLACEHOLDER',
            filename: `uk-guide-antalya-${timestamp}.jpg`,
            prompt: "Antalya Kaputas Beach or similar stunning turquoise beach in Turkey. Aerial view showing golden sand and clear blue water. Sunny day, summer vibes, high resolution, photorealistic."
        },
        {
            key: 'IMAGE_FETHIYE_PLACEHOLDER',
            filename: `uk-guide-fethiye-${timestamp}.jpg`,
            prompt: "Fethiye Oludeniz Blue Lagoon aerial view. Paragliders in the distant sky. Calm turquoise water, lush green mountains, nature travel photography style, photorealistic."
        },
        {
            key: 'IMAGE_CAPPADOCIA_PLACEHOLDER',
            filename: `uk-guide-cappadocia-${timestamp}.jpg`,
            prompt: "Cappadocia sunrise with dozens of hot air balloons floating over fairy chimneys. Magical soft morning light, surreal landscape, high resolution, professional photography."
        }
    ];

    let finalContent = articleData.content_raw;
    let coverImageUrl = '';

    for (const item of prompts) {
        const url = await generateFluxImage(item.prompt, item.filename);
        if (url) {
            if (item.key === 'IMAGE_COVER_PLACEHOLDER') {
                coverImageUrl = url;
                // Don't embed cover in content usually, or maybe at top? 
                // Logic: Replace placeholder with empty string if cover is used as metadata, 
                // OR embed it. For blog posts, usually cover is separate.
                // User asked to "add 5 images", usually imply inline.
                // I will embed it at the start AND set it as cover_image_url.
                finalContent = finalContent.replace('<!-- IMAGE_COVER_PLACEHOLDER -->', `<img src="${url}" alt="Turkey Travel Guide" class="w-full h-auto rounded-lg my-6 shadow-md" />`);
            } else {
                finalContent = finalContent.replace(`<!-- ${item.key} -->`, `<img src="${url}" alt="Turkey Travel Guide - ${item.filename}" class="w-full h-auto rounded-lg my-6 shadow-md" />`);
            }
        } else {
            console.warn(`Skipping generation for ${item.key}`);
        }
    }

    // 2. Prepare JSONs
    const titleJson = JSON.stringify(articleData.title);
    const descJson = JSON.stringify(articleData.meta_description);
    const contentJson = JSON.stringify({
        tr: "", // Empty for now
        en: finalContent
    });

    // 3. Upsert into Database
    const { data, error } = await supabase
        .from('articles')
        .upsert({
            slug: articleData.slug,
            title: titleJson,
            meta_description: descJson,
            content: contentJson,
            cover_image_url: coverImageUrl,
            location: articleData.location,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            is_published: true
        }, { onConflict: 'slug' })
        .select();

    if (error) {
        console.error('Database Error:', error);
    } else {
        console.log('✅ Article added successfully:', articleData.slug);
        console.log('Cover Image:', coverImageUrl);
    }
}

execute();
