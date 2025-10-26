import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useKV } from '@github/spark/hooks';
import { getFlags } from '@/lib/performance-flags';
import { 
  addPerformanceMark, 
  measurePerformance, 
  block, 
  WorkerManager,
  addPassiveListeners,
  addNonPassiveListeners 
} from '@/lib/performance-utils';
import { Product, CartItem } from '@/lib/types';
import { getProductById, getProductDetailDescription } from '@/lib/products';
import { getUnsplashImageForProduct } from '@/lib/unsplash';
import { CartAddedModal } from '@/components/CartAddedModal';

interface ProductDetailPageProps {
  productId: number;
  onNavigate: (page: string) => void;
}

export function ProductDetailPage({ productId, onNavigate }: ProductDetailPageProps) {
  const [cart, setCart] = useKV<CartItem[]>('hypercart-cart', []);
  const [isLoading, setIsLoading] = useState(false);
  const [formattedData, setFormattedData] = useState<any>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [showCartModal, setShowCartModal] = useState(false);
  const [productImage, setProductImage] = useState<string>('');
  const flags = getFlags();

  useEffect(() => {
    addPerformanceMark('product-detail-start');
    
    const productData = getProductById(productId);
    
    if (!productData) {
      console.error(`Product with ID ${productId} not found`);
      onNavigate('products');
      return;
    }
    
    const detailedProduct = {
      ...productData,
      description: getProductDetailDescription(productData)
    };
    
    setProduct(detailedProduct);
    
    getUnsplashImageForProduct(productId, productData.category, productData.name).then(imageUrl => {
      setProductImage(imageUrl);
    });
    
    const handleTouchMove = (e: TouchEvent) => {
      if (!flags.listenersPassive) {
        e.preventDefault();
      }
    };

    const handleWheel = (e: WheelEvent) => {
      if (!flags.listenersPassive) {
        e.preventDefault();
      }
    };

    const element = document.body;
    
    if (flags.listenersPassive) {
      addPassiveListeners(element, ['touchmove', 'wheel'], handleTouchMove as EventListener);
    } else {
      addNonPassiveListeners(element, ['touchmove', 'wheel'], handleTouchMove as EventListener);
    }

    if (flags.useWorker) {
      const workerManager = new WorkerManager();
      workerManager.execute('format-product', detailedProduct)
        .then(result => {
          setFormattedData(result.data);
        })
        .catch(error => {
          console.warn('Worker failed, falling back to main thread:', error);
          formatProductOnMainThread(detailedProduct);
        });
    } else {
      formatProductOnMainThread(detailedProduct);
    }

    function formatProductOnMainThread(prod: Product) {
      addPerformanceMark('format-start');
      
      if (flags.simulateLongTask) {
        block(120);
      }
      
      const formatted = {
        ...prod,
        formattedPrice: new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD'
        }).format(prod.price),
        formattedDescription: prod.description,
        metadata: {
          processed: new Date().toISOString(),
          worker: false
        }
      };
      
      setFormattedData(formatted);
      addPerformanceMark('format-end');
      measurePerformance('product-format', 'format-start', 'format-end');
    }

    addPerformanceMark('product-detail-end');
    measurePerformance('product-detail-load', 'product-detail-start', 'product-detail-end');

    return () => {
      element.removeEventListener('touchmove', handleTouchMove as EventListener);
      element.removeEventListener('wheel', handleWheel as EventListener);
    };
  }, [productId, flags, onNavigate]);

  const handleAddToCart = async () => {
    if (!product) return;
    
    addPerformanceMark('add-to-cart-start');
    setIsLoading(true);

    try {
      if (flags.simulateLongTask) {
        block(120);
      }

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
      
      setShowCartModal(true);
      
    } finally {
      setIsLoading(false);
    }
  };

  if (!formattedData || !product) {
    return (
      <div className="min-h-screen p-4 flex items-center justify-center">
        <div className={`skeleton ${flags.intrinsicPlaceholders ? 'intrinsic' : ''} w-96 h-64`}>
          Loading product details...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-6xl mx-auto">
        <Button 
          variant="outline" 
          onClick={() => onNavigate('products')}
          className="mb-6"
        >
          ← Back to Products
        </Button>

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="aspect-square overflow-hidden rounded-lg border">
              <img
                src={productImage || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=600&fit=crop'}
                alt={product.imageAlt || product.name}
                className={`w-full h-full object-cover ${flags.missingSizes ? 'no-dimensions' : ''}`}
                style={!flags.missingSizes ? { width: '100%', height: '100%' } : undefined}
                data-cy="product-main-image"
              />
            </div>
            
            <div className="grid grid-cols-4 gap-2">
              {Array.from({ length: 4 }, (_, i) => (
                <div key={i} className="aspect-square border rounded overflow-hidden">
                  <img
                    src={productImage || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&h=200&fit=crop'}
                    alt={`${product.name} view ${i + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <Badge className="mb-2">{product.category}</Badge>
              <h1 className="text-3xl font-bold mb-2" data-cy="product-title">
                {product.name}
              </h1>
              <div className="flex items-center space-x-4 mb-4">
                <span className="text-3xl font-bold text-primary">
                  {formattedData.formattedPrice}
                </span>
                <div className="flex items-center">
                  <span className="text-yellow-500">⭐</span>
                  <span className="ml-1">{product.rating}</span>
                  <span className="text-muted-foreground ml-2">(124 reviews)</span>
                </div>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Product Details</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {formattedData.formattedDescription}
                </p>
                
                <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Category:</span> {product.category}
                  </div>
                  <div>
                    <span className="font-medium">In Stock:</span> {product.inStock ? 'Yes' : 'No'}
                  </div>
                  <div>
                    <span className="font-medium">Processed by:</span> {formattedData.metadata.worker ? 'Worker' : 'Main Thread'}
                  </div>
                  <div>
                    <span className="font-medium">Processed at:</span> {new Date(formattedData.metadata.processed).toLocaleTimeString()}
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <Button
                size="lg"
                className="w-full"
                onClick={handleAddToCart}
                disabled={!product.inStock || isLoading}
                data-cy="add-to-cart-button"
              >
                {isLoading ? 'Adding...' : 'Add to Cart'}
              </Button>
              
              <Button
                variant="outline"
                size="lg"
                className="w-full"
                onClick={() => onNavigate('checkout')}
              >
                Buy Now
              </Button>
            </div>
          </div>
        </div>

        <CartAddedModal
          open={showCartModal}
          onOpenChange={setShowCartModal}
          product={product}
          onContinueShopping={() => {
            setShowCartModal(false);
            onNavigate('products');
          }}
          onViewCart={() => {
            setShowCartModal(false);
            onNavigate('checkout');
          }}
        />
      </div>
    </div>
  );
}