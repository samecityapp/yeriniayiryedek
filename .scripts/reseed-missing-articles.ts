
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Manual env parsing
const envPath = path.join(process.cwd(), '.env.local');
let envContent = '';
try {
    envContent = fs.readFileSync(envPath, 'utf-8');
} catch (e) {
    console.log('Could not read .env.local, checking process.env');
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

console.log('Using key starting with:', supabaseKey.substring(0, 5) + '...');

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    console.log('Starting reseed process...');

    // 1. Update Camlik Location
    console.log('Updating Camlik Museum location...');
    const { error: camlikError } = await supabase
        .from('articles')
        .update({ location: 'İzmir / Selçuk / Çamlık / Şirince' })
        .eq('slug', 'camlik-buharli-lokomotif-muzesi-rehberi-sirince');

    if (camlikError) console.error('Camlik update failed:', camlikError.message);
    else console.log('Camlik location updated.');

    // 2. Insert Missing Articles
    const articlesToInsert = [
        // Fethiye Season
        {
            title: 'Fethiye’ye Ne Zaman Gidilir? Ay Ay Deniz Suyu, Hava ve Kalabalık Analizi',
            slug: 'fethiye-ne-zaman-gidilir-ay-ay-analiz',
            content: `<h1>Fethiye’ye Ne Zaman Gidilir? Ay Ay Deniz Suyu, Hava ve Kalabalık Analizi</h1>
<p>Tatil planında “Nereye gideyim?” kadar kritik bir soru var: “Ne zaman gideyim?” <br>
Çünkü yanlış zamanda doğru yere gidersen, tatil “dinlenme” değil mücadele olur. Ağustos öğleninde Kayaköy yokuşu tırmanmak başka bir şey, Ekim’de Ölüdeniz’e girip üstüne akşam serinliğinde yürüyüş yapmak başka bir şey.</p>
<p>Fethiye sadece “Haziran–Ağustos” destinasyonu değil. Asıl tatlı yer, yerel halkın da sevdiği o dönem: <strong>Sarı Yaz (Eylül–Ekim)</strong>. Deniz hâlâ sıcak, hava daha yumuşak, kalabalık azalıyor… Tatil “tam kıvam” oluyor.</p>
<p>Bu rehberde Fethiye’yi ay ay ele alıyoruz:</p>
<ul class="list-disc pl-6 space-y-2 mb-6">
    <li>Deniz suyu “girilir mi?” seviyesinde mi?</li>
    <li>Hava “gezilir mi?” kıvamında mı?</li>
    <li>Kalabalık “keyfi bozar mı?” düzeyinde mi?</li>
</ul>
<div class="bg-blue-50 p-6 rounded-lg my-8">
    <h2 class="text-xl font-bold mb-4 text-blue-800">30 Saniyelik Özet (Hemen Karar Vermek İsteyenlere)</h2>
    <ul class="space-y-2">
        <li>⚖️ <strong>En iyi denge (deniz sıcak + kalabalık az):</strong> Eylül, Ekim</li>
        <li>🔥 <strong>Deniz garanti sıcak + şehir full canlı:</strong> Temmuz, Ağustos</li>
        <li>🌿 <strong>Gezme + yürüyüş + sakinlik:</strong> Nisan, Mayıs, Kasım</li>
        <li>💰 <strong>En ekonomik dönem:</strong> Mayıs başı / Ekim sonu</li>
        <li>👨‍👩‍👧‍👦 <strong>Çocuklu aile için altın oran:</strong> Haziran ortası–sonu veya Eylül başı</li>
    </ul>
</div>
<div class="my-8">
    <img src="/images/blog/fethiye_season_cover_luxury.png" alt="Fethiye Manzarası ve Lüks Tekneler" class="w-full h-auto rounded-lg shadow-md" />
</div>
<h2>Ay Ay Fethiye: Ne Beklemelisin?</h2>
<h3>Nisan: Bahar Uyanışı (Gezen Kazanır)</h3>
<p><strong>Hava:</strong> Bahar gibi… Bazı günler yaz gibi açar, bazı günler “ince yağmur” sürpriz yapar. Gündüz gezilir, akşam serinler.<br>
<strong>Deniz:</strong> Genelde serin. “Girerim” diyen girer ama çoğu kişi için deniz ana plan değildir.<br>
<strong>Kalabalık:</strong> Düşük. Fotoğraf, yürüyüş, keşif için en rahat dönemlerden.</p>
<div class="my-6">
    <img src="/images/blog/fethiye_spring_hiking.png" alt="Fethiye'de Bahar Yürüyüşü" class="w-full h-auto rounded-lg shadow-md" />
</div>
<p><strong>Kimler sever?</strong></p>
<ul class="list-disc pl-6 space-y-2">
    <li>“Ben sıcakta eriyorum” diyenler</li>
    <li>Doğa yürüyüşü planlayanlar</li>
    <li>Kalabalık istemeyenler</li>
    <li>“Fethiye’yi sakin sakin hissedeyim” diyenler</li>
</ul>
<div class="bg-green-50 p-4 border-l-4 border-green-400 my-4">
    <strong>💡 Mini Taktik:</strong> Nisan’da programı denize bağlama. Planı “gezinti + kısa rota” üstünden kur; deniz varsa bonus.
</div>
<h3>Mayıs: Yazın Fragmanı (En Tatlı Keşif Ayı)</h3>
<p><strong>Hava:</strong> Gün içinde keyifli, akşamları ince bir üst iyi gelir. Mayıs ortasından sonra yaz ciddileşir.<br>
<strong>Deniz:</strong> Serin–ılık arası. Bazı günler “girerim”, bazı günler “dursun” dedirtir.<br>
<strong>Kalabalık:</strong> Hâlâ yönetilebilir.</p>
<p><strong>Mayısın en büyük avantajı:</strong> Fethiye’nin rengi çok temiz görünür. Su bazı günler “cam gibi” olur; fotoğraf açısından çok iyi.</p>
<h3>Haziran: Sezon Açıldı (Tam Kıvamın Başlangıcı)</h3>
<p><strong>Hava:</strong> Yaz garantilenir. Gündüz sıcak, akşam daha rahat.<br>
<strong>Deniz:</strong> Birçok kişi için “ideal” seviyeye yaklaşır.<br>
<strong>Kalabalık:</strong> Ayın ilk yarısı daha sakin, ay sonuna doğru yoğunluk artar.</p>
<h3>Temmuz: Şehir Açıldı (Eğlence + Sıcak + Kalabalık)</h3>
<p><strong>Hava:</strong> Sıcak ciddi artar. Öğlen saatlerinde uzun yürüyüş zorlar.<br>
<strong>Deniz:</strong> Sıcak ve konforlu. Sudan çıkmak istemezsin.<br>
<strong>Kalabalık:</strong> Yüksek. Trafik, plaj yoğunluğu, her şey daha “hareketli”.</p>
<div class="my-6">
    <img src="/images/blog/fethiye_summer_beach.png" alt="Fethiye Yazın Plaj Keyfi" class="w-full h-auto rounded-lg shadow-md" />
</div>
<div class="bg-yellow-50 p-4 border-l-4 border-yellow-400 my-4">
    <strong>⚠️ Gerçekçi Uyarı:</strong> 12:00–15:00 arası “gezme” planı yaparsan zorlanabilirsin. Bu saatleri gölge/uyku/molaya ayırmak tatili kurtarır.
</div>
<h3>Ağustos: En Yoğun, En Pahalı, En Sıcak</h3>
<p>Burası “Fethiye’nin tam zirvesi”. Herkes orada. Her şey çalışıyor, her şey canlı ama…<br>
<strong>Hava:</strong> En sıcak dönem. Özellikle öğlen saatleri zorlayıcı.<br>
<strong>Deniz:</strong> Çok sıcak. Seven de var, “fazla sıcak” diyen de.<br>
<strong>Kalabalık:</strong> Çok yüksek. Popüler yerlerde “sabah erken” gitmezsen günün konforu düşebilir.</p>
<p><strong>Ağustos taktiği (altın):</strong> Günü ikiye böl: Sabah erken deniz → Öğlen gölge + mola → Akşamüstü kısa deniz + yürüyüş.</p>
<h2>Fethiye’nin Altın Çağı: Sarı Yaz</h2>
<h3>Eylül: Deniz Hâlâ Yaz, Kalabalık Azalmaya Başlar</h3>
<p><strong>Hava:</strong> Sıcak ama Temmuz-Ağustos gibi yakıcı değil. Akşamlar daha tatlı.<br>
<strong>Deniz:</strong> Yaz boyunca ısındığı için hâlâ çok keyiflidir.<br>
<strong>Kalabalık:</strong> Okullar açılmaya yaklaştıkça düşmeye başlar.</p>
<h3>Ekim: Tatilin En Rafine Hali (Bilenlerin Ayı)</h3>
<p>Ekim, Fethiye’de çoğu insanın “Keşke hep böyle olsa” dediği dönem.</p>
<div class="my-6">
    <img src="/images/blog/fethiye_autumn_sunset.png" alt="Fethiye'de Sarı Yaz ve Gün Batımı" class="w-full h-auto rounded-lg shadow-md" />
</div>
<p><strong>Hava:</strong> Daha yumuşak, yürümek ve gezmek daha rahat.<br>
<strong>Deniz:</strong> Birçok yıl Ekim ortasına kadar deniz hâlâ ılıktır.<br>
<strong>Kalabalık:</strong> Belirgin şekilde azalır.</p>
<p><strong>Ekim taktiği:</strong> Gün batımı saatlerini kaçırma. Ekim ışığı daha yumuşak olur; fotoğraflar “filtre” gibi çıkar.</p>
<h2>Kışın Fethiye: Kasım–Mart (Sessiz Ama Güzel)</h2>
<p><strong>Kasım:</strong> Gezme mevsimi başlar. Likya Yolu tarzı yürüyüşler ve kültür gezileri için daha rahat.<br>
<strong>Aralık–Ocak–Şubat:</strong> Sessizlik ve ılık kış günleri. "Ben tatilde yürüyeyim, keşfedeyim" diyenler için ideal.<br>
<strong>Mart:</strong> Bahara giriş. "Sezon öncesi sakin Fethiye" hissi.</p>
<hr class="my-8" />
<h2>Sıkça Sorulan Sorular (SSS)</h2>
<div class="space-y-4">
    <details class="bg-gray-50 p-4 rounded-lg">
        <summary class="font-semibold cursor-pointer">Fethiye’de denize girmek için en iyi ay hangisi?</summary>
        <p class="mt-2 text-gray-700">Çoğu insan için Eylül en iyi dengeyi verir: deniz sıcak, kalabalık daha az.</p>
    </details>
    <details class="bg-gray-50 p-4 rounded-lg">
        <summary class="font-semibold cursor-pointer">Ekim’de Ölüdeniz’e girilir mi?</summary>
        <p class="mt-2 text-gray-700">Birçok yıl girilir. Özellikle Ekim’in ilk yarısı daha avantajlıdır; yılın gidişatına göre değişir.</p>
    </details>
    <details class="bg-gray-50 p-4 rounded-lg">
        <summary class="font-semibold cursor-pointer">Çocuklu aileler için en rahat ay?</summary>
        <p class="mt-2 text-gray-700">Genelde Haziran ortası–sonu veya Eylül başı. Deniz daha konforlu, kalabalık daha yönetilebilir.</p>
    </details>
    <details class="bg-gray-50 p-4 rounded-lg">
        <summary class="font-semibold cursor-pointer">Sarı Yaz tam olarak ne demek?</summary>
        <p class="mt-2 text-gray-700">Yazın bittiği ama denizin hâlâ sıcak kaldığı; havanın yumuşadığı dönem. Fethiye’de bu genelde Eylül–Ekim hissidir.</p>
    </details>
</div>
<div class="mt-8 p-6 bg-green-50 rounded-xl text-center">
    <h3 class="text-xl font-bold text-green-800 mb-2">Sonuç: Takvimi Doğru Ayarlarsan Fethiye Bambaşka</h3>
    <p class="text-green-700">Bavulu mevsime göre hazırla; Fethiye seni her durumda memnun edebilir — yeter ki doğru zamanda git.</p>
</div>`,
            cover_image_url: '/images/blog/fethiye_season_cover_luxury.png',
            location: 'Fethiye',
            meta_description: 'Fethiye tatil planı için en doğru zaman ne zaman? Ay ay hava durumu, deniz suyu sıcaklığı ve kalabalık analizi ile ideal tatil takvimi.',
            is_published: true,
            published_at: new Date().toISOString()
        },
        // Bodrum Orak Island
        {
            title: 'Bodrum’un Maldivleri Orak Adası: Hangi Tekne Turu Seçilmeli? (Parti Teknesi mi, Sakin Gulet mi, Özel Tekne mi?)',
            slug: 'bodrum-orak-adasi-tekne-turu-hangi-tekne',
            content: `<h1>Bodrum’un Maldivleri Orak Adası: Hangi Tekne Turu Seçilmeli? (Parti Teknesi mi, Sakin Gulet mi, Özel Tekne mi?)</h1>
<p>Bodrum’da “tek bir günüm var, en unutulmaz denize gireyim” diyorsanız Orak Adası genelde listenin en üstüne yazılır. Sebebi basit: Su rengi bazı anlarda koyu maviden fosforlu turkuaza döner; dipteki açık renk zemin, denizi “havuz gibi” gösterir.</p>
<p>Ama Orak Adası’nın kritik bir detayı var: Karadan gidilmiyor. Oraya ulaşmanın yolu tekne. Ve Bodrum’da tekne turu seçimi, tatilin bütün havasını belirler:
Sessiz bir mavi yolculuk mu istiyorsun, yoksa denizin ortasında müzik ve eğlence mi?</p>
<p>Aşağıdaki rehber, “hangi tekne kime göre” sorusunu netleştirmek için hazırlandı.</p>
<div class="my-8">
    <img src="/images/blog/bodrum_orak_island_cover.png" alt="Bodrum Orak Adası Turkuaz Sular" class="w-full h-auto rounded-lg shadow-md" />
</div>
<div class="bg-blue-50 p-6 rounded-lg my-8">
    <h3 class="text-xl font-bold mb-4 text-blue-800">Tekne Seçimi 101: “Günübirlik tur” mu, “özel tekne” mi?</h3>
    <p class="mb-2">Bodrum çıkışlı Orak Adası turlarında üç ana seçenek görürsün:</p>
    <ul class="space-y-2 text-sm">
        <li>🏴‍☠️ <strong>Parti / “Korsan” teknesi:</strong> Yüksek enerji, müzik, köpük partisi.</li>
        <li>⛵ <strong>Klasik gulet:</strong> Dengeli, sakin, yemekli mavi tur.</li>
        <li>🛥️ <strong>Özel tekne kiralama:</strong> Mahremiyet, rota kontrolü, size özel.</li>
    </ul>
    <p class="mt-4 text-xs text-gray-600">Birçok tur programı Orak Adası’yla sınırlı kalmayıp güzergâhta farklı koylarda yüzme molaları verir. (Örnek duraklar turdan tura değişebilir.)</p>
</div>
<h3>1) Parti ve “Korsan” Tekneleri: “Deniz + Müzik + Şov” isteyenlere</h3>
<p>İskeleden bakınca en kolay bunları ayırt edersin: büyük, gösterişli, kalabalık, bazen temalı (kaydırak/figür vs.).</p>
<div class="my-6">
    <img src="/images/blog/bodrum_pirate_boat.png" alt="Bodrum Korsan Teknesi" class="w-full h-auto rounded-lg shadow-md" />
</div>
<div class="grid md:grid-cols-2 gap-6 my-4">
    <div class="bg-green-50 p-4 rounded">
        <h4 class="font-bold text-green-800 mb-2">Bu tur kime iyi gelir?</h4>
        <ul class="list-disc pl-5 text-sm space-y-1">
            <li>Genç arkadaş grupları</li>
            <li>“Ben oturup sakinleşemem, gün akıp geçsin” diyenler</li>
            <li>Müzik, anons, aktivite sevenler</li>
        </ul>
    </div>
    <div class="bg-red-50 p-4 rounded">
        <h4 class="font-bold text-red-800 mb-2">Kimler zorlanır?</h4>
        <ul class="list-disc pl-5 text-sm space-y-1">
            <li>Sessizlik arayanlar</li>
            <li>Bebekli/küçük çocuklu ve “uyku saati” hassas aileler</li>
            <li>“Kitap okuyacağım” diyenler</li>
        </ul>
    </div>
</div>
<p class="text-sm italic text-gray-600">Mini tüyo: Rezervasyon yaparken tek bir soru her şeyi çözer: “Teknede müzik seviyesi nasıl? Gün boyu mu, belli saatlerde mi?”</p>
<hr class="my-8" />
<h3>2) Klasik Gulet Turları: En “doğru denge” (sakin + keyif)</h3>
<p>Bodrum’un gulet kültürü, Orak Adası için en uyumlu seçeneklerden biri. Genelde daha “mavi yolculuk” hissi verir: müzik daha düşük, tempo daha yumuşak, kalabalık nispeten daha kontrollü.</p>
<div class="my-6">
    <img src="/images/blog/bodrum_classic_gulet.png" alt="Bodrum Klasik Gulet" class="w-full h-auto rounded-lg shadow-md" />
</div>
<div class="bg-gray-50 p-4 rounded mt-4">
    <h4 class="font-bold text-gray-800 mb-2">Bu tur kime iyi gelir?</h4>
    <ul class="list-disc pl-5 text-sm space-y-1">
        <li>Çiftler</li>
        <li>Aileler</li>
        <li>“Hem yüzeyim hem manzaraya dalayım” diyen herkes</li>
    </ul>
</div>
<p class="mt-4"><strong>Ne beklersin?</strong><br>Orak Adası’nda uzun bir yüzme molası ve çoğu turda Orak dışında başka yüzme durakları (tur planına göre).</p>
<div class="bg-yellow-50 p-4 border-l-4 border-yellow-400 my-4">
    <strong>Mini tüyo:</strong> “Yolcu kapasitesi ortalama kaç kişi?” diye sor. Genelde sayı ne kadar düşükse gün o kadar konforlu geçer.
</div>
<hr class="my-8" />
<h3>3) Özel Tekne Kiralama: “Benim günüm, benim kurallarım”</h3>
<p>Bütçe uygunsa Orak Adası deneyimini bir üst seviyeye taşıyan seçenek bu. Tekneyi (motor yat veya küçük gulet) sadece kendi grubun için kapatırsın.</p>
<ul class="list-disc pl-6 space-y-2">
    <li><strong>Rota ve durak kontrolü:</strong> “Burası kalabalık oldu, başka koya geçelim” diyebilirsin.</li>
    <li><strong>Zaman kontrolü:</strong> Erken çık, geç dön; tamamen sizin akışınız.</li>
    <li><strong>Konfor:</strong> Kalabalık yok, gürültü yok, mahremiyet var.</li>
</ul>
<p class="mt-4 text-sm"><strong>Ne zaman mantıklı olur?</strong><br>6–10 kişilik bir grupsanız, kişi başı maliyet “beklediğin kadar uçuk” olmayabilir. Ayrıca balayı veya özel gün kutlamaları için “tek gün bile kusursuz olsun” diyorsanız en iyi seçenektir.</p>
<hr class="my-8" />
<h3>Orak Adası’nda deniz nasıl? (Kritik gerçek: Ayağın yere basmayabilir)</h3>
<p>Orak Adası’na “Maldivler” benzetmesi çoğu zaman kumsal için değil, su rengi ve berraklık için yapılır. Turların önemli bir kısmında tekne demir atar ve yüzme molası tekneden olur; her zaman karaya çıkma planı yoktur.</p>
<div class="space-y-4 mt-4">
    <div class="bg-teal-50 p-4 rounded-lg">
        <h4 class="font-bold text-teal-800">Derinlik Konusu</h4>
        <p class="text-sm">Suyun altı çok net göründüğü için derinlik olduğundan “az” sanılabilir. Bu derinlik hissi, yüzme bilmeyenlerde tedirginlik yaratabilir.</p>
        <p class="text-xs mt-2 font-bold">Çözüm: Teknede genellikle can yeleği/deniz makarnası olur. En baştan iste. Rahatlatır.</p>
    </div>
</div>
<hr class="my-8" />
<h3>Şnorkel / deniz gözlüğü: “Götürmezsen pişman olursun” listesi</h3>
<p>Orak Adası’nda su berraklığı “olay” olduğu için deniz gözlüğü (ve varsa şnorkel) günü bambaşka yapar.</p>
<div class="my-6">
    <img src="/images/blog/bodrum_snorkel_underwater.png" alt="Orak Adası Sualtı" class="w-full h-auto rounded-lg shadow-md" />
</div>
<div class="bg-gray-100 p-4 rounded-lg">
    <h4 class="font-bold text-gray-800 mb-2">Çantada olmazsa olmazlar</h4>
    <ul class="checkbox-list space-y-2 text-sm">
        <li class="flex items-center"><span class="mr-2">🤿</span> Deniz gözlüğü / şnorkel</li>
        <li class="flex items-center"><span class="mr-2">☀️</span> Yüksek korumalı güneş kremi (su üstünde yansıma güçlü)</li>
        <li class="flex items-center"><span class="mr-2">🧢</span> Şapka</li>
        <li class="flex items-center"><span class="mr-2">📱</span> Islak-kuru çanta (telefon için)</li>
        <li class="flex items-center"><span class="mr-2">🩴</span> Terlik + hafif havlu</li>
    </ul>
</div>
<hr class="my-8" />
<h3>O meşhur turkuaz fotoğrafı nasıl çekersin?</h3>
<p>Instagram’da gördüğün “teknenin burnu + turkuaz su” karesi için en iyi an genelde şudur:</p>
<ol class="list-decimal pl-6 space-y-2">
    <li>Tekne demir atar atmaz herkes denize atlar.</li>
    <li>Sen 2 dakika bekle. Tekne önü boşalır.</li>
    <li>Fotoğrafı çeken kişi mümkünse biraz yükseğe çıkıp hafif yukarıdan çeksin (turkuaz daha net çıkar).</li>
</ol>
<hr class="my-8" />
<div class="bg-indigo-50 p-6 rounded-lg my-8">
    <h3 class="text-xl font-bold mb-4 text-indigo-800">Hızlı Karar Rehberi: Hangi tekne sana göre?</h3>
    <ul class="space-y-2 text-sm">
        <li>🎉 <strong>“Eğlence, müzik, hareket”</strong> → Parti / korsan teknesi</li>
        <li>⛵ <strong>“Sakinlik ama sosyal ortam da olsun”</strong> → Klasik gulet</li>
        <li>🛥️ <strong>“Kalabalık istemiyorum, kontrol bende olsun”</strong> → Özel tekne</li>
    </ul>
</div>
<p>Bodrum’da ulaşım konusunda daha fazla detay için <a href="/rehber/bodrum-arabasiz-tatil-rehberi-ulasim-tuyolari" class="text-blue-600 hover:underline">Bodrum’da Arabasız Tatil Rehberi</a> yazımızı inceleyebilir, ücretsiz deniz keyfi için <a href="/rehber/bodrum-ucretsiz-halk-plajlari-koylar-rehberi" class="text-blue-600 hover:underline">Bodrum Ücretsiz Halk Plajları</a> rehberine göz atabilirsiniz.</p>
<hr class="my-8" />
<h3>Sıkça Sorulan Sorular</h3>
<div class="space-y-6">
    <div>
        <h4 class="font-bold text-gray-900 text-lg">Orak Adası’na karadan gidilir mi?</h4>
        <p class="text-gray-700 mt-1">Hayır. Orak Adası’na ulaşım pratikte tekne turlarıyla sağlanır.</p>
    </div>
    <div>
        <h4 class="font-bold text-gray-900 text-lg">Orak Adası tekne turları genelde kaçta çıkar?</h4>
        <p class="text-gray-700 mt-1">Birçok tur sabah geç saatlerde (çoğu zaman 10:30–11:30 bandında) Bodrum Limanı’ndan çıkar; saatler tekneye göre değişir.</p>
    </div>
    <div>
        <h4 class="font-bold text-gray-900 text-lg">Orak Adası’nda kumsala çıkılıyor mu?</h4>
        <p class="text-gray-700 mt-1">Çoğu turda yüzme molası tekneden olur; karaya çıkış her zaman planın parçası değildir.</p>
    </div>
</div>
<hr class="my-8" />
<div class="bg-blue-50 p-6 rounded-lg text-center mt-8">
    <h3 class="font-bold text-blue-800 mb-2">Son söz</h3>
    <p class="text-blue-900">Orak Adası’nda “en doğru tekne”, en pahalı olan değil; senin gün moduna uyan teknedir. Sessizlik arıyorsan sessizliği satın al, eğlence arıyorsan eğlenceyi seç. Geri kalanını Orak Adası’nın turkuazı zaten halleder.</p>
</div>`,
            cover_image_url: '/images/blog/bodrum_orak_island_cover.png',
            location: 'Bodrum',
            meta_description: 'Bodrum Orak Adası tekne turu rehberi: Parti teknesi (korsan), sakin gulet veya özel tekne seçenekleri. Orak Adası’nda deniz nasıl, derin mi, şnorkel şart mı, hangi tur kime uygun? Tüm tüyolar burada.',
            is_published: true,
            published_at: new Date(Date.now() + 1000).toISOString()
        },
        // Bodrum Local Food
        {
            title: 'Bodrum’u Yerlisi Gibi Yemek: Meşhur Sebzeli Döner, Bodrum Mantısı ve Yerel Lezzetler',
            slug: 'bodrum-yerel-lezzetler-sebzeli-doner-bodrum-mantisi',
            content: `<h1>Bodrum’u Yerlisi Gibi Yemek: Meşhur Sebzeli Döner, Bodrum Mantısı ve Yerel Lezzetler</h1>
<p>Bodrum’da akşam yemeği çoğu zaman “deniz kenarında şık masa” ile anılır. Ama Bodrum’u gerçekten Bodrum yapan şey, öğlen saatlerinde çarşı aralarına saklanan esnaf lezzetleri, Ege otlarıyla dolu vitrinler ve “bu burada böyle yenir” dedirten yerel ritüellerdir.</p>
<p>Kısacası: Bodrum’da iyi yemek için illa beyaz örtülü masaya oturmak gerekmez. Bazen en unutulmaz an; sıcakta hızlıca yenen bir sebzeli döner, ardından buz gibi ayran, akşamüstü bir çıtır Bodrum mantısı ve gün batımına doğru hafif bir zeytinyağlı tabağı olur.</p>
<p>Bu rehberde Bodrum’un “yerlisi gibi” yenilen imza lezzetlerini, nerede arayacağınızı (mahalle/bölge mantığıyla), hangi saatte gideceğinizi ve nasıl sipariş edeceğinizi anlatıyorum.</p>
<div class="my-8">
    <img src="/images/blog/bodrum_sebzeli_doner.png" alt="Bodrum’da yerel lezzet rotası: sebzeli döner, çıtır mantı ve Ege otları" class="w-full h-auto rounded-lg shadow-md" />
</div>
<h3>1) Bodrum’un İmzası: Sebzeli Döner</h3>
<p>Türkiye’nin her yerinde döner var; ama Bodrum sebzeli döneri ayrı bir karakter. Farkı şu: Etin arasına kat kat yerleştirilen sebzeler (özellikle patates–havuç–bezelye ve dönemsel eklemeler) pişerken etle birlikte aroma veriyor. Sonuç daha “yağlı ağır” değil; hafif ama dolu dolu bir tat.</p>
<div class="grid md:grid-cols-2 gap-6 my-4">
    <div class="bg-orange-50 p-4 rounded">
        <h4 class="font-bold text-orange-800 mb-2">Ne zaman yenir?</h4>
        <p class="text-sm">Bu lezzetin altın kuralı: Öğlene oynar, akşama kalmaz. Bodrum Merkez Çarşı içinde ve ana akslarda sebzeli döner, çoğu yerde öğleden sonra tükenir. “Akşam yeriz” derseniz yüksek ihtimal “kalmadı” cevabını alırsınız.</p>
    </div>
    <div class="bg-gray-50 p-4 rounded">
        <h4 class="font-bold text-gray-800 mb-2">Nasıl sipariş edilir?</h4>
        <ul class="list-disc pl-5 text-sm space-y-1">
            <li>“Pide/lavaş içinde” seçeneklerini sorun (bazı yerler taze pideyle çok iyi yapar).</li>
            <li>Yanına klasik eşlikçi: ayran.</li>
            <li>Eğer ilk kez deniyorsanız “az sos–bol sebze dengesi” isteyin.</li>
        </ul>
    </div>
</div>
<p class="text-sm italic mt-2">Nerede aranır? Bodrum Merkez (Çarşı, Atatürk Caddesi çevresi) sebzeli döner için en pratik bölgedir. Yürüyerek gezerken “öğlen kuyruğu” gördüğünüz yerler genelde doğru izdir.</p>
<hr class="my-8" />
<h3>2) Kayseri Mantısını Unutun: Çıtır Bodrum Mantısı</h3>
<p>Bodrum mantısı “haşlanmış minik hamurlar” beklentisini bozar. Çünkü Bodrum’da mantı, çoğu yerde kızartılmış haliyle meşhurdur: dışı çıtır, içi dolgun; üzerine sarımsaklı yoğurt ve domates sosu gelir. Doğru yapıldığında yoğurt gelse bile çıtırlık hissi korunur.</p>
<div class="my-6">
    <img src="/images/blog/bodrum_manti.png" alt="Çıtır Bodrum Mantısı" class="w-full h-auto rounded-lg shadow-md" />
</div>
<div class="bg-red-50 p-4 rounded mb-4">
    <h4 class="font-bold text-red-800 mb-2">Hangi versiyon daha iyi?</h4>
    <p class="text-sm mb-2"><strong>Orijinal deneyim:</strong> Tam kızarmış (çıtır)</p>
    <p class="text-sm"><strong>“Yağ ağır gelir” diyene:</strong> Karışık (yarı haşlama–yarı kızartma)</p>
    <p class="text-sm italic mt-2">Ama “Bodrum mantısı yedim” demek için çıtır versiyon şart.</p>
</div>
<p><strong>Nerede aranır?</strong> Bodrum Merkez’de ve bazı popüler bölgelerde mantı odaklı işletmeler bulursunuz. Burada kritik olan isim değil; mantının hızlı çıkması (taze servis) ve yoğurt/sos dengesidir. Çok kalabalık saatlerde “önceden kızarmış” gelmesin diye mümkünse akşamüstü deneyin.</p>
<hr class="my-8" />
<h3>3) Bodrum Türküsü Gibi Bir Tabak: Çökertme Kebabı</h3>
<p>Çökertme kebabı Bodrum’da sadece bir yemek değil, yerel gurur. Tabakta üç şey doğru olacak:</p>
<div class="my-6">
    <img src="/images/blog/bodrum_cokertme.png" alt="Bodrum Çökertme Kebabı" class="w-full h-auto rounded-lg shadow-md" />
</div>
<ol class="list-decimal pl-6 space-y-2 font-semibold text-gray-800">
    <li>Kibrit inceliğinde patates (kalın olursa “çökertme” tadı düşer)</li>
    <li>Süzme yoğurt dengeli olacak (baskın değil, destekleyici)</li>
    <li>Et ve sos “üstüne dökülmüş” gibi değil, tabakla uyumlu olacak</li>
</ol>
<p class="mt-4"><strong>Nerede daha iyi çıkar?</strong> Çökertmeyi her yerde bulursunuz ama en iyi performans genelde Bodrum Merkez’de esnaf çizgisini koruyan lokantalarda veya Yalıkavak tarafında “turistik menü” yerine düzenli müdavimi olan yerlerde çıkar. Turistik menüde patates kalınlaşıyorsa, çökertme büyüsü gider.</p>
<hr class="my-8" />
<h3>4) “Gerçek Öğlen” Rotası: Esnaf Lokantaları ve Ege Otları</h3>
<p>Bodrum’da yaşayanlar her gün balıkçıya oturmaz. Öğlenin gerçeği: esnaf lokantası vitrini. Burada Bodrum’un Ege tarafını görürsünüz: zeytinyağlılar, otlar, hafif tabaklar.</p>
<div class="bg-green-50 p-6 rounded-lg my-4">
    <h4 class="font-bold text-green-800 mb-2">Vitride ne görürsen onu seç mantığı:</h4>
    <ul class="list-disc pl-5 text-sm text-green-700 space-y-1">
        <li>Kabak çiçeği dolması (özellikle zeytinyağlı)</li>
        <li>Deniz börülcesi / turp otu / hardal otu gibi Ege otları (mevsime göre değişir)</li>
        <li>Zeytinyağlılar: hafif, ferah, sıcak günü kurtarır</li>
    </ul>
</div>
<p><strong>GEO ipucu: Nereye bakmalı?</strong> Konacık çevresi (merkeze yakın, yerel yaşamın yoğun olduğu hat) esnaf lokantası mantığında güçlüdür. Bitez–Konacık aksında turistik kalabalık azaldıkça “gerçek öğlen” daha rahat yaşanır.</p>
<hr class="my-8" />
<h3>5) Tatlı Final: Bitez Dondurması ve Bodrum Mandalinası</h3>
<p>Bodrum’un “imza aroması” mandalinadır. Bu yüzden tatlı tarafında iki şey öne çıkar:</p>
<div class="my-6">
    <img src="/images/blog/bodrum_bitez_dondurma.png" alt="Bitez Dondurması" class="w-full h-auto rounded-lg shadow-md" />
</div>
<h4 class="font-bold text-lg text-yellow-600 mt-4">Bitez dondurması</h4>
<p>Bitez tarafında dondurma bir akşam yürüyüşü ritüelidir. En iyi senaryo: Dondurmayı al → sahile doğru yürü → gün batımı sonrası serinlikte bitir. Mandalina, karadut, sakız gibi klasikler genelde güvenli tercihlerdir.</p>
<h4 class="font-bold text-lg text-yellow-600 mt-4">Mandalina gazozu / mandalina ürünleri</h4>
<p>Market rafında global markaya uzanmak yerine, “Bodrum mandalinası” vurgulu yerel ürünlere bakın. Dönüşte götürülebilecek en sempatik hediyelerden: mandalina temalı içecekler ve kavanoz ürünleri.</p>
<hr class="my-8" />
<h3>1 Günde “Yerlisi Gibi” Bodrum Lezzet Rotası</h3>
<div class="space-y-4">
    <div class="flex items-start">
        <div class="bg-pink-100 text-pink-800 font-bold px-2 py-1 rounded text-xs mr-3 mt-1">11:30</div>
        <div><strong>Bodrum Merkez Çarşı:</strong> Sebzeli döner + ayran (geç kalma, biter).</div>
    </div>
    <div class="flex items-start">
        <div class="bg-pink-100 text-pink-800 font-bold px-2 py-1 rounded text-xs mr-3 mt-1">16:30</div>
        <div><strong>Mantı molası:</strong> Çıtır Bodrum mantısı (kalabalık patlamadan).</div>
    </div>
    <div class="flex items-start">
        <div class="bg-pink-100 text-pink-800 font-bold px-2 py-1 rounded text-xs mr-3 mt-1">19:30</div>
        <div><strong>Akşam ana yemek:</strong> Çökertme kebabı (patates inceliği önemli).</div>
    </div>
    <div class="flex items-start">
        <div class="bg-pink-100 text-pink-800 font-bold px-2 py-1 rounded text-xs mr-3 mt-1">22:00</div>
        <div><strong>Tatlı yürüyüş:</strong> Bitez dondurması + sahil yürüyüşü.</div>
    </div>
</div>
<hr class="my-8" />
<div class="bg-blue-50 p-6 rounded-lg text-center mt-8">
    <h3 class="font-bold text-blue-800 mb-2">Sonuç: Bodrum’un Lezzeti Sokakta Başlar</h3>
    <p class="text-blue-900">Bodrum’u “yerlisi gibi” yemek; pahalı masaları reddetmek değil, doğru anı doğru yerde yakalamak demek. Bazen en lüks deneyim, en sade tabakta saklıdır: öğlen sebzeli döner, akşamüstü çıtır mantı, geceye doğru çökertme… Ve finalde mandalina kokusu.</p>
</div>
<p class="text-sm text-gray-500 mt-8">Bodrum keşfinize devam etmek için <a href="/rehber/bodrum-arabasiz-tatil-rehberi-ulasim-tuyolari" class="text-blue-600 hover:underline">Bodrum’da Arabasız Tatil Rehberi</a>, konaklama seçenekleri için <a href="/rehber/bodrum-nerede-kalinir-yalikavak-turkbuku-merkez-rehberi" class="text-blue-600 hover:underline">Bodrum’da Nerede Kalınır?</a> veya ücretsiz deniz keyfi için <a href="/rehber/bodrum-ucretsiz-halk-plajlari-koylar-rehberi" class="text-blue-600 hover:underline">Bodrum Halk Plajları</a> yazılarına göz atabilirsiniz.</p>`,
            cover_image_url: '/images/blog/bodrum_sebzeli_doner.png',
            location: 'Muğla / Bodrum',
            meta_description: 'Bodrum’da ne yenir? Sebzeli döner, çıtır Bodrum mantısı, çökertme kebabı, Ege otları, esnaf lokantaları ve Bitez dondurması için yerel rehber.',
            is_published: true,
            published_at: new Date(Date.now() + 2000).toISOString()
        },
        // Bodrum Sari Yaz
        {
            title: 'Bodrum’da “Sarı Yaz” Mevsimi: Eylül–Ekim’de Neden Gitmeli? (Hava, Fiyat ve Kalabalık Rehberi)',
            slug: 'bodrum-sari-yaz-eylul-ekim-rehberi',
            content: `<h1>Bodrum’da “Sarı Yaz” Mevsimi: Eylül–Ekim’de Neden Gitmeli? (Hava, Fiyat ve Kalabalık Rehberi)</h1>
<p>Bodrum’u Temmuz–Ağustos kalabalığıyla tanıdıysanız, bir de “Sarı Yaz” dönemini görün. Okulların açılmasıyla yarımada nefes alır; gün ışığı yumuşar, akşamları serin bir rüzgâr gelir, servis hızlanır, yollar açılır. Kısacası: Bodrum “turist modu”ndan çıkıp daha keyifli bir ritme girer.</p>
<p>Bu rehberde Bodrum’a Eylül ortası–Ekim sonu aralığında gelmenin avantajlarını; hava/deniz, fiyat–kalabalık, gastro & doğa aktiviteleri ve “bilmen gereken minik uyarılar” ile tek seferde topladım.</p>
<div class="my-8">
    <img src="/images/blog/bodrum_sari_yaz_cover.png" alt="Bodrum Sarı Yaz Eylül Ekim" class="w-full h-auto rounded-lg shadow-md" />
</div>
<h2>1) Hava Konforu: Terlemeden Bodrum Gezmek</h2>
<p>Yazın Bodrum Yarımadası’nda en yorucu şey, sadece sıcaklık değil; yüksek tempo + trafik + kalabalık birleşimi. Sarı Yaz’da tempo düşer, hava daha “insan” olur.</p>
<ul class="list-disc pl-6 space-y-2">
    <li><strong>Eylül:</strong> Genelde hâlâ yaz hissi verir: gündüz sıcak, akşam daha ferah.</li>
    <li><strong>Ekim:</strong> “Gündüz deniz, akşam yürüyüş/akşam yemeği” dengesini daha kolay kurdurur; geceler belirgin serinler.</li>
</ul>
<div class="bg-blue-50 p-4 rounded mt-4">
    <p class="text-sm"><strong>Mini gerçek:</strong> Yağış olasılığı Eylül’ün ikinci yarısından itibaren artma eğilimine girer. Bu kötü haber değil; Sarı Yaz planında sadece “B planı” demek.</p>
</div>
<hr class="my-8" />
<h2>2) Deniz Suyu Efsanesi: Asıl Sıcak Dönem Geç Yazdır</h2>
<p>“Eylül’de deniz soğuk olur” cümlesi Bodrum için çoğu zaman doğru değil. Deniz, yaz boyunca ısınmış olur ve o ısıyı kolay kolay bırakmaz.</p>
<div class="my-6">
    <img src="/images/blog/bodrum_eylul_deniz.png" alt="Bodrum Eylül Ayı Deniz Keyfi" class="w-full h-auto rounded-lg shadow-md" />
</div>
<ul class="list-disc pl-6 space-y-2">
    <li><strong>Eylül:</strong> Deniz suyu ortalaması Bodrum’da genelde 25°C civarında seyreder.</li>
    <li><strong>Ekim:</strong> Ortalama 23°C bandına inse de hâlâ yüzülebilir gün sayısı fazladır (özellikle rüzgârın daha sakin olduğu saatlerde).</li>
</ul>
<p class="mt-4 text-sm"><strong>Pratik taktik:</strong> Sarı Yaz’da “deniz keyfi” için en iyi zaman, genelde 11:00–16:30 arası. Sabah erken saatler rüzgârlıysa bile öğlene doğru su toparlar.</p>
<hr class="my-8" />
<h2>3) Fiyatlar ve Hizmet: “Aynı Bodrum, Daha Az Yakıcı”</h2>
<p>Sarı Yaz’ın en büyük olayı şu: Bodrum aynı Bodrum, ama “pik sezon baskısı” azaldığı için:</p>
<ul class="list-disc pl-6 space-y-2">
    <li>Konaklamada daha mantıklı seçenekler yakalama şansı artar (özellikle hafta içi).</li>
    <li>Restoranlarda “hızlı servis / hızlı masa döndürme” stresi azalır; daha özenli bir deneyim çıkar.</li>
    <li>Beach düzeni daha rahatlar: şezlong kapma yarışı yavaşlar, sahil daha ferah olur.</li>
</ul>
<hr class="my-8" />
<h2>4) Trafik ve Kalabalık: Bodrum’u Gerçekten Gezebildiğiniz Zaman</h2>
<p>Temmuz’da Yalıkavak’tan Bodrum Merkez’e “akşamüstü inelim” demek bazen günün yarısını yola yazmaktır. Sarı Yaz’da:</p>
<div class="my-6">
    <img src="/images/blog/bodrum_gumusluk_gunbatimi.png" alt="Sakin Bodrum Gümüşlük Gün Batımı" class="w-full h-auto rounded-lg shadow-md" />
</div>
<ul class="list-disc pl-6 space-y-2">
    <li>Yalıkavak – Bodrum Merkez, Gümüşlük – Turgutreis gibi akslarda yol daha akıcı olur.</li>
    <li>Popüler koylarda “insan denizi” yerine “deniz” görürsünüz.</li>
    <li>Özellikle gün batımı saatlerinde (Gümüşlük, Yalıkavak sahil, Bodrum Marina yürüyüşleri) daha keyifli bir tempo yakalanır.</li>
</ul>
<hr class="my-8" />
<h2>5) Sarı Yaz Aktivite Haritası: Denizden Çıkınca Ne Yapılır?</h2>
<h3 class="font-bold text-gray-800 mt-4">Bağ bozumu ve sofralar: Mumcular – Yalıçiftlik hattı</h3>
<p>Eylül, Bodrum’un kırsalında (Mumcular ve çevresi gibi) doğanın canlandığı; bağ/hasat temalı etkinliklerin öne çıktığı dönemdir. Gün batımına yakın bir “kırsal rota” + akşam yemeği kombinasyonu Sarı Yaz’a çok yakışır.</p>
<div class="my-6">
    <img src="/images/blog/bodrum_bag_bozumu.png" alt="Bodrum Bağ Bozumu ve Doğa" class="w-full h-auto rounded-lg shadow-md" />
</div>
<h3 class="font-bold text-gray-800 mt-4">Zeytin zamanı: Ekim sonu köy rotaları</h3>
<p>Ekim sonuna doğru zeytin teması belirginleşir. Bodrum’un “yarımada içi” köylerinde daha yerel bir ritim yakalarsınız.</p>
<h3 class="font-bold text-gray-800 mt-4">Doğa yürüyüşü: Leleg / Pedasa hattı</h3>
<p>Sıcakta yürünmeyen parkurlar, Sarı Yaz’da “tam kıvamına” gelir. Pedasa ve Leleg uygarlığı odağında yarımadada arkeoloji ve doğayı birleştiren rotalar öne çıkar.</p>
<hr class="my-8" />
<div class="bg-yellow-50 p-6 rounded-lg my-8 border border-yellow-200">
    <h3 class="text-xl font-bold mb-4 text-yellow-800">6) Sarı Yaz’a Gelirken Bilmen Gereken 3 Uyarı</h3>
    <ul class="space-y-3 text-sm">
        <li>🚧 <strong>Sezonluk mekân kapanışları:</strong> Bazı beach club ve yazlık gece konseptleri Eylül sonu–Ekim ortası gibi yavaşlayabilir.</li>
        <li>🧥 <strong>Akşam serinliği:</strong> Özellikle Yalıkavak tarafında rüzgâr akşamları üşütebilir. İnce bir hırka/sweatshirt bavula şart.</li>
        <li>☔ <strong>Yağış planı:</strong> Eylül’ün ikinci yarısından itibaren yağış ihtimali artar; 1 gün “müze/çarşı/uzun öğle yemeği” gibi B planı koyun.</li>
    </ul>
</div>
<div class="bg-blue-50 p-6 rounded-lg text-center mt-8">
    <h3 class="font-bold text-blue-800 mb-2">Sonuç: Bodrum’un En “Yaşanır” Hali</h3>
    <p class="text-blue-900">Sarı Yaz, Bodrum’un “show” değil “yaşam” dönemi. Daha az kalabalıkla daha güzel servis, daha rahat yollarla daha çok keşif, daha yumuşak ışıkla daha iyi anılar… Eğer tarih seçme şansınız varsa, Bodrum için takvimin en akıllı hamlesi çoğu zaman Eylül–Ekim olur.</p>
</div>
<hr class="my-8" />
<h3>Sıkça Sorulan Sorular</h3>
<div class="space-y-6">
    <div>
        <h4 class="font-bold text-gray-900 text-lg">Bodrum’da Sarı Yaz ne zaman başlar?</h4>
        <p class="text-gray-700 mt-1">Genelde okulların açıldığı dönemle birlikte (Eylül ortası gibi) Bodrum’da kalabalık düşer; Ekim sonuna kadar “Sarı Yaz” havası sürer.</p>
    </div>
    <div>
        <h4 class="font-bold text-gray-900 text-lg">Eylül–Ekim’de Bodrum’da denize girilir mi?</h4>
        <p class="text-gray-700 mt-1">Evet. Eylül’de deniz suyu Bodrum’da genelde ~25°C civarındadır; Ekim’de ortalama düşse de çoğu gün hâlâ yüzülebilir bandındadır.</p>
    </div>
    <div>
        <h4 class="font-bold text-gray-900 text-lg">Ekim’de yağmur çok olur mu?</h4>
        <p class="text-gray-700 mt-1">Yağış ihtimali Eylül’ün ikinci yarısından itibaren yükselme eğilimindedir; Ekim’de “B planı” yapmak akıllıca olur.</p>
    </div>
    <div>
        <h4 class="font-bold text-gray-900 text-lg">Sarı Yaz’da hangi bölgeler daha keyifli?</h4>
        <p class="text-gray-700 mt-1">Gün batımı ve sakinlik için Gümüşlük; rüzgâr/ferahlık için Yalıkavak; daha “klasik Bodrum” yürüyüşleri için Bodrum Merkez–Marina hattı iyi çalışır.</p>
    </div>
    <div>
        <h4 class="font-bold text-gray-900 text-lg">Sarı Yaz’da beach club’lar açık mı?</h4>
        <p class="text-gray-700 mt-1">Bazıları sezonu erken kapatabilir; özellikle Eylül sonu–Ekim ortasında mekan bazında değişir. Gitmeden önce Instagram/telefonla teyit etmek en doğrusu.</p>
    </div>
</div>`,
            cover_image_url: '/images/blog/bodrum_sari_yaz_cover.png',
            location: 'Muğla / Bodrum',
            meta_description: 'Bodrum’da Sarı Yaz (Eylül–Ekim) rehberi: deniz suyu sıcaklığı, hava ve yağış dengesi, düşen fiyatlar, azalan kalabalık, Leleg Yolu ve bağ bozumu rotaları.',
            is_published: true,
            published_at: new Date().toISOString()
        }
    ];

    for (const article of articlesToInsert) {
        console.log(`Upserting article: ${article.slug}`);
        const { error } = await supabase
            .from('articles')
            .upsert(article, { onConflict: 'slug' });

        if (error) {
            console.error(`Failed to insert ${article.slug}:`, error.message);
        } else {
            console.log(`Success: ${article.slug}`);
        }
    }

    console.log('Done.');
}

run();
