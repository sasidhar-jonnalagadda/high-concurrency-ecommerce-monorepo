'use client';

import Link from 'next/link';
import { FiShoppingCart, FiUser, FiLogOut, FiSettings } from 'react-icons/fi';
import { useCartStore } from '@/hooks/use-cart';
import { useAuthStore } from '@/hooks/use-auth';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Global application header.
 * Implements the standard React 18 hydration bypass pattern (isMounted)
 * to prevent getServerSnapshot and hydration mismatch errors.
 */
export function Header() {
  const [isMounted, setIsMounted] = useState(false);
  const pathname = usePathname();
  const isAdminPath = pathname?.startsWith('/admin');
  
  // Stabilized selectors: Accessing individual properties prevents 
  // returning a new object reference on every render.
  const totalItems = useCartStore((s) => s.totalItems());
  const cartHydrated = useCartStore((s) => s.isHydrated);
  
  const { user, fetchProfile, logout } = useAuthStore();
  const isConsumerVisible = !user || user.role === 'USER';

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);
    fetchProfile();
  }, [fetchProfile]);

  return (
    <header className="header">
      <div className="header-inner">
        <Link href="/" className="header-logo" aria-label="ShopElite Home">
          ShopElite
        </Link>
        <nav className="header-nav" aria-label="Main Navigation">
          <Link href="/products" className="header-link">
            Products
          </Link>
          
          {isConsumerVisible && (
            <Link 
              href="/cart" 
              className="header-link" 
              style={{ position: 'relative' }}
              aria-label={`View Cart: ${isMounted && cartHydrated ? totalItems : 0} items`}
            >
              <FiShoppingCart size={18} />
              Cart
              {/* Hydration Guard: Only render client-side specific state after mounting */}
              {isMounted && cartHydrated && totalItems > 0 && (
                <span className="cart-badge" aria-hidden="true">{totalItems}</span>
              )}
            </Link>
          )}

          {isMounted && user ? (
            <>
              {isConsumerVisible && (
                <Link href="/orders" className="header-link">
                  My Orders
                </Link>
              )}
              {user.role === 'ADMIN' && (
                <Link href="/admin/products" className="header-link" aria-label="Admin Dashboard">
                  <FiSettings size={16} />
                  Admin
                </Link>
              )}
              <button
                onClick={async () => {
                  await logout();
                  window.location.href = '/';
                }}
                className="header-link"
                style={{ background: 'none' }}
                aria-label="Logout"
              >
                <FiLogOut size={16} />
                Logout
              </button>
            </>
          ) : isMounted && !user ? (
            <Link href="/auth/login" className="btn btn-primary btn-sm" aria-label="Sign In">
              <FiUser size={14} />
              Sign In
            </Link>
          ) : (
            // Server-side / Hydration placeholder to maintain layout stability
            <div style={{ width: '80px', height: '32px' }} />
          )}
        </nav>
      </div>
    </header>
  );
}
