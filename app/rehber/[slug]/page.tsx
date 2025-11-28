import { db } from '@/lib/db';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Calendar, Clock } from 'lucide-react';
import { getLocalizedText } from '@/lib/localization';

type Props = { params: { slug: string } };

export const revalidate = 3600;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const article = await db.articles.getBySlug(params.slug);
  if (!article) {
    return {
      title: 'Yazı Bulunamadı | GNK',
      description: 'Aradığınız rehber yazısı sistemimizde mevcut değil.',
    };
  }

  return {
    title: `${getLocalizedText(article.title)} | GNK Rehber`,
    description: getLocalizedText(article.meta_description),
  };
}

export default async function ArticlePage({ params }: Props) {
  const article = await db.articles.getBySlug(params.slug);

  if (!article) {
    notFound();
  }

  const publishedDate = new Date(article.published_at).toLocaleDateString('tr-TR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link
          href="/rehber"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-12 font-medium transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Tüm Rehberlere Dön
        </Link>

        <article>
          <header className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-xs font-medium uppercase tracking-wide text-zinc-400">
                {getLocalizedText(article.location)}
              </span>
              <span className="text-zinc-300">•</span>
              <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                <Calendar className="w-3 h-3" />
                <time dateTime={article.published_at}>{publishedDate}</time>
              </div>
              <span className="text-zinc-300">•</span>
              <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                <Clock className="w-3 h-3" />
                <span>8 DK OKUMA</span>
              </div>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-zinc-900 mb-8 leading-tight tracking-tight">
              {getLocalizedText(article.title)}
            </h1>

            <p className="text-lg text-zinc-600 leading-relaxed">
              {getLocalizedText(article.meta_description)}
            </p>
          </header>

          <div className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden mb-16">
            <Image
              src={article.cover_image_url || 'https://placehold.co/1200x675/e5e5e5/666666?text=GNK'}
              alt={getLocalizedText(article.title)}
              fill
              sizes="100vw"
              className="object-cover"
              priority
            />
          </div>

          <div className="max-w-3xl mx-auto">
            <div
              className="prose prose-lg prose-zinc
                prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-zinc-900
                prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-6
                prose-h3:text-2xl prose-h3:mt-10 prose-h3:mb-4
                prose-p:text-zinc-700 prose-p:leading-relaxed prose-p:mb-6
                prose-a:text-foreground prose-a:font-medium prose-a:no-underline hover:prose-a:underline prose-a:decoration-2 prose-a:underline-offset-4
                prose-strong:text-zinc-900 prose-strong:font-semibold
                prose-img:rounded-xl prose-img:my-10
                prose-blockquote:border-l-4 prose-blockquote:border-zinc-900 prose-blockquote:bg-zinc-50 prose-blockquote:p-6 prose-blockquote:not-italic prose-blockquote:my-8
                prose-ul:my-6 prose-li:my-2 prose-li:text-zinc-700
                max-w-none"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />
          </div>

          <div className="mt-20 pt-12 border-t border-zinc-200">
            <div className="max-w-3xl mx-auto text-center">
              <h3 className="text-2xl font-bold text-foreground mb-4">
                Bu rehber işinize yaradı mı?
              </h3>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                {getLocalizedText(article.location)} bölgesindeki daha fazla gizli cenneti keşfetmek için diğer rehberlerimize göz atın.
              </p>
              <Link
                href="/rehber"
                className="inline-flex items-center gap-2 bg-foreground hover:bg-zinc-800 text-background px-8 py-3 rounded-full font-semibold transition-colors"
              >
                Tüm Rehberleri Keşfet
              </Link>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}
