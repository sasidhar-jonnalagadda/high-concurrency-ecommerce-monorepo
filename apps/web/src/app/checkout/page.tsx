'use client';
import { useState, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FiMapPin, FiCreditCard, FiArrowRight } from 'react-icons/fi';
import { useCartStore } from '@/hooks/use-cart';
import { useAuthStore } from '@/hooks/use-auth';
import { checkoutApi, PaymentMethod } from '@/lib/api';
export default function CheckoutPage() {
  const router = useRouter();
  const { items, shippingAddress, setShippingAddress, itemsPrice, taxPrice, shippingPrice, totalPrice, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const [address, setAddress] = useState(shippingAddress?.address || '');
  const [city, setCity] = useState(shippingAddress?.city || '');
  const [postalCode, setPostalCode] = useState(shippingAddress?.postalCode || '');
  const [country, setCountry] = useState(shippingAddress?.country || 'India');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
    } else if (items.length === 0) {
      router.push('/cart');
    }
  }, [user, items.length, router]);

  if (!user || items.length === 0) {
    return null;
  }
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsProcessing(true);
    try {
      const shippingData = { address, city, postalCode, country };
      setShippingAddress(shippingData);
      const response = await checkoutApi.createSession({
        items: items.map((i) => ({ productId: i.productId, qty: i.qty })),
        shippingAddress: shippingData,
        paymentMethod: PaymentMethod.STRIPE,
      });
      if (response.url) {
        clearCart();
        window.location.href = response.url;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Checkout failed');
      setIsProcessing(false);
    }
  };
  return (
    <div className="container animate-in" style={{ maxWidth: '800px' }}>
      <h1 className="page-title">Checkout</h1>
      <p className="page-subtitle">Complete your order</p>
      {error && (
        <div style={{
          padding: '12px 16px',
          background: 'rgba(255, 71, 87, 0.1)',
          border: '1px solid rgba(255, 71, 87, 0.3)',
          borderRadius: 'var(--radius-md)',
          color: 'var(--color-danger)',
          fontSize: '0.85rem',
          marginBottom: '24px',
        }}>
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 350px',
          gap: '32px',
          alignItems: 'start',
        }}>
          <div style={{
            background: 'var(--color-bg-card)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)',
            padding: '28px',
          }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px', fontWeight: 700 }}>
              <FiMapPin size={20} />
              Shipping Address
            </h2>
            <div className="form-group">
              <label htmlFor="address" className="form-label">Street Address</label>
              <input id="address" className="form-input" value={address} onChange={(e) => setAddress(e.target.value)} required />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label htmlFor="city" className="form-label">City</label>
                <input id="city" className="form-input" value={city} onChange={(e) => setCity(e.target.value)} required />
              </div>
              <div className="form-group">
                <label htmlFor="postalCode" className="form-label">Postal Code</label>
                <input id="postalCode" className="form-input" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} required />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="country" className="form-label">Country</label>
              <input id="country" className="form-input" value={country} onChange={(e) => setCountry(e.target.value)} required />
            </div>
          </div>
          <div style={{
            background: 'var(--color-bg-card)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)',
            padding: '28px',
            position: 'sticky',
            top: '100px',
          }}>
            <h2 style={{ fontWeight: 700, marginBottom: '20px' }}>
              <FiCreditCard size={18} style={{ display: 'inline', marginRight: '8px' }} />
              Order Summary
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.9rem', marginBottom: '16px' }}>
              {items.map((item) => (
                <div key={item.productId} style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>{item.name} × {item.qty}</span>
                  <span>₹{(item.price * item.qty).toLocaleString()}</span>
                </div>
              ))}
            </div>
            <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.9rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>Subtotal</span>
                <span>₹{itemsPrice().toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>Shipping</span>
                <span>{shippingPrice() === 0 ? 'FREE' : `₹${shippingPrice()}`}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>Tax (18%)</span>
                <span>₹{taxPrice().toLocaleString()}</span>
              </div>
              <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '1.1rem' }}>
                <span>Total</span>
                <span style={{ color: 'var(--color-accent)' }}>₹{totalPrice().toLocaleString()}</span>
              </div>
            </div>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isProcessing}
              style={{ width: '100%', marginTop: '24px', fontSize: '1rem' }}
            >
              {isProcessing ? 'Processing...' : 'Pay with Stripe'}
              <FiArrowRight size={18} />
            </button>
            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textAlign: 'center', marginTop: '12px' }}>
              You will be redirected to Stripe&apos;s secure checkout page.
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}
