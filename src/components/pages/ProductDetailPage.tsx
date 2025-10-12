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
import productImage from '@/assets/images/product-1.webp';

interface ProductDetailPageProps {
  productId: number;
  onNavigate: (page: string) => void;
}

export function ProductDetailPage({ productId, onNavigate }: ProductDetailPageProps) {
  const [cart, setCart] = useKV<CartItem[]>('hypercart-cart', []);
  const [isLoading, setIsLoading] = useState(false);
  const [formattedData, setFormattedData] = useState<any>(null);
  const flags = getFlags();

  // Sample product data
  const product: Product = {
    id: productId,
    name: `Premium Product ${productId}`,
    description: `This is a detailed description of Premium Product ${productId}. It features excellent build quality, innovative design, and outstanding performance. Perfect for both professional and personal use, this product represents the pinnacle of modern engineering and craftsmanship.`,
    price: Math.floor(Math.random() * 500) + 50,
    category: ['Electronics', 'Clothing', 'Home', 'Sports', 'Books'][productId % 5],
    rating: Number((Math.random() * 2 + 3).toFixed(1)),
    inStock: true,
    image: productImage,
  };

  useEffect(() => {
    addPerformanceMark('product-detail-start');

    // Set up event listeners based on flags
    const handleTouchMove = (e: TouchEvent) => {
      if (!flags.listenersPassive) {
        e.preventDefault(); // This will cause warnings if not passive
      }
    };

    const handleWheel = (e: WheelEvent) => {
      // Simulate some processing
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

    // Format product data using worker or main thread
    if (flags.useWorker) {
      const workerManager = new WorkerManager();
      workerManager.execute('format-product', product)
        .then(result => {
          setFormattedData(result.data);
        })
        .catch(error => {
          console.warn('Worker failed, falling back to main thread:', error);
          formatProductOnMainThread();
        });
    } else {
      formatProductOnMainThread();
    }

    function formatProductOnMainThread() {
      addPerformanceMark('format-start');
      
      // Simulate heavy formatting work
      if (flags.simulateLongTask) {
        block(120); // Block for 120ms
      }
      
      const formatted = {
        ...product,
        formattedPrice: new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD'
        }).format(product.price),
        formattedDescription: product.description,
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
      // Cleanup listeners
      element.removeEventListener('touchmove', handleTouchMove as EventListener);
      element.removeEventListener('wheel', handleWheel as EventListener);
    };
  }, [productId, flags]);

  const handleAddToCart = async () => {
    addPerformanceMark('add-to-cart-start');
    setIsLoading(true);

    try {
      // Simulate long task if flag is enabled
      if (flags.simulateLongTask) {
        block(120);
      }

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
      
    } finally {
      setIsLoading(false);
    }
  };

  if (!formattedData) {
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
          {/* Product Gallery */}
          <div className="space-y-4">
            <div className="aspect-square overflow-hidden rounded-lg border">
              <img
                src={product.image}
                alt={product.name}
                className={`w-full h-full object-cover ${flags.missingSizes ? 'no-dimensions' : ''}`}
                style={!flags.missingSizes ? { width: '100%', height: '100%' } : undefined}
                data-cy="product-main-image"
              />
            </div>
            
            {/* Thumbnail gallery */}
            <div className="grid grid-cols-4 gap-2">
              {Array.from({ length: 4 }, (_, i) => (
                <div key={i} className="aspect-square border rounded overflow-hidden">
                  <img
                    src={product.image}
                    alt={`${product.name} view ${i + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Product Info */}
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
      </div>
    </div>
  );
}