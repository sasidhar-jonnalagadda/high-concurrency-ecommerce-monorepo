import Link from 'next/link';
import { ProductImage } from './product-image';
import { FiStar } from 'react-icons/fi';
import { formatCurrency } from '@/lib/utils';
import type { Product } from '@/lib/api';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Link
      href={`/products/${product.slug}`}
      className="card"
      style={{ display: 'block' }}
      aria-label={`View details for ${product.name}`}
    >
      <div
        className="product-image-container"
        style={{
          aspectRatio: '4/3',
          background: 'var(--color-bg-elevated)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          position: 'relative',
        }}>
        <ProductImage
          src={product.image}
          alt={product.name}
          fallbackName={product.name}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          style={{
            objectFit: 'contain',
            padding: '20px',
          }}
        />
      </div>

      <div style={{ padding: '20px' }}>
        <p style={{
          fontSize: '0.75rem',
          color: 'var(--color-primary)',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          marginBottom: '6px',
        }}>
          {product.brand}
        </p>

        <h3 style={{
          fontSize: '1rem',
          fontWeight: 600,
          marginBottom: '8px',
          lineHeight: 1.3,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}>
          {product.name}
        </h3>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            marginBottom: '12px',
          }}
          aria-label={`Rating: ${Number(product.rating || 0).toFixed(1)} stars from ${product.numReviews || 0} reviews`}
        >
          <FiStar size={14} style={{ color: 'var(--color-warning)', fill: 'var(--color-warning)' }} />
          <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>
            {product.numReviews > 0 ? Number(product.rating).toFixed(1) : 'New'}
          </span>
          <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
            ({product.numReviews || 0} reviews)
          </span>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <span style={{
            fontSize: '1.2rem',
            fontWeight: 700,
            color: 'var(--color-accent)',
          }}>
            {formatCurrency(product.price)}
          </span>
          {product.countInStock === 0 && (
            <span className="badge badge-danger">Out of Stock</span>
          )}
        </div>
      </div>
    </Link>
  );
}
