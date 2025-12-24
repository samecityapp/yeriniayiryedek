
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
    title: 'Sapanca’da Kalabalıktan Kaçış: Soğucak Yaylası Trekking',
    slug: 'sapanca-sogucak-yaylasi-kalabaliktan-kacis-trekking',
    content: `<h1>Sapanca’da Kalabalıktan Kaçış Rotası: Soğucak Yaylası ve Gizli Trekking Parkurları</h1>

<p>Hafta sonu Sapanca sahiline bir gidersin… Göl kenarı kalabalık, kahvaltı yerleri sıra, bungalov bölgeleri full enerji. “Ben buraya huzur bulmaya gelmiştim” deyip içinden söylenmen çok normal. İşte tam o anda yapman gereken şey, göl çevresinde bir sağa bir sola dönmek değil; rotayı yukarı almak.</p>

<p>Sapanca’nın sırtını dayadığı Samanlı Dağları, bölgenin “arka bahçesi” gibi. Sadece manzara değil; yaylalar, serin rüzgâr, kayın ağaçlarının arasından geçen patikalar ve kalabalığın bir anda dağıldığı o sessizlik… Bu rehberde Soğucak Yaylası’nı merkeze alarak, binek araçla çıkışın sınırlarını, mevsime göre riskleri, “gizli” trekking mantığını ve kaybolma riskini azaltan pratikleri anlatıyorum.</p>

<div class="my-8">
    <img src="/images/blog/sapanca_sogucak_plateau_landscape.png" alt="Soğucak Yaylası Manzarası" class="w-full h-auto rounded-lg shadow-md" />
</div>

<hr class="my-8" />

<h2>1) Neden “Dikey Kaçış” İşe Yarıyor?</h2>
<p>Sapanca merkez, Kırkpınar ve göl hattı özellikle hafta sonları çok hızlı doluyor. Kalabalık artınca sessizlik azalıyor; sessizlik azalınca da Sapanca’nın asıl iyi gelen tarafı biraz geri plana düşüyor. Yaylaya çıktığında oyun değişir:</p>
<ul class="list-disc pl-6 space-y-2">
    <li>Hava genelde daha serin olur.</li>
    <li>Gürültü azalır, kulakların “dinlenir”.</li>
    <li>Telefon çekimi yer yer zayıflayabilir; bu da garip bir şekilde iyi gelir.</li>
    <li>Manzara genişler: Sapanca Gölü’nü uzaktan görmek, sahilde yürümekten bambaşka bir duygu.</li>
</ul>

<hr class="my-8" />

<h2>2) Soğucak Yaylası: Sapanca’nın Balkon Hissi Veren Noktası</h2>
<p>Soğucak Yaylası, Sapanca merkezden yola çıkınca “çok uzağa gittim” hissi yaratmadan başka bir iklime sokan yerlerden. Rakım yaklaşık 1000 metre civarına çıktığı için, aşağıda güneş yakarken burada “bir üst giysem mi?” diye düşünmen mümkün.</p>

<div class="my-6">
    <img src="/images/blog/sapanca_forest_trekking_trail.png" alt="Sapanca Orman İçi Yürüyüş Yolu" class="w-full h-auto rounded-lg shadow-md" />
</div>

<p><strong>Yaylada seni ne bekler?</strong> Geniş çayırlar ve orman sınırı, kayın ağırlıklı ağaç dokusu ve sessizlik. Bazı dönemlerde (özellikle yaz ortasına denk gelen hafta sonlarında) yaylalar etkinlik havasına bürünebilir. Sessizlik istiyorsan, gidişini sabaha çekmek iyidir.</p>

<hr class="my-8" />

<h2>3) Yol Durumu ve Araç Seçimi: “Çıkar mı?” Değil, “Sağ Salim Gider Gelir mi?”</h2>
<p>Soğucak planında en kritik kısım ulaşım. Çünkü yaylaya gidiş güzelse, dönüş de en az onun kadar önemli. İstanbuldere hattına bağlanan yolun bazı bölümleri daha rahatken, son kısımlarda stabilize/toprak ve taşlı bölümlerle karşılaşma ihtimalin olur.</p>

<div class="my-6">
    <img src="/images/blog/sapanca_offroad_vehicle_dirt_road.png" alt="Sapanca Yayla Yolu Araç" class="w-full h-auto rounded-lg shadow-md" />
</div>

<ul class="list-disc pl-6 space-y-2">
    <li><strong>Kuru havada:</strong> Altı çok alçak olmayan binek araçlar dikkatli sürüşle çıkabilir. Ama yavaş gideceksin, “konforlu” olmayacak.</li>
    <li><strong>Yağış sonrası:</strong> Çamur, patinaj, alt vurma riski artar. “Gerek var mı?” mantığı daha doğru.</li>
    <li><strong>Kış koşulları:</strong> Kar/buz ihtimali varsa donanım ve tecrübe yoksa risk büyür.</li>
</ul>

<hr class="my-8" />

<h2>4) Yaylada Ne Yapılır? (Tesis Yoksa Plan Vardır)</h2>
<p>Yaylada en çok yakışan 3 aktivite: Panorama yürüyüşü (60–90 dk), minimal piknik (termos+sandviç) ve fotoğraf molası.</p>

<div class="my-6">
    <img src="/images/blog/sapanca_minimal_camping_picnic.png" alt="Sapanca Minimal Kamp ve Piknik" class="w-full h-auto rounded-lg shadow-md" />
</div>

<p><strong>Kamp düşünenlere:</strong> Gece serinliği yazın bile sürpriz yapabilir. Su kaynağı her zaman garanti değil. Çöpleri geri taşımak şart.</p>

<hr class="my-8" />

<h2>5) Bir Tık Daha Bakir: Çiğdem Yaylası Mantığı</h2>
<p>Soğucak sana “hala insan var” gibi gelirse, Çiğdem Yaylası adını duyabilirsin. Buradaki ana fikir şu: Bakirlik arttıkça hazırlık ihtiyacı artar. Yol koşulları Soğucak’a göre daha zorlayıcı olabilir.</p>

<hr class="my-8" />

<h2>6) Gizli Trekking Parkurları: 3 Rota Tipi</h2>
<ul class="list-disc pl-6 space-y-2">
    <li><strong>Rota A — Zorlu (İstanbuldere’den Tırmanış):</strong> Kondisyonu iyi olanlar için. Sürekli tırmanış içerir.</li>
    <li><strong>Rota B — Orta (Yayla Çevresi Panorama):</strong> Aracını bırakıp 1–2 saatlik çevre turu. Çoğu kişi için ideal.</li>
    <li><strong>Rota C — Kolay (Orman Sınırı Kısa Keşif):</strong> 30–60 dakikalık kısa yürüyüşler. Amaç rekor değil, nefes almak.</li>
</ul>

<hr class="my-8" />

<h2>7) Kaybolmama Stratejisi: Harita Değil, Sistem</h2>
<p>Orman içinde sinyal zayıflayabilir. Bu yüzden navigasyonu “şansa” bırakma.</p>
<div class="bg-gray-100 p-4 rounded-lg my-4">
    <h4 class="font-bold">Kaybolma riskini azaltan 6 pratik</h4>
    <ul class="list-decimal pl-5 text-sm space-y-1">
        <li>Çevrimdışı harita indir</li>
        <li>Rotayı “gidip gelmeli” planla</li>
        <li>Patikadan kopma</li>
        <li>Referans noktaları belirle</li>
        <li>Dönüş saatini erken tut</li>
        <li>“Biraz daha” deme</li>
    </ul>
</div>

<hr class="my-8" />

<h2>8) Yaban Hayatı, Çoban Köpekleri ve Kamp Düzeni</h2>
<p>Burası şehir parkı değil. Pratikte en çok karşılaşacağın gerilim, bazen sürü koruyan köpekler olabiliyor.</p>
<p><strong>Köpek görürsen:</strong> Koşma, bağırma, taş atma. Sakin kal, mesafeyi artır, sürü hattından uzaklaş, çobanı seslen.</p>

<hr class="my-8" />

<h2>9) Çantanda Ne Olmalı? (Yayla Doğa Kiti)</h2>
<p>Minimum “kurtarıcı” liste: Katmanlı giyim, kaymaz taban ayakkabı, su + atıştırmalık, kafa lambası, küçük ilk yardım seti, powerbank, çöp poşeti.</p>

<h3>Mevsime Göre Hızlı Tablo</h3>
<div class="overflow-x-auto">
    <table class="min-w-full bg-white border border-gray-300 rounded-lg text-sm">
        <thead class="bg-gray-100">
            <tr>
                <th class="py-2 px-4 border-b text-left">Mevsim</th>
                <th class="py-2 px-4 border-b text-left">Yol riski</th>
                <th class="py-2 px-4 border-b text-left">Araç tavsiyesi</th>
                <th class="py-2 px-4 border-b text-left">En iyi plan</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td class="py-2 px-4 border-b">İlkbahar</td>
                <td class="py-2 px-4 border-b">çamur + sis</td>
                <td class="py-2 px-4 border-b">yüksek alt açıklığı</td>
                <td class="py-2 px-4 border-b">kısa keşif</td>
            </tr>
            <tr>
                <td class="py-2 px-4 border-b">Yaz</td>
                <td class="py-2 px-4 border-b">toz + serinlik</td>
                <td class="py-2 px-4 border-b">binek (dikkatli)</td>
                <td class="py-2 px-4 border-b">panorama + piknik</td>
            </tr>
            <tr>
                <td class="py-2 px-4 border-b">Sonbahar</td>
                <td class="py-2 px-4 border-b">ıslak yaprak</td>
                <td class="py-2 px-4 border-b">yavaş sürüş</td>
                <td class="py-2 px-4 border-b">fotoğraf + yürüyüş</td>
            </tr>
            <tr>
                <td class="py-2 px-4 border-b">Kış</td>
                <td class="py-2 px-4 border-b">kar + buz</td>
                <td class="py-2 px-4 border-b">donanımlı araç</td>
                <td class="py-2 px-4 border-b">güvenli kısa rota</td>
            </tr>
        </tbody>
    </table>
</div>

<hr class="my-8" />

<h2>10) Örnek Program: Günübirlik ve 1 Gece Kamp</h2>
<ul class="list-disc pl-6 space-y-2">
    <li><strong>Günübirlik:</strong> Sabah erken çıkış -> İstanbuldere mola -> Yayla yürüyüşü (60-90 dk) -> Piknik -> Erken dönüş.</li>
    <li><strong>1 Gece Kamp:</strong> Öğleden önce kamp kurulumu -> Akşam sıcaklık yönetimi -> Sabah yürüyüş ve toparlanma.</li>
</ul>

<hr class="my-8" />

<h2>SSS (FAQ)</h2>

<details class="group py-2 border-b border-gray-200">
    <summary class="flex justify-between items-center font-medium cursor-pointer list-none text-gray-800">
        <span>Soğucak Yaylası’na binek araçla gidilir mi?</span>
        <span class="transition group-open:rotate-180">
            <svg fill="none" height="24" shape-rendering="geometricPrecision" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
        </span>
    </summary>
    <div class="text-neutral-600 mt-3 group-open:animate-fadeIn">
        <p>Kuru havada dikkatli sürüşle mümkün olabilir. Yağış/çamur/kış koşullarında risk yükselir; güncel yol durumunu gitmeden kontrol etmek iyi olur.</p>
    </div>
</details>

<details class="group py-2 border-b border-gray-200">
    <summary class="flex justify-between items-center font-medium cursor-pointer list-none text-gray-800">
        <span>Yaylada hava yazın bile serin olur mu?</span>
        <span class="transition group-open:rotate-180">
            <svg fill="none" height="24" shape-rendering="geometricPrecision" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
        </span>
    </summary>
    <div class="text-neutral-600 mt-3 group-open:animate-fadeIn">
        <p>Genelde göl kenarına göre daha serin olur. Akşamları hızlı serinleyebileceği için ince bir sıcak katman taşı.</p>
    </div>
</details>

<details class="group py-2 border-b border-gray-200">
    <summary class="flex justify-between items-center font-medium cursor-pointer list-none text-gray-800">
        <span>Trekking için en güvenli rota hangisi?</span>
        <span class="transition group-open:rotate-180">
            <svg fill="none" height="24" shape-rendering="geometricPrecision" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
        </span>
    </summary>
    <div class="text-neutral-600 mt-3 group-open:animate-fadeIn">
        <p>İlk kez gidenler için yayla çevresi kısa panorama turları genelde daha yönetilebilir ve daha güvenlidir.</p>
    </div>
</details>

<details class="group py-2 border-b border-gray-200">
    <summary class="flex justify-between items-center font-medium cursor-pointer list-none text-gray-800">
        <span>Günübirlik mi kamp mı daha mantıklı?</span>
        <span class="transition group-open:rotate-180">
            <svg fill="none" height="24" shape-rendering="geometricPrecision" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
        </span>
    </summary>
    <div class="text-neutral-600 mt-3 group-open:animate-fadeIn">
        <p>Günübirlik plan çoğu kişi için yeterince keyifli. Kamp daha özel bir deneyim ama hazırlık ve sorumluluk ister.</p>
    </div>
</details>`,
    cover_image_url: '/images/blog/sapanca_sogucak_plateau_landscape.png',
    location: 'Sapanca',
    meta_description: 'Soğucak Yaylası’na çıkış, yol–araç seçimi ve Sapanca’nın gizli trekking rotaları. Kamp hazırlığı, navigasyon ve güvenlik tüyoları tek rehberde.',
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
