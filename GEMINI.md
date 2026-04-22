# 项目指令上下文 (GEMINI.md)

## 项目概述
本项目是一个名为 **Game Hub (游戏合集)** 的多游戏集成平台，采用 Monorepo (单代码库) 架构。其核心目标是提供一个统一的“落地页”（游戏大厅），让用户可以方便地发现和运行多个独立开发的小游戏。

### 技术栈
- **包管理**: `pnpm workspaces`
- **前端框架**: React 19 + TypeScript
- **构建工具**: Vite 8
- **样式方案**: 
    - 大厅 (Lobby): 原生 CSS
    - 数独 (Sudoku): Tailwind CSS 4
- **路由管理**: `react-router-dom`

### 核心架构
- `apps/lobby`: 游戏大厅应用，提供游戏导航和统一入口。
- `packages/games/`: 存放所有游戏包的目录。
    - `packages/games/sudoku`: 经典的数独游戏。
    - `packages/games/minesweeper`: 经典的扫雷小游戏。

---

## 运行与构建

### 基础命令
- **安装依赖**: `pnpm install`
- **运行所有项目 (开发模式)**: 暂无一键启动脚本，需分别启动：
    - 启动大厅: `pnpm --filter lobby dev` (默认端口: 5173)
    - 启动数独: `pnpm --filter @game/sudoku dev` (默认端口: 5174)
    - 启动扫雷: `pnpm --filter @game/minesweeper dev` (默认端口: 5175)
- **全局构建**: `pnpm build` (在根目录执行)
- **代码检查**: `pnpm lint`

### 开发代理说明
大厅应用 (`apps/lobby`) 配置了 Vite 代理，在开发环境下会将请求转发到对应小游戏开发服务器，以确保导航跳转能够正常工作：
- `/sudoku` -> `http://localhost:5174`
- `/minesweeper` -> `http://localhost:5175`

---

## 开发规范

### 目录结构规范
- 新游戏应当放置在 `packages/games/<game-name>`。
- 新游戏的 `package.json` 名称应遵循 `@game/<game-name>` 格式。
- 新游戏需在 `vite.config.ts` 中配置 `base: '/<game-name>/'`。

### Git 提交规范
- 必须在项目根目录进行 Git 操作。
- 提交信息推荐包含模块前缀：
    - `feat(lobby): 增加游戏搜索功能`
    - `fix(sudoku): 修复填数逻辑 Bug`
    - `chore(root): 更新 pnpm 工作区配置`

### 交流与文档
- **语言**: 所有的交流、注释和文档必须使用 **中文**。
- **文档更新**: 每次重大架构调整或新增功能后，需同步更新 `README.md` 和 `GEMINI.md`。
