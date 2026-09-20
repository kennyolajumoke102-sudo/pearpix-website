import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: '0.0.0.0',
    port: 3000,
    proxy: {
      '/bujjuko-config-api': {
        target: 'http://194.9.62.158',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/bujjuko-config-api/, ''),
      },
      '/pearlpix-api': {
        target: 'https://api.pearlpix.xyz',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/pearlpix-api/, ''),
      },
      '/munopix-api': {
        target: 'http://85.190.254.61',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/munopix-api/, ''),
      },
      '/api/stream': {
        target: 'http://85.190.254.61/munopix/test.php',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api\/stream/, ''),
      },
      '/api/munopix': {
        target: 'http://85.190.254.61/munopix/test.php',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api\/munopix/, ''),
      }
    }
  },
});

