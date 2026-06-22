import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    base: env.VITE_BASE || './',
    build: {
      outDir: 'dist',
      assetsInlineLimit: 0,
    },
    server: {
      port: 3000,
      open: true,
      proxy: {
        // In dev, /api requests are forwarded to the backend
        '/api': {
          target: env.VITE_API_URL || 'http://localhost:3001',
          changeOrigin: true,
        },
      },
    },
  };
});
