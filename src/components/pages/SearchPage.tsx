import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useKV } from '@github/spark/hooks';
import { getFlags } from '@/lib/performance-flags';
import { addPerformanceMark, measurePerformance, microYield } from '@/lib/performance-utils';
import { Product, CartItem } from '@/lib/types';
import { getAllProducts, searchProducts as searchProductsFromLib } from '@/lib/products';
import { getUnsplashImageForProduct } from '@/lib/unsplash';
import { CartAddedModal } from '@/components/CartAddedModal';
import { ShoppingCart } from '@phosphor-icons/react';

interface SearchPageProps {
  onProductClick: (productId: number) => void;
  onNavigate?: (page: string) => void;
}

export function SearchPage({ onProductClick, onNavigate }: SearchPageProps) {
  const [cart, setCart] = useKV<CartItem[]>('hypercart-cart', []);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);
  const [searchProducts, setSearchProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCartModal, setShowCartModal] = useState(false);
  const [addedProduct, setAddedProduct] = useState<Product | null>(null);
  const [productImages, setProductImages] = useState<Map<number, string>>(new Map());
  const flags = getFlags();

  useEffect(() => {
    const loadProductsWithImages = async () => {
      const products = getAllProducts();
      setSearchProducts(products);
      
      const imageMap = new Map<number, string>();
      for (const product of products) {
        const imageUrl = await getUnsplashImageForProduct(product.id, product.category, product.name);
        imageMap.set(product.id, imageUrl);
      }
      setProductImages(imageMap);
      setLoading(false);
    };
    
    loadProductsWithImages();
  }, []);

  // Simple search function
  const performSearch = async (searchQuery: string) => {
    addPerformanceMark('search-start');
    setIsSearching(true);

    try {
      const searchTerms = searchQuery.toLowerCase().split(' ').filter(term => term.length > 0);
      
      if (searchTerms.length === 0) {
        setResults([]);
        return;
      }

      // Simulate heavy computation
      for (let i = 0; i < 50000; i++) {
        Math.sin(i) * Math.cos(i);
      }

      let filteredResults: Product[] = [];

      if (flags.microYield) {
        // Process in chunks with yields
        const chunkSize = 50;
        for (let i = 0; i < searchProducts.length; i += chunkSize) {
          const chunk = searchProducts.slice(i, i + chunkSize);
          const chunkResults = chunk.filter(product => 
            searchTerms.every(term => 
              product.name.toLowerCase().includes(term) ||
              product.description.toLowerCase().includes(term) ||
              product.category.toLowerCase().includes(term)
            )
          );
          filteredResults = [...filteredResults, ...chunkResults];
          
          await microYield();
        }
      } else {
        // Process all at once (blocking)
        filteredResults = searchProducts.filter(product => 
          searchTerms.every(term => 
            product.name.toLowerCase().includes(term) ||
            product.description.toLowerCase().includes(term) ||
            product.category.toLowerCase().includes(term)
          )
        );
      }

      setResults(filteredResults.slice(0, 20));
    } finally {
      setIsSearching(false);
      addPerformanceMark('search-end');
      measurePerformance('search-operation', 'search-start', 'search-end');
    }
  };

  // Handle input change with debouncing
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);

    // Clear existing timer
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    if (flags.debounce) {
      // Debounced search
      const timer = setTimeout(() => {
        performSearch(value);
      }, 300);
      setDebounceTimer(timer);
    } else {
      // Immediate search (can cause input lag)
      performSearch(value);
    }
  };

  useEffect(() => {
    addPerformanceMark('search-page-load');
    
    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  }, [debounceTimer]);

  const handleAddToCart = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    
    addPerformanceMark('add-to-cart-start');

    setAddedProduct(product);

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
  };

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Search Products</h1>
          <p className="text-muted-foreground mb-6">
            Search through our catalog with beautiful Unsplash images. Use debug panel to toggle input responsiveness optimizations.
          </p>
          
          <div className="relative">
            <Input
              type="text"
              placeholder="Search for products..."
              value={query}
              onChange={handleInputChange}
              className="text-lg p-4"
              data-cy="search-input"
              disabled={loading}
            />
            {(isSearching || loading) && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
              </div>
            )}
          </div>
          
          {loading && (
            <div className="text-center text-muted-foreground mt-4">
              Loading products with Unsplash images...
            </div>
          )}
        </div>

        {/* Search Results */}
        <div className="space-y-4">
          {query && !loading && (
            <div className="text-sm text-muted-foreground">
              Found {results.length} results for "{query}"
              {flags.debounce && ' (debounced)'}
              {flags.microYield && ' (with micro-yields)'}
            </div>
          )}

          {results.map((product) => (
            <Card 
              key={product.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => onProductClick(product.id)}
              data-cy={`search-result-${product.id}`}
            >
              <CardContent className="p-4">
                <div className="flex items-start space-x-4">
                  <img
                    src={productImages.get(product.id) || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100&h=100&fit=crop'}
                    alt={product.imageAlt || product.name}
                    className="w-20 h-20 object-cover rounded"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1">{product.name}</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      {product.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-primary">
                        ${typeof product.price === 'number' ? product.price.toFixed(2) : product.price}
                      </span>
                      <div className="flex items-center space-x-4">
                        <span className="text-sm">⭐ {product.rating}</span>
                        <span className="text-sm text-muted-foreground">
                          {product.category}
                        </span>
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
                            onClick={(e) => {
                              e.stopPropagation();
                              onProductClick(product.id);
                            }}
                          >
                            View Details
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {query && results.length === 0 && !isSearching && !loading && (
            <div className="text-center py-12 text-muted-foreground">
              No products found for "{query}". Try a different search term.
            </div>
          )}
        </div>

        <CartAddedModal
          open={showCartModal}
          onOpenChange={setShowCartModal}
          product={addedProduct}
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