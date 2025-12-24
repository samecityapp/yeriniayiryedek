
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
    title: 'Sapanca’da Adrenalin: ATV Safari, Zipline ve Paintball Rehberi',
    slug: 'sapanca-atv-zipline-paintball-rehberi',
    content: `<h1>Sapanca’da Adrenalin: ATV Safari, Zipline ve Paintball Rehberi</h1>

<p>Sapanca deyince çoğu kişinin aklına göl manzarası, kahvaltı ve sakin yürüyüşler geliyor. Ama işin bir de “motor sesiyle başlayan” tarafı var: orman yolları, dere geçişleri, zipline hatları ve paintball sahaları… Yani Sapanca, huzur kadar adrenalini de iyi oynuyor.</p>

<p>Bir gerçek var: Macera aktiviteleri ne kadar popülerleşirse, “hadi atla bin” kafasıyla iş yapan yerlerin sayısı da artıyor. O yüzden bu rehberi eğlenirken riski azaltmak için hazırladım. ATV/UTV turuna gitmeden önce ne sorulur, hangi parkur neye göre seçilir, zipline’da nerede hata yapılır, paintball’da nasıl sakatlanmadan keyif alınır… Hepsi burada.</p>

<div class="my-8">
    <img src="/images/blog/sapanca_atv_mud_action.png" alt="Sapanca ATV Safari Turu" class="w-full h-auto rounded-lg shadow-md" />
</div>

<div class="bg-blue-50 p-4 rounded-lg my-4">
    <h2 class="text-xl font-bold text-blue-800 mb-2">Kısa Özet (2 dakikada okuyup çıkmalık)</h2>
    <ul class="list-disc pl-5 text-sm space-y-2">
        <li><strong>ATV daha “fiziksel” ve devrilmeye daha açık;</strong> UTV daha konforlu ve korumalı.</li>
        <li><strong>Parkurda kalabalık = dur-kalk;</strong> hafta içi genelde daha keyifli.</li>
        <li><strong>Beyaz giyme:</strong> Çamur sürpriz değil, büyük ihtimal.</li>
        <li><strong>Telefon için:</strong> boyun askısı + su geçirmez kılıf hayat kurtarır.</li>
        <li><strong>Zipline’da en sık hata:</strong> kemer/kilit kontrolünü aceleye getirmek.</li>
        <li><strong>Paintball’da göz güvenliği:</strong> maske asla oyun sırasında çıkmaz.</li>
        <li><strong>Fiyatlar dönemsel oynar:</strong> grup indirimi ve “fotoğraf/video” ücretini baştan konuş.</li>
    </ul>
</div>

<hr class="my-8" />

<h2>Sapanca’da Macera Nerede Başlıyor? (GEO: Sapanca–Maşukiye hattı)</h2>
<p>Sapanca merkez ve göl çevresi daha “gezinti” modundayken, macera aktiviteleri genelde orman hattına kayar. Pratikte en çok duyacağınız iki bölge:</p>
<ul class="list-disc pl-6 space-y-2">
    <li><strong>Maşukiye / Kartepe etekleri:</strong> Orman içi parkurlar, dere kenarı zipline hatları, woodsball tarzı paintball sahaları.</li>
    <li><strong>Yayla hattı (ör. Soğucak Yaylası gibi rotalar):</strong> Daha uzun, daha manzaralı ve hava şartlarına daha bağımlı turlar.</li>
</ul>

<hr class="my-8" />

<h2>ATV mi UTV mi? Aynı Şey Değil</h2>
<p>İşletmeler bazen “ATV turu” diye genel konuşuyor ama aslında iki ayrı deneyim var. Seçimi doğru yapmak, keyfin %50’si.</p>

<div class="grid md:grid-cols-2 gap-6 my-6">
    <div>
        <h3 class="font-bold text-lg mb-2">ATV (All-Terrain Vehicle)</h3>
        <p class="text-sm mb-2">Daha ham, daha fiziksel. ATV’yi “gidonlu, üzerine binilen 4 teker” diye düşün. Dönüşlerde vücut ağırlığıyla denge kurarsın. Çamuru, suyu, rüzgârı direkt hissedersin.</p>
        <ul class="list-disc pl-5 text-sm space-y-1">
            <li>“Ben kirlenirim, sorun değil” diyenlere</li>
            <li>Daha heyecanlı ve aktif sürüş isteyenlere</li>
            <li>İki kişiden çok “tek sürücü” odaklı deneyim arayanlara</li>
        </ul>
        <div class="mt-2 bg-red-50 p-2 rounded text-xs">
            <strong>Risk:</strong> Denge sürücüde. Hız yapma, ani manevra devrilme riskini artırır.
        </div>
    </div>
    <div>
        <h3 class="font-bold text-lg mb-2">UTV (Buggy)</h3>
        <p class="text-sm mb-2">Daha güvenli hissi, daha konfor. Direksiyon, pedal, yan yana koltuk ve genellikle üstte koruma kafesi olur. Dallar, taşlar, sıçrayan çamur daha az gelir.</p>
        <ul class="list-disc pl-5 text-sm space-y-1">
            <li>Çiftler ve aileler</li>
            <li>“Macera olsun ama rahat olayım” diyenler</li>
            <li>ATV’ye göre daha kontrollü his arayanlar</li>
        </ul>
    </div>
</div>

<div class="my-6">
    <img src="/images/blog/sapanca_utv_buggy_safari.png" alt="Sapanca UTV Buggy Turu" class="w-full h-auto rounded-lg shadow-md" />
</div>

<hr class="my-8" />

<h2>Parkur Seçimi: Orman mı Yayla mı?</h2>
<p>Sapanca–Maşukiye hattında “tabelası olan her yer” aynı parkuru kullanmıyor. İşletmeye sormanız gereken şey çok net: <strong>“Parkur nereden geçiyor, toplam süre ne, mola var mı, dere geçişi var mı?”</strong></p>

<h3>1) Maşukiye vadisi parkurları: Klasik, popüler, çamur garantili</h3>
<p>Orman içi yol + dere kenarı + çamur çukurları… Eğlenceli ama özellikle hafta sonu kalabalık olabiliyor. Kalabalık olunca macera “konvoy halinde dur-kalk”a dönebiliyor.</p>

<h3>2) Yayla / daha uzun rotalar: Manzaralı ama şartlara bağlı</h3>
<p>Bu turlar genelde daha uzun sürer, daha pahalı olabilir ve hava koşullarından daha çok etkilenir. Ama manzara ve “gerçek rota” hissi daha tatmin edici olur.</p>

<div class="bg-yellow-50 p-4 rounded-lg my-4">
    <p><strong>Göl kenarı konusu:</strong> Sapanca Gölü çevresinde bazı yürüyüş alanlarında motorlu araç kullanımı kısıtlı/uygunsuz olabiliyor. “Göl kenarında sürüyoruz” lafı bazen “gölü uzaktan gören bir noktadan geçiyoruz” anlamına geliyor. Beklentiyi doğru kurun.</p>
</div>

<hr class="my-8" />

<h2>Zipline: Kısa sürer, hatayı affetmez</h2>
<p>Zipline, ATV sonrası nabzı düşürmeden “vızz” diye geçmelik harika bir ek aktivite. Maşukiye tarafında hatlar çoğu zaman dere ve ağaçlık alanların üzerinde kurulu oluyor.</p>

<div class="my-6">
    <img src="/images/blog/sapanca_zipline_adventure.png" alt="Sapanca Zipline Macera" class="w-full h-auto rounded-lg shadow-md" />
</div>

<h3 class="font-bold text-gray-800 mt-4">Zipline’da güvenlik için 5 saniyelik kontrol:</h3>
<ul class="list-decimal pl-6 space-y-2 mt-2">
    <li>Kaskın çene kayışı kapalı mı?</li>
    <li>Kemer (harness) belinde yukarıda mı, bacak halkaları sıkı mı?</li>
    <li>Karabina kilitleri kapalı mı?</li>
    <li>Eldiven/koruma veriliyorsa takılı mı?</li>
</ul>

<hr class="my-8" />

<h2>Paintball: Orman içinde “Woodsball” deneyimi</h2>
<p>Sapanca–Maşukiye’deki paintball, düz sahadaki şişme bariyer oyunlarından farklı olabiliyor. Ağaçlar, doğal çukurlar, eğim… Oyun daha stratejik ama daha yorucu.</p>

<div class="my-6">
    <img src="/images/blog/sapanca_paintball_woods.png" alt="Sapanca Orman İçi Paintball" class="w-full h-auto rounded-lg shadow-md" />
</div>

<div class="bg-red-50 p-4 rounded-lg my-4">
    <h3 class="font-bold text-red-800 mb-2">Maskeyi oyun içinde çıkarmak = en büyük hata</h3>
    <p>Paintball’da “morarma” geçer, “göz” konusu geçmez. O yüzden maske oyun alanında asla çıkmaz. Bu kadar.</p>
</div>

<hr class="my-8" />

<h2>Safaride Ne Giyilir? (Beyaz giyenlerin dramatik anları)</h2>
<p>Bu bölüm, günün geri kalanını kurtarır.</p>

<h3 class="font-bold text-gray-800 mt-4">Asla giymemen gerekenler</h3>
<ul class="list-disc pl-6 space-y-1 text-red-700">
    <li>Beyaz/açık renk üstler</li>
    <li>Yeni, “marka” ayakkabılar</li>
    <li>İnce kumaş, çabuk ıslanan pantolonlar</li>
    <li>Kolay düşen takılar (kolye, gevşek bileklik)</li>
</ul>

<h3 class="font-bold text-gray-800 mt-4">En iyi kombin: “Kirlenirse üzülmem” seti</h3>
<ul class="list-disc pl-6 space-y-1 text-green-700">
    <li>Koyu renk eşofman/pantolon</li>
    <li>Rahat, hareketi engellemeyen üst</li>
    <li>Suya dayanıklı ya da en azından “içine su alınca mahvolmayan” ayakkabı</li>
    <li>Yedek tişört + alt + iç çamaşırı + çorap + poşet</li>
</ul>

<hr class="my-8" />

<h2>Güvenlik ve “İmza Attırılan Kağıt” Gerçeği</h2>
<p>Birçok işletme tur öncesi bir form imzalatır. Buradaki kritik nokta şu: Kendi güvenliğin için sorumluluğu baştan alman gerekiyor.</p>
<p><strong>Turdan önce sorman gereken hayati sorular:</strong> Araçların bakım periyodu var mı? Kasklar standart mı? Rehber sayısı kaç? Parkur süresi net kaç dakika? Kaza olursa prosedür ne?</p>

<hr class="my-8" />

<h2>Mini SSS (FAQ)</h2>

<details class="group py-2 border-b border-gray-200">
    <summary class="flex justify-between items-center font-medium cursor-pointer list-none text-gray-800">
        <span>Sapanca’da ATV safari mi UTV mi daha güvenli?</span>
        <span class="transition group-open:rotate-180">
            <svg fill="none" height="24" shape-rendering="geometricPrecision" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
        </span>
    </summary>
    <div class="text-neutral-600 mt-3 group-open:animate-fadeIn">
        <p>Genelde UTV, koruma kafesi ve otomobil benzeri kullanım nedeniyle daha “güvenli his” verir. Ama asıl güvenlik, hız ve kurallara uymakla gelir.</p>
    </div>
</details>

<details class="group py-2 border-b border-gray-200">
    <summary class="flex justify-between items-center font-medium cursor-pointer list-none text-gray-800">
        <span>ATV turunda ehliyet gerekiyor mu?</span>
        <span class="transition group-open:rotate-180">
            <svg fill="none" height="24" shape-rendering="geometricPrecision" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
        </span>
    </summary>
    <div class="text-neutral-600 mt-3 group-open:animate-fadeIn">
        <p>Uygulama işletmeye göre değişebilir. En doğrusu rezervasyon öncesi “ehliyet/yaş şartı var mı?” diye sormak.</p>
    </div>
</details>

<details class="group py-2 border-b border-gray-200">
    <summary class="flex justify-between items-center font-medium cursor-pointer list-none text-gray-800">
        <span>Yağmurda tur yapılır mı?</span>
        <span class="transition group-open:rotate-180">
            <svg fill="none" height="24" shape-rendering="geometricPrecision" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
        </span>
    </summary>
    <div class="text-neutral-600 mt-3 group-open:animate-fadeIn">
        <p>Bazı yerler yapar, bazıları erteleyebilir. Yağmur çamuru artırır; keyifli olabilir ama risk de artar. İptal/erteleme politikasını baştan öğren.</p>
    </div>
</details>

<details class="group py-2 border-b border-gray-200">
    <summary class="flex justify-between items-center font-medium cursor-pointer list-none text-gray-800">
        <span>Sapanca zipline korkutucu mu?</span>
        <span class="transition group-open:rotate-180">
            <svg fill="none" height="24" shape-rendering="geometricPrecision" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
        </span>
    </summary>
    <div class="text-neutral-600 mt-3 group-open:animate-fadeIn">
        <p>Kısa sürer ve çoğu kişi 1 denemeden sonra alışır. Korkuyu azaltan şey, kemer-kilit kontrolünün doğru yapılmasıdır.</p>
    </div>
</details>

<details class="group py-2 border-b border-gray-200">
    <summary class="flex justify-between items-center font-medium cursor-pointer list-none text-gray-800">
        <span>Paintball’da en önemli güvenlik kuralı nedir?</span>
        <span class="transition group-open:rotate-180">
            <svg fill="none" height="24" shape-rendering="geometricPrecision" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
        </span>
    </summary>
    <div class="text-neutral-600 mt-3 group-open:animate-fadeIn">
        <p>Maske oyun alanında asla çıkarılmaz. Göz güvenliği tartışmasız birinci sırada.</p>
    </div>
</details>

<details class="group py-2 border-b border-gray-200">
    <summary class="flex justify-between items-center font-medium cursor-pointer list-none text-gray-800">
        <span>ATV’ye giderken ne giyilmeli?</span>
        <span class="transition group-open:rotate-180">
            <svg fill="none" height="24" shape-rendering="geometricPrecision" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
        </span>
    </summary>
    <div class="text-neutral-600 mt-3 group-open:animate-fadeIn">
        <p>Koyu renk, rahat, kirlenirse üzülmeyeceğin kıyafetler. Ayakkabı mümkünse suya dayanıklı. Yedek kıyafet + poşet mutlaka.</p>
    </div>
</details>`,
    cover_image_url: '/images/blog/sapanca_atv_mud_action.png',
    location: 'Sapanca',
    meta_description: 'Sapanca’da ATV/UTV safari, zipline ve paintball için güvenlik, kıyafet ve ekipman tüyoları. Parkur seçimi, fiyat oyunları ve sorulacak sorular.',
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
