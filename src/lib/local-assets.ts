// Local asset management for products
import product1 from '@/assets/images/product-1.jpg';
import product2 from '@/assets/images/product-2.jpg';
import product3 from '@/assets/images/product-3.jpg';
import product4 from '@/assets/images/product-4.jpg';
import product5 from '@/assets/images/product-5.jpg';
import product6 from '@/assets/images/product-6.jpg';

export const PRODUCT_IMAGES = {
  1: product1,
  2: product2,
  3: product3,
  4: product4,
  5: product5,
  6: product6,
} as const;

export function getProductImage(productId: number): string {
  const id = ((productId - 1) % 6) + 1; // Cycle through products 1-6
  return PRODUCT_IMAGES[id as keyof typeof PRODUCT_IMAGES];
}

export function getProductImageAlt(productId: number, productName: string): string {
  return `${productName} - Product ${productId}`;
}