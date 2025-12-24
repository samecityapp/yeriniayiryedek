
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Manual env parsing
const envPath = path.join(process.cwd(), '.env.local');
let envContent = '';
try {
    envContent = fs.readFileSync(envPath, 'utf-8');
} catch (e) {
    console.log('Could not read .env.local', e);
}

const envVars: Record<string, string> = {};
if (envContent) {
    envContent.split('\n').forEach(line => {
        const match = line.match(/^([^=]+)=(.*)$/);
        if (match) {
            let value = match[2].trim();
            if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
                value = value.slice(1, -1);
            }
            envVars[match[1].trim()] = value;
        }
    });
}

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = envVars.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const article = {
    title: 'Çocuklu Aileler İçin Sapanca: Parklar, Bisiklet Yolları ve Pusetle Gezilebilecek Yerler',
    slug: 'cocuklu-aileler-icin-sapanca-puset-park-bisiklet',
    content: `<h1>Çocuklu Aileler İçin Sapanca: Parklar, Bisiklet Yolları ve Pusetle Gezilebilecek Yerler</h1>

<p>Çocukla tatile çıkmanın altın kuralı net: Yol kısaysa tatil daha sakin başlar. Sapanca’nın aileler arasında bu kadar popüler olmasının bir sebebi de bu. “Arabada sıkıldım!” krizleri büyümeden varıyorsun; asıl konfor kısmı ise varınca başlıyor: Pusetle yürünecek düz bir rota bulabilecek misin? Çocuk enerjisini güvenli bir alanda atabilecek mi? Yemekte herkesin keyfi kaçmadan oturmak mümkün mü?</p>

<p>Bu rehberin amacı, “Sapanca güzelmiş” demek değil. Aile düzeninde işleyen bir plan kurmak. Sapanca merkez, Kırkpınar hattı, Uzunkum tarafı ve Maşukiye gerçekleriyle; pusetli ailelere, yürümeyi sevmeyen miniklere ve hareketli çocuklara göre pratik bir rota çıkaracağız.</p>

<div class="my-8">
    <img src="/images/blog/sapanca_stroller_walk_coast.png" alt="Sapanca Gölü Pusetle Yürüyüş" class="w-full h-auto rounded-lg shadow-md" />
</div>

<div class="bg-blue-50 p-4 rounded-lg my-4">
    <h2 class="text-xl font-bold text-blue-800 mb-2">Kısa Özet (2 dakikada plan)</h2>
    <ul class="list-disc pl-5 text-sm space-y-2">
        <li><strong>Pusetle en rahat başlangıç:</strong> Sapanca merkez sahil hattı (daha düz, daha yürüyüş odaklı).</li>
        <li><strong>Çocuk enerjisi için:</strong> sahil boyunca çim alan + park kombinasyonu.</li>
        <li><strong>Bisiklet keyfi:</strong> aile bisikleti/çocuk koltuklu bisiklet pratik; kalabalıkta scooter hız işi değil.</li>
        <li><strong>Maşukiye’de puset bazen “yük” olur:</strong> kanguru planı hayat kurtarır.</li>
        <li><strong>Konaklamada en kritik üçlü:</strong> merdiven + havuz + soba/şömine (varsa önlem şart).</li>
    </ul>
</div>

<hr class="my-8" />

<h2>1) Puset Sürüş Testi: Sahil Hattı ve Düz Rotalar</h2>
<p>Puset kullanan ailelerin korkusu aynı: Arnavut kaldırımı, çamur, basamak, dar kaldırım… Sapanca’nın en rahat tarafı, genelde göl çevresindeki düz yürüyüş hissi veren sahil hattı. Burada amaç “kilometre rekoru” değil; bebeği uyutacak kadar akıcı yürümek, gerektiğinde durup nefes almak ve minik bir mola ile günün ritmini kurmak.</p>

<div class="bg-green-50 p-4 rounded-lg my-4">
    <h3 class="font-bold text-green-800 mb-2">Pusetle gezmeyi kolaylaştıran küçük tüyolar</h3>
    <ul class="list-disc pl-5 text-sm space-y-2">
        <li>Pusetin alt sepetini “market arabası” gibi düşün: su, ıslak mendil, minik atıştırmalık, yedek kıyafet.</li>
        <li>Göl kenarı rüzgârı bazen serinletir: ince bir battaniye ya da rüzgâr kesen bir örtü çok işe yarar.</li>
        <li>“Bebek uyudu, yürüyelim” anını yakalayınca rotayı uzat; uyku kaçınca kısa mola ver.</li>
    </ul>
</div>

<hr class="my-8" />

<h2>2) Çocuk Enerji Atsın: Parklar, Çim Alanlar, Serbest Oyun</h2>
<p>Sapanca’da çocukla gezerken en iyi şey şu: “Sürekli kural koyma” ihtiyacı biraz azalıyor. Geniş alan bulunca çocuk koşuyor, sen de “her saniye yakala” modundan çıkabiliyorsun.</p>

<div class="my-6">
    <img src="/images/blog/sapanca_kids_playing_park.png" alt="Sapanca Park ve Oyun Alanı" class="w-full h-auto rounded-lg shadow-md" />
</div>

<div class="bg-yellow-50 p-4 rounded-lg my-4">
    <h3 class="font-bold text-yellow-800 mb-2">Park/çim alan kullanırken altın 3 kural</h3>
    <ul class="list-disc pl-5 text-sm space-y-2">
        <li><strong>Göz teması:</strong> Çocuk özgür olsun ama sen de “görür yerde” kal.</li>
        <li><strong>Ayakkabı seçimi:</strong> Çim + toprak + küçük su birikintisi sürpriz; kolay yıkanan ayakkabı iyi fikir.</li>
        <li><strong>Mini oyun planı:</strong> Top, küçük baloncuk, minik araba… 10 dakikalık kurtarıcılar.</li>
    </ul>
</div>

<hr class="my-8" />

<h2>3) Ailece Pedal Çevirmek: Bisiklet ve Aile Bisikleti Keyfi</h2>
<p>Çocuk “kucak ister” noktasına geldiğinde, puset bile bazen yetmez. Sapanca’nın düzlüğü burada devreye giriyor: Bisiklet ve aile bisikleti seçenekleri çoğu aile için keyifli.</p>

<div class="my-6">
    <img src="/images/blog/sapanca_family_bicycle_ride.png" alt="Sapanca Aile Bisikleti Turu" class="w-full h-auto rounded-lg shadow-md" />
</div>

<ul class="list-disc pl-6 space-y-2">
    <li><strong>Aile bisikleti (4 kişilik/tenteli):</strong> Çocuklar “araba sürüyoruz” hissini seviyor. Ebeveyn için de “yürümeye ara” demek.</li>
    <li><strong>Çocuk koltuklu bisiklet:</strong> Kısa tur için pratik. Çocuğun kaskı varsa daha iç rahat.</li>
    <li><strong>Scooter/elektrikli seçenekler:</strong> Kalabalık artınca risk artar. “Yavaş, dikkatli, geniş mesafe” kuralı şart.</li>
</ul>

<hr class="my-8" />

<h2>4) Maşukiye Puset İçin Uygun mu? Gerçekçi cevap: Bazen zor</h2>
<p>Sapanca sahil hattı pusetle rahatken, Maşukiye tarafında bazı yerler eğimli, basamaklı, dar geçişli olabiliyor. Üstüne bir de zemin ıslaksa; puset bir anda tatilin “yükü”ne dönüşüyor.</p>

<div class="border-l-4 border-orange-500 pl-4 my-4">
    <h4 class="font-bold text-orange-700">Maşukiye günü için en iyi plan:</h4>
    <p>Puseti arabada bırak, **kanguruyu (baby carrier)** al. Mekâna gitmeden ara: “Giriş düz ayak mı? Merdiven var mı?” Yağış/soğuk ihtimaline göre: kaymaz taban ayakkabı + yedek üst.</p>
</div>

<hr class="my-8" />

<h2>5) Çocukların Bayıldığı Büyük Doğa Alanı ve Beklenti</h2>
<p>Sapanca–Maşukiye–Kartepe hattında çocukların çok sevdiği büyük bir doğal yaşam/tema alanı ailelerin listesinin üstünde oluyor. Burada *beklenti yönetimi* önemli: Temalı evler/alanlar bazen “fotoğraf noktası”dır; içeri girme, uzun oyun alanı gibi beklentiler her zaman gerçekleşmeyebilir. Çocuğa “içine girip oynayacağız” diye söz vermezsen, kapıda dramatik sahne olma ihtimali düşer.</p>

<hr class="my-8" />

<h2>6) Restoranda Çocukla Rahat Etme: Mekân Seçimi 5 Soru</h2>
<div class="my-6">
    <img src="/images/blog/sapanca_family_meal_grass.png" alt="Sapanca Aile Pikniği ve Kahvaltı" class="w-full h-auto rounded-lg shadow-md" />
</div>
<p>Çocukla yemekte “lezzet” kadar “lojistik” de önemli. Mekân seçerken şu 5 soruyla problemleri baştan çözersin:</p>
<ul class="list-disc pl-6 space-y-2">
    <li>Bahçe/çim alan var mı?</li>
    <li>Mama sandalyesi var mı, sayısı yeterli mi?</li>
    <li>Tuvalet/alt değiştirme pratik mi?</li>
    <li>Masalar sıkışık mı, geçiş alanı geniş mi?</li>
    <li>Oyun alanı var mı ve masadan görülebiliyor mu?</li>
</ul>

<hr class="my-8" />

<h2>7) Konaklama Seçiminde Çocuk Güvenliği: Bungalovların 3 Gizli Noktası</h2>
<p>Sapanca’de bungalov/ev konaklamaları çok seviliyor. Çocukla kalınca görüntü kadar güvenlik de önemli:</p>
<ul class="list-disc pl-6 space-y-2">
    <li><strong>Loft/asma kat merdiveni:</strong> Dik merdivenler risk. Çocuk kapısı veya bariyer planı yapın.</li>
    <li><strong>Bahçe + havuz detayı:</strong> Havuz varsa çocuk için mıknatıs. Dışarı çıkınca “bir yetişkin eşlik” kuralı koyun.</li>
    <li><strong>Şömine/soba:</strong> Dış yüzey çok ısınır. Etrafına bariyer (basitçe sandalyeler) koyun ve “cızz alanı” diye sınır belirleyin.</li>
</ul>

<hr class="my-8" />

<h2>8) Mini Aile Planı: 1 Günlük Örnek Rota</h2>
<p>Her aile farklı ama şu plan çoğu kişide çalışır:</p>
<ul class="list-none space-y-4">
    <li class="flex items-start">
        <span class="bg-blue-100 text-blue-800 rounded px-2 py-1 text-sm font-bold mr-3 mt-1">Sabah</span>
        <span>Sahil hattında puset yürüyüşü (uyku vakti yakalanırsa harika) + Çim/park molası</span>
    </li>
    <li class="flex items-start">
        <span class="bg-yellow-100 text-yellow-800 rounded px-2 py-1 text-sm font-bold mr-3 mt-1">Öğle</span>
        <span>Bahçeli, çocuk dostu bir yerde yemek (oyun alanı varsa jackpot)</span>
    </li>
    <li class="flex items-start">
        <span class="bg-green-100 text-green-800 rounded px-2 py-1 text-sm font-bold mr-3 mt-1">Öğleden Sonra</span>
        <span>Bisiklet/aile bisikleti turu + İsteğe göre daha sakin bir yürüyüş noktası</span>
    </li>
    <li class="flex items-start">
        <span class="bg-purple-100 text-purple-800 rounded px-2 py-1 text-sm font-bold mr-3 mt-1">Akşam</span>
        <span>Konaklamada güvenli alan kur: merdiven/havuz/soba kontrolü + Erken uyku = herkes için huzur</span>
    </li>
</ul>

<hr class="my-8" />

<h2>SSS (FAQ)</h2>

<details class="group py-2 border-b border-gray-200">
    <summary class="flex justify-between items-center font-medium cursor-pointer list-none text-gray-800">
        <span>Sapanca pusetle gezmeye uygun mu?</span>
        <span class="transition group-open:rotate-180">
            <svg fill="none" height="24" shape-rendering="geometricPrecision" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
        </span>
    </summary>
    <div class="text-neutral-600 mt-3 group-open:animate-fadeIn">
        <p>Sahil hattı ve düz yürüyüş odaklı bölgeler genelde daha uygundur. Maşukiye tarafında basamak/eğim olabildiği için kanguru planı iyi olur.</p>
    </div>
</details>

<details class="group py-2 border-b border-gray-200">
    <summary class="flex justify-between items-center font-medium cursor-pointer list-none text-gray-800">
        <span>Maşukiye’ye pusetle gitmek mantıklı mı?</span>
        <span class="transition group-open:rotate-180">
            <svg fill="none" height="24" shape-rendering="geometricPrecision" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
        </span>
    </summary>
    <div class="text-neutral-600 mt-3 group-open:animate-fadeIn">
        <p>Bazı yerlerde zorlayabilir. Restorana/işletmeye gitmeden “düz ayak giriş var mı?” diye sormak ve kanguru taşımak en güvenlisi.</p>
    </div>
</details>

<details class="group py-2 border-b border-gray-200">
    <summary class="flex justify-between items-center font-medium cursor-pointer list-none text-gray-800">
        <span>Bungalovda çocukla kalırken en riskli şeyler neler?</span>
        <span class="transition group-open:rotate-180">
            <svg fill="none" height="24" shape-rendering="geometricPrecision" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
        </span>
    </summary>
    <div class="text-neutral-600 mt-3 group-open:animate-fadeIn">
        <p>Loft merdiven, havuz erişimi ve soba/şömine yüzeyi. Bu üçlü için önlem planı kurmak gerekir.</p>
    </div>
</details>

<details class="group py-2 border-b border-gray-200">
    <summary class="flex justify-between items-center font-medium cursor-pointer list-none text-gray-800">
        <span>Restoran seçerken en kritik kriter?</span>
        <span class="transition group-open:rotate-180">
            <svg fill="none" height="24" shape-rendering="geometricPrecision" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
        </span>
    </summary>
    <div class="text-neutral-600 mt-3 group-open:animate-fadeIn">
        <p>Bahçe/oyun alanı ve mama sandalyesi. Bunlar yoksa yemek “operasyon”a dönebilir.</p>
    </div>
</details>

<details class="group py-2 border-b border-gray-200">
    <summary class="flex justify-between items-center font-medium cursor-pointer list-none text-gray-800">
        <span>Tatil çantasına ne koyayım? (mini liste)</span>
        <span class="transition group-open:rotate-180">
            <svg fill="none" height="24" shape-rendering="geometricPrecision" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
        </span>
    </summary>
    <div class="text-neutral-600 mt-3 group-open:animate-fadeIn">
        <p>Termometre, temel ilk yardım/yarabandı, yedek kıyafet, ıslak mendil, küçük atıştırmalık, ince battaniye, portatif alt açma minderi.</p>
    </div>
</details>`,
    cover_image_url: '/images/blog/sapanca_stroller_walk_coast.png',
    location: 'Sapanca',
    meta_description: 'Sapanca’da çocukla gezilecek puset dostu sahil rotaları, parklar ve bisiklet keyfi. Maşukiye tüyoları, konaklama güvenliği ve aile planı.',
    is_published: true,
    published_at: new Date().toISOString()
};

async function run() {
    console.log(`Inserting: ${article.slug}`);
    const { error: insertError } = await supabase
        .from('articles')
        .upsert(article, { onConflict: 'slug' });

    if (insertError) {
        console.error('Error inserting new article:', insertError.message);
    } else {
        console.log('Success! Article inserted.');
    }
}

run();
