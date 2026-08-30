import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:5000'
    }
  },
  define: {
    'import.meta.env.VITE_API_BASE_URL': JSON.stringify(
      process.env.NODE_ENV === 'production'
        ? 'https://energen-6t0a.onrender.com/api'
        : 'http://localhost:5000/api'
    ),
    'import.meta.env.VITE_IMAGE_BASE_URL': JSON.stringify(
      process.env.NODE_ENV === 'production'
        ? 'https://energen-6t0a.onrender.com'
        : 'http://localhost:5000'
    ),
  }
});