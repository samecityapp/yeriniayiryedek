import Image from 'next/image';
import { Restaurant } from '@/lib/types';
import { Info, Star } from 'lucide-react';
import { getLocalizedText } from '@/lib/localization';

type RestaurantCardProps = {
  restaurant: Restaurant;
  onViewDetails: () => void;
};

export function RestaurantCard({ restaurant, onViewDetails }: RestaurantCardProps) {
  const imageUrl = restaurant.image_url || restaurant.image || '';
  const rating = restaurant.google_rating || restaurant.googleRating || 0;
  const reviewCount = restaurant.review_count || restaurant.reviewCount || '0';

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative w-full h-48">
        <Image
          src={imageUrl}
          alt={getLocalizedText(restaurant.name)}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover"
        />
      </div>
      <div className="p-4">
        <h3 className="text-lg font-bold mb-2">{getLocalizedText(restaurant.name)}</h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">{getLocalizedText(restaurant.description)}</p>
        <div className="flex justify-between items-center">
          <button
            onClick={onViewDetails}
            className="flex items-center text-blue-600 hover:underline text-sm font-medium"
          >
            <Info size={16} className="mr-1" />
            Detayları Gör
          </button>
          <div className="flex items-center text-sm">
            <Star size={16} className="text-yellow-500 fill-yellow-500 mr-1" />
            <span className="font-bold">{rating}</span>
            <span className="text-gray-500 ml-1">({reviewCount})</span>
          </div>
        </div>
      </div>
    </div>
  );
}
