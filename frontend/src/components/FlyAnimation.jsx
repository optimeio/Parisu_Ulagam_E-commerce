import React, { useEffect, useRef } from 'react';

/**
 * FlyAnimation — Nitrogen Balloon Style
 * 
 * Renders a gift box + balloon emoji pair that floats up smoothly
 * like a helium/nitrogen balloon, gently swaying, until it reaches the nav icon.
 * Uses CSS keyframe animation for buttery-smooth performance.
 */
export default function FlyAnimation({ startX, startY, targetSelector, onComplete }) {
  const containerRef = useRef(null);
  const animId = useRef(`fly-${Date.now()}`);

  useEffect(() => {
    const targetEl = document.querySelector(targetSelector);
    if (!targetEl) { onComplete && onComplete(); return; }

    const targetRect = targetEl.getBoundingClientRect();
    const endX = targetRect.left + targetRect.width / 2;
    const endY = targetRect.top + targetRect.height / 2;

    const el = containerRef.current;
    if (!el) return;

    // Calculate deltas
    const dx = endX - startX;
    const dy = endY - startY; // usually negative (going up)

    // Duration: slow & buoyant — 1.8 seconds
    const DURATION = 1800;

    // Inject keyframes dynamically
    const styleId = `fly-style-${animId.current}`;
    const styleEl = document.createElement('style');
    styleEl.id = styleId;
    styleEl.textContent = `
      @keyframes ${animId.current}_rise {
        0% {
          transform: translate(0px, 0px) scale(1) rotate(0deg);
          opacity: 1;
        }
        20% {
          transform: translate(${dx * 0.05}px, ${dy * 0.15}px) scale(1.15) rotate(-4deg);
          opacity: 1;
        }
        50% {
          transform: translate(${dx * 0.4 + 18}px, ${dy * 0.5}px) scale(1.05) rotate(5deg);
          opacity: 1;
        }
        80% {
          transform: translate(${dx * 0.82 - 10}px, ${dy * 0.85}px) scale(0.75) rotate(-3deg);
          opacity: 0.9;
        }
        100% {
          transform: translate(${dx}px, ${dy}px) scale(0.3) rotate(2deg);
          opacity: 0;
        }
      }

      @keyframes ${animId.current}_sway {
        0%   { transform: rotate(-3deg); }
        25%  { transform: rotate(3deg); }
        50%  { transform: rotate(-2deg); }
        75%  { transform: rotate(2deg); }
        100% { transform: rotate(-3deg); }
      }

      @keyframes ${animId.current}_bobBox {
        0%   { transform: translateY(0px) rotate(-2deg); }
        33%  { transform: translateY(-4px) rotate(2deg); }
        66%  { transform: translateY(2px) rotate(-1deg); }
        100% { transform: translateY(0px) rotate(-2deg); }
      }
    `;
    document.head.appendChild(styleEl);

    // Apply rise animation to container
    el.style.animation = `${animId.current}_rise ${DURATION}ms cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards`;

    const timer = setTimeout(() => {
      // Pulse nav icon when balloon lands
      if (targetEl) {
        targetEl.classList.add('nav-icon-pulse');
        setTimeout(() => targetEl.classList.remove('nav-icon-pulse'), 600);
      }
      // Cleanup
      document.getElementById(styleId)?.remove();
      onComplete && onComplete();
    }, DURATION);

    return () => {
      clearTimeout(timer);
      document.getElementById(styleId)?.remove();
    };
  }, [startX, startY, targetSelector, onComplete]);

  const id = animId.current;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
    >
      {/* The balloon + gift cluster */}
      <div
        ref={containerRef}
        style={{
          position: 'absolute',
          left: startX - 24,
          top: startY - 70,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: 48,
          willChange: 'transform, opacity',
        }}
      >
        {/* 🎈 Balloon */}
        <div
          style={{
            fontSize: '2.2rem',
            lineHeight: 1,
            animation: `${id}_sway 0.9s ease-in-out infinite`,
            transformOrigin: 'bottom center',
            filter: 'drop-shadow(0 2px 6px rgba(255, 111, 97,0.4))',
            userSelect: 'none',
          }}
        >
          🎈
        </div>

        {/* String connecting balloon to box */}
        <div
          style={{
            width: '2px',
            height: '14px',
            background: 'linear-gradient(to bottom, rgba(180,120,60,0.7), rgba(180,120,60,0.3))',
            borderRadius: '1px',
            margin: '0',
          }}
        />

        {/* 🎁 Gift Box */}
        <div
          style={{
            fontSize: '1.8rem',
            lineHeight: 1,
            animation: `${id}_bobBox 1.1s ease-in-out infinite`,
            transformOrigin: 'top center',
            filter: 'drop-shadow(0 3px 8px rgba(255, 111, 97,0.5))',
            userSelect: 'none',
          }}
        >
          🎁
        </div>
      </div>
    </div>
  );
}
