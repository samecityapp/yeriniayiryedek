import { Check } from 'lucide-react';

interface HotelHighlightsProps {
  highlights: string[];
}

export function HotelHighlights({ highlights }: HotelHighlightsProps) {
  if (!highlights || highlights.length === 0) return null;

  return (
    <section className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 md:p-8 mb-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        <span className="text-blue-600">✨</span>
        Öne Çıkan Özellikler
      </h2>
      <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {highlights.map((highlight, index) => (
          <li key={index} className="flex items-start gap-3">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-500 flex items-center justify-center mt-0.5">
              <Check className="w-4 h-4 text-white" strokeWidth={3} />
            </div>
            <span className="text-gray-700 leading-relaxed">{highlight}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
