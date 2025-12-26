-- Migration: Add "Şirince Pahalı mı? 2025 İçin Gerçekçi Bütçe Rehberi" Article

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
    'Şirince Pahalı mı? 2025 İçin Gerçekçi Bütçe Rehberi (Otopark, Yemek ve Para Tüyoları)',
    'sirince-pahali-mi-butce-rehberi-2025',
    '<h1>Şirince Pahalı mı? 2025 İçin Gerçekçi Bütçe Rehberi</h1>

<p>“Şirince çok pahalı” cümlesini muhtemelen sen de duydun. Ama aynı köyde, cebini zorlamadan gezip dönen insanlar da var. Bu fark tesadüf değil. Şirince’de bütçeyi belirleyen şey nerede durduğun, neyi seçtiğin ve neyi es geçtiğin.</p>

<p>Bu rehberde, Şirince’yi 2025’te gezerken gerçekten nerelerde para harcandığını, nerelerde kısmak mümkün olduğunu ve sürpriz hesaplardan nasıl kaçınacağını kalem kalem anlatıyorum.</p>

<div class="my-8">
    <img src="/images/blog/sirince-street-walking.png" alt="Şirince Sokaklarında Gezi" class="w-full h-auto rounded-lg shadow-md" />
</div>

<h2>Şirince’de ilk para nereye gider?</h2>
<p>Şirince, İzmir’in Selçuk ilçesine bağlı, araç trafiği büyük ölçüde kısıtlı bir köy. Bu yüzden masraf listesi genelde şu sırayla başlar:</p>
<ul class="list-disc pl-6 space-y-2 mt-2">
    <li>Otopark</li>
    <li>Kahvaltı / öğle yemeği</li>
    <li>Hediyelik & içecekler</li>
    <li>Küçük ama can sıkan ekler (servis, paket, katkı payı)</li>
</ul>

<h2>1) Şirince’de otopark ücretleri nasıl işliyor?</h2>
<p>Kendi aracınla geliyorsan ilk temas noktan otopark. Köy merkezine araç girişi çoğu zaman kısıtlı olduğu için, girişte ve çevrede belediyeye veya özel işletmelere ait otopark alanları bulunur.</p>

<div class="bg-yellow-50 p-4 border-l-4 border-yellow-400 my-4">
    <h4 class="font-bold text-yellow-800 mb-2">Bilmen gereken kritik detay:</h4>
    <ul class="list-disc pl-5 text-sm text-yellow-700">
        <li>Ücretlendirme genelde saatlik değil, günlük sabit olur.</li>
        <li>30 dakika da kalsan, 6 saat de kalsan çoğu zaman aynı ücret alınır.</li>
        <li>Fiyatlar sezona ve yoğunluğa göre değişebilir, gitmeden önce tabelayı kontrol etmek en güvenlisidir.</li>
    </ul>
</div>

<p class="text-sm text-gray-600 mt-2">Kısa ama önemli uyarı: Aracı yol kenarına “biraz aşağıya” bırakıp yürümek kulağa mantıklı gelse de; yol dar, eğim serttir. Ayrıca hatalı parklar için ceza riski vardır. Otopark bedeli, çoğu zaman bu riske göre daha ekonomiktir.</p>

<h2>2) Şirince’de kahvaltı neden pahalı görünüyor?</h2>
<p>Bütçe algısının en çok bozulduğu yer burası: <strong>Manzara = fiyat farkı.</strong></p>
<p>Köyün üst kesimlerinde, vadiye bakan teraslı mekanlarda fiyatlar doğal olarak yükselir. Yediğin ürün aynı üründür; ödediğin fark manzara ve konum içindir.</p>

<div class="my-6">
    <img src="/images/blog/sirince-terrace-breakfast.png" alt="Şirince Manzaralı Teras Kahvaltısı" class="w-full h-auto rounded-lg shadow-md" />
</div>

<ul class="list-disc pl-6 space-y-2 mt-2">
    <li>“Fotoğraf olsun yeter” diyorsan → <strong>teras</strong></li>
    <li>“Karnım doysun” diyorsan → <strong>köy içi ara sokaklar</strong> (çok daha dengelidir).</li>
</ul>

<h3 class="font-bold text-gray-800 mt-4">Serpme kahvaltı meselesi</h3>
<p>Serpme kahvaltı genelde kişi başı ücretlendirilir ve masaya gelenlerin önemli kısmı bitmeden kalır. Hesap, beklentinin üstüne çıkabilir.</p>

<div class="bg-green-50 p-4 rounded mt-4">
    <h4 class="font-bold text-green-800 mb-2">Bütçe dostu alternatifler:</h4>
    <ul class="list-disc pl-5 text-sm text-green-700">
        <li>Gözleme + ayran</li>
        <li>Menemen + söğüş</li>
        <li>Çay eşliğinde sade kahvaltı tabağı</li>
    </ul>
    <p class="text-xs mt-2 italic">Hem yerel tadım yaparsın hem israf etmezsin.</p>
</div>

<div class="my-6">
    <img src="/images/blog/sirince-village-cafe.png" alt="Köy Kahvesi Çay Keyfi" class="w-full h-auto rounded-lg shadow-md" />
</div>

<h2>3) Öğle & akşam yemeği: Nerede pahalı, nerede dengeli?</h2>
<p>Şirince’de yemek seçenekleri uçtan uca değişir.</p>
<ul class="list-disc pl-6 space-y-2">
    <li><strong>Köyün üst noktalarındaki şık restoranlar:</strong> Büyükşehir fiyatlarına yakın olabilir.</li>
    <li><strong>Meydan çevresi ve ara sokaklardaki esnaf lokantaları:</strong> Daha makul.</li>
</ul>

<p class="mt-4"><strong>Dikkat edilmesi gereken detaylar:</strong> Bazı turistik restoranlarda servis ücreti / kuver eklenebilir. Oran ve uygulama işletmeye göre değişir, menünün altını okumak sürprizi önler.</p>

<h2>4) Şirince’de şarap pahalı mı?</h2>
<p>Şirince, şarapla anılan bir yer ama fiyatlar çoğu zaman abartıldığı kadar uçuk değildir. Mahzenlerdeki şaraplar genelde şehir fiyatlarının bir tık üstünde olabilir.</p>
<p><strong>Avantajı:</strong> Tadım imkânı sunulması. Beğenmeden almak zorunda kalmazsın; bu da aslında bütçeyi koruyan bir detaydır.</p>

<h2>5) Hediyelik eşyada fiyat neden değişiyor?</h2>
<p>Şirince çarşısında yazılı olmayan bir kural vardır: <strong>Girişe yakın olan pahalı, yukarı doğru çıktıkça yumuşar.</strong></p>
<p>Girişteki dükkanlar daha yüksek kira öder ve en çok turist oradan geçer; fiyatlar buna göre ayarlanır.</p>

<div class="my-6">
    <img src="/images/blog/sirince-souvenir-shop.png" alt="Şirince Hediyelik Eşya ve Sabunlar" class="w-full h-auto rounded-lg shadow-md" />
</div>

<p>Ara sokaklara girip kiliseye çıkan yollara saptığında sabun, magnet, bileklik gibi aynı ürünleri daha uygun görmek mümkündür.</p>

<div class="bg-blue-50 p-4 rounded mt-4">
    <h4 class="font-bold text-blue-800 mb-2">Paket alım taktiği:</h4>
    <p class="text-sm">Tek tek almak yerine “3 tane alırsam?”, “Set yapsak?” demek çoğu zaman birim fiyatı ciddi düşürür.</p>
</div>

<h2>6) Nakit mi kart mı? (Ciddi konu)</h2>
<p>Şirince’de her yerde kart geçer varsayımı risklidir. Küçük tezgâhlar ve köylü kadınlar çoğu zaman POS kullanmaz. IBAN olabilir ama internet her zaman çekmeyebilir. ATM sayısı sınırlıdır, yoğunlukta sorun yaşanabilir.</p>
<p><strong>En güvenlisi:</strong> Selçuk merkezden bir miktar nakit çekip gelmek. Bozuk para da iş görür.</p>

<h2>7) Müze ve ziyaret noktaları ücretli mi?</h2>
<p>Şirince’de bazı yapılar dönemsel olarak sembolik giriş ücreti veya bağış katkısı isteyebilir. Bu durum işletmeye, etkinliğe ve döneme göre değişebilir. Kapıda sormak her zaman en doğru yoldur.</p>

<hr class="my-8" />

<div class="bg-gray-50 p-6 rounded-lg my-8">
    <h3 class="font-bold text-gray-800 mb-4">Sonuç: Şirince pahalı mı?</h3>
    <p class="font-bold text-lg text-gray-900 mb-2">Kısa cevap: Hayır.</p>
    <p class="text-gray-700">Uzun cevap: Şirince pahalı değil, pahalı seçenekleri olan bir köy. Manzaraya para verirsen pahalı, serpme kahvaltıya girersen pahalı, girişteki ilk dükkânda alırsan pahalı. Ama bilinçli gezersen ortalama bir hafta sonu bütçesiyle dolu dolu gezip dönersin.</p>
    <p class="mt-4 italic text-gray-600">Şirince herkese aynı faturayı kesmez. Seçimi sen yaparsın.</p>
</div>

<div class="bg-blue-50 p-6 rounded-lg my-8">
    <h3 class="font-bold text-gray-800 mb-4">İlgili Diğer Rehberler</h3>
    <ul class="space-y-2 text-sm">
        <li><a href="/rehber/izmirden-sirinceye-arabasiz-ulasim-izban-selcuk-dolmus" class="text-blue-600 hover:underline">İzmir’den Şirince’ye Arabasız Ulaşım: İZBAN, Selçuk Dolmuşları</a></li>
        <li><a href="/rehber/sirince-sarap-rehberi-meyve-sarabi-uzum" class="text-blue-600 hover:underline">Şirince Şarap Rehberi: Meyve Şarabı mı, Gerçek Üzüm Mü?</a></li>
        <li><a href="/rehber/efes-sirince-ayni-gun-rota" class="text-blue-600 hover:underline">Efes ve Şirince Aynı Günde Nasıl Gezilir?</a></li>
    </ul>
</div>

<h3>Sıkça Sorulan Sorular</h3>
<div class="space-y-6" itemscope itemtype="https://schema.org/FAQPage">
    <div itemscope itemprop="mainEntity" itemtype="https://schema.org/Question">
        <h4 itemprop="name" class="font-bold text-gray-900 text-lg">Şirince’de otopark ücretsiz mi?</h4>
        <div itemscope itemprop="acceptedAnswer" itemtype="https://schema.org/Answer">
            <p itemprop="text" class="text-gray-700 mt-1">Hayır, genelde ücretlidir. Köy girişinde ve çevresinde ücretli otopark alanları bulunur; ücretlendirme genelde günlük sabittir.</p>
        </div>
    </div>
    
    <div itemscope itemprop="mainEntity" itemtype="https://schema.org/Question">
        <h4 itemprop="name" class="font-bold text-gray-900 text-lg">Şirince’de kahvaltı ne kadar?</h4>
        <div itemscope itemprop="acceptedAnswer" itemtype="https://schema.org/Answer">
            <p itemprop="text" class="text-gray-700 mt-1">Fiyatlar manzaraya göre çok değişir. Teraslı mekanlarda serpme kahvaltı daha pahalıdır; köy içindeki gözlemeciler ise çok daha ekonomiktir.</p>
        </div>
    </div>

    <div itemscope itemprop="mainEntity" itemtype="https://schema.org/Question">
        <h4 itemprop="name" class="font-bold text-gray-900 text-lg">Şirince pahalı mı?</h4>
        <div itemscope itemprop="acceptedAnswer" itemtype="https://schema.org/Answer">
            <p itemprop="text" class="text-gray-700 mt-1">Seçimlerinize bağlıdır. Turistik ana caddede ve manzaralı yerlerde fiyatlar yüksektir; ancak ara sokaklarda ve esnaf lokantalarında makul fiyatlarla gezmek mümkündür.</p>
        </div>
    </div>
</div>',
    '/images/blog/sirince-street-walking.png',
    'İzmir / Selçuk / Şirince',
    'Şirince pahalı mı? 2025 için otopark, kahvaltı, yemek ve ödeme detaylarıyla Şirince’de bütçe dostu gezmenin net rehberi.',
    TRUE,
    CURRENT_TIMESTAMP + INTERVAL '1 hour',
    now(),
    now()
);
