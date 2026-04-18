'use client';

import { useState } from 'react';
import { adminApi } from '@/lib/api';
import { FiUserPlus, FiShield, FiMail, FiLock, FiCheckCircle } from 'react-icons/fi';

/**
 * Admin Account Management Page.
 * Allows current administrators to create new internal admin accounts.
 */
export default function ManageAdminsPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await adminApi.createAdminUser(formData);
      setSuccess(true);
      setFormData({ name: '', email: '', password: '' });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create admin account';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="animate-in" style={{ maxWidth: '600px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '8px' }}>Security & Admins</h2>
        <p style={{ color: 'var(--color-text-muted)' }}>Create and manage internal administrator accounts</p>
      </div>

      <div className="card" style={{ padding: '32px' }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '12px', 
          marginBottom: '24px',
          padding: '12px',
          background: 'var(--color-bg-elevated)',
          borderRadius: 'var(--radius-md)',
          color: 'var(--color-primary)',
          fontSize: '0.9rem',
          fontWeight: 600
        }}>
          <FiShield />
          New Admin Provisioning
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="form-group">
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: 600 }}>
              Full Name
            </label>
            <div style={{ position: 'relative' }}>
              <FiShield style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
              <input
                type="text"
                className="form-control"
                style={{ paddingLeft: '40px' }}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Operation Manager"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: 600 }}>
              Work Email
            </label>
            <div style={{ position: 'relative' }}>
              <FiMail style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
              <input
                type="email"
                className="form-control"
                style={{ paddingLeft: '40px' }}
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="name@platform.com"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: 600 }}>
              Initial Password
            </label>
            <div style={{ position: 'relative' }}>
              <FiLock style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
              <input
                type="password"
                className="form-control"
                style={{ paddingLeft: '40px' }}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>
          </div>

          {error && (
            <div className="alert alert-danger" style={{ fontSize: '0.875rem' }}>
              {error}
            </div>
          )}

          {success && (
            <div className="alert alert-success" style={{ fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FiCheckCircle />
              Admin account created successfully!
            </div>
          )}

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ marginTop: '8px', gap: '8px' }}
            disabled={isLoading}
          >
            <FiUserPlus />
            {isLoading ? 'Provisioning...' : 'Provision Admin Account'}
          </button>
        </form>
      </div>

      <div style={{ 
        marginTop: '32px', 
        padding: '20px', 
        border: '1px dashed var(--color-border)', 
        borderRadius: 'var(--radius-lg)',
        fontSize: '0.875rem',
        color: 'var(--color-text-muted)',
        lineHeight: 1.6
      }}>
        <strong>Security Notice:</strong> Newly created admin accounts have full access to products, orders, and financial metrics. Ensure work emails are verified before provisioning.
      </div>
    </div>
  );
}
