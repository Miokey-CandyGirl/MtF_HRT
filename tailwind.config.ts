import type { Config } from 'tailwindcss';

// Tailwind v4 主要通过 CSS 中的 @theme 注入设计 token（见 client/src/index.css）
// 此处仅保留内容扫描路径，移除 Lark preset
export default {
  content: ['./index.html', './client/src/**/*.{ts,tsx,css}'],
  darkMode: 'class',
} satisfies Config;
