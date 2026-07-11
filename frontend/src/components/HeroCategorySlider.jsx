import React, { useState, useEffect, useCallback, useRef } from 'react';

/**
 * HeroCategorySlider
 * A full-width auto-rotating hero banner.
 * Each slide = one category, showing its image prominently.
 * Has Prev / Next buttons + dot indicators.
 */

// Static fallback slides used when categories from API are empty
const FALLBACK_SLIDES = [
  {
    id: 'Wood Engravings',
    label: 'Wood Engravings',
    tagline: 'Timeless Handcrafted Art',
    description: 'Each piece tells a story — premium wood engravings crafted by skilled artisans with love.',
    image: '/images/woodbox.png',
    accentColor: '#C8843A',
    bgGradient: 'linear-gradient(135deg, #3B1F0A 0%, #6B3A1F 60%, #8B5E3C 100%)',
  },
  {
    id: 'Earrings',
    label: 'Jewelry',
    tagline: 'Wear Your Elegance',
    description: 'Discover our curated collection of earrings and jewellery — from royal classics to modern marvels.',
    image: '/images/earrings.png',
    accentColor: '#D4AF37',
    bgGradient: 'linear-gradient(135deg, #1A0A2E 0%, #4A1C6B 60%, #7B3FA0 100%)',
  },
  {
    id: 'Key Chains',
    label: 'Key Chains',
    tagline: 'Gifted With Purpose',
    description: 'Elegant keychains that double as treasured mementos — perfect corporate and personal gifts.',
    image: '/images/keychain.png',
    accentColor: '#FF6F61',
    bgGradient: 'linear-gradient(135deg, #0A1A2E 0%, #1A3A6B 60%, #2B5FA0 100%)',
  },
  {
    id: '3D Modules',
    label: '3D Modules',
    tagline: 'Gift the Future',
    description: 'Innovative 3D printed collectibles — one-of-a-kind gifts that spark wonder and conversation.',
    image: '/images/toy-classic.png',
    accentColor: '#27AE60',
    bgGradient: 'linear-gradient(135deg, #0A2E1A 0%, #1A6B3A 60%, #2BA05F 100%)',
  },
];

function buildSlides(categories) {
  const catImageMap = {
    'Wood Engravings': '/images/woodbox.png',
    'Earrings': '/images/earrings.png',
    'Key Chains': '/images/keychain.png',
  };
  const catGradientMap = {
    'Wood Engravings': { bg: 'linear-gradient(135deg, #3B1F0A 0%, #6B3A1F 60%, #8B5E3C 100%)', accent: '#C8843A', tagline: 'Timeless Handcrafted Art', desc: 'Each piece tells a story — premium wood engravings crafted by skilled artisans with love.' },
    'Earrings':       { bg: 'linear-gradient(135deg, #1A0A2E 0%, #4A1C6B 60%, #7B3FA0 100%)', accent: '#D4AF37', tagline: 'Wear Your Elegance',        desc: 'Discover our curated collection of earrings and jewellery — from royal classics to modern marvels.' },
    'Key Chains':     { bg: 'linear-gradient(135deg, #0A1A2E 0%, #1A3A6B 60%, #2B5FA0 100%)', accent: '#FF6F61', tagline: 'Gifted With Purpose',       desc: 'Elegant keychains that double as treasured mementos — perfect corporate and personal gifts.' },
  };
  const colorPalettes = [
    { bg: 'linear-gradient(135deg, #0A2E1A 0%, #1A6B3A 60%, #2BA05F 100%)', accent: '#27AE60' }, // Green
    { bg: 'linear-gradient(135deg, #2E0A1A 0%, #6B1A3A 60%, #A02B5F 100%)', accent: '#AE2760' }, // Pink
    { bg: 'linear-gradient(135deg, #0A1A2E 0%, #1A3A6B 60%, #2B5FA0 100%)', accent: '#2760AE' }, // Blue
    { bg: 'linear-gradient(135deg, #2E1A0A 0%, #6B3A1A 60%, #A05F2B 100%)', accent: '#AE6027' }, // Orange
    { bg: 'linear-gradient(135deg, #1A0A2E 0%, #3A1A6B 60%, #5F2BA0 100%)', accent: '#6027AE' }, // Purple
    { bg: 'linear-gradient(135deg, #1A1A1A 0%, #333333 60%, #4D4D4D 100%)', accent: '#999999' }, // Gray
  ];

  const getDynamicPalette = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colorPalettes.length;
    return colorPalettes[index];
  };

  if (!categories || categories.length === 0) return FALLBACK_SLIDES;

  return categories.map((cat) => {
    const key = cat.label || cat.id;
    const meta = catGradientMap[key];
    
    let bg, accent, tagline, desc;
    if (meta) {
      bg = meta.bg;
      accent = meta.accent;
      tagline = meta.tagline;
      desc = meta.desc;
    } else {
      const dyn = getDynamicPalette(key);
      bg = dyn.bg;
      accent = dyn.accent;
      tagline = 'Exclusive Collection';
      desc = `Explore our stunning collection of ${key}.`;
    }

    return {
      id: cat.id,
      label: key,
      tagline: tagline,
      description: cat.desc || desc,
      image: cat.image || catImageMap[key] || '/images/hero-classic.png',
      accentColor: accent,
      bgGradient: bg,
    };
  });
}

export default function HeroCategorySlider({ categories = [], offers = [], siteSettings, onShopCategory }) {
  const slides = buildSlides(categories);
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [direction, setDirection] = useState('next'); // 'next' | 'prev'
  const [imgError, setImgError] = useState(false);
  const intervalRef = useRef(null);
  const AUTO_PLAY_MS = 4500;

  const getFallbackImage = (label) => {
    const map = {
      'Wood Engravings': '/images/woodbox.png',
      'Earrings': '/images/earrings.png',
      'Key Chains': '/images/keychain.png',
      'Soft Toy': '/images/hero-classic.png',
      '3D Modules': '/images/hero-classic.png',
      'Lamp Toys': '/images/hero-classic.png'
    };
    return map[label] || '/images/hero-classic.png';
  };

  useEffect(() => {
    setImgError(false);
  }, [current]);

  const goTo = useCallback((idx, dir = 'next') => {
    if (animating) return;
    setAnimating(true);
    setDirection(dir);
    setCurrent(idx);
    setTimeout(() => setAnimating(false), 600);
  }, [animating]);

  const goNext = useCallback(() => {
    goTo((current + 1) % slides.length, 'next');
  }, [current, slides.length, goTo]);

  const goPrev = useCallback(() => {
    goTo((current - 1 + slides.length) % slides.length, 'prev');
  }, [current, slides.length, goTo]);

  // Auto-play
  useEffect(() => {
    intervalRef.current = setInterval(goNext, AUTO_PLAY_MS);
    return () => clearInterval(intervalRef.current);
  }, [goNext]);

  const resetTimer = () => {
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(goNext, AUTO_PLAY_MS);
  };

  const handleNext = () => { goNext(); resetTimer(); };
  const handlePrev = () => { goPrev(); resetTimer(); };
  const handleDot = (i) => { goTo(i, i > current ? 'next' : 'prev'); resetTimer(); };

  const slide = slides[current];

  // Determine best offer text
  const activeOffers = offers.filter(o => o.status === 'Active');
  const bestDiscount = activeOffers.length > 0
    ? Math.max(...activeOffers.map(o => parseFloat(o.discountPercentage) || 0))
    : (siteSettings?.bannerDiscount ? parseInt(siteSettings.bannerDiscount) : 35);
  const discountText = `${bestDiscount}% OFF`;

  const slideImageUrl = imgError ? getFallbackImage(slide.label) : slide.image;

  return (
    <section id="home" className="hero-slider-section" style={{ position: 'relative', overflow: 'hidden', background: '#000' }}>
      {/* ── Background Image Blur Overlay ── */}
      <div 
        style={{
          position: 'absolute',
          inset: -30,
          backgroundImage: `url(${slideImageUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(15px) brightness(0.5)',
          transition: 'background-image 0.8s ease-in-out',
          zIndex: 0
        }}
      />
      {/* ── Theme Gradient Overlay ── */}
      <div 
        style={{
          position: 'absolute',
          inset: 0,
          background: slide.bgGradient,
          opacity: 0.45,
          zIndex: 0,
          transition: 'background 0.8s ease-in-out'
        }}
      />

      {/* ── Decorative animated background orbs ── */}
      <div className="hcs-bg-orb hcs-orb-1" style={{ background: slide.accentColor, zIndex: 0 }} />
      <div className="hcs-bg-orb hcs-orb-2" style={{ zIndex: 0 }} />

      <div className="hcs-inner" style={{ position: 'relative', zIndex: 1 }}>

        {/* ── LEFT: Category Image ── */}
        <div className="hcs-image-col">
          <div className="hcs-image-frame" key={current} data-anim={direction}>
            <div className="hcs-image-glow" style={{ background: slide.accentColor }} />
            <img
              src={slideImageUrl}
              alt={slide.label}
              className="hcs-main-img"
              onError={() => setImgError(true)}
            />
            <div className="hcs-img-badge" style={{ background: slide.accentColor }}>
              {slide.label}
            </div>
          </div>

          {/* Thumbnails strip */}
          <div className="hcs-thumbs">
            {slides.map((s, i) => (
              <button
                key={s.id}
                className={`hcs-thumb-btn ${i === current ? 'active' : ''}`}
                onClick={() => handleDot(i)}
                title={s.label}
                aria-label={`View ${s.label}`}
                style={{ '--thumb-accent': s.accentColor }}
              >
                <img
                  src={s.image}
                  alt={s.label}
                  onError={(e) => {
                    e.target.onerror = null;
                    const fallbacks = {
                      'Wood Engravings': '/images/woodbox.png',
                      'Earrings': '/images/earrings.png',
                      'Key Chains': '/images/keychain.png',
                      'Soft Toy': '/images/hero-classic.png',
                      '3D Modules': '/images/hero-classic.png',
                      'Lamp Toys': '/images/hero-classic.png'
                    };
                    e.target.src = fallbacks[s.label] || '/images/hero-classic.png';
                  }}
                />
              </button>
            ))}
          </div>
        </div>

        {/* ── RIGHT: Copy ── */}
        <div className="hcs-copy-col" key={`copy-${current}`} data-anim={direction}>

          <div className="hcs-offer-pill" style={{ background: slide.accentColor }}>
            Upto <strong>{discountText}</strong> on your first order
          </div>

          <p className="hcs-eyebrow">Parisu Ulagam — Gifted Collections</p>

          <h1 className="hcs-title">{slide.tagline}</h1>
          <h2 className="hcs-category-name" style={{ color: slide.accentColor }}>
            {slide.label}
          </h2>
          <p className="hcs-desc">{slide.description}</p>

          <div className="hcs-actions">
            <a
              href="#shop"
              className="hcs-cta-primary"
              style={{ background: slide.accentColor, borderColor: slide.accentColor }}
              onClick={() => onShopCategory && onShopCategory(slide.id)}
            >
              Shop {slide.label}
            </a>
            <a
              href="#categories"
              className="hcs-cta-secondary"
            >
              All Collections
            </a>
          </div>

          {/* Prev / Next navigation */}
          <div className="hcs-nav">
            <button className="hcs-nav-btn" onClick={handlePrev} aria-label="Previous collection">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 18l-6-6 6-6"/>
              </svg>
            </button>

            <div className="hcs-dots">
              {slides.map((_, i) => (
                <button
                  key={i}
                  className={`hcs-dot ${i === current ? 'active' : ''}`}
                  style={i === current ? { background: slide.accentColor } : {}}
                  onClick={() => handleDot(i)}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>

            <button className="hcs-nav-btn" onClick={handleNext} aria-label="Next collection">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 18l6-6-6-6"/>
              </svg>
            </button>
          </div>

          {/* Progress bar */}
          <div className="hcs-progress-bar">
            <div
              className="hcs-progress-fill"
              key={`prog-${current}`}
              style={{ background: slide.accentColor, animationDuration: `${AUTO_PLAY_MS}ms` }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
