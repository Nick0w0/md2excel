/**
 * UI初始化模块
 */
const UI = (function() {
  // 选项卡元素
  let md2excelTab;
  let excel2mdTab;
  let md2excelContent;
  let excel2mdContent;
  
  /**
   * 初始化UI
   */
  function init() {
    // 初始化选项卡
    initTabs();
    
    // 从URL解析选项卡
    parseTabFromURL();
    
    // 添加CSS加载检测
    ensureStylesLoaded();
    
    // 检查外部库
    checkExternalLibraries();
    
    // 如果已加载国际化模块，在翻译UI后更新选项卡
    if (typeof I18n !== 'undefined' && I18n.translateUI) {
      setTimeout(() => {
        I18n.translateUI();
      }, 100);
    }
  }
  
  /**
   * 初始化选项卡
   */
  function initTabs() {
    md2excelTab = document.getElementById('md2excelTab');
    excel2mdTab = document.getElementById('excel2mdTab');
    md2excelContent = document.getElementById('md2excelContent');
    excel2mdContent = document.getElementById('excel2mdContent');
    
    if (!md2excelTab || !excel2mdTab || !md2excelContent || !excel2mdContent) {
      console.error('找不到选项卡元素');
      return;
    }
    
    // 设置选项卡切换事件
    md2excelTab.addEventListener('click', () => {
      setActiveTab('md2excel');
    });
    
    excel2mdTab.addEventListener('click', () => {
      setActiveTab('excel2md');
    });
    
    // 初始状态，激活第一个选项卡
    setActiveTab('md2excel');
  }
  
  /**
   * 设置活动选项卡
   */
  function setActiveTab(tabId) {
    // 移除所有活动状态
    md2excelTab.classList.remove('active');
    excel2mdTab.classList.remove('active');
    md2excelContent.classList.remove('active');
    excel2mdContent.classList.remove('active');
    
    // 激活指定选项卡
    if (tabId === 'md2excel') {
      md2excelTab.classList.add('active');
      md2excelContent.classList.add('active');
      
      // 清除excel2md的输出内容
      resetExcel2MdOutput();
      
      // 从URL中移除excel2md参数
      updateURLParams('tab', 'md2excel');
    } else if (tabId === 'excel2md') {
      excel2mdTab.classList.add('active');
      excel2mdContent.classList.add('active');
      
      // 清除md2excel的输出内容
      resetMd2ExcelOutput();
      
      // 添加excel2md参数到URL
      updateURLParams('tab', 'excel2md');
    }
    
    // 确保语言一致性
    setTimeout(() => {
      if (typeof I18n !== 'undefined' && I18n.translateInstructionTexts) {
        I18n.translateInstructionTexts();
      }
    }, 50);
  }
  
  /**
   * 重置MD2Excel输出区域
   */
  function resetMd2ExcelOutput() {
    // 如果MD2Excel模块可用，调用其reset函数
    if (typeof MD2Excel !== 'undefined' && MD2Excel.reset) {
      MD2Excel.reset();
    } else {
      // 否则只重置输出容器
      const outputContainer = document.getElementById('output');
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
  }
  
  /**
   * 重置Excel2MD输出区域
   */
  function resetExcel2MdOutput() {
    // 如果Excel2MD模块可用，调用其reset函数
    if (typeof Excel2MD !== 'undefined' && Excel2MD.reset) {
      Excel2MD.reset();
    } else {
      // 否则只重置输出容器
      const outputContainer = document.getElementById('mdOutput');
      if (outputContainer) {
        outputContainer.innerHTML = `
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
  }
  
  /**
   * 更新URL参数
   */
  function updateURLParams(key, value) {
    // 如果浏览器支持URL和URLSearchParams
    if (typeof URL !== 'undefined' && typeof URLSearchParams !== 'undefined') {
      const url = new URL(window.location.href);
      const params = new URLSearchParams(url.search);
      
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      
      url.search = params.toString();
      window.history.replaceState({}, '', url.toString());
    }
  }
  
  /**
   * 从URL解析选项卡
   */
  function parseTabFromURL() {
    // 如果浏览器支持URL和URLSearchParams
    if (typeof URL !== 'undefined' && typeof URLSearchParams !== 'undefined') {
      const url = new URL(window.location.href);
      const params = new URLSearchParams(url.search);
      const tab = params.get('tab');
      
      if (tab === 'excel2md') {
        setActiveTab('excel2md');
      } else if (tab === 'md2excel') {
        setActiveTab('md2excel');
      }
    }
  }
  
  /**
   * 确保CSS样式已加载
   */
  function ensureStylesLoaded() {
    // 检查是否已加载CSS
    const cssLoaded = Array.from(document.styleSheets).some(sheet => {
      if (sheet.href && sheet.href.includes('styles.css')) {
        return true;
      }
      return false;
    });
    
    // 如果未加载CSS，添加链接
    if (!cssLoaded) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'css/styles.css';
      document.head.appendChild(link);
      console.log('已动态加载CSS');
    }
  }
  
  /**
   * 检查外部库是否加载
   */
  function checkExternalLibraries() {
    // 延迟检查，确保库有足够时间加载
    setTimeout(() => {
      // 检查Excel.js
      if (typeof ExcelJS === 'undefined') {
        console.warn('ExcelJS未加载，Excel导出功能可能不可用');
        showWarning('无法加载ExcelJS库，Excel导出功能可能不可用');
      }
      
      // 检查FileSaver
      if (typeof saveAs === 'undefined') {
        console.warn('FileSaver未加载，文件下载功能可能不可用');
        showWarning('无法加载FileSaver库，文件下载功能可能不可用');
      }
      
      // 检查XLSX
      if (typeof XLSX === 'undefined') {
        console.warn('XLSX未加载，Excel解析功能可能不可用');
        showWarning('无法加载XLSX库，Excel转Markdown功能可能不可用');
      }
    }, 2000);
  }
  
  /**
   * 显示警告消息
   */
  function showWarning(message) {
    const warningElement = document.createElement('div');
    warningElement.className = 'warning';
    warningElement.innerHTML = message;
    
    // 添加关闭按钮
    const closeButton = document.createElement('button');
    closeButton.innerHTML = '×';
    closeButton.className = 'close-button';
    closeButton.addEventListener('click', () => {
      warningElement.remove();
    });
    
    warningElement.appendChild(closeButton);
    document.body.appendChild(warningElement);
    
    // 5秒后自动关闭
    setTimeout(() => {
      warningElement.classList.add('fade-out');
      setTimeout(() => {
        if (warningElement.parentNode) {
          warningElement.parentNode.removeChild(warningElement);
        }
      }, 1000);
    }, 5000);
  }
  
  // 公开API
  return {
    init,
    showWarning
  };
})();

// 在DOMContentLoaded时初始化
document.addEventListener('DOMContentLoaded', UI.init); 