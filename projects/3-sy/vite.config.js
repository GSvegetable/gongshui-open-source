import { defineConfig } from 'vite';

// 作品会被放到 GitHub Pages 的 /3-sy/ 路径下，
// 所以资源路径必须是相对的，不能用根路径 "/assets/..."。
export default defineConfig({
  base: './',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
    target: 'es2020',
  },
});
