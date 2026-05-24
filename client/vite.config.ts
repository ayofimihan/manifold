import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

function normalizeAllowedHost(host: string | undefined): string {
  if (!host) return '';
  return host.trim().replace(/^[a-z]+:\/\//i, '').replace(/\/.*$/, '');
}

const previewAllowedHosts = new Set(
  ['.up.railway.app', 'manifold.fimihan.dev'].map(normalizeAllowedHost).filter(Boolean),
);

for (const host of [
  process.env.RAILWAY_PUBLIC_DOMAIN,
  ...(process.env.PREVIEW_ALLOWED_HOSTS?.split(',') ?? []),
]) {
  const normalizedHost = normalizeAllowedHost(host);
  if (normalizedHost) previewAllowedHosts.add(normalizedHost);
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
    allowedHosts: [...previewAllowedHosts],
  },
});
