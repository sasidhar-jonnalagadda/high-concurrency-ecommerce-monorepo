'use client';

import { useState } from 'react';
import { FiStar, FiMessageSquare, FiSend } from 'react-icons/fi';
import { productApi } from '@/lib/api';
import { useRouter } from 'next/navigation';

interface Props {
  productId: string;
}

/**
 * Interactive Review Submission Form.
 * Allows customers to rate products (1-5 stars) and provide feedback.
 * Includes interactive star-hover effects and real-time validation.
 */
export function ReviewForm({ productId }: Props) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      setError('Please select a rating');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await productApi.createReview(productId, { rating, comment });
      setSuccess(true);
      setComment('');
      setRating(0);
      
      // Refresh the page data (Server Actions or revalidatePath equivalent)
      setTimeout(() => {
         router.refresh();
      }, 1500);
      
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to submit review';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="alert alert-success animate-in" style={{ padding: '32px', textAlign: 'center' }}>
        <h4 style={{ marginBottom: '8px', fontWeight: 700 }}>Thank you for your feedback!</h4>
        <p style={{ opacity: 0.9 }}>Your review has been submitted successfully.</p>
      </div>
    );
  }

  return (
    <div className="card" style={{ padding: '32px', background: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}>
      <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '24px' }}>Write a Review</h3>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Star Rating Selector */}
        <div className="form-group">
          <label style={{ display: 'block', marginBottom: '12px', fontSize: '0.875rem', fontWeight: 600 }}>
            Rating
          </label>
          <div style={{ display: 'flex', gap: '8px' }}>
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHover(star)}
                onMouseLeave={() => setHover(0)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  transition: 'transform 0.1s ease'
                }}
                className={star <= (hover || rating) ? 'scale-up' : ''}
              >
                <FiStar
                  size={28}
                  style={{
                    fill: star <= (hover || rating) ? 'var(--color-warning)' : 'transparent',
                    color: 'var(--color-warning)',
                    transition: 'all 0.2s ease'
                  }}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Comment Input */}
        <div className="form-group">
          <label htmlFor="comment" style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: 600 }}>
            <FiMessageSquare size={14} style={{ display: 'inline', marginRight: '6px' }} />
            Your Feedback
          </label>
          <textarea
            id="comment"
            className="form-control"
            rows={4}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="What did you like or dislike about this product?"
            required
            style={{ resize: 'vertical' }}
          />
        </div>

        {error && (
          <div className="alert alert-danger" style={{ fontSize: '0.875rem' }}>
            {error}
          </div>
        )}

        <button 
          type="submit" 
          className="btn btn-primary" 
          disabled={isSubmitting}
          style={{ alignSelf: 'flex-start', padding: '12px 24px', gap: '10px' }}
        >
          <FiSend size={18} />
          {isSubmitting ? 'Posting...' : 'Post Review'}
        </button>
      </form>
    </div>
  );
}
