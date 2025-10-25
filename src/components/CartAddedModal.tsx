import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, ShoppingCart } from '@phosphor-icons/react';
import { Product } from '@/lib/types';

interface CartAddedModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
  totalCartItems: number;
  onContinueShopping: () => void;
  onViewCart: () => void;
}

export function CartAddedModal({ 
  open, 
  onOpenChange, 
  product, 
  totalCartItems,
  onContinueShopping,
  onViewCart 
}: CartAddedModalProps) {
  if (!product) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-green-600">
            <CheckCircle size={24} weight="fill" />
            Added to Cart!
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Product Info */}
          <div className="flex items-start gap-4 p-4 bg-muted/50 rounded-lg">
            <img
              src={product.image}
              alt={product.name}
              className="w-16 h-16 object-cover rounded-md"
            />
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-sm line-clamp-2 mb-1">
                {product.name}
              </h3>
              <Badge variant="secondary" className="text-xs mb-2">
                {product.category}
              </Badge>
              <p className="text-lg font-semibold text-primary">
                ${typeof product.price === 'number' ? product.price.toFixed(2) : product.price}
              </p>
            </div>
          </div>

          {/* Cart Summary */}
          <div className="flex items-center justify-center gap-2 p-3 bg-primary/10 rounded-lg">
            <ShoppingCart size={20} className="text-primary" />
            <span className="font-medium">
              {totalCartItems} {totalCartItems === 1 ? 'item' : 'items'} in cart
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Button 
              variant="outline" 
              onClick={onContinueShopping}
              className="flex-1"
            >
              Continue Shopping
            </Button>
            <Button 
              onClick={onViewCart}
              className="flex-1"
            >
              View Cart
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}