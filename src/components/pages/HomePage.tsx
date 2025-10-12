import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { HeroSection } from '@/components/HeroSection';
import { HeroResourceGuide } from '@/components/HeroResourceGuide';
import { getFlags } from '@/lib/performance-flags';
import { addPerformanceMark, measurePerformance, addHeroPreload, removeHeroPreload } from '@/lib/performance-utils';

import heroJpg from '@/assets/images/hero.jpg';
import heroAltJpg from '@/assets/images/hero-alt.jpg';
import heroPosterJpg from '@/assets/images/hero-poster.jpg';
import heroVideoMp4 from '@/assets/video/hero-background.mp4';

export function HomePage() {
  const [showLateBanner, setShowLateBanner] = useState(false);
  const [heroMediaType, setHeroMediaType] = useState<'image' | 'video'>('image');
  const flags = getFlags();

  useEffect(() => {
    addPerformanceMark('home-page-start');

    // Handle hero preload - prefer image for better performance
    const heroSrc = heroJpg;
    
    if (flags.heroPreload) {
      addHeroPreload(heroSrc);
    } else {
      removeHeroPreload(heroSrc);
    }

    // Handle late banner for CLS demonstration
    if (flags.lateBanner) {
      const timer = setTimeout(() => {
        setShowLateBanner(true);
      }, 2000);
      return () => clearTimeout(timer);
    }

    addPerformanceMark('home-page-end');
    measurePerformance('home-page-load', 'home-page-start', 'home-page-end');
  }, [flags]);

  const handleHeroMediaLoad = () => {
    addPerformanceMark('hero-image-loaded');
    measurePerformance('hero-load-time', 'home-page-start', 'hero-image-loaded');
  };

  return (
    <div className="min-h-screen">
      {/* Late banner that causes CLS when enabled */}
      {showLateBanner && !flags.reserveHeroSpace && (
        <div className="late-banner" data-cy="late-banner">
          🚨 This banner appeared late and caused Cumulative Layout Shift!
        </div>
      )}

      {/* Reserved space for banner when optimization is enabled */}
      {flags.reserveHeroSpace && (
        <div className="late-banner" data-cy="banner-reserved">
          🎯 Banner space reserved - no CLS!
        </div>
      )}

      {/* Hero section */}
      <HeroSection
        mediaType={heroMediaType}
        imageSrc={heroJpg}
        videoSrc={heroVideoMp4}
        posterSrc={heroPosterJpg}
        fetchPriority={flags.heroFetchPriorityHigh ? 'high' : 'auto'}
        reserveSpace={flags.reserveHeroSpace}
        onMediaLoad={handleHeroMediaLoad}
      />

      {/* Content sections */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-8">Welcome to HyperCart Lab</h2>
          
          {/* Hero Media Controls */}
          <div className="mb-8 p-6 border rounded-lg bg-muted/30">
            <h3 className="text-lg font-semibold mb-4">Hero Media Options</h3>
            <div className="flex justify-center gap-4">
              <Button
                variant={heroMediaType === 'image' ? 'default' : 'outline'}
                onClick={() => setHeroMediaType('image')}
                size="sm"
              >
                📸 Image Hero
              </Button>
              <Button
                variant={heroMediaType === 'video' ? 'default' : 'outline'}
                onClick={() => setHeroMediaType('video')}
                size="sm"
              >
                🎥 Video Hero
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Switch between image and video hero backgrounds to see performance differences
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="p-6 border rounded-lg">
              <h3 className="text-xl font-semibold mb-4">LCP Optimization</h3>
              <p className="text-muted-foreground">
                Learn how hero image preloading and fetch priority improve Largest Contentful Paint.
              </p>
            </div>
            <div className="p-6 border rounded-lg">
              <h3 className="text-xl font-semibold mb-4">CLS Prevention</h3>
              <p className="text-muted-foreground">
                See how reserving space prevents Cumulative Layout Shift when content loads.
              </p>
            </div>
            <div className="p-6 border rounded-lg">
              <h3 className="text-xl font-semibold mb-4">Performance Monitoring</h3>
              <p className="text-muted-foreground">
                Use Chrome DevTools Performance panel to measure and optimize your app.
              </p>
            </div>
          </div>

          <div className="max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl font-bold mb-4">Performance Demo Features</h2>
            <p className="text-muted-foreground mb-6">
              This demo showcases web performance optimization techniques using beautiful product images.
            </p>
            <div className="p-6 border rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground">
                <strong>Image Optimization:</strong> Product images are optimized for fast loading with WebP format 
                and appropriate sizing to ensure the best user experience.
              </p>
            </div>
          </div>

          <HeroResourceGuide className="max-w-2xl mx-auto" />
        </div>
      </section>
    </div>
  );
}