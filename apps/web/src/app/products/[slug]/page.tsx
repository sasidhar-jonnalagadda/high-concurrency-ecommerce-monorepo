import { productApi } from '@/lib/api';
import { ProductImage } from '@/components/product-image';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { FiStar, FiPackage, FiArrowLeft } from 'react-icons/fi';
import { AddToCartButton } from '@/components/add-to-cart-button';
import { ReviewFormWrapper } from '@/components/review-form-wrapper';
import { formatCurrency, formatDate } from '@/lib/utils';
import Link from 'next/link';

interface Props {
  params: Promise<{ slug: string }>;
}

/**
 * Dynamic SEO Metadata Generation
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const product = await productApi.getBySlug(slug);
    return {
      title: product.name,
      description: product.description.slice(0, 160),
      openGraph: {
        images: [{ url: product.image }],
      },
    };
  } catch {
    return { title: 'Product Not Found' };
  }
}

/**
 * Product Detail Page
 * Optimized for performance with next/image and standardized formatting.
 */
export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  let product;
  
  try {
    product = await productApi.getBySlug(slug);
  } catch {
    notFound();
  }

  return (
    <div className="container animate-in">
      <Link href="/products" className="header-link" style={{ display: 'inline-flex', marginBottom: '32px', gap: '8px' }}>
        <FiArrowLeft size={16} />
        Back to Products
      </Link>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(300px, 1fr) 1fr',
        gap: '48px',
        alignItems: 'start',
      }}>
        <div style={{
          background: 'var(--color-bg-card)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-border)',
          padding: '40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          aspectRatio: '1',
          position: 'relative',
        }}>
          <ProductImage
            src={product.image}
            alt={product.name}
            fallbackName={product.name}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            style={{ 
              objectFit: 'contain', 
              padding: '40px' 
            }}
            priority
          />
        </div>

        <div>
          <p style={{
            fontSize: '0.8rem',
            color: 'var(--color-primary)',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: '8px',
          }}>
            {product.brand}
          </p>
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: 700,
            lineHeight: 1.1,
            marginBottom: '16px',
            letterSpacing: '-0.02em',
          }}>
            {product.name}
          </h1>

          <div className="rating" style={{ marginBottom: '20px' }}>
            {Array.from({ length: 5 }, (_, i) => (
              <FiStar
                key={i}
                size={18}
                style={{
                  fill: i < Math.round(Number(product.rating)) ? 'var(--color-warning)' : 'transparent',
                  color: 'var(--color-warning)',
                }}
              />
            ))}
            <span className="rating-text">
              {Number(product.rating).toFixed(1)} ({product.numReviews} reviews)
            </span>
          </div>

          <p style={{
            fontSize: '2.2rem',
            fontWeight: 700,
            color: 'var(--color-accent)',
            marginBottom: '24px',
          }}>
            {formatCurrency(product.price)}
          </p>

          <p style={{
            color: 'var(--color-text-muted)',
            lineHeight: 1.8,
            marginBottom: '32px',
          }}>
            {product.description}
          </p>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '32px',
          }}>
            <FiPackage size={16} />
            {product.countInStock > 0 ? (
              <span className="badge badge-success">
                In Stock ({product.countInStock} available)
              </span>
            ) : (
              <span className="badge badge-danger">Out of Stock</span>
            )}
          </div>

          <AddToCartButton product={product} />

          <div style={{
            marginTop: '32px',
            padding: '24px',
            background: 'var(--color-bg-card)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--color-border)',
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '0.85rem' }}>
              <div>
                <span style={{ color: 'var(--color-text-muted)' }}>Category</span>
                <p style={{ fontWeight: 600, marginTop: '4px' }}>{product.category}</p>
              </div>
              <div>
                <span style={{ color: 'var(--color-text-muted)' }}>Brand</span>
                <p style={{ fontWeight: 600, marginTop: '4px' }}>{product.brand}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <section style={{ marginTop: '80px', maxWidth: '800px' }}>
        <h2 className="page-title" style={{ marginBottom: '40px' }}>Customer Reviews</h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
          {/* Review Submission Form */}
          <ReviewFormWrapper productId={product.id} />

          {/* Existing Reviews List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {product.reviews && product.reviews.length > 0 ? (
              product.reviews.map((review) => (
                <div
                  key={review.id}
                  style={{
                    padding: '24px',
                    background: 'var(--color-bg-card)',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--color-border)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                    <div className="rating">
                      {Array.from({ length: 5 }, (_, i) => (
                        <FiStar
                          key={i}
                          size={14}
                          style={{
                            fill: i < review.rating ? 'var(--color-warning)' : 'transparent',
                            color: 'var(--color-warning)',
                          }}
                        />
                      ))}
                    </div>
                    <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                      {review.user?.name || 'Anonymous User'}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                      {formatDate(review.createdAt)}
                    </span>
                  </div>
                  <p style={{ color: 'var(--color-text-muted)', lineHeight: 1.6 }}>{review.comment}</p>
                </div>
              ))
            ) : (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-muted)', border: '1px dashed var(--color-border)', borderRadius: 'var(--radius-lg)' }}>
                No reviews yet. Be the first to share your thoughts!
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
