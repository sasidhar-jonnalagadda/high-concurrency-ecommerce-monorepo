export const dynamic = "force-dynamic";
import Link from 'next/link';
import { FiStar, FiArrowRight } from 'react-icons/fi';
import { productApi, Product } from '@/lib/api';
import { ProductCard } from '@/components/product-card';
async function getTopProducts(): Promise<Product[]> {
  try {
    return await productApi.getTop();
  } catch {
    return [];
  }
}
export default async function HomePage() {
  const topProducts = await getTopProducts();
  return (
    <div className="container animate-in">
      <section style={{
        textAlign: 'center',
        padding: '80px 0 60px',
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          background: 'var(--color-primary-soft)',
          padding: '6px 16px',
          borderRadius: '999px',
          fontSize: '0.8rem',
          fontWeight: 600,
          color: 'var(--color-primary)',
          marginBottom: '24px',
        }}>
          <FiStar size={14} />
          Premium Quality Products
        </div>
        <h1 style={{
          fontSize: 'clamp(2.5rem, 6vw, 4rem)',
          fontWeight: 800,
          lineHeight: 1.1,
          letterSpacing: '-0.03em',
          marginBottom: '20px',
        }}>
          <span style={{
            background: 'linear-gradient(135deg, var(--color-text), var(--color-primary))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            Shop the Future.
          </span>
          <br />
          <span style={{ color: 'var(--color-text-muted)', fontSize: '0.6em' }}>
            Premium tech at unbeatable prices.
          </span>
        </h1>
        <p style={{
          color: 'var(--color-text-muted)',
          maxWidth: '560px',
          margin: '0 auto 40px',
          fontSize: '1.1rem',
        }}>
          Discover our curated collection of premium electronics,
          gadgets, and accessories — delivered with speed and confidence.
        </p>
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
          <Link href="/products" className="btn btn-primary" style={{ fontSize: '1rem', padding: '14px 32px' }}>
            Browse Products
            <FiArrowRight size={18} />
          </Link>
        </div>
      </section>
      {topProducts.length > 0 && (
        <section style={{ paddingBottom: '60px' }}>
          <h2 className="page-title" style={{ textAlign: 'center', marginBottom: '40px' }}>
            Top Rated Products
          </h2>
          <div className="grid-products">
            {topProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
