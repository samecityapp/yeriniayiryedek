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
    slug: 'turkey-entry-requirements-uk-citizens',
    title: 'Turkey Entry Requirements for UK Citizens (Passport, Visa, Rules) — 2026 Guide',
    meta_description: 'UK citizens travelling to Turkey: passport validity rules, visa-free stay limits, e-visa cases, border stamps, children travel rules and customs limits.',
    content: `
<h1>Turkey Entry Requirements for UK Citizens (Passport, Visa, Rules) — 2026 Guide</h1>

<p><strong>Quick answer:</strong> If you’re travelling on a full <strong>British citizen passport</strong>, you can visit Turkey for <strong>tourism or business for up to 90 days in any 180-day period without a visa</strong>. Your passport must have an <strong>expiry date at least 150 days after your arrival date</strong> and at least <strong>1 blank page</strong>. Always check the latest GOV.UK travel advice shortly before departure because entry rules can change.</p>

<hr/>

<!-- IMAGE_COVER_PLACEHOLDER -->

<h2>1) Passport validity: the rule UK travellers get caught by</h2>

<p>To enter Turkey on a full British citizen passport, GOV.UK says your passport must:</p>
<ul>
  <li>have an <strong>expiry date at least 150 days after</strong> the date you arrive, and</li>
  <li>have <strong>at least 1 blank page</strong>.</li>
</ul>
<p>If you don’t meet this, you can be denied entry.</p>

<p><strong>If you live in Turkey</strong>, GOV.UK notes your passport must be valid for <strong>6 months from the date you arrive</strong>.</p>

<p><strong>Why 150 days?</strong> Turkey’s Ministry of Foreign Affairs explains a general rule: your passport should be valid for <strong>60 days beyond</strong> the duration of stay. For a 90-day stay, that totals <strong>150 days</strong> (90 + 60).</p>

<h3>Land borders: get the stamp</h3>
<p>GOV.UK also warns: if you enter at a land border, make sure officials <strong>stamp and date your passport</strong>.</p>

<hr/>

<h2>2) Do UK citizens need a visa for Turkey?</h2>

<p><strong>No</strong> — not for most short trips on a full British citizen passport.</p>
<ul>
  <li><strong>Visa-free:</strong> Up to <strong>90 days in any 180-day period</strong>, for <strong>tourism or business</strong>.</li>
  <li><strong>If you have another type of British passport</strong> (not a “British citizen” passport): you may need a visa and should check with the Turkish Embassy/Consulate.</li>
  <li><strong>Work, study, medical</strong> or other special cases: check official visa guidance and get the correct permits.</li>
</ul>

<p>If you do need a visa, Turkey’s official guidance points to the <strong>e-Visa system</strong> (for eligible nationalities and travel purposes like tourism/commerce).</p>

<hr/>

<h2>3) Day trips from Turkey to Greek islands (important 2026 detail)</h2>

<p>GOV.UK notes Greece is in the Schengen Zone and has introduced the EU <strong>Entry/Exit System (EES)</strong>. If you do a day trip from Turkey into Greece, EES may add a few extra minutes per passenger, so expect longer border waits than you’d assume.</p>

<!-- IMAGE_BORDER_PLACEHOLDER -->

<hr/>

<h2>4) Travelling with children (dual British–Turkish nationals)</h2>

<p>GOV.UK says if you’re leaving Turkey with a <strong>dual British–Turkish national child</strong> aged 18 or under, you may need to show <strong>permission to travel</strong> from the Turkish parent.</p>

<hr/>

<h2>5) Vaccines + health entry requirements</h2>

<p>For vaccine requirements and recommended vaccinations, GOV.UK directs travellers to <strong>TravelHealthPro’s Turkey guide</strong>.</p>

<hr/>

<h2>6) Customs rules + money limits (don’t get surprised at the airport)</h2>

<p>GOV.UK highlights strict customs rules and that some goods are prohibited.</p>

<p><strong>Money limits (as stated by GOV.UK):</strong></p>
<ul>
  <li>No limit on how much foreign currency or Turkish lira you can bring <strong>into</strong> Turkey.</li>
  <li>You must not take Turkish lira worth more than <strong>USD 5,000</strong> out of Turkey.</li>
  <li>If you take out other currency worth more than <strong>USD 5,000</strong>, you must declare it to Turkish Customs (and may need to show where it came from).</li>
</ul>

<!-- IMAGE_CUSTOMS_PLACEHOLDER -->

<hr/>

<h2>Copy/paste checklist (UK travellers)</h2>
<ul>
  <li><strong>Passport</strong> expiry is <strong>150+ days</strong> after arrival + <strong>1 blank page</strong>.</li>
  <li><strong>Visa:</strong> British citizen passport = <strong>visa-free</strong> up to <strong>90/180</strong> (tourism/business).</li>
  <li><strong>Different UK passport type?</strong> Check visa needs.</li>
  <li><strong>Land border entry:</strong> get the passport stamp.</li>
  <li><strong>Greek islands day trip:</strong> allow extra time for EES.</li>
  <li><strong>Dual-national child:</strong> carry travel permission paperwork if relevant.</li>
</ul>

<hr/>

<h2>FAQs</h2>

<h3>How long can UK citizens stay in Turkey without a visa?</h3>
<p>Up to <strong>90 days in any 180-day period</strong> for tourism or business if travelling on a full British citizen passport.</p>

<h3>What passport validity do I need for Turkey from the UK?</h3>
<p>Your passport must have an expiry date at least <strong>150 days after</strong> your arrival date and have at least <strong>1 blank page</strong>.</p>

<h3>What if I’m not on a “British citizen” passport?</h3>
<p>You may need a visa and should check requirements with the Turkish Embassy or Consulate before travelling.</p>

<h3>I’m doing a day trip to a Greek island from Turkey — anything special?</h3>
<p>Yes. GOV.UK notes the EU’s Entry/Exit System can add extra time at the border, so plan for longer waits.</p>

<p><em>Last updated:</em> ${new Date().toLocaleDateString('en-GB')}</p>
`
};

async function addEntryArticle() {
    const timestamp = Date.now();

    // --- Authentic Mode Prompts (Imagen 3) ---
    const imagesToGenerate = [
        {
            placeholder: '<!-- IMAGE_COVER_PLACEHOLDER -->',
            filename: `entry-cover-${timestamp}.jpg`,
            prompt: "A high quality close-up of a British passport held in hand against an airport or travel background. Soft focus, realistic texture. Authentic travel documentation concept."
        },
        {
            placeholder: '<!-- IMAGE_BORDER_PLACEHOLDER -->',
            filename: `entry-border-sea-${timestamp}.jpg`,
            prompt: "A view from a ferry approaching a Greek island from Turkey. Blue sea, coastline in distance. Authentic travel perspective. Sunny day. Border crossing concept."
        },
        {
            placeholder: '<!-- IMAGE_CUSTOMS_PLACEHOLDER -->',
            filename: `entry-airport-arrival-${timestamp}.jpg`,
            prompt: "A busy international airport arrival hall. People walking with luggage. Blurred signage in background (neutral). Realistic airport atmosphere. Authentic documentary style."
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
        title: { en: ARTICLE_DATA.title, tr: "Birleşik Krallık Vatandaşları İçin Türkiye'ye Giriş Şartları" },
        meta_description: { en: ARTICLE_DATA.meta_description, tr: "UK vatandaşları için Türkiye pasaport ve vize kuralları." },
        content: { en: finalContent, tr: "<p>Çeviri yakında...</p>" },
        cover_image_url: coverImageUrl,
        published_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    }, { onConflict: 'slug' });

    if (error) {
        console.error("❌ DB Insert Failed:", error);
    } else {
        console.log("✅ Entry Article Added Successfully with Imagen 3 Images!");
    }
}

addEntryArticle();
