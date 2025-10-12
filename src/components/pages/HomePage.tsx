import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { getFlags } from '@/lib/performance-flags';
import { addPerformanceMark, measurePerformance, addHeroPreload, removeHeroPreload } from '@/lib/performance-utils';

import heroLarge from '@/assets/images/hero@2x.webp';
import heroOptimized from '@/assets/images/hero.webp';

export function HomePage() {
  const [showLateBanner, setShowLateBanner] = useState(false);
  const flags = getFlags();

  useEffect(() => {
    addPerformanceMark('home-page-start');

    // Handle hero preload
    const heroSrc = flags.heroFetchPriorityHigh ? heroLarge : heroOptimized;
    
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

  const heroSrc = flags.heroFetchPriorityHigh ? heroLarge : heroOptimized;

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
      <section 
        className={`hero-container ${flags.reserveHeroSpace ? 'reserved-space' : ''}`}
        data-cy="hero-section"
      >
        <div className="relative w-full h-full">
          <img
            src={heroSrc}
            alt="HyperCart Hero"
            className="w-full h-full object-cover"
            fetchPriority={flags.heroFetchPriorityHigh ? 'high' : 'auto'}
            style={flags.reserveHeroSpace ? { width: '100%', height: '100%' } : undefined}
            onLoad={() => {
              addPerformanceMark('hero-image-loaded');
              measurePerformance('hero-load-time', 'home-page-start', 'hero-image-loaded');
            }}
            data-cy="hero-image"
          />
          
          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
            <div className="text-center text-white">
              <h1 className="text-5xl font-bold mb-4">Performance Demo Store</h1>
              <p className="text-xl mb-8">Optimize your Core Web Vitals with HyperCart Lab</p>
              <Button 
                size="lg" 
                className="bg-accent hover:bg-accent/90"
                data-cy="shop-now-cta"
              >
                Shop Now
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Content sections */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-8">Welcome to HyperCart Lab</h2>
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

          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-4">Performance Demo Features</h2>
            <p className="text-muted-foreground mb-6">
              This demo showcases web performance optimization techniques using real product images from Unsplash.
            </p>
            <div className="p-6 border rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground">
                <strong>Image Source:</strong> Product images are fetched from Unsplash API using the access key configured in your .env file. 
                Add your <code>VITE_UNSPLASH_ACCESS_KEY</code> to the .env file for high-quality images.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}