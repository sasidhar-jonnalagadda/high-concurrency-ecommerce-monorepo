'use client';

import { useState, useEffect } from 'react';
import { adminApi } from '@/lib/api';
import { FiBox, FiShoppingBag, FiDollarSign, FiActivity, FiRefreshCw } from 'react-icons/fi';
import { formatCurrency } from '@/lib/utils';

/**
 * Admin Dashboard Home.
 * Provides a professional high-level overview of system metrics.
 * Fetches real-time data from the specialized metrics endpoint.
 */
export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    totalSales: 0,
    totalOrders: 0,
    totalProducts: 0,
    activeOrders: 0
  });
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchStats = async () => {
    setIsRefreshing(true);
    try {
      const metrics = await adminApi.getMetrics();
      setStats(metrics);
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const statCards = [
    { label: 'Total Sales', value: formatCurrency(stats.totalSales), icon: <FiDollarSign />, color: 'var(--color-accent)' },
    { label: 'Global Orders', value: stats.totalOrders, icon: <FiShoppingBag />, color: 'var(--color-primary)' },
    { label: 'Catalog Size', value: stats.totalProducts, icon: <FiBox />, color: 'var(--color-success)' },
    { label: 'Active Orders', value: stats.activeOrders, icon: <FiActivity />, color: 'var(--color-warning)' },
  ];

  return (
    <div className="animate-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '8px' }}>Command Center</h2>
          <p style={{ color: 'var(--color-text-muted)' }}>Real-time overview of your platform performance</p>
        </div>
        <button 
          onClick={fetchStats}
          className="btn btn-ghost btn-sm" 
          disabled={isRefreshing}
          style={{ gap: '8px' }}
        >
          <FiRefreshCw className={isRefreshing ? 'spin' : ''} />
          Refresh Stats
        </button>
      </div>

      {/* Metrics Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '40px' }}>
        {statCards.map((card, i) => (
          <div 
            key={i} 
            style={{ 
              background: 'var(--color-bg-card)', 
              padding: '24px', 
              borderRadius: 'var(--radius-lg)', 
              border: '1px solid var(--color-border)',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}
          >
            <div style={{ 
              width: '40px', 
              height: '40px', 
              borderRadius: 'var(--radius-md)', 
              background: 'var(--color-bg-elevated)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              color: card.color
            }}>
              {card.icon}
            </div>
            <div>
              <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '4px' }}>{card.label}</div>
              {loading ? (
                <div className="skeleton" style={{ height: '32px', width: '100px' }} />
              ) : (
                <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{card.value}</div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
        <div style={{ 
          background: 'var(--color-bg-card)', 
          padding: '40px', 
          borderRadius: 'var(--radius-lg)', 
          border: '1px solid var(--color-border)',
          textAlign: 'center'
        }}>
          <div style={{ 
            width: '64px', 
            height: '64px', 
            borderRadius: '100px', 
            background: 'var(--color-bg-elevated)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            margin: '0 auto 20px',
            color: 'var(--color-primary)'
          }}>
            <FiActivity size={32} />
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '12px' }}>System Operational</h3>
          <p style={{ color: 'var(--color-text-muted)', maxWidth: '500px', margin: '0 auto', fontSize: '0.9rem', lineHeight: 1.6 }}>
            All systems are running normally. Active orders are being processed through the Stripe fulfillment pipeline. Use the sidebar to manage specific system modules.
          </p>
        </div>
      </div>
    </div>
  );
}
