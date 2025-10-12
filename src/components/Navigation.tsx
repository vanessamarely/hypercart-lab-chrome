import React from 'react';
import { ShoppingCart } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useKV } from '@github/spark/hooks';
import { CartItem } from '@/lib/types';

interface NavigationProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export function Navigation({ currentPage, onNavigate }: NavigationProps) {
  const [cart] = useKV<CartItem[]>('hypercart-cart', []);

  const navItems = [
    { path: 'home', label: 'Home' },
    { path: 'products', label: 'Products' },
    { path: 'search', label: 'Search' },
    { path: 'checkout', label: 'Checkout' },
  ];

  const cartItemCount = (cart || []).reduce((total: number, item: CartItem) => total + item.quantity, 0);

  return (
    <nav className="bg-card border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <button 
              onClick={() => onNavigate('home')}
              className="text-xl font-bold text-primary"
            >
              HyperCart Lab
            </button>
            
            <div className="hidden md:flex space-x-6">
              {navItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => onNavigate(item.path)}
                  className={`px-3 py-2 text-sm font-medium transition-colors ${
                    currentPage === item.path
                      ? 'text-primary border-b-2 border-primary'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center">
            <Button 
              variant="outline" 
              size="sm" 
              className="relative"
              onClick={() => onNavigate('checkout')}
            >
              <ShoppingCart size={16} className="mr-2" />
              Cart
              {cartItemCount > 0 && (
                <Badge className="absolute -top-2 -right-2 min-w-5 h-5 text-xs">
                  {cartItemCount}
                </Badge>
              )}
            </Button>
          </div>
        </div>

        {/* Mobile navigation */}
        <div className="md:hidden pb-4">
          <div className="flex flex-wrap gap-2">
            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => onNavigate(item.path)}
                className={`px-3 py-1 text-sm rounded transition-colors ${
                  currentPage === item.path
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}