import heroJpg from '@/assets/images/hero.jpg';
import heroWebp from '@/assets/images/hero.webp';
import hero2xWebp from '@/assets/images/hero@2x.webp';
import heroVideoMp4 from '@/assets/video/hero-background.mp4';

import product1Webp from '@/assets/images/product-1.webp';
import product2Webp from '@/assets/images/product-2.webp';
import product3Webp from '@/assets/images/product-3.webp';
import product4Webp from '@/assets/images/product-4.webp';
import product5Webp from '@/assets/images/product-5.webp';
import product6Webp from '@/assets/images/product-6.webp';
import product30Webp from '@/assets/images/product-30.webp';

import product1Jpg from '@/assets/images/product-1.jpg';
import product2Jpg from '@/assets/images/product-2.jpg';
import product3Jpg from '@/assets/images/product-3.jpg';
import product4Jpg from '@/assets/images/product-4.jpg';
import product5Jpg from '@/assets/images/product-5.jpg';
import product6Jpg from '@/assets/images/product-6.jpg';

export const ALL_ASSETS = {
  hero: {
    jpg: heroJpg,
    webp: heroWebp,
    webp2x: hero2xWebp,
    videoMp4: heroVideoMp4,
  },
  products: {
    webp: {
      1: product1Webp,
      2: product2Webp,
      3: product3Webp,
      4: product4Webp,
      5: product5Webp,
      6: product6Webp,
      30: product30Webp,
    },
    jpg: {
      1: product1Jpg,
      2: product2Jpg,
      3: product3Jpg,
      4: product4Jpg,
      5: product5Jpg,
      6: product6Jpg,
    },
  },
};

export function verifyAssets(): boolean {
  const errors: string[] = [];
  
  Object.entries(ALL_ASSETS.hero).forEach(([key, value]) => {
    if (!value || value.length === 0) {
      errors.push(`Hero asset "${key}" failed to load`);
    }
  });

  Object.entries(ALL_ASSETS.products.webp).forEach(([key, value]) => {
    if (!value || value.length === 0) {
      errors.push(`Product WebP ${key} failed to load`);
    }
  });

  Object.entries(ALL_ASSETS.products.jpg).forEach(([key, value]) => {
    if (!value || value.length === 0) {
      errors.push(`Product JPG ${key} failed to load`);
    }
  });

  if (errors.length > 0) {
    console.error('Asset verification failed:', errors);
    return false;
  }

  console.log('✅ All assets loaded successfully');
  return true;
}

if (import.meta.env.DEV) {
  console.log('Asset paths:', ALL_ASSETS);
  verifyAssets();
}
