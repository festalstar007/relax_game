---
name: game-hub-dev
description: 在 relax_game 的 pnpm monorepo 中维护游戏功能，包括新增游戏包、大厅联动、Vite 代理与 base 路径对齐，以及 README/GEMINI.md 同步更新。适用于新增 packages/games 下游戏、修改 apps/lobby 路由或导航、排查跨应用本地联调问题、统一端口/命名/提交规范等场景。
---

# Game Hub 开发规则

在该仓库中按统一规范实现小游戏开发与接入。
确保大厅与各游戏包保持一致配置，避免本地联调和部署路径不一致。

## 工作流

1. 修改前先检查当前结构：
- `apps/lobby`
- `packages/games/*`
- 根目录 `pnpm-workspace.yaml`、`README.md`、`GEMINI.md`

2. 识别任务类型：
- 新增游戏包。
- 修改已有游戏包。
- 仅更新大厅导航或代理。
- 修复集成问题（base 路径、端口、路由与代理不一致）。

3. 按 `references/relax-game-conventions.md` 执行仓库约定。

4. 进行端到端验证：
- 按需执行包级 `dev`/`build` 或根目录 `build`/`lint`。
- 验证大厅可通过代理访问游戏路由。

5. 若行为或架构变化，更新文档：
- 根目录 `README.md`
- 根目录 `GEMINI.md`

## 新游戏接入清单

新增游戏时，需完成以下事项：

1. 创建 `packages/games/<game-name>/`，采用 Vite + React + TypeScript 结构。
2. 在 `package.json` 中设置包名为 `@game/<game-name>`。
3. 在游戏 `vite.config.ts` 中设置 `base: '/<game-name>/'`。
4. 为游戏分配固定开发端口。
5. 在大厅添加代理：`/<game-name>` -> `http://127.0.0.1:<port>`。
6. 在大厅添加入口或导航。
7. 确认 `pnpm --filter @game/<game-name> dev` 可运行。
8. 若运行方式或架构变化，更新根文档。

## 集成防护规则

- 不要单独修改游戏 base 路径，必须同步更新链接与代理规则。
- 游戏包端口应显式配置（建议开启 `strictPort: true`），避免代理漂移。
- 本仓库本地代理目标统一使用 `127.0.0.1`。
- 提交信息保持模块前缀风格，如 `feat(lobby): ...`、`fix(sudoku): ...`。

## 常用命令

在仓库根目录执行：

```bash
pnpm install
pnpm --filter lobby dev
pnpm --filter @game/sudoku dev
pnpm --filter @game/minesweeper dev
pnpm build
pnpm lint
```

新游戏开发命令：

```bash
pnpm --filter @game/<game-name> dev
```

## 参考资料

按需加载以下文件：
- `references/relax-game-conventions.md`
- 根目录 `README.md`
- 根目录 `GEMINI.md`

仅在任务需要时，再读取 `apps/lobby` 与 `packages/games/*` 下直接相关文件。
