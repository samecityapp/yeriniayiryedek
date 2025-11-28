import { Lightbulb } from 'lucide-react';

interface QuickSummaryProps {
  items: string[];
}

export function QuickSummary({ items }: QuickSummaryProps) {
  if (!items || items.length === 0) return null;

  return (
    <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-l-4 border-amber-500 rounded-r-xl p-6 mb-12">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center">
          <Lightbulb className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Hızlı Özet</h2>
          <ul className="space-y-2">
            {items.map((item, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-amber-600 font-bold mt-1">•</span>
                <span className="text-gray-700 leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
