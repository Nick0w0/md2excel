# Markdown表格转换工具 (MD2Excel)

[![English](https://img.shields.io/badge/EN-English-blue)](README.en.md)

一个纯前端应用，用于在Markdown表格和Excel表格之间轻松转换。无需服务器，完全在浏览器中处理，支持离线使用。

## 功能特性

### Markdown转Excel
- 支持单表格和多表格模式
- 自动检测多个表格并分别放入不同工作表
- 可配置是否使用第一行作为表头
- 可跳过Markdown表格中的分隔行（---|---）
- 生成美观的Excel文件，自动调整列宽
- 实时预览转换结果

### Excel转Markdown
- 支持.xlsx、.xls和.csv格式
- 自动检测多个工作表
- 可配置是否使用第一行作为表头
- 生成格式化的Markdown表格
- 支持一键复制和下载结果
- 显示表格元数据（行数、列数等）

### 其他功能
- 明暗主题切换，自动响应系统设置
- 响应式设计，适配桌面和移动设备
- 拖放文件上传，简化操作流程
- 提供直观的用户界面和交互反馈
- 完全开源，可自由扩展功能

## 使用方法

### 在线使用
访问[在线演示](https://nick0w0.github.io/md2excel/)即可使用，无需安装。

### 本地部署
1. 克隆仓库
   ```bash
   git clone https://github.com/Nick0w0/md2excel.git
   ```

2. 进入项目目录
   ```bash
   cd md2excel
   ```

3. 安装依赖（可选）
   ```bash
   npm install
   ```

4. 启动本地服务器
   ```bash
   npm start
   ```

5. 打开浏览器访问 `http://localhost:8080`

## 技术栈

- 纯原生JavaScript，无框架依赖
- ExcelJS - Excel文件处理
- FileSaver.js - 文件下载功能
- SheetJS (XLSX) - Excel解析


## 致谢

本项目得以实现，离不开以下开源项目的支持：

- [ExcelJS](https://github.com/exceljs/exceljs) - 提供强大的Excel文件操作能力
- [FileSaver.js](https://github.com/eligrey/FileSaver.js) - 实现客户端文件保存功能
- [SheetJS](https://github.com/SheetJS/sheetjs) - 提供优秀的电子表格解析能力