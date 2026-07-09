import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles.css';
import { API_BASE } from './config';

/* ── Global fetch interceptor ──────────────────────────────────────
 * In production (Hostinger static → Render backend) every relative
 * /api  and /images/uploads  request must target the backend origin.
 * Instead of editing 50+ fetch() call-sites we patch window.fetch once.
 *
 * Additionally, JSON responses have their image paths rewritten so that
 * <img src={product.image}> automatically resolves against the backend.
 *
 * In development API_BASE is empty, so the interceptor is a no-op.
 * ─────────────────────────────────────────────────────────────────── */
if (API_BASE) {
  // Fields in API JSON that contain image paths
  const IMAGE_FIELDS = new Set([
    'image', 'images', 'heroImage', 'heroClassicImage',
    'bannerImageLight', 'bannerImageClassic', 'aboutImage',
    'referenceImages',
  ]);

  function rewriteImagePaths(obj) {
    if (obj == null || typeof obj !== 'object') return obj;
    if (Array.isArray(obj)) return obj.map(rewriteImagePaths);
    const out = {};
    for (const [k, v] of Object.entries(obj)) {
      if (IMAGE_FIELDS.has(k)) {
        out[k] = rewriteValue(v);
      } else if (typeof v === 'object') {
        out[k] = rewriteImagePaths(v);
      } else {
        out[k] = v;
      }
    }
    return out;
  }

  function rewriteValue(v) {
    if (typeof v === 'string' && v.startsWith('/')) return API_BASE + v;
    if (Array.isArray(v)) return v.map(rewriteValue);
    if (v && typeof v === 'object') return rewriteImagePaths(v);
    return v;
  }

  const _origFetch = window.fetch;
  window.fetch = function (input, init, ...rest) {
    // Rewrite the request URL
    if (typeof input === 'string' && input.startsWith('/')) {
      input = API_BASE + input;
    } else if (input instanceof Request && input.url.startsWith('/')) {
      input = new Request(API_BASE + input.url, input);
    }

    // Wrap the response to rewrite image paths in JSON bodies
    return _origFetch.call(this, input, init, ...rest).then((response) => {
      const ct = response.headers.get('content-type') || '';
      if (!ct.includes('application/json')) return response;

      // Clone so the original body is still readable if needed
      const cloned = response.clone();
      const patchedJson = async () => {
        const data = await cloned.json();
        return rewriteImagePaths(data);
      };

      // Return a lightweight proxy that overrides .json()
      return new Proxy(response, {
        get(target, prop) {
          if (prop === 'json') return patchedJson;
          const val = target[prop];
          return typeof val === 'function' ? val.bind(target) : val;
        },
      });
    });
  };
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

