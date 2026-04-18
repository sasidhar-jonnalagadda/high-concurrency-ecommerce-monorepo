'use client';

import Image from 'next/image';
import Link from 'next/link';
import { FiTrash2, FiMinus, FiPlus, FiArrowRight, FiShoppingBag } from 'react-icons/fi';
import { useCartStore } from '@/hooks/use-cart';
import { formatCurrency } from '@/lib/utils';

/**
 * Shopping Cart Page
 * Includes a hydration guard to safely render local storage items 
 * and standardized currency formatting.
 */
export default function CartPage() {
  const { 
    items, 
    isHydrated,
    removeItem, 
    updateQty, 
    itemsPrice, 
    taxPrice, 
    shippingPrice, 
    totalPrice 
  } = useCartStore();

  if (!isHydrated) {
    return (
      <div className="container">
        <div className="skeleton" style={{ height: '400px', borderRadius: 'var(--radius-lg)', marginTop: '24px' }} />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container animate-in" style={{ textAlign: 'center', padding: '100px 0' }}>
        <FiShoppingBag size={64} style={{ color: 'var(--color-text-muted)', marginBottom: '24px' }} />
        <h1 className="page-title">Your cart is empty</h1>
        <p className="page-subtitle" style={{ marginBottom: '32px' }}>
          Looks like you haven&apos;t added anything to your cart yet.
        </p>
        <Link href="/products" className="btn btn-primary">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="container animate-in">
      <h1 className="page-title">Shopping Cart</h1>
      <p className="page-subtitle">
        You have {items.length} {items.length === 1 ? 'item' : 'items'} in your cart
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '32px', alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {items.map((item) => (
            <div
              key={item.productId}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '20px',
                padding: '20px',
                background: 'var(--color-bg-card)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-lg)',
              }}
            >
              <div style={{ 
                width: '100px', 
                height: '100px', 
                background: 'var(--color-bg)', 
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '10px'
              }}>
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  style={{ objectFit: 'contain' }}
                />
              </div>

              <div style={{ flex: 1 }}>
                <h3 style={{ fontWeight: 600, marginBottom: '4px', fontSize: '1.1rem' }}>{item.name}</h3>
                <p style={{ color: 'var(--color-accent)', fontWeight: 700 }}>
                  {formatCurrency(item.price)}
                </p>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
                background: 'var(--color-bg)',
              }}>
                <button
                  onClick={() => updateQty(item.productId, Math.max(1, item.qty - 1))}
                  style={{ padding: '10px 12px', background: 'none', color: 'var(--color-text)', border: 'none', cursor: 'pointer' }}
                  aria-label="Decrease quantity"
                >
                  <FiMinus size={14} />
                </button>
                <span style={{ padding: '10px 16px', fontWeight: 600, minWidth: '40px', textAlign: 'center' }}>
                  {item.qty}
                </span>
                <button
                  onClick={() => updateQty(item.productId, Math.min(item.countInStock, item.qty + 1))}
                  style={{ padding: '10px 12px', background: 'none', color: 'var(--color-text)', border: 'none', cursor: 'pointer' }}
                  aria-label="Increase quantity"
                >
                  <FiPlus size={14} />
                </button>
              </div>

              <p style={{ fontWeight: 700, minWidth: '100px', textAlign: 'right', fontSize: '1.1rem' }}>
                {formatCurrency(item.price * item.qty)}
              </p>

              <button 
                onClick={() => removeItem(item.productId)} 
                className="btn btn-danger btn-sm"
                aria-label={`Remove ${item.name} from cart`}
              >
                <FiTrash2 size={16} />
              </button>
            </div>
          ))}
        </div>

        <div style={{
          background: 'var(--color-bg-card)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-lg)',
          padding: '32px',
          position: 'sticky',
          top: '100px',
        }}>
          <h2 style={{ fontWeight: 700, marginBottom: '24px', fontSize: '1.3rem', letterSpacing: '-0.01em' }}>
            Order Summary
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '0.95rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--color-text-muted)' }}>Items Total</span>
              <span style={{ fontWeight: 600 }}>{formatCurrency(itemsPrice())}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--color-text-muted)' }}>Shipping Estimate</span>
              <span style={{ fontWeight: 600, color: shippingPrice() === 0 ? 'var(--color-success)' : 'inherit' }}>
                {shippingPrice() === 0 ? 'FREE' : formatCurrency(shippingPrice())}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--color-text-muted)' }}>Estimated Tax (GST)</span>
              <span style={{ fontWeight: 600 }}>{formatCurrency(taxPrice())}</span>
            </div>
            <div style={{
              borderTop: '1px solid var(--color-border)',
              paddingTop: '20px',
              marginTop: '8px',
              display: 'flex',
              justifyContent: 'space-between',
              fontWeight: 800,
              fontSize: '1.25rem',
            }}>
              <span>Total Price</span>
              <span style={{ color: 'var(--color-accent)' }}>{formatCurrency(totalPrice())}</span>
            </div>
          </div>
          <Link
            href="/checkout"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '32px', fontSize: '1.1rem', padding: '16px' }}
          >
            Proceed to Checkout
            <FiArrowRight size={20} />
          </Link>
        </div>
      </div>
    </div>
  );
}
