'use client';

import { useState, useRef } from 'react';
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { uploadImage, deleteImage, validateImageFile } from '@/lib/storage';

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  label: string;
  description?: string;
}

export function ImageUpload({ value, onChange, label, description }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setProgress(0);

    try {
      validateImageFile(file);
      setUploading(true);

      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const url = await uploadImage(file, 'covers');

      clearInterval(progressInterval);
      setProgress(100);

      onChange(url);

      setTimeout(() => {
        setProgress(0);
        setUploading(false);
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

  const handleRemove = async () => {
    if (!value) return;

    try {
      await deleteImage(value);
      onChange('');
    } catch (err) {
      console.error('Error removing image:', err);
    }
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="text-sm font-semibold text-gray-700 block mb-1">
          {label}
        </label>
        {description && (
          <p className="text-sm text-gray-500">{description}</p>
        )}
      </div>

      {value ? (
        <div className="relative group max-w-md">
          <Image
            src={value}
            alt="Upload preview"
            width={500}
            height={300}
            className="w-full h-auto rounded-xl border-2 border-gray-200 object-contain"
          />
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all rounded-xl flex items-center justify-center">
            <button
              type="button"
              onClick={handleRemove}
              className="opacity-0 group-hover:opacity-100 transition-opacity bg-red-500 hover:bg-red-600 text-white p-3 rounded-full"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      ) : (
        <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 transition-colors">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={handleFileSelect}
            className="hidden"
            disabled={uploading}
          />

          {uploading ? (
            <div className="space-y-3">
              <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto" />
              <div className="max-w-xs mx-auto">
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-sm text-gray-600 mt-2">Yükleniyor... {progress}%</p>
              </div>
            </div>
          ) : (
            <div>
              <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <Button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                className="mx-auto"
              >
                <Upload className="mr-2" size={18} />
                Fotoğraf Seç
              </Button>
              <p className="text-xs text-gray-500 mt-3">
                Herhangi bir format (Portrait/Landscape/Kare) - JPG, PNG veya WebP (Max 5MB)
              </p>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
    </div>
  );
}
