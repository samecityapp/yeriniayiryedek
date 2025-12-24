
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
    title: 'Sapanca ve Maşukiye’yi Aynı Güne Sığdırma Sanatı: Kahvaltı, Şelale ve ATV Rotası',
    slug: 'sapanca-masukiye-gunubirlik-rota-kahvalti-selale-atv',
    content: `<h1>Sapanca ve Maşukiye’yi Aynı Güne Sığdırma Sanatı: Kahvaltı, Şelale ve ATV Rotası</h1>

<p>Şehirden bir günlüğüne kaçacaksın… ama kaçışın gerçekten “kaçış” gibi hissettirmesini istiyorsun. İşte bu noktada Sapanca–Maşukiye ikilisi tam bir joker. İkisi birbirine yakın, ama hisleri bambaşka: Maşukiye daha çok “orman + dere + aktivite” enerjisinde; Sapanca ise “göl + yürüyüş + gün batımı” tarafında. Tek günün varsa, bu ikisini rastgele sırayla gezmek yerine doğru sırayı seçmen gerekiyor. Yoksa günün yarısı trafikte, diğer yarısı da “yetişememe” stresiyle geçiyor.</p>

<p>Bu rehber, “hadi gidelim” diye çıkıp kahvaltıda sıra bekleyen, öğlen sıcağında yorulup gölü göremeden dönen insanların yaptığı hataları baştan kesiyor. Sana net bir akış veriyor: sabah Maşukiye’de enerji harcayacağız, öğleden sonra Sapanca’da yavaşlayıp günü gölde kapatacağız. Yani günün temposu yukarıdan aşağıya doğru inecek. Mantık şu: Aksiyon önce, huzur sonra.</p>

<div class="my-8">
    <img src="/images/blog/masukiye_breakfast_stream.png" alt="Maşukiye Dere Kenarı Kahvaltı" class="w-full h-auto rounded-lg shadow-md" />
</div>

<h2>Önce iki konumu doğru koyalım (kafa karışmasın)</h2>
<p>Sapanca, idari olarak Sakarya tarafında; Maşukiye ise Kocaeli/Kartepe eteklerine yakın tarafta. Haritada komşu gibi dursalar da, arada hafta sonu yoğunluğunda uzayabilen bir yol var. Bu yüzden “Google 20 dakika dedi” kafasına girmiyoruz. Bizim planımız, her geçişe tampon süre koyuyor. Böylece “yetişemedik” psikolojisi yaşamıyorsun.</p>

<div class="bg-blue-50 p-4 rounded-lg my-4">
    <h3 class="font-bold text-blue-800 mb-2">Günün altın sıralaması: Sabah Maşukiye, öğleden sonra Sapanca</h3>
    <ul class="list-disc pl-5 text-sm space-y-2">
        <li>Maşukiye’de dere kenarı keyfi sabah daha temiz: hava daha serin, kalabalık daha az, masa seçimi daha rahat.</li>
        <li>ATV/zipline gibi aktiviteler öğlen kalabalığında hem sıra hem stres demek. Sabah yapmak daha akıllı.</li>
        <li>Sapanca Gölü gün batımında bambaşka bir şeye dönüşüyor. O saatleri aktiviteye değil, göl finaline ayırmak mantıklı.</li>
    </ul>
</div>

<hr class="my-8" />

<h2>Şimdi saat saat akışa geçelim.</h2>

<h3>08:30 – 09:15 | Maşukiye’ye varış: günün kilidini açtığın aralık</h3>
<p>Hafta sonu gidiyorsan, günün en kritik hamlesi “erken varmak”. Erken varınca iki şey oluyor:</p>
<ul class="list-disc pl-6 space-y-2">
    <li>kahvaltı masası için gerilmiyorsun</li>
    <li>günün geri kalanında hiçbir şey üst üste binmiyor</li>
</ul>
<p>Burada hedef “en iyi yeri kapmak” değil; hedef “günün ritmini kontrol etmek”.</p>

<h3>09:15 – 10:45 | Dere kenarı kahvaltı: doğru yeri seçme taktiği</h3>
<p>Maşukiye kahvaltısının olayı çoğu zaman “menü” değil, atmosfer. Dere sesi, ağaç gölgesi, serin hava… Bunlar doğru olduğunda, en basit kahvaltı bile “iyi hissettiriyor”.</p>
<p><strong>Mekan seçerken (isim takılmadan) şunları kontrol et:</strong></p>
<ul class="list-disc pl-6 space-y-2">
    <li>Masalar dereye çok yakın mı? Çok yakınsa sabah serinliği daha fazla olur. İnce bir üst iyi gelir.</li>
    <li>“Serpme kahvaltı” alacaksan, masaya oturmadan önce şu iki soruyu sor: “Bu serpmenin içinde sıcaklar neler?” ve “Ekstra yazabilecek kalemler var mı?”</li>
</ul>
<p class="mt-4">Küçük ama etkili ipucu: Kahvaltıyı 11:00’e sarkıtma. 11:00 sonrası hem yol hareketleniyor hem de aktivite noktalarında sıra büyüyor.</p>

<hr class="my-8" />

<h3>10:45 – 11:30 | Mini doğa yürüyüşü: şelaleye “kısa ama net” yaklaşım</h3>
<p>Maşukiye’de insanın iştahını açan şey aslında yürüyüş. Burada kendini “trekking yapacağım” diye şartlamana gerek yok. Ama 30–40 dakikalık dere hattı yürüyüşü bile günün fotoğrafını ve havasını değiştiriyor.</p>

<div class="my-6">
    <img src="/images/blog/masukiye_waterfall_walk.png" alt="Maşukiye Şelale Yürüyüşü" class="w-full h-auto rounded-lg shadow-md" />
</div>

<p><strong>Yanına alman gerekenler:</strong></p>
<ul class="list-disc pl-6 space-y-2">
    <li>Kaymayan ayakkabı (ıslak taş sürpriz yapabilir)</li>
    <li>Su (gün ilerledikçe daha çok lazım oluyor)</li>
    <li>Çok kalın olmayan bir üst (dere kenarı serin)</li>
</ul>
<p>Hedef “en uzağa gitmek” değil; hedef “temiz hava + kısa yürüyüş + zihni resetlemek”.</p>

<h3>11:30 – 13:00 | ATV / UTV / Zipline: pişmanlıksız eğlence planı</h3>
<p>Şimdi günün aksiyon kısmı. Burada en büyük hata şu: İnsanlar sosyal medyadaki görüntüye kapılıp “temiz kalırım” sanıyor. Maşukiye tarafında bu aktiviteler genelde doğa yolunda olduğu için toz/çamur olasılığı gerçek. Eğlenceli mi? Evet. Ama hazırlıksız yakalanırsan günün geri kalanı “üst baş” düşüncesiyle geçer.</p>

<div class="my-6">
    <img src="/images/blog/masukiye_atv_forest_path.png" alt="Maşukiye ATV Turu" class="w-full h-auto rounded-lg shadow-md" />
</div>

<div class="bg-yellow-50 p-4 rounded-lg my-4">
    <h4 class="font-bold text-yellow-800 mb-2">ATV/UTV yapacaksan:</h4>
    <ul class="list-disc pl-5 text-sm space-y-2">
        <li>Yedek bir tişört koy (çok şey değil, hayat kurtarıyor)</li>
        <li>Islak mendil al (gerçekten iş görüyor)</li>
        <li>Güvenlik ekipmanı konusunda gevşek olmayan bir yer seç (kask/ekipman basit görünür ama önemli)</li>
    </ul>
</div>
<p>“Kirlenmeyeyim ama heyecan olsun” diyorsan: <strong>Zipline</strong> daha temiz bir seçenek. Kısa sürüyor, hızlı bir adrenalin veriyor ve seni günün akışından koparmıyor.</p>

<hr class="my-8" />

<h3>13:00 – 14:00 | Maşukiye’den Sapanca’ya geçiş: tam doğru anda kaç</h3>
<p>Bu saat aralığında Maşukiye’nin kalabalığı artmaya başlar. O yüzden “bir tur daha” deyip gereksiz uzatma. Senin planın net: Sapanca’ya geçip göl finalini yakalamak. 13:00–14:00 bandında yola çıkman sana “rahat nefes” alanı açar.</p>

<h3>14:00 – 16:30 | Kırkpınar / Soğuksu tarafı: Sapanca’nın sakin ve şık yüzü</h3>
<p>Sapanca’ya gelince herkes direkt göl kıyısına koşuyor. Yapma. Önce bir “vites düşürme” alanı gibi Kırkpınar/Soğuksu tarafına uğramak günün kalitesini artırıyor. Burası daha ağaçlık, daha yürümelik, daha “sakin kafa” modunda.</p>
<p><strong>Burada yapılacak en iyi şeyler:</strong></p>
<ul class="list-disc pl-6 space-y-2">
    <li>20–30 dakika amaçsız yürüyüş (evet, amaçsız)</li>
    <li>Kahve molası (günün ortasında iyi reset)</li>
    <li>Küçük yerel alışveriş (abartmadan; doğal ürün, minik hediyelik vs.)</li>
</ul>

<hr class="my-8" />

<h3>16:30 – 19:00 | Sapanca Gölü kıyısı: gün batımı planı (günün altın finali)</h3>
<p>Gelelim günün “hak edilmiş” kısmına. Sapanca Gölü’nü öğlen görmekle gün batımında görmek aynı şey değil. Gün batımına yakın saatlerde ışık yumuşuyor, rüzgar tatlılıyor, gölün yüzeyi daha fotojenik oluyor.</p>

<div class="my-6">
    <img src="/images/blog/sapanca_lake_sunset_pier.png" alt="Sapanca Gölü Gün Batımı" class="w-full h-auto rounded-lg shadow-md" />
</div>

<p><strong>Göl kıyısında en iyi akış:</strong></p>
<ul class="list-disc pl-6 space-y-2">
    <li>16:30–17:30 → yürüyüş + hafif atıştırmalık</li>
    <li>17:30–18:30 → iskele/oturma noktası bulma + fotoğraf + dinlenme</li>
    <li>18:30–19:00 → gün batımı (mevsime göre dakika oynar)</li>
</ul>

<hr class="my-8" />

<h3>19:00 – 20:30 | Akşam yemeği: günün “kapanış” menüsü nasıl seçilir?</h3>
<p>Günün sonunda üç farklı kapanış karakteri var. Hangisi senin tarzınsa onu seç:</p>
<ul class="list-disc pl-6 space-y-2">
    <li><strong>Hafif kapanış:</strong> Gün boyu yediysen, göl kenarında daha hafif bir şeyle günü bağlamak rahat olur. Dönüşte de daha iyi hissedersin.</li>
    <li><strong>Bölgesel klasik arıyorsan:</strong> Sakarya tarafına gelmişken insanların “imza” diye konuştuğu seçeneklerden biri ıslama köfte tarzı yemekler. Doyurucudur, günün yorgunluğuna gider.</li>
    <li><strong>Orman tarafına geri dönüp kapanış yapmak:</strong> Bunu sadece trafik çok açıldıysa yap. Yoksa tekrar Maşukiye yönüne dönmek bazen gereksiz zaman kaybına dönüşüyor.</li>
</ul>

<h3>Dönüş planı: aynı günün en kritik ikinci kararı</h3>
<p>Özellikle pazar akşamı dönüşte iki stratejin olsun:</p>
<ul class="list-disc pl-6 space-y-2">
    <li><strong>Erken dön:</strong> Gün batımını çok uzatmadan çık, trafiğe yakalanma ihtimalini azalt.</li>
    <li><strong>Geç dön:</strong> Yemeği uzat, çay/kahve iç, dönüşü biraz geciktir. Bazen “herkes dönüyor” anını beklemek yerine, o dalga geçince çıkmak daha konforlu olur.</li>
</ul>

<hr class="my-8" />

<h2>Mini SSS (FAQ)</h2>

<details class="group py-2 border-b border-gray-200">
    <summary class="flex justify-between items-center font-medium cursor-pointer list-none text-gray-800">
        <span>Sapanca ve Maşukiye aynı günde gezilir mi?</span>
        <span class="transition group-open:rotate-180">
            <svg fill="none" height="24" shape-rendering="geometricPrecision" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
        </span>
    </summary>
    <div class="text-neutral-600 mt-3 group-open:animate-fadeIn">
        <p>Evet, doğru sırayla gezersen çok rahat sığar: sabah Maşukiye (kahvaltı + yürüyüş + aktivite), öğleden sonra Sapanca (Kırkpınar + göl + gün batımı).</p>
    </div>
</details>

<details class="group py-2 border-b border-gray-200">
    <summary class="flex justify-between items-center font-medium cursor-pointer list-none text-gray-800">
        <span>ATV yapmadan da keyif olur mu?</span>
        <span class="transition group-open:rotate-180">
            <svg fill="none" height="24" shape-rendering="geometricPrecision" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
        </span>
    </summary>
    <div class="text-neutral-600 mt-3 group-open:animate-fadeIn">
        <p>Olur. Hatta “kirlenmeyeyim” diyenler için dere yürüyüşü + seyir noktası + gölde bisiklet kombinasyonu daha konforlu.</p>
    </div>
</details>

<details class="group py-2 border-b border-gray-200">
    <summary class="flex justify-between items-center font-medium cursor-pointer list-none text-gray-800">
        <span>Çocuklu aileler için en mantıklı akış ne?</span>
        <span class="transition group-open:rotate-180">
            <svg fill="none" height="24" shape-rendering="geometricPrecision" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
        </span>
    </summary>
    <div class="text-neutral-600 mt-3 group-open:animate-fadeIn">
        <p>Sabah kahvaltıyı uzatmadan kısa doğa yürüyüşü, sonra Sapanca göl kenarında daha uzun vakit. Çok fazla aktivite sıkıştırmak çocuklarda yorucu olabiliyor.</p>
    </div>
</details>

<details class="group py-2 border-b border-gray-200">
    <summary class="flex justify-between items-center font-medium cursor-pointer list-none text-gray-800">
        <span>En çok zaman nerede kaybolur?</span>
        <span class="transition group-open:rotate-180">
            <svg fill="none" height="24" shape-rendering="geometricPrecision" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
        </span>
    </summary>
    <div class="text-neutral-600 mt-3 group-open:animate-fadeIn">
        <p>Kahvaltı sırası + Maşukiye çıkış trafiği + göl kenarında park yeri arama. Bu üçüne hazırlıklı olursan gün çok rahat akar.</p>
    </div>
</details>

<div class="bg-green-50 p-6 rounded-lg mt-8">
    <h3 class="font-bold text-green-800 mb-4">Çıkmadan 2 Dakikalık Kontrol Listesi</h3>
    <ul class="checkbox-list space-y-2">
        <li class="flex items-center"><span class="mr-2">✅</span> İnce bir üst aldım (dere kenarı serin olabilir)</li>
        <li class="flex items-center"><span class="mr-2">✅</span> Kaymayan ayakkabı giydim</li>
        <li class="flex items-center"><span class="mr-2">✅</span> ATV düşünüyorsam yedek tişört + ıslak mendil koydum</li>
        <li class="flex items-center"><span class="mr-2">✅</span> Göl kenarı için su aldım</li>
        <li class="flex items-center"><span class="mr-2">✅</span> Dönüş için “erken” ve “geç” olmak üzere iki plan yaptım</li>
    </ul>
</div>`,
    cover_image_url: '/images/blog/masukiye_waterfall_walk.png',
    location: 'Sapanca',
    meta_description: 'Sapanca ve Maşukiye’yi 1 günde gez: dere kenarı kahvaltı, şelale yürüyüşü, ATV/zipline, Kırkpınar ve gölde gün batımı. Saat saat rota.',
    is_published: true,
    published_at: new Date().toISOString()
};

async function run() {
    console.log('Inserting Sapanca-Masukiye Route Article...');

    // Insert new article
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
