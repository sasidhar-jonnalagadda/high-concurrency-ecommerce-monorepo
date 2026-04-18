'use client';

import { useState, useEffect } from 'react';
import { adminApi } from '@/lib/api';
import { Order, OrderStatus } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { FiExternalLink, FiRefreshCw, FiAlertCircle } from 'react-icons/fi';
import Link from 'next/link';

/**
 * Admin Order Management Page.
 * Displays all orders globally and allows admins to update status in real-time.
 */
export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const res = await adminApi.getOrders(1);
      setOrders(res.data);
    } catch {
      console.error('Failed to fetch orders');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (id: string, newStatus: string) => {
    const confirmMsg = newStatus === OrderStatus.CANCELLED 
      ? "🚨 Warning: Setting an order to CANCELLED will automatically trigger a full Stripe refund. Proceed?"
      : `Update order to ${newStatus}?`;

    if (!window.confirm(confirmMsg)) return;

    setIsUpdating(id);
    try {
      await adminApi.updateOrderStatus(id, newStatus);
      await fetchOrders();
    } catch {
      alert('Failed to update order status');
    } finally {
      setIsUpdating(null);
    }
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PAID: return 'var(--color-success)';
      case OrderStatus.DELIVERED: return 'var(--color-primary)';
      case OrderStatus.CANCELLED: return 'var(--color-danger)';
      case OrderStatus.REFUNDED: return 'var(--color-text-muted)';
      default: return 'var(--color-warning)';
    }
  };

  if (isLoading) {
    return (
      <div>
        <div className="skeleton" style={{ height: '400px', borderRadius: 'var(--radius-lg)' }} />
      </div>
    );
  }

  return (
    <div className="animate-in">
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Global Orders Dashboard</h2>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>View and manage every order across the platform</p>
      </div>

      <div style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'var(--color-bg-elevated)', borderBottom: '1px solid var(--color-border)' }}>
              <th style={{ padding: '16px', fontSize: '0.875rem', fontWeight: 600 }}>Order ID</th>
              <th style={{ padding: '16px', fontSize: '0.875rem', fontWeight: 600 }}>Customer</th>
              <th style={{ padding: '16px', fontSize: '0.875rem', fontWeight: 600 }}>Total</th>
              <th style={{ padding: '16px', fontSize: '0.875rem', fontWeight: 600 }}>Date</th>
              <th style={{ padding: '16px', fontSize: '0.875rem', fontWeight: 600 }}>Status</th>
              <th style={{ padding: '16px', fontSize: '0.875rem', fontWeight: 600, textAlign: 'right' }}>Manage</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                <td style={{ padding: '16px', fontSize: '0.875rem', fontFamily: 'monospace' }}>
                  <Link href={`/admin/orders/${order.id}`} style={{ color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    #{order.id.slice(-8).toUpperCase()}
                    <FiExternalLink size={12} />
                  </Link>
                </td>
                <td style={{ padding: '16px' }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>{order.user?.name || 'Guest'}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{order.user?.email || 'N/A'}</div>
                </td>
                <td style={{ padding: '16px', fontSize: '0.875rem', fontWeight: 700 }}>{formatCurrency(Number(order.totalPrice))}</td>
                <td style={{ padding: '16px', fontSize: '0.875rem' }}>{formatDate(order.createdAt)}</td>
                <td style={{ padding: '16px' }}>
                  <span 
                    className="badge" 
                    style={{ 
                      background: 'none', 
                      border: `1px solid ${getStatusColor(order.status)}`,
                      color: getStatusColor(order.status),
                      fontSize: '0.7rem'
                    }}
                  >
                    {order.status}
                  </span>
                </td>
                <td style={{ padding: '16px', textAlign: 'right' }}>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                    {isUpdating === order.id ? (
                      <FiRefreshCw className="spin" style={{ color: 'var(--color-primary)' }} />
                    ) : (
                      <select 
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        style={{
                          padding: '6px 10px',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--color-border)',
                          background: '#0f172a', // slate-900 for high contrast
                          color: '#ffffff',
                          fontSize: '0.8rem',
                          cursor: 'pointer'
                        }}
                      >
                        {Object.values(OrderStatus).map((status) => (
                          <option key={status} value={status}>{status}</option>
                        ))}
                      </select>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: '24px', display: 'flex', gap: '16px', color: 'var(--color-text-muted)', fontSize: '0.8rem', alignItems: 'center' }}>
        <FiAlertCircle />
        Setting status to CANCELLED will attempt an automated Stripe refund.
      </div>
    </div>
  );
}
