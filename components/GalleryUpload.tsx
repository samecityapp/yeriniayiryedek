'use client';

import { useState, useRef } from 'react';
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { uploadImage, deleteImage, validateImageFile } from '@/lib/storage';

interface GalleryUploadProps {
  value: string[];
  onChange: (urls: string[]) => void;
  maxImages?: number;
}

export function GalleryUpload({ value, onChange, maxImages = 10 }: GalleryUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const availableSlots = maxImages - value.length;
    const filesToUpload = files.slice(0, availableSlots);

    if (files.length > availableSlots) {
      setError(`Maksimum ${maxImages} fotoğraf ekleyebilirsiniz. ${filesToUpload.length} fotoğraf yüklenecek.`);
    } else {
      setError(null);
    }

    setProgress(0);
    setUploading(true);

    try {
      const uploadPromises = filesToUpload.map(async (file, index) => {
        validateImageFile(file);

        const url = await uploadImage(file, 'gallery');

        const currentProgress = ((index + 1) / filesToUpload.length) * 100;
        setProgress(Math.round(currentProgress));

        return url;
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      onChange([...value, ...uploadedUrls]);

      setTimeout(() => {
        setProgress(0);
        setUploading(false);
        setError(null);
      }, 500);
    } catch (err: any) {
      setError(err.message || 'Yükleme başarısız oldu');
      setUploading(false);
      setProgress(0);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemove = async (index: number) => {
    const urlToRemove = value[index];

    try {
      await deleteImage(urlToRemove);
      const newUrls = value.filter((_, i) => i !== index);
      onChange(newUrls);
    } catch (err) {
      console.error('Error removing image:', err);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <label className="text-sm font-semibold text-gray-700 block mb-1">
            Galeri Fotoğrafları
          </label>
          <p className="text-sm text-gray-500">
            Otel detay sayfasında gösterilecek (Maksimum {maxImages} fotoğraf)
          </p>
        </div>
        <div className="text-sm font-medium text-gray-600">
          {value.length} / {maxImages}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {value.map((url, index) => (
          <div key={index} className="relative group">
            <Image
              src={url}
              alt={`Gallery ${index + 1}`}
              width={300}
              height={200}
              className="w-full h-auto rounded-xl border-2 border-gray-200 object-contain"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all rounded-xl flex items-center justify-center">
              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="opacity-0 group-hover:opacity-100 transition-opacity bg-red-500 hover:bg-red-600 text-white p-2 rounded-full"
              >
                <X size={18} />
              </button>
            </div>
            <div className="absolute top-2 left-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
              {index + 1}
            </div>
          </div>
        ))}

        {value.length < maxImages && (
          <div className="aspect-square min-h-[200px]">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={handleFileSelect}
              multiple
              className="hidden"
              disabled={uploading}
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="w-full h-full border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-400 transition-colors flex flex-col items-center justify-center gap-2 bg-gray-50 hover:bg-gray-100"
            >
              {uploading ? (
                <>
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                  <span className="text-sm text-gray-600">{progress}%</span>
                </>
              ) : (
                <>
                  <Upload className="h-8 w-8 text-gray-400" />
                  <span className="text-xs text-gray-600 font-medium text-center px-2">Fotoğraf Ekle</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {value.length === 0 && !uploading && (
        <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50">
          <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 mb-3">Henüz galeri fotoğrafı eklenmedi</p>
          <Button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            variant="outline"
          >
            <Upload className="mr-2" size={18} />
            İlk Fotoğrafı Ekle
          </Button>
          <p className="text-xs text-gray-500 mt-3">
            Herhangi bir format (Portrait/Landscape/Kare) - JPG, PNG veya WebP (Max 5MB her biri)
          </p>
        </div>
      )}

      {error && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <p className="text-sm text-yellow-700">{error}</p>
        </div>
      )}
    </div>
  );
}
