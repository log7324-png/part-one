import { defineConfig } from 'vite';
export default defineConfig({ build: { rollupOptions: { output: { manualChunks: { three: ['three'], react: ['react', 'react-dom'] } } } }, server: { port: 5173, strictPort: true } });
