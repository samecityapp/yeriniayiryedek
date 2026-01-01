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
    slug: 'cash-or-card-in-turkey',
    title: 'Cash or Card in Turkey? UK Money & Payments Guide (2026)',
    meta_description: 'Cash or card in Turkey? A UK-friendly guide to ATMs, fees, exchange tips and the “pay in pounds” trap—plus a simple checklist for your holiday.',
    content: `
<h1>Cash or Card in Turkey? A UK Traveller’s Money & Payments Guide (Simple, No Surprises)</h1>

<p><strong>Quick answer:</strong> For most UK travellers, the easiest approach is <strong>use card for most spending</strong> and carry a <strong>small amount of cash (TRY)</strong> for taxis, tips, small shops and backup. Turkey is generally card-friendly in tourist areas, but cash still matters in day-to-day situations.</p>

<p>This guide helps you avoid the two big holiday money mistakes: <strong>unnecessary fees</strong> and <strong>awkward “we don’t take card” moments</strong>.</p>

<p><strong>Official note (UK):</strong> The UK Foreign Office (FCDO) includes money-related safety warnings in its Turkey advice, including counterfeit banknote cautions.</p>

<hr/>

<!-- IMAGE_COVER_PLACEHOLDER -->

<h2>1) The best “boring” strategy for UK travellers</h2>

<ul>
  <li><strong>Use card for:</strong> restaurants, supermarkets, larger shops, hotels, transport tickets (where available), and anything you want recorded.</li>
  <li><strong>Use cash (TRY) for:</strong> small cafés, some local markets, quick tips, and “just in case” moments.</li>
  <li><strong>Withdraw cash in Turkey</strong> using ATMs rather than exchanging a big lump at the start (for most travellers, this keeps things simple).</li>
</ul>

<p><strong>Why this works:</strong> You minimise carrying cash, avoid panic exchanges, and still have enough local money for the places that prefer it.</p>

<hr/>

<h2>2) The “Pay in pounds” trap: always choose local currency</h2>

<p>When paying by card or withdrawing at an ATM, you may be asked whether you want to be charged in <strong>GBP</strong> or in <strong>TRY</strong>. In most cases, choosing GBP triggers a poorer exchange rate set by the machine/provider (often called dynamic currency conversion). Consumer finance advice repeatedly recommends choosing the <strong>local currency</strong> instead.</p>

<ul>
  <li><strong>If the screen says:</strong> “Pay in GBP?” → choose <strong>No</strong>.</li>
  <li><strong>Choose:</strong> “Pay in TRY” / “Charge me in local currency”.</li>
</ul>

<p><strong>Simple rule:</strong> If you want a fairer conversion, pay in TRY and let your bank/card network handle the conversion.</p>

<hr/>

<h2>3) ATMs in Turkey: what to do (and what to avoid)</h2>

<p>UK-issued Visa and Mastercard generally work at many Turkish ATMs, but your fees depend on your UK bank and the ATM operator.</p>

<h3>Safer ATM habits</h3>
<ul>
  <li><strong>Use ATMs attached to bank branches</strong> (or in well-lit, busy places).</li>
  <li><strong>Avoid repeated small withdrawals</strong> if your bank charges per withdrawal — fewer, larger withdrawals can reduce total fees (check your bank).</li>
  <li><strong>Decline “pay in GBP”.</strong> Choose TRY.</li>
</ul>

<h3>ATM fee reality (be prepared)</h3>
<p>Your total cost can include:</p>
<ul>
  <li>your UK bank’s foreign transaction fee (if any),</li>
  <li>your UK bank’s cash withdrawal fee (if any),</li>
  <li>the Turkish ATM operator fee (sometimes shown on-screen),</li>
  <li>and the exchange rate used.</li>
</ul>

<p><strong>Action you can take before you fly:</strong> check your bank card’s “spending abroad” and “cash withdrawal” terms and set a travel notice if your bank uses them.</p>

<!-- IMAGE_ATM_PLACEHOLDER -->

<hr/>

<h2>4) Should you bring GBP and exchange it, or just use ATMs?</h2>

<p>For most UK travellers, you don’t need to arrive with a big stack of cash. A more stress-free approach is:</p>
<ul>
  <li>arrive with <strong>a small emergency amount</strong> (optional),</li>
  <li>withdraw <strong>TRY</strong> from an ATM when you need it,</li>
  <li>use card for most daily spending.</li>
</ul>

<p>If you do exchange money, use reputable exchange offices and avoid making rushed decisions when tired or arriving late.</p>

<hr/>

<h2>5) Counterfeit banknotes warning (important, simple takeaway)</h2>

<p>The FCDO specifically warns that banks and money exchanges in Turkey may not accept <strong>$50 or $100 US dollar bills</strong> due to reports of counterfeit notes, advising travellers not to accept these denominations where possible.</p>

<p><strong>Practical takeaway for UK travellers:</strong> If you’re carrying “backup” cash, don’t rely on random high-denomination US bills. Keep things straightforward: use TRY for day-to-day and cards for most spending.</p>

<hr/>

<h2>6) Card payments: how to keep it safe (without paranoia)</h2>

<ul>
  <li><strong>Tap-to-pay is fine</strong>, but keep your card in sight when paying.</li>
  <li><strong>Use your banking app</strong> to monitor transactions and freeze your card instantly if needed (most UK banks support this).</li>
  <li><strong>Keep one backup card</strong> in your accommodation, separate from your main wallet.</li>
</ul>

<p>General travel finance advice for UK travellers also emphasises fee awareness and fraud protection features (like card freezing) as simple ways to reduce risk.</p>

<!-- IMAGE_CARD_PLACEHOLDER -->

<hr/>

<h2>7) How much cash should you carry day-to-day?</h2>

<p>There’s no single right amount. The best method is to carry <strong>enough for a normal day plus a small buffer</strong>, and keep the rest secure. If you’re doing tours, remote beaches or small-town stops, carry a bit more.</p>

<ul>
  <li><strong>City days (Istanbul):</strong> smaller cash buffer is usually fine.</li>
  <li><strong>Coastal/excursion days:</strong> carry a bit more for small vendors, tips and unexpected transport needs.</li>
</ul>

<hr/>

<h2>8) Copy/paste checklist (UK travellers)</h2>

<ul>
  <li><strong>Bring:</strong> 2 cards (main + backup), and a small cash buffer.</li>
  <li><strong>Before you go:</strong> check your bank’s foreign spending and ATM fees.</li>
  <li><strong>In Turkey:</strong> withdraw TRY from reputable ATMs when needed.</li>
  <li><strong>Always:</strong> choose to pay in <strong>TRY</strong>, not GBP.</li>
  <li><strong>Avoid:</strong> relying on $50/$100 USD notes as “backup”.</li>
  <li><strong>Safety:</strong> keep cards/cash split; monitor your app; freeze if needed.</li>
</ul>

<hr/>

<h2>FAQs</h2>

<h3>Should I take cash to Turkey from the UK?</h3>
<p>You don’t need to take a large amount. A common low-stress approach is to use card for most spending and withdraw TRY from ATMs as needed, keeping a small cash buffer for places that prefer cash.</p>

<h3>When paying by card, should I choose GBP or TRY?</h3>
<p>In most cases, choose <strong>TRY</strong> (local currency). Choosing GBP can trigger a poorer exchange rate through dynamic currency conversion.</p>

<h3>Do UK debit cards work in Turkey?</h3>
<p>Many UK-issued Visa and Mastercard cards are generally accepted at ATMs and card terminals, but fees depend on your UK bank and the ATM operator.</p>

<h3>Is there anything I should avoid with cash?</h3>
<p>The FCDO warns about counterfeit issues with certain high-denomination USD bills in Turkey. Keep your plan simple: rely on cards + TRY cash rather than random high-denomination foreign notes.</p>

<!-- IMAGE_MARKET_PLACEHOLDER -->

<p><em>Last updated:</em> ${new Date().toLocaleDateString('en-GB')}</p>
`
};

async function addCashOrCardArticle() {
    const timestamp = Date.now();

    // --- Authentic Mode Prompts (Imagen 3) ---
    const imagesToGenerate = [
        {
            placeholder: '<!-- IMAGE_COVER_PLACEHOLDER -->',
            filename: `money-cover-${timestamp}.jpg`,
            prompt: "A close-up high quality photo of Turkish Lira banknotes and coins on a table. Next to it a modern credit card. Authentic, sharp focus. Travel finance concept."
        },
        {
            placeholder: '<!-- IMAGE_ATM_PLACEHOLDER -->',
            filename: `money-atm-${timestamp}.jpg`,
            prompt: "A tourist withdrawing cash from a modern bank ATM in Istanbul street. Daytime. Screen visible (blurred details). Authentic travel documentary style. Realistic lighting."
        },
        {
            placeholder: '<!-- IMAGE_CARD_PLACEHOLDER -->',
            filename: `money-card-pay-${timestamp}.jpg`,
            prompt: "A photo of a contactless payment at a cafe in Turkey. Hand holding credit card tapping on POS machine. Coffee in background. Authentic first-person perspective."
        },
        {
            placeholder: '<!-- IMAGE_MARKET_PLACEHOLDER -->',
            filename: `money-market-${timestamp}.jpg`,
            prompt: "A colorful stall in a Turkish bazaar (Grand Bazaar style). Spices or souvenirs. Focus on a cash transaction taking place naturally. Authentic unposed movement."
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
        title: { en: ARTICLE_DATA.title, tr: "Türkiye'de Nakit mi Kart mı? Ödeme Rehberi" },
        meta_description: { en: ARTICLE_DATA.meta_description, tr: "Türkiye'de para kullanımı, ATM'ler ve döviz bozdurma ipuçları." },
        content: { en: finalContent, tr: "<p>Çeviri yakında...</p>" },
        cover_image_url: coverImageUrl,
        published_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    }, { onConflict: 'slug' });

    if (error) {
        console.error("❌ DB Insert Failed:", error);
    } else {
        console.log("✅ Cash or Card Article Added Successfully with Imagen 3 Images!");
    }
}

addCashOrCardArticle();
