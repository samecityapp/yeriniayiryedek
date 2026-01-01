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

async function downloadImage(url: string, filepath: string): Promise<void> {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            if (res.statusCode !== 200) { reject(new Error(`Failed to download: ${res.statusCode}`)); return; }
            const fileStream = fs.createWriteStream(filepath);
            res.pipe(fileStream);
            fileStream.on('finish', () => { fileStream.close(); resolve(); });
            fileStream.on('error', reject);
        }).on('error', reject);
    });
}

// Realistic Flux Generation
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
    slug: 'where-to-stay-in-istanbul-best-areas-guide',
    title: {
        tr: 'İstanbul\'da Nerede Kalınır: İngiliz Turistler İçin En İyi Bölgeler',
        en: 'Where to Stay in Istanbul: Best Areas for UK Tourists'
    },
    meta_description: {
        tr: 'İngiliz turistler için İstanbul konaklama rehberi. Bölge karşılaştırmaları, ulaşım ipuçları ve kaçınılması gerekenler.',
        en: 'Pick the best area to stay in Istanbul with this UK-friendly guide. Compare neighbourhood vibes, walkability and transport, plus mistakes to avoid.'
    },
    location: 'Istanbul',
    content_raw: `
<h1>Where to Stay in Istanbul: Best Areas for UK Tourists (Pros, Cons, Vibes)</h1>

<p><strong>Quick answer:</strong> For most first-time UK travellers, you’ll have the easiest trip if you base yourself in a walkable area on the European side with straightforward transport links. Choose an area that matches your vibe: <strong>classic sights and easy sightseeing</strong>, <strong>food and neighbourhood life</strong>, <strong>nightlife and late evenings</strong>, or <strong>a calmer, local feel</strong>. Istanbul is huge — the “best” area is the one that reduces travel time <em>for your plan</em>.</p>

<p>If you haven’t decided whether Istanbul is your only base or part of a bigger Turkey trip, read:
<a href="#">Where to Stay in Turkey (UK First-Timer Area Guide)</a>.
And if you’re choosing airports, see:
<a href="#">IST vs SAW: Which Istanbul Airport?</a>.
</p>

<!-- IMAGE_COVER_PLACEHOLDER -->

<h2>Why Istanbul area choice matters (more than your room)</h2>
<p>In Istanbul, location is everything. Two places that look “close” on a map can feel far in real life because of traffic, hills, and the time it takes to cross busy neighbourhoods. If you pick the right area, you’ll spend your days exploring — not commuting, negotiating taxis, or feeling too far from the parts you actually want to see.</p>

<h2>How to choose the right area in 90 seconds</h2>
<ul>
  <li><strong>First-timer priority:</strong> Do you want to be close to the classic sights, or do you want neighbourhood life and food?</li>
  <li><strong>Evenings:</strong> Quiet nights or lively streets?</li>
  <li><strong>Walkability:</strong> Do you want to stroll to coffee and dinner, or are you fine relying on taxis?</li>
  <li><strong>Trip style:</strong> 2–4 day city break vs 5–7 day slower trip makes a difference.</li>
</ul>

<h2>Best areas at a glance (choose by vibe)</h2>
<table>
  <thead>
    <tr>
      <th>What you want</th>
      <th>Best area type</th>
      <th>Why it works</th>
      <th>Watch-outs</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Classic sightseeing + easy planning</td>
      <td>Historic core / old-city feel</td>
      <td>Great for first-timers who want iconic sights</td>
      <td>Can be tourist-heavy; choose a quieter street</td>
    </tr>
    <tr>
      <td>Food, cafés, neighbourhood life</td>
      <td>Central neighbourhoods with local streets</td>
      <td>Best “Istanbul vibe” without constant sightseeing mode</td>
      <td>Pick a spot that’s walkable and well-connected</td>
    </tr>
    <tr>
      <td>Nightlife + late evenings</td>
      <td>Lively entertainment districts</td>
      <td>Easy for bars, music, late dinners</td>
      <td>Noise can be intense; light sleepers beware</td>
    </tr>
    <tr>
      <td>Calmer, more local feel</td>
      <td>Residential, seaside, Asian-side style areas</td>
      <td>Great for repeat visitors or slower trips</td>
      <td>Less “walk to sights”; you’ll commute more</td>
    </tr>
  </tbody>
</table>

<h2>Option 1: Staying near the historic sights (best for first-timers)</h2>
<!-- IMAGE_HISTORIC_PLACEHOLDER -->
<p>If you’re in Istanbul mainly for the classic sights and you want a simple “wake up, walk, explore” plan, staying in the historic core makes life easier. You’ll be close to major landmarks and you can do early mornings without long travel times.</p>

<ul>
  <li><strong>Best for:</strong> first-time visitors, short city breaks, travellers who want the “postcard Istanbul” experience.</li>
  <li><strong>Vibe:</strong> historic, walkable, sightseeing-focused.</li>
  <li><strong>Good to know:</strong> some streets can feel very touristy — look for quieter pockets and avoid locations right on the noisiest strips.</li>
</ul>

<h3>Choose this area if you want a low-effort itinerary</h3>
<ul>
  <li>You want to <strong>walk</strong> to the main historic sights.</li>
  <li>You like the idea of <strong>early starts</strong> without long commutes.</li>
  <li>You’re fine with a more “visitor” atmosphere.</li>
</ul>

<h2>Option 2: Central neighbourhood life (best all-round base for many UK travellers)</h2>
<!-- IMAGE_NEIGHBOURHOOD_PLACEHOLDER -->
<p>If you want a city break that feels like real neighbourhood life — cafés, bakeries, casual dinners, and wandering streets — a central, well-connected area can be the sweet spot. You’ll still reach major sights, but you won’t feel like you’re sleeping inside a sightseeing zone.</p>

<ul>
  <li><strong>Best for:</strong> food lovers, couples, travellers who want a mix of exploring and relaxing.</li>
  <li><strong>Vibe:</strong> local streets, cafés, evening strolls, “live here for a few days” energy.</li>
  <li><strong>Good to know:</strong> your exact street matters. Being one or two streets away from the busiest roads can completely change your sleep quality.</li>
</ul>

<h3>How to pick the right spot within a central area</h3>
<ul>
  <li><strong>Walk-to-dinner test:</strong> Are there places you’d happily walk to at night?</li>
  <li><strong>Transport test:</strong> Can you reach key parts of the city without multiple changes?</li>
  <li><strong>Noise test:</strong> Avoid being directly above late-night venues if you’re a light sleeper.</li>
</ul>

<h2>Option 3: Lively nightlife districts (best if nights are your priority)</h2>
<!-- IMAGE_NIGHTLIFE_PLACEHOLDER -->
<p>Istanbul has areas that come alive late — brilliant if that’s what you want, exhausting if it isn’t. If your plan includes bars, music, and late dinners, staying in a lively district saves time and makes nights effortless. But be honest about sleep: noise is the number one complaint for people who pick the “fun” area by default.</p>

<ul>
  <li><strong>Best for:</strong> friends trips, travellers who want nightlife on the doorstep.</li>
  <li><strong>Vibe:</strong> energetic, busy, late-night streets.</li>
  <li><strong>Watch-out:</strong> noise. Choose accommodation on a side street and prioritise soundproofing if possible.</li>
</ul>

<h2>Option 4: Calmer, more local bases (better for slow trips)</h2>
<!-- IMAGE_ASIAN_SIDE_PLACEHOLDER -->
<p>If you’re staying longer, or you want a calmer base with a more residential feel, choosing a quieter area can be a great move. You’ll likely trade some sightseeing convenience for a slower pace and more local daily life.</p>

<ul>
  <li><strong>Best for:</strong> repeat visitors, slow travel, remote-work style trips, travellers who want calm evenings.</li>
  <li><strong>Vibe:</strong> residential, relaxed, less touristy.</li>
  <li><strong>Watch-out:</strong> you’ll commute more to the main sights, so plan your days in “clusters”.</li>
</ul>

<h2>European side vs Asian side (the honest version)</h2>
<p>Many UK travellers ask whether they should stay on the European side or the Asian side. Here’s the simple rule:</p>
<ul>
  <li><strong>European side:</strong> easiest for first-timers, sightseeing, classic city-break planning.</li>
  <li><strong>Asian side:</strong> often calmer and more local-feeling, but you’ll spend more time crossing the city to hit the major sights.</li>
</ul>
<p>If it’s your first time and you only have a few days, the European side usually makes planning easier. If you’re staying longer and you enjoy a “live like a local” feel, the Asian side can be a great choice.</p>

<h2>Safety and comfort: what matters (without overthinking)</h2>
<p>Istanbul is a major global city. Like anywhere, your comfort comes down to practical choices: stick to well-lit streets at night, keep valuables secure in crowded areas, and choose accommodation with good reviews for security and noise control. For most visitors, the bigger day-to-day “risk” is not danger — it’s <strong>stress from long commutes</strong> and <strong>poor sleep</strong>.</p>

<h2>Area selection checklist (copy/paste before you book)</h2>
<ul>
  <li><strong>Walkability:</strong> Can you walk to breakfast, coffee and at least a few dinner options?</li>
  <li><strong>Transport:</strong> Will you need multiple changes to reach the places you care about most?</li>
  <li><strong>Noise:</strong> Are you on a main road or nightlife strip? If yes, choose a side street.</li>
  <li><strong>Hills & effort:</strong> If mobility is a concern, avoid very steep streets.</li>
  <li><strong>Itinerary fit:</strong> Pick the area based on your top 3 priorities (sights / food / nightlife / calm).</li>
  <li><strong>Airport reality:</strong> Confirm which airport you’re using:
    <a href="#">IST vs SAW: Which Istanbul Airport?</a>
  </li>
</ul>

<h2>Common mistakes UK travellers make (and the fixes)</h2>
<ul>
  <li><strong>“We’ll stay central” without defining what that means.</strong> Fix: choose a base area tied to your plan (sights vs food vs nightlife).</li>
  <li><strong>Picking the loudest streets by accident.</strong> Fix: prioritise side streets and sleep-friendly accommodation.</li>
  <li><strong>Trying to do too much in one day.</strong> Fix: group sights by area and avoid crossing the city repeatedly.</li>
  <li><strong>Underestimating travel time.</strong> Fix: plan one “main zone” per day and build around it.</li>
  <li><strong>Booking purely by photos.</strong> Fix: location and logistics first; aesthetics second.</li>
</ul>

<h2>Suggested 3–4 day Istanbul plan (area-based, low stress)</h2>
<p>This isn’t a full itinerary — it’s a simple structure that helps you choose the right base.</p>
<ul>
  <li><strong>Day 1:</strong> Historic sights cluster (stay nearby if this is your priority).</li>
  <li><strong>Day 2:</strong> Neighbourhood wandering + food-focused day (choose a base that supports this vibe).</li>
  <li><strong>Day 3:</strong> Viewpoints + a different district (avoid zig-zagging across the city).</li>
  <li><strong>Optional Day 4:</strong> A slower day — shopping, cafés, and one key attraction.</li>
</ul>
<p>If Istanbul is part of a bigger first trip, pair it with one other base:
<a href="#">Where to Stay in Turkey (UK First-Timer Area Guide)</a>.
</p>

<h2>FAQs</h2>

<h3>What’s the best area to stay in Istanbul for first-time tourists?</h3>
<p>The best first-time base is the area that reduces commute time for the sights you care about most. If your priority is classic sightseeing, stay closer to the historic core. If your priority is food and neighbourhood life, choose a central, well-connected area with a calmer street setup.</p>

<h3>Is it better to stay on the European side or the Asian side?</h3>
<p>For first-timers on a short trip, the European side is usually easier for sightseeing. The Asian side can be brilliant for a calmer, more local feel—especially on longer stays—but expect more cross-city travel.</p>

<h3>Which area is best for nightlife?</h3>
<p>Choose a lively district if nightlife is your priority, but protect your sleep by staying on a side street and checking for late-night noise in reviews. If you’re a light sleeper, pick a calmer base and travel to nightlife instead.</p>

<h3>What if I want quiet evenings?</h3>
<p>Prioritise residential-feeling areas, side streets, and accommodation known for good soundproofing. Quiet is usually more about the exact street than the wider neighbourhood name.</p>

<h3>How many days do I need in Istanbul?</h3>
<p>Many UK travellers enjoy 3–4 days for a first visit. If you prefer a slower pace with lots of cafés and neighbourhood time, add an extra day.</p>

<h3>What’s the biggest mistake to avoid when booking?</h3>
<p>Booking “central” without matching the base to your actual plan. Decide your top priority (sights, food, nightlife, calm) and choose the area that supports it.</p>

<p><em>Last updated: ${new Date().toLocaleDateString('en-GB')}</em></p>
`
};

async function execute() {
    console.log('--- Adding Istanbul Guide & Generating Realistic Flux Images ---');

    const timestamp = Date.now();

    // Realism Note: Using "Shot on Fujifilm/Kodak", "Street Photography", "Natural Lighting", "Grain"
    const prompts = [
        {
            key: 'IMAGE_COVER_PLACEHOLDER',
            filename: `istanbul-guide-cover-${timestamp}.jpg`,
            prompt: "A high-angle, authentic street photography shot of the Galata Tower peeking through a narrow, cobblestone street in Istanbul. Late afternoon golden light (golden hour). People walking naturally, a street cat sitting on a step. Shot on Fujifilm XT-4. Detailed, sharp focus but natural texture. No AI smoothing, photorealistic."
        },
        {
            key: 'IMAGE_HISTORIC_PLACEHOLDER',
            filename: `istanbul-historic-${timestamp}.jpg`,
            prompt: "A wide, majestic shot of the Blue Mosque (Sultanahmet) courtyard in the early morning mist. Few tourists walking in the distance. Soft, diffused natural light. Shot on 35mm film. Historical architecture texture, realistic stone details, atmospheric."
        },
        {
            key: 'IMAGE_NEIGHBOURHOOD_PLACEHOLDER',
            filename: `istanbul-neighbourhood-${timestamp}.jpg`,
            prompt: "A cozy, authentic street scene in Cihangir or Karakoy. Young people drinking coffee at small outdoor tables. Vine leaves hanging from old buildings. Warm, inviting atmosphere. Shallow depth of field (bokeh). Realistic lifestyle photography, candid style."
        },
        {
            key: 'IMAGE_NIGHTLIFE_PLACEHOLDER',
            filename: `istanbul-nightlife-${timestamp}.jpg`,
            prompt: "Istanbul vibrant nightlife street scene (Nevizade or similar). Blurred lights of restaurant signs, people dining outside (Raki tables), lively atmosphere. Night photography, slightly grainy cinematic look, neon reflections on wet cobblestones."
        },
        {
            key: 'IMAGE_ASIAN_SIDE_PLACEHOLDER',
            filename: `istanbul-asian-side-${timestamp}.jpg`,
            prompt: "A peaceful view of the Moda seaside promenade (Asian side) at sunset. People sitting on grass, ferries passing in the distance on the Sea of Marmara. Warm colors, relaxed vibe. Authentic landscape photography, high dynamic range."
        }
    ];

    let finalContent = articleData.content_raw;
    let coverImageUrl = '';

    for (const item of prompts) {
        const url = await generateFluxImage(item.prompt, item.filename);
        if (url) {
            if (item.key === 'IMAGE_COVER_PLACEHOLDER') {
                coverImageUrl = url;
                finalContent = finalContent.replace('<!-- IMAGE_COVER_PLACEHOLDER -->', `<img src="${url}" alt="Istanbul Area Guide" class="w-full h-auto rounded-lg my-6 shadow-md" />`);
            } else {
                finalContent = finalContent.replace(`<!-- ${item.key} -->`, `<img src="${url}" alt="Istanbul Guide - ${item.filename}" class="w-full h-auto rounded-lg my-6 shadow-md" />`);
            }
        } else {
            console.warn(`Skipping generation for ${item.key}`);
        }
    }

    // Upsert into Database
    const titleJson = JSON.stringify(articleData.title);
    const descJson = JSON.stringify(articleData.meta_description);
    const contentJson = JSON.stringify({
        tr: "",
        en: finalContent
    });

    const { error } = await supabase
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
