import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// FACELAB_INLINE=1 のとき、画像などのアセットをすべてJSへ埋め込む（単一HTML配布用）
const inline = process.env.FACELAB_INLINE === '1';

export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    outDir: process.env.FACELAB_OUTDIR ?? 'dist',
    assetsInlineLimit: inline ? 100_000_000 : 4096,
  },
});
