import React from 'react';
import ImageSlider from './ImageSlider';

const SaleBanner = ({ theme, siteSettings, offers = [], onShopNow }) => {
  // Derive discount text: prefer siteSettings.bannerDiscount, then best active offer, else fallback
  const activeOffers = offers.filter(o => o.status === 'Active');
  const bestOfferDiscount = activeOffers.length > 0
    ? Math.max(...activeOffers.map(o => parseFloat(o.discountPercentage) || 0))
    : 0;

  const discount = siteSettings?.bannerDiscount
    || (bestOfferDiscount > 0 ? `${bestOfferDiscount}% OFF` : '15% OFF');

  // If banner is explicitly disabled, or no title, render nothing
  if (siteSettings?.bannerEnabled === false) return null;

  const bannerImages = siteSettings?.bannerImageClassic || ['/images/offer_classic.png'];

  const title = siteSettings?.bannerTitle || 'Royal Collection Sale';
  const extraDiscount = siteSettings?.bannerExtraDiscount || 'Limited Time Only';
  const description = siteSettings?.bannerDescription || 'Discover exquisite craftsmanship at unprecedented prices. Elevate your elegance today.';

  return (
    <section className="sale-banner-section" style={{
      margin: '40px auto',
      maxWidth: '1200px',
      padding: '0 20px',
    }}>
      <div className="sale-banner-container" style={{
        position: 'relative',
        borderRadius: 'var(--radius-xl)',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-gold)',
        display: 'flex',
        alignItems: 'center',
        background: 'var(--bg-secondary)',
        minHeight: '320px'
      }}>
        {/* Background Image Slider */}
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, opacity: 0.65 }}>
          <ImageSlider images={bannerImages} altText="Sale Promotional Offer" />
          <div style={{
            position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
            background: 'linear-gradient(to right, var(--bg-card) 0%, rgba(0,0,0,0) 80%)',
            opacity: 0.96
          }} />
        </div>

        {/* Content */}
        <div className="sale-banner-content" style={{
          position: 'relative', zIndex: 1,
          padding: '40px 50px', maxWidth: '520px',
          display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '12px'
        }}>
          {extraDiscount && (
            <div style={{
              display: 'inline-block', padding: '5px 14px',
              background: 'var(--gold-bg-strong)', color: 'var(--gold)',
              borderRadius: '20px', fontWeight: '600', fontSize: '0.82rem',
              letterSpacing: '0.8px', textTransform: 'uppercase', border: '1px solid var(--border)'
            }}>
              {extraDiscount}
            </div>
          )}

          <h2 style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 'clamp(2rem, 5vw, 3.2rem)', lineHeight: '1.1',
            color: 'var(--text-primary)', margin: 0
          }}>
            {title.includes('Sale')
              ? <>{title.replace('Sale', '')} <span style={{ color: 'var(--gold)' }}>Sale</span></>
              : title}
          </h2>

          {discount && (
            <p style={{ fontSize: '1.15rem', color: 'var(--text-secondary)', fontWeight: '500', margin: '4px 0 6px 0' }}>
              Up to <span style={{ fontWeight: '700', fontSize: '1.3rem', color: 'var(--gold-dark)' }}>{discount}</span> on selected premium items
            </p>
          )}

          <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', marginBottom: '8px', lineHeight: '1.6' }}>
            {description}
          </p>

          <button
            className="primary-btn"
            onClick={onShopNow}
            style={{ padding: '11px 28px', fontSize: '1rem', boxShadow: 'var(--shadow-gold)' }}
          >
            Shop Now →
          </button>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .sale-banner-container { flex-direction: column !important; align-items: center !important; }
          .sale-banner-content {
            padding: 28px 20px !important;
            align-items: center !important;
            text-align: center !important;
            max-width: 100% !important;
          }
        }
      `}</style>
    </section>
  );
};

export default SaleBanner;
