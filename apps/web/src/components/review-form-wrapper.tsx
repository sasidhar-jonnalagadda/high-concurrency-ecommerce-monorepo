'use client';

import { useAuthStore } from '@/hooks/use-auth';
import { UserRole } from '@ecommerce/shared';
import { ReviewForm } from './review-form';
import Link from 'next/link';

interface Props {
  productId: string;
}

/**
 * Enhanced Review Form Wrapper.
 * Handles client-side role validation to ensure only USER accounts can post reviews.
 * Admins and guest users are provided with appropriate instructional states.
 */
export function ReviewFormWrapper({ productId }: Props) {
  const { user } = useAuthStore();

  if (!user) {
    return (
      <div className="card" style={{ padding: '32px', textAlign: 'center', background: 'var(--color-bg-elevated)' }}>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: '16px' }}>
          Please sign in to share your experience with this product.
        </p>
        <Link href="/auth/login" className="btn btn-secondary btn-sm">
          Sign In to Review
        </Link>
      </div>
    );
  }

  if (user.role === UserRole.ADMIN) {
    return (
      <div className="alert alert-warning" style={{ fontSize: '0.85rem' }}>
        <strong>Administrative Account:</strong> Review submission is restricted to customer accounts to maintain platform integrity.
      </div>
    );
  }

  return <ReviewForm productId={productId} />;
}
