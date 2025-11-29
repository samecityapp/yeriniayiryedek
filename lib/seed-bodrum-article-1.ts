import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const article = {
  title: { tr: "Bodrum Tekne Turu Rehberi 2025: Orak Adası mı, Korsan Teknesi mi?" },
  slug: "bodrum-tekne-turu-mavi-yolculuk-rehberi",
  location: "Bodrum",
  cover_image_url: "https://images.unsplash.com/photo-1504519626318-2e26f2a91f6b?q=80&w=1000&auto=format&fit=crop",
  meta_description: "Bodrum'u karadan gezmek yetmez! Turkuazın en parlak tonu Orak Adası, akvaryum gibi koylar ve 'Tirhandil' deneyimi. Hangi tekne size göre?",
  published_at: new Date().toISOString(),
  is_published: true,
  content: { tr: `
    <div class="space-y-12">
      <div class="cove-card bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-8 border border-blue-100">
        <h2 class="text-3xl font-bold text-gray-900 mb-4">Bodrum'u Denizden Görmediyseniz, Görmediniz Demektir</h2>
        <p class="text-lg leading-relaxed text-gray-700">Bodrum'a gelip, otelden çıkıp sadece beach club'larda vakit geçirdiyseniz, üzgünüz ama Bodrum'u yarım yamalak yaşadınız demektir. Bodrum'un asıl rengi, karadan ulaşımın olmadığı o gizli koylardaki <strong>turkuazdır</strong>.</p>
      </div>

      <img src="https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80" alt="Bodrum turkuaz deniz ve tekne turu" class="w-full rounded-xl shadow-md my-6" />

      <div class="prose-section">
        <p class="text-lg leading-relaxed">Ama limana indiğinizde kafanız karışacak. Yan yana dizilmiş yüzlerce tekne, elinde broşürle sizi çağıran hanutçular... "Korsan teknesi mi?", "Sakin aile teknesi mi?", "Yoksa özel tirhandil mi?" Bu rehberde size turistik broşür ağzıyla değil, bir Bodrumlu gibi tüm gerçekleri anlatıyoruz.</p>
      </div>

      <hr class="my-8 border-zinc-200" />

      <div class="prose-section">
        <h3 class="text-2xl font-semibold text-gray-900 mb-4">1. Hangi Tekne Tipi Sizin İçin Uygun? (Karar Anı)</h3>
        <p class="text-lg leading-relaxed">Her tekne turu herkese göre değildir. Yanlış tekneye binerseniz, kafa dinlemeye gittiğiniz yerde son ses müzik ile günü bitirebilirsiniz.</p>

        <h4 class="text-xl font-semibold text-gray-800 mb-3 mt-6">A. Günübirlik "Parti" Tekneleri (Korsan Konseptli)</h4>
        <p class="text-lg leading-relaxed"><strong>Kimler İçin:</strong> "Ben eğlenmeye geldim, köpük partisi istiyorum, müzik hiç susmasın" diyenler için.<br><strong>Ne Beklemeli:</strong> Çift katlı, kaydıraklı büyük tekneler. 50-100 kişi olabilir. Müzik sabah başlar, akşam biter.<br><strong>Fiyat:</strong> En ekonomik seçenektir. Öğle yemeği dahildir.</p>

        <h4 class="text-xl font-semibold text-gray-800 mb-3 mt-6">B. "Sessiz/Aile" Tekneleri (Guletler)</h4>
        <p class="text-lg leading-relaxed"><strong>Kimler İçin:</strong> "Müzik olmasın, sadece rüzgar ve dalga sesi olsun, kitabımı okuyayım" diyen çiftler ve çocuklu aileler.<br><strong>GNK Tüyosu:</strong> Bilet alırken mutlaka "Müziksiz tur mu?" diye sorun.</p>

        <h4 class="text-xl font-semibold text-gray-800 mb-3 mt-6">C. Özel Tirhandil Kiralama (VIP Deneyim)</h4>
        <p class="text-lg leading-relaxed"><strong>Kimler İçin:</strong> Bütçesi uygun olanlar ve mahremiyet isteyenler.<br><strong>Nedir:</strong> Bodrum'a özgü, her iki ucu sivri ahşap teknelerdir. Rotayı kaptanla siz belirlersiniz. İstediğiniz yerde denize girer, istediğiniz saatte yemek yersiniz.</p>
      </div>

      <img src="https://images.unsplash.com/photo-1621262692264-c36195208630?auto=format&fit=crop&w=1200&q=80" alt="Bodrum özel tekne kiralama ve tirhandil" class="w-full rounded-xl shadow-md my-6" />

      <hr class="my-8 border-zinc-200" />

      <div class="prose-section">
        <h3 class="text-2xl font-semibold text-gray-900 mb-4">2. Efsanevi Rotalar: Nereye Gidiyoruz?</h3>

        <h4 class="text-xl font-semibold text-gray-800 mb-3 mt-6">Orak Adası: Türkiye'nin Maldivleri</h4>
        <p class="text-lg leading-relaxed">Abartmıyoruz, burası Instagram filtrelerine ihtiyaç duymayan nadir yerlerden. Denizin rengi fosforlu, açık bir turkuaza döner. Dibi beyaz kum ve taş olduğu için suyun rengi gerçeküstü görünür. <strong>Dikkat:</strong> Burası bir ada ve üzerinde tesis yoktur.</p>

        <h4 class="text-xl font-semibold text-gray-800 mb-3 mt-6">Akvaryum Koyu</h4>
        <p class="text-lg leading-relaxed">Bitez ile Gümbet arasındaki burunda saklıdır. Adı üzerinde; denize gözlüksüz bilseniz bile altınızdaki yüzlerce balığı görebilirsiniz. <strong>İpucu:</strong> Yanınızda biraz ekmek götürürseniz, balıklar elinizden yemek yer.</p>

        <h4 class="text-xl font-semibold text-gray-800 mb-3 mt-6">Karaada (Meteor Çukuru)</h4>
        <p class="text-lg leading-relaxed">Bodrum Kalesi'nin tam karşısındaki o büyük ada. Efsaneye göre buraya bir meteor düşmüş. Deniz aniden derinleşir ve rengi koyu laciverte döner. Adada kükürtlü sıcak su çıkan bir mağara vardır.</p>
      </div>

      <hr class="my-8 border-zinc-200" />

      <div class="prose-section">
        <h3 class="text-2xl font-semibold text-gray-900 mb-4">3. Yanınıza Almanız Gereken "Hayat Kurtarıcı" Çanta</h3>
        <ul class="list-disc pl-5 space-y-2 text-lg">
          <li><strong>Nakit Para:</strong> Teknede ekstra içecekler veya dondurma için pos cihazı çekmeyebilir.</li>
          <li><strong>Deniz Ayakkabısı:</strong> Bazı koylar (özellikle Poyraz Limanı) taşlık olabilir.</li>
          <li><strong>Yedek Mayo:</strong> Islak mayoyla rüzgarda kalmak hasta edebilir.</li>
          <li><strong>Güneş Kremi & Şapka:</strong> Denizde güneş karadakinden 2 kat daha fazla yakar (yansıma etkisi).</li>
        </ul>
      </div>

      <div class="bg-zinc-100 p-6 rounded-xl border-l-4 border-zinc-900 my-8">
        <p class="text-lg"><strong>Sıkça Sorulan Soru:</strong> "Deniz tutmasına karşı ne yapmalı?"<br>
        Cevap: Teknenin en az sallanan yeri <strong>arka alt kısımdır</strong> (Kıç havuzluk). Üst kata çıkmayın, ufuk çizgisine bakın. Sabah binmeden yarım saat önce bulantı hapı alabilirsiniz.</p>
      </div>

      <div class="prose-section">
        <p class="text-lg leading-relaxed">Bodrum'u denizden keşfetmek, tatilinizin en unutulmaz günü olacak. Dönüş yolunda gün batımını izlerken bize teşekkür edeceksiniz.</p>

        <p class="text-lg leading-relaxed mt-6">Bodrum'daki en iyi otelleri incelemek için <a href="/search?q=bodrum" class="text-blue-600 font-semibold hover:underline">buraya tıklayın</a>.</p>
      </div>
    </div>
  ` }
};

async function seedBodrumArticle1() {
  console.log('⛵️ Bodrum Makale 1 (Fotoğraflı) yükleniyor...');
  const { error } = await supabase.from('articles').upsert(article, { onConflict: 'slug' });
  if (error) console.error('Hata:', error.message);
  else console.log('✅ Başarıyla eklendi!');
}

seedBodrumArticle1();
