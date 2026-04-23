# 游戏合集 (Game Hub)

这是一个基于 `pnpm workspaces` 的多游戏集成项目。

## 架构说明

- `apps/lobby`: 游戏大厅（落地页），作为所有游戏的入口。
- `packages/games/`: 存放各个独立的游戏。
  - `sudoku`: 数独游戏。
  - `minesweeper`: 扫雷小游戏。
  - `bulls-and-cows`: 猜数字（1A2B）小游戏。

## 开发环境运行

1. 安装依赖（在根目录执行）：
   ```bash
   pnpm install
   ```

2. 同时启动大厅和所有游戏（开发模式）：
   ```bash
   pnpm dev:all
   ```

3. 也可分别启动（开发模式）：
   ```bash
   # 启动大厅 (默认 5173 端口)
   pnpm --filter lobby dev
   
   # 启动数独 (默认 5174 端口)
   pnpm --filter @game/sudoku dev

   # 启动扫雷 (默认 5175 端口)
   pnpm --filter @game/minesweeper dev

   # 启动猜数字 (默认 5176 端口)
   pnpm --filter @game/bulls-and-cows dev
   ```

4. 访问 `http://localhost:5173` 即可看到大厅，并跳转到各游戏。

## Cloudflare Pages 部署（单域名多路径）

目标路径：
- `/` -> lobby
- `/sudoku/`
- `/minesweeper/`
- `/bulls-and-cows/`

构建命令：

```bash
pnpm deploy:build
```

该命令会：
- 构建大厅和所有 `@game/*` 游戏包
- 聚合产物到 `dist-site/`
- 自动生成 `dist-site/_redirects`（用于 SPA 刷新回退）

Cloudflare Pages 项目配置（仅 1 个项目）：
- Build command: `pnpm install --frozen-lockfile && pnpm deploy:build`
- Build output directory: `dist-site`
- Production branch: `main`

自定义域名配置：
- 在该 Pages 项目里添加主域名或 `www`（例如 `example.com`）
- 旧子域名可选做 301 跳转到新路径：
  - `sudoku.example.com` -> `https://example.com/sudoku/`
  - `minesweeper.example.com` -> `https://example.com/minesweeper/`
  - `bulls-and-cows.example.com` -> `https://example.com/bulls-and-cows/`

## Git 规范

- 所有的提交应当在根目录下进行。
- 推荐使用前缀区分模块，例如：
  - `feat(lobby): xxx`
  - `fix(sudoku): xxx`
