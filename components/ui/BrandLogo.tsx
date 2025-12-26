import React from 'react';
import Image from 'next/image';

export function BrandLogo({ className }: { className?: string }) {
    return (
        <div className={className}>
            <Image
                src="/images/yeriniayir-logo.png"
                alt="Yerini Ayır"
                width={800}
                height={250}
                className="w-full h-full object-contain"
                priority
            />
        </div>
    );
}
