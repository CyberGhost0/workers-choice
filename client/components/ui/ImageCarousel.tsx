'use client';

import { useState, useEffect, useCallback } from 'react';

interface ImageCarouselProps {
  images: string[];
  alt?: string;
  className?: string;
  interval?: number;
}

export function ImageCarousel({ images, alt = '', className = '', interval = 5000 }: ImageCarouselProps) {
  const [current, setCurrent] = useState(0);
  const [loaded, setLoaded] = useState<Record<number, boolean>>({});

  const goTo = useCallback((idx: number) => {
    setCurrent(idx);
  }, []);

  useEffect(() => {
    if (images.length < 2) return;
    const id = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, interval);
    return () => clearInterval(id);
  }, [images.length, interval]);

  if (!images.length) {
    return (
      <div className={`bg-muted flex items-center justify-center ${className}`}>
        <span className="text-muted-foreground text-sm">No image</span>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {images.map((src, idx) => (
        <img
          key={idx}
          src={src}
          alt={idx === current ? alt : ''}
          loading={idx === 0 ? 'eager' : 'lazy'}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
            idx === current ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
          style={{ display: idx === current || loaded[idx] ? 'block' : 'none' }}
          onLoad={() => setLoaded((prev) => ({ ...prev, [idx]: true }))}
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="%2327272a" width="100" height="100"/><text x="50" y="55" text-anchor="middle" fill="%2371717a" font-size="10">No image</text></svg>';
          }}
        />
      ))}
      {images.length > 1 && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-20 flex gap-1.5">
          {images.map((_, idx) => (
            <button
              key={idx}
              onClick={() => goTo(idx)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                idx === current ? 'bg-white w-4' : 'bg-white/40 hover:bg-white/60'
              }`}
              aria-label={`Image ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}