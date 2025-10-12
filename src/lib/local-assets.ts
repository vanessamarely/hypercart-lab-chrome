// Local asset management for products
import product1 from '@/assets/images/product-1.webp';
import product1Jpg from '@/assets/images/product-1.jpg';
import product2 from '@/assets/images/product-2.webp';
import product2Jpg from '@/assets/images/product-2.jpg';
import product3 from '@/assets/images/product-3.webp';
import product3Jpg from '@/assets/images/product-3.jpg';
import product4 from '@/assets/images/product-4.webp';
import product4Jpg from '@/assets/images/product-4.jpg';
import product5 from '@/assets/images/product-5.webp';
import product5Jpg from '@/assets/images/product-5.jpg';
import product6 from '@/assets/images/product-6.webp';
import product6Jpg from '@/assets/images/product-6.jpg';

export const PRODUCT_IMAGES = {
  1: { webp: product1, jpg: product1Jpg },
  2: { webp: product2, jpg: product2Jpg },
  3: { webp: product3, jpg: product3Jpg },
  4: { webp: product4, jpg: product4Jpg },
  5: { webp: product5, jpg: product5Jpg },
  6: { webp: product6, jpg: product6Jpg },
} as const;

export function getProductImage(productId: number, preferWebp: boolean = true): string {
  const id = ((productId - 1) % 6) + 1; // Cycle through products 1-6
  const images = PRODUCT_IMAGES[id as keyof typeof PRODUCT_IMAGES];
  return preferWebp ? images.webp : images.jpg;
}

export function getProductImageAlt(productId: number, productName: string): string {
  return `${productName} - Product ${productId}`;
}