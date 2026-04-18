'use client';
import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FiMail, FiLock, FiArrowRight } from 'react-icons/fi';
import { useAuthStore } from '@/hooks/use-auth';
export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, logout, isLoading } = useAuthStore();
  const router = useRouter();
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const res = await login(email, password);
      if (res?.user.role === 'ADMIN') {
        await logout();
        setError('Access Denied. Please use the Admin Portal to log in.');
      } else {
        router.push('/');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    }
  };
  return (
    <div className="container" style={{ maxWidth: '440px', paddingTop: '60px' }}>
      <div className="animate-in">
        <h1 className="page-title" style={{ textAlign: 'center' }}>Welcome Back</h1>
        <p className="page-subtitle" style={{ textAlign: 'center' }}>
          Sign in to your account
        </p>
        {error && (
          <div style={{
            padding: '12px 16px',
            background: 'rgba(255, 71, 87, 0.1)',
            border: '1px solid rgba(255, 71, 87, 0.3)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--color-danger)',
            fontSize: '0.85rem',
            marginBottom: '20px',
          }}>
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              <FiMail size={14} style={{ display: 'inline', marginRight: '6px' }} />
              Email Address
            </label>
            <input
              id="email"
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password" className="form-label">
              <FiLock size={14} style={{ display: 'inline', marginRight: '6px' }} />
              Password
            </label>
            <input
              id="password"
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isLoading}
            style={{ width: '100%', marginTop: '8px' }}
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
            <FiArrowRight size={18} />
          </button>
        </form>
        <p style={{
          textAlign: 'center',
          marginTop: '24px',
          fontSize: '0.9rem',
          color: 'var(--color-text-muted)',
        }}>
          Don&apos;t have an account?{' '}
          <Link href="/auth/register" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>
            Sign Up
          </Link>
        </p>
        
        <div style={{
          marginTop: '32px',
          paddingTop: '32px',
          borderTop: '1px solid var(--color-border)',
          textAlign: 'center'
        }}>
          <Link 
            href="/admin/login" 
            className="block w-full text-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 mt-4"
          >
            Sign in to Admin Portal
          </Link>
        </div>
      </div>
    </div>
  );
}
