-- Migration: Fix content and links for multiple articles
-- 1. Nesin Math Village: Full rewrite (original content) + Link fixes
-- 2. St John, Budget, Efes: Link fixes (/blog -> /rehber) + Remove dead links

-- 1. Fix Nesin Math Village Content & Links
UPDATE public.articles
SET content = '<h1>Nesin Matematik Köyü Ziyaretçi Rehberi: Şirince’de Gezginler İçeri Girebilir mi?</h1>

<p>Şirince''nin o meşhur kalabalığından ve dar sokaklarından biraz uzaklaşıp başınızı yukarı kaldırdığınızda, zeytin ağaçlarının arasında gizlenmiş taş yapıları fark edeceksiniz. İşte orası, sadece Türkiye''nin değil dünyanın da en özel eğitim alanlarından biri: Nesin Matematik Köyü ve hemen yanı başındaki Tiyatro Medresesi.</p>

<p>Burası klasik bir "gezilecek yer" veya bilet alıp girebileceğiniz bir müze değil. Burası; öğrencilerin, akademisyenlerin ve düşünürlerin bir arada yaşadığı, ürettiği ve hayatı paylaştığı canlı bir kampüs. Bu yüzden burayı ziyaret etmek isterseniz, turist kimliğinizi bir kenara bırakıp "sessiz bir misafir" gibi davranmanız gerekiyor.</p>

<div class="my-8">
    <img src="/images/blog/nesin_matematik_koyu_cover.png" alt="Nesin Matematik Köyü Genel Görünüm" class="w-full h-auto rounded-lg shadow-md" />
</div>

<div class="bg-blue-50 p-6 rounded-lg my-6">
    <h3 class="font-bold text-blue-800 mb-2">Konum: Şirince''ye Ne Kadar Uzak?</h3>
    <p>Köy, Şirince merkezinden sadece 15-20 dakikalık (yaklaşık 800m-1km) hafif yokuşlu bir yürüyüş mesafesinde. Hemen Kayser Dağı''nın eteklerinde yer alıyor. Yani Şirince gezinize burayı dahil etmek isterseniz, ekstra bir araç ayarlamanıza gerek yok; keyifli bir yürüyüşle ulaşabilirsiniz.</p>
</div>

<h2>İçeri Girebilir miyim?</h2>
<p>Kısa cevap: Evet, kapılar genellikle dışarıdan gelenlere açıktır. Ancak unutmayın, burası bir "turistik tesis" değil.</p>
<ul class="list-disc pl-6 space-y-2 mt-2">
    <li>Ders çalışan, kitap okuyan veya sadece düşünen birilerini görürseniz, onların alanına saygı duymak en önemli kural.</li>
    <li>Yoğun kamp dönemlerinde veya özel etkinliklerde ziyaretçi kabulü kısıtlanabilir.</li>
    <li>Girişte sabit bir ücret tarifesiyle karşılaşmayabilirsiniz; ancak kapıda bir bağış kutusu veya yönlendirme varsa buna uymak, bu projenin sürdürülebilirliğine katkı sağlamak açısından çok ince bir davranış olur.</li>
</ul>

<div class="bg-yellow-50 p-4 rounded border-l-4 border-yellow-400 mt-4">
    <p class="text-sm font-bold text-yellow-800">Önemli İpucu:</p>
    <p class="text-sm text-yellow-700 mt-1">Burası bir bilim yuvası. İçerideki atmosfer o kadar huzurlu ki, yüksek sesle konuşmak veya bağırarak gezmek zaten içinizden gelmeyecek. En temel kural: Varlığınız, orada çalışanların dikkatini dağıtmamalı.</p>
</div>

<hr class="my-8" />

<h2>Altın Kural: Sessizlik</h2>
<p>Köyün mimarisi ve doğası sizi büyüleyebilir, heyecanlanabilirsiniz ama sessizliğin buranın ana kuralı olduğunu aklınızdan çıkarmayın:</p>
<ul class="list-disc pl-6 space-y-2 mt-2">
    <li>Yürürken geçtiğiniz dar bir patikanın hemen yanındaki gölgelikte bir ders işleniyor olabilir.</li>
    <li>Telefonunuzu sessize almak ve konuşmalarınızı fısıltı tonunda tutmak, buranın ruhuna ayak uydurmanızı sağlar.</li>
    <li>Sadece izleyin, dinleyin ve atmosferi hissedin.</li>
</ul>

<hr class="my-8" />

<h2>İçeride Sizi Neler Bekliyor?</h2>
<p>Matematik Köyü''ne adım attığınızda sizi karşılayan manzara, modern dünyadan çok uzak:</p>

<div class="grid md:grid-cols-2 gap-6 my-6">
    <div>
        <h4 class="font-bold text-gray-900">Doğayla Bütünleşmiş Mimari</h4>
        <p class="text-sm mt-2">Taş binalar, sarmaşıklarla kaplı avlular ve hiçbir ağaca zarar verilmeden tasarlanmış yapılar... Buradaki estetik, "güzel görünsün" diye değil, doğayla uyumlu olsun diye böyle. Her köşe başında çalışmaya davet eden bir masa, bir sandalye görebilirsiniz.</p>
    </div>
    <div>
        <h4 class="font-bold text-gray-900">Manzara ve Mola</h4>
        <p class="text-sm mt-2">Eğer ziyaret saatiniz uygunsa ve kafeterya bölümü açıksanız, kendinize bir çay-kahve ısmarlayıp muhteşem Selçuk manzarasını izleyebilirsiniz. Bu sessiz mola, gezinizin en huzurlu anı olabilir.</p>
    </div>
</div>

<div class="my-6">
    <img src="/images/blog/nesin_derslik_avlu.png" alt="Nesin Köyü Derslik ve Avlu" class="w-full h-auto rounded-lg shadow-md" />
</div>

<h3 class="font-bold text-gray-800 mt-4">Kule ve Kütüphane</h3>
<p>Köyün simgelerinden olan kule ve kütüphane binaları, çalışma alanlarının kalbidir. Buralara girip girmemek konusunda kapıdaki uyarıları veya görevlilerin yönlendirmelerini mutlaka dikkate alın.</p>
<div class="my-6">
    <img src="/images/blog/nesin_kutuphane_kule.png" alt="Nesin Matematik Köyü Kulesi" class="w-full h-auto rounded-lg shadow-md" />
</div>

<hr class="my-8" />

<h2>Fotoğraf Çekimi Konusu</h2>
<p>Biliyoruz, her köşe çok fotojenik. Ancak kameranızı kaldırırken iki kez düşünmeniz gereken yerdesiniz.</p>
<div class="bg-gray-100 p-4 rounded mt-4">
    <h4 class="font-bold text-gray-800 mb-2">Nasıl Fotoğraf Çekmeli?</h4>
    <ul class="list-disc pl-5 text-sm space-y-1">
        <li>✅ Genel manzaralar, binalar, çiçekler, kediler: Serbest.</li>
        <li>❌ Ders anları, öğrencilerin yüzleri, tahtalardaki notlar: İzin almadan kesinlikle çekmeyin. Bu insanların mahremiyetine ve konsantrasyonuna saygı duyun.</li>
        <li>❌ Profesyonel çekimler, tripodlar, kurgu videolar: Burası bir plato değil, bu tür şeyler için uygun değil.</li>
    </ul>
</div>

<hr class="my-8" />

<h2>Tiyatro Medresesi ve Diğer Köyler</h2>
<p>Yürüyüşünüz sırasında sadece Matematik Köyü ile sınırlı kalmayabilirsiniz. Tiyatro Medresesi ve Sanat Köyü gibi alanlar da aynı arazide, iç içe geçmiş durumdadır. </p>
<p class="mt-2">Bir avludan diğerine geçerken tiyatro provası yapan bir ekiple karşılaşmanız şaşırtıcı olmasın. Kural yine aynı: İzleyebilirsiniz ama bölmeyin, provayı "turistik bir şov" gibi değil, ciddi bir çalışma olarak görün.</p>

<hr class="my-8" />

<h2>Ulaşım ve Otopark Sorunu</h2>
<p>Burası hakkındaki en önemli pratik bilgiye geldik: Otopark.</p>

<div class="my-6">
    <img src="/images/blog/sirince_yuruyus_yolu.png" alt="Şirince''den Köye Yürüyüş Yolu" class="w-full h-auto rounded-lg shadow-md" />
</div>

<p>Köy yolunda ve girişinde ziyaretçiler için ayrılmış geniş bir otopark alanı <strong>yoktur</strong>. Daracık yolda aracınızla manevra yapmaya çalışmak veya park yeri aramak hem sizi hem de köy trafiğini zora sokar.</p>

<h3 class="font-bold text-gray-800 mt-4">Ne Yapmalısınız?</h3>
<ol class="list-decimal pl-6 space-y-2 mt-2">
    <li>Aracınızı Şirince''de bırakın. Köy meydanından 15-20 dakikalık yürüyüşle çıkmak en sağlıklısı.</li>
    <li>Yürümek istemiyorsanız Şirince''den geçen taksileri veya varsa dolmuşları kullanabilirsiniz.</li>
</ol>

<div class="bg-gray-50 p-6 rounded-lg my-8">
    <h3 class="font-bold text-gray-800 mb-4">Şirince Gezinizi Planlarken</h3>
    <ul class="space-y-2 text-sm">
        <li><a href="/rehber/izmirden-sirinceye-arabasiz-ulasim-izban-selcuk-dolmus" class="text-blue-600 hover:underline">İzmir’den Şirince’ye Arabasız Nasıl Gidilir? (İZBAN & Dolmuş Rehberi)</a></li>
        <li><a href="/rehber/sirince-sarap-rehberi-meyve-sarabi-uzum" class="text-blue-600 hover:underline">Şirince Şarap Rehberi: Meyve Şarabı mı, Gerçek Üzüm Mü?</a></li>
    </ul>
</div>

<div class="bg-green-50 p-6 rounded-lg text-center mt-8">
    <h3 class="font-bold text-green-800 mb-2">Son Söz</h3>
    <p class="text-green-900">Nesin Matematik Köyü, imkansız denilenin başarıldığı, taşın toprağın bilgiyle yoğrulduğu bir ütopya. Buraya gelip o havayı solumak bile vizyonunuzu tazelemeye yeter. Yeter ki "gezgin" değil, "misafir" nezaketiyle yaklaşın. Şimdiden iyi keşifler!</p>
</div>

<hr class="my-8" />

<h3>Merak Edilenler</h3>

<div class="space-y-6">
    <div>
        <h4 class="font-bold text-gray-900 text-lg">Ziyaret saatleri var mı?</h4>
        <p class="text-gray-700 mt-1">Kesin bir saat aralığı olmasa da, hava kararmadan ve sabah çok erken olmayan saatlerde (09:00 - 18:00 gibi) gitmek, içerideki yaşam döngüsüne saygı açısından en uygunudur.</p>
    </div>
    
    <div>
        <h4 class="font-bold text-gray-900 text-lg">Giriş ücretli mi?</h4>
        <p class="text-gray-700 mt-1">Sabit bir bilet ücreti genellikle yoktur. Ancak vakfın devamlılığı için girişteki kutulara gönlünüzden kopan bir bağış bırakmak güzel bir jesttir.</p>
    </div>

    <div>
        <h4 class="font-bold text-gray-900 text-lg">Çocukla gidilir mi?</h4>
        <p class="text-gray-700 mt-1">Evet gidilebilir ama çocuğunuza buranın bir oyun alanı değil, bir "açık hava kütüphanesi" olduğunu önceden anlatmanızda fayda var. Sessizlik kuralı herkes için geçerli.</p>
    </div>

    <div>
        <h4 class="font-bold text-gray-900 text-lg">Şirince''ye ne kadar uzaklıkta?</h4>
        <p class="text-gray-700 mt-1">Şirince merkezden sadece 1 km kadar yukarıda. Yürüyerek 15-20 dakikada rahatça ulaşabilirsiniz.</p>
    </div>
</div>'
WHERE slug = 'nesin-matematik-koyu-ziyaret-rehberi-sirince';

-- 2. Fix St John Links
UPDATE public.articles
SET content = REPLACE(content, '/blog/izmirden-sirinceye-arabasiz-ulasim-izban-selcuk-dolmus', '/rehber/izmirden-sirinceye-arabasiz-ulasim-izban-selcuk-dolmus')
WHERE slug = 'sirince-st-john-kilisesi-dilek-havuzu-cirkince-efsane';

UPDATE public.articles
SET content = REPLACE(content, '/blog/sirince-sarap-rehberi-meyve-sarabi-uzum', '/rehber/sirince-sarap-rehberi-meyve-sarabi-uzum')
WHERE slug = 'sirince-st-john-kilisesi-dilek-havuzu-cirkince-efsane';

-- Remove dead link from St John
UPDATE public.articles
SET content = REPLACE(content, '<li><a href="/blog/sirince-sokak-lezzetleri-rehberi" class="text-blue-600 hover:underline">Şirince Sokak Lezzetleri Rehberi</a></li>', '')
WHERE slug = 'sirince-st-john-kilisesi-dilek-havuzu-cirkince-efsane';


-- 3. Fix Budget Links
UPDATE public.articles
SET content = REPLACE(content, '/blog/izmirden-sirinceye-arabasiz-ulasim-izban-selcuk-dolmus', '/rehber/izmirden-sirinceye-arabasiz-ulasim-izban-selcuk-dolmus')
WHERE slug = 'sirince-pahali-mi-butce-rehberi-2025';

UPDATE public.articles
SET content = REPLACE(content, '/blog/sirince-sarap-rehberi-meyve-sarabi-uzum', '/rehber/sirince-sarap-rehberi-meyve-sarabi-uzum')
WHERE slug = 'sirince-pahali-mi-butce-rehberi-2025';

UPDATE public.articles
SET content = REPLACE(content, '/blog/efes-sirince-ayni-gun-rota', '/rehber/efes-sirince-ayni-gun-rota')
WHERE slug = 'sirince-pahali-mi-butce-rehberi-2025';


-- 4. Fix Efes Links
UPDATE public.articles
SET content = REPLACE(content, '/blog/izmirden-sirinceye-arabasiz-ulasim-izban-selcuk-dolmus', '/rehber/izmirden-sirinceye-arabasiz-ulasim-izban-selcuk-dolmus')
WHERE slug = 'efes-sirince-ayni-gun-rota';

UPDATE public.articles
SET content = REPLACE(content, '/blog/nesin-matematik-koyu-ziyaret-rehberi-sirince', '/rehber/nesin-matematik-koyu-ziyaret-rehberi-sirince')
WHERE slug = 'efes-sirince-ayni-gun-rota';

-- Remove dead link from Efes
UPDATE public.articles
SET content = REPLACE(content, '<li><a href="/blog/sirince-sokak-lezzetleri-rehberi" class="text-blue-600 hover:underline">Şirince Sokak Lezzetleri Rehberi</a></li>', '')
WHERE slug = 'efes-sirince-ayni-gun-rota';
