
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const envPath = path.join(process.cwd(), '.env.local');
let envContent = '';
try { envContent = fs.readFileSync(envPath, 'utf-8'); } catch (e) { }

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

if (!supabaseUrl || !supabaseKey) { console.error('Missing credentials'); process.exit(1); }

const supabase = createClient(supabaseUrl, supabaseKey);

const article = {
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
};

async function run() {
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

run();
