import { Product } from './types';

const CATEGORIES = ['Electronics', 'Clothing', 'Home', 'Sports', 'Books'];

const PRODUCT_NAMES = {
  Electronics: [
    'Wireless Bluetooth Headphones',
    'Smart Fitness Watch',
    'Portable Phone Charger',
    'HD Webcam',
    'Mechanical Keyboard',
    '4K Action Camera'
  ],
  Clothing: [
    'Premium Cotton T-Shirt',
    'Denim Jacket',
    'Running Sneakers',
    'Casual Summer Dress',
    'Winter Wool Coat',
    'Athletic Joggers'
  ],
  Home: [
    'Modern Table Lamp',
    'Decorative Wall Mirror',
    'Ceramic Coffee Mug Set',
    'Bamboo Cutting Board',
    'Cozy Throw Blanket',
    'Minimalist Wall Clock'
  ],
  Sports: [
    'Yoga Mat Pro',
    'Resistance Band Set',
    'Water Bottle Steel',
    'Foam Roller',
    'Workout Gloves',
    'Jump Rope'
  ],
  Books: [
    'Productivity Handbook',
    'Creative Writing Guide',
    'Photography Masterclass',
    'Cooking Essentials',
    'Mindfulness Journal',
    'Tech Innovation Book'
  ]
};

const FIXED_PRICES = [
  299, 149, 89, 199, 249, 399,
  45, 129, 179, 69, 199, 89,
  79, 149, 39, 49, 59, 99,
  49, 79, 35, 45, 29, 39,
  29, 24, 34, 19, 22, 27
];

const FIXED_RATINGS = [
  4.5, 4.2, 4.7, 4.3, 4.6, 4.8,
  4.4, 4.1, 4.5, 4.3, 4.7, 4.2,
  4.6, 4.4, 4.3, 4.5, 4.2, 4.7,
  4.8, 4.6, 4.4, 4.5, 4.3, 4.7,
  4.4, 4.2, 4.6, 4.5, 4.3, 4.1
];

const IN_STOCK_STATUS = [
  true, true, true, true, true, true,
  true, true, true, false, true, true,
  true, true, true, true, true, true,
  true, true, true, true, false, true,
  true, true, true, true, true, true
];

let productsCache: Product[] | null = null;

export function getAllProducts(): Product[] {
  if (productsCache) {
    return productsCache;
  }

  const products: Product[] = [];
  
  for (let i = 0; i < 30; i++) {
    const category = CATEGORIES[i % 5];
    const categoryProducts = PRODUCT_NAMES[category as keyof typeof PRODUCT_NAMES];
    const productName = categoryProducts[i % categoryProducts.length];
    
    products.push({
      id: i + 1,
      name: productName,
      description: `High-quality ${category.toLowerCase()} product with excellent features and reliable performance. Perfect for everyday use.`,
      price: FIXED_PRICES[i],
      category,
      rating: FIXED_RATINGS[i],
      inStock: IN_STOCK_STATUS[i],
      image: '',
      imageAlt: `${productName} - Product ${i + 1}`
    });
  }
  
  productsCache = products;
  return products;
}

export function getProductById(id: number): Product | undefined {
  const products = getAllProducts();
  return products.find(p => p.id === id);
}

export function getProductsByCategory(category: string): Product[] {
  const products = getAllProducts();
  return products.filter(p => p.category === category);
}

export function searchProducts(query: string): Product[] {
  if (!query || query.trim() === '') {
    return getAllProducts();
  }
  
  const products = getAllProducts();
  const lowerQuery = query.toLowerCase();
  
  return products.filter(p => 
    p.name.toLowerCase().includes(lowerQuery) ||
    p.description.toLowerCase().includes(lowerQuery) ||
    p.category.toLowerCase().includes(lowerQuery)
  );
}

export function getProductDetailDescription(product: Product): string {
  return `This is a detailed description of ${product.name}. It features excellent build quality, innovative design, and outstanding performance. Perfect for both professional and personal use, this product represents the pinnacle of modern engineering and craftsmanship. Made with premium materials and attention to detail.`;
}
