# UI 设计指南

> **设计类型**: App 设计（应用架构设计）
> **确认检查**: 本指南适用于可交互的应用/网站/工具。

> ℹ️ Section 1 为设计意图与决策上下文。Code agent 实现时以 Section 2 及之后的具体参数为准。

## 1. Design Archetype (设计原型)

### 1.1 内容理解

- **目标用户**: 跨性别女性田妙可儿，私人HRT成长追踪，期望被温柔陪伴与肯定
- **核心目的**: 建立安全感、记录成长、提供持续情感支持与仪式感
- **情绪基调**: 软萌治愈 / 避免焦虑冰冷

### 1.2 设计方向

- **Design Style**: Soft Blocks 柔色块 + Rounded 圆润几何 — 柔和重叠色块传递安全感，pill 按钮与弹性动效强化治愈仪式感
- **Application Type**: Personal Wellness Tool — 决定单栏居中、无全局导航的沉浸式布局
- **Aesthetic Direction**: 奶油白底+樱花粉渐变体系，所有棱角柔化，数据可视化也保持柔软质感

## 2. Color System (色彩系统)

**色彩关系**: 樱花粉主色 + 蜜桃粉辅助 + 奶油白底色 + 深莓文字
**配色设计理由**: 粉色系直接呼应女性化梦想与治愈情绪；奶油白避免纯白刺眼；深莓色替代黑色保证可读性同时维持温柔感
**主色推导**: primary 取自樱花粉 HSL(340, 75%, 65%)，用于打卡确认、进度条、CTA 等"成长行动"时刻
**使用比例**: 60% 奶油白/浅粉底色 · 30% 蜜桃粉卡片/区块 · 10% 樱花粉交互强调；图表六线从主色色相±30°衍生

### 2.1 主题颜色

| Token                | HSL 值                  | 说明                                  |
| -------------------- | ----------------------- | ------------------------------------- |
| `background`         | hsl(30, 80%, 98%)       | 奶油白页面底色                        |
| `card`               | hsl(340, 60%, 97%)      | 极浅樱粉卡片背景                      |
| `foreground`         | hsl(340, 40%, 20%)      | 深莓主文字                            |
| `muted-foreground`   | hsl(340, 15%, 55%)      | 次级说明文字                          |
| `primary`            | hsl(340, 75%, 65%)      | 樱花粉主交互色                        |
| `primary-foreground` | hsl(0, 0%, 100%)        | 主交互白色文字                        |
| `accent`             | hsl(340, 70%, 94%)      | hover/focus/skeleton 浅粉反馈背景     |
| `accent-foreground`  | hsl(340, 50%, 35%)      | accent 上的深色文字                   |
| `border`             | hsl(340, 30%, 90%)      | 柔粉边框                              |

### 2.2 导航区配色

- **基调关系**: 无全局导航；底部鼓励文案区复用 `background` + `muted-foreground`
- **关键状态**: 不适用
- **边界与背景**: 不适用

### 2.3 语义颜色

| 用途       | HSL 值                 | 说明                       |
| ---------- | ---------------------- | -------------------------- |
| success    | hsl(150, 55%, 48%)     | 打卡完成/数据达标          |
| warning    | hsl(35, 70%, 50%)      | 提醒注意                   |
| destructive| hsl(0, 60%, 58%)       | 删除操作                   |

## 3. Typography (字体排版)

- **Heading**: "Nunito", "PingFang SC", "Microsoft YaHei Rounded", sans-serif
- **Body**: "Nunito", "PingFang SC", sans-serif
- **字体策略**: Nunito 圆润字重匹配软萌调性；回退优先苹方圆体→微软雅黑圆体→系统默认；标题 font-bold，正文 font-normal，数值 tabular-nums

## 4. Layout Strategy (布局策略)

- **导航意图**: 无全局导航；5个页面通过首页快捷入口卡片跳转；移动端与桌面端一致单栏
- **页面架构**: 单栏居中 max-w-2xl，内容区 p-4 md:p-8，底部预留鼓励文案安全距离
- **响应式**: 移动端全宽适配；桌面端保持 max-w-2xl 阅读舒适度不扩展

## 5. Visual Language (视觉语言)

- **形态参数**: 圆角 `rounded-2xl`(1rem) · 阴影 `shadow-[0_4px_20px_-4px_hsl(340,60%,80%,0.3)]` · 间距 `spacious`(gap-6/p-6)
- **识别签名**: 全组件 rounded-2xl 统一弧度；进度条两端🌸emoji装饰；倒计时数字心跳动画 scale(1.05)↔scale(1)
- **装饰策略**: 飘落樱花/爱心粒子(canvas/z-index固定层)；emoji作为功能性图标而非纯装饰
- **动效原则**: 弹性缓动 spring(1, 100)；hover 上浮 translateY(-2px) 200ms；打卡弹跳 300ms
- **可及性**: 对比度 ≥ 4.5:1；渐变进度条文字加 text-shadow；粒子动效支持 prefers-reduced-motion 暂停

## 6. Component Principles (组件原则)

- **状态完整性**: Checkbox/Button 覆盖 unchecked/checked/hover/focus/disabled；checked态 = primary填充+白色对勾+弹跳动画
- **层级清晰**: Primary按钮 = bg-primary text-primary-foreground rounded-full；Secondary = border-primary text-primary bg-transparent
- **一致性**: 所有卡片 card + rounded-2xl + shadow；所有输入框 focus:ring-2 ring-primary/30；图表六线色系从 primary 衍生

## 7. Image Direction (图片与视觉资产，按需)

- **Image Role**: 无强制图片需求，优先通过 emoji(🌸💖✨🎀)、渐变色块、粒子动效建立视觉记忆点
- **Image Art Direction**: 若未来需要空状态插画 → 扁平手绘风、粉色调、圆润线条、无面部人物剪影
- **Image Prompt Keywords**: flat illustration, soft pink tones, rounded line art, faceless silhouette, kawaii style, pastel gradient, minimalist composition
- **Image Avoidance**: 写实人物照片、通用科技感插图、尖锐几何、暗色调、AI生成感过重的光泽质感

## 8. 应避免 (Anti-patterns)

- ❌ 使用纯黑#000或冷灰色文字破坏温柔氛围；必须用深莓色 foreground token
- ❌ 图表采用默认蓝/绿等高对比色系；必须从樱花粉色系衍生六条折线
- ❌ 直角卡片/硬边框/密集网格布局；所有容器必须 rounded-2xl + 柔粉阴影