# 每日摄影推荐

一个展示每日精选历史摄影作品的网页应用。

## 项目说明

这个项目使用大都会艺术博物馆的公开 API，每天展示一张不同的历史摄影作品。展示内容包括：
- 摄影作品图片
- 作品标题
- 摄影师信息
- 作品历史背景
- 技术参数

## 技术特点

- 使用原生 JavaScript
- 响应式设计
- 自动每24小时更新一次
- 无需 API key
- 包含错误处理和加载状态

## 如何使用

1. 克隆项目：
   ```bash
   git clone https://github.com/Matown/daily-photo-gallery.git
   ```

2. 直接打开 `index.html` 文件即可查看网页

3. 刷新页面可以查看不同的历史摄影作品

## 项目结构

- `index.html`: 主页面
- `app.js`: 应用逻辑
- `README.md`: 项目说明文档

## 开发说明

1. 确保你有 Git 环境
2. 克隆项目后可直接修改
3. 提交更改：
   ```bash
   git add .
   git commit -m "更改说明"
   git push origin master
   ```

## API 来源

本项目使用 [大都会艺术博物馆公开 API](https://metmuseum.github.io/)，无需 API key。

## 注意事项

- 请确保有稳定的网络连接
- 建议使用现代浏览器访问
- 如遇加载问题，请查看浏览器控制台的错误信息

## 更新历史

- 2024-03-xx: 初始版本发布
- 2024-03-xx: 从 Unsplash API 迁移到大都会艺术博物馆 API 