import React, { useState, useEffect } from 'react';

const ImageSlider = ({ images = [], altText = 'Image', className = '', interval = 3000 }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const imageArray = Array.isArray(images) ? images : (images ? [images] : []);

  useEffect(() => {
    if (imageArray.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % imageArray.length);
    }, interval);
    return () => clearInterval(timer);
  }, [imageArray.length, interval]);

  // Fallback if no images are passed
  if (imageArray.length === 0) {
    return null;
  }

  // If only one image, just render the image
  if (imageArray.length === 1) {
    return <img src={imageArray[0]} alt={altText} className={className} style={{ objectFit: 'cover' }} />;
  }

  return (
    <div className={`image-slider-container ${className}`} style={{ position: 'relative', overflow: 'hidden' }}>
      {imageArray.map((img, idx) => (
        <img
          key={idx}
          src={img}
          alt={`${altText} ${idx + 1}`}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover', // ensure hero/banner image styles are inherited or applied
            opacity: idx === currentIndex ? 1 : 0,
            transition: 'opacity 0.8s ease-in-out'
          }}
        />
      ))}
    </div>
  );
};

export default ImageSlider;
