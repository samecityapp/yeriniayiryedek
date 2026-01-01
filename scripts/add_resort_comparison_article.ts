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
    slug: 'fethiye-vs-bodrum-vs-marmaris-travel-comparison',
    title: 'Fethiye vs Bodrum vs Marmaris: Where Should UK Travellers Go?',
    meta_description: 'Choosing between Fethiye, Bodrum and Marmaris? Compare vibe, beaches, scenery, culture, nightlife, airports and who each place suits—UK-first, no fluff.',
    content: `
<h1>Fethiye vs Bodrum vs Marmaris: Where Should UK Travellers Go in Turkey?</h1>

<p><strong>Quick answer:</strong> Choose <strong>Fethiye</strong> for dramatic scenery, the Blue Lagoon vibe nearby, boat days and outdoors (including the famous Lycian Way starting point). Choose <strong>Bodrum</strong> for Aegean style, marinas, dining, and culture (with the landmark Bodrum Castle). Choose <strong>Marmaris</strong> for an easy resort rhythm, long seafront walks, and classic “sun + sea + lively town” energy.</p>

<p>Planning a Fethiye-based trip? Start here:
<a href="/guide/where-to-stay-in-fethiye-best-areas-guide">Where to Stay in Fethiye (Best Areas)</a> •
<a href="/guide/oludeniz-vs-calis-vs-fethiye-where-to-stay">Ölüdeniz vs Çalış vs Fethiye Centre: Where to Stay</a> •
<a href="/guide/fethiye-boat-trips-what-to-expect-guide">Fethiye Boat Trips: How to Choose</a> •
<a href="/guide/fethiye-to-oludeniz-how-to-get-there-dolmus-bus-taxi">Fethiye to Ölüdeniz: How to Get There</a>
</p>

<hr/>

<!-- IMAGE_COVER_PLACEHOLDER -->

<h2>The 60-second decision (be honest about your holiday personality)</h2>
<ul>
  <li><strong>“I want wow scenery + boat days + outdoors” →</strong> Fethiye (and the Ölüdeniz area nearby)</li>
  <li><strong>“I want chic Aegean nights + marina life + culture” →</strong> Bodrum</li>
  <li><strong>“I want an easy classic resort base with a big promenade feel” →</strong> Marmaris</li>
</ul>

<hr/>

<h2>What each destination is really like</h2>

<h3>Fethiye: the “do a bit of everything” base (with a nature edge)</h3>
<p>Fethiye works brilliantly for UK travellers who want variety without constantly relocating. You can do boat days, calm beach days, viewpoints, and “small-town evenings” without feeling boxed in.</p>

<p>It’s also a gateway to one of Turkey’s most famous long-distance walks: the <strong>Lycian Way</strong> is a coastal trail that connects the Fethiye area towards Antalya and is commonly described as hundreds of kilometres long along the Turquoise Coast.</p>

<p><strong>Best for:</strong> couples who want scenery, active travellers, mixed groups who can’t agree on one vibe, anyone who loves boat/swim stops.</p>
<p><strong>Watch-out:</strong> if you want “clubby Aegean glamour” every night, Bodrum usually fits that brief more naturally.</p>

<!-- IMAGE_FETHIYE_PLACEHOLDER -->

<h3>Bodrum: Aegean style, marinas, culture, and a stronger “dress up” energy</h3>
<p>Bodrum is where Turkey’s Aegean side leans more “Mediterranean chic”: marinas, evenings out, and a stronger sense of being in a place that’s built around dining and nightlife as much as the beach.</p>

<p>If you like a destination with a clear landmark, Bodrum delivers: <strong>Bodrum Castle</strong> (also known as the Castle of St Peter) is a major historic fortification and is prominently positioned by the harbour.</p>

<p><strong>Best for:</strong> grown-up trips, friends who care about restaurants and bars, travellers who want culture with their coastline.</p>
<p><strong>Watch-out:</strong> if you want lush green mountains meeting the sea and lots of “outdoor day trip” variety, Fethiye/Marmaris can feel more naturally set up for that.</p>

<!-- IMAGE_BODRUM_PLACEHOLDER -->

<h3>Marmaris: classic resort flow + seafront strolling + easy “holiday mode”</h3>
<p>Marmaris is a straightforward holiday base: you’ll find a marina-town feel, a long seafront you can walk nightly, and a wide choice of day-to-day holiday routines (beach, boat, dinner, repeat).</p>

<p>For a cultural anchor, Marmaris has a museum experience housed within <strong>Marmaris Castle</strong>, with official museum listings describing the site and its visitor status.</p>

<p><strong>Best for:</strong> travellers who want a big resort-town feel and don’t want to overthink logistics.</p>
<p><strong>Watch-out:</strong> if your priority is the “iconic lagoon” look, that’s much more associated with the Ölüdeniz/Fethiye side.</p>

<!-- IMAGE_MARMARIS_PLACEHOLDER -->

<hr/>

<h2>Beaches & water: what’s different?</h2>

<h3>Fethiye side</h3>
<p>The Fethiye region is known for variety: town beaches plus easy access to famous coastal scenery. If the Blue Lagoon look is your dream, that’s typically tied to the Ölüdeniz/Kumburnu area near Fethiye.</p>

<h3>Bodrum side</h3>
<p>Bodrum is more “Aegean beach club energy” in many areas: swimming, marinas, and nights out tend to be part of the package. If you enjoy splitting your day between sea and town, Bodrum makes that feel natural.</p>

<h3>Marmaris side</h3>
<p>Marmaris offers a classic resort coastline with lots of bays and a strong promenade culture. It’s the kind of place where “evening stroll + sea air” becomes your daily ritual.</p>

<hr/>

<h2>Transport reality (what UK travellers should actually plan around)</h2>

<h3>Flying in: which airports make life easiest?</h3>
<ul>
  <li><strong>For Fethiye and Marmaris:</strong> Dalaman Airport is the usual arrival airport for this coastline, and the airport itself lists shuttle/bus options including <strong>Havaş</strong> services to <strong>Fethiye</strong> and <strong>Marmaris</strong>.</li>
  <li><strong>For Bodrum:</strong> Milas–Bodrum Airport is the natural entry point, and the airport’s own site references transport options including Havaş shuttle services and MUTTAŞ buses.</li>
</ul>

<p><strong>No-fake-timings rule:</strong> bus/shuttle times can change by season and conditions. MUTTAŞ explicitly notes that published times are planned and may change due to factors like traffic or other disruptions, and it also states that credit card payments are accepted on its vehicles on key lines.</p>

<h3>Moving around once you’ve arrived</h3>
<p>Fethiye is very practical for local hops (for example, the Fethiye–Ölüdeniz public route is published by MUTTAŞ as a defined line and route).</p>
<p>Bodrum is more “peninsula” travel—great if you’re happy doing short hops between bays/towns. Marmaris is a classic resort base with lots of local day-trip style movement.</p>

<hr/>

<h2>Who should pick which destination?</h2>

<h3>Couples</h3>
<ul>
  <li><strong>Fethiye:</strong> best if you want scenery-led romance (boat day + viewpoints + calm dinners).</li>
  <li><strong>Bodrum:</strong> best if your romance includes “dress up and go out”.</li>
  <li><strong>Marmaris:</strong> best if you want easy, repeatable evenings by the sea.</li>
</ul>

<h3>Families</h3>
<ul>
  <li><strong>Fethiye:</strong> strong if you want varied days and a mix of calm/active options.</li>
  <li><strong>Marmaris:</strong> strong if you want simple resort rhythm without overplanning.</li>
  <li><strong>Bodrum:</strong> great for families too, but choose your exact area carefully depending on noise/pace.</li>
</ul>

<h3>Friends trips</h3>
<ul>
  <li><strong>Bodrum:</strong> often the winner for nightlife + dining energy (plus the harbour/castle landmark).</li>
  <li><strong>Marmaris:</strong> classic “holiday town” vibe, easy nights, big choice.</li>
  <li><strong>Fethiye:</strong> best when the group wants boat days and outdoors, not just nightlife.</li>
</ul>

<h3>Active travellers</h3>
<p>Fethiye is the most obvious fit because of its outdoors identity and the Lycian Way connection.</p>

<hr/>

<h2>Trip length strategy (this is what saves holidays)</h2>
<ul>
  <li><strong>3–4 nights:</strong> pick one base and do day trips. Don’t waste nights moving.</li>
  <li><strong>5–7 nights:</strong> one base is still fine, but you can add a single “contrast day” (e.g., boat day + culture day).</li>
  <li><strong>10+ nights:</strong> consider two bases if you truly want different vibes (e.g., Fethiye region + Bodrum), but only if you enjoy travel days.</li>
</ul>

<hr/>

<h2>Common mistakes (and the fixes)</h2>
<ul>
  <li><strong>Mistake:</strong> choosing based on one viral clip. <strong>Fix:</strong> choose based on your daily routine preference (quiet vs lively, beach-first vs town-first).</li>
  <li><strong>Mistake:</strong> underestimating airport logistics. <strong>Fix:</strong> pick the destination with the easiest entry airport for your plan.</li>
  <li><strong>Mistake:</strong> expecting one destination to be “everything”. <strong>Fix:</strong> choose your main vibe, then day-trip for the rest.</li>
</ul>

<hr/>

<h2>FAQs</h2>

<h3>Which is best for UK first-timers: Fethiye, Bodrum or Marmaris?</h3>
<p>Fethiye is a great first choice if you want variety and scenery. Marmaris is great if you want a straightforward resort rhythm. Bodrum is great if you want Aegean nights + culture in one place.</p>

<h3>Which has the easiest airport situation?</h3>
<p>For Fethiye/Marmaris, Dalaman Airport is the usual entry and lists shuttle/bus options to both towns. For Bodrum, Milas–Bodrum Airport lists shuttle/bus options including Havaş and MUTTAŞ.</p>

<h3>Is there a cultural “must-see” in Bodrum?</h3>
<p>Bodrum Castle (Castle of St Peter) is the standout landmark by the harbour.</p>

<h3>Is there a cultural “must-see” in Marmaris?</h3>
<p>Marmaris Museum is located within Marmaris Castle and is described in official museum listings.</p>

<h3>Which destination suits an active holiday?</h3>
<p>Fethiye is the strongest fit for outdoors because it’s linked with the Lycian Way long-distance trail area.</p>

<h3>Do local buses/shuttles run on fixed times?</h3>
<p>Schedules can change. MUTTAŞ notes published times are planned and may change due to conditions; always verify on the day via official channels.</p>

<p><em>Last updated:</em> ${new Date().toLocaleDateString('en-GB')}</p>
`
};

async function addResortComparisonArticle() {
    const timestamp = Date.now();

    // --- Authentic Mode Prompts (Imagen 3) ---
    const imagesToGenerate = [
        {
            placeholder: '<!-- IMAGE_COVER_PLACEHOLDER -->',
            filename: `turkey-coast-comparison-${timestamp}.jpg`,
            prompt: "A stunning Turkish turquoise coast landscape featuring pine trees, blue sea, and mountains. Sunny summer day. Authentic travel photography style."
        },
        {
            placeholder: '<!-- IMAGE_FETHIYE_PLACEHOLDER -->',
            filename: `fethiye-nature-vibe-${timestamp}.jpg`,
            prompt: "Beautiful green hills meeting the sea in Fethiye area. A small boat on the water. Nature focused authentic travel photography."
        },
        {
            placeholder: '<!-- IMAGE_BODRUM_PLACEHOLDER -->',
            filename: `bodrum-castle-view-${timestamp}.jpg`,
            prompt: "View of Bodrum Castle by the harbour with white Aegean houses and bougainvillea flowers. Sunny day. Authentic cultural travel photography."
        },
        {
            placeholder: '<!-- IMAGE_MARMARIS_PLACEHOLDER -->',
            filename: `marmaris-promenade-vibe-${timestamp}.jpg`,
            prompt: "Marmaris seafront promenade with palm trees, boats in the marina, and people walking. Sunny holiday atmosphere. Authentic resort photography."
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
        title: { en: ARTICLE_DATA.title, tr: "Fethiye vs Bodrum vs Marmaris: Nereye Gitmeli?" },
        meta_description: { en: ARTICLE_DATA.meta_description, tr: "Fethiye, Bodrum ve Marmaris karşılaştırması. Tatil tarzınıza göre en iyi seçimi yapın. Plajlar, gece hayatı ve gezilecek yerler." },
        content: { en: finalContent, tr: "<p>Çeviri yakında...</p>" },
        location: { en: 'Turkey Travel Guide', tr: 'Türkiye Gezi Rehberi' },
        cover_image_url: coverImageUrl,
        published_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    }, { onConflict: 'slug' });

    if (error) {
        console.error("❌ DB Insert Failed:", error);
    } else {
        console.log("✅ Comparison Article Added Successfully with Imagen 3 Images!");
    }
}

addResortComparisonArticle();
