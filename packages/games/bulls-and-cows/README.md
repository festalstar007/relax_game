# 猜数字小游戏（1A2B / Bulls and Cows）

这是一个基于 React + TypeScript + Vite 开发的猜数字小游戏。

## 玩法规则

- 系统随机生成一个 4 位不重复数字，允许首位为 0。
- 玩家每次输入一个 4 位不重复数字进行猜测。
- 反馈格式为 `xAyB`：
  - `A`：数字和位置都正确
  - `B`：数字正确但位置错误
- 当结果为 `4A0B` 时获胜。

## 本地开发

1. 在项目根目录安装依赖：
   ```bash
   pnpm install
   ```
2. 启动猜数字开发服务：
   ```bash
   pnpm --filter @game/bulls-and-cows dev
   ```
