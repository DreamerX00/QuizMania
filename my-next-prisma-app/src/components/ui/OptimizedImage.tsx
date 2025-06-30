'use client';

import Image from 'next/image';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  quality?: number;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  sizes?: string;
  fill?: boolean;
  style?: React.CSSProperties;
}

export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  className,
  priority = false,
  quality = 75,
  placeholder = 'empty',
  blurDataURL,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  fill = false,
  style,
  ...props
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  if (error) {
    return (
      <div 
        className={cn(
          "bg-gray-200 dark:bg-gray-700 flex items-center justify-center",
          className
        )}
        style={{ width, height, ...style }}
      >
        <span className="text-gray-500 text-sm">Image failed to load</span>
      </div>
    );
  }

  return (
    <div className={cn("relative overflow-hidden", className)}>
      <Image
        src={src}
        alt={alt}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        className={cn(
          "transition-opacity duration-300",
          isLoading ? "opacity-0" : "opacity-100"
        )}
        priority={priority}
        quality={quality}
        placeholder={placeholder}
        blurDataURL={blurDataURL}
        sizes={sizes}
        fill={fill}
        style={style}
        onLoad={() => setIsLoading(false)}
        onError={() => setError(true)}
        {...props}
      />
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse" />
      )}
    </div>
  );
}

// Specialized image components for common use cases
export function HeroImage(props: Omit<OptimizedImageProps, 'priority' | 'sizes'>) {
  return (
    <OptimizedImage
      {...props}
      priority={true}
      sizes="100vw"
      quality={85}
    />
  );
}

export function ThumbnailImage(props: Omit<OptimizedImageProps, 'sizes' | 'quality'>) {
  return (
    <OptimizedImage
      {...props}
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 25vw, 20vw"
      quality={60}
    />
  );
}

export function AvatarImage(props: Omit<OptimizedImageProps, 'sizes' | 'quality'>) {
  return (
    <OptimizedImage
      {...props}
      sizes="(max-width: 768px) 50px, 60px"
      quality={70}
      className={cn("rounded-full", props.className)}
    />
  );
} 