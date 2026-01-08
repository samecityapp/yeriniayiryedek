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
    slug: 'boutique-vs-resort-vs-aparthotel-in-turkey-uk-travellers-guide',
    title: 'Boutique vs Resort vs Aparthotel in Turkey: Which One Suits UK Travellers?',
    meta_description: 'Not sure what type of accommodation to book in Turkey from the UK? Compare boutique hotels, resorts and aparthotels—who each suits, pros/cons, and how to choose without regrets. No hotel names.',
    primary_keyword: 'boutique vs resort vs aparthotel in Turkey',
    content: `<p><strong>Quick answer:</strong> Choose a <strong>resort</strong> if you want a low-effort holiday where most costs are predictable and days run smoothly (especially families). Choose a <strong>boutique stay</strong> if you want atmosphere, local cafés, and evenings out (great for couples and short breaks). Choose an <strong>aparthotel/apartment-style stay</strong> if you want space, flexibility and control over food (ideal for longer stays and families who want a calmer routine).</p>

<p>UK travellers often pick the wrong type because they chase a deal first. The smarter approach is to choose the accommodation type that matches your <strong>holiday rhythm</strong>.</p>

<p>Internal reads (placeholders):
<a href="/guide/how-to-choose-hotel-in-turkey-checklist-uk-guide">How to Choose a Hotel in Turkey (Checklist)</a> •
<a href="/guide/all-inclusive-in-turkey-explained-uk-guide">All-Inclusive in Turkey Explained</a> •
<a href="/guide/family-stays-in-turkey-what-to-check">Family Stays in Turkey: What to Check</a> •
<a href="/guide/quiet-sleep-in-turkey-avoid-noisy-rooms">Quiet Sleep in Turkey: Avoid Noisy Rooms</a> •
<a href="/guide/turkey-costs-what-to-expect-uk-guide">Turkey Costs: What to Expect (UK Guide)</a>
</p>

<!-- IMAGE_COVER_PLACEHOLDER -->

<hr/>

<h2>Pick the right type in 60 seconds (UK travellers)</h2>
<ul>
  <li><strong>“We want to switch off and not plan much”</strong> → Resort</li>
  <li><strong>“We want vibe, cafés, and evenings out”</strong> → Boutique</li>
  <li><strong>“We want space and flexibility (and maybe cook sometimes)”</strong> → Aparthotel / apartment-style</li>
  <li><strong>“We’re travelling with kids and want predictable days”</strong> → Resort or family-friendly aparthotel</li>
</ul>

<p><strong>Simple rule:</strong> Your accommodation should support how you like to spend your days, not fight it.</p>

<hr/>

<h2>At a glance: boutique vs resort vs aparthotel</h2>
<table>
  <thead>
    <tr>
      <th>Type</th>
      <th>Best for</th>
      <th>Pros</th>
      <th>Trade-offs</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Resort</strong></td>
      <td>Families, low-effort holidays</td>
      <td>Predictable routine, facilities on-site</td>
      <td>Less local feel, can be busy</td>
    </tr>
    <tr>
      <td><strong>Boutique</strong></td>
      <td>Couples, short breaks, vibe trips</td>
      <td>Atmosphere, charm, great evenings</td>
      <td>Less “everything handled” convenience</td>
    </tr>
    <tr>
      <td><strong>Aparthotel / apartment</strong></td>
      <td>Longer stays, space lovers</td>
      <td>Flexibility, space, cost control</td>
      <td>More self-managed (food, routine)</td>
    </tr>
  </tbody>
</table>

<hr/>

<h2>Option 1: Resort stays (best for low-effort, predictable holidays)</h2>
<p>A resort-style stay is perfect if you want a holiday where the day runs itself: pool, beach, food, repeat. For UK travellers, resorts can be excellent value because you’re buying simplicity and predictability.</p>

<h3>Choose a resort if…</h3>
<ul>
  <li>you want a <strong>low-effort</strong> holiday</li>
  <li>you want <strong>predictable daily costs</strong> (especially all-inclusive)</li>
  <li>you’re travelling with family and want everything in one place</li>
</ul>

<!-- IMAGE_RESORT_PLACEHOLDER -->

<h3>Resort “watch-outs” (so you don’t book the wrong vibe)</h3>
<ul>
  <li><strong>Quiet vs lively:</strong> resorts can be calm or entertainment-heavy — choose intentionally.</li>
  <li><strong>Beach reality:</strong> verify “beachfront” and what’s included (sunbeds, towels).</li>
  <li><strong>Sleep:</strong> avoid rooms above evening entertainment if you’re noise-sensitive.</li>
</ul>

<p>Read: <a href="/guide/all-inclusive-in-turkey-explained-uk-guide">All-Inclusive in Turkey Explained</a>.</p>

<hr/>

<h2>Option 2: Boutique stays (best for atmosphere and evenings out)</h2>
<p>Boutique stays work best when your holiday is built around: explore by day, eat well by night, repeat. UK travellers who love vibe, charm and a more “local” feel often prefer boutique over resort.</p>

<h3>Choose boutique if…</h3>
<ul>
  <li>you want <strong>atmosphere</strong> and an interesting setting</li>
  <li>you plan to <strong>eat out</strong> and enjoy walkable evenings</li>
  <li>your trip is shorter and you want the destination to feel “special” fast</li>
</ul>

<!-- IMAGE_BOUTIQUE_PLACEHOLDER -->

<h3>Boutique “watch-outs”</h3>
<ul>
  <li><strong>Space:</strong> boutique rooms can be smaller — check your comfort needs.</li>
  <li><strong>Facilities:</strong> you might not get resort-style pools and on-site options.</li>
  <li><strong>Noise:</strong> boutique bases in lively streets can be noisy — choose a calmer position if needed.</li>
</ul>

<hr/>

<h2>Option 3: Aparthotels / apartments (best for space and flexibility)</h2>
<p>This is the best “make it your own” option. If you want space, a calmer routine, and the ability to control food and timing, an aparthotel or apartment-style stay can feel brilliant.</p>

<h3>Choose an aparthotel/apartment if…</h3>
<ul>
  <li>you want <strong>space</strong> (especially with kids or longer stays)</li>
  <li>you like the idea of <strong>flexible meals</strong> (not locked into hotel times)</li>
  <li>you want a calmer, more private routine</li>
</ul>

<!-- IMAGE_APARTHOTEL_PLACEHOLDER -->

<h3>Aparthotel “watch-outs”</h3>
<ul>
  <li><strong>Location matters more:</strong> you’ll rely on nearby cafés/shops.</li>
  <li><strong>Cleaning/service rhythm:</strong> can differ from hotels — check expectations.</li>
  <li><strong>Transport:</strong> confirm how you’ll reach beaches/centre if you’re not central.</li>
</ul>

<hr/>

<h2>Best choice by UK traveller type</h2>

<h3>Families</h3>
<ul>
  <li><strong>Resort:</strong> easiest routine + facilities</li>
  <li><strong>Aparthotel:</strong> best for space + flexible meals</li>
</ul>

<h3>Couples</h3>
<ul>
  <li><strong>Boutique:</strong> best for atmosphere and romantic evenings</li>
  <li><strong>Resort:</strong> best for “switch off” comfort (choose calm vibe)</li>
</ul>

<h3>Friends trips</h3>
<ul>
  <li><strong>Resort:</strong> easiest for everyone-in-one-place days</li>
  <li><strong>Boutique:</strong> great if the trip is about going out and vibe</li>
</ul>

<h3>Longer stays (7–14 nights)</h3>
<ul>
  <li><strong>Aparthotel/apartment:</strong> often best for comfort and cost control</li>
  <li><strong>Resort:</strong> works if you truly want everything handled</li>
</ul>

<hr/>

<h2>The decision framework (copy-paste)</h2>
<ul>
  <li>We want our days to be: <strong>pool/beach routine</strong> OR <strong>explore and eat out</strong></li>
  <li>We care most about: <strong>predictable costs</strong> OR <strong>atmosphere</strong> OR <strong>space</strong></li>
  <li>We want evenings to be: <strong>walkable and lively</strong> OR <strong>calm and early</strong></li>
  <li>We need: <strong>kids facilities</strong> OR <strong>quiet sleep</strong> OR <strong>work-friendly space</strong></li>
</ul>

<p><strong>Simple rule:</strong> If you’re arguing between two types, pick the one that makes evenings and sleep easier. That’s what you feel every day.</p>

<hr/>

<h2>FAQs</h2>

<h3>What is the best type of accommodation in Turkey for UK travellers?</h3>
<p>It depends on your holiday rhythm: resorts for low-effort, predictable days; boutique stays for atmosphere and evenings out; aparthotels for space and flexibility.</p>

<h3>Is all-inclusive better than boutique in Turkey?</h3>
<p>All-inclusive (often resort-style) is better if you want predictable costs and a simple routine. Boutique is better if you want local vibe and plan to explore and eat out.</p>

<h3>What’s best for families in Turkey?</h3>
<p>Resorts are usually the easiest for facilities and routine. Aparthotels can be great for space and flexible meals, especially on longer stays.</p>

<p><em>Last updated:</em> ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
`
};

async function run() {
    const timestamp = Date.now();
    console.log("🚀 Starting Accommodation Type Article Automation...");

    // SAFE PROMPTS for Authentic Feel
    const imagesToGenerate = [
        {
            placeholder: '<!-- IMAGE_COVER_PLACEHOLDER -->',
            filename: `turkey-accommodation-choice-collage-authentic-${timestamp}.jpg`,
            prompt: "Collage style or wide shot showing different holiday vibes in Turkey: a relaxing pool, a charming boutique street, and a spacious balcony view. Authentic travel photography. Realistic."
        },
        {
            placeholder: '<!-- IMAGE_RESORT_PLACEHOLDER -->',
            filename: `turkey-resort-pool-relaxing-vibe-${timestamp}.jpg`,
            prompt: "A large, calming resort pool in Turkey with sunbeds and palm trees. People relaxing. Blue water. Authentic holiday vibe, not too crowded. Realistic."
        },
        {
            placeholder: '<!-- IMAGE_BOUTIQUE_PLACEHOLDER -->',
            filename: `turkey-boutique-hotel-street-charm-${timestamp}.jpg`,
            prompt: "Exterior of a charming boutique hotel in a Turkish town (like Alacati or Kas). Stone building, flowers, small tables outside. Authentic atmosphere. Realistic."
        },
        {
            placeholder: '<!-- IMAGE_APARTHOTEL_PLACEHOLDER -->',
            filename: `turkey-aparthotel-living-space-view-${timestamp}.jpg`,
            prompt: "Interior of a bright, spacious holiday apartment in Turkey. Living area with a balcony door open to a sea view. Authentic, comfortable travel style. Realistic."
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
        title: { en: ARTICLE_DATA.title, tr: "Türkiye'de Konaklama Türleri: Butik, Resort, Apart (TR Pasif)" },
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
        console.log("✅ Accommodation Type Article Added Successfully!");
        console.log("👉 Slug:", ARTICLE_DATA.slug);
    }
}

run();
