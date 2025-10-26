import product1Webp from '@/assets/images/product-1.webp';
import product2Webp from '@/assets/images/product-2.webp';
import product3Webp from '@/assets/images/product-3.webp';
import product4Webp from '@/assets/images/product-4.webp';
import product5Webp from '@/assets/images/product-5.webp';
import product6Webp from '@/assets/images/product-6.webp';

import product1Jpg from '@/assets/images/product-1.jpg';
import product2Jpg from '@/assets/images/product-2.jpg';
import product3Jpg from '@/assets/images/product-3.jpg';
import product4Jpg from '@/assets/images/product-4.jpg';
import product5Jpg from '@/assets/images/product-5.jpg';
import product6Jpg from '@/assets/images/product-6.jpg';

export const PRODUCT_IMAGES = {
  1: product1Webp,
  2: product2Webp,
  3: product3Webp,
  4: product4Webp,
  5: product5Webp,
  6: product6Webp,
} as const;

export const PRODUCT_IMAGES_FALLBACK = {
  1: product1Jpg,
  2: product2Jpg,
  3: product3Jpg,
  4: product4Jpg,
  5: product5Jpg,
  6: product6Jpg,
} as const;

export function getProductImage(productId: number): string {
  const id = ((productId - 1) % 6) + 1;
  return PRODUCT_IMAGES[id as keyof typeof PRODUCT_IMAGES];
}

export function getProductImageFallback(productId: number): string {
  const id = ((productId - 1) % 6) + 1;
  return PRODUCT_IMAGES_FALLBACK[id as keyof typeof PRODUCT_IMAGES_FALLBACK];
}

export function getProductImageAlt(productId: number, productName: string): string {
  return `${productName} - Product ${productId}`;
}