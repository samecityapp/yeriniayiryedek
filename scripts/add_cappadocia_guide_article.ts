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
    let baseDelay = 5000; // 5 seconds start

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
                const errText = await response.text();
                // If Rate Limit, retry
                if (response.status === 429) {
                    retries++;
                    const delay = baseDelay * (2 ** (retries - 1));
                    console.warn(`🔄 Rate limited (429). Retrying in ${delay / 1000}s... (Attempt ${retries}/${maxRetries})`);
                    await new Promise(res => setTimeout(res, delay));
                    continue;
                }
                throw new Error(`Vertex API Error: ${response.status} - ${errText}`);
            }

            const data = await response.json();

            if (!data.predictions || data.predictions.length === 0) {
                console.error("❌ Vertex AI Response Error.", JSON.stringify(data, null, 2));
                throw new Error('No predictions returned');
            }

            if (!data.predictions[0].bytesBase64Encoded) {
                console.error("❌ Missing bytesBase64Encoded:", JSON.stringify(data.predictions[0], null, 2));
                throw new Error('Invalid prediction structure');
            }

            const base64Image = data.predictions[0].bytesBase64Encoded;
            const buffer = Buffer.from(base64Image, 'base64');

            const localPath = path.join(ARTICLES_IMAGE_DIR, filename);
            const publicUrl = `/images/articles/${filename}`;

            fs.writeFileSync(localPath, buffer);
            console.log(`✅ Saved: ${localPath}`);

            return publicUrl;
        } catch (error) {
            if (retries >= maxRetries - 1) {
                console.error("❌ Generation Failed after retries:", error);
                return null;
            }
            console.error("❌ Generation Failed:", error);
            return null;
        }
    }
    return null;
}

const ARTICLE_DATA = {
    slug: 'where-to-stay-in-cappadocia-best-areas-guide',
    title: 'Where to Stay in Cappadocia: Best Towns & Areas for UK Travellers (Göreme vs Uçhisar vs Ürgüp vs Avanos)',
    meta_description: 'Choose the best area to stay in Cappadocia. Compare Göreme, Uçhisar, Ürgüp and Avanos by vibe, views, ease and trip style.',
    content: `
<h1>Where to Stay in Cappadocia: Best Towns & Areas for UK Travellers (Göreme vs Uçhisar vs Ürgüp vs Avanos)</h1>

<p><strong>Quick answer:</strong> For most first-time UK travellers, <strong>Göreme</strong> is the easiest base because it’s central and simple for tours and getting around. If you want the most peaceful stay with strong views and a more “quiet luxury” feel, <strong>Uçhisar</strong> often suits you best. If you want a slightly more “town” atmosphere with evenings and more space, <strong>Ürgüp</strong> can be a great match. If you want a calmer, local-feeling base by the river and you like crafts and slower mornings, consider <strong>Avanos</strong>.</p>

<p>If Cappadocia is one part of your first Turkey trip, start with:
<a href="/guide/where-to-stay-in-turkey-first-time-guide">Where to Stay in Turkey (UK First-Timer Area Guide)</a>.
For season planning:
<a href="/guide/best-time-to-visit-turkey">Best Time to Visit Turkey (Month-by-Month)</a>.
</p>

<!-- IMAGE_COVER_PLACEHOLDER -->

<h2>What “staying in Cappadocia” actually means</h2>
<p>Cappadocia isn’t one town — it’s a region of valleys, viewpoints and small bases. Your stay will feel completely different depending on where you sleep. A central base makes mornings and tours easy. A quiet, view-led base can make the whole trip feel more relaxing and special. Your goal is to choose a base that fits <strong>how you want your days to start and end</strong>.</p>

<h2>Cappadocia at a glance: choose your base by vibe</h2>
<table>
  <thead>
    <tr>
      <th>What you want</th>
      <th>Best base</th>
      <th>Why it suits UK travellers</th>
      <th>Watch-outs</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Most convenient first-timer base</td>
      <td>Göreme</td>
      <td>Central, easy for tours and getting around</td>
      <td>Can feel busy; choose quieter streets if you value calm</td>
    </tr>
    <tr>
      <td>Quiet, views, peaceful evenings</td>
      <td>Uçhisar</td>
      <td>More serene feel; great for couples and slow mornings</td>
      <td>Less “buzz”; you’ll travel a bit more for some spots</td>
    </tr>
    <tr>
      <td>More “town” feel and space</td>
      <td>Ürgüp</td>
      <td>Good balance for travellers who like a wider town base</td>
      <td>Not as central as Göreme for some routes</td>
    </tr>
    <tr>
      <td>Calmer, local-feeling, river vibe</td>
      <td>Avanos</td>
      <td>More relaxed and low-key; good for slow travel</td>
      <td>Less “classic Cappadocia postcard” feel on the doorstep</td>
    </tr>
  </tbody>
</table>

<h2>The 60-second decision method (pick your mornings)</h2>
<ul>
  <li><strong>If you want “easy mode”:</strong> choose Göreme for convenience and centrality.</li>
  <li><strong>If you want quiet mornings and a more romantic feel:</strong> choose Uçhisar.</li>
  <li><strong>If you want a larger town base:</strong> choose Ürgüp.</li>
  <li><strong>If you want calm and local rhythm:</strong> choose Avanos.</li>
</ul>

<h2>Göreme: the easiest base for first-timers</h2>
<p>Göreme is often the default choice for a reason: it’s central and practical. If you’re new to the region, it makes planning simple. You can keep your itinerary relaxed because you’re not constantly thinking about travel time.</p>

<!-- IMAGE_GOREME_PLACEHOLDER -->

<ul>
  <li><strong>Best for:</strong> first-time visitors, short stays, travellers who want convenience.</li>
  <li><strong>Vibe:</strong> lively, tourist-friendly, easy-to-organise.</li>
  <li><strong>Choose Göreme if:</strong> you want the simplest base for tours and valley time.</li>
</ul>

<h3>Göreme tips (UK-friendly)</h3>
<ul>
  <li><strong>Sleep:</strong> if you’re a light sleeper, choose a quieter street setup.</li>
  <li><strong>Keep it simple:</strong> plan one “big activity” per day and leave space for wandering.</li>
  <li><strong>Don’t overpack:</strong> Cappadocia is best with a slower rhythm.</li>
</ul>

<h2>Uçhisar: calmer, view-led, and more romantic</h2>
<p>Uçhisar often suits travellers who want peace and views. It’s ideal if you want your evenings to feel calm and your mornings to feel unhurried. It can be a brilliant choice for couples and anyone who values atmosphere over “busy centre” energy.</p>

<!-- IMAGE_UCHISAR_PLACEHOLDER -->

<ul>
  <li><strong>Best for:</strong> couples, quiet luxury seekers, slow travellers.</li>
  <li><strong>Vibe:</strong> serene, view-focused, calmer nights.</li>
  <li><strong>Choose Uçhisar if:</strong> you want a more peaceful base and you’re happy to travel a little for some sights.</li>
</ul>

<h3>Uçhisar reality check</h3>
<ul>
  <li><strong>Less buzz:</strong> it’s not about nightlife; it’s about calm evenings.</li>
  <li><strong>Plan lightly:</strong> choose a few high-impact experiences rather than trying to do everything.</li>
</ul>

<h2>Ürgüp: a larger town base with a different rhythm</h2>
<p>Ürgüp can feel more like a “proper town base” than some other areas. It suits travellers who like having a little more space and a slightly different rhythm in the evenings. It can work very well if you’re staying longer or you want a base that feels less like a tiny centre.</p>

<!-- IMAGE_URGUP_PLACEHOLDER -->

<ul>
  <li><strong>Best for:</strong> travellers who like a town feel, longer stays, groups who want more choice.</li>
  <li><strong>Vibe:</strong> wider town energy, practical, comfortable.</li>
  <li><strong>Choose Ürgüp if:</strong> you want a bigger base and you don’t need to be in the most central spot.</li>
</ul>

<h3>Ürgüp tips</h3>
<ul>
  <li><strong>Transport mindset:</strong> plan your days by area clusters to reduce back-and-forth.</li>
  <li><strong>Evenings:</strong> it can suit travellers who like a calm dinner-and-walk routine.</li>
</ul>

<h2>Avanos: calm, local-feeling, and slower travel</h2>
<p>Avanos is often chosen by travellers who want a quieter, more local-feeling base. If you like the idea of slower mornings, a river-town vibe, and a more low-key atmosphere, it can be a good fit.</p>

<!-- IMAGE_AVANOS_PLACEHOLDER -->

<ul>
  <li><strong>Best for:</strong> slow travellers, visitors who want calm and a more local rhythm.</li>
  <li><strong>Vibe:</strong> relaxed, low-key, less tourist-centre intense.</li>
  <li><strong>Choose Avanos if:</strong> you value calm and you’re happy to travel to some of the classic viewpoints.</li>
</ul>

<h2>How many nights in Cappadocia? (realistic guidance)</h2>
<p>The right number of nights depends on how rushed you want to feel. Many first-timers enjoy Cappadocia most when they have enough time to do a few key experiences without waking up every day with a packed schedule.</p>
<ul>
  <li><strong>If you want a quick highlight:</strong> stay long enough to have one full day plus a calm morning.</li>
  <li><strong>If you want the “Cappadocia rhythm”:</strong> stay long enough to do multiple valleys/viewpoints without rushing.</li>
</ul>

<h2>Common Cappadocia mistakes (and the fixes)</h2>
<ul>
  <li><strong>Choosing a base without considering mornings.</strong> Fix: pick a base that matches your energy (busy vs calm) and reduces travel friction.</li>
  <li><strong>Overloading the itinerary.</strong> Fix: choose a few high-impact activities and leave time for wandering and viewpoints.</li>
  <li><strong>Expecting it to feel like the coast.</strong> Fix: treat Cappadocia as a landscapes-and-atmosphere trip, not a beach add-on.</li>
  <li><strong>Not protecting sleep.</strong> Fix: choose quieter streets and calm-night accommodation if sleep matters to you.</li>
</ul>

<h2>Booking checklist (copy/paste before you book)</h2>
<ul>
  <li><strong>Choose your base:</strong> Göreme (easy), Uçhisar (quiet views), Ürgüp (town feel), Avanos (calm/local).</li>
  <li><strong>Decide your vibe:</strong> busy centre energy vs serene evenings.</li>
  <li><strong>Protect your mornings:</strong> choose a base that reduces commuting to what you want to do.</li>
  <li><strong>Keep the plan light:</strong> Cappadocia feels best without constant rushing.</li>
  <li><strong>Season check:</strong> match your plans to your month:
    <a href="/guide/best-time-to-visit-turkey">Best Time to Visit Turkey (Month-by-Month)</a>
  </li>
  <li><strong>Overall trip plan:</strong> if Cappadocia is part of your first Turkey itinerary:
    <a href="/guide/where-to-stay-in-turkey-first-time-guide">Where to Stay in Turkey (UK First-Timer Area Guide)</a>
  </li>
</ul>

<h2>FAQs (UK travellers)</h2>

<h3>What’s the best place to stay in Cappadocia for first-timers?</h3>
<p>For many first-timers, Göreme is the easiest base because it’s central and makes planning simple. If you prefer quiet and views, Uçhisar can be a better fit.</p>

<h3>Is Göreme too touristy?</h3>
<p>It can feel busy, especially in peak season. If you still want Göreme’s convenience but prefer calm evenings, choose a quieter street setup.</p>

<h3>Where should couples stay in Cappadocia?</h3>
<p>Many couples enjoy calmer bases with strong views and peaceful evenings. Uçhisar is often a strong match for that style.</p>

<h3>Is Ürgüp a good base?</h3>
<p>Yes if you prefer a larger town feel and you’re comfortable planning days by area clusters rather than expecting everything to be on your doorstep.</p>

<h3>How do I choose between Göreme and Uçhisar?</h3>
<p>Choose Göreme for convenience and a central base. Choose Uçhisar for a quieter, more view-led stay with calmer evenings.</p>

<p><em>Last updated:</em> ${new Date().toLocaleDateString('en-GB')}</p>
`
};

async function addCappadociaArticle() {
    const timestamp = Date.now();

    // --- Authentic Mode Prompts (Imagen 3) ---
    const imagesToGenerate = [
        {
            placeholder: '<!-- IMAGE_COVER_PLACEHOLDER -->',
            filename: `cappadocia-cover-${timestamp}.jpg`,
            prompt: "A wide panoramic shot of hot air balloons rising over Cappadocia valleys at sunrise. Earth tones, soft golden light. Shot on iPhone 15. Realistic, haziness, authentic travel moment. Unedited."
        },
        {
            placeholder: '<!-- IMAGE_GOREME_PLACEHOLDER -->',
            filename: `cappadocia-goreme-${timestamp}.jpg`,
            prompt: "Street view in Goreme town. Cave hotels carved into fairy chimneys. People walking on cobblestones. Warm authentic evening light. Realistic texture, not overly HDR. Candid travel photo."
        },
        {
            placeholder: '<!-- IMAGE_UCHISAR_PLACEHOLDER -->',
            filename: `cappadocia-uchisar-${timestamp}.jpg`,
            prompt: "View from a terrace in Uchisar looking towards the castle. Quiet morning coffee scene. Soft luxury feel, natural stone textures. Authentic calm atmosphere. High resolution photo."
        },
        {
            placeholder: '<!-- IMAGE_URGUP_PLACEHOLDER -->',
            filename: `cappadocia-urgup-${timestamp}.jpg`,
            prompt: "Street photography in Urgup town centre. Historic stone mansions with detailed architecture. Locals sitting outside a cafe. Authentic Central Anatolia vibe. Bright sunlight and sharp shadows."
        },
        {
            placeholder: '<!-- IMAGE_AVANOS_PLACEHOLDER -->',
            filename: `cappadocia-avanos-${timestamp}.jpg`,
            prompt: "A peaceful riverside walk in Avanos by the Red River. Willow trees reflecting in water. Suspension bridge in background. Relaxed, local atmosphere. Unedited film look. 35mm style."
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

    const { error } = await supabase.from('articles').upsert({
        slug: ARTICLE_DATA.slug,
        title: { en: ARTICLE_DATA.title, tr: "Kapadokya'da Nerede Kalınır?" },
        meta_description: { en: ARTICLE_DATA.meta_description, tr: "Kapadokya tatili için en iyi bölgeleri keşfedin." },
        content: { en: finalContent, tr: "<p>Çeviri yakında...</p>" },
        cover_image_url: coverImageUrl,
        published_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    }, { onConflict: 'slug' });

    if (error) {
        console.error("❌ DB Insert Failed:", error);
    } else {
        console.log("✅ Cappadocia Article Added Successfully with Imagen 3 Images!");
    }
}

addCappadociaArticle();
