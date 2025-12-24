import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

// Load environment variables manually
const envPath = path.join(process.cwd(), '.env.local');
let envVars: Record<string, string> = {};

try {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envVars = envContent.split('\n').reduce((acc, line) => {
    // Ignore comments and empty lines
    if (line.startsWith('#') || !line.trim()) return acc;

    // Split by first equals sign
    const firstEquals = line.indexOf('=');
    if (firstEquals !== -1) {
      const key = line.substring(0, firstEquals).trim();
      let value = line.substring(firstEquals + 1).trim();
      // Remove quotes if present
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      acc[key] = value;
    }
    return acc;
  }, {} as Record<string, string>);
} catch (error) {
  console.warn('.env.local not found or unreadable, relying on process.env');
}

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const article = {
  id: crypto.randomUUID(),
  title: { tr: "Fethiye’de Arabasız Tatil Rehberi: Ulaşım, Dolmuş Hatları ve Pratik Rotalar" },
  slug: "fethiyede-arabasiz-tatil-ulasim-dolmus-rehberi",
  cover_image_url: "/fethiye-dolmus.png",
  meta_description: { tr: "Fethiye'de araba kiralamadan tatil yapmanın püf noktaları. Dolmuş hatları, ulaşım rotaları ve arabasız gezginler için pratik tavsiyeler." },
  location: "Fethiye",
  is_published: true,
  published_at: new Date().toISOString(),
  content: {
    tr: `
    <p>Fethiye tatili planlarken insanın aklına ilk şu düşüyor: <strong>“Araba kiralamam şart mı?”</strong></p>
    <p>Kısa cevap: <strong>Hayır.</strong></p>
    <p>Uzun cevap: Fethiye’de arabasız tatil, doğru birkaç detayı bildiğinde arabalı tatilden bile daha rahat akabiliyor.</p>
    
    <p>Çünkü araba demek bazen şunlar demek: park yeri kovalamak, dar/virajlı yollarda stres, sıcakta trafik, “şuradan mı dönüyorduk?” derken günün yarısını yolda harcamak… Arabasız gezince ise çoğu zaman tek işin manzaraya bakmak oluyor. Üstelik Fethiye’de rotalar “dağınık” görünse de sistemin mantığı net: merkez + hatlar + kısa aktarmalar.</p>

    <p>Bu rehberde şunları çözüyoruz:</p>
    <ul>
      <li>Dalaman Havalimanı’ndan Fethiye’ye arabasız en pratik geliş</li>
      <li>Şehir içinde “nereden nereye” mantığı: durak, aktarma, akış</li>
      <li>Arabasız gidilen ana rotalar: Ölüdeniz, Çalış, Kayaköy, Faralya/Kabak, Saklıkent</li>
      <li>Uzak rotalarda “dönüşü kaçırmama” taktikleri</li>
      <li>Kalabalık/sıcak yönetimi, günlük plan şablonları, mini SSS</li>
    </ul>

    <div class="bg-blue-50 p-4 rounded-lg my-6 border-l-4 border-blue-500">
      <p><strong>Not:</strong> Sefer sıklığı, hat isimleri, çalışma saatleri ve ücretler sezona göre değişebilir. Bu rehber “mantığı” öğretiyor. En kritik detayları (son dönüş, aktarma noktası) durakta 1 cümle sorarak her zaman doğrula.</p>
    </div>

    <h2>1) Dalaman Havalimanı’ndan Fethiye’ye Arabasız Nasıl Gidilir?</h2>
    <p>Uçakla geliyorsan ilk hedefin genelde Fethiye Otogarı (şehirlerarası terminal) olur. Havalimanı çıkışında sezon boyunca farklı servis seçenekleri bulunur ve çoğu zaman uçuş saatlerine göre organize edilir.</p>
    
    <h3>En pratik yaklaşım:</h3>
    <ul>
      <li>Uçaktan inince çıkış kapısı tarafında “şehir merkezi/otogar” yönlendirmelerini kontrol et.</li>
      <li>Servislerin ilk bıraktığı yer genelde otogar olur.</li>
      <li>Otogardan sonra konaklayacağın bölgeye geçiş için şehir içi minibüs/dolmuş bağlantısı kullanırsın.</li>
    </ul>

    <h3>Valiz taktiği (çok iş görür):</h3>
    <p>Otogar sahil bandının tam üstünde olmayabilir. Valizin ağırsa “20–25 dakika yürüme” fikri iyi gelmeyebilir.</p>
    <p><strong>En doğru hamle:</strong> otogardan şehir içine kısa bir bağlantı ile geçmek (şehir içi minibüs/dolmuş veya kısa mesafe taksi). Bu, ilk gün enerjini korur.</p>

    <h3>Zaman yönetimi:</h3>
    <ul>
      <li>Geliş saatlerin geceye denk geliyorsa “araç bulur muyum?” stresi yapma; yine de her sezon aynı olmadığını bil.</li>
      <li>Otogara vardığında bir kez etrafı gözlemle, “merkez/durak” yönünü öğren. Sonrası kolay.</li>
    </ul>

    <h2>2) Fethiye’de Arabasız Tatilin Mantığı: “Merkez Nokta + Hat”</h2>
    <p>Fethiye’de ulaşımı kolaylaştıran şey şu: şehir içi ulaşım, birkaç kritik durak noktası etrafında döner. Halk arasında en çok referans verilen yerlerden biri merkezdeki cami çevresi (çoğu kişi “Beyaz Cami çevresi” diye tarif eder). Bu bölge, birçok hattın geçtiği ya da yakınından aktığı bir “mini transfer” alanı gibi çalışır.</p>

    <h3>Altın kural:</h3>
    <ul>
      <li>Gün içinde çoğu plan “merkeze yaklaş → doğru hatta bin → dön” şeklinde akar.</li>
      <li>“Ölüdeniz’e gideyim, sonra Kayaköy yapayım, akşam Çalış’a geçeyim” gibi planlar bile arabasız yapılır; sadece aktarma mantığını bilmen gerekir.</li>
    </ul>

    <h3>Ödeme konusu: En garantisi nedir?</h3>
    <p>Bu işte en sorunsuz kombinasyon: <strong>✅ temassız kart + ✅ küçük miktar nakit</strong></p>
    <p>Bazı araçlarda temassız çok yaygındır; bazılarında nakit daha pratik olabilir. Yanında iki seçeneği de bulundurmak seni gün boyunca rahatlatır.</p>

    <h2>3) “Arabasız Fethiye” için 3 temel kural</h2>
    
    <div class="space-y-4">
      <div class="bg-gray-50 p-4 rounded-lg">
        <strong>Kural 1 — Uzak rota yapıyorsan dönüşü en baştan garantiye al.</strong>
        <p>Giderken “nasıl döneceğim?” değil, indiğin an “son dönüş kaçta?” sor.</p>
      </div>

      <div class="bg-gray-50 p-4 rounded-lg">
        <strong>Kural 2 — Popüler yerlerde kalabalık saatlerini planla.</strong>
        <p>Ölüdeniz gibi noktalarda özellikle akşam üstü dönüş yoğun olur. 30–45 dakika oynatmak bile konforu değiştirir.</p>
      </div>

      <div class="bg-gray-50 p-4 rounded-lg">
        <strong>Kural 3 — Her gün 1 ana hedef seç, kalanını “yakın/kolay” tut.</strong>
        <p>Arabasız tatilde gereksiz koşturma değil, akış kazanır: bir gün uzak rota, ertesi gün merkez-çevresi gibi.</p>
      </div>
    </div>

    <h2>Arabasız 5 Pratik Rota</h2>

    <h3>Rota 1: Fethiye Merkez → Ölüdeniz (Belcekız & Kumburnu)</h3>
    <img src="/fethiye-oludeniz.png" alt="Fethiye Ölüdeniz havadan görünüm" class="w-full h-auto rounded-xl shadow-lg my-8" />
    <p>Fethiye denince akla ilk gelen kare Ölüdeniz. Arabasız ulaşım burada çoğu zaman “kolay mod”dur.</p>
    <p><strong>Ne beklemelisin?</strong></p>
    <ul>
      <li>Merkezden Ölüdeniz yönüne gün içinde düzenli hatlar olur.</li>
      <li>Yaz sezonunda sefer sıklığı artar.</li>
      <li>Dönüşte özellikle gün batımı saatlerinde kuyruk/yoğunluk görülebilir.</li>
    </ul>
    <p><strong>Konfor taktiği:</strong> “Gün batımı fotoğrafı çekip hemen dönelim” planı yapıyorsan, kalabalığı göze al. Daha rahat istiyorsan: ya biraz daha erken dön, ya da gün batımından sonra 30–45 dakika oyalan (kısa yürüyüş, sahil çevresi) öyle dön.</p>
    <p><em>Arabasız avantajı: Ölüdeniz’e inen yollarda sürücülük stresi yerine cam kenarında manzara keyfi.</em></p>

    <h3>Rota 2: Fethiye Merkez → Çalış (gün batımı yürüyüşü)</h3>
    <p>Çalış tarafı “akşam havası” için çok tercih edilir: uzun yürüyüş, esinti, gün batımı.</p>
    <p><strong>Ulaşım mantığı:</strong> Merkezden Çalış yönüne giden hatlar genelde kolaydır. Akşam saatlerinde dönüşte yine yoğunluk olabilir ama Ölüdeniz kadar “tek pencere” hissi vermez; alternatif saatler bulmak daha kolaydır.</p>
    <p><strong>Küçük ipucu:</strong> Çalış planını “gün batımına 60–90 dakika kala” yaparsan hem yürüyüşe hem manzaraya yetişirsin.</p>

    <h3>Rota 3: Kayaköy (tarih + atmosfer) + Gemiler ihtimali</h3>
    <img src="/fethiye-kayakoy.png" alt="Kayaköy tarihi taş evler" class="w-full h-auto rounded-xl shadow-lg my-8" />
    <p>Kayaköy, merkeze çok uzak değildir ama yolu kıvrımlıdır. Arabasız ulaşım burada da gayet mümkündür.</p>
    <p><strong>Plan:</strong> Merkezden Kayaköy yönüne giden hatları kullanırsın. Yol çoğunlukla yamaçlardan aktığı için manzara keyiflidir.</p>
    <p><strong>Altın soru (bütün günün planını kurtarır):</strong> Kayaköy dolmuşlarının bazıları devamında Gemiler tarafına da uzayabilir. Eğer “Kayaköy + deniz” gibi bir plan yapıyorsan, binerken/inerken sor: <em>“Devamı Gemiler’e gidiyor mu?”</em></p>
    <p><strong>Zaman taktiği:</strong> Kayaköy’ü öğlen sıcağına bırakma. En iyi saatler genelde sabah ya da ikindiye doğru. Hem yürümek daha rahat olur, hem de ışık daha güzel olur.</p>

    <h3>Rota 4: Faralya & Kabak hattı (aktarma + iniş detayı önemli)</h3>
    <p>Burası “manzara + doğa” tarafında Fethiye’nin en etkileyici hatlarından biri. Yol virajlı ve yer yer dar olabileceği için, arabayla giden bazı insanlar yorulur. Arabasız giden ise çoğu zaman “iyi ki şoför değilim” der.</p>
    <p><strong>En pratik senaryo:</strong> Önce Ölüdeniz tarafına geç, sonra Faralya/Kabak yönüne devam et. (Sezon ve hatta göre değişebilir; mantık bu.)</p>
    <p><strong>Kritik detay: Kabak’ta nerede iniyorsun?</strong> Toplu taşıma seni çoğu zaman koyun üst kısmında bırakır. Koya inmek için sezonluk servisler olabiliyor ya da iniş patikası/yürüyüş gerekebiliyor.</p>
    <p><strong>Ne yapmalısın?</strong> İner inmez iki şeyi netleştir: “Koya inmek için servis var mı?” ve “Dönüş için son saat kaç civarı?”</p>

    <h3>Rota 5: Saklıkent (buz gibi kaçış) — gidiş tamam, dönüşü sabitle</h3>
    <img src="/fethiye-saklikent.png" alt="Saklıkent kanyonu ve nehir" class="w-full h-auto rounded-xl shadow-lg my-8" />
    <p>Saklıkent, merkezden daha uzun mesafede olduğu için sefer mantığı farklı olabilir. Burada arabasız tatilin tek riski “dönüşü kaçırma” olur; onu da doğru soru ile sıfırlarsın.</p>
    <p><strong>Planlama taktiği (en önemlisi):</strong> Giderken “nasıl döneceğim?” diye düşünme. İndiğin an sor: <em>“Son dönüş kaçta?”</em> Bu soru, kanyon gibi zamanın hızlı aktığı yerlerde hayat kurtarır.</p>

    <h2>Arabasız Tatilde “Kafa Rahat” Check-list</h2>
    <ul class="list-disc pl-5 space-y-2">
      <li><strong>Çantanda her gün dursun:</strong> su, güneş kremi, şapka/gözlük, ince bir üst (akşam serinliği ters köşe yapabilir), ıslak mendil/mini peçete, küçük nakit + temassız kart</li>
      <li><strong>Ayakkabı seçimi:</strong> Ölüdeniz/Çalış günü terlik tamam. Kayaköy / Saklıkent gibi günlerde “rahat taban” şart.</li>
      <li><strong>Telefon & internet:</strong> Harita kullanacaksın. Powerbank iyi fikir. “Durak adı” ararken en pratik yöntem: şoföre kısa soru, sonra harita ile teyit.</li>
    </ul>

    <h2>3 Günlük ve 5 Günlük Arabasız Plan Şablonu</h2>
    
    <h3>3 Günlük (rahat akış)</h3>
    <ul>
      <li>1. gün: Merkez yürüyüş + sahil bandı + çarşı çevresi</li>
      <li>2. gün: Ölüdeniz</li>
      <li>3. gün: Çalış veya Kayaköy</li>
    </ul>

    <h3>5 Günlük (tam Fethiye hissi)</h3>
    <ul>
      <li>1. gün: Merkez + akşam sahil yürüyüşü</li>
      <li>2. gün: Ölüdeniz</li>
      <li>3. gün: Kayaköy (+ uygunsa Gemiler)</li>
      <li>4. gün: Faralya/Kabak</li>
      <li>5. gün: Saklıkent</li>
    </ul>
    
    <p className="mt-4"><strong>Kural:</strong> Uzak günlerden sonra “kolay gün” koy. Arabasız tatilin kalitesi burada yükseliyor.</p>

    <h2>Sıkça Sorulan Sorular</h2>
    
    <h3>Fethiye’de taksi kullanmak mantıklı mı?</h3>
    <p>Kısa mesafede evet. Ama Ölüdeniz/Kabak/Saklıkent gibi rotalarda maliyet hızlı artabilir. Arabasız tatilde taksi, “ana ulaşım” değil tamamlayıcı gibi daha mantıklı.</p>

    <h3>Gece geç saatte dolmuş bulabilir miyim?</h3>
    <p>Yaz sezonunda popüler hatlarda şansın daha yüksek. Kışın ve uzak rotalarda seferler daha erken bitebilir. Akşam planı yapıyorsan gündüz bir kez “son saat” bilgisini sormak en iyi yöntem.</p>

    <h3>Arabasızken tekne turlarına nasıl giderim?</h3>
    <p>Tekne turları genelde merkez/liman çevresinden kalkar. Merkezde değilsen, tek hatla merkeze inip kısa yürüyüşle iskele tarafına geçebilirsin.</p>

    <h3>Çocuklu aile için arabasız zor mu?</h3>
    <p>Aslında iyi planlanırsa kolay. En önemli şey: aynı güne çok rota sıkıştırmamak ve dönüş saatlerini kaçırmamak. Ayrıca “öğlen sıcağına yürüyüş” yerine sabah/ikindi planı yapmak.</p>

    <h3>“Nerede yemek yeriz?” Mekan adı olmadan nasıl seçelim?</h3>
    <p>En pratik yöntem: bölge seç (marina çevresi, çarşı içi, sahil bandı gibi), sonra kalabalık/menü/fiyat tabelası üzerinden karar ver. Turistik bölgede “en iyi” değil, “senin o anki ihtiyacına en uygun” kazanır.</p>

    <h2>Sonuç: Fethiye Arabasız Daha Hafif</h2>
    <p>Fethiye, “arabam yok, otele tıkılırım” diyeceğin bir yer değil. Tam tersi: doğru mantığı çözdüğünde arabasız tatil daha özgür hissettirebiliyor. Park, trafik, viraj stresi yok. Manzara var, akış var.</p>
    <p>Çantana suyu ve güneş kremini at, günün rotasını seç, gerisi gerçekten akıyor.</p>
    <p>İyi tatiller!</p>
  ` }
};

async function insertArticle() {
  console.log('Inserting article...');

  // Check if article with same slug exists
  const { data: existing } = await supabase
    .from('articles')
    .select('id')
    .eq('slug', article.slug)
    .single();

  if (existing) {
    console.log('Article already exists, updating...');
    const { error } = await supabase
      .from('articles')
      .update(article)
      .eq('slug', article.slug);

    if (error) {
      console.error('Error updating article:', error);
    } else {
      console.log('Article updated successfully!');
    }
  } else {
    const { error } = await supabase
      .from('articles')
      .insert([article]);

    if (error) {
      console.error('Error inserting article:', error);
    } else {
      console.log('Article inserted successfully!');
    }
  }
}

insertArticle();
