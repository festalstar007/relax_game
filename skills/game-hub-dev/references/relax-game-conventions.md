# Relax Game 规范

## 仓库结构

- 采用 Monorepo，工作区由 `pnpm-workspace.yaml` 管理。
- 大厅应用入口为 `apps/lobby`。
- 游戏目录为 `packages/games/<game-name>`。

## 命名规则

- 游戏包名使用 `@game/<game-name>`。
- 目录名与路由片段统一使用 `<game-name>`。

## Vite 规则

- 游戏包必须设置 `base: '/<game-name>/'`。
- 游戏包必须配置固定开发端口（建议 `strictPort: true`）。
- 大厅必须配置代理：
  - 路径 `/<game-name>`
  - 目标 `http://127.0.0.1:<port>`
  - `changeOrigin: true`

## 文档规则

当行为或架构发生变化时，需同步更新：

1. 根目录 `README.md`
2. 根目录 `GEMINI.md`

## 验证命令

在仓库根目录执行：

```bash
pnpm --filter lobby dev
pnpm --filter @game/<game-name> dev
pnpm build
pnpm lint
```
