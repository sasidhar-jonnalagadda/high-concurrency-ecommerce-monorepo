'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { FiPackage, FiMapPin, FiCreditCard, FiCheck } from 'react-icons/fi';
import { useAuthStore } from '@/hooks/use-auth';
import { orderApi } from '@/lib/api';
import { Order } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';

interface Props {
  params: Promise<{ id: string }>;
}

/**
 * Detailed view of a single order.
 * Displays progress tracking, items list, shipping address, and pricing summary.
 */
export default function OrderDetailPage({ params }: Props) {
  const { user } = useAuthStore();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [orderId, setOrderId] = useState('');

  useEffect(() => {
    params.then((p) => setOrderId(p.id));
  }, [params]);

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }

    if (!orderId) return;

    orderApi.getById(orderId)
      .then(setOrder)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user, orderId, router]);

  if (loading || !order) {
    return (
      <div className="container">
        <div className="skeleton" style={{ height: '400px', borderRadius: 'var(--radius-lg)', marginTop: '24px' }} />
      </div>
    );
  }

  const statusSteps = ['PENDING', 'PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED'];
  const currentStep = statusSteps.indexOf(order.status);

  return (
    <div className="container animate-in" style={{ maxWidth: '900px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 className="page-title">Order #{order.id.slice(-8).toUpperCase()}</h1>
          <p className="page-subtitle" style={{ marginBottom: 0 }}>
            Placed on {formatDate(order.createdAt)}
          </p>
        </div>
        <span className={`badge ${order.status === 'CANCELLED' ? 'badge-danger' : order.status === 'DELIVERED' ? 'badge-success' : 'badge-info'}`}
              style={{ fontSize: '0.9rem', padding: '8px 20px' }}>
          {order.status}
        </span>
      </div>

      {order.status !== 'CANCELLED' && order.status !== 'REFUNDED' && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: '40px',
          padding: '24px',
          background: 'var(--color-bg-card)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-border)',
        }}>
          {statusSteps.map((step, i) => (
            <div key={step} style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              flex: 1,
              position: 'relative',
            }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: i <= currentStep ? 'var(--color-primary)' : 'var(--color-bg)',
                border: `2px solid ${i <= currentStep ? 'var(--color-primary)' : 'var(--color-border)'}`,
                fontSize: '0.8rem',
                fontWeight: 700,
                marginBottom: '8px',
                transition: 'all var(--transition-normal)',
              }}>
                {i <= currentStep ? <FiCheck size={16} /> : i + 1}
              </div>
              <span style={{
                fontSize: '0.7rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                color: i <= currentStep ? 'var(--color-text)' : 'var(--color-text-muted)',
              }}>
                {step}
              </span>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '24px' }}>
        <div>
          <h2 style={{ fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FiPackage size={18} />
            Items
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {order.orderItems.map((item) => (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  padding: '16px',
                  background: 'var(--color-bg-card)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                }}
              >
                <Image
                  src={item.product?.image || '/placeholder.jpg'}
                  alt={item.product?.name || 'Product'}
                  width={56}
                  height={56}
                  style={{ objectFit: 'contain', borderRadius: 'var(--radius-sm)' }}
                />
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 600 }}>{item.product?.name || 'Product'}</p>
                  <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                    {formatCurrency(item.price)} × {item.qty}
                  </p>
                </div>
                <p style={{ fontWeight: 700 }}>{formatCurrency(Number(item.price) * item.qty)}</p>
              </div>
            ))}
          </div>

          <h2 style={{ fontWeight: 700, marginTop: '32px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FiMapPin size={18} />
            Shipping Address
          </h2>
          <div style={{
            padding: '16px',
            background: 'var(--color-bg-card)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.9rem',
          }}>
            <p>{order.shippingAddress.address}</p>
            <p>{order.shippingAddress.city}, {order.shippingAddress.postalCode}</p>
            <p>{order.shippingAddress.country}</p>
          </div>
        </div>

        <div style={{
          background: 'var(--color-bg-card)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-lg)',
          padding: '24px',
          alignSelf: 'start',
          position: 'sticky',
          top: '100px',
        }}>
          <h2 style={{ fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FiCreditCard size={18} />
            Summary
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.9rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--color-text-muted)' }}>Items</span>
              <span>{formatCurrency(order.itemsPrice)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--color-text-muted)' }}>Shipping</span>
              <span>{Number(order.shippingPrice) === 0 ? 'FREE' : formatCurrency(order.shippingPrice)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--color-text-muted)' }}>Tax</span>
              <span>{formatCurrency(order.taxPrice)}</span>
            </div>
            <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '1.1rem' }}>
              <span>Total</span>
              <span style={{ color: 'var(--color-accent)' }}>{formatCurrency(order.totalPrice)}</span>
            </div>
          </div>
          <div style={{ marginTop: '20px', padding: '12px', background: 'var(--color-bg)', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
            <p>Payment: {order.paymentMethod}</p>
            {order.paidAt && <p>Paid: {formatDate(order.paidAt)}</p>}
            {order.deliveredAt && <p>Delivered: {formatDate(order.deliveredAt)}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
