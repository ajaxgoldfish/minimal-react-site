#!/bin/bash

# 当任何命令失败时，立即退出脚本
set -e

echo "🚀 开始部署..."

# 1. 停止并删除现有的 PM2 进程（如果存在）
# 使用 `|| true` 来防止在进程不存在时脚本因错误而退出
echo "停止并删除 PM2 进程: next-app..."
pm2 delete next-app || true

# 2. 清理旧的构建产物
echo "正在删除 .next 文件夹..."
rm -rf .next

# 3. 从 Git 拉取最新的代码
echo "正在从 Git 拉取最新代码..."
git pull

# 4. 安装 npm 依赖
echo "正在安装 npm 依赖..."
npm install

# 5. 构建 Next.js 应用
echo "正在构建 Next.js 应用..."
npm run build

# 6. 使用 PM2 启动应用
echo "正在使用 PM2 启动应用..."
pm2 start npm --name "next-app" -- start

echo "✅ 部署成功!"
echo ""
echo "👇 应用日志:"

# 7. 显示 PM2 日志
pm2 logs next-app 