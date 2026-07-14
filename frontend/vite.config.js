import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Shared proxy error handler — silently swallows ECONNREFUSED during backend restarts
// so "http proxy error" never appears in the console.
function proxyErrorHandler(proxy) {
  proxy.on('error', (err, _req, res) => {
    // Swallow connection-refused / reset errors (backend is restarting)
    if (err.code === 'ECONNREFUSED' || err.code === 'ECONNRESET') {
      if (res && !res.headersSent) {
        res.writeHead(503, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, message: 'Server is starting up, please retry in a moment.' }));
      }
    }
    // All other errors are also swallowed silently — no console noise
  });
}

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    headers: {
      // Allow Razorpay checkout iframe to use device sensors
      'Permissions-Policy': 'accelerometer=*, gyroscope=*, magnetometer=*, camera=(), microphone=()',
      // Upgrade mixed content (HTTP -> HTTPS) automatically
      'Content-Security-Policy': "upgrade-insecure-requests",
      // Expose safe headers for Razorpay fingerprinting
      'Access-Control-Expose-Headers': 'x-rtb-fingerprint-id, request-id',
    },
    proxy: {
      '/api': {
        target: 'http://localhost:5001',
        changeOrigin: true,
        secure: false,
        configure: proxyErrorHandler,
      },
      '/uploads': {
        target: 'http://localhost:5001',
        changeOrigin: true,
        secure: false,
        configure: proxyErrorHandler,
      },
      '/images/uploads': {
        target: 'http://localhost:5001',
        changeOrigin: true,
        secure: false,
        configure: proxyErrorHandler,
      },
    },
  },
  build: {
    outDir: 'dist',
  },
});
