'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FiPackage, FiClock } from 'react-icons/fi';
import { useAuthStore } from '@/hooks/use-auth';
import { orderApi, type Order } from '@/lib/api';
export default function OrdersPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    orderApi.getMyOrders().then(setOrders).catch(() => {}).finally(() => setLoading(false));
  }, [user, router]);
  if (loading) {
    return (
      <div className="container">
        <h1 className="page-title">My Orders</h1>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '24px' }}>
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton" style={{ height: '100px', borderRadius: 'var(--radius-md)' }} />
          ))}
        </div>
      </div>
    );
  }
  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      PENDING: 'badge-warning',
      PAID: 'badge-success',
      PROCESSING: 'badge-info',
      SHIPPED: 'badge-info',
      DELIVERED: 'badge-success',
      CANCELLED: 'badge-danger',
      REFUNDED: 'badge-danger',
    };
    return map[status] || 'badge-info';
  };
  return (
    <div className="container animate-in">
      <h1 className="page-title">My Orders</h1>
      <p className="page-subtitle">{orders.length} {orders.length === 1 ? 'order' : 'orders'}</p>
      {orders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <FiPackage size={64} style={{ color: 'var(--color-text-muted)', marginBottom: '24px' }} />
          <p style={{ color: 'var(--color-text-muted)', fontSize: '1.1rem', marginBottom: '24px' }}>
            You haven&apos;t placed any orders yet.
          </p>
          <Link href="/products" className="btn btn-primary">Start Shopping</Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/orders/${order.id}`}
              className="card"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '20px 24px',
              }}
            >
              <div>
                <p style={{ fontWeight: 600, marginBottom: '4px' }}>
                  Order #{order.id.slice(-8).toUpperCase()}
                </p>
                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <FiClock size={12} />
                  {new Date(order.createdAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <span className={`badge ${statusBadge(order.status)}`}>
                  {order.status}
                </span>
                <span style={{ fontWeight: 700, color: 'var(--color-accent)' }}>
                  ₹{Number(order.totalPrice).toLocaleString()}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
