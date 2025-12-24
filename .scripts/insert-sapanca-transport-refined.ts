
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

const oldSlug = 'sapanca-arabasiz-ulasim-rehberi-yht-otobus';

const article = {
    title: 'İstanbul’dan Sapanca’ya Arabasız Ulaşım Rehberi: YHT, Bölgesel Tren, Otobüs ve Son Kilometre Taktikleri',
    slug: 'istanbuldan-sapancaya-arabasiz-ulasim-yht-otobus-tren',
    content: `<h1>İstanbul’dan Sapanca’ya Arabasız Ulaşım Rehberi: YHT, Bölgesel Tren, Otobüs ve Son Kilometre Taktikleri</h1>

<p>Sapanca’yı İstanbul’un “kaçamak rotası” yapan şey şu: Bir anda şehirden çıkıp göl havasına giriyorsun. Ama işin komik tarafı, çoğu kişi hâlâ “Arabam yoksa Sapanca olmaz” sanıyor. Halbuki doğru planla, trafik stresine girmeden ve tek bir günde bile Sapanca’ya çok rahat gidersin. Üstelik arabasız gitmenin gizli bir avantajı var: O meşhur TEM trafiğiyle kavga etmiyorsun, park yeri aramıyorsun, “dönüşte kim kullanacak?” telaşı yaşamıyorsun.</p>

<p>Bu rehberde sana şunu net şekilde çözdürüyorum: Hangi ulaşım biçimi kime uygun, nerede inmek daha mantıklı, son kilometrede nasıl zorlanmadan konaklamana varırsın, dönüşte nasıl açıkta kalmazsın.</p>

<div class="my-8">
    <img src="/images/blog/sapanca_yht_train_journey.png" alt="Sapanca YHT Tren Yolculuğu" class="w-full h-auto rounded-lg shadow-md" />
</div>

<h2>1) Önce Büyük Resim: Sapanca’da “Nereye” Gitmek İstiyorsun?</h2>
<p>“Sapanca’ya gidiyorum” tek başına yeterli değil, çünkü Sapanca’da iki farklı dünya var:</p>
<ul class="list-disc pl-6 space-y-2">
    <li><strong>Sapanca Merkez & Göl Kenarı:</strong> Yürüyerek gezilir, bisikletle akar. Trenle geldiğinde en rahat burası.</li>
    <li><strong>Kırkpınar – Maşukiye – Kartepe hattı (orman/bungalov bölgeleri):</strong> Burada yokuş var, mesafeler uzuyor. Arabasız gidiyorsan genelde taksi veya dolmuş planı şart.</li>
</ul>
<p>Yani senin hedefin sadece göl kenarında yürümekse “merkez odaklı” plan yapacağız. Bungalova gidiyorsan “son kilometre stratejisini” iyi kuracağız.</p>

<hr class="my-8" />

<h2>2) Trenle Gitmek: En Rahat ve En Az Sürprizli Seçenek</h2>
<p>Sapanca’ya arabasız ulaşımın kralı tren. Ama burada insanların en çok karıştırdığı şey şu: YHT ile bölgesel tren aynı şey değil ve iniş noktaları farklı olabiliyor.</p>

<h3>A) Bölgesel Tren (Ada Ekspresi tarzı hatlar) – “Sapanca durağına inme” ihtimali</h3>
<p>Sapanca’ya doğrudan Sapanca istasyonunda inmeyi hedefliyorsan, aradığın şey çoğu zaman bölgesel tren oluyor. Bu trenler İstanbul tarafında bazı dönemler Gebze/Pendik hattından veya yakın istasyonlardan kalkıp Sakarya yönüne ilerleyebiliyor.</p>
<p><strong>En büyük artısı:</strong> Uygun sefer yakalarsan Sapanca merkez istasyonunda inersin. Bu, arabasız gelen biri için büyük konfor.</p>
<div class="bg-yellow-50 p-4 rounded-lg my-4">
    <p><strong>Gerçekçi not:</strong> Bölgesel hatların sefer sıklığı YHT kadar sık olmayabilir. Bazı dönemlerde başlangıç-bitiş noktaları ve duruşlar güncellenebilir. Bu yüzden bilet ararken “varış: Sapanca” filtreleyerek bakmak en sağlam yöntem.</p>
</div>
<p><strong>Kim seçmeli?</strong> “Ben indiğim anda Sapanca merkezde olayım, aktarma istemiyorum” diyenler.</p>

<h3>B) YHT (Yüksek Hızlı Tren) – çoğunlukla Arifiye’de inip devam</h3>
<p>YHT ile Sapanca’ya yaklaşım biraz farklı: YHT’nin ana omurgası Ankara/Konya yönü olduğu için, Sapanca merkez istasyonu yerine genelde Arifiye gibi yakın istasyonlarda duruş görürsün.</p>
<p><strong>En büyük artısı:</strong> Çok hızlı ve konforlu. İstanbul’dan çıkıp “tren keyfiyle” gelmek isteyenlerin favorisi.</p>
<p><strong>Kritik gerçek:</strong> YHT ile geldiğinde çoğu senaryoda Sapanca merkezde değil, Arifiye tarafında inip minibüs/taksiyle Sapanca’ya geçmen gerekir.</p>

<p><strong>Kim seçmeli?</strong> “YHT’ye binerim, hızlıca gelirim, sonrasında kısa bir transfer yaparım” diyenler. Özellikle bilet bulma esnekliği isteyenlerde iyi çalışır.</p>

<div class="my-6">
    <img src="/images/blog/sapanca_yht_train_journey.png" alt="Sapanca Tren Ulaşımı" class="w-full h-auto rounded-lg shadow-md" />
</div>

<hr class="my-8" />

<h2>3) İstanbul İçinde Trene Nasıl Bağlanırsın? (Pratik Yol Haritası)</h2>
<p>İstanbul’da asıl mesele “Sapanca’ya nasıl gideceğim” değil; trene en kolay nereden bineceğim.</p>
<ul class="list-disc pl-6 space-y-2">
    <li><strong>Avrupa Yakası’ndaysan:</strong> Genelde Marmaray + aktarma ile Anadolu yakasına geçip tren hattına bağlanmak daha akıcı olur.</li>
    <li><strong>Anadolu Yakası’ndaysan:</strong> Tren istasyonlarına ulaşmak zaten daha kolay.</li>
</ul>
<p class="mt-4"><strong>Burada altın kural şu:</strong> “Biletin hangi istasyondan?” sorusunu en başta çöz. Biletini aldıktan sonra, o istasyona Marmaray/metro/otobüsle ulaşım planını yap. Böylece “treni kaçırma” riski ciddi düşer.</p>

<hr class="my-8" />

<h2>4) Bilet Bulma Stratejisi: Sapanca’da Tatilin Yarısı “Plan”, Yarısı “Şans”</h2>
<p>Sapanca hafta sonu kaçamağı olduğu için biletlerde bir gerçek var: Cuma gidiş – Pazar dönüş kombinasyonu hızlı dolabiliyor.</p>

<div class="bg-blue-50 p-4 rounded-lg my-4">
    <h3 class="font-bold text-blue-800 mb-2">Senin yapman gereken 3 hamle:</h3>
    <ol class="list-decimal pl-5 text-sm space-y-2">
        <li><strong>Biletini erken kovala:</strong> Özellikle hafta sonu gidiyorsan son gün aramak kumar.</li>
        <li><strong>Plan B hazır tut:</strong> YHT doluysa bölgesel tren, o da doluysa otobüs; tek kanala bağlanma.</li>
        <li><strong>Dönüşü ayrı ciddiye al:</strong> Sapanca dönüşünde geç kalınca “taksiye mecbur” kalmak kolay.</li>
    </ol>
</div>

<hr class="my-8" />

<h2>5) Otobüsle Gitmek: Doğru İndirme Noktasını Seçmezsen Moral Bozulur</h2>
<p>“Ben tren istemiyorum” diyorsan otobüs de olur ama burada en sık yaşanan problem şu: Bazı otobüsler Sapanca’nın içine girmez.</p>

<div class="my-6">
    <img src="/images/blog/sapanca_bus_terminal_modern.png" alt="Sapanca Otobüs Terminali" class="w-full h-auto rounded-lg shadow-md" />
</div>

<h3 class="font-bold text-gray-800 mt-4">“Sapanca’da indim” sandığın yer otoyol kenarı olabilir</h3>
<p>Bazı şehirlerarası hatlar zaman kazanmak için dinlenme tesisi/otoyol bağlantısı gibi noktalarda indirip devam eder. Bu durumda:</p>
<ul class="list-disc pl-6 space-y-2">
    <li>Sapanca merkez yürünerek gidilecek mesafede değildir</li>
    <li>Bavulla otoyol kenarında kalma hissi hiç güzel değildir</li>
    <li>Taksi çağırmak zorunda kalırsın (ek maliyet)</li>
</ul>

<p class="font-bold mt-4">Güvenli çözüm: “Sapanca Otogar / Sapanca Merkez” ibaresini teyit et</p>
<p>Bilet alırken şu iki şeyi netleştir:</p>
<ul class="list-disc pl-6 space-y-2">
    <li>Varış noktası Sapanca otogar/merkez mi?</li>
    <li>Firma gerçekten merkez içine giriyor mu? (Bunu gişeye/firmaya sorabilirsin)</li>
</ul>

<hr class="my-8" />

<h2>6) Son Kilometre: Sapanca İstasyonu/Otogardan Göl Kenarı ve Konaklamaya Geçiş</h2>
<p>Arabasız gelenlerin en çok zorlandığı yer burası: “İndim ama şimdi nereye?”</p>

<h3>A) Sapanca merkezden göl kenarına geçiş</h3>
<p>Sapanca merkezden göl hattına yürünebilir rotalar var; ama “tam göl kenarı” hedefin ve bavulun varsa şu gerçek önemli:</p>
<ul class="list-disc pl-6 space-y-2">
    <li>Bavulla yürümek keyfi öldürür.</li>
    <li>Hava sıcaksa daha da zorlar.</li>
</ul>
<p><strong>En pratik plan:</strong> Konaklaman merkezdeyse yürünebilir. Konaklaman göl hattında ama bavul ağırsa kısa taksi daha mantıklı.</p>

<h3>B) Bungalov bölgeleri (Kırkpınar / Maşukiye / Kartepe tarafı)</h3>
<p>Burada net konuşalım: Bungalovların çoğu “merkeze yakın” gibi görünse de yokuş, viraj ve mesafe işin içine giriyor.</p>

<div class="bg-red-50 p-4 rounded-lg my-4">
    <p><strong>Taksi en hızlı çözüm.</strong></p>
    <p>Bazı işletmelerin transfer/anlaşmalı araç opsiyonu olabiliyor. Rezervasyon yaparken “Arabasız geliyoruz, merkezden alma var mı?” diye sormak çoğu zaman fark yaratır.</p>
</div>

<div class="my-6">
    <img src="/images/blog/sapanca_taxi_transfer_bungalow.png" alt="Sapanca Bungalov Transferi" class="w-full h-auto rounded-lg shadow-md" />
</div>

<hr class="my-8" />

<h2>7) Sapanca’da Arabasız Gezme: “Nerede yürünür, nerede araç gerekir?”</h2>
<p>Sapanca’da arabasız tatilin ana mantığı şu: Göl kenarı yürünür, dağ hattı araç ister.</p>
<ul class="list-disc pl-6 space-y-2">
    <li><strong>Yürüyerek/Bisikletle tatlı akan bölgeler:</strong> Göl kıyısına yakın yürüyüş alanları, Merkez çevresi. Düz hatlarda bisiklet kiralama (varsa) keyifli olur.</li>
    <li><strong>Araç gerektiren bölgeler:</strong> Maşukiye yönü (özellikle şelale/orman içi), Yokuşlu bungalov hatları, Kartepe’ye uzanan planlar.</li>
</ul>
<div class="my-6">
    <img src="/images/blog/sapanca_lake_walking_path_transport.png" alt="Sapanca Yürüyüş Yolu" class="w-full h-auto rounded-lg shadow-md" />
</div>
<p>Arabasızsan “Göl + merkez + kısa taksi/dolmuş” üçlüsü çoğu kişiye yetiyor. Sapanca’yı bir “doğa molası” gibi düşün: Az rota, temiz hava, bol yürüyüş.</p>

<hr class="my-8" />

<h2>8) Dönüş Planı: “Günü uzatacağım” derken açıkta kalma</h2>
<p>Sapanca dönüşünde iki risk var:</p>
<ul class="list-decimal pl-6 space-y-2">
    <li>Pazar dönüş biletleri erken dolar</li>
    <li>Akşam geç saate kalınca seçenek azalır</li>
</ul>
<div class="bg-green-50 p-4 rounded-lg my-4">
    <h3 class="font-bold text-green-800 mb-2">Kendini garantiye almak için:</h3>
    <ul class="list-disc pl-5 text-sm space-y-2">
        <li>Dönüş biletini en baştan al.</li>
        <li>Konaklaman bungalov bölgesindeyse, dönüş saati yaklaşınca “merkeze iniş” için taksi/dolmuş planını önceden yap.</li>
        <li>Son dakikada “istasyona nasıl gideceğim” paniği yaşama.</li>
    </ul>
</div>

<hr class="my-8" />

<h2>9) Kısa Özet: Hangisini Seçmeliyim?</h2>
<ul class="list-disc pl-6 space-y-2">
    <li><strong>Hedef:</strong> Sapanca merkezde ineyim, aktarma istemiyorum → <strong>Bölgesel tren</strong> (varış Sapanca olan sefer)</li>
    <li><strong>Hedef:</strong> Hızlı geleyim, kısa transfer sorun değil → <strong>YHT + Arifiye iniş + Sapanca transferi</strong></li>
    <li><strong>Hedef:</strong> Son dakika plan, tren bulamadım → <strong>Otobüs</strong> (ama “Sapanca Otogar/Merkez” teyidi şart)</li>
    <li><strong>Hedef:</strong> Bungalova gideceğim → <strong>Tren/otobüsle merkeze gel + son kilometre taksi/transfer</strong></li>
</ul>

<hr class="my-8" />

<h2>Sık Sorulan Sorular (FAQ)</h2>

<details class="group py-2 border-b border-gray-200">
    <summary class="flex justify-between items-center font-medium cursor-pointer list-none text-gray-800">
        <span>İstanbul’dan Sapanca’ya arabasız en kolay yol hangisi?</span>
        <span class="transition group-open:rotate-180">
            <svg fill="none" height="24" shape-rendering="geometricPrecision" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
        </span>
    </summary>
    <div class="text-neutral-600 mt-3 group-open:animate-fadeIn">
        <p>Genelde tren daha rahat. Uygun sefer bulursan Sapanca merkez istasyonunda inmek büyük avantaj. YHT ile geliyorsan yakın bir istasyonda inip kısa transfer yapman gerekebilir.</p>
    </div>
</details>

<details class="group py-2 border-b border-gray-200">
    <summary class="flex justify-between items-center font-medium cursor-pointer list-none text-gray-800">
        <span>YHT Sapanca’da duruyor mu?</span>
        <span class="transition group-open:rotate-180">
            <svg fill="none" height="24" shape-rendering="geometricPrecision" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
        </span>
    </summary>
    <div class="text-neutral-600 mt-3 group-open:animate-fadeIn">
        <p>Çoğu senaryoda YHT’nin duruşları Sapanca merkez istasyonu yerine yakın istasyonlarda olur. Bilet ararken varış/duruş ekranında “Sapanca” görmüyorsan, Arifiye gibi yakın durak + transfer planı kurmalısın.</p>
    </div>
</details>

<details class="group py-2 border-b border-gray-200">
    <summary class="flex justify-between items-center font-medium cursor-pointer list-none text-gray-800">
        <span>Otobüsle giderken nerede indirileceğimi nasıl anlarım?</span>
        <span class="transition group-open:rotate-180">
            <svg fill="none" height="24" shape-rendering="geometricPrecision" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
        </span>
    </summary>
    <div class="text-neutral-600 mt-3 group-open:animate-fadeIn">
        <p>Bilette “Sapanca Otogar / Sapanca Merkez” yazmasını kontrol et. Emin değilsen firmaya sor. Otoyol üzeri tesislerde inmek bavulla sıkıntı yaratır.</p>
    </div>
</details>

<details class="group py-2 border-b border-gray-200">
    <summary class="flex justify-between items-center font-medium cursor-pointer list-none text-gray-800">
        <span>Sapanca istasyonundan göl kenarına yürünür mü?</span>
        <span class="transition group-open:rotate-180">
            <svg fill="none" height="24" shape-rendering="geometricPrecision" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
        </span>
    </summary>
    <div class="text-neutral-600 mt-3 group-open:animate-fadeIn">
        <p>Yürünebilir ama bavulla zorlayabilir. Konaklama noktan göl hattındaysa kısa taksi daha konforlu olur.</p>
    </div>
</details>

<details class="group py-2 border-b border-gray-200">
    <summary class="flex justify-between items-center font-medium cursor-pointer list-none text-gray-800">
        <span>Bungalovlar merkeze yakın mı?</span>
        <span class="transition group-open:rotate-180">
            <svg fill="none" height="24" shape-rendering="geometricPrecision" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
        </span>
    </summary>
    <div class="text-neutral-600 mt-3 group-open:animate-fadeIn">
        <p>Haritada yakın gibi görünse de çoğu orman/yamaç hattında. Arabasızsan son kilometre için taksi veya işletme transferi en pratik çözüm.</p>
    </div>
</details>

<details class="group py-2 border-b border-gray-200">
    <summary class="flex justify-between items-center font-medium cursor-pointer list-none text-gray-800">
        <span>Sapanca’da dolmuş var mı?</span>
        <span class="transition group-open:rotate-180">
            <svg fill="none" height="24" shape-rendering="geometricPrecision" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
        </span>
    </summary>
    <div class="text-neutral-600 mt-3 group-open:animate-fadeIn">
        <p>Bazı hatlar özellikle çevre bölgelere çalışır. Sefer aralıkları ve durak yürüyüşü değişebileceği için “gün içi plan” yaparak kullanmak daha mantıklı.</p>
    </div>
</details>`,
    cover_image_url: '/images/blog/sapanca_yht_train_journey.png',
    location: 'Sapanca',
    meta_description: 'İstanbul’dan Sapanca’ya arabasız nasıl gidilir? YHT–Arifiye, bölgesel tren–Sapanca durağı, otobüs indirme noktaları ve son kilometre ulaşım tüyoları.',
    is_published: true,
    published_at: new Date().toISOString()
};

async function run() {
    console.log('Replacing Sapanca Transport Article...');

    // 1. Delete old article
    const { error: deleteError } = await supabase
        .from('articles')
        .delete()
        .eq('slug', oldSlug);

    if (deleteError) {
        console.error('Error deleting old article:', deleteError.message);
    } else {
        console.log(`Deleted old slug: ${oldSlug}`);
    }

    // 2. Insert new article
    console.log(`Inserting: ${article.slug}`);
    const { error: insertError } = await supabase
        .from('articles')
        .upsert(article, { onConflict: 'slug' });

    if (insertError) {
        console.error('Error inserting new article:', insertError.message);
    } else {
        console.log('Success! Article replaced.');
    }
}

run();
