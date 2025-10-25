import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useKV } from '@github/spark/hooks';
import { getFlags } from '@/lib/performance-flags';
import { addPerformanceMark, measurePerformance } from '@/lib/performance-utils';
import { Product, CartItem } from '@/lib/types';
import { getAllProducts } from '@/lib/products';
import { CartAddedModal } from '@/components/CartAddedModal';
import { ShoppingCart } from '@phosphor-icons/react';

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
    
    const allProducts = getAllProducts();
    setProducts(allProducts);
    setLoading(false);
    
    addPerformanceMark('products-page-end');
    measurePerformance('products-page-load', 'products-page-start', 'products-page-end');
    
    const renderProducts = () => {
      addPerformanceMark('render-products-start');
      document.querySelector('.product-grid')?.getBoundingClientRect();
      addPerformanceMark('render-products-end');
      measurePerformance('render-products', 'render-products-start', 'render-products-end');
    };

    setTimeout(renderProducts, 100);
  }, []);

  const handleAddToCart = async (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    
    addPerformanceMark('add-to-cart-start');

    // Add to cart using functional update
    setCart((currentCart) => {
      const cartArray = currentCart || [];
      const existingItem = cartArray.find(item => item.product.id === product.id);
      
      if (existingItem) {
        return cartArray.map(item => 
          item.product.id === product.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...cartArray, { product, quantity: 1 }];
      }
    });

    addPerformanceMark('add-to-cart-end');
    measurePerformance('add-to-cart-interaction', 'add-to-cart-start', 'add-to-cart-end');
    
    // Show the modal after a brief delay to ensure cart state is updated
    setTimeout(() => {
      setAddedProduct(product);
      setShowCartModal(true);
    }, 100);
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
                      ${typeof product.price === 'number' ? product.price.toFixed(2) : product.price}
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