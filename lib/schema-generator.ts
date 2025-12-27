import { Hotel } from './types';
import { getLocalizedText } from './localization';

export function generateHotelSchema(hotel: Hotel) {
  const hotelName = getLocalizedText(hotel.name);
  const location = getLocalizedText(hotel.location);
  const description = getLocalizedText(hotel.description);
  const about = getLocalizedText(hotel.about);

  const [city, country] = location.split(',').map(s => s.trim());

  const schema: Record<string, any> = {
    '@context': 'https://schema.org',
    '@type': 'LodgingBusiness',
    name: hotelName,
    description: about || description || `${hotelName} - Konforlu konaklama imkanı`,
    image: hotel.galleryImages && hotel.galleryImages.length > 0
      ? hotel.galleryImages
      : hotel.coverImageUrl
        ? [hotel.coverImageUrl]
        : [],
    address: {
      '@type': 'PostalAddress',
      addressLocality: city || location,
      addressCountry: country || 'TR',
    }
  };

  if (hotel.latitude && hotel.longitude) {
    schema.geo = {
      '@type': 'GeoCoordinates',
      latitude: hotel.latitude,
      longitude: hotel.longitude,
    };
  }

  if (hotel.gnkScore) {
    schema.starRating = {
      '@type': 'Rating',
      ratingValue: hotel.gnkScore.toString(),
      bestRating: '10',
      worstRating: '1',
    };
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: hotel.gnkScore.toString(),
      bestRating: '10',
      worstRating: '1',
      reviewCount: '1',
    };
  }

  if (hotel.price) {
    schema.priceRange = hotel.price < 2000 ? '$' : hotel.price < 5000 ? '$$' : '$$$';
  }

  if (hotel.amenities && hotel.amenities.length > 0) {
    schema.amenityFeature = hotel.amenities.map(amenity => ({
      '@type': 'LocationFeatureSpecification',
      name: amenity,
    }));
  }

  if (hotel.website_url) {
    schema.url = hotel.website_url;
  }

  if (hotel.google_maps_url) {
    schema.hasMap = hotel.google_maps_url;
  }

  return schema;
}

export function generateFAQSchema(faqs: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer
      }
    }))
  };
}

export function generateArticleSchema(article: {
  title: string;
  description: string;
  content: string;
  slug: string;
  coverImage?: string;
  createdAt?: string;
  updatedAt?: string;
  author?: { name: string; image?: string };
}) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.yeriniayir.com';

  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: article.title,
    description: article.description,
    image: article.coverImage || `${baseUrl}/og-image.jpg`,
    datePublished: article.createdAt || new Date().toISOString(),
    dateModified: article.updatedAt || article.createdAt || new Date().toISOString(),
    author: {
      '@type': 'Person',
      name: article.author?.name || 'Yerini Ayır Rehberi',
      image: article.author?.image ? `${baseUrl}${article.author.image}` : undefined
    },
    publisher: {
      '@type': 'Organization',
      name: 'Yerini Ayır',
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/logo.svg`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${baseUrl}/rehber/${article.slug}`,
    },
  };
}

export function generateBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function generateOrganizationSchema() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.yeriniayir.com';

  return {
    '@context': 'https://schema.org',
    '@id': `${baseUrl}/#organization`,
    '@type': 'Organization',
    name: 'Yerini Ayır',
    url: baseUrl,
    logo: {
      '@type': 'ImageObject',
      url: `${baseUrl}/logo.svg`,
      width: '800',
      height: '250'
    },
    description: "Türkiye'nin en seçkin otelleri ve gezi rehberi - Erdem'in kaleminden en iyi konaklama önerileri",
    sameAs: [
      // Add social media URLs here if available
    ],
  };
}

export function generateWebSiteSchema() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.yeriniayir.com';

  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Yerini Ayır',
    url: baseUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${baseUrl}/search?q={search_term_string}`
      },
      'query-input': 'required name=search_term_string'
    }
  };
}
