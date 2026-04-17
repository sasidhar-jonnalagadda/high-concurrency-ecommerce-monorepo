'use client';

import { useAuthStore } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FiBox, FiShoppingBag, FiLayout, FiArrowLeft, FiShield } from 'react-icons/fi';
import { UserRole } from '@ecommerce/shared';

/**
 * Protected Admin Layout.
 * Verifies the user has the ADMIN role before rendering dashboard content.
 * Gracefully redirects unauthorized users to the home page.
 */
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading, fetchProfile } = useAuthStore();
  const router = useRouter();
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    const verify = async () => {
      // If we don't have a user, try to fetch the profile first 
      // (handles browser refreshes)
      if (!user) {
        await fetchProfile();
      }
      setIsVerifying(false);
    };
    verify();
  }, [user, fetchProfile]);

  useEffect(() => {
    if (!isVerifying && !isLoading) {
      if (!user || user.role !== UserRole.ADMIN) {
        router.push('/');
      }
    }
  }, [user, isLoading, isVerifying, router]);

  if (isVerifying || isLoading) {
    return (
      <div className="container" style={{ padding: '100px 0', textAlign: 'center' }}>
        <div className="skeleton" style={{ height: '40px', width: '200px', margin: '0 auto' }} />
        <p style={{ marginTop: '20px', color: 'var(--color-text-muted)' }}>Verifying Admin Access...</p>
      </div>
    );
  }

  if (!user || user.role !== UserRole.ADMIN) {
    return null; // Will be handled by the router.push
  }

  return (
    <div className="container" style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: '40px', padding: '40px 0' }}>
      <aside style={{ position: 'sticky', top: '100px', height: 'fit-content' }}>
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '8px', color: 'var(--color-primary)' }}>
            Admin Panel
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
            System Management
          </p>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <Link href="/admin" className="btn btn-ghost" style={{ justifyContent: 'flex-start', gap: '12px' }}>
            <FiLayout size={18} />
            Dashboard
          </Link>
          <Link href="/admin/products" className="btn btn-ghost" style={{ justifyContent: 'flex-start', gap: '12px' }}>
            <FiBox size={18} />
            Manage Products
          </Link>
          <Link href="/admin/orders" className="btn btn-ghost" style={{ justifyContent: 'flex-start', gap: '12px' }}>
            <FiShoppingBag size={18} />
            Global Orders
          </Link>
          <Link href="/admin/users" className="btn btn-ghost" style={{ justifyContent: 'flex-start', gap: '12px' }}>
            <FiShield size={18} />
            Manage Admins
          </Link>
          
          <hr style={{ border: '0', borderTop: '1px solid var(--color-border)', margin: '16px 0' }} />
          
          <Link href="/" className="btn btn-ghost btn-sm" style={{ justifyContent: 'flex-start', gap: '12px' }}>
            <FiArrowLeft size={16} />
            Back to Store
          </Link>
        </nav>
      </aside>

      <main className="animate-in">
        {children}
      </main>
    </div>
  );
}
