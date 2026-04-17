'use client';

import { useState } from 'react';
import Image, { ImageProps } from 'next/image';

interface ProductImageProps extends Omit<ImageProps, 'onError'> {
  fallbackName: string;
}

/**
 * Resilient Product Image Component.
 * Automatically handles loading failures by rendering a stylized 
 * text-based placeholder displaying the product name.
 */
export function ProductImage({ fallbackName, ...props }: ProductImageProps) {
  const [error, setError] = useState(false);

  if (error) {
    return (
      <div 
        className="flex items-center justify-center bg-gray-200 text-gray-500 font-medium text-center p-4 w-full h-full"
        style={{ width: '100%', height: '100%', minWidth: '100%', minHeight: '100%' }}
      >
        <span style={{ 
          fontSize: '0.9rem', 
          lineHeight: 1.2,
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden'
        }}>
          {fallbackName}
        </span>
      </div>
    );
  }

  return (
    <Image
      {...props}
      onError={() => setError(true)}
    />
  );
}
