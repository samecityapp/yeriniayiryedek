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
    slug: 'oludeniz-vs-calis-vs-fethiye-where-to-stay',
    title: 'Ölüdeniz vs Çalış vs Fethiye Centre: Where to Stay (UK Guide)',
    meta_description: 'Can’t decide where to stay near Fethiye? Compare Ölüdeniz, Çalış and Fethiye Centre by vibe, beach style, crowds, transport and who each area suits.',
    content: `
<h1>Ölüdeniz vs Çalış vs Fethiye Centre: Where Should UK Travellers Stay?</h1>

<p><strong>Quick answer:</strong> 
Choose <strong>Ölüdeniz</strong> if the Blue Lagoon beach days are the main reason you’re coming. Choose <strong>Çalış</strong> if you want calmer evenings, a long promenade, and sunset walks. Choose <strong>Fethiye Centre</strong> if you want the most practical hub for tours, boat days, transport links and “do a bit of everything”.</p>

<p>If you want the full area breakdown (including Kayaköy/Faralya), read:
<a href="/guide/where-to-stay-in-fethiye-best-areas-guide">Where to Stay in Fethiye (Best Areas)</a>.</p>

<hr/>

<!-- IMAGE_COVER_PLACEHOLDER -->

<h2>The 30-second decision (copy/paste)</h2>
<ul>
  <li><strong>“I want the famous lagoon look and beach-first days” →</strong> Ölüdeniz (Blue Lagoon is a protected nature park with controlled access).</li>
  <li><strong>“I want chilled evenings + promenade + sunsets” →</strong> Çalış (known for a laid-back feel and promenade strolling).</li>
  <li><strong>“I want the easiest base for everything (tours/boats/food/transport)” →</strong> Fethiye Centre</li>
</ul>

<hr/>

<h2>Side-by-side comparison (what each area is actually like)</h2>
<table>
  <thead>
    <tr>
      <th>What matters to you</th>
      <th><strong>Ölüdeniz</strong></th>
      <th><strong>Çalış</strong></th>
      <th><strong>Fethiye Centre</strong></th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Best for</td>
      <td>Iconic lagoon + beach days</td>
      <td>Relaxed seafront routine + sunsets</td>
      <td>Practical hub + day trips</td>
    </tr>
    <tr>
      <td>Vibe</td>
      <td>Resort-like, “holiday postcard”</td>
      <td>Laid-back, walkable evenings</td>
      <td>Town energy, lots of options</td>
    </tr>
    <tr>
      <td>Beach style</td>
      <td>Famous lagoon beach in protected park</td>
      <td>Long beach + promenade atmosphere</td>
      <td>Not a “step-out-to-iconic-beach” base</td>
    </tr>
    <tr>
      <td>Crowds</td>
      <td>Can get heavily crowded (especially peak)</td>
      <td>Usually calmer than Ölüdeniz</td>
      <td>Busy town feel (in a good way)</td>
    </tr>
    <tr>
      <td>Getting around</td>
      <td>Easy link to Fethiye by public route</td>
      <td>Easy access to centre; great for slow days</td>
      <td>Best starting point for tours/boats</td>
    </tr>
    <tr>
      <td>Big watch-out</td>
      <td>If you don’t care about lagoon, you may pay “lagoon premium” for a vibe you won’t use</td>
      <td>If you want the lagoon look every day, you’ll travel for it</td>
      <td>If you want “wake up on the famous beach”, it’s the wrong base</td>
    </tr>
  </tbody>
</table>

<hr/>

<h2>Ölüdeniz: choose it if the Blue Lagoon is the main event</h2>
<p>Ölüdeniz is the “bucket list” base because the lagoon beach is the headline. It’s widely described as a <strong>protected national park / nature park</strong>, and it’s the kind of place that can be <strong>heavily crowded</strong> in peak periods — which is exactly why many people go early.</p>

<h3>You should stay in Ölüdeniz if…</h3>
<ul>
  <li>You want <strong>beach-first days</strong> with the iconic scenery as your default backdrop.</li>
  <li>You don’t want to spend time commuting to your main reason for coming.</li>
</ul>

<h3>Don’t stay in Ölüdeniz if…</h3>
<ul>
  <li>You’re planning mostly <strong>boat tours + town food + day trips</strong> and only 1 quick lagoon visit (centre may fit better).</li>
</ul>

<!-- IMAGE_OLUDENIZ_PLACEHOLDER -->

<hr/>

<h2>Çalış: choose it for sunsets, promenade walks and “easy evenings”</h2>
<p>Çalış is for travellers who want the trip to feel relaxed. It’s known for a <strong>laid-back beach vibe</strong>, a <strong>promenade lined with cafés/restaurants</strong>, and <strong>memorable sunsets</strong> that become part of your daily routine rather than a special mission.</p>

<h3>You should stay in Çalış if…</h3>
<ul>
  <li>You like <strong>walking after dinner</strong> and having a simple “repeatable” evening plan.</li>
  <li>You want a base that feels calm even in busier months.</li>
</ul>

<h3>Don’t stay in Çalış if…</h3>
<ul>
  <li>You want to wake up next to the lagoon and make it your everyday beach.</li>
</ul>

<!-- IMAGE_CALIS_PLACEHOLDER -->

<hr/>

<h2>Fethiye Centre: choose it if you want the easiest “hub” base</h2>
<p>Fethiye Centre is the practical choice. It’s the most forgiving base because you can decide your plan day-by-day: boat day, lagoon day, quiet village day, food day — all without feeling stuck.</p>

<h3>You should stay in Fethiye Centre if…</h3>
<ul>
  <li>You want <strong>boat day options</strong> and day tours to be simple.</li>
  <li>You prefer having <strong>lots of restaurants and services</strong> right nearby.</li>
  <li>You want the easiest base for <strong>mix-and-match days</strong>.</li>
</ul>

<h3>Don’t stay in Fethiye Centre if…</h3>
<ul>
  <li>Your dream is “I want the iconic beach vibe every single day without effort.”</li>
</ul>

<!-- IMAGE_CENTRE_PLACEHOLDER -->

<hr/>

<h2>“Can I move between them easily?” (realistic transport note)</h2>
<p>Yes — Ölüdeniz and Fethiye are connected by public transport routes (for example, MUTTAŞ publishes a Fethiye–Ölüdeniz line with route details).</p>

<p><strong>Practical rule:</strong> even if transport exists, your holiday quality is decided by your <em>default</em> day. If you’ll go to the lagoon most days, base near it. If you’ll do tours/boat days most days, base in the hub.</p>

<hr/>

<h2>Best choice by traveller type (UK intent)</h2>
<ul>
  <li><strong>Couples (romantic + sunsets + slow pace):</strong> Çalış</li>
  <li><strong>Families (easy routine + beach days):</strong> Ölüdeniz if lagoon is the priority; Çalış if you want calmer evenings</li>
  <li><strong>Friends trip (variety + boat day + food):</strong> Fethiye Centre</li>
  <li><strong>Short trip (3–4 nights):</strong> pick ONE base, don’t split stays</li>
</ul>

<hr/>

<h2>FAQs</h2>

<h3>Which is best: Ölüdeniz or Çalış?</h3>
<p>Ölüdeniz is best if you want the iconic lagoon beach inside a protected nature park and you’ll spend most days there.  
Çalış is best if you want a calmer, promenade-and-sunset routine that feels easy every evening.</p>

<h3>Is it easy to do a day trip to Ölüdeniz from Fethiye Centre?</h3>
<p>Yes — there are published public transport routes between Fethiye and Ölüdeniz.</p>

<h3>Where should I stay if I want boat tours?</h3>
<p>Fethiye Centre is usually the easiest hub base because you’re closer to town services and day-trip logistics.</p>

<p><em>Last updated:</em> ${new Date().toLocaleDateString('en-GB')}</p>
`
};

async function addFethiyeComparisonArticle() {
    const timestamp = Date.now();

    // --- Authentic Mode Prompts (Imagen 3) ---
    const imagesToGenerate = [
        {
            placeholder: '<!-- IMAGE_COVER_PLACEHOLDER -->',
            filename: `fethiye-comparison-cover-${timestamp}.jpg`,
            prompt: "A beautiful conceptual travel photography shot of Fethiye, showing a road sign or a view where coast meets mountains. Sunlight. Authentic travel guide style."
        },
        {
            placeholder: '<!-- IMAGE_OLUDENIZ_PLACEHOLDER -->',
            filename: `fethiye-oludeniz-aerial-${timestamp}.jpg`,
            prompt: "Aerial view of Ölüdeniz beach and Blue Lagoon. Turquoise water, white sand, green hills. Authentic high quality drone photography."
        },
        {
            placeholder: '<!-- IMAGE_CALIS_PLACEHOLDER -->',
            filename: `fethiye-calis-sunset-${timestamp}.jpg`,
            prompt: "Golden sunset at Çalış Beach promenade in Fethiye. silhouette of people walking. Warm orange light. Authentic relaxed evening atmosphere."
        },
        {
            placeholder: '<!-- IMAGE_CENTRE_PLACEHOLDER -->',
            filename: `fethiye-centre-hub-${timestamp}.jpg`,
            prompt: "Fethiye town centre street with shops and cafes. Lively but relaxed. People walking. Authentic urban travel photography."
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
        title: { en: ARTICLE_DATA.title, tr: "Ölüdeniz mi, Çalış mı, Fethiye Merkez mi? Konaklama Rehberi" },
        meta_description: { en: ARTICLE_DATA.meta_description, tr: "Fethiye'de nerede kalınır? Ölüdeniz, Çalış ve Merkez bölgelerinin hangisi size uygun? Artılar, eksiler ve ulaşım." },
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
        console.log("✅ Fethiye Comparison Article Added Successfully with Imagen 3 Images!");
    }
}

addFethiyeComparisonArticle();
