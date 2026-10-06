import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// In development the API is proxied so the web app and API share one
// origin (simpler cookies, no CORS). In production set VITE_API_URL to the
// API's public URL (only that — never secrets; VITE_ vars are public).
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': { target: 'http://localhost:8000', changeOrigin: false },
    },
  },
});
