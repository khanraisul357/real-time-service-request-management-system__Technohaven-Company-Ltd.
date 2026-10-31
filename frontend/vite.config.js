import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// In development, /api (REST) and /ws (STOMP over WebSocket) are proxied to the Spring Boot backend.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': { target: 'http://localhost:8080', changeOrigin: true },
      '/ws': { target: 'http://localhost:8080', ws: true, changeOrigin: true },
    },
  },
});
