import { productApi } from '@/lib/api';
import { ProductCard } from '@/components/product-card';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'All Products',
  description: 'Browse our premium collection of electronics and gadgets.',
};

interface Props {
  searchParams: Promise<{ page?: string; keyword?: string; category?: string }>;
}

/**
 * Products Listing Page
 * Implements client-side pagination with Next.js Link and robust error fallbacks.
 */
export default async function ProductsPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const keyword = params.keyword || '';
  const category = params.category || '';
  
  let data;
  try {
    data = await productApi.getAll(page, keyword, category);
  } catch (err) {
    console.error('Failed to fetch products:', err);
    data = { data: [], page: 1, pages: 1, total: 0 };
  }

  return (
    <div className="container animate-in">
      <div style={{ marginBottom: '40px' }}>
        <h1 className="page-title">
          {keyword ? `Search Results for "${keyword}"` : category || 'All Products'}
        </h1>
        <p className="page-subtitle">
          Showing {data.total} {data.total === 1 ? 'product' : 'products'}
        </p>
      </div>

      {data.data.length > 0 ? (
        <>
          <div className="grid-products">
            {data.data.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {data.pages > 1 && (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '8px',
              marginTop: '64px',
            }}>
              {Array.from({ length: data.pages }, (_, i) => i + 1).map((p) => {
                const queryParams = new URLSearchParams();
                queryParams.set('page', p.toString());
                if (keyword) queryParams.set('keyword', keyword);
                if (category) queryParams.set('category', category);

                return (
                  <Link
                    key={p}
                    href={`/products?${queryParams.toString()}`}
                    className={p === data.page ? 'btn btn-primary btn-sm' : 'btn btn-secondary btn-sm'}
                    aria-label={`Go to page ${p}`}
                    aria-current={p === data.page ? 'page' : undefined}
                  >
                    {p}
                  </Link>
                );
              })}
            </div>
          )}
        </>
      ) : (
        <div style={{
          textAlign: 'center',
          padding: '120px 0',
          background: 'var(--color-bg-card)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-border)',
        }}>
          <p style={{ fontSize: '1.2rem', color: 'var(--color-text-muted)', marginBottom: '16px' }}>
            No products found matching your criteria.
          </p>
          <Link href="/products" className="btn btn-primary">
            Clear Filters
          </Link>
        </div>
      )}
    </div>
  );
}
