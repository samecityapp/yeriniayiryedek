'use client';

import { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

type Language = 'tr' | 'en' | 'de';

interface LocalizedValue {
  tr: string;
  en?: string;
  de?: string;
  [key: string]: string | undefined;
}

interface LocalizedTextareaProps {
  label: string;
  value: LocalizedValue;
  onChange: (value: LocalizedValue) => void;
  placeholder?: string;
  required?: boolean;
  rows?: number;
}

export function LocalizedTextarea({
  label,
  value,
  onChange,
  placeholder = '',
  required = false,
  rows = 4
}: LocalizedTextareaProps) {
  const [activeTab, setActiveTab] = useState<Language>('tr');

  const handleChange = (lang: Language, text: string) => {
    onChange({
      ...value,
      [lang]: text
    });
  };

  const tabs: { key: Language; label: string; flag: string }[] = [
    { key: 'tr', label: 'Türkçe', flag: '🇹🇷' },
    { key: 'en', label: 'English', flag: '🇬🇧' },
    { key: 'de', label: 'Deutsch', flag: '🇩🇪' }
  ];

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </Label>

      <div className="flex gap-1 mb-2 border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? 'text-gray-900 border-b-2 border-gray-900'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <span className="mr-1.5">{tab.flag}</span>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {tabs.map((tab) => (
          <div
            key={tab.key}
            className={activeTab === tab.key ? 'block' : 'hidden'}
          >
            <Textarea
              value={value[tab.key] || ''}
              onChange={(e) => handleChange(tab.key, e.target.value)}
              placeholder={`${placeholder} (${tab.label})`}
              required={required && tab.key === 'tr'}
              rows={rows}
              className="w-full"
            />
            {tab.key === 'tr' && required && (
              <p className="text-xs text-gray-500 mt-1">
                * Türkçe alan zorunludur, diğer diller opsiyoneldir
              </p>
            )}
          </div>
        ))}
      </div>

      <div className="text-xs text-gray-500">
        Karakter sayısı: TR: {value.tr?.length || 0} | EN: {value.en?.length || 0} | DE: {value.de?.length || 0}
      </div>
    </div>
  );
}
