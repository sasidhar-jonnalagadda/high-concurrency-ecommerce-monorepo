'use client';

import { useEffect } from 'react';
import { FiAlertCircle, FiRefreshCw } from 'react-icons/fi';

/**
 * Global error boundary for the application.
 * Provides a user-friendly recovery path during unexpected runtime failures.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error for observability
    console.error('Application Error:', error);
  }, [error]);

  return (
    <div className="container" style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '60vh',
      textAlign: 'center'
    }}>
      <FiAlertCircle size={48} style={{ color: 'var(--color-danger)', marginBottom: '24px' }} />
      <h1 className="page-title">Something went wrong</h1>
      <p className="page-subtitle" style={{ maxWidth: '400px', margin: '0 auto 32px' }}>
        We encountered an unexpected error. This might be due to a brief network interruption.
      </p>
      <div style={{ display: 'flex', gap: '16px' }}>
        <button
          onClick={() => reset()}
          className="btn btn-primary"
        >
          <FiRefreshCw size={18} />
          Try Again
        </button>
        <button
          onClick={() => window.location.href = '/'}
          className="btn btn-secondary"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
}
