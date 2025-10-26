import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

interface HeroMediaProps {
  type: 'image' | 'video';
  src: string;
  alt?: string;
  className?: string;
  fetchPriority?: 'high' | 'auto';
  onLoad?: () => void;
  poster?: string;
}

export function HeroMedia({ 
  type, 
  src, 
  alt = 'Hero background', 
  className = '', 
  fetchPriority = 'auto',
  onLoad,
  poster
}: HeroMediaProps) {
  const [mediaLoaded, setMediaLoaded] = useState(false);
  const [mediaError, setMediaError] = useState(false);

  const handleLoad = () => {
    setMediaLoaded(true);
    onLoad?.();
  };

  const handleError = (e: any) => {
    console.warn('Media failed to load:', src, e);
    setMediaError(true);
    onLoad?.();
  };

  if (type === 'video' && !mediaError && src) {
    return (
      <video
        src={src}
        poster={poster}
        autoPlay
        muted
        loop
        playsInline
        className={`w-full h-full object-cover ${className}`}
        onLoadedData={handleLoad}
        onError={handleError}
        preload="metadata"
      >
        Your browser does not support the video tag.
      </video>
    );
  }

  const fallbackSrc = (type === 'video' && mediaError) ? (poster || src) : src;
  
  return (
    <img
      src={fallbackSrc}
      alt={alt}
      className={`w-full h-full object-cover ${className}`}
      fetchPriority={fetchPriority}
      onLoad={handleLoad}
      onError={handleError}
      loading="eager"
    />
  );
}

interface HeroSectionProps {
  mediaType?: 'image' | 'video';
  imageSrc?: string;
  videoSrc?: string;
  posterSrc?: string;
  title?: string;
  subtitle?: string;
  ctaText?: string;
  onCtaClick?: () => void;
  fetchPriority?: 'high' | 'auto';
  reserveSpace?: boolean;
  onMediaLoad?: () => void;
}

export function HeroSection({
  mediaType = 'image',
  imageSrc,
  videoSrc,
  posterSrc,
  title = 'Performance Demo Store',
  subtitle = 'Optimize your Core Web Vitals with HyperCart Lab',
  ctaText = 'Shop Now',
  onCtaClick,
  fetchPriority = 'high',
  reserveSpace = false,
  onMediaLoad
}: HeroSectionProps) {
  const mediaSrc = mediaType === 'video' ? videoSrc : imageSrc;

  return (
    <div className={`hero-container ${reserveSpace ? 'reserved-space' : ''}`}>
      <div className="relative w-full h-full">
        {mediaSrc && (
          <HeroMedia
            type={mediaType}
            src={mediaSrc}
            alt="Hero background"
            fetchPriority={fetchPriority}
            onLoad={onMediaLoad}
            poster={posterSrc}
          />
        )}
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
          <div className="text-center text-white px-4">
            <h1 className="text-5xl font-bold mb-4">{title}</h1>
            <p className="text-xl mb-8">{subtitle}</p>
            <Button 
              size="lg" 
              className="bg-accent hover:bg-accent/90"
              onClick={onCtaClick}
              data-cy="shop-now-cta"
            >
              {ctaText}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
