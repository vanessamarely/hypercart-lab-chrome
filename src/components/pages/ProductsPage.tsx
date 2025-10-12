import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useKV } from '@github/spark/hooks';
import { getFlags } from '@/lib/performance-flags';
import { addPerformanceMark, measurePerformance } from '@/lib/performance-utils';
import { Product, CartItem } from '@/lib/types';
import { getProductImage, getProductImageAlt } from '@/lib/local-assets';
import { CartAddedModal } from '@/components/CartAddedModal';
import { ShoppingCart } from '@phosphor-icons/react';

// Product categories for better image matching
const CATEGORIES = ['Electronics', 'Clothing', 'Home', 'Sports', 'Books'];

// Product names that match categories better
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

// Generate products with better names and descriptions
const generateProducts = (): Product[] => {
  const products: Product[] = [];
  
  for (let i = 0; i < 30; i++) {
    const category = CATEGORIES[i % 5];
    const categoryProducts = PRODUCT_NAMES[category as keyof typeof PRODUCT_NAMES];
    const productName = categoryProducts[i % categoryProducts.length];
    
    // Get local product image
    const image = getProductImage(i + 1);
    const imageAlt = getProductImageAlt(i + 1, productName);
    
    products.push({
      id: i + 1,
      name: productName,
      description: `High-quality ${category.toLowerCase()} product with excellent features and reliable performance. Perfect for everyday use.`,
      price: Math.floor(Math.random() * 500) + 20,
      category,
      rating: Number((Math.random() * 2 + 3).toFixed(1)),
      inStock: Math.random() > 0.1,
      image,
      imageAlt
    });
  }
  
  return products;
};

interface ProductsPageProps {
  onProductClick: (productId: number) => void;
  onNavigate?: (page: string) => void;
}

export function ProductsPage({ onProductClick, onNavigate }: ProductsPageProps) {
  const [cart, setCart] = useKV<CartItem[]>('hypercart-cart', []);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCartModal, setShowCartModal] = useState(false);
  const [addedProduct, setAddedProduct] = useState<Product | null>(null);
  const flags = getFlags();

  useEffect(() => {
    addPerformanceMark('products-page-start');
    
    // Generate products with local images
    const generatedProducts = generateProducts();
    setProducts(generatedProducts);
    setLoading(false);
    
    addPerformanceMark('products-page-end');
    measurePerformance('products-page-load', 'products-page-start', 'products-page-end');
    
    // Simulate rendering products
    const renderProducts = () => {
      addPerformanceMark('render-products-start');
      // Force layout calculation
      document.querySelector('.product-grid')?.getBoundingClientRect();
      addPerformanceMark('render-products-end');
      measurePerformance('render-products', 'render-products-start', 'render-products-end');
    };

    // Use setTimeout to simulate async rendering
    setTimeout(renderProducts, 100);
  }, []);

  const handleAddToCart = async (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    
    addPerformanceMark('add-to-cart-start');

    // Add to cart
    const currentCart = cart || [];
    const existingItem = currentCart.find(item => item.product.id === product.id);
    
    if (existingItem) {
      setCart(prev => 
        (prev || []).map(item => 
          item.product.id === product.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setCart(prev => [...(prev || []), { product, quantity: 1 }]);
    }

    addPerformanceMark('add-to-cart-end');
    measurePerformance('add-to-cart-interaction', 'add-to-cart-start', 'add-to-cart-end');
    
    // Show the modal
    setAddedProduct(product);
    setShowCartModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen p-4">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-4">Product Catalog</h1>
            <p className="text-muted-foreground">
              Loading products with beautiful high-quality images...
            </p>
          </div>
          <div className="product-grid">
            {Array.from({ length: 12 }).map((_, i) => (
              <Card key={i} className="product-card">
                <div className="skeleton w-full h-48 rounded-t-lg"></div>
                <CardContent className="p-4">
                  <div className="skeleton h-4 w-3/4 mb-2"></div>
                  <div className="skeleton h-3 w-full mb-1"></div>
                  <div className="skeleton h-3 w-2/3 mb-3"></div>
                  <div className="flex justify-between items-center">
                    <div className="skeleton h-6 w-16"></div>
                    <div className="skeleton h-8 w-20 rounded"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const totalCartItems = (cart || []).reduce((total, item) => total + item.quantity, 0);

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Product Catalog</h1>
          <p className="text-muted-foreground">
            Browse our collection of products featuring beautiful high-quality images.
          </p>
        </div>

        <div className="product-grid" data-cy="product-grid">
          {products.map((product) => (
            <Card 
              key={product.id} 
              className="product-card cursor-pointer hover:shadow-lg transition-all"
              onClick={() => onProductClick(product.id)}
              data-cy={`product-card-${product.id}`}
            >
              <div className="relative overflow-hidden">
                <img
                  src={product.image}
                  alt={product.imageAlt || product.name}
                  className={`product-image object-cover transition-transform hover:scale-105 ${flags.missingSizes ? 'no-dimensions' : ''}`}
                  loading={flags.lazyOff ? 'eager' : 'lazy'}
                  style={!flags.missingSizes ? { width: '100%', height: '200px' } : undefined}
                  data-cy="product-image"
                />
                {!product.inStock && (
                  <Badge className="absolute top-2 right-2 bg-destructive">
                    Out of Stock
                  </Badge>
                )}
                <Badge className="absolute top-2 left-2 bg-primary/90 text-primary-foreground">
                  {product.category}
                </Badge>
              </div>
              
              <CardContent className="p-4">
                <h3 className="font-semibold text-lg mb-2 line-clamp-2">{product.name}</h3>
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                  {product.description}
                </p>
                
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-2xl font-bold text-primary">
                      ${product.price}
                    </span>
                    <div className="flex items-center mt-1">
                      <span className="text-sm text-muted-foreground">
                        ⭐ {product.rating}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      disabled={!product.inStock}
                      onClick={(e) => handleAddToCart(product, e)}
                      className="p-2"
                    >
                      <ShoppingCart size={16} />
                    </Button>
                    <Button 
                      size="sm" 
                      disabled={!product.inStock}
                      onClick={(e) => {
                        e.stopPropagation();
                        onProductClick(product.id);
                      }}
                    >
                      View
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <CartAddedModal
          open={showCartModal}
          onOpenChange={setShowCartModal}
          product={addedProduct}
          totalCartItems={totalCartItems}
          onContinueShopping={() => setShowCartModal(false)}
          onViewCart={() => {
            setShowCartModal(false);
            onNavigate?.('checkout');
          }}
        />
      </div>
    </div>
  );
}