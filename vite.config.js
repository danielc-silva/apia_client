import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const BACKEND_TARGET = 'https://webservices-ongapia.onrender.com';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: BACKEND_TARGET,
        changeOrigin: true,
      },
      '/uploads': {
        target: BACKEND_TARGET,
        changeOrigin: true,
      },
      '/animais': {
        target: BACKEND_TARGET,
        changeOrigin: true,
      },
      '/eventos': {
        target: BACKEND_TARGET,
        changeOrigin: true,
      },
      '/auth': {
        target: BACKEND_TARGET,
        changeOrigin: true,
      },
    },
  },
});
