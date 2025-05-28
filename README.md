# Achuan9 Ecosystem

<p align="center">
  <img src="https://img.shields.io/badge/vue-3.4.21-brightgreen" alt="Vue">
  <img src="https://img.shields.io/badge/typescript-5.3.3-blue" alt="TypeScript">
  <img src="https://img.shields.io/badge/vite-5.1.4-purple" alt="Vite">
  <img src="https://img.shields.io/badge/pnpm-workspace-orange" alt="PNPM Workspace">
</p>

<p align="center">
  <b>Achuan9 的前端生态工具集</b>
</p>

## 📦 项目结构

这是一个基于 PNPM Workspace 的 monorepo 项目，包含以下模块：

### Vue Composables

- [@achuan9/use-load-deps](./packages/vue-composables/use-load-deps) - 用于处理依赖加载的 Vue 组合式函数

### Vite Plugins

- [@achuan9/vite-plugin-version-log](./packages/vite-plugins/vite-plugin-version-log) - 一个用于在生产环境构建时注入版本信息的 Vite 插件。

## 🚀 快速开始

### 环境要求

- Node.js >=22.12.0 || ^20.19.0
- pnpm@10.11.0

### 安装

```bash
# 克隆项目
git clone https://github.com/achuan9/achuan9-ecosystem.git

# 进入项目目录
cd achuan9-ecosystem

# 安装依赖
pnpm install
```

### 开发

```bash
# 运行 @achuan9/use-load-deps 的示例
cd playground/use-load-deps && pnpm dev


# 运行 @achuan9/vite-plugin-version-log 的示例
cd playground/vite-plugin-version-log && pnpm dev
```

### 构建

```bash
# 构建所有包
pnpm build

# 发版
pnpm release

# 发布到npm
pnpm pub @achuan9/vite-plugin-version-log@1.0.0
```

## 📝 开发指南

### 提交规范

我们使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范进行提交：

```bash
# 示例
feat: add new feature
fix: fix bug
docs: update documentation
style: format code
refactor: refactor code
test: add tests
chore: update dependencies
```

## 🤝 贡献指南

欢迎提交 Pull Request 或创建 Issue。在提交 PR 之前，请确保：

1. 代码已经通过 ESLint 检查
2. 代码已经通过 TypeScript 类型检查
3. 添加了必要的测试
4. 更新了相关文档

## 📄 开源协议

[MIT](./LICENSE) © Achuan9
