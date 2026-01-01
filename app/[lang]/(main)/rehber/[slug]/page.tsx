import { db } from '@/lib/db';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Calendar, Clock } from 'lucide-react';
import { getLocalizedText } from '@/lib/localization';
import { getDictionary } from '@/lib/dictionary';
import { JsonLd } from '@/components/seo/JsonLd';
import { generateArticleSchema, generateBreadcrumbSchema } from '@/lib/schema-generator';
import { QuickSummary } from '@/components/blog/QuickSummary';
import { RelatedHotels } from '@/components/blog/RelatedHotels';
import { RelatedArticles } from '@/components/RelatedArticles';
import { LOCATIONS } from '@/lib/constants';
import { ArticleList } from '@/components/ArticleList';
import { getRandomAuthor } from '@/lib/authors';
import { BlogAuthor } from '@/components/blog/BlogAuthor';


type Props = { params: { slug: string; lang: 'tr' | 'en' } };

export const revalidate = 0;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const lang = params.lang || 'tr';
  const dict = await getDictionary(lang);
  const location = LOCATIONS.find(l => l.slug === params.slug);

  // If it's a location page
  if (location) {
    const locationDescription = dict.guide.locations[location.slug as keyof typeof dict.guide.locations] || location.description;
    const title = lang === 'tr'
      ? `${location.title} Gezi Rehberi - Gezilecek Yerler ve Öneriler`
      : `${location.title} Travel Guide - Places to Visit and Recommendations`;

    return {
      title: title,
      description: locationDescription,
      openGraph: {
        title: title,
        description: locationDescription,
        images: [location.image],
      },
      alternates: {
        canonical: `https://www.yeriniayir.com/${lang}/rehber/${params.slug}`,
        languages: {
          'tr': `https://www.yeriniayir.com/tr/rehber/${params.slug}`,
          'en': `https://www.yeriniayir.com/en/rehber/${params.slug}`,
        },
      }
    };
  }

  // If it's an article page
  const article = await db.articles.getBySlug(params.slug);
  if (!article) {
    return {
      title: 'Yazı Bulunamadı',
      description: 'Aradığınız rehber yazısı sistemimizde mevcut değil.',
    };
  }

  const title = getLocalizedText(article.title, lang);
  const description = getLocalizedText(article.meta_description, lang);
  const articleLocation = getLocalizedText(article.location, lang);

  // Determine slugs for both languages
  const slugTr = article.slug;
  const slugEn = (article as any).slug_en || article.slug; // Fallback if not set but DB should have it

  return {
    title: `${title}`,
    description: description,
    keywords: [title, articleLocation, 'rehber', 'gezi', 'otel', 'türkiye'],
    alternates: {
      canonical: lang === 'tr'
        ? `https://www.yeriniayir.com/tr/rehber/${slugTr}`
        : `https://www.yeriniayir.com/en/guide/${slugEn}`,
      languages: {
        'tr': `https://www.yeriniayir.com/tr/rehber/${slugTr}`,
        'en': `https://www.yeriniayir.com/en/guide/${slugEn}`,
      },
    },
    openGraph: {
      title: title,
      description: description,
      images: article.cover_image_url ? [article.cover_image_url] : [],
      type: 'article',
      publishedTime: article.published_at,
    },
    twitter: {
      card: 'summary_large_image',
      title: title,
      description: description,
      images: article.cover_image_url ? [article.cover_image_url] : [],
    },
  };
}

export default async function ArticlePage({ params }: Props) {
  const lang = params.lang || 'tr';
  const dict = await getDictionary(lang);
  const locationConstant = LOCATIONS.find(l => l.slug === params.slug);

  // --- LOCATION DETAIL PAGE LOGIC ---
  if (locationConstant) {
    const articles = await db.articles.getAllByLocation(locationConstant.title);
    const locationDescription = dict.guide.locations[locationConstant.slug as keyof typeof dict.guide.locations] || locationConstant.description;

    return (
      <div className="min-h-screen bg-background">
        {/* Hero Header for Location */}
        <div className="relative h-[40vh] md:h-[50vh] w-full overflow-hidden">
          <Image
            src={locationConstant.image}
            alt={locationConstant.title}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/50" />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 tracking-tight drop-shadow-lg">
              {locationConstant.title} {lang === 'tr' ? 'Rehberi' : 'Guide'}
            </h1>
            <p className="text-lg md:text-xl text-gray-200 max-w-2xl drop-shadow-md">
              {locationDescription}
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <Link
            href={`/${lang}/rehber`}
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 font-medium transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            {lang === 'tr' ? 'Tüm bölgelere dön' : 'Back to all regions'}
          </Link>

          <h2 className="text-2xl font-bold mb-8">{locationConstant.title} {lang === 'tr' ? 'Makaleleri' : 'Articles'}</h2>
          <ArticleList articles={articles} lang={lang} />
        </div>
      </div>
    );
  }

  // --- ARTICLE DETAIL PAGE LOGIC (Existing) ---
  const article = await db.articles.getBySlug(params.slug);

  if (!article) {
    notFound();
  }

  const publishedDate = new Date(article.published_at).toLocaleDateString(lang === 'tr' ? 'tr-TR' : 'en-GB', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.yeriniayir.com';
  const author = getRandomAuthor(article.slug);

  const articleSchema = generateArticleSchema({
    title: getLocalizedText(article.title, lang),
    description: getLocalizedText(article.meta_description, lang),
    content: getLocalizedText(article.content, lang),
    slug: article.slug,
    coverImage: article.cover_image_url,
    createdAt: article.created_at,
    updatedAt: article.updated_at,
    author: { name: author.name, image: author.image },
  });

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: lang === 'tr' ? 'Ana Sayfa' : 'Home', url: `${baseUrl}/${lang}` },
    { name: lang === 'tr' ? 'Rehber' : 'Guide', url: `${baseUrl}/${lang}/rehber` },
    { name: getLocalizedText(article.title, lang), url: `${baseUrl}/${lang}/rehber/${article.slug}` },
  ]);

  return (
    <>
      <JsonLd data={articleSchema} />
      <JsonLd data={breadcrumbSchema} />

      <div className="min-h-screen bg-background">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Link
            href={`/${lang}/rehber`}
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-12 font-medium transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            {lang === 'tr' ? 'Tüm Rehberlere Dön' : 'Back to All Guides'}
          </Link>

          <article>
            <header className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-xs font-medium uppercase tracking-wide text-zinc-400">
                  {getLocalizedText(article.location, lang)}
                </span>
                <span className="text-zinc-300">•</span>
                <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                  <Calendar className="w-3 h-3" />
                  <time dateTime={article.published_at}>{publishedDate}</time>
                </div>
                <span className="text-zinc-300">•</span>
                <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                  <Clock className="w-3 h-3" />
                  <span>{lang === 'tr' ? '8 DK OKUMA' : '8 MIN READ'}</span>
                </div>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-zinc-900 mb-8 leading-tight tracking-tight">
                {getLocalizedText(article.title, lang)}
              </h1>

              <p className="text-lg text-zinc-600 leading-relaxed">
                {getLocalizedText(article.meta_description, lang)}
              </p>
            </header>

            <div className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden mb-16">
              <Image
                src={article.cover_image_url || 'https://placehold.co/1200x675/e5e5e5/666666?text=Yerini+Ayir'}
                alt={getLocalizedText(article.title, lang)}
                fill
                sizes="100vw"
                className="object-cover"
                priority
              />
            </div>

            <div className="max-w-3xl mx-auto">
              <QuickSummary items={[
                `${getLocalizedText(article.location, lang)} ${lang === 'tr' ? 'bölgesinde gezilecek en iyi yerler' : 'best places to visit'}`,
                lang === 'tr' ? 'Yerel restoran ve kafe önerileri' : 'Local restaurant and cafe recommendations',
                lang === 'tr' ? 'Konaklama seçenekleri ve fiyat aralıkları' : 'Accommodation options and price ranges',
                lang === 'tr' ? 'Ulaşım bilgileri ve ipuçları' : 'Transportation info and tips',
              ]} />

              <div
                className="prose prose-base md:prose-lg lg:prose-xl prose-zinc dark:prose-invert
                mx-auto
                prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-zinc-900 
                prose-h2:text-2xl md:prose-h2:text-3xl prose-h2:mt-16 prose-h2:mb-6
                prose-h3:text-xl md:prose-h3:text-2xl prose-h3:mt-12 prose-h3:mb-4
                prose-p:text-zinc-700 prose-p:leading-loose prose-p:mb-8 prose-p:font-normal
                prose-a:text-primary prose-a:font-semibold prose-a:no-underline hover:prose-a:underline prose-a:transition-colors
                prose-strong:text-zinc-900 prose-strong:font-bold
                prose-img:rounded-2xl prose-img:shadow-xl prose-img:my-12 prose-img:w-full
                prose-blockquote:border-l-4 prose-blockquote:border-foreground/80 prose-blockquote:bg-zinc-50 prose-blockquote:py-4 prose-blockquote:px-6 prose-blockquote:rounded-r-lg prose-blockquote:not-italic prose-blockquote:my-10
                prose-ul:my-8 prose-li:my-3 prose-li:text-zinc-700 prose-li:leading-loose
                max-w-none"
                dangerouslySetInnerHTML={{ __html: getLocalizedText(article.content, lang) }}
              />

              <BlogAuthor author={author} />
            </div>


            <div className="mt-20">
              <RelatedHotels location={getLocalizedText(article.location, lang)} />
            </div>

            <div className="mt-8">
              <RelatedArticles location={getLocalizedText(article.location, lang).split(',')[0].trim()} lang={lang} />
            </div>

            <div className="mt-12 pt-12 border-t border-zinc-200">
              <div className="max-w-3xl mx-auto text-center">
                <h3 className="text-2xl font-bold text-foreground mb-4">
                  Bu rehber işinize yaradı mı?
                </h3>
                <p className="text-muted-foreground mb-8 leading-relaxed">
                  {getLocalizedText(article.location, lang)} bölgesindeki daha fazla gizli cenneti keşfetmek için diğer rehberlerimize göz atın.
                </p>
                <Link
                  href={`/${lang}/rehber`}
                  className="inline-flex items-center gap-2 bg-foreground hover:bg-zinc-800 text-background px-8 py-3 rounded-full font-semibold transition-colors"
                >
                  Tüm Rehberleri Keşfet
                </Link>
              </div>
            </div>
          </article>
        </div>
      </div>
    </>
  );
}
