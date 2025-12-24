
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
            envVars[match[1].trim()] = match[2].trim().replace(/^['"]|['"]$/g, '');
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
    title: 'İstanbul’dan Sapanca’ya Arabasız Ulaşım Rehberi: YHT, Otobüs ve VIP Seçenekler',
    slug: 'sapanca-arabasiz-ulasim-rehberi-yht-otobus',
    content: `<h1>İstanbul’dan Sapanca’ya Arabasız Ulaşım Rehberi: YHT, Otobüs ve VIP Seçenekler</h1>

<p>Sapanca, İstanbul’a yakınlığıyla meşhur ama genelde “arabayla gidilecek yer” olarak bilinir. Peki arabanız yoksa veya kullanmak istemiyorsanız? Hiç dert değil. Yüksek Hızlı Tren (YHT) ve sık otobüs seferleri sayesinde Sapanca, arabasız en rahat gidilen tatil rotalarından biri.</p>

<p>Bu rehberde; Pendik/Söğütlüçeşme’den trene binip göl kenarında inmenin inceliklerini, otobüs terminalinden merkeze geçişi ve bungalovlara (dağ bölgesine) nasıl çıkacağınızı adım adım anlatıyoruz.</p>

<div class="my-8">
    <img src="/images/blog/sapanca_yht_train_journey.png" alt="Sapanca YHT Tren Yolculuğu" class="w-full h-auto rounded-lg shadow-md" />
</div>

<h2>1) En Hızlı ve Konforlu: Yüksek Hızlı Tren (YHT)</h2>
<p>İstanbul trafiğini tamamen pas geçmenin tek yolu rayların üzerinden gitmektir. Ve Sapanca, ana YHT hattı üzerinde bir durak olduğu için çok şanslısınız.</p>

<div class="bg-blue-50 p-4 rounded-lg my-4">
    <h3 class="font-bold text-blue-800 mb-2">Rota ve Süre:</h3>
    <ul class="list-disc pl-5 text-sm space-y-2">
        <li><strong>Binilecek Duraklar:</strong> Söğütlüçeşme, Bostancı, Pendik (Anadolu Yakası); Halkalı, Bakırköy (Avrupa Yakası - sınırlı sefer).</li>
        <li><strong>İneceğiniz Durak:</strong> Arifiye (Sakarya) veya İzmit.</li>
        <li><strong>Kritik Bilgi:</strong> YHT’lerin hepsi doğrudan “Sapanca” durağında durmaz (Sapanca durağı normal tren içindir). En pratik yöntem: Arifiye YHT durağında inmek.</li>
    </ul>
</div>

<p class="mt-4">Arifiye Garı’nda indikten sonra hemen garın önünden kalkan Sapanca minibüsleri veya taksi ile 15–20 dakikada Sapanca göl kenarına ulaşabilirsiniz. Bu yolculuk, otoyol stresinden uzak ve çok konforludur.</p>

<hr class="my-8" />

<h2>2) Klasik ve Ekonomik: Şehirlerarası Otobüs</h2>
<p>“Ben trende yer bulamadım” veya “Esenler’den bineceğim” diyorsanız, otobüs en sağlam alternatiftir. Hemen hemen her firmanın (Metro, Kale, Vib vb.) Sapanca seferi vardır.</p>

<div class="my-6">
    <img src="/images/blog/sapanca_bus_terminal_modern.png" alt="Sapanca Otobüs Terminali" class="w-full h-auto rounded-lg shadow-md" />
</div>

<h3 class="font-bold text-gray-800 mt-4">Nereye Bırakır?</h3>
<p>Otobüsler sizi genellikle Sapanca Otogarı’nda veya Berceste gibi otoyol üzerindeki tesislerde indirir. Bilet alırken “Sapanca Terminal” olarak teyit etmekte fayda var.</p>
<ul class="list-disc pl-6 space-y-2 mt-2">
    <li><strong>Terminalden Merkeze:</strong> Sapanca terminali merkeze oldukça yakındır. Yürüyerek 10-15 dakika, taksiyle 3 dakika sürer.</li>
    <li><strong>Otoyol Tesisinde İnerseniz:</strong> Servis veya taksi kullanmanız gerekir; bu yüzden terminal varışlı bilet almak her zaman daha pratiktir.</li>
</ul>

<hr class="my-8" />

<h2>3) Bungalovlara Ulaşım: “Dağa Nasıl Çıkarım?”</h2>
<p>İşte turun en kritik noktası burası. Sapanca’ya geldiniz, göl kenarındasınız. Ama kiraladığınız o meşhur bungalov muhtemelen dağın yamacında veya orman içinde.</p>

<div class="my-6">
    <img src="/images/blog/sapanca_taxi_transfer_bungalow.png" alt="Sapanca Bungalov Transfer" class="w-full h-auto rounded-lg shadow-md" />
</div>

<div class="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-400 my-4">
    <h3 class="font-bold text-yellow-800 mb-2">Gerçekçi Olalım:</h3>
    <p>Bungalov bölgelerine (Dibektaş, İlmiye, Balkaya köyleri) toplu taşıma çok seyrektir veya yoktur. Bavulla yürümek imkansızdır (dik yokuş).</p>
    <p class="font-bold mt-2">Çözüm: Taksi.</p>
    <p>Sapanca merkez taksi duraklarından bungalovunuzun konumunu gösterip fiyat alın. Mesafe kısa görünse de yokuş olduğu için taksi en mantıklı seçenektir. Ortalama 100-250 TL bandında (konuma göre) tutabilir.</p>
</div>

<hr class="my-8" />

<h2>4) Sapanca İçinde Yürüyüş ve Bisiklet</h2>
<p>Merkezde ve sahil şeridinde araca ihtiyacınız yok. Sahil boyunca uzanan dümdüz yürüyüş yolu (Sanat Sokağı’ndan başlayıp Kırkpınar’a kadar) harika bir rotadır.</p>

<div class="my-6">
    <img src="/images/blog/sapanca_lake_walking_path_transport.png" alt="Sapanca Gölü Yürüyüş Yolu" class="w-full h-auto rounded-lg shadow-md" />
</div>

<ul class="list-disc pl-6 space-y-2">
    <li><strong>Bisiklet Kiralama:</strong> Sahil bandında belediyenin ve özel işletmelerin bisikletleri var.</li>
    <li><strong>Yeme-İçme:</strong> Restoranların çoğu sahil hattında veya Bağdat Caddesi üzerindedir; buralar yürüyüş mesafesindedir.</li>
</ul>

<div class="bg-green-50 p-6 rounded-lg text-center mt-8">
    <h3 class="font-bold text-green-800 mb-2">Özet Plan: Arabasız Hafta Sonu</h3>
    <ul class="text-left list-decimal pl-8 space-y-2 mt-4 inline-block">
        <li><strong>Cuma Akşam:</strong> YHT ile Arifiye’ye gel, taksiyle otele/bungalova geç.</li>
        <li><strong>Cumartesi:</strong> Sabah bungalov keyfi, öğleden sonra taksiyle sahile in, göl kenarında yürü ve yemek ye.</li>
        <li><strong>Pazar:</strong> Kahvaltı sonrası terminalden otobüsle direkt dönüş.</li>
    </ul>
    <p class="text-green-900 mt-4">Stres yok, park yeri arama derdi yok, trafik yok.</p>
</div>`,
    cover_image_url: '/images/blog/sapanca_yht_train_journey.png',
    location: 'Sapanca',
    meta_description: 'İstanbul’dan Sapanca’ya arabasız nasıl gidilir? YHT (Hızlı Tren) durakları, otobüs firmaları ve bungalovlara taksi/transfer tüyoları.',
    is_published: true,
    published_at: new Date().toISOString()
};

async function run() {
    console.log(`Inserting: ${article.slug}`);
    const { error } = await supabase
        .from('articles')
        .upsert(article, { onConflict: 'slug' });

    if (error) {
        console.error('Error:', error.message);
    } else {
        console.log('Success!');
    }
}

run();
