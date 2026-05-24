import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

const previewAllowedHosts = ['.up.railway.app'];

if (process.env.RAILWAY_PUBLIC_DOMAIN) {
  previewAllowedHosts.push(process.env.RAILWAY_PUBLIC_DOMAIN);
}

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8787',
        changeOrigin: true,
      },
    },
  },
  preview: {
    allowedHosts: previewAllowedHosts,
  },
});
