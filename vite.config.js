import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// In development the API is proxied so the web app and API share one
// origin (simpler cookies, no CORS). In production set VITE_API_URL to the
// API's public URL (only that — never secrets; VITE_ vars are public).
export default defineConfig({
  plugins: [react()],
  server: {
    // Listen on IPv4 and IPv6, so http://localhost:5173 and
    // http://127.0.0.1:5173 both work on every machine and browser.
    host: true,
    proxy: {
      // 127.0.0.1, not "localhost": Node may resolve localhost to IPv6 only.
      '/api': { target: 'http://127.0.0.1:8000', changeOrigin: false },
    },
  },
});
