# HRT 成长追踪网页 — 全模块实现计划

## Context（背景与动机）

项目当前是一个**空的 Lark aPaaS 全栈模板**（`fullstack-nestjs-template`）：`client/src/` 与 `public/` 完全为空，无 `index.html`、无 `main.tsx`/`App.tsx`，`scripts/dev.sh` 不存在（`npm run dev` 已坏），`node_modules` 未安装。模板基于 `@lark-apaas/fullstack-vite-preset`，该预设会**自动注入 ByteDance Slardar 遥测 SDK（联网上报）并把 HTML 请求代理到后端**——与需求中反复强调的"**不上传网络**"硬约束直接冲突（涉及敏感 HRT/性别数据）。

用户需求是构建一个**纯客户端、localStorage 本地存储、樱花粉软萌圆角**的跨性别女性 HRT 成长追踪应用，覆盖激素追踪、愿望存钱罐、体检提醒日历、身心日记与激励、全局工具等约 14 个模块（详见会话需求）。

**经与用户确认的关键决策：**
1. **技术栈**：React + Vite + Tailwind v4 + **echarts** + TypeScript + localStorage。保留模板的 echarts/React/Tailwind 依赖，但**把 `vite.config.ts` 的 Lark 预设替换为纯 Vite + `@vitejs/plugin-react`**，移除 Slardar 遥测与后端代理，彻底满足"不上传网络"。
2. **性激素**：经典六项（FSH、LH、PRL、E2、P、T）**+ SHBG（结合球蛋白）= 7 项**（用户额外要求增加）。
3. **参考线**：归一化到女性参考中值，画 2 条灰色半透明水平 markLine（女性=1.0、男性=平均比值），tooltip 显示各项绝对值。

**预期结果**：一个可由 `npx vite` 直接运行、纯本地、视觉治愈、无控制台报错的完整 HRT 追踪网页。

## 关键决策汇总

| 维度 | 决策 |
|---|---|
| 构建配置 | 纯 Vite + `@vitejs/plugin-react`（移除 `@lark-apaas/fullstack-vite-preset`、移除 `postinstall` 的 `fullstack-cli` 初始化） |
| 图表 | echarts 5 + echarts-for-react；markLine 画参考线（无需 chartjs-plugin-annotation） |
| 样式 | Tailwind v4，`@theme` 注入 AGENTS.md 色彩 token；自定义 CSS 动画（樱花/花瓣/心跳） |
| 状态 | Zustand + persist 中间件（localStorage 同步 hydrate，消除刷新闪烁） |
| 导航 | 无全局导航；状态化视图切换（Zustand `view`）+ `location.hash` 同步，首页卡片跳转 |
| 数据 | 全部 localStorage，命名空间 `hrt:`；一键导出/导入 JSON |
| 表单 | react-hook-form + zod（非空、数值合法、拒负数） |
| 组件基元 | Radix UI（Dialog/Switch/Tabs/Progress/Popover 等）+ class-variance-authority 变体 |
| 日期 | date-fns |
| 运行 | `npm install` → `npx vite`（Windows 友好，绕过缺失的 dev.sh） |

## 文件结构（新建 / 修改）

```
HRT网页/
├── index.html                      [新建] Vite 入口；<head> 内联暗色预置脚本(读取 hrt:settings 设置 .dark)
├── vite.config.ts                  [改写] 纯 Vite + @vitejs/plugin-react，alias @ → client/src
├── tailwind.config.ts              [改写] 移除 Lark preset；最小 content 配置（v4 主要靠 CSS @theme）
├── tsconfig.app.json               [改写] 自包含，移除 @lark-apaas extends；jsx: react-jsx, paths @/*
├── package.json                    [编辑] scripts: dev/build/preview = vite；删 postinstall；加 @vitejs/plugin-react devDep
├── postcss.config.js               [保留] 已是 Tailwind v4 正确配置
├── client/src/
│   ├── main.tsx                    [新建] React 挂载入口
│   ├── App.tsx                     [新建] 根：Provider/Layout/视图切换/粒子层/到期提醒检查/页脚免责
│   ├── index.css                   [新建] @import tailwindcss + @theme token + dark 变体 + 动画
│   ├── types.ts                    [新建] 全部 TS 类型
│   ├── lib/
│   │   ├── storage.ts              [新建] localStorage 安全读写 + 导出/导入（hrt: 命名空间）
│   │   ├── utils.ts                [新建] 校验/日期/格式/ID/clsx 合并
│   │   ├── hormoneRanges.ts        [新建] 7 项激素 女/男 参考区间 + 归一化 + markLine 计算
│   │   └── badges.ts               [新建] 徽章触发条件定义 + 评估引擎
│   ├── store.ts                    [新建] Zustand stores（UI 视图 + 各数据域，persist）
│   ├── constants.ts                [新建] 存钱罐模板/提醒类型预设/副作用选项/徽章定义
│   ├── components/
│   │   ├── ui.tsx                  [新建] Card/Button/Input/Dialog/Progress/Switch/Tabs/EmptyState/Toast
│   │   ├── ParticleLayer.tsx       [新建] 樱花 canvas 粒子（密度可调 + reduced-motion）
│   │   ├── PetalBurst.tsx          [新建] 打卡花瓣爆开动效
│   │   ├── Layout.tsx              [新建] 单栏 max-w-2xl + LoadingSplash + 页脚免责声明
│   │   └── HomeNavCards.tsx        [新建] 首页快捷入口卡片
│   └── features/
│       ├── Home.tsx                [新建] 总览 + 年度打卡墙
│       ├── Medication.tsx          [新建] 螺内酯+雌二醇凝胶每日打卡 + 月历 + 连续天数
│       ├── Hormone.tsx             [新建] 容器：激素录入/图表/体征/副作用/就医档案 分 Tab
│       │   ├── HormoneChart.tsx        echarts 7 线 + markLine + 空/体征视图切换 + 日期联动面板
│       │   ├── BodySigns.tsx           体征记录表 + 图表（与激素共用 x 轴）
│       │   ├── SideEffects.tsx         副作用日志（多选+文本，倒序，复制纯文本）
│       │   └── MedicalArchive.tsx      就医档案大文本域（自动保存 + 一键复制）
│       ├── Savings.tsx             [新建] 3 组存钱目标 + 粉色进度条 + 实时计算
│       ├── Reminders.tsx           [新建] 体检提醒日历 + 到期弹窗 + 标记完成顺延
│       ├── Diary.tsx               [新建] 容器：心情日记/焦虑量表/心理随访笔记
│       │   ├── MoodDiary.tsx           心情日记（保留原有逻辑）
│       │   ├── DysphoriaScale.tsx      性别焦虑 1-5 量表 + 折线趋势 + "非诊断"标注
│       │   └── PsychNotes.tsx          心理随访笔记（自动保存）
│       ├── Achievements.tsx        [新建] 成就回忆墙 + 徽章墙
│       └── Settings.tsx            [新建] 粒子开关/密度 + 暗色模式 + 导出导入 + 月度总结
```

## 数据 Schema（localStorage 键，统一前缀 `hrt:`）

| 键 | 结构 | 说明 |
|---|---|---|
| `hrt:medication` | `{ logs: { [YYYYMMDD]: { spironolactone, estradiol } }, streak }` | 每日打卡 + 连续天数 |
| `hrt:annual` | `{ [MMDD]: done }` | 年度打卡墙 |
| `hrt:hormones` | `[{ id, date, e2, t, prl, lh, fsh, p, shbg, note }]` | 7 项性激素化验 |
| `hrt:bodySigns` | `[{ id, date, weight, bodyFat, chest, oilLevel(1-5), hotFlash, note }]` | 身体体征时间序列 |
| `hrt:sideEffects` | `[{ id, date, effects[], description }]` | 副作用日志 |
| `hrt:medicalArchive` | `string` | 就医档案文本 |
| `hrt:savings` | `[{ id, name, target, monthly, saved }]` | 3 组存钱目标 |
| `hrt:reminders` | `[{ id, name, type, firstDate, intervalDays, lastCompleted, nextDate, done }]` | 体检提醒 |
| `hrt:mood` | `[{ id, date, mood, note }]` | 心情日记 |
| `hrt:dysphoria` | `[{ id, date, score(1-5), note }]` | 焦虑量表 |
| `hrt:psychNotes` | `string` | 心理随访笔记 |
| `hrt:achievements` | `[{ id, title, date, description }]` | 成就回忆 |
| `hrt:badges` | `{ [badgeId]: { unlockedAt } }` | 已解锁徽章 |
| `hrt:settings` | `{ particles, density, darkMode }` | 用户偏好 |

## 模块规格（逐模块要点）

**🩺 激素追踪**（Hormone.tsx 容器，4 Tab）
- 激素图表：echarts 折线，7 条线（颜色由 primary `hsl(340,75%,65%)` 色相 ± 衍生）；x 轴日期；2 条灰色 markLine（女性=1.0、男性=平均比值）；tooltip 显示该时间点 7 项绝对值+单位；"激素/体征"视图切换；选日期联动侧栏显示当日化验+体征+副作用。空态："暂无化验记录，请添加你的第一次检查"。
- 体征记录表：日期/体重/体脂率/胸围/出油1-5/潮热/备注；时间序列；与激素图共用 x 轴；增删改。体征图：体重/体脂/胸围左 y 轴、出油1-5右 y 轴。
- 副作用日志：日期+多选(头晕/乏力/乳房胀痛/出油改变/其他)+自定义文本；倒序；增删改；输出纯文本可复制（面诊参考）。
- 就医档案：大文本域，自动保存（防抖写 localStorage），一键复制全部。

**💰 存钱罐**（Savings.tsx）：口周脱毛/FFS/服饰 3 组；输入目标总额+月计划；实时算 已存/还差/预估月数；粉色圆角进度条；编辑/重置。

**🔔 体检提醒**（Reminders.tsx）：新建多条（名称/类型/首次日期/自定义周期天数，预设 激素90天/脱毛42天/精神随访自定义）；页面加载比对当前日期，到期弹粉色圆角弹窗；标记"已完成"自动顺延 nextDate += intervalDays；编辑/删除。

**💖 身心日记**（Diary.tsx 容器）
- 心情日记：保留原有逻辑。
- 焦虑量表：1-5 评分+日期+备注；折线趋势图；显著标注"不作为医学诊断依据"。
- 心理随访笔记：独立文本卡，自动保存。

**🏆 成就与徽章**（Achievements.tsx）：成就回忆墙（手动增删：标题/日期/描述）；徽章墙（持久化）。徽章触发（`badges.ts`）：坚持复查小天使(复查完成≥3)、穿搭小达人(服饰基金进度≥50%)、脱毛进度之星(脱毛复诊完成≥2)、坚持服药小天使(连续服药≥30天)、化验记录小能手(激素≥3条)、体征记录小能手(体征≥3条)、日记小作家(日记≥10条)、备份小卫士(导出≥1次)。数据变更时评估，解锁即持久化。

**🛠 全局工具**（Settings.tsx）：导出 JSON（提示"请定期备份，清除浏览器缓存会丢失数据"）；导入（文件选择+二次确认+覆盖/追加模式+完成后刷新）；月末月度总结（统计当月打卡/体征/化验/日记条数，纯文本可复制）；樱花粒子开关+密度(低/中/高)；暗色夜间模式切换（持久化）。

**原有保留**：首页总览、年度打卡、基础激素录入图表、心情日记——逻辑保持。

## 关键实现细节

**主题与色彩**（`index.css`）：用 Tailwind v4 `@theme` 注入 AGENTS.md 的 HSL token（background `hsl(30,80%,98%)`、card `hsl(340,60%,97%)`、foreground `hsl(340,40%,20%)`、primary `hsl(340,75%,65%)`、accent `hsl(340,70%,94%)`、border `hsl(340,30%,90%)` 等）；暗色模式用 `@custom-variant dark` + `.dark` 类切换（柔和粉色暗色调，非纯黑）。Nunito 字体 via Google Fonts。全组件 `rounded-2xl` + 柔粉阴影 `shadow-[0_4px_20px_-4px_hsl(340,60%,80%,0.3)]`。

**echarts 激素图 + 参考线**：7 条 series，颜色 `hsl(340±,75%,65%)` 衍生；`markLine` 画 2 条 `type:'average'`-style 水平线（silent, gray 半透明 `rgba(120,120,120,0.4)`），分别 label "女性参考中值"/"原生男性参考"；归一化 `value/femaleMid`；tooltip `formatter` 列出 7 项绝对值；数据为空时不渲染图（渲染 EmptyState），避免报错。参考区间表（`hormoneRanges.ts`）作为侧栏可见表格补充精度。女/男参考值（成人近似，可在文件内调整，应用整体声明非诊断依据）：E2 女150/男30、T 女30/男600、PRL 女15/男9、LH 女8/男5、FSH 女7/男6、P 女1/男0.5、SHBG 女80/男40（单位见文件）。

**反闪烁**：① `index.html <head>` 内联脚本在 React 渲染前读取 `hrt:settings.darkMode` 设 `<html class="dark">`，避免暗色模式白屏闪烁；② Zustand persist 同步从 localStorage hydrate，首屏即有数据；③ `#root` 初始 `opacity:0`，挂载后 CSS 过渡到 1；④ 图表/列表仅在数据存在时渲染，否则 EmptyState。

**樱花粒子 + 花瓣爆开**（`ParticleLayer.tsx`/`PetalBurst.tsx`）：canvas 固定层飘落樱花/爱心，密度由 settings 控制；`prefers-reduced-motion` 时暂停；打卡点击在指针位置触发花瓣爆开粒子（300ms）。心跳倒计时数字 `@keyframes` scale(1.05)↔scale(1)。

**校验**（`utils.ts` + zod）：所有数字表单 zod schema 拒绝负数/NaN/空；react-hook-form 显示行内错误；非法输入不写入存储。

**导出/导入**（`storage.ts`）：导出收集所有 `hrt:` 键为 `{ version, exportedAt, data: {...} }` JSON 下载；导入文件选择→二次确认→覆盖或追加（追加按 id 合并）→刷新视图。月度总结：遍历当月各数据域计数，生成纯文本报告。

## 验证（端到端）

1. **安装运行**：用户在终端执行 `! npm install`（安装依赖，含新增 `@vitejs/plugin-react`），再 `! npx vite` 启动开发服务器，浏览器打开提示地址。
2. **反闪烁**：硬刷新首页，确认无白屏/空卡闪烁，暗色模式无亮色闪一下。
3. **激素图**：添加 1 条化验→图出 7 线 + 2 参考线 + tooltip 显示 7 值；清空→显示空态文本，控制台无报错。
4. **体征/副作用/就医档案**：增删改 + 复制纯文本；体征图与激素图共用 x 轴、视图切换正常。
5. **存钱罐**：输入目标/月存→进度条/还差/月数实时更新；编辑/重置。
6. **提醒**：新建一条首次日期设为今天→刷新页面→到期弹窗出现→标记完成→nextDate 顺延。
7. **日记/焦虑/心理笔记**：录入+趋势图+"非诊断"标注可见。
8. **成就/徽章**：手动加成就；触发条件达成（如连续打卡30天）→徽章自动解锁并持久化。
9. **设置**：粒子开关/密度生效；暗色切换持久化；导出 JSON→清 localStorage→导入(覆盖)→数据恢复；月度总结生成可复制文本。
10. **打卡动效**：点击打卡→花瓣爆开；卡片 hover 上浮；倒计时心跳动画。
11. **页脚免责**：每页底部可见"本网页仅个人自我记录，不能替代临床医生诊断，医疗决策遵从线下医师"。
12. **无报错**：全流程打开浏览器控制台，无 error/warning（echarts 空数据不报错）。

## 运行说明（用户侧，Windows）

- 首次：`npm install`（依赖较大，需联网下载；已移除会失败的 Lark `postinstall`）
- 开发：`npx vite`（或 `npm run dev`，脚本已改为 `vite`）
- 生产构建：`npx vite build` → `dist/`；预览 `npx vite preview`
- 注：依赖通过 npm 下载属正常联网（非用户数据上传）；应用运行时所有数据仅在浏览器 localStorage，不上传任何服务器。
