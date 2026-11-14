/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';

const backend = process.env.BACKEND_URL ?? 'http://localhost:8000';

export default defineConfig({
  plugins: [react()],
  // Two pages: / is the hotel site, /digital-twin/ is the React lab.
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        twin: resolve(__dirname, 'digital-twin/index.html'),
      },
    },
  },
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
