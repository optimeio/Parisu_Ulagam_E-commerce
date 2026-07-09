import React, { useState, useEffect } from 'react';

const ProductReviews = ({ productId }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!productId) return;
    const fetchReviews = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/products/${productId}/reviews`);
        const data = await res.json();
        if (data.success) {
          setReviews(data.reviews);
        }
      } catch (error) {
        console.error('Failed to fetch reviews:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, [productId]);

  if (loading) return <div style={{ padding: '20px 0', color: 'var(--text-muted)' }}>Loading reviews...</div>;

  if (reviews.length === 0) return (
    <div style={{ marginTop: '40px', borderTop: '1px solid var(--border)', paddingTop: '30px' }}>
      <h3 style={{ fontSize: '1.4rem', margin: '0 0 10px' }}>Customer Reviews</h3>
      <p style={{ color: 'var(--text-muted)' }}>No reviews yet for this product. Be the first to review it!</p>
    </div>
  );

  return (
    <div style={{ marginTop: '50px', borderTop: '1px solid var(--border)', paddingTop: '40px' }}>
      <h3 style={{ fontSize: '1.5rem', margin: '0 0 24px' }}>Customer Reviews ({reviews.length})</h3>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {reviews.map((review, idx) => (
          <div key={review._id || idx} style={{ padding: '20px', background: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <p style={{ margin: '0 0 4px', fontWeight: 'bold', fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {review.customerName || 'Verified Customer'}
                  <span style={{ fontSize: '0.7rem', padding: '2px 6px', background: 'rgba(34,197,94,0.15)', color: '#16a34a', borderRadius: '4px', textTransform: 'uppercase', fontWeight: '700' }}>✓ Verified Purchase</span>
                </p>
                <div style={{ display: 'flex', gap: '2px', color: '#eab308', fontSize: '1.1rem' }}>
                  {[...Array(5)].map((_, i) => (
                    <span key={i} style={{ color: i < review.rating ? '#eab308' : 'var(--border)' }}>★</span>
                  ))}
                </div>
              </div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {new Date(review.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            </div>
            {review.comment && (
              <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                {review.comment}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductReviews;
