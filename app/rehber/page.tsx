import { db } from '@/lib/db';
import Link from 'next/link';
import Image from 'next/image';
import { Clock, ArrowRight } from 'lucide-react';
import { getLocalizedText } from '@/lib/localization';

export const revalidate = 3600;

export default async function GuidePage() {
  const articles = await db.articles.getAllByLocation('Fethiye');

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 tracking-tight">
            GNK Keşif Rehberi
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
            Fethiye'nin saklı koyları, gurme durakları ve yerel tüyolar.
          </p>
          <div className="mt-8 h-px w-24 bg-border mx-auto" />
        </div>

        {articles.length === 0 ? (
          <div className="text-center py-20">
            <div className="max-w-md mx-auto">
              <h3 className="text-2xl font-semibold text-foreground mb-3">Henüz Rehber Yazısı Yok</h3>
              <p className="text-muted-foreground">Yakında harika rehberlerle burada olacağız.</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
            {articles.map((article: any) => (
              <Link
                href={`/rehber/${article.slug}`}
                key={article.id}
                className="group block"
              >
                <article className="h-full flex flex-col">
                  <div className="relative overflow-hidden aspect-[4/3] rounded-xl mb-4">
                    <Image
                      src={article.cover_image_url || 'https://placehold.co/800x600/e5e5e5/666666?text=GNK'}
                      alt={getLocalizedText(article.title)}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                  </div>

                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-xs font-medium uppercase tracking-wide text-zinc-400">
                      {getLocalizedText(article.location) || 'Fethiye'}
                    </span>
                    <span className="text-zinc-300">•</span>
                    <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                      <Clock className="w-3 h-3" />
                      <span>8 DK OKUMA</span>
                    </div>
                  </div>

                  <h2 className="text-xl font-bold text-foreground mb-2 line-clamp-2 group-hover:underline decoration-2 underline-offset-4 leading-tight tracking-tight">
                    {getLocalizedText(article.title)}
                  </h2>

                  <p className="text-sm text-zinc-500 line-clamp-3 leading-relaxed flex-grow">
                    {getLocalizedText(article.meta_description)}
                  </p>

                  <div className="mt-4 flex items-center gap-2 text-foreground">
                    <span className="text-sm font-medium">Oku</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
