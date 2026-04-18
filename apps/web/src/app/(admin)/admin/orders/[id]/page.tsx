'use client';

import { useEffect, useState, use, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  FiPackage, 
  FiMapPin, 
  FiCreditCard, 
  FiUser, 
  FiActivity, 
  FiRefreshCw, 
  FiArrowLeft,
  FiExternalLink
} from 'react-icons/fi';
import { orderApi, adminApi } from '@/lib/api';
import { Order, OrderStatus } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import Link from 'next/link';

interface Props {
  params: Promise<{ id: string }>;
}

/**
 * Dedicated Admin Order Management Detail Page.
 * Unlike the consumer-facing detail page, this version is isolated within the 
 * (admin) layout to prevent layout leaks (Header/Footer). 
 * It displays administrative metadata like Stripe Payment Intent IDs and 
 * provides inline status workflow controls.
 */
export default function AdminOrderDetailPage({ params }: Props) {
  const { id: orderId } = use(params);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchOrderDetails = useCallback(async () => {
    try {
      const data = await orderApi.getById(orderId);
      setOrder(data);
    } catch {
      console.error('Failed to load order details');
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    fetchOrderDetails();
  }, [fetchOrderDetails]);

  const handleStatusChange = async (newStatus: string) => {
    const confirmMsg = newStatus === OrderStatus.CANCELLED 
      ? "🚨 Warning: Setting an order to CANCELLED will automatically trigger a full Stripe refund. Proceed?"
      : `Update order to ${newStatus}?`;

    if (!window.confirm(confirmMsg)) return;

    setIsUpdating(true);
    try {
      await adminApi.updateOrderStatus(orderId, newStatus);
      await fetchOrderDetails();
    } catch {
      alert('Failed to update order status');
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-in">
        <div className="skeleton" style={{ height: '400px', borderRadius: 'var(--radius-lg)' }} />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="animate-in" style={{ textAlign: 'center', padding: '100px 0' }}>
        <h2 style={{ fontWeight: 800 }}>Order Not Found</h2>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: '24px' }}>The requested order ID does not exist.</p>
        <Link href="/admin/orders" className="btn btn-primary">Back to Orders</Link>
      </div>
    );
  }

  return (
    <div className="animate-in">
      <div style={{ marginBottom: '32px' }}>
        <Link href="/admin/orders" className="header-link" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '16px', fontSize: '0.85rem' }}>
          <FiArrowLeft size={14} />
          Back to Global Orders
        </Link>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
              Management View: #{order.id.toUpperCase()}
            </h1>
            <p style={{ color: 'var(--color-text-muted)', marginTop: '4px' }}>
              System Transaction ID: {order.id}
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '8px', fontWeight: 600, textTransform: 'uppercase' }}>Workflow Management</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {isUpdating && <FiRefreshCw className="spin" style={{ color: 'var(--color-primary)' }} />}
              <select 
                value={order.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                disabled={isUpdating}
                style={{
                  padding: '10px 16px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                  background: '#0f172a',
                  color: '#ffffff',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                {Object.values(OrderStatus).map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '32px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {/* Items Section */}
          <section className="card" style={{ padding: '24px' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <FiPackage style={{ color: 'var(--color-primary)' }} />
              Purchased Manifest
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {order.orderItems.map((item) => (
                <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', background: 'var(--color-bg-elevated)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                  <img 
                    src={item.product?.image} 
                    alt={item.product?.name} 
                    style={{ width: '48px', height: '48px', objectFit: 'contain', background: '#fff', padding: '4px', borderRadius: 'var(--radius-sm)' }} 
                  />
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 700, fontSize: '0.9rem' }}>{item.product?.name}</p>
                    <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>SKU: {item.productId.toUpperCase()}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontWeight: 700 }}>{formatCurrency(item.price)} × {item.qty}</p>
                    <p style={{ fontSize: '0.8rem', color: 'var(--color-primary)', fontWeight: 600 }}>{formatCurrency(Number(item.price) * item.qty)}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Logistics Section */}
          <section className="card" style={{ padding: '24px' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <FiMapPin style={{ color: 'var(--color-primary)' }} />
              Logistics & Fulfillment
            </h2>
            <div style={{ padding: '20px', background: 'var(--color-bg-elevated)', borderRadius: 'var(--radius-md)', border: '1px dashed var(--color-border)' }}>
              <p style={{ fontWeight: 700, marginBottom: '4px' }}>Destination:</p>
              <p style={{ color: 'var(--color-text-muted)' }}>{order.shippingAddress.address}</p>
              <p style={{ color: 'var(--color-text-muted)' }}>{order.shippingAddress.city}, {order.shippingAddress.postalCode}</p>
              <p style={{ color: 'var(--color-text-muted)' }}>{order.shippingAddress.country}</p>
            </div>
          </section>
        </div>

        <aside style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {/* Customer Metadata */}
          <section className="card" style={{ padding: '24px' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <FiUser style={{ color: 'var(--color-primary)' }} />
              Customer Identity
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Full Name</p>
                <p style={{ fontWeight: 600 }}>{order.user?.name || 'Guest User'}</p>
              </div>
              <div>
                <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Account Email</p>
                <p style={{ color: 'var(--color-primary)', fontWeight: 600 }}>{order.user?.email || 'N/A'}</p>
              </div>
            </div>
          </section>

          {/* Payment & Financials */}
          <section className="card" style={{ padding: '24px', border: '1px solid var(--color-primary)', background: 'rgba(59, 130, 246, 0.05)' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <FiCreditCard style={{ color: 'var(--color-primary)' }} />
              Financial Audit
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Payment Provider</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
                  <FiExternalLink size={14} />
                  {order.paymentMethod}
                </div>
              </div>
              <div>
                <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Stripe Payment Intent</p>
                <p style={{ fontFamily: 'monospace', fontSize: '0.8rem', wordBreak: 'break-all' }}>
                  {order.stripePaymentIntentId || 'No direct intent recorded'}
                </p>
              </div>
              <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>Subtotal:</span>
                  <span>{formatCurrency(order.itemsPrice)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', fontSize: '0.9rem', fontWeight: 700 }}>
                  <span>Grand Total:</span>
                  <span style={{ color: 'var(--color-accent)', fontSize: '1.1rem' }}>{formatCurrency(order.totalPrice)}</span>
                </div>
              </div>
            </div>
          </section>

          {/* Lifecycle */}
          <section className="card" style={{ padding: '24px' }}>
             <h2 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <FiActivity style={{ color: 'var(--color-primary)' }} />
              Audit Logs
            </h2>
            <div style={{ fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>Created:</span>
                <span>{formatDate(order.createdAt)}</span>
              </div>
              {order.paidAt && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>Paid:</span>
                  <span style={{ color: 'var(--color-success)', fontWeight: 600 }}>{formatDate(order.paidAt)}</span>
                </div>
              )}
              {order.deliveredAt && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>Delivered:</span>
                  <span style={{ color: 'var(--color-primary)', fontWeight: 600 }}>{formatDate(order.deliveredAt)}</span>
                </div>
              )}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
