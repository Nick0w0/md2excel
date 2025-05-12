# Markdown Table Converter (MD2Excel)

[![中文](https://img.shields.io/badge/CN-中文-red)](README.md)

A pure frontend application for easy conversion between Markdown tables and Excel tables. No server required, everything is processed in the browser, and supports offline use.

## Features

### Markdown to Excel
- Supports single and multiple table modes
- Automatically detects multiple tables and places them in different worksheets
- Configurable option to use the first row as a header
- Can skip separator rows (---|---) in Markdown tables
- Generates beautiful Excel files with auto-adjusted column widths
- Real-time preview of conversion results

### Excel to Markdown
- Supports .xlsx, .xls, and .csv formats
- Automatically detects multiple worksheets
- Configurable option to use the first row as a header
- Generates formatted Markdown tables
- One-click copy and download functionality
- Displays table metadata (row count, column count, etc.)

### Other Features
- Light/dark theme toggle, automatically responding to system settings
- Responsive design, compatible with desktop and mobile devices
- Drag and drop file upload for simplified operation
- Provides an intuitive user interface and interactive feedback
- Completely open source, freely extendable

## How to Use

### Online Demo
Visit the [online demo](https://nick0w0.github.io/md2excel/) to use it without installation.

### Local Deployment
1. Clone the repository
   ```bash
   git clone https://github.com/Nick0w0/md2excel.git
   ```

2. Navigate to the project directory
   ```bash
   cd md2excel
   ```

3. Install dependencies (optional)
   ```bash
   npm install
   ```

4. Start the local server
   ```bash
   npm start
   ```

5. Open your browser and visit `http://localhost:8080`

## Technology Stack

- Pure vanilla JavaScript, no framework dependencies
- ExcelJS - Excel file processing
- FileSaver.js - File download functionality
- SheetJS (XLSX) - Excel parsing

## Credits

This project was made possible thanks to the support of the following open source projects:

- [ExcelJS](https://github.com/exceljs/exceljs) - Providing powerful Excel file manipulation capabilities
- [FileSaver.js](https://github.com/eligrey/FileSaver.js) - Enabling client-side file saving functionality
- [SheetJS](https://github.com/SheetJS/sheetjs) - Offering excellent spreadsheet parsing capabilities

Special thanks to all users who provided feedback and suggestions for this project. 