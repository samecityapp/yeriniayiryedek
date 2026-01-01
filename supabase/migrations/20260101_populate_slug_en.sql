-- Migration to populate slug_en for existing articles

-- Fethiye Articles (from mockArticles)
UPDATE articles SET slug_en = 'fethiye-for-families-with-kids' WHERE slug = 'cocuklu-aileler-icin-fethiye';
UPDATE articles SET slug_en = 'best-time-to-visit-fethiye-month-by-month' WHERE slug = 'fethiye-ne-zaman-gidilir-ay-ay-analiz';
UPDATE articles SET slug_en = 'where-to-stay-in-fethiye-area-guide' WHERE slug = 'fethiye-nerede-kalinir-bolge-rehberi';
UPDATE articles SET slug_en = 'fethiye-hidden-bays-boat-route' WHERE slug = 'fethiye-gizli-koylar-tekne-rotasi';
UPDATE articles SET slug_en = 'lycian-way-fethiye-daily-trekking-routes' WHERE slug = 'likya-yolu-fethiye-günübirlik-rotalar';
UPDATE articles SET slug_en = 'fethiye-faralya-kabak-valley-guide' WHERE slug = 'fethiye-faralya-kabak-koyu-rehberi';
UPDATE articles SET slug_en = 'fethiye-babadag-paragliding-guide' WHERE slug = 'fethiye-babadag-yamac-parasutu-rehberi';

-- Sapanca Articles
UPDATE articles SET slug_en = 'sapanca-best-breakfast-places-guide' WHERE slug = 'sapanca-kahvalti-mekanlari-rehberi';
UPDATE articles SET slug_en = 'sapanca-kirkpinar-travel-guide' WHERE slug = 'sapanca-kirkpinar-gezi-rehberi';
UPDATE articles SET slug_en = 'sapanca-lake-walking-and-cycling-routes' WHERE slug = 'sapanca-gol-kenari-yuruyus-bisiklet';

-- Bodrum Articles
UPDATE articles SET slug_en = 'bodrum-boat-trip-blue-cruise-guide' WHERE slug = 'bodrum-tekne-turu-mavi-yolculuk-rehberi';
UPDATE articles SET slug_en = 'bodrum-best-beaches-and-bays-guide' WHERE slug = 'bodrum-en-iyi-plajlar-ve-koylar-rehberi';
UPDATE articles SET slug_en = 'bodrum-nightlife-entertainment-guide' WHERE slug = 'bodrum-gece-hayati-eglence-rehberi';

-- Recent Additions (Best Effort)
UPDATE articles SET slug_en = 'fethiye-car-free-holiday-guide' WHERE slug = 'fethiye-arabasiz-tatil-rehberi';
-- If Antalya articles exist with Turkish slugs
UPDATE articles SET slug_en = 'where-to-stay-in-antalya' WHERE slug = 'antalya-da-nerede-kalinir';
UPDATE articles SET slug_en = 'antalya-airport-to-city-centre' WHERE slug = 'antalya-havalimani-sehir-merkezi-ulasim';
