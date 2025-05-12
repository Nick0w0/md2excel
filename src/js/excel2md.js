/**
 * Excel转Markdown功能模块
 */
const Excel2MD = (function() {
  // 私有变量
  let excelData = null;
  let excelDropzone;
  let excelFileInput;
  let worksheetIndexInput;
  let excelHasHeadersCheckbox;
  let convertToMdBtn;
  let mdOutputContainer;
  
  /**
   * 初始化模块
   */
  function init() {
    // 获取DOM元素
    excelDropzone = document.getElementById('excelDropzone');
    excelFileInput = document.getElementById('excelFileInput');
    worksheetIndexInput = document.getElementById('worksheetIndex');
    excelHasHeadersCheckbox = document.getElementById('excelHasHeaders');
    convertToMdBtn = document.getElementById('convertToMdBtn');
    mdOutputContainer = document.getElementById('mdOutput');
    
    // 绑定事件
    if (convertToMdBtn) {
      convertToMdBtn.addEventListener('click', convertExcelToMarkdown);
    }
    
    if (excelDropzone && excelFileInput) {
      setupFileUpload();
    }
  }
  
  /**
   * 设置文件上传
   */
  function setupFileUpload() {
    excelDropzone.addEventListener('click', () => {
      excelFileInput.click();
    });
    
    excelDropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      excelDropzone.classList.add('dragover');
    });
    
    excelDropzone.addEventListener('dragleave', () => {
      excelDropzone.classList.remove('dragover');
    });
    
    excelDropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      excelDropzone.classList.remove('dragover');
      
      if (e.dataTransfer.files.length) {
        handleExcelFile(e.dataTransfer.files[0]);
      }
    });
    
    excelFileInput.addEventListener('change', () => {
      if (excelFileInput.files.length) {
        handleExcelFile(excelFileInput.files[0]);
      }
    });
  }
  
  /**
   * 处理Excel文件
   */
  function handleExcelFile(file) {
    try {
      // 检查文件类型
      if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls') && !file.name.endsWith('.csv')) {
        throw new Error('请上传有效的Excel文件（.xlsx, .xls）或CSV文件');
      }
      
      // 显示加载中提示
      if (mdOutputContainer) {
        mdOutputContainer.innerHTML = `
          <div class="loading">
            <div class="spinner"></div>
            <p>正在解析Excel文件，请稍候...</p>
          </div>
        `;
      }
      
      // 检查XLSX库是否可用
      if (typeof XLSX === 'undefined') {
        throw new Error('XLSX库未加载');
      }
      
      // 读取文件
      const reader = new FileReader();
      
      reader.onload = function(e) {
        try {
          // 确保结果是ArrayBuffer类型
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetNames = workbook.SheetNames;
          
          if (sheetNames.length === 0) {
            throw new Error('Excel文件中不包含任何工作表');
          }
          
          // 保存Excel数据
          excelData = {
            workbook: workbook,
            sheetNames: sheetNames,
            fileName: file.name
          };
          
          // 更新工作表索引最大值
          if (worksheetIndexInput) {
            worksheetIndexInput.max = (sheetNames.length - 1).toString();
            if (parseInt(worksheetIndexInput.value) >= sheetNames.length) {
              worksheetIndexInput.value = '0';
            }
          }
          
          // 启用转换按钮
          if (convertToMdBtn) {
            convertToMdBtn.disabled = false;
          }
          
          // 显示工作表信息
          showWorksheetInfo();
        } catch (error) {
          console.error('解析Excel失败:', error);
          if (mdOutputContainer) {
            mdOutputContainer.innerHTML = `<div class="error">解析Excel文件失败: ${error.message}</div>`;
          }
        }
      };
      
      reader.onerror = function() {
        if (mdOutputContainer) {
          mdOutputContainer.innerHTML = `<div class="error">读取文件失败，请检查文件是否损坏</div>`;
        }
      };
      
      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error('处理Excel文件失败:', error);
      if (mdOutputContainer) {
        mdOutputContainer.innerHTML = `<div class="error">${error.message}</div>`;
      }
    }
  }
  
  /**
   * 显示工作表信息
   */
  function showWorksheetInfo() {
    if (!excelData || !mdOutputContainer) return;
    
    const { workbook, sheetNames, fileName } = excelData;
    
    let infoHtml = `
      <div class="excel-info card">
        <h3>Excel文件信息</h3>
        <p>文件名: ${fileName}</p>
        <p>工作表数量: ${sheetNames.length}</p>
        <p>可用工作表: ${sheetNames.join(', ')}</p>
      </div>
      <div class="instruction">
        <p>点击"转换为Markdown"按钮以生成Markdown表格</p>
      </div>
    `;
    
    mdOutputContainer.innerHTML = infoHtml;
  }
  
  /**
   * 转换Excel为Markdown
   */
  function convertExcelToMarkdown() {
    try {
      // 检查DOM元素和数据
      if (!excelData || !mdOutputContainer || !worksheetIndexInput || !excelHasHeadersCheckbox) {
        throw new Error('Excel转换所需的DOM元素或数据未找到');
      }
      
      const { workbook, sheetNames } = excelData;
      const worksheetIndex = parseInt(worksheetIndexInput.value) || 0;
      const hasHeaders = excelHasHeadersCheckbox.checked;
      
      if (worksheetIndex < 0 || worksheetIndex >= sheetNames.length) {
        throw new Error(`工作表索引${worksheetIndex}超出范围（0-${sheetNames.length - 1}）`);
      }
      
      // 获取指定工作表
      const sheetName = sheetNames[worksheetIndex];
      const worksheet = workbook.Sheets[sheetName];
      
      // 将工作表转换为数组
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      
      if (jsonData.length === 0) {
        throw new Error('工作表不包含数据');
      }
      
      // 生成Markdown表格
      const markdownTable = generateMarkdownTable(jsonData, hasHeaders);
      
      // 显示生成的Markdown表格
      renderOutput(markdownTable, jsonData);
    } catch (error) {
      console.error('转换Excel失败:', error);
      if (mdOutputContainer) {
        mdOutputContainer.innerHTML = `<div class="error">${error.message}</div>`;
      }
    }
  }
  
  /**
   * 生成Markdown表格
   */
  function generateMarkdownTable(data, hasHeaders) {
    if (!data || data.length === 0) {
      return '';
    }
    
    // 确保所有行都有相同的列数
    const maxCols = Math.max(...data.map(row => row.length));
    const normalizedData = data.map(row => {
      while (row.length < maxCols) {
        row.push('');
      }
      return row;
    });
    
    // 找出每列的最大宽度
    const columnWidths = Array(maxCols).fill(0);
    for (const row of normalizedData) {
      for (let i = 0; i < row.length; i++) {
        const cell = row[i];
        const cellStr = cell !== null && cell !== undefined ? cell.toString() : '';
        if (cellStr.length > columnWidths[i]) {
          columnWidths[i] = cellStr.length;
        }
      }
    }
    
    // 确保列宽至少为3
    columnWidths.forEach((width, i) => {
      columnWidths[i] = Math.max(width, 3);
    });
    
    // 生成Markdown表格
    let markdownTable = '';
    
    // 添加表头行
    markdownTable += '| ';
    for (let i = 0; i < maxCols; i++) {
      const headerValue = hasHeaders && normalizedData[0] && i < normalizedData[0].length ? 
        normalizedData[0][i] : 
        `Column ${i + 1}`;
      const headerStr = headerValue !== null && headerValue !== undefined ? headerValue.toString() : '';
      markdownTable += headerStr.padEnd(columnWidths[i]) + ' | ';
    }
    markdownTable += '\n';
    
    // 添加分隔行
    markdownTable += '| ';
    for (let i = 0; i < maxCols; i++) {
      markdownTable += '-'.repeat(columnWidths[i]) + ' | ';
    }
    markdownTable += '\n';
    
    // 添加数据行
    const startRow = hasHeaders ? 1 : 0;
    for (let rowIndex = startRow; rowIndex < normalizedData.length; rowIndex++) {
      markdownTable += '| ';
      for (let i = 0; i < maxCols; i++) {
        const cellValue = rowIndex < normalizedData.length && i < normalizedData[rowIndex].length ? 
          normalizedData[rowIndex][i] : 
          '';
        const cellStr = cellValue !== null && cellValue !== undefined ? cellValue.toString() : '';
        markdownTable += cellStr.padEnd(columnWidths[i]) + ' | ';
      }
      markdownTable += '\n';
    }
    
    return markdownTable;
  }
  
  /**
   * 渲染输出
   */
  function renderOutput(markdownTable, tableData) {
    if (!markdownTable || !mdOutputContainer) {
      return;
    }
    
    // 创建HTML预览
    // 假设有一个简单的markdown解析函数，这里简化处理
    const htmlPreview = parseMarkdownTable(markdownTable);
    
    let outputHtml = `
      <div class="markdown-result">
        <div class="card">
          <h3>Markdown代码</h3>
          <pre>${escapeHtml(markdownTable)}</pre>
        </div>
        
        <div class="card mt-4">
          <h3>预览</h3>
          <div class="preview">${htmlPreview}</div>
        </div>
        
        <div class="btn-group mt-4">
          <button id="copyMarkdownBtn" class="btn">复制Markdown代码</button>
          <button id="copyHtmlBtn" class="btn">复制HTML表格</button>
        </div>
      </div>
    `;
    
    mdOutputContainer.innerHTML = outputHtml;
    
    // 添加复制按钮事件
    document.getElementById('copyMarkdownBtn').addEventListener('click', () => {
      copyToClipboard(markdownTable, '已复制Markdown代码到剪贴板');
    });
    
    document.getElementById('copyHtmlBtn').addEventListener('click', () => {
      copyToClipboard(htmlPreview, '已复制HTML表格到剪贴板');
    });
  }
  
  /**
   * 解析Markdown表格为HTML
   */
  function parseMarkdownTable(markdown) {
    // 这是一个简化的Markdown表格解析器
    // 在实际应用中可以使用成熟的Markdown解析库
    const lines = markdown.trim().split('\n');
    if (lines.length < 3) return ''; // 至少需要表头、分隔行和一行数据
    
    let html = '<table>';
    
    // 处理表头
    let headerLine = lines[0];
    html += '<thead><tr>';
    
    // 提取表头单元格
    const headerCells = headerLine
      .split('|')
      .filter(cell => cell.trim() !== '')
      .map(cell => cell.trim());
      
    for (const cell of headerCells) {
      html += `<th>${escapeHtml(cell)}</th>`;
    }
    
    html += '</tr></thead>';
    
    // 跳过分隔行，处理数据行
    html += '<tbody>';
    for (let i = 2; i < lines.length; i++) {
      const line = lines[i];
      
      html += '<tr>';
      
      // 提取数据单元格
      const cells = line
        .split('|')
        .filter(cell => cell.trim() !== '')
        .map(cell => cell.trim());
        
      for (const cell of cells) {
        html += `<td>${escapeHtml(cell)}</td>`;
      }
      
      html += '</tr>';
    }
    
    html += '</tbody></table>';
    
    return html;
  }
  
  /**
   * 复制内容到剪贴板
   */
  function copyToClipboard(text, successMessage) {
    try {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      
      const successful = document.execCommand('copy');
      if (successful) {
        alert(successMessage);
      } else {
        throw new Error('复制操作失败');
      }
    } catch (error) {
      console.error('复制失败:', error);
      alert('复制失败: ' + error.message);
    } finally {
      if (textarea) {
        document.body.removeChild(textarea);
      }
    }
  }
  
  /**
   * 转义HTML特殊字符
   */
  function escapeHtml(unsafe) {
    return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
  
  // 公开API
  return {
    init,
    handleExcelFile,
    convertExcelToMarkdown
  };
})();

// 在DOMContentLoaded时初始化
document.addEventListener('DOMContentLoaded', Excel2MD.init); 