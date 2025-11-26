'use client';

import { useState } from 'react';
import { ImageGallery } from '@/components/ImageGallery';
import { Coffee } from 'lucide-react';

interface BreakfastSectionProps {
  description: string;
  images: string[];
}

export function BreakfastSection({ description, images }: BreakfastSectionProps) {
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);

  if (!description && (!images || images.length === 0)) {
    return null;
  }

  return (
    <>
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 rounded-3xl p-8 shadow-sm">
        <div className="flex items-start justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-amber-500 rounded-full p-2.5">
                <Coffee className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Kahvaltımız</h2>
            </div>
            {description && (
              <p className="text-gray-700 leading-relaxed text-base">
                {description}
              </p>
            )}
          </div>

          {images && images.length > 0 && (
            <div className="flex-shrink-0">
              <button
                onClick={() => setIsGalleryOpen(true)}
                className="group relative"
              >
                <div className="flex gap-2">
                  {images.slice(0, 3).map((image, index) => (
                    <div
                      key={index}
                      className="relative w-20 h-20 rounded-xl overflow-hidden border-2 border-white shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105"
                    >
                      <img
                        src={image}
                        alt={`Kahvaltı ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      {index === 2 && images.length > 3 && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <span className="text-white font-semibold text-sm">
                            +{images.length - 3}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <div className="absolute -bottom-1 -right-1 bg-amber-500 text-white text-xs font-semibold px-2 py-1 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                  Göster
                </div>
              </button>
            </div>
          )}
        </div>
      </div>

      {isGalleryOpen && images && images.length > 0 && (
        <div className="fixed inset-0 z-[9999]">
          <ImageGallery
            images={images}
            videoUrl={null}
            videoThumbnailUrl={null}
            onClose={() => setIsGalleryOpen(false)}
          />
        </div>
      )}
    </>
  );
}
