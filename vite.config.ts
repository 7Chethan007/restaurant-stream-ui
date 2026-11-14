/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const backend = process.env.BACKEND_URL ?? 'http://localhost:8000';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
    proxy: {
      '/api': {
        target: backend,
        changeOrigin: true,
        // SSE: keep the stream unbuffered so events reach the browser immediately.
        configure: (proxy) => {
          proxy.on('proxyRes', (res) => {
            res.headers['cache-control'] = 'no-cache';
            res.headers['x-accel-buffering'] = 'no';
          });
        },
      },
      '/health': { target: backend, changeOrigin: true },
    },
  },
  test: { environment: 'node' },
});
