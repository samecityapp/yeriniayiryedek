-- Migration: Add "Efes Antik Kenti ve Şirince’yi Aynı Güne Sığdırma Rehberi" Article

INSERT INTO public.articles (
    id,
    title,
    slug,
    content,
    cover_image_url,
    location,
    meta_description,
    is_published,
    published_at,
    created_at,
    updated_at
)
VALUES (
    uuid_generate_v4(),
    'Efes Antik Kenti ve Şirince’yi Aynı Güne Sığdırma Rehberi: Zaman Yönetimi, Rota ve Ulaşım Tüyoları',
    'efes-sirince-ayni-gun-rota',
    '<h1>Efes Antik Kenti ve Şirince’yi Aynı Güne Sığdırma Rehberi</h1>

<p>İzmir’e kadar gelmişken Efes’i pas geçmek istemezsin, Şirince’yi de “başka sefere” bırakmak içini acıtır. İyi haber: Tek günle ikisini de yaparsın. Kötü haber: Rastgele gidersen günün yarısı sıcakta ve yolda eriyip gider.</p>

<p>Bu planın mantığı basit: <strong>Sabah Efes (serinlik + az kalabalık) → öğleden sonra Şirince (serin hava + yemek + gün batımı).</strong></p>

<div class="my-8">
    <img src="/images/blog/efes-celsus-library.png" alt="Efes Antik Kenti Celsus Kütüphanesi" class="w-full h-auto rounded-lg shadow-md" />
</div>

<h2>1) Altın Sıralama: Sabah Efes, Öğleden Sonra Şirince</h2>
<p>Efes açık alanda ve gölge az. Öğleye doğru hava ısındıkça yürüyüş zorlaşıyor. O yüzden Efes’i günün en erken enerjisiyle bitirip Şirince’yi “ödül” gibi saklamak, bu rotanın en çalışkan taktiği.</p>
<p><strong>Mini hedef:</strong> Efes’ten öğle olmadan çıkmak. (Günün hangi ayda olduğuna göre bu daha da kritikleşir.)</p>

<h2>2) Efes’i Daha Az Yorarak Gezmenin Püf Noktası: Kapı Seçimi</h2>
<p>Efes’te iki giriş-çıkış noktasıyla karşılaşırsın:</p>
<ul class="list-disc pl-6 space-y-2 mt-2">
    <li><strong>Üst Kapı (Magnesia / yukarı giriş)</strong></li>
    <li><strong>Alt Kapı (Liman Caddesi / aşağı çıkış)</strong></li>
</ul>
<p class="mt-2">Buradaki küçük “hile” şu: Yukarıdan girersen yürüyüşün daha akıcı olur; arazi eğimi nedeniyle rotayı daha rahat tamamlayabilirsin. Aşağıdan başlayıp yukarı tırmanmak ise günün enerjisini erken bitirebilir.</p>
<div class="bg-yellow-50 p-4 rounded border-l-4 border-yellow-400 mt-4">
    <p class="text-sm font-bold text-yellow-800">Not:</p>
    <p class="text-sm text-yellow-700 mt-1">Ulaşım düzeni/park/taksi planı bazen seni bir kapıya daha yakın bırakabilir. “Mutlaka şu kapı” diye diretmek yerine, yokuşu azaltacak yönde plan yapmak yeterli.</p>
</div>

<h2>3) Efes’te Zaman Yönetimi: “Gör–Çık–Bitir” Mantığı</h2>
<p>Tek güne iki yer sığdırıyorsun; Efes’te “her taşın başında 20 dakika” yaparsan Şirince’de gün batımını kaçırırsın.</p>

<h3 class="font-bold text-gray-800 mt-4">Efes için gerçekçi tempo:</h3>
<ul class="list-disc pl-6 space-y-2 mt-2">
    <li><strong>Klasik gezi süresi:</strong> 2–3 saat (fotoğraf, kısa molalar dahil)</li>
    <li><strong>Aşırı detaylı gezi:</strong> 4 saat+ (tek gün planında riskli)</li>
</ul>

<h3 class="font-bold text-gray-800 mt-4">Yanına al (hayat kurtarır):</h3>
<ul class="list-disc pl-6 space-y-2 mt-2">
    <li>Su (Efes’te su tüketimi çok artıyor)</li>
    <li>Şapka / güneş gözlüğü</li>
    <li>Rahat tabanlı ayakkabı (zemin taş/mermer; kayganlaşabilir)</li>
</ul>

<div class="bg-blue-50 p-4 rounded mt-4">
    <p class="text-sm text-blue-800">Bilet konusu: Bilet/kuyruk işi dönemsel olarak değişebilir. Müzekart sahibiysen zaman kazanırsın. Değilsen de “erken gitmek” en büyük avantajdır.</p>
</div>

<h2>4) Efes’ten Şirince’ye Geçiş: En Mantıklı 2 Yol</h2>
<p>Efes çıkışında “Şirince dolmuşu” aramak çoğu zaman boşuna. Sistem genelde Selçuk üzerinden akar.</p>

<h3 class="font-bold text-gray-800 mt-4">Seçenek A: En Ekonomik (Aktarmalı)</h3>
<ol class="list-decimal pl-6 space-y-2 mt-2">
    <li>Efes → Selçuk merkez/otogar (kısa bir dolmuş/servis hattı ya da yerel ulaşım)</li>
    <li>Selçuk → Şirince dolmuşu (köy minibüsleri)</li>
</ol>
<p class="mt-2 text-sm text-gray-600">Bu yol en bütçe dostu seçenek. Bekleme süreleri kalabalığa göre uzayıp kısalabilir; o yüzden “dakika dakika” değil, pay bırak.</p>

<h3 class="font-bold text-gray-800 mt-4">Seçenek B: En Pratik (Taksi)</h3>
<p>Zamanın sıkışıksa, sıcak bastırdıysa ya da 3–4 kişiysen taksi mantıklı hale gelir.</p>
<ul class="list-disc pl-6 space-y-2 mt-2">
    <li><strong>Artısı:</strong> Selçuk’ta aktarma kovalamazsın, direkt köy girişine çıkarsın.</li>
    <li><strong>Gerçekçi uyarı:</strong> Ücret; sezon, saat, yoğunluk ve kalkış noktasına göre değişebilir. En temiz yöntem: Binmeden önce “Şirince’ye yaklaşık ne tutar?” diye sor.</li>
</ul>

<div class="my-8">
    <img src="/images/blog/sirince-village-street.png" alt="Şirince Köyü Sokakları" class="w-full h-auto rounded-lg shadow-md" />
</div>

<h2>5) Şirince’de Öğleden Sonra Planı: “Yemek + Sokak + Tadım” Üçlüsü</h2>
<p>Efes yürüyüşünden sonra Şirince’de en doğru hamle şu: <strong>Önce yemek ve gölge, sonra sokaklar.</strong></p>

<h3 class="font-bold text-gray-800 mt-4">Yemek için strateji:</h3>
<ul class="list-disc pl-6 space-y-2 mt-2">
    <li>Kalabalığın en yoğun olduğu ilk hat yerine, 1–2 sokak içeri gir.</li>
    <li>Menüde “Ege usulü” hafif seçenekler (zeytinyağlılar, otlu tabaklar, gözleme tarzı) Efes yorgunluğuna iyi gelir.</li>
</ul>

<div class="my-6">
    <img src="/images/blog/sirince-aegean-food.png" alt="Şirince Ege Mutfağı" class="w-full h-auto rounded-lg shadow-md" />
</div>

<p><strong>Şirince ritüeli (abartısız):</strong> Kısa bir kahve molası (kumda pişirme tezgâhları sık görülür) ve dilersen şarap tadımı. (Her yerde aynı kalite değil; tadıp karar vermek en doğrusu).</p>

<h2>6) Günün Finali: Şirince’de Gün Batımı Noktası</h2>
<p>Günü “tamam” hissettiren şey, Şirince’de ışığın yumuşladığı saatler. Köyün üst kısımlarına doğru çıktıkça manzara açılır.</p>
<p><strong>En iyi zamanlama:</strong> Gün batımından önceki yumuşak ışık dönemi.</p>
<p><strong>Plan:</strong> Hediyelik/şarap/mini alışverişi çok uzatma; finali manzaraya bırak.</p>

<div class="my-8">
    <img src="/images/blog/sirince-sunset.png" alt="Şirince Gün Batımı Manzarası" class="w-full h-auto rounded-lg shadow-md" />
</div>

<div class="bg-gray-50 p-6 rounded-lg my-8">
    <h3 class="font-bold text-gray-800 mb-4">Özet Rota (Kopyala–Yapıştır Plan)</h3>
    <ul class="list-none space-y-2">
        <li>🕒 <strong>Sabah:</strong> Efes (serin saatlerde gir)</li>
        <li>☀️ <strong>Öğleye doğru:</strong> Efes’i bitir, Selçuk yönüne geç</li>
        <li>🍽️ <strong>Öğleden sonra:</strong> Şirince (yemek → sokaklar → kısa tadım)</li>
        <li>🌅 <strong>Akşamüstü:</strong> Manzara + gün batımı, sonra dönüş</li>
    </ul>
</div>

<div class="bg-blue-50 p-6 rounded-lg my-8">
    <h3 class="font-bold text-gray-800 mb-4">Antigravity Önerileri</h3>
    <ul class="space-y-2 text-sm">
        <li><a href="/rehber/izmirden-sirinceye-arabasiz-ulasim-izban-selcuk-dolmus" class="text-blue-600 hover:underline">İzmir’den Şirince’ye Arabasız Ulaşım: İZBAN, Selçuk Dolmuşları</a></li>
        <li><a href="/rehber/nesin-matematik-koyu-ziyaret-rehberi-sirince" class="text-blue-600 hover:underline">Nesin Matematik Köyü Ziyaretçi Rehberi (Vaktin kalırsa ek rota)</a></li>
    </ul>
</div>

<hr class="my-8" />

<h3>Sıkça Sorulan Sorular</h3>

<div class="space-y-6" itemscope itemtype="https://schema.org/FAQPage">
    <div itemscope itemprop="mainEntity" itemtype="https://schema.org/Question">
        <h4 itemprop="name" class="font-bold text-gray-900 text-lg">Efes Antik Kenti ve Şirince aynı günde gezilir mi?</h4>
        <div itemscope itemprop="acceptedAnswer" itemtype="https://schema.org/Answer">
            <p itemprop="text" class="text-gray-700 mt-1">Evet. Efes’i sabah serin saatlerde bitirip öğleden sonra Şirince’ye geçtiğinde tempo çok rahat olur.</p>
        </div>
    </div>
    
    <div itemscope itemprop="mainEntity" itemtype="https://schema.org/Question">
        <h4 itemprop="name" class="font-bold text-gray-900 text-lg">Efes’ten Şirince’ye direkt dolmuş var mı?</h4>
        <div itemscope itemprop="acceptedAnswer" itemtype="https://schema.org/Answer">
            <p itemprop="text" class="text-gray-700 mt-1">Genelde sistem Selçuk üzerinden işler. Efes’ten önce Selçuk’a, oradan Şirince dolmuşuna geçmek daha garantidir.</p>
        </div>
    </div>

    <div itemscope itemprop="mainEntity" itemtype="https://schema.org/Question">
        <h4 itemprop="name" class="font-bold text-gray-900 text-lg">Efes’te hangi kapıdan girilmeli?</h4>
        <div itemscope itemprop="acceptedAnswer" itemtype="https://schema.org/Answer">
            <p itemprop="text" class="text-gray-700 mt-1">Ulaşımına göre değişir ama genel hedef yokuşu azaltmaktır. Üstten girip aşağı doğru tamamlamak (Magnesia kapısından girip Liman Caddesi’nden çıkmak) çoğu kişi için daha konforlu olur.</p>
        </div>
    </div>

    <div itemscope itemprop="mainEntity" itemtype="https://schema.org/Question">
        <h4 itemprop="name" class="font-bold text-gray-900 text-lg">Şirince’de gün batımı için nereye çıkılır?</h4>
        <div itemscope itemprop="acceptedAnswer" itemtype="https://schema.org/Answer">
            <p itemprop="text" class="text-gray-700 mt-1">Köyün üst kısımlarındaki manzara alanları ve teraslar gün batımında daha keyifli olur; yürüyüşe uygun ayakkabı şarttır.</p>
        </div>
    </div>
</div>',
    '/images/blog/efes-celsus-library.png',
    'İzmir / Selçuk / Şirince',
    'Efes Antik Kenti ve Şirince aynı günde gezilir mi? Sabah Efes’i serin saatlerde bitirip öğleden sonra Şirince’ye çıkacağınız pratik rota, ulaşım ve zaman yönetimi rehberi.',
    TRUE,
    CURRENT_TIMESTAMP + INTERVAL '20 seconds',
    now(),
    now()
);
