'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/hooks/use-auth';
import { UserRole, AuthResponse } from '@ecommerce/shared';

/**
 * Optimized Admin Login Page
 * Strictly contains a login form without a sign-up link, 
 * enforcing a dedicated management entry point.
 */
export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, logout, user, isLoading, error, clearError } = useAuthStore();
  const router = useRouter();

  // Redirect if already logged in as Admin
  useEffect(() => {
    if (user && user.role === UserRole.ADMIN) {
      router.push('/admin');
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    try {
      const response: AuthResponse = await login(email, password);
      // Wait for store to update, but we can also check the response directly 
      // if login returns the user data.
      const userData = response.user;
      
      if (userData && userData.role !== UserRole.ADMIN) {
        await logout();
        useAuthStore.setState({ error: 'Access Denied. Administrator credentials required.' });
        return;
      }
      
      router.push('/admin');
    } catch {
      // Error is caught by the store
    }
  };

  return (
    <div className="container" style={{ 
      minHeight: '80vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      padding: '40px 0'
    }}>
      <div className="card animate-in" style={{ width: '100%', maxWidth: '400px', padding: '40px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '8px' }}>Admin Portal</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Secure management access</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="form-group">
            <label htmlFor="email" style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: 600 }}>
              Management Email
            </label>
            <input
              id="email"
              type="email"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-black focus:border-black text-gray-900 bg-gray-50 transition-colors"
              value={email}
              onChange={(e) => { setEmail(e.target.value); clearError(); }}
              placeholder="admin@platform.com"
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: 600 }}>
              Password
            </label>
            <input
              id="password"
              type="password"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-black focus:border-black text-gray-900 bg-gray-50 transition-colors"
              value={password}
              onChange={(e) => { setPassword(e.target.value); clearError(); }}
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
          </div>

          {error && (
            <div className="alert alert-danger" style={{ fontSize: '0.875rem', padding: '12px' }}>
              {error}
            </div>
          )}

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', marginTop: '8px' }}
            disabled={isLoading}
          >
            {isLoading ? 'Authenticating...' : 'Access Dashboard'}
          </button>
        </form>

        <div style={{ marginTop: '32px', textAlign: 'center', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
          Strictly authorized access only. <br/>
          Internal systems monitoring in effect.
        </div>
      </div>
    </div>
  );
}
