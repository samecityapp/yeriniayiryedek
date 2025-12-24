
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
    title: 'Sapanca’dan Ne Alınır? Bal, Ayva, Peynir ve Fidan Rehberi',
    slug: 'sapanca-yerel-alisveris-rehberi-bal-ayva-cerkez-peyniri',
    content: `<h1>Sapanca Yerel Alışveriş Rehberi: Yol Kenarı Tezgahları, Kestane Balı ve Çerkez Peyniri</h1>

<p>Tatil bitti, dönüş yolu göründü… Tam da o an başlar Sapanca’nın “son sürprizi”: Yol kenarı tezgâhları. Bir yanda kavanoz kavanoz reçel, bir yanda mis gibi peynir kokusu, öbür yanda turuncu turuncu hurmalar… “Bir durup bakayım” diye frene basarsın, sonra bagaj bir anda doluverir.</p>

<p>Ama küçük bir gerçek var: Yol kenarı alışverişi harika olduğu kadar tuzaklı da olabilir. Her kavanoz ev yapımı değildir, her bal “doğal” çıkmayabilir, peynirin güneşte beklemişi de işin keyfini kaçırır. Bu rehberde sana Sapanca merkez–Kırkpınar hattından Maşukiye’ye, Yanık tarafındaki fidanlıklardan Kartepe yoluna kadar uzanan güzergâhta ne alınır, nereden alınır, nasıl seçilir hepsini tek tek anlatacağım.</p>

<div class="my-8">
    <img src="/images/blog/sapanca_roadside_stall_honey_jam.png" alt="Sapanca Yol Kenarı Tezgahı ve Reçeller" class="w-full h-auto rounded-lg shadow-md" />
</div>

<div class="bg-blue-50 p-4 rounded-lg my-4">
    <h2 class="text-xl font-bold text-blue-800 mb-2">Kısa Özet: 2 Dakikada “Ne Alayım?” Listesi</h2>
    <ul class="list-disc pl-5 text-sm space-y-2">
        <li><strong>Tezgâh seçerken:</strong> “Çok süslü vitrin” yerine ürünü konuşan esnafı bul.</li>
        <li><strong>Reçelde:</strong> Etiket okuma refleksi kazan: gereksiz katkı/şurup görürsen pas geç.</li>
        <li><strong>Kestane balı:</strong> Acımsı ve yoğun olur; aşırı tatlıysa şüphelen.</li>
        <li><strong>“Eşme ayvası”:</strong> İri değil, mis kokulu ve diri olanı hedefle.</li>
        <li><strong>Cennet hurması:</strong> Hediyelik en rahatı kuru hurma (daha az ezilir).</li>
        <li><strong>İsli Çerkez peyniri:</strong> Soğuk zincir ve paketleme şart.</li>
        <li><strong>Fidan/bitki:</strong> Arabaya sığdırma işini satıcıya bırak; doğru sararsa sorun çıkmaz.</li>
    </ul>
</div>

<hr class="my-8" />

<h2>1) Yol Kenarı Tezgâhı: Gerçek Üretici mi, Turistik Vitrin mi?</h2>
<p>Sapanca’dan Maşukiye’ye doğru ilerlerken tezgâh sayısı artar. Hepsi kötü değil, hepsi mükemmel de değil. Burada amaç “en ucuz”u bulmak değil; en güvenilir ve en temiz ürünü seçmek.</p>
<ul class="list-disc pl-6 space-y-2">
    <li><strong>Gerçek tezgâhın sinyalleri:</strong> Ürün az ama “sürekli tazeleniyor” gibi durur. Satıcı ürünü anlatırken detay verir. Güneşten korunmuştur.</li>
    <li><strong>Turistik vitrin riskleri:</strong> Her şey aynı gramaj, aynı kapak, aynı renk… “Fazla kusursuz” görüntü bazen ipucu olur. Etiket “yöresel” yazar ama içerik listesi kalabalıktır.</li>
</ul>

<hr class="my-8" />

<h2>2) Reçel Alırken 3 Basit Kontrol (Gerçekten İşe Yarıyor)</h2>
<p>Sapanca tezgâhlarında reçel en sık alınan ürünlerden. Ama reçel dediğin, “meyve + şeker + sabır” işidir. Kısayol çok olunca tat da değişir.</p>
<div class="bg-yellow-50 p-4 rounded-lg my-4">
    <h3 class="font-bold text-yellow-800 mb-2">Reçelde hızlı kontrol listesi</h3>
    <ul class="list-disc pl-5 text-sm space-y-2">
        <li><strong>Meyve dokusu:</strong> Tam püre gibi değil; meyve parçası kendini belli eder.</li>
        <li><strong>Koku:</strong> Burnuna meyve kokusu gelir; şeker kokusu baskınsa iyi sinyal değil.</li>
        <li><strong>İçerik:</strong> “Gereksiz” kalabalık içerik görürsen uzak dur.</li>
    </ul>
</div>

<hr class="my-8" />

<h2>3) Kestane Balı: Tat Profili, Seçme Tüyosu, Saklama</h2>
<p>Kestane balı “klasik çiçek balı” gibi değildir. Daha koyu renkli, daha yoğun ve çoğu kişiye göre acımsı bir bitişe sahip olur. İlk kez deneyenler “Bu niye tatlı değil?” diye şaşırabilir; işin doğası bu.</p>
<p><strong>Satın almadan önce soracağın 4 soru:</strong> Bu balın tadı acımsı mı? Hangi dönemin balı? Kavanoz güneşte bekledi mi? Tadım mümkün mü?</p>
<p class="text-sm text-gray-600 mt-2"><em>Önemli sağlık notu: Bal güçlü bir gıda. Alerjisi olanlar dikkat etmeli. Çok küçük çocuklarda bal kullanımıyla ilgili hassasiyetler olabilir, doktorunuza danışın.</em></p>

<hr class="my-8" />

<h2>4) “Eşme Ayvası” Diye Bilinen Ayva: Nasıl Seçilir, Nasıl Taşınır?</h2>
<p>Sapanca çevresinde “Eşme ayvası” adıyla anılan ayva, özellikle sonbahar–kış döneminde tezgâhlarda sık görünür. Ayvayı seçerken hedef “en iri” değil; en kokulu ve diri olan.</p>

<div class="my-6">
    <img src="/images/blog/sapanca_quince_persimmon_crate.png" alt="Sapanca Ayva ve Cennet Hurması" class="w-full h-auto rounded-lg shadow-md" />
</div>

<ul class="list-disc pl-6 space-y-2">
    <li><strong>Seçme tüyosu:</strong> Elinde ağır ve dolgun hissettirmeli. Kokla, ayva kokusu belirgin olmalı.</li>
    <li><strong>Saklama:</strong> Üst üste yığma; araya kâğıt koy. Serin yerde sakla.</li>
</ul>

<hr class="my-8" />

<h2>5) Cennet Hurması: Yaş mı Kuru mu? Hediyelik Hangisi?</h2>
<p>Sonbahar sonu–kış başı döneminde turuncu hurmalar hem tezgâhta hem evlerin bahçelerinde karşına çıkar. Burada seçim, “eve nasıl götüreceğim?” sorusuna göre değişir.</p>
<ul class="list-disc pl-6 space-y-2">
    <li><strong>Yaş hurma:</strong> Çok olgunlaşınca yumuşar, taşıması zorlaşır; ezilmeye çok müsait.</li>
    <li><strong>Kuru hurma:</strong> Daha kompakt, daha pratik; kahvenin yanında tatlı gibi gider. Hediyelik için genelde daha risksiz.</li>
</ul>

<hr class="my-8" />

<h2>6) İsli Çerkez Peyniri: Doğru Ürün, Doğru Saklama</h2>
<p>Sapanca–Adapazarı hattında isli Çerkez peyniri çok konuşulur. Duman aroması belirgindir; kahvaltıda dilim dilim gider, bazıları ızgarada kısa kızartıp yer.</p>
<div class="border-l-4 border-red-500 pl-4 my-4">
    <h4 class="font-bold text-red-700">Soğuk zincir kuralı:</h4>
    <p>Peynir güneşte beklediyse “Aman bir şey olmaz” deme. Özellikle uzun yola gideceksen, küçük bir soğutucu çanta/termal çanta büyük konfor sağlar.</p>
</div>

<hr class="my-8" />

<h2>7) “Kestane Kabağı” ve Fidanlık Alışverişi</h2>
<p>Kış aylarına doğru tezgâhlarda büyük dilim balkabakları görürsün. Burada amaç “tatlı yapınca lif lif olmaması”dır. Renk canlı, içi diri olmalı.</p>
<p><strong>Fidanlık ve Süs Bitkileri:</strong> Sapanca çevresi, özellikle Kırkpınar–Yanık hattında fidanlık cennetidir. Bitki alırken asıl olay sığdırmak değil, doğru paketlemek. Satıcıdan saksıyı poşetlemesini ve dalları sarmasını isteyin.</p>

<hr class="my-8" />

<h2>Hızlı Tablo: Ne Alınır, Nasıl Taşınır, Evde Ne Yapılır?</h2>
<div class="overflow-x-auto">
    <table class="min-w-full bg-white border border-gray-300 rounded-lg text-sm">
        <thead class="bg-gray-100">
            <tr>
                <th class="py-2 px-4 border-b text-left">Ürün</th>
                <th class="py-2 px-4 border-b text-left">Tezgahta kontrol</th>
                <th class="py-2 px-4 border-b text-left">Taşıma tüyosu</th>
                <th class="py-2 px-4 border-b text-left">Evde saklama</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td class="py-2 px-4 border-b font-medium">Reçel</td>
                <td class="py-2 px-4 border-b">meyve dokusu + koku</td>
                <td class="py-2 px-4 border-b">dik taşı, kapak sızdırmasın</td>
                <td class="py-2 px-4 border-b">serin dolap</td>
            </tr>
            <tr>
                <td class="py-2 px-4 border-b font-medium">Kestane balı</td>
                <td class="py-2 px-4 border-b">acımsı tat + koyu renk</td>
                <td class="py-2 px-4 border-b">güneşte bırakma</td>
                <td class="py-2 px-4 border-b">serin, güneşsiz</td>
            </tr>
            <tr>
                <td class="py-2 px-4 border-b font-medium">Ayva</td>
                <td class="py-2 px-4 border-b">koku + diri doku</td>
                <td class="py-2 px-4 border-b">araya kâğıt koy</td>
                <td class="py-2 px-4 border-b">serin ve kuru yer</td>
            </tr>
            <tr>
                <td class="py-2 px-4 border-b font-medium">İsli peynir</td>
                <td class="py-2 px-4 border-b">soğukta duruyor mu?</td>
                <td class="py-2 px-4 border-b">termal çanta</td>
                <td class="py-2 px-4 border-b">buzdolabı</td>
            </tr>
        </tbody>
    </table>
</div>

<hr class="my-8" />

<h2>10) Dönüş Yoluna Özel Mini Plan: Bagajı Akıllı Doldur</h2>
<p>Zamanı iyi yönetirsen hem daha az stres, hem daha doğru alışveriş.</p>
<ul class="list-disc pl-6 space-y-2">
    <li><strong>30 dakikalık plan:</strong> Önce dayanıklı ürünler (bal, reçel) → Sonra meyve (ayva/hurma) → En son soğuk ürün (peynir).</li>
    <li><strong>En son:</strong> Fidan/bitki (ezilmesin diye en üste).</li>
</ul>

<hr class="my-8" />

<h2>SSS (FAQ)</h2>

<details class="group py-2 border-b border-gray-200">
    <summary class="flex justify-between items-center font-medium cursor-pointer list-none text-gray-800">
        <span>Sapanca’dan ne alınır?</span>
        <span class="transition group-open:rotate-180">
            <svg fill="none" height="24" shape-rendering="geometricPrecision" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
        </span>
    </summary>
    <div class="text-neutral-600 mt-3 group-open:animate-fadeIn">
        <p>En popüler seçenekler reçel, bal, ayva/hurma gibi meyveler, isli peynir ve fidan/bitki alışverişi.</p>
    </div>
</details>

<details class="group py-2 border-b border-gray-200">
    <summary class="flex justify-between items-center font-medium cursor-pointer list-none text-gray-800">
        <span>Yol kenarı tezgâhında ürünün doğal olduğunu nasıl anlarım?</span>
        <span class="transition group-open:rotate-180">
            <svg fill="none" height="24" shape-rendering="geometricPrecision" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
        </span>
    </summary>
    <div class="text-neutral-600 mt-3 group-open:animate-fadeIn">
        <p>Saklama şartına bak (güneş/ısı), etiketi oku (gereksiz içerik kalabalığı), mümkünse tadım yap.</p>
    </div>
</details>

<details class="group py-2 border-b border-gray-200">
    <summary class="flex justify-between items-center font-medium cursor-pointer list-none text-gray-800">
        <span>Kestane balı neden farklı tat verir?</span>
        <span class="transition group-open:rotate-180">
            <svg fill="none" height="24" shape-rendering="geometricPrecision" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
        </span>
    </summary>
    <div class="text-neutral-600 mt-3 group-open:animate-fadeIn">
        <p>Genelde koyu renkli ve acımsı bir karakteri olur. Aşırı tatlı ve hafifse karışım olma ihtimali artar.</p>
    </div>
</details>

<details class="group py-2 border-b border-gray-200">
    <summary class="flex justify-between items-center font-medium cursor-pointer list-none text-gray-800">
        <span>İsli Çerkez peyniri alırken en kritik nokta ne?</span>
        <span class="transition group-open:rotate-180">
            <svg fill="none" height="24" shape-rendering="geometricPrecision" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
        </span>
    </summary>
    <div class="text-neutral-600 mt-3 group-open:animate-fadeIn">
        <p>Soğuk zincir. Tezgahta serin tutulması ve eve gidene kadar uygun taşınması önemli.</p>
    </div>
</details>

<details class="group py-2 border-b border-gray-200">
    <summary class="flex justify-between items-center font-medium cursor-pointer list-none text-gray-800">
        <span>Fidan/bitki alırsam arabada taşırken neye dikkat edeyim?</span>
        <span class="transition group-open:rotate-180">
            <svg fill="none" height="24" shape-rendering="geometricPrecision" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
        </span>
    </summary>
    <div class="text-neutral-600 mt-3 group-open:animate-fadeIn">
        <p>Saksıyı sabitle, dalları toparlat, devrilmeyecek şekilde yerleştir. Satıcıdan paketleme desteği istemek normal.</p>
    </div>
</details>`,
    cover_image_url: '/images/blog/sapanca_roadside_stall_honey_jam.png',
    location: 'Sapanca',
    meta_description: 'Sapanca–Maşukiye yolunda tezgâhlardan doğru ürün seç: kestane balı, “Eşme ayvası”, isli Çerkez peyniri, hurma ve fidanlık tüyoları.',
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
