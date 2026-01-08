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
    slug: 'ultra-all-inclusive-in-turkey-explained-expectations-uk-guide',
    title: 'Ultra All Inclusive in Turkey Explained: Realistic Expectations for UK Travellers',
    meta_description: 'What does “Ultra All Inclusive” in Turkey actually mean? A UK-friendly guide to what’s typically included, what may be extra, how to pick the right vibe, and how to avoid surprise costs. No hotel names.',
    primary_keyword: 'ultra all inclusive in Turkey explained',
    content: `<p><strong>Quick answer:</strong> “Ultra All Inclusive” in Turkey usually means <strong>more hours</strong> (often late-night service), <strong>more included options</strong> (snacks, drinks, sometimes more venues), and a more “everything handled” day flow than standard all inclusive. But it is <strong>not a universal standard</strong> — what’s included varies by property. UK travellers should verify: <strong>alcohol rules</strong>, <strong>à la carte terms</strong>, <strong>beach bar inclusions</strong>, and <strong>premium extras</strong>.</p>

<p>This guide helps you book ultra all inclusive with the right expectations — so you get the value without the “wait, why is this extra?” moments.</p>

<p>Internal reads (placeholders):
<a href="/guide/all-inclusive-in-turkey-explained-uk-guide">All-Inclusive in Turkey: What’s Included (and What Isn’t)</a> •
<a href="/guide/a-la-carte-in-all-inclusive-how-it-works">À la Carte in All-Inclusive: How It Works</a> •
<a href="/guide/private-beach-in-turkey-usually-includes-extras-uk-travellers-miss">Private Beach: What It Includes</a> •
<a href="/guide/hidden-costs-in-turkey-resorts-uk-guide">Hidden Costs in Turkey Resorts</a> •
<a href="/guide/how-to-choose-hotel-in-turkey-checklist-uk-guide">How to Choose a Hotel in Turkey (Checklist)</a>
</p>

<!-- IMAGE_COVER_PLACEHOLDER -->

<hr/>

<h2>What “Ultra All Inclusive” usually means (UK-friendly)</h2>
<p>Think of ultra all inclusive as “all inclusive with <strong>fewer dead hours</strong> and <strong>more coverage</strong>”. In practice, it often adds:</p>

<ul>
  <li><strong>Longer service hours</strong> (late-night snacks/drinks)</li>
  <li><strong>More snack points</strong> (not just meals)</li>
  <li><strong>More drink coverage</strong> (but premium brands may still be extra)</li>
  <li><strong>More ‘on-site life’</strong> (you can stay in the resort all day without planning)</li>
</ul>

<p><strong>Simple rule:</strong> Ultra is about coverage and convenience — not automatically luxury.</p>

<hr/>

<h2>Ultra all inclusive vs all inclusive (the practical difference)</h2>
<table>
  <thead>
    <tr>
      <th>Feature</th>
      <th>All Inclusive</th>
      <th>Ultra All Inclusive</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Service hours</strong></td>
      <td>Often limited to set hours</td>
      <td>Usually longer / later</td>
    </tr>
    <tr>
      <td><strong>Snacks</strong></td>
      <td>Some snacks, often time-windowed</td>
      <td>More options, more hours</td>
    </tr>
    <tr>
      <td><strong>Drinks</strong></td>
      <td>Included basics</td>
      <td>Broader coverage, but premium can be extra</td>
    </tr>
    <tr>
      <td><strong>Convenience</strong></td>
      <td>Good</td>
      <td>Better (fewer “nothing available” moments)</td>
    </tr>
  </tbody>
</table>

<!-- IMAGE_BUFFET_PLACEHOLDER -->

<hr/>

<h2>What’s commonly included (and where UK travellers get surprised)</h2>

<h3>Usually included (typical patterns)</h3>
<ul>
  <li><strong>Main meals</strong> (buffet-style at set times)</li>
  <li><strong>Snacks</strong> between meals (time-windowed)</li>
  <li><strong>Soft drinks</strong> and a range of alcoholic drinks</li>
  <li><strong>Basic daily entertainment</strong> and facilities</li>
</ul>

<h3>Often limited (read the fine details)</h3>
<ul>
  <li><strong>Premium alcohol brands</strong> (some included, some not)</li>
  <li><strong>Imported spirits</strong> vs local options</li>
  <li><strong>Late-night food</strong> quality (can be simple by design)</li>
</ul>

<h3>Common extras (budget for these unless clearly included)</h3>
<ul>
  <li><strong>À la carte restaurants</strong> (may require booking, limits, or fees)</li>
  <li><strong>Special drinks/cocktails</strong> (premium menus)</li>
  <li><strong>Cabana/VIP sunbeds</strong> at beach/pool</li>
  <li><strong>Water sports</strong> (often separate operators)</li>
  <li><strong>Spa treatments</strong> (treatments usually extra)</li>
</ul>

<!-- IMAGE_DRINKS_PLACEHOLDER -->

<p><strong>UK-friendly mindset:</strong> Ultra all inclusive can still have “premium layers”. That doesn’t mean it’s bad — it just means you should know where your personal line is.</p>

<hr/>

<h2>The UK traveller ultra-AI checklist (use this before booking)</h2>

<h3>1) Alcohol rules that matter</h3>
<ul>
  <li>What hours are alcoholic drinks served?</li>
  <li>Are there restrictions by bar/venue (lobby vs beach bar)?</li>
  <li>What counts as “included” vs “premium”?</li>
</ul>

<h3>2) Food rhythm (this is the real value)</h3>
<ul>
  <li>Are snacks available when you actually get hungry?</li>
  <li>Are there multiple points (beach snack bar, pool snack bar)?</li>
  <li>Is late-night food offered (and what is it, realistically)?</li>
</ul>

<h3>3) Beach bar / private beach inclusions</h3>
<ul>
  <li>Are drinks/snacks included on the beach?</li>
  <li>Are sunbeds and towels included?</li>
</ul>

<p>Read: <a href="/guide/private-beach-in-turkey-usually-includes-extras-uk-travellers-miss">Private Beach: What It Includes</a>.</p>

<h3>4) À la carte rules (where confusion happens)</h3>
<ul>
  <li>How many à la carte visits are included (if any)?</li>
  <li>Do you need to book days in advance?</li>
  <li>Is there a service fee even if the meal is “included”?</li>
</ul>

<p>Read: <a href="/guide/a-la-carte-in-all-inclusive-how-it-works">À la Carte in All-Inclusive</a>.</p>

<h3>5) Quiet vs lively vibe (adults-only or family-friendly)</h3>
<ul>
  <li>Is this a calm reset holiday, or an entertainment-led holiday?</li>
  <li>Does the evening programme match your sleep preferences?</li>
</ul>

<hr/>

<h2>Who ultra all inclusive is best for (UK-friendly)</h2>

<h3>Families</h3>
<ul>
  <li>Ultra works well if you want snacks/drinks available at predictable times and minimal planning.</li>
</ul>

<h3>Friends trips</h3>
<ul>
  <li>Ultra can be great if your holiday includes late evenings and you want the resort to “carry” the trip.</li>
</ul>

<h3>Couples</h3>
<ul>
  <li>Ultra is great for switching off — but choose the right vibe (quiet vs lively) so it feels romantic, not chaotic.</li>
</ul>

<hr/>

<h2>How to get value from ultra all inclusive (without spending more)</h2>
<ul>
  <li><strong>Choose the right vibe.</strong> The best value is enjoying the resort, not paying to escape it.</li>
  <li><strong>Use the snack points.</strong> This is where ultra beats standard all inclusive.</li>
  <li><strong>Know your premium line.</strong> Decide upfront if you care about premium spirits or not.</li>
  <li><strong>Protect sleep.</strong> A great ultra stay is ruined by a noisy room position.</li>
</ul>

<hr/>

<h2>Common mistakes (framed positively)</h2>
<ul>
  <li><strong>Assuming “ultra” means luxury:</strong> it often means coverage and convenience.</li>
  <li><strong>Not checking beach-bar inclusions:</strong> this changes daily spending.</li>
  <li><strong>Ignoring vibe:</strong> a lively ultra resort can feel wrong if you wanted calm.</li>
</ul>

<hr/>

<h2>FAQs</h2>

<h3>What is ultra all inclusive in Turkey?</h3>
<p>It typically means longer service hours and broader coverage (snacks/drinks/venues) than standard all inclusive, but inclusions vary by property.</p>

<h3>Is ultra all inclusive worth it for UK travellers?</h3>
<p>It’s worth it if you want a low-effort holiday with predictable routine and fewer “dead hours”. It’s less worth it if you plan to eat out most nights and explore constantly.</p>

<h3>What should I check before booking ultra all inclusive in Turkey?</h3>
<p>Alcohol hours and inclusions, beach-bar coverage, à la carte terms, premium extras, and the overall vibe (quiet vs lively).</p>

<p><em>Last updated:</em> ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
`
};

async function run() {
    const timestamp = Date.now();
    console.log("🚀 Starting Ultra All Inclusive Article Automation...");

    // SAFE PROMPTS for Authentic Feel
    const imagesToGenerate = [
        {
            placeholder: '<!-- IMAGE_COVER_PLACEHOLDER -->',
            filename: `turkey-ultra-all-inclusive-evening-setup-authentic-${timestamp}.jpg`,
            prompt: "Evening setup at a Turkish ultra all inclusive resort. Beautifully lit pool area with tables set for dinner. Elegant, holiday atmosphere. Authentic travel photo. Realistic."
        },
        {
            placeholder: '<!-- IMAGE_BUFFET_PLACEHOLDER -->',
            filename: `turkey-all-inclusive-buffet-spread-authentic-${timestamp}.jpg`,
            prompt: "A generous buffet spread at a Turkish resort. Fresh salads, meze, and hot dishes. Clean and inviting. Authentic food photography. Realistic."
        },
        {
            placeholder: '<!-- IMAGE_DRINKS_PLACEHOLDER -->',
            filename: `turkey-hotel-bar-cocktails-authentic-${timestamp}.jpg`,
            prompt: "A bartender preparing drinks at a stylish hotel bar in Turkey. Fresh ingredients, glass of wine or cocktail on the counter. Relaxed holiday vibe. Authentic. Realistic."
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
        title: { en: ARTICLE_DATA.title, tr: "Türkiye'de Ultra Her Şey Dahil Ne Demek? (TR Pasif)" },
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
        console.log("✅ Ultra All Inclusive Article Added Successfully!");
        console.log("👉 Slug:", ARTICLE_DATA.slug);
    }
}

run();
