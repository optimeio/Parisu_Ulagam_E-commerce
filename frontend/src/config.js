/**
 * API configuration for Parisu Ulagam
 * 
 * In development (Vite dev server): API_BASE is empty, Vite proxy handles /api → localhost:5001
 * In production (Hostinger static): API_BASE is the Render backend URL
 */
export const API_BASE = import.meta.env.VITE_API_URL || (
  typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1'
    ? 'https://parisu-ulagam-e-commerce.onrender.com'
    : ''
);

/**
 * Convert a relative asset path (e.g. /images/uploads/xyz.jpg) to a full URL
 * pointing to the backend when deployed separately.
 * Static assets already in dist (e.g. /images/earrings.png) don't need this in
 * most cases, but it's safe to run everything through it.
 */
export function assetUrl(path) {
  if (!path) return path;
  // Already an absolute URL → return as-is
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:') || path.startsWith('blob:')) {
    return path;
  }
  return `${API_BASE}${path}`;
}
