import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

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
      },
      '/uploads': {
        target: 'http://localhost:5001',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    outDir: 'dist',
  },
});

