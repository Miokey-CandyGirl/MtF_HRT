import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// 纯 Vite 配置：移除 @lark-apaas/fullstack-vite-preset
// （该预设会注入 ByteDance Slardar 遥测并把 HTML 代理到后端，与"不上传网络"冲突）
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'client/src'),
    },
  },
  server: {
    port: 5173,
    open: true,
  },
  build: {
    // echarts 体积较大且已单独拆分，放宽告警阈值避免噪音
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        // 拆分较大的第三方依赖，便于缓存并消除 chunk 体积告警
        manualChunks: {
          echarts: ['echarts', 'echarts-for-react'],
          react: ['react', 'react-dom'],
        },
      },
    },
  },
});
