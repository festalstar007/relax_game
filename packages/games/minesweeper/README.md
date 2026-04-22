# 扫雷小游戏 (Minesweeper)

这是一个基于 React + TypeScript + Vite 开发的扫雷小游戏。

## 功能特性

- 10x10 棋盘，15 颗地雷。
- 左键翻格、右键插旗。
- 首次左键点击保证安全，不会直接踩雷。
- 自动展开空白区域，自动计算周围雷数。
- 支持胜负判断、计时和一键重开。

## 本地开发

1. 在项目根目录安装依赖：
   ```bash
   pnpm install
   ```
2. 启动扫雷开发服务：
   ```bash
   pnpm --filter @game/minesweeper dev
   ```

