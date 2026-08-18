import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // '/src' is resolved relative to the project root by Vite.
      '@': '/src',
    },
  },
  server: {
    port: 5173,
    open: false,
  },
  build: {
    target: 'es2022',
    sourcemap: false,
    // Code splitting: vendor + pages are lazy-loaded via React.lazy in App.tsx
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
        },
      },
    },
  },
});
