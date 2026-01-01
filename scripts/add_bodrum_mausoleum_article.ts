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
    slug: 'mausoleum-at-halicarnassus-bodrum-visitor-guide',
    title: 'Mausoleum at Halicarnassus (Bodrum): What to Know Before You Go (UK-Friendly Guide)',
    meta_description: 'Visiting the Mausoleum at Halicarnassus in Bodrum? A UK-friendly guide to what it is, what you’ll see today, how to plan the visit, and how to pair it with Bodrum Castle.',
    content: `
<h1>Mausoleum at Halicarnassus (Bodrum): What to Know Before You Go (UK-Friendly Guide)</h1>

<p><strong>Quick answer:</strong> The Mausoleum at Halicarnassus is one of Bodrum’s most meaningful history stops because it’s connected to the ancient world-famous mausoleum that gave the word “mausoleum” its modern meaning. Today, you visit the <strong>site and remains</strong> rather than a fully standing monument—so go with the mindset of “I’m standing where it was” and you’ll enjoy it far more.</p>

<p>Useful internal reads:
<a href="/guide/where-to-stay-in-bodrum-best-areas-guide">Where to Stay in Bodrum (Best Areas)</a> •
<a href="/guide/bodrum-itinerary-3-days-uk-friendly-guide">Bodrum Itinerary: 3 Days (UK-Friendly)</a> •
<a href="/guide/bodrum-castle-history-and-visitor-guide">Bodrum Castle: What to Know Before You Go</a>
</p>

<hr/>

<!-- IMAGE_COVER_PLACEHOLDER -->

<h2>What is the Mausoleum at Halicarnassus?</h2>
<p>The Mausoleum at Halicarnassus was an extraordinary ancient tomb built in the city of Halicarnassus (modern-day Bodrum). It’s commonly included among the <strong>Seven Wonders of the Ancient World</strong>, which is why it’s such a high-value stop even for travellers who don’t normally “do museums”.</p>

<p><strong>UK traveller tip:</strong> If you love sites that make you feel time-travel-y, this is a great one—because you’re in a modern seaside town, then suddenly you’re standing in a place with deep ancient history.</p>

<hr/>

<h2>What will you see today? (realistic expectations)</h2>
<p>This is the key to enjoying the visit:</p>
<ul>
  <li>You’re not coming to see a complete, intact giant structure.</li>
  <li>You are coming to see the <strong>archaeological site</strong>, the layout, the remains, and the context.</li>
  <li>The experience is about <strong>meaning + imagination + on-site information</strong>, not “wow, it’s still fully standing”.</li>
</ul>

<p>If you arrive expecting “a huge preserved monument,” you’ll feel underwhelmed. If you arrive expecting “a powerful historical location,” you’ll love it.</p>

<!-- IMAGE_SITE_PLACEHOLDER -->

<hr/>

<h2>How long should you plan for?</h2>
<p>Plan enough time to:</p>
<ul>
  <li>walk the site slowly,</li>
  <li>read the on-site information,</li>
  <li>and take a moment to connect the story to the place.</li>
</ul>

<p><strong>Best approach:</strong> treat it as a <em>high-meaning, low-stress</em> stop—not a full-day mission.</p>

<hr/>

<h2>Best time to go (comfort-first, no fake timings)</h2>
<ul>
  <li><strong>Earlier in the day</strong> usually feels calmer and more comfortable.</li>
  <li>If you’re visiting in warmer months, plan your more walk-heavy bits earlier and keep your afternoon more relaxed.</li>
</ul>

<p><strong>Practical note:</strong> opening hours can vary by season, so if your day depends on it, confirm the current schedule on the day via official listings or entrance signage.</p>

<hr/>

<h2>How to pair the Mausoleum with a perfect Bodrum day</h2>

<h3>Plan A: “History day that still feels like a holiday”</h3>
<ol>
  <li><strong>Morning:</strong> Bodrum Castle (your scenic anchor by the harbour)</li>
  <li><strong>Midday:</strong> relaxed Old Town wander + simple lunch</li>
  <li><strong>Afternoon:</strong> Mausoleum site (short, meaningful stop)</li>
  <li><strong>Evening:</strong> marina/harbour stroll + dinner</li>
</ol>

<h3>Plan B: “Short stay / just the highlights”</h3>
<ol>
  <li>Do the Mausoleum as a quick cultural moment</li>
  <li>Then keep the rest of the day open for beach time or a peninsula-area evening</li>
</ol>

<p><strong>Why this works:</strong> You get “I saw something historic” without sacrificing the relaxed Bodrum rhythm.</p>

<hr/>

<h2>What to bring (small upgrades)</h2>
<ul>
  <li><strong>Comfortable shoes</strong> (you’ll enjoy it more when your feet are happy)</li>
  <li><strong>Water</strong> (especially in warm weather)</li>
  <li><strong>Power bank</strong> (you’ll take more photos than you expect)</li>
</ul>

<!-- IMAGE_RELIEF_PLACEHOLDER -->

<hr/>

<h2>How to enjoy it if you’re not a “history person”</h2>
<p>If history isn’t usually your thing, try this simple approach:</p>
<ul>
  <li>Give yourself a 10-minute “curiosity window” at the start.</li>
  <li>Read just enough to understand <strong>why</strong> the site mattered.</li>
  <li>Then walk slowly and imagine the scale and craftsmanship it once had.</li>
</ul>

<p>That’s it. You don’t need a lecture—just a little context.</p>

<hr/>

<h2>Common mistakes (so the visit stays enjoyable)</h2>
<ul>
  <li><strong>Mistake:</strong> expecting a fully standing wonder. <strong>Fix:</strong> expect a site and story—then it feels special.</li>
  <li><strong>Mistake:</strong> cramming it into a packed timetable. <strong>Fix:</strong> pair it with one other anchor (castle) and keep the rest light.</li>
  <li><strong>Mistake:</strong> skipping the on-site info entirely. <strong>Fix:</strong> give it 5 minutes—your whole experience improves.</li>
</ul>

<hr/>

<h2>FAQs</h2>

<h3>Is the Mausoleum at Halicarnassus worth visiting?</h3>
<p>Yes—if you like meaningful places and you go with the right expectations (site + story). It’s one of Bodrum’s most iconic historical connections.</p>

<h3>Is it good for a short trip?</h3>
<p>Yes. It’s a strong “high meaning, low time” stop—perfect for 3–5 night trips.</p>

<h3>Can I combine it with Bodrum Castle?</h3>
<p>Absolutely. Castle in the morning, Mausoleum later, and you’ve covered Bodrum’s two most famous history anchors without rushing.</p>

<h3>Is it family-friendly?</h3>
<p>Yes, especially if you keep the visit short and focus on the “Seven Wonders” story—it’s an easy hook for kids.</p>

<h3>Do I need to book ahead?</h3>
<p>Usually not for planning a normal day, but if you’re travelling in peak season, confirm the current entry setup and hours on the day.</p>

<h3>What should I do after the visit?</h3>
<p>Go back to “holiday mode”: coffee, Old Town wandering, then a harbour walk—Bodrum is best when you mix culture with calm.</p>

<h3>What’s the best base to visit easily?</h3>
<p>Bodrum Town (Centre) is the easiest for walkability and simple logistics.</p>

<p><em>Last updated:</em> ${new Date().toLocaleDateString('en-GB')}</p>
`
};

async function addBodrumMausoleumArticle() {
    const timestamp = Date.now();

    // --- Authentic Mode Prompts (Imagen 3) ---
    const imagesToGenerate = [
        {
            placeholder: '<!-- IMAGE_COVER_PLACEHOLDER -->',
            filename: `mausoleum-ruins-context-${timestamp}.jpg`,
            prompt: "Ancient ruins of the Mausoleum at Halicarnassus in Bodrum. Stone foundations, broken columns, and green trees. Authentic archaeological site photography."
        },
        {
            placeholder: '<!-- IMAGE_SITE_PLACEHOLDER -->',
            filename: `mausoleum-site-view-${timestamp}.jpg`,
            prompt: "View of the Mausoleum at Halicarnassus archaeological site. Ancient white marble fragments on the ground. Authentic historic travel photography."
        },
        {
            placeholder: '<!-- IMAGE_RELIEF_PLACEHOLDER -->',
            filename: `mausoleum-relief-detail-${timestamp}.jpg`,
            prompt: "Close up detail of an ancient carved white marble relief or frieze fragment. Authentic museum artifact photography."
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
        title: { en: ARTICLE_DATA.title, tr: "Halikarnas Mozolesi (Bodrum): Ziyaret ve Tarih Rehberi" },
        meta_description: { en: ARTICLE_DATA.meta_description, tr: "Halikarnas Mozolesi nerede ve nasıl gezilir? Bodrum'daki bu antik dünya harikası hakkında bilmeniz gerekenler." },
        content: { en: finalContent, tr: "<p>Çeviri yakında...</p>" },
        location: { en: 'Bodrum', tr: 'Bodrum' },
        cover_image_url: coverImageUrl,
        published_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    }, { onConflict: 'slug' });

    if (error) {
        console.error("❌ DB Insert Failed:", error);
    } else {
        console.log("✅ Bodrum Mausoleum Article Added Successfully with Imagen 3 Images!");
    }
}

addBodrumMausoleumArticle();
