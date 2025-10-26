import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { HeroSection } from '@/components/HeroSection';
import { getFlags } from '@/lib/performance-flags';
import { addPerformanceMark, measurePerformance, addHeroPreload, removeHeroPreload } from '@/lib/performance-utils';

import heroJpg from '@/assets/images/hero.jpg';
import heroVideoMp4 from '@/assets/video/hero-background.mp4';

interface HomePageProps {
  onNavigate?: (page: string) => void;
}

export function HomePage({ onNavigate }: HomePageProps) {
  const [showLateBanner, setShowLateBanner] = useState(false);
  const flags = getFlags();

  useEffect(() => {
    addPerformanceMark('home-page-start');

    // Handle hero preload - use poster image for video
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
        mediaType="video"
        imageSrc={heroJpg}
        videoSrc={heroVideoMp4}
        posterSrc={heroJpg}
        fetchPriority={flags.heroFetchPriorityHigh ? 'high' : 'auto'}
        reserveSpace={flags.reserveHeroSpace}
        onMediaLoad={handleHeroMediaLoad}
        onCtaClick={() => onNavigate?.('products')}
      />

      {/* Performance Loop Introduction */}
      <section className="py-16 px-4 bg-gradient-to-b from-background to-muted/20">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">The DevTools Performance Loop</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Master web performance by following this systematic approach to debugging and optimization
            </p>
          </div>

          <div className="relative">
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-border hidden md:block" />
            
            <div className="space-y-8">
              <div className="flex flex-col md:flex-row gap-6 items-center">
                <div className="flex-1 text-right md:pr-12">
                  <div className="inline-block p-6 border-2 border-primary rounded-lg bg-card shadow-lg">
                    <div className="flex items-center justify-end gap-3 mb-2">
                      <h3 className="text-xl font-bold">Set Reproducible Conditions</h3>
                      <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">1</div>
                    </div>
                    <p className="text-muted-foreground">
                      Create consistent testing environments to ensure accurate measurements
                    </p>
                  </div>
                </div>
                <div className="hidden md:block w-12 h-12 rounded-full bg-primary text-primary-foreground flex-shrink-0 flex items-center justify-center z-10 border-4 border-background" />
                <div className="flex-1 md:pl-12" />
              </div>

              <div className="flex flex-col md:flex-row gap-6 items-center">
                <div className="flex-1 md:pr-12" />
                <div className="hidden md:block w-12 h-12 rounded-full bg-primary text-primary-foreground flex-shrink-0 flex items-center justify-center z-10 border-4 border-background" />
                <div className="flex-1 text-left md:pl-12">
                  <div className="inline-block p-6 border-2 border-primary rounded-lg bg-card shadow-lg">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">2</div>
                      <h3 className="text-xl font-bold">Measure LCP / INP / CLS</h3>
                    </div>
                    <p className="text-muted-foreground">
                      Capture baseline metrics for the Core Web Vitals that matter most
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-6 items-center">
                <div className="flex-1 text-right md:pr-12">
                  <div className="inline-block p-6 border-2 border-primary rounded-lg bg-card shadow-lg">
                    <div className="flex items-center justify-end gap-3 mb-2">
                      <h3 className="text-xl font-bold">Read the Trace</h3>
                      <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">3</div>
                    </div>
                    <p className="text-muted-foreground">
                      Analyze Chrome DevTools Performance panel to identify bottlenecks
                    </p>
                  </div>
                </div>
                <div className="hidden md:block w-12 h-12 rounded-full bg-primary text-primary-foreground flex-shrink-0 flex items-center justify-center z-10 border-4 border-background" />
                <div className="flex-1 md:pl-12" />
              </div>

              <div className="flex flex-col md:flex-row gap-6 items-center">
                <div className="flex-1 md:pr-12" />
                <div className="hidden md:block w-12 h-12 rounded-full bg-primary text-primary-foreground flex-shrink-0 flex items-center justify-center z-10 border-4 border-background" />
                <div className="flex-1 text-left md:pl-12">
                  <div className="inline-block p-6 border-2 border-primary rounded-lg bg-card shadow-lg">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">4</div>
                      <h3 className="text-xl font-bold">Apply Smallest Safe Change</h3>
                    </div>
                    <p className="text-muted-foreground">
                      Make incremental optimizations to isolate what works
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-6 items-center">
                <div className="flex-1 text-right md:pr-12">
                  <div className="inline-block p-6 border-2 border-accent rounded-lg bg-card shadow-lg">
                    <div className="flex items-center justify-end gap-3 mb-2">
                      <h3 className="text-xl font-bold">Re-measure</h3>
                      <div className="w-10 h-10 rounded-full bg-accent text-accent-foreground flex items-center justify-center font-bold">5</div>
                    </div>
                    <p className="text-muted-foreground">
                      Validate improvements and repeat the loop until targets are met
                    </p>
                  </div>
                </div>
                <div className="hidden md:block w-12 h-12 rounded-full bg-accent text-accent-foreground flex-shrink-0 flex items-center justify-center z-10 border-4 border-background" />
                <div className="flex-1 md:pl-12" />
              </div>
            </div>
          </div>

          <div className="mt-12 text-center">
            <div className="inline-block p-8 border-2 border-accent rounded-xl bg-accent/5">
              <h3 className="text-2xl font-bold mb-4">The Result</h3>
              <div className="flex flex-wrap justify-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <span className="font-semibold">Early Load</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <span className="font-semibold">Fluid Interaction</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <span className="font-semibold">Visual Stability</span>
                </div>
              </div>
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
                Optimize Largest Contentful Paint by preloading critical images and using proper sizing.
              </p>
            </div>
            <div className="p-6 border rounded-lg">
              <h3 className="text-xl font-semibold mb-4">CLS Prevention</h3>
              <p className="text-muted-foreground">
                Reserve space for dynamic content to prevent Cumulative Layout Shift.
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
        </div>
      </section>
    </div>
  );
}