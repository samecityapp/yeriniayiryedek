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
    slug: 'bodrum-vs-antalya-better-for-uk-travellers-guide',
    title: 'Bodrum vs Antalya: Which Is Better for UK Travellers?',
    meta_description: 'Bodrum or Antalya for your Turkey holiday? Compare vibe, beaches, day trips, nightlife, culture, airports and who each suits—UK-friendly, no hotel names.',
    content: `
<h1>Bodrum vs Antalya: Which Is Better for UK Travellers?</h1>

<p><strong>Quick answer:</strong> Choose <strong>Bodrum</strong> if you want an Aegean-style trip with marina evenings, a “dress up or chill” vibe, and a peninsula you explore by picking one area per day. Choose <strong>Antalya</strong> if you want a bigger “holiday engine”: a large city + coast setup with easy access to the wider region and lots of options for different trip styles.</p>

<p>Start with the base guides:
<a href="/guide/where-to-stay-in-bodrum-best-areas-guide">Where to Stay in Bodrum (Best Areas)</a> •
<a href="/guide/where-to-stay-in-antalya-best-areas-guide-uk">Where to Stay in Antalya (Best Areas)</a> •
<a href="/guide/bodrum-itinerary-3-days-uk-friendly-guide">Bodrum Itinerary: 3 Days (UK-Friendly)</a> •
<a href="/guide/antalya-itinerary-4-days-uk-friendly-guide">Antalya Itinerary: 4 Days (UK-Friendly)</a>
</p>

<hr/>

<!-- IMAGE_COVER_PLACEHOLDER -->

<h2>The 60-second decision (be honest about your holiday personality)</h2>
<ul>
  <li><strong>“I want Aegean nights + marina atmosphere + peninsula exploring” →</strong> Bodrum</li>
  <li><strong>“I want a big, versatile destination with loads of options” →</strong> Antalya</li>
  <li><strong>“We’re a mixed group and need variety without stress” →</strong> Antalya usually wins</li>
  <li><strong>“We want a stylish, compact-feeling trip” →</strong> Bodrum usually wins</li>
</ul>

<hr/>

<h2>1) Vibe: what each place feels like day to day</h2>

<h3>Bodrum: Aegean style, marina evenings, and “pick your corner” days</h3>
<p>Bodrum is best when you treat it like a peninsula of different moods. You choose your base, then spend each day in one “corner” (Town, a beach area, a marina-style area, a sunset area). This keeps the trip relaxed and makes evenings easy.</p>

<p><strong>Best for:</strong> couples, friends trips, people who care about atmosphere, travellers who like a polished evening scene without needing a massive city.</p>

<!-- IMAGE_BODRUM_VIBE_PLACEHOLDER -->

<h3>Antalya: a bigger holiday hub with more built-in variety</h3>
<p>Antalya is a larger destination that can feel like several holidays in one: city energy, beach time, and access to wider regional experiences. It’s a strong choice for longer stays because you can stay in one base and still vary your days.</p>

<p><strong>Best for:</strong> families, first-timers who want flexibility, travellers who like having lots of options and easy logistics.</p>

<!-- IMAGE_ANTALYA_VIBE_PLACEHOLDER -->

<hr/>

<h2>2) Beaches & water: the practical difference</h2>

<h3>Bodrum beach style</h3>
<p>Bodrum beach days are often about choosing the right area for your mood: calmer bays, beach-first areas, or a more social scene depending on where you stay. It’s great when you like “curated” day plans (one area, one vibe, done well).</p>

<h3>Antalya beach style</h3>
<p>Antalya is often more “big coastline energy” with lots of beach access and a wider spread of experiences. If your priority is spending most days on the coast but still having city comforts and variety, Antalya is a very safe choice.</p>

<hr/>

<h2>3) Culture & landmarks: quick expectations</h2>

<h3>Bodrum’s easy cultural anchors</h3>
<p>Bodrum Town has strong “short but meaningful” cultural stops that fit a holiday rhythm. You can do a historic site in the morning and still feel like you had a beach holiday by afternoon.</p>

<h3>Antalya’s broader range</h3>
<p>Antalya works well if you want to mix “classic holiday days” with culture without feeling like you’re constantly relocating. It’s also a good base if you want to explore different parts of the region during a longer stay.</p>

<hr/>

<h2>4) Getting in and getting around (UK travellers care about this more than they think)</h2>

<h3>Flying into Bodrum: Milas–Bodrum Airport (BJV)</h3>
<p>Milas–Bodrum Airport’s official pages list multiple ways to reach your destination, including <strong>HAVAŞ shuttle</strong> services and <strong>MUTTAŞ</strong> public buses.</p>

<p>For public buses, the airport also describes a useful planning detail: shuttles for departure flights can depart from the Bodrum Bus Terminal around <strong>2 hours before flight time</strong> (still, always confirm the current plan on your travel day).</p>

<h3>Flying into Antalya: Antalya Airport (AYT)</h3>
<p>Antalya Airport’s official transport page notes <strong>free shuttle services between terminals</strong> with departures every <strong>20 minutes</strong>, plus municipality bus services on the same route.</p>

<p>Antalya Airport also notes there are different bus and rail/public transport services connecting the airport to the city centre and further afield.</p>

<h3>Which feels easier?</h3>
<ul>
  <li><strong>Bodrum:</strong> easier when your trip is “one peninsula base + curated days”.</li>
  <li><strong>Antalya:</strong> easier when you want “big destination flexibility” and a wide range of transport options from the airport.</li>
</ul>

<p><strong>Simple rule:</strong> if you’re landing late, the most comfortable experience in either destination is usually a door-to-door option (taxi/transfer). If you land daytime and enjoy value travel, public transport can be great—just confirm the current details on the day.</p>

<hr/>

<h2>5) Best option by traveller type (UK-focused)</h2>

<h3>Couples</h3>
<ul>
  <li><strong>Choose Bodrum if:</strong> you want stylish evenings, marina strolls, and a “choose your vibe” peninsula feel.</li>
  <li><strong>Choose Antalya if:</strong> you want maximum variety and the option to mix city energy with beach days.</li>
</ul>

<h3>Families</h3>
<ul>
  <li><strong>Antalya</strong> often wins for families because it’s easier to keep everyone happy with variety and options.</li>
  <li><strong>Bodrum</strong> is great too—especially if you choose a calmer base and keep plans simple (one area per day).</li>
</ul>

<h3>Friends trips</h3>
<ul>
  <li><strong>Bodrum</strong> is strong if your friends trip is about atmosphere, dining, and a polished evening scene.</li>
  <li><strong>Antalya</strong> is strong if your friends trip is about variety, bigger “holiday hub” energy, and lots of choices.</li>
</ul>

<h3>Active travellers</h3>
<p>If “outdoors and routes” matter to you, the region between <strong>Fethiye and Antalya</strong> is famously associated with the <strong>Lycian Way</strong>, a long-distance marked trail described as running from Fethiye towards Antalya.</p>

<p>In that case, your decision can be:</p>
<ul>
  <li><strong>Bodrum</strong> for Aegean vibe + chilled days,</li>
  <li><strong>Antalya</strong> if you want to be closer to a broader range of routes and regional exploration over a longer stay.</li>
</ul>

<hr/>

<h2>6) Trip length strategy (this is what saves holidays)</h2>

<h3>If you have 3–4 nights</h3>
<ul>
  <li><strong>Bodrum:</strong> excellent. Stay central (or your chosen vibe area) and keep it compact.</li>
  <li><strong>Antalya:</strong> also works, but choose one area and don’t over-plan day trips.</li>
</ul>

<h3>If you have 5–7 nights</h3>
<ul>
  <li><strong>Bodrum:</strong> great if you love peninsula days (town day + beach day + marina day + sunset day).</li>
  <li><strong>Antalya:</strong> great if you want a mix of city comfort and coastline time with flexible options.</li>
</ul>

<h3>If you have 10+ nights</h3>
<p>Both work, but Antalya’s “bigger hub” nature can feel easier for longer stays because you can vary your days without feeling like you’ve “done it all” too quickly.</p>

<hr/>

<h2>7) Common mistakes (framed positively, no scare tactics)</h2>
<ul>
  <li><strong>Mistake:</strong> treating Bodrum like one town. <strong>Better move:</strong> pick one peninsula area per day.</li>
  <li><strong>Mistake:</strong> trying to do too many day trips in Antalya. <strong>Better move:</strong> keep 1–2 big days and leave space for relaxed beach time.</li>
  <li><strong>Mistake:</strong> relying on old transport screenshots. <strong>Better move:</strong> confirm the latest info on official airport/operator pages on your travel day.</li>
</ul>

<hr/>

<h2>8) Copy/paste planning checklist (UK travellers)</h2>
<ul>
  <li>Decide your “default vibe”: stylish peninsula (Bodrum) or big flexible hub (Antalya)</li>
  <li>Choose your base area (don’t leave it random)</li>
  <li>Save your accommodation map pin</li>
  <li>Pick your arrival plan: public transport (daytime) vs taxi/transfer (comfort)</li>
  <li>Plan one “anchor day” and keep the rest flexible</li>
  <li>Leave buffer time on travel days</li>
  <li>Verify current airport transport details on official pages</li>
</ul>

<hr/>

<h2>FAQs</h2>

<h3>Which is better for UK first-timers: Bodrum or Antalya?</h3>
<p>Antalya is usually easier for first-timers who want maximum variety and options. Bodrum is ideal if you want a stylish, peninsula-based trip with a clear Aegean vibe.</p>

<h3>Which is better for a short break (3–4 nights)?</h3>
<p>Bodrum is often perfect because it feels compact and “done well” in a short time. Antalya also works—just keep your plan focused to one area.</p>

<h3>Which has easier airport transport?</h3>
<p>Both have strong options. Bodrum’s airport lists HAVAŞ and MUTTAŞ options. Antalya Airport lists terminal shuttles and public transport options.</p>

<h3>Do the airports have terminal shuttles?</h3>
<p>Antalya Airport states it operates complimentary ring shuttle services between terminals, with departures every 20 minutes.</p>

<h3>Is Bodrum only for nightlife?</h3>
<p>No—Bodrum is great for calm beach days, slow sunsets, and polished evenings too. It’s really about choosing the right area.</p>

<h3>Is Antalya only for resort stays?</h3>
<p>No—Antalya can be a flexible base that mixes city comfort and coastline time, depending on where you stay and how you plan your days.</p>

<h3>If I like hiking routes, which should I pick?</h3>
<p>If you want to be closer to the Fethiye-to-Antalya long-distance trail region (Lycian Way), Antalya can be a stronger hub.</p>

<p><em>Last updated:</em> ${new Date().toLocaleDateString('en-GB')}</p>
`
};

async function addBodrumVsAntalyaArticle() {
    const timestamp = Date.now();

    // --- Authentic Mode Prompts (Imagen 3) ---
    const imagesToGenerate = [
        {
            placeholder: '<!-- IMAGE_COVER_PLACEHOLDER -->',
            filename: `bodrum-vs-antalya-cover-${timestamp}.jpg`,
            prompt: "A split composition or wide panoramic concept showing the contrast between Bodrum's white Aegean architecture with bougainvillea vs Antalya's Mediterranean coast with mountains and palm trees. Sunny varied landscape. Authentic travel photography."
        },
        {
            placeholder: '<!-- IMAGE_BODRUM_VIBE_PLACEHOLDER -->',
            filename: `bodrum-aegean-vibe-${timestamp}.jpg`,
            prompt: "Bodrum town vibe. White flat-roofed houses, blue shutters, a marina promenade with yachts in foreground. Aegean atmosphere. Authentic travel photography."
        },
        {
            placeholder: '<!-- IMAGE_ANTALYA_VIBE_PLACEHOLDER -->',
            filename: `antalya-coast-vibe-${timestamp}.jpg`,
            prompt: "Antalya coast vibe. High cliffs, blue Mediterranean sea, green parks, and distant mountains. City meets sea atmosphere. Authentic travel photography."
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
        title: { en: ARTICLE_DATA.title, tr: "Bodrum mu Antalya mı? Tatil İçin Hangisi Daha İyi?" },
        meta_description: { en: ARTICLE_DATA.meta_description, tr: "Bodrum vs Antalya: Hangisini seçmeli? Plajlar, gece hayatı, gezilecek yerler ve aile tatili için karşılaştırma." },
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
        console.log("✅ Bodrum vs Antalya Comparison Article Added Successfully with Imagen 3 Images!");
    }
}

addBodrumVsAntalyaArticle();
