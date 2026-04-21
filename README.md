# 游戏合集 (Game Hub)

这是一个基于 `pnpm workspaces` 的多游戏集成项目。

## 架构说明

- `apps/lobby`: 游戏大厅（落地页），作为所有游戏的入口。
- `packages/games/`: 存放各个独立的游戏。
  - `sudoku`: 数独游戏。

## 开发环境运行

1. 安装依赖（在根目录执行）：
   ```bash
   pnpm install
   ```

2. 同时启动大厅和所有游戏（开发模式）：
   ```bash
   # 启动大厅 (默认 5173 端口)
   pnpm --filter lobby dev
   
   # 启动数独 (默认 5174 端口)
   pnpm --filter @game/sudoku dev
   ```

3. 访问 `http://localhost:5173` 即可看到大厅，并跳转到各游戏。

## Git 规范

- 所有的提交应当在根目录下进行。
- 推荐使用前缀区分模块，例如：
  - `feat(lobby): xxx`
  - `fix(sudoku): xxx`
