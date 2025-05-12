/**
 * Excel转Markdown功能模块
 */
const Excel2MD = (function() {
  // 私有变量
  let excelData = null;
  let excelDropzone;
  let excelFileInput;
  let excelHasHeadersCheckbox;
  let mdFilenameInput;
  let convertToMdBtn;
  let mdOutputContainer;
  let currentWorksheets = []; // 存储所有工作表信息
  
  /**
   * 初始化模块
   */
  function init() {
    // 获取DOM元素
    excelDropzone = document.getElementById('excelDropzone');
    excelFileInput = document.getElementById('excelFileInput');
    excelHasHeadersCheckbox = document.getElementById('excelHasHeaders');
    mdFilenameInput = document.getElementById('mdFilename');
    convertToMdBtn = document.getElementById('convertToMdBtn');
    mdOutputContainer = document.getElementById('mdOutput');
    
    // 重置数据
    reset();
    
    // 绑定事件
    if (convertToMdBtn) {
      convertToMdBtn.addEventListener('click', convertExcelToMarkdown);
    }
    
    if (excelDropzone && excelFileInput) {
      setupFileUpload();
    }
  }
  
  /**
   * 重置模块数据
   */
  function reset() {
    // 清空数据
    excelData = null;
    currentWorksheets = [];
    
    // 重置复选框
    if (excelHasHeadersCheckbox) excelHasHeadersCheckbox.checked = true;
    
    // 重置文件名输入
    if (mdFilenameInput) mdFilenameInput.value = 'table_data';
    
    // 禁用转换按钮
    if (convertToMdBtn) convertToMdBtn.disabled = true;
    
    // 清空文件输入
    if (excelFileInput) excelFileInput.value = '';
    
    // 重置输出区域
    if (mdOutputContainer) {
      mdOutputContainer.innerHTML = `
        <div class="instruction">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
          </svg>
          <p>在左侧上传 Excel 文件以查看结果</p>
        </div>
      `;
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
          
          // 预处理所有工作表
          processAllWorksheets(workbook, sheetNames);
          
          // 启用转换按钮
          if (convertToMdBtn) {
            convertToMdBtn.disabled = false;
          }
          
          // 显示文件信息
          showFileInfo();
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
   * 预处理所有工作表
   */
  function processAllWorksheets(workbook, sheetNames) {
    currentWorksheets = [];
    
    sheetNames.forEach((sheetName, index) => {
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      
      if (jsonData.length > 0) {
        const hasHeaders = excelHasHeadersCheckbox ? excelHasHeadersCheckbox.checked : true;
        const markdownTable = generateMarkdownTable(jsonData, hasHeaders);
        
        currentWorksheets.push({
          index: index,
          name: sheetName,
          data: jsonData,
          markdownTable: markdownTable
        });
      }
    });
  }
  
  /**
   * 显示多表格输出
   */
  function showMultiTablesOutput() {
    if (!mdOutputContainer || currentWorksheets.length === 0) return;
    
    // 构建表格标签
    let tabsHtml = `
      <div class="output-header">
        <h3>检测到 ${currentWorksheets.length} 个表格</h3>
      </div>
      <div class="table-tabs">
    `;
    
    currentWorksheets.forEach((sheet, index) => {
      const isActive = index === 0 ? 'active' : '';
      // 使用工作表名称而不是简单的编号
      tabsHtml += `<div class="tab ${isActive}" data-index="${index}">表格 ${index + 1} - ${sheet.name}</div>`;
    });
    
    tabsHtml += `</div>`;
    
    // 构建表格内容
    let contentHtml = `<div class="multi-tables">`;
    
    currentWorksheets.forEach((sheet, index) => {
      const isActive = index === 0 ? 'active' : '';
      
      // 添加表格元数据信息
      contentHtml += `
        <div class="tab-content ${isActive}" data-index="${index}">
          <div class="sheet-info">
            <div class="sheet-metadata">
              <p><strong>工作表名称:</strong> ${sheet.name}</p>
              <p><strong>行数:</strong> ${sheet.data.length}</p>
              <p><strong>列数:</strong> ${sheet.data.length > 0 ? sheet.data[0].length : 0}</p>
            </div>
          </div>
          <div class="preview">
            <pre>${escapeHtml(sheet.markdownTable)}</pre>
          </div>
        </div>
      `;
    });
    
    contentHtml += `</div>`;
    
    // 添加底部按钮，删除"下载Excel表格"按钮
    let buttonsHtml = `
      <div class="action-buttons">
        <button id="copyCurrentTableBtn" class="btn">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
          </svg>
          复制当前表格
        </button>
        <button id="downloadCurrentTableBtn" class="btn">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
          下载当前表格
        </button>
        <button id="downloadAllMdBtn" class="btn">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
          下载所有MD表格
        </button>
      </div>
    `;
    
    // 更新DOM
    mdOutputContainer.innerHTML = tabsHtml + contentHtml + buttonsHtml;
    
    // 添加事件处理
    setupTabEventHandlers();
  }
  
  /**
   * 设置选项卡事件处理程序
   */
  function setupTabEventHandlers() {
    // 选项卡切换
    const tabs = document.querySelectorAll('.table-tabs .tab');
    const contents = document.querySelectorAll('.multi-tables .tab-content');
    
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const index = tab.getAttribute('data-index');
        
        // 切换活动选项卡
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        // 切换内容
        contents.forEach(content => {
          content.classList.remove('active');
          if (content.getAttribute('data-index') === index) {
            content.classList.add('active');
          }
        });
      });
    });
    
    // 复制当前表格按钮
    const copyCurrentTableBtn = document.getElementById('copyCurrentTableBtn');
    if (copyCurrentTableBtn) {
      copyCurrentTableBtn.addEventListener('click', () => {
        const activeTab = document.querySelector('.table-tabs .tab.active');
        if (activeTab) {
          const index = parseInt(activeTab.getAttribute('data-index'));
          if (index >= 0 && index < currentWorksheets.length) {
            copyToClipboard(currentWorksheets[index].markdownTable, '已复制当前表格到剪贴板');
          }
        }
      });
    }
    
    // 下载当前表格按钮
    const downloadCurrentTableBtn = document.getElementById('downloadCurrentTableBtn');
    if (downloadCurrentTableBtn) {
      downloadCurrentTableBtn.addEventListener('click', () => {
        const activeTab = document.querySelector('.table-tabs .tab.active');
        if (activeTab) {
          const index = parseInt(activeTab.getAttribute('data-index'));
          if (index >= 0 && index < currentWorksheets.length) {
            const fileName = mdFilenameInput ? mdFilenameInput.value || 'table_data' : 'table_data';
            const sheetName = currentWorksheets[index].name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
            downloadMarkdown(currentWorksheets[index].markdownTable, `${fileName}_${sheetName}.md`);
          }
        }
      });
    }
    
    // 下载所有MD表格按钮
    const downloadAllMdBtn = document.getElementById('downloadAllMdBtn');
    if (downloadAllMdBtn) {
      downloadAllMdBtn.addEventListener('click', () => {
        downloadAllMarkdownTables();
      });
    }
  }
  
  /**
   * 下载原始Excel文件
   */
  function downloadExcelFile() {
    if (!excelData || !excelData.workbook) {
      showMessage('没有可用的Excel数据');
      return;
    }
    
    try {
      // 获取文件名
      const fileName = mdFilenameInput ? mdFilenameInput.value || 'table_data' : 'table_data';
      
      // 创建新的Excel工作簿
      const wb = XLSX.utils.book_new();
      
      // 添加每个工作表
      currentWorksheets.forEach(sheet => {
        const ws = XLSX.utils.aoa_to_sheet(sheet.data);
        XLSX.utils.book_append_sheet(wb, ws, sheet.name);
      });
      
      // 生成Excel文件并下载
      XLSX.writeFile(wb, `${fileName}.xlsx`);
      
      showMessage('已下载Excel文件');
    } catch (error) {
      console.error('下载Excel文件失败:', error);
      showMessage('下载Excel文件失败: ' + error.message);
    }
  }
  
  /**
   * 转换Excel为Markdown
   */
  function convertExcelToMarkdown() {
    try {
      if (!excelData || currentWorksheets.length === 0) {
        throw new Error('没有可用的Excel数据');
      }
      
      // 显示多表格输出界面
      showMultiTablesOutput();
      showMessage(`已转换 ${currentWorksheets.length} 个工作表为Markdown表格`);
    } catch (error) {
      console.error('转换Excel失败:', error);
      if (mdOutputContainer) {
        mdOutputContainer.innerHTML = `<div class="error">${error.message}</div>`;
      }
    }
  }
  
  /**
   * 显示文件信息
   */
  function showFileInfo() {
    if (!excelData || !mdOutputContainer) return;
    
    const { fileName, sheetNames } = excelData;
    
    let infoHtml = `
      <div class="output-header">
        <h3>Excel文件信息</h3>
      </div>
      <div class="sheet-info">
        <div class="sheet-metadata">
          <p><strong>文件名:</strong> ${fileName}</p>
          <p><strong>可用工作表:</strong> ${sheetNames.length} 个</p>
        </div>
      </div>
      <div class="instruction">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
        </svg>
        <p>点击"转换为Markdown"按钮生成表格</p>
      </div>
    `;
    
    mdOutputContainer.innerHTML = infoHtml;
  }
  
  /**
   * 生成Markdown表格
   */
  function generateMarkdownTable(data, hasHeaders) {
    if (!data || data.length === 0) {
      return '';
    }
    
    // 清理数据：过滤掉空行和格式化单元格内容
    const cleanData = data.filter(row => {
      // 过滤掉全空的行
      return row.some(cell => cell !== null && cell !== undefined && cell.toString().trim() !== '');
    }).map(row => {
      // 格式化每个单元格
      return row.map(cell => {
        if (cell === null || cell === undefined) return '';
        const cellStr = cell.toString().trim();
        // 处理单元格中的管道符号，会影响Markdown表格格式
        return cellStr.replace(/\|/g, '\\|');
      });
    });
    
    if (cleanData.length === 0) {
      return '';
    }
    
    // 确保所有行都有相同的列数
    const maxCols = Math.max(...cleanData.map(row => row.length));
    const normalizedData = cleanData.map(row => {
      const newRow = [...row];
      while (newRow.length < maxCols) {
        newRow.push('');
      }
      return newRow;
    });
    
    // 找出每列的最大宽度（限制最大宽度以避免表格过宽）
    const MAX_COLUMN_WIDTH = 30; // 最大列宽
    const columnWidths = Array(maxCols).fill(0);
    
    for (const row of normalizedData) {
      for (let i = 0; i < row.length; i++) {
        const cell = row[i];
        const cellStr = cell !== null && cell !== undefined ? cell.toString() : '';
        const displayLength = cellStr.length;
        
        if (displayLength > columnWidths[i] && displayLength <= MAX_COLUMN_WIDTH) {
          columnWidths[i] = displayLength;
        } else if (displayLength > MAX_COLUMN_WIDTH) {
          columnWidths[i] = MAX_COLUMN_WIDTH;
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
        `列 ${i + 1}`;
      const headerStr = headerValue !== null && headerValue !== undefined ? headerValue.toString() : '';
      // 如果标题太长，截断并添加省略号
      const displayHeader = headerStr.length > MAX_COLUMN_WIDTH ? 
        headerStr.substring(0, MAX_COLUMN_WIDTH - 3) + '...' : 
        headerStr;
      
      markdownTable += displayHeader.padEnd(columnWidths[i]) + ' | ';
    }
    markdownTable += '\n';
    
    // 添加分隔行
    markdownTable += '| ';
    for (let i = 0; i < maxCols; i++) {
      // 使用冒号指示对齐方式，默认为左对齐
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
        
        // 如果单元格内容太长，截断并添加省略号
        const displayCell = cellStr.length > MAX_COLUMN_WIDTH ? 
          cellStr.substring(0, MAX_COLUMN_WIDTH - 3) + '...' : 
          cellStr;
        
        markdownTable += displayCell.padEnd(columnWidths[i]) + ' | ';
      }
      markdownTable += '\n';
    }
    
    return markdownTable;
  }
  
  /**
   * 渲染输出
   */
  function renderOutput(markdownTable, tableData) {
    if (!mdOutputContainer) return;
    
    const fileName = mdFilenameInput ? mdFilenameInput.value || 'table_data' : 'table_data';
    
    const outputHtml = `
      <div class="preview">
          <pre>${escapeHtml(markdownTable)}</pre>
        </div>
      <div class="btn-group">
        <button onclick="Excel2MD.copyToClipboard(\`${markdownTable.replace(/`/g, '\\`')}\`, '已复制到剪贴板')">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
          </svg>
          复制 Markdown
        </button>
        <button onclick="Excel2MD.downloadMarkdown(\`${markdownTable.replace(/`/g, '\\`')}\`, '${fileName}.md')">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
          下载 Markdown 文件
        </button>
      </div>
    `;
    
    mdOutputContainer.innerHTML = outputHtml;
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
   * 将文本复制到剪贴板
   */
  function copyToClipboard(text, successMessage = '已复制到剪贴板') {
    try {
      // 检查是否支持navigator.clipboard
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(() => {
          showMessage(successMessage);
        }).catch(err => {
          console.error('复制失败:', err);
          fallbackCopyToClipboard(text, successMessage);
        });
      } else {
        fallbackCopyToClipboard(text, successMessage);
      }
    } catch (error) {
      console.error('复制到剪贴板失败:', error);
      alert('复制失败: ' + error.message);
    }
  }
  
  /**
   * 备用的复制剪贴板方案
   */
  function fallbackCopyToClipboard(text, successMessage) {
      const textarea = document.createElement('textarea');
      textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      
    try {
      const successful = document.execCommand('copy');
      document.body.removeChild(textarea);
      
      if (successful) {
        showMessage(successMessage);
      } else {
        throw new Error('复制命令执行失败');
      }
    } catch (err) {
        document.body.removeChild(textarea);
      console.error('fallback复制失败:', err);
      alert('复制失败，请手动复制文本');
    }
  }
  
  /**
   * 显示消息
   */
  function showMessage(message) {
    const messageElement = document.createElement('div');
    messageElement.className = 'warning';
    messageElement.textContent = message;
    document.body.appendChild(messageElement);
    
    // 5秒后移除消息
    setTimeout(() => {
      messageElement.classList.add('fade-out');
      setTimeout(() => {
        if (messageElement.parentNode) {
          messageElement.parentNode.removeChild(messageElement);
        }
      }, 1000);
    }, 4000);
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
  
  /**
   * 下载Markdown文件
   */
  function downloadMarkdown(markdown, filename) {
    try {
      const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
      saveAs(blob, filename);
    } catch (error) {
      console.error('下载Markdown文件失败:', error);
      alert('下载失败: ' + error.message);
    }
  }
  
  /**
   * 下载所有Markdown表格
   */
  function downloadAllMarkdownTables() {
    if (!currentWorksheets || currentWorksheets.length === 0) {
      showMessage('无可用的表格数据');
      return;
    }
    
    try {
      const fileName = mdFilenameInput ? mdFilenameInput.value || 'table_data' : 'table_data';
      let zipName = `${fileName}_all_tables.zip`;
      
      // 使用JSZip创建zip文件
      if (typeof JSZip === 'undefined') {
        // 如果JSZip不可用，使用简单的文本文件下载
        let allMarkdown = '';
        currentWorksheets.forEach((sheet, index) => {
          allMarkdown += `# ${sheet.name}\n\n${sheet.markdownTable}\n\n`;
        });
        
        downloadMarkdown(allMarkdown, `${fileName}_all_tables.md`);
        showMessage('已下载所有表格到单个Markdown文件');
        return;
      }
      
      // 创建新的ZIP实例
      const zip = new JSZip();
      
      // 添加每个表格作为单独的文件
      currentWorksheets.forEach((sheet, index) => {
        const safeName = sheet.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        const tableFileName = `${safeName}.md`;
        zip.file(tableFileName, sheet.markdownTable);
      });
      
      // 生成ZIP文件并下载
      zip.generateAsync({type: 'blob'}).then(function(content) {
        saveAs(content, zipName);
        showMessage('已下载所有表格到ZIP文件');
      });
    } catch (error) {
      console.error('下载所有表格失败:', error);
      showMessage('下载失败: ' + error.message);
    }
  }
  
  // 公开API
  return {
    init,
    handleExcelFile,
    convertExcelToMarkdown,
    copyToClipboard,
    downloadMarkdown,
    reset
  };
})();

// 在DOMContentLoaded时初始化
document.addEventListener('DOMContentLoaded', Excel2MD.init); 