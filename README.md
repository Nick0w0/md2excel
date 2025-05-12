# Markdown表格转换工具

一个纯前端应用，支持在Markdown表格和Excel表格之间进行转换的工具。

## 功能特性

### Markdown 转 Excel
- 粘贴或拖放上传Markdown表格内容
- 将第一行设为表头的选项
- 跳过分隔行（---|---）的选项
- 多表格模式支持（将多个表格分别放入不同工作表）
- 自定义Excel文件名和工作表名称
- 复制HTML表格到剪贴板
- 下载为Excel文件

### Excel 转 Markdown
- 拖放上传Excel文件
- 选择特定工作表
- 将第一行作为表头的选项
- 复制Markdown表格到剪贴板

### 其他功能
- 明暗主题切换（响应系统主题设置）
- 完全基于浏览器的处理，无服务器需求
- 响应式设计，适配不同屏幕尺寸

## 如何使用

### 方法1：直接打开HTML文件
最简单的方法是直接在文件浏览器中双击`index.html`文件打开。

### 方法2：使用HTTP服务器（推荐）
1. 确保安装了Node.js
2. 克隆或下载本仓库
3. 在项目目录中运行：
   ```
   node start.js
   ```
4. 浏览器将自动打开，访问地址：http://localhost:8080

## 项目结构

```
md2excel/
│
├── index.html              # 主HTML文件
├── start.js                # 启动HTTP服务器的脚本
├── package.json            # 项目依赖配置
│
├── css/                    # 样式文件
│   └── styles.css          # 主样式表
│
└── src/                    # 源代码
    └── js/                 # JavaScript源文件
        ├── md2excel.js     # Markdown转Excel功能
        ├── excel2md.js     # Excel转Markdown功能
        ├── theme.js        # 主题切换功能
        └── ui.js           # UI初始化和管理
```

## 开发

### 安装依赖
```
npm install
```

### 启动开发服务器
```
node start.js
```

### 构建发布版本
```
npm run build
```

## 技术栈
- HTML/CSS/JavaScript
- ExcelJS（Excel文件生成）
- FileSaver.js（文件下载）
- SheetJS（Excel文件解析）

## 故障排除

如果遇到问题，请尝试以下步骤：

1. **按钮点击无响应**：
   - 请确保JavaScript已经启用
   - 检查控制台是否有错误
   - 尝试刷新页面或使用不同的浏览器

2. **无法加载脚本**：
   - 如果使用HTTP服务器访问，确保路径设置正确
   - 如果直接打开HTML文件，脚本路径必须是相对路径

3. **无法导出Excel文件**：
   - 确保ExcelJS和FileSaver.js库成功加载
   - 尝试清除浏览器缓存后重试

## 许可证
MIT 