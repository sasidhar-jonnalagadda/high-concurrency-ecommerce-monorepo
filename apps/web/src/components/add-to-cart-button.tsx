'use client';

import { useState } from 'react';
import { FiShoppingCart, FiMinus, FiPlus } from 'react-icons/fi';
import { useCartStore } from '@/hooks/use-cart';
import { useAuthStore } from '@/hooks/use-auth';
import { UserRole } from '@ecommerce/shared';
import type { Product } from '@/lib/api';

interface Props {
  product: Product;
}

/**
 * Interactive button component for managing product quantities and adding to cart.
 * Provides visual feedback during the "added" state and prevents overselling.
 */
export function AddToCartButton({ product }: Props) {
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const addItem = useCartStore((s) => s.addItem);
  const { user } = useAuthStore();

  const isAdmin = user?.role === UserRole.ADMIN;

  const handleAdd = () => {
    if (isAdmin) return;
    addItem({
      productId: product.id,
      name: product.name,
      image: product.image,
      price: Number(product.price),
      countInStock: product.countInStock,
      qty,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  if (isAdmin) {
    return (
      <button 
        className="btn btn-secondary" 
        disabled 
        style={{ width: '100%', opacity: 0.8, cursor: 'not-allowed' }}
      >
        Administrators cannot purchase
      </button>
    );
  }

  if (product.countInStock === 0) {
    return (
      <button 
        className="btn btn-secondary" 
        disabled 
        style={{ width: '100%', opacity: 0.5 }}
        aria-label="Product Out of Stock"
      >
        Out of Stock
      </button>
    );
  }

  return (
    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
      <div 
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
          overflow: 'hidden',
        }}
        role="group"
        aria-label="Quantity Selector"
      >
        <button
          onClick={() => setQty((q) => Math.max(1, q - 1))}
          style={{
            padding: '12px 14px',
            background: 'var(--color-bg-card)',
            color: 'var(--color-text)',
            border: 'none',
            cursor: 'pointer',
          }}
          aria-label="Decrease quantity"
          disabled={qty <= 1}
        >
          <FiMinus size={16} />
        </button>
        <span 
          style={{
            padding: '12px 20px',
            fontWeight: 600,
            minWidth: '48px',
            textAlign: 'center',
            background: 'var(--color-bg)',
          }}
          aria-live="polite"
        >
          {qty}
        </span>
        <button
          onClick={() => setQty((q) => Math.min(product.countInStock, q + 1))}
          style={{
            padding: '12px 14px',
            background: 'var(--color-bg-card)',
            color: 'var(--color-text)',
            border: 'none',
            cursor: 'pointer',
          }}
          aria-label="Increase quantity"
          disabled={qty >= product.countInStock}
        >
          <FiPlus size={16} />
        </button>
      </div>

      <button
        onClick={handleAdd}
        className="btn btn-primary"
        style={{
          flex: 1,
          background: added
            ? 'linear-gradient(135deg, var(--color-success), #1db954)'
            : undefined,
        }}
        aria-label={added ? 'Item added to cart' : 'Add item to cart'}
      >
        <FiShoppingCart size={18} />
        {added ? 'Added to Cart ✓' : 'Add to Cart'}
      </button>
    </div>
  );
}
