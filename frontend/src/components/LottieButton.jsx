import React, { useRef } from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import './LottieButton.css'; // styling that matches project theme — import animationData from '../assets/add-to-cart.json';

/**
 * LottieButton - a button that displays a Lottie animation and triggers an action when clicked.
 * Props:
 *   onClick: function to call when button is pressed
 *   style: optional inline styles applied to the outer button element
 *   className: optional additional class names for the button
 *   animationSrc: optional custom animation URL (defaults to the provided Add to Cart animation)
 */
const LottieButton = ({ onClick, style, className = '', animationSrc }) => {
  const lottieRef = useRef(null);
  const handleClick = (e) => {
    // start animation when button is clicked
    if (lottieRef.current) {
      lottieRef.current.play();
    }
    // invoke external click handler (e.g., add to cart)
    if (onClick) onClick(e);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`lottie-button ${className}`.trim()}
      style={style}
    >
      {animationSrc ? (
        <DotLottieReact
          src={animationSrc}
          loop={false}
          autoplay={false}
          dotLottieRefCallback={(ref) => (lottieRef.current = ref)}
          style={{ width: '100%', height: '100%' }}
        />
      ) : (
        <DotLottieReact
          data={animationData}
          loop={false}
          autoplay={false}
          dotLottieRefCallback={(ref) => (lottieRef.current = ref)}
          style={{ width: '100%', height: '100%' }}
        />
      )}
    </button>
  );
};

export default LottieButton;
