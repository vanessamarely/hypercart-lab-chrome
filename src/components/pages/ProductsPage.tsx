import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getFlags } from '@/lib/performance-flags';
import { addPerformanceMark, measurePerformance } from '@/lib/performance-utils';
import { Product } from '@/lib/types';
import productImage from '@/assets/images/product-1.webp';

const SAMPLE_PRODUCTS: Product[] = Array.from({ length: 30 }, (_, i) => ({
  id: i + 1,
  name: `Premium Product ${i + 1}`,
  description: `High-quality product with excellent features and reliable performance. Perfect for demonstration.`,
  price: Math.floor(Math.random() * 500) + 20,
  category: ['Electronics', 'Clothing', 'Home', 'Sports', 'Books'][i % 5],
  rating: Number((Math.random() * 2 + 3).toFixed(1)),
  inStock: Math.random() > 0.1,
  image: productImage,
}));

interface ProductsPageProps {
  onProductClick: (productId: number) => void;
}

export function ProductsPage({ onProductClick }: ProductsPageProps) {
  const [products] = useState<Product[]>(SAMPLE_PRODUCTS);
  const flags = getFlags();

  useEffect(() => {
    addPerformanceMark('products-page-start');
    
    // Simulate rendering products
    const renderProducts = () => {
      addPerformanceMark('render-products-start');
      // Force layout calculation
      document.querySelector('.product-grid')?.getBoundingClientRect();
      addPerformanceMark('render-products-end');
      measurePerformance('render-products', 'render-products-start', 'render-products-end');
    };

    // Use setTimeout to simulate async rendering
    setTimeout(renderProducts, 0);

    addPerformanceMark('products-page-end');
    measurePerformance('products-page-load', 'products-page-start', 'products-page-end');
  }, []);

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Product Catalog</h1>
          <p className="text-muted-foreground">
            Browse our collection of products. Use debug panel to toggle performance issues.
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
              <div className="relative">
                <img
                  src={product.image}
                  alt={product.name}
                  className={`product-image ${flags.missingSizes ? 'no-dimensions' : ''}`}
                  loading={flags.lazyOff ? 'eager' : 'lazy'}
                  style={!flags.missingSizes ? { width: '100%', height: '200px' } : undefined}
                  data-cy="product-image"
                />
                {!product.inStock && (
                  <Badge className="absolute top-2 right-2 bg-destructive">
                    Out of Stock
                  </Badge>
                )}
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
                  
                  <Button 
                    size="sm" 
                    disabled={!product.inStock}
                    onClick={(e) => {
                      e.stopPropagation();
                      onProductClick(product.id);
                    }}
                  >
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}