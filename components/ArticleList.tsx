import Link from 'next/link';
import Image from 'next/image';
import { Clock, ArrowRight } from 'lucide-react';
import { getLocalizedText } from '@/lib/localization';

interface ArticleListProps {
    articles: any[];
    lang?: 'tr' | 'en';
}

export function ArticleList({ articles, lang = 'tr' }: ArticleListProps) {
    if (articles.length === 0) {
        return (
            <div className="text-center py-20">
                <div className="max-w-md mx-auto">
                    <h3 className="text-2xl font-semibold text-foreground mb-3">
                        {lang === 'en' ? 'No Articles Yet' : 'Bu Konumda Henüz Yazı Yok'}
                    </h3>
                    <p className="text-muted-foreground">
                        {lang === 'en' ? 'We will be here with great guides soon.' : 'Yakında harika rehberlerle burada olacağız.'}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
            {articles.map((article: any) => (
                <Link
                    href={`/${lang}/${lang === 'en' ? 'guide' : 'rehber'}/${(lang === 'en' && article.slug_en) ? article.slug_en : article.slug}`}
                    key={article.id}
                    className="group block"
                >
                    <article className="h-full flex flex-col">
                        <div className="relative overflow-hidden aspect-[4/3] rounded-xl mb-4">
                            <Image
                                src={article.cover_image_url || 'https://placehold.co/800x600/e5e5e5/666666?text=GNK'}
                                alt={getLocalizedText(article.title, lang)}
                                fill
                                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                className="object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
                            />
                        </div>

                        <div className="flex items-center gap-3 mb-3">
                            <span className="text-xs font-medium uppercase tracking-wide text-zinc-400">
                                {getLocalizedText(article.location, lang) || (lang === 'en' ? 'General' : 'Genel')}
                            </span>
                            <span className="text-zinc-300">•</span>
                            <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                                <Clock className="w-3 h-3" />
                                <span>{lang === 'en' ? '8 MIN READ' : '8 DK OKUMA'}</span>
                            </div>
                        </div>

                        <h2 className="text-xl font-bold text-foreground mb-2 line-clamp-2 group-hover:underline decoration-2 underline-offset-4 leading-tight tracking-tight">
                            {getLocalizedText(article.title, lang)}
                        </h2>

                        <p className="text-sm text-zinc-500 line-clamp-3 leading-relaxed flex-grow">
                            {getLocalizedText(article.meta_description, lang)}
                        </p>

                        <div className="mt-4 flex items-center gap-2 text-foreground">
                            <span className="text-sm font-medium">{lang === 'en' ? 'Read' : 'Oku'}</span>
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </div>
                    </article>
                </Link>
            ))}
        </div>
    );
}
