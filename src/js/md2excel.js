/**
 * Markdown表格转Excel功能模块
 */
const MD2Excel = (function() {
  // 私有变量
  let tableData = [];
  let markdownInput;
  let hasHeadersCheckbox;
  let skipHeaderSeparatorCheckbox;
  let multiTableModeCheckbox;
  let excelFilenameInput;
  let worksheetNameInput;
  let processBtn;
  let outputContainer;
  let dropzone;
  let fileInput;
  
  // 使用英文作为默认工作表名称
  const DEFAULT_WORKSHEET_NAME = 'Table Data';
  
  /**
   * 初始化模块
   */
  function init() {
    // 获取DOM元素
    markdownInput = document.getElementById('markdownInput');
    hasHeadersCheckbox = document.getElementById('hasHeaders');
    skipHeaderSeparatorCheckbox = document.getElementById('skipHeaderSeparator');
    multiTableModeCheckbox = document.getElementById('multiTableMode');
    excelFilenameInput = document.getElementById('excelFilename');
    worksheetNameInput = document.getElementById('worksheetName');
    processBtn = document.getElementById('processBtn');
    outputContainer = document.getElementById('output');
    dropzone = document.getElementById('dropzone');
    fileInput = document.getElementById('fileInput');
    
    // 重置数据
    reset();
    
    // 绑定事件
    if (markdownInput) {
      markdownInput.addEventListener('input', updateProcessButton);
    }
    
    if (processBtn) {
      processBtn.addEventListener('click', processMarkdown);
    }
    
    if (dropzone && fileInput) {
      setupFileUpload();
    }
    
    // 初始化按钮状态
    updateProcessButton();
  }
  
  /**
   * 重置模块数据
   */
  function reset() {
    // 清空数据
    tableData = [];
    
    // 重置输入
    if (markdownInput) markdownInput.value = '';
    
    // 重置复选框
    if (hasHeadersCheckbox) hasHeadersCheckbox.checked = true;
    if (skipHeaderSeparatorCheckbox) skipHeaderSeparatorCheckbox.checked = true;
    if (multiTableModeCheckbox) multiTableModeCheckbox.checked = false;
    
    // 重置文件名输入
    if (excelFilenameInput) excelFilenameInput.value = 'table_data';
    if (worksheetNameInput) worksheetNameInput.value = DEFAULT_WORKSHEET_NAME;
    
    // 禁用处理按钮
    if (processBtn) processBtn.disabled = true;
    
    // 重置输出区域
    if (outputContainer) {
      outputContainer.innerHTML = `
        <div class="instruction">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
          </svg>
          <p>在左侧输入 Markdown 表格内容以查看结果</p>
        </div>
      `;
    }
  }
  
  /**
   * 设置文件上传
   */
  function setupFileUpload() {
    dropzone.addEventListener('click', () => {
      fileInput.click();
    });
    
    dropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropzone.classList.add('dragover');
    });
    
    dropzone.addEventListener('dragleave', () => {
      dropzone.classList.remove('dragover');
    });
    
    dropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropzone.classList.remove('dragover');
      
      if (e.dataTransfer.files.length) {
        handleFile(e.dataTransfer.files[0]);
      }
    });
    
    fileInput.addEventListener('change', () => {
      if (fileInput.files.length) {
        handleFile(fileInput.files[0]);
      }
    });
  }
  
  /**
   * 处理上传的文件
   */
  function handleFile(file) {
    if (!file.name.endsWith('.md') && !file.name.endsWith('.txt')) {
      showMessage('请上传Markdown文件(.md)或文本文件(.txt)');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
      markdownInput.value = e.target.result;
      updateProcessButton();
    };
    reader.readAsText(file);
  }
  
  /**
   * 更新处理按钮状态
   */
  function updateProcessButton() {
    if (processBtn && markdownInput) {
      processBtn.disabled = !markdownInput.value.trim();
    }
  }
  
  /**
   * 处理Markdown
   */
  function processMarkdown() {
    try {
      // 检查必要的DOM元素是否存在
      if (!markdownInput || !outputContainer) {
        throw new Error('DOM元素未找到');
      }
      
      const markdown = markdownInput.value;
      if (!markdown.trim()) {
        outputContainer.innerHTML = '<div class="error">请输入Markdown表格内容</div>';
        return;
      }
      
      const hasHeaders = hasHeadersCheckbox.checked;
      const skipHeaderSeparator = skipHeaderSeparatorCheckbox.checked;
      const isMultiTableMode = multiTableModeCheckbox.checked;
      
      if (isMultiTableMode) {
        // 多表格模式
        console.log('使用多表格模式处理Markdown');
        const tables = detectMultipleTables(markdown, skipHeaderSeparator);
        if (tables.length === 0) {
          outputContainer.innerHTML = '<div class="error">未检测到有效的表格数据</div>';
          return;
        }
        
        console.log(`检测到 ${tables.length} 个表格`);
        tableData = tables;
        renderMultiTablesOutput(tables, hasHeaders);
      } else {
        // 单表格模式
        console.log('使用单表格模式处理Markdown');
        const parsedTable = parseMarkdown(markdown, skipHeaderSeparator);
        if (parsedTable.length === 0) {
          outputContainer.innerHTML = '<div class="error">未解析到有效的表格数据</div>';
          return;
        }
        
        tableData = [parsedTable];
        renderOutput(parsedTable, hasHeaders);
      }
    } catch (error) {
      console.error('处理Markdown时出错:', error);
      outputContainer.innerHTML = `<div class="error">处理失败: ${error.message}</div>`;
    }
  }
  
  /**
   * 解析Markdown表格
   */
  function parseMarkdown(markdown, skipHeaderSeparator = true) {
    const result = [];
    const lines = markdown.trim().split('\n');
    
    // 查找表格标记行
    const startIdx = lines.findIndex(line => line.includes('|'));
    if (startIdx === -1) return result;
    
    // 解析表格头和数据行
    const tableLines = lines.slice(startIdx);
    const filteredLines = tableLines.filter(line => {
      // 跳过分隔行（---|---）
      if (skipHeaderSeparator && line.replace(/\|/g, '').trim().match(/^[-:]+$/)) {
        return false;
      }
      return line.includes('|');
    });
    
    for (const line of filteredLines) {
      // 分割行并移除前后空格
      const cells = line.split('|')
        .map(cell => cell.trim())
        .filter((cell, idx, arr) => idx > 0 && idx < arr.length - 1 || (arr.length <= 3 && cell));
      
      result.push(cells);
    }
    
    return result;
  }
  
  /**
   * 检测多个表格
   */
  function detectMultipleTables(markdown, skipHeaderSeparator = true) {
    const result = [];
    const lines = markdown.trim().split('\n');
    
    let currentTable = [];
    let inTable = false;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // 判断是否是表格行
      const isTableRow = line.includes('|');
      
      // 判断是否是分隔行
      const isSeparatorRow = isTableRow && line.replace(/\|/g, '').trim().match(/^[-:]+$/);
      
      // 如果是表格行并且需要跳过分隔行，则继续下一行
      if (isTableRow && skipHeaderSeparator && isSeparatorRow) {
        continue;
      }
      
      // 如果不在表格中并且遇到表格行，则开始新表格
      if (!inTable && isTableRow) {
        inTable = true;
        currentTable = [];
      }
      
      // 如果在表格中
      if (inTable) {
        // 如果是表格行，则添加到当前表格
        if (isTableRow) {
          // 分割行并移除前后空格
          const cells = line.split('|')
            .map(cell => cell.trim())
            .filter((cell, idx, arr) => idx > 0 && idx < arr.length - 1 || (arr.length <= 3 && cell));
          
          currentTable.push(cells);
        } 
        // 如果不是表格行且已有表格内容，则结束当前表格
        else if (currentTable.length > 0) {
          inTable = false;
          result.push([...currentTable]);
          currentTable = [];
        }
      }
    }
    
    // 处理文件结束时仍在处理的表格
    if (inTable && currentTable.length > 0) {
      result.push([...currentTable]);
    }
    
    return result;
  }
  
  /**
   * 渲染单表格输出
   */
  function renderOutput(data, hasHeaders) {
    if (!data || data.length === 0) {
      outputContainer.innerHTML = '<div class="error">无法解析表格数据</div>';
      return;
    }
    
    // 创建表格HTML
    let html = '<div class="output-table"><table>';
    
    if (hasHeaders && data.length > 0) {
      html += '<thead><tr>';
      data[0].forEach(cell => {
        html += `<th>${escapeHtml(cell)}</th>`;
      });
      html += '</tr></thead>';
    }
    
    html += '<tbody>';
    
    const startRow = hasHeaders ? 1 : 0;
    for (let i = startRow; i < data.length; i++) {
      html += '<tr>';
      data[i].forEach(cell => {
        html += `<td>${escapeHtml(cell)}</td>`;
      });
      html += '</tr>';
    }
    
    html += '</tbody></table></div>';
    
    // 添加操作按钮
    html += `
      <div class="btn-group">
        <button id="copyTableBtn" class="btn">复制表格</button>
        <button id="exportExcelBtn" class="btn">下载Excel</button>
      </div>
    `;
    
    outputContainer.innerHTML = html;
    
    // 添加按钮事件
    document.getElementById('copyTableBtn').addEventListener('click', copyTableToClipboard);
    document.getElementById('exportExcelBtn').addEventListener('click', exportToExcel);
  }
  
  /**
   * 渲染多表格输出
   */
  function renderMultiTablesOutput(tables, hasHeaders) {
    if (!tables || tables.length === 0) {
      outputContainer.innerHTML = '<div class="error">未找到有效的表格数据</div>';
      return;
    }
    
    let html = `<div class="multi-tables">
      <h3>检测到 ${tables.length} 个表格</h3>
      <div class="tabs table-tabs">
    `;
    
    // 创建选项卡
    tables.forEach((_, index) => {
      html += `<div class="tab${index === 0 ? ' active' : ''}" data-tab="table-${index}">表格 ${index + 1}</div>`;
    });
    
    html += '</div>';
    
    // 创建表格内容
    tables.forEach((table, index) => {
      html += `<div id="table-content-${index}" class="tab-content${index === 0 ? ' active' : ''}">`;
      
      // 表格
      html += '<div class="output-table"><table>';
      
      if (hasHeaders && table.length > 0) {
        html += '<thead><tr>';
        table[0].forEach(cell => {
          html += `<th>${escapeHtml(cell)}</th>`;
        });
        html += '</tr></thead>';
      }
      
      html += '<tbody>';
      
      const startRow = hasHeaders ? 1 : 0;
      for (let i = startRow; i < table.length; i++) {
        html += '<tr>';
        table[i].forEach(cell => {
          html += `<td>${escapeHtml(cell)}</td>`;
        });
        html += '</tr>';
      }
      
      html += '</tbody></table></div>';
      
      // 单表格操作按钮
      html += `
        <div class="btn-group">
          <button class="copy-table-btn btn" data-index="${index}">复制表格 ${index + 1}</button>
        </div>
      `;
      
      html += '</div>';
    });
    
    // 多表格操作按钮
    html += `
      <div class="btn-group mt-4">
        <button id="exportMultiBtn" class="btn">下载Excel (所有表格)</button>
      </div>
    `;
    
    html += '</div>';
    
    outputContainer.innerHTML = html;
    
    // 添加选项卡事件
    document.querySelectorAll('.table-tabs .tab').forEach(tab => {
      tab.addEventListener('click', () => {
        // 获取选项卡ID
        const tabId = tab.getAttribute('data-tab');
        const tabIndex = tabId.split('-')[1];
        const contentId = `table-content-${tabIndex}`;
        
        // 确保目标内容元素存在
        const targetContent = document.getElementById(contentId);
        if (!targetContent) {
          console.error(`找不到内容元素: ${contentId}`);
          return;
        }
        
        // 移除所有活动状态
        document.querySelectorAll('.table-tabs .tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.multi-tables .tab-content').forEach(c => c.classList.remove('active'));
        
        // 添加当前活动状态
        tab.classList.add('active');
        targetContent.classList.add('active');
        
        console.log(`切换到表格 ${parseInt(tabIndex) + 1}`);
      });
    });
    
    // 添加复制按钮事件
    document.querySelectorAll('.copy-table-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const index = parseInt(btn.getAttribute('data-index'));
        copySpecificTable(index);
      });
    });
    
    // 添加导出按钮事件
    const exportBtn = document.getElementById('exportMultiBtn');
    if (exportBtn) {
      exportBtn.addEventListener('click', exportMultiTablesToExcel);
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
   * 复制表格到剪贴板
   */
  function copyTableToClipboard() {
    const table = outputContainer.querySelector('table');
    if (!table) return;
    
    try {
      // 创建一个范围
      const range = document.createRange();
      range.selectNode(table);
      
      // 清除当前选择并选择表格
      window.getSelection().removeAllRanges();
      window.getSelection().addRange(range);
      
      // 复制
      document.execCommand('copy');
      
      // 清除选择
      window.getSelection().removeAllRanges();
      
      showMessage('表格已复制到剪贴板');
    } catch (error) {
      console.error('复制失败:', error);
      showMessage('复制失败: ' + error.message);
    }
  }
  
  /**
   * 复制特定表格
   */
  function copySpecificTable(index) {
    const tableContent = document.getElementById(`table-content-${index}`);
    if (!tableContent) return;
    
    const table = tableContent.querySelector('table');
    if (!table) return;
    
    try {
      // 创建一个范围
      const range = document.createRange();
      range.selectNode(table);
      
      // 清除当前选择并选择表格
      window.getSelection().removeAllRanges();
      window.getSelection().addRange(range);
      
      // 复制
      document.execCommand('copy');
      
      // 清除选择
      window.getSelection().removeAllRanges();
      
      showMessage(`表格 ${index + 1} 已复制到剪贴板`);
    } catch (error) {
      console.error('复制失败:', error);
      showMessage('复制失败: ' + error.message);
    }
  }
  
  /**
   * 导出到Excel
   */
  function exportToExcel() {
    try {
      if (!tableData || tableData.length === 0 || tableData[0].length === 0) {
        throw new Error('没有数据可导出');
      }
      
      const filename = (excelFilenameInput.value || 'table_data') + '.xlsx';
      const sheetName = worksheetNameInput.value || DEFAULT_WORKSHEET_NAME;
      const hasHeaders = hasHeadersCheckbox.checked;
      
      exportTablesToExcel(tableData, filename, [sheetName], hasHeaders);
    } catch (error) {
      console.error('导出Excel失败:', error);
      showMessage('导出Excel失败: ' + error.message);
    }
  }
  
  /**
   * 导出多表格到Excel
   */
  function exportMultiTablesToExcel() {
    try {
      if (!tableData || tableData.length === 0) {
        throw new Error('没有数据可导出');
      }
      
      const baseFilename = excelFilenameInput.value || 'table_data';
      const baseSheetName = worksheetNameInput.value || DEFAULT_WORKSHEET_NAME;
      const hasHeaders = hasHeadersCheckbox.checked;
      
      // 创建工作表名称数组
      const sheetNames = tableData.map((_, index) => 
        tableData.length === 1 ? baseSheetName : `${baseSheetName} ${index + 1}`
      );
      
      exportTablesToExcel(tableData, `${baseFilename}.xlsx`, sheetNames, hasHeaders);
    } catch (error) {
      console.error('导出多表格Excel失败:', error);
      showMessage('导出Excel失败: ' + error.message);
    }
  }
  
  /**
   * 将表格数据导出为Excel文件
   */
  function exportTablesToExcel(tables, filename, sheetNames, hasHeaders) {
    // 检查ExcelJS是否可用
    if (typeof ExcelJS === 'undefined') {
      throw new Error('ExcelJS库未加载');
    }
    
    // 检查FileSaver是否可用
    if (typeof saveAs === 'undefined') {
      throw new Error('FileSaver库未加载');
    }
    
    // 创建新的工作簿
    const workbook = new ExcelJS.Workbook();
    
    // 处理每个表格
    tables.forEach((table, index) => {
      // 添加工作表
      const worksheet = workbook.addWorksheet(sheetNames[index] || `Sheet ${index + 1}`);
      
      // 添加数据
      if (hasHeaders && table.length > 0) {
        // 添加表头行
        worksheet.addRow(table[0]);
        
        // 设置表头样式
        const headerRow = worksheet.getRow(1);
        headerRow.font = { bold: true };
        
        // 添加数据行
        for (let i = 1; i < table.length; i++) {
          worksheet.addRow(table[i]);
        }
      } else {
        // 添加所有行
        table.forEach(row => {
          worksheet.addRow(row);
        });
      }
      
      // 调整列宽
      worksheet.columns.forEach(column => {
        let maxLength = 0;
        column.eachCell({ includeEmpty: true }, cell => {
          const length = cell.value ? cell.value.toString().length : 0;
          if (length > maxLength) {
            maxLength = length;
          }
        });
        column.width = Math.min(Math.max(maxLength + 2, 10), 50);
      });
    });
    
    // 导出工作簿
    workbook.xlsx.writeBuffer().then(buffer => {
      const blob = new Blob([buffer], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      saveAs(blob, filename);
      
      // 显示成功消息
      if (tables.length > 1) {
        showMessage(`已成功导出包含 ${tables.length} 个工作表的Excel文件`);
      } else {
        showMessage('表格已成功导出为Excel文件');
      }
    });
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
    processMarkdown,
    reset
  };
})();

// 在DOMContentLoaded时初始化
document.addEventListener('DOMContentLoaded', MD2Excel.init); 