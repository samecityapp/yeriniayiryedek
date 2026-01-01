-- 1. İngilizce içerikli makaleler (Slug zaten İngilizce, direkt kopyala)
-- "Where to Stay" serisi ve genel İngiltere rehberleri
UPDATE articles SET slug_en = slug WHERE slug IN (
  'where-to-stay-in-turkey-first-time-guide',
  'where-to-stay-in-istanbul-best-areas-guide',
  'where-to-stay-in-antalya-best-areas-guide',
  'where-to-stay-in-fethiye-best-areas-guide',
  'where-to-stay-in-bodrum-best-areas-guide',
  'where-to-stay-in-cappadocia-best-areas-guide',
  'best-time-to-visit-turkey',
  'is-turkey-safe-to-visit-uk-travel-checklist',
  'cash-or-card-in-turkey',
  'turkey-itinerary-7-days-first-time',
  'what-to-pack-for-turkey-holiday-list',
  'turkey-entry-requirements-uk-citizens',
  'how-to-get-around-istanbul-transport-guide',
  'antalya-airport-to-city-transfers-guide',
  'oludeniz-vs-calis-vs-fethiye-where-to-stay',
  'fethiye-itinerary-3-days-uk-friendly-plan',
  'fethiye-boat-trips-what-to-expect-guide',
  'fethiye-to-oludeniz-how-to-get-there-dolmus-bus-taxi',
  'oludeniz-blue-lagoon-visitor-guide',
  'dalaman-airport-to-oludeniz-transfers-guide',
  'fethiye-vs-bodrum-vs-marmaris-travel-comparison',
  'milas-bodrum-airport-to-bodrum-bus-shuttle-taxi',
  'bodrum-itinerary-3-days-uk-friendly-guide',
  'bodrum-castle-history-and-visitor-guide',
  'mausoleum-at-halicarnassus-bodrum-visitor-guide',
  'bodrum-vs-antalya-better-for-uk-travellers-guide',
  'antalya-airport-to-city-centre-transport-guide',
  'where-to-stay-in-antalya-best-areas-guide-uk',
  'antalya-itinerary-4-days-uk-friendly-guide'
) AND slug_en IS NULL;

-- 2. Türkçe içerikli makaleler için İngilizce Çeviriler (Slug Tr -> Slug En)
-- Fethiye
UPDATE articles SET slug_en = 'fethiye-car-free-holiday-guide-transport' WHERE slug = 'fethiyede-arabasiz-tatil-ulasim-dolmus-rehberi';
UPDATE articles SET slug_en = 'fethiye-for-families-with-kids-shallow-sea-guide' WHERE slug = 'cocuklu-aileler-icin-fethiye-sig-deniz-rehberi';
UPDATE articles SET slug_en = 'fethiye-nightlife-paspatur-or-kordon-guide' WHERE slug = 'fethiye-gece-hayati-paspatur-kordon-rehberi';
UPDATE articles SET slug_en = 'kayakoy-ghost-village-fethiye-guide' WHERE slug = 'fethiye-kayakoy-hayalet-koy-rehberi';

-- Şirince
UPDATE articles SET slug_en = 'sirince-wine-guide-fruit-wine-or-grape' WHERE slug = 'sirince-sarap-rehberi-meyve-sarabi-uzum';
UPDATE articles SET slug_en = 'izmir-to-sirince-transport-guide-car-free' WHERE slug = 'izmirden-sirinceye-arabasiz-ulasim-izban-selcuk-dolmus';
UPDATE articles SET slug_en = 'nesin-math-village-visitor-guide' WHERE slug = 'nesin-matematik-koyu-ziyaret-rehberi-sirince';
UPDATE articles SET slug_en = 'st-john-church-sirince-wishing-pool-guide' WHERE slug = 'sirince-st-john-kilisesi-dilek-havuzu-cirkince-efsane';
UPDATE articles SET slug_en = 'ephesus-and-sirince-same-day-trip-guide' WHERE slug = 'efes-sirince-ayni-gun-rota';
UPDATE articles SET slug_en = 'is-sirince-expensive-budget-guide-2025' WHERE slug = 'sirince-pahali-mi-butce-rehberi-2025';
UPDATE articles SET slug_en = 'camlik-steam-locomotive-museum-guide' WHERE slug = 'camlik-buharli-lokomotif-muzesi-rehberi-sirince';

-- Bodrum
UPDATE articles SET slug_en = 'bodrum-free-public-beaches-bays-guide' WHERE slug = 'bodrum-ucretsiz-halk-plajlari-koylar-rehberi';
UPDATE articles SET slug_en = 'bodrum-car-free-holiday-transport-guide' WHERE slug = 'bodrum-arabasiz-tatil-rehberi-ulasim-tuyolari';
UPDATE articles SET slug_en = 'where-to-stay-in-bodrum-neighborhood-guide' WHERE slug = 'bodrum-nerede-kalinir-yalikavak-turkbuku-merkez-rehberi';
UPDATE articles SET slug_en = 'bodrum-beach-club-guide-2025-prices' WHERE slug = 'bodrum-beach-club-rehberi-2025-giris-ucretleri-happy-hour-ortam-analizi';
UPDATE articles SET slug_en = 'bodrum-instagram-spots-bougainvillea-streets' WHERE slug = 'bodrum-instagramlik-yerler-begonvilli-sokaklar-fotograf-noktalari';
UPDATE articles SET slug_en = 'bodrum-orak-island-boat-trip-guide' WHERE slug = 'bodrum-orak-adasi-tekne-turu-hangi-tekne';
UPDATE articles SET slug_en = 'bodrum-local-food-guide-vegetable-doner' WHERE slug = 'bodrum-yerel-lezzetler-sebzeli-doner-bodrum-mantisi';
UPDATE articles SET slug_en = 'bodrum-yellow-summer-september-october-guide' WHERE slug = 'bodrum-sari-yaz-eylul-ekim-rehberi';

-- Sapanca
UPDATE articles SET slug_en = 'sapanca-bungalow-rental-safety-guide' WHERE slug = 'sapanca-bungalov-kiralama-guvenlik-sahte-hesap';
UPDATE articles SET slug_en = 'istanbul-to-sapanca-car-free-transport-guide' WHERE slug = 'sapanca-arabasiz-ulasim-rehberi-yht-otobus';
UPDATE articles SET slug_en = 'istanbul-to-sapanca-transport-guide-train-bus' WHERE slug = 'istanbuldan-sapancaya-arabasiz-ulasim-yht-otobus-tren';
UPDATE articles SET slug_en = 'sapanca-masukiye-day-trip-route' WHERE slug = 'sapanca-masukiye-gunubirlik-rota-kahvalti-selale-atv';
UPDATE articles SET slug_en = 'sapanca-adrenaline-atv-zipline-paintball-guide' WHERE slug = 'sapanca-atv-zipline-paintball-rehberi';
UPDATE articles SET slug_en = 'sapanca-for-families-parks-bike-paths' WHERE slug = 'cocuklu-aileler-icin-sapanca-puset-park-bisiklet';
UPDATE articles SET slug_en = 'shopping-in-sapanca-local-products-guide' WHERE slug = 'sapanca-yerel-alisveris-rehberi-bal-ayva-cerkez-peyniri';
UPDATE articles SET slug_en = 'trekking-in-sapanca-sogucak-plateau-guide' WHERE slug = 'sapanca-sogucak-yaylasi-kalabaliktan-kacis-trekking';
