/**
 * 国际化模块
 */
const I18n = (function() {
  // 支持的语言
  const LANGUAGES = {
    EN: 'en',
    ZH: 'zh'
  };
  
  // 存储语言偏好键名
  const STORAGE_KEY = 'md2excel-language';
  
  // 默认语言设置为英文
  const DEFAULT_LANGUAGE = LANGUAGES.EN;
  
  // 语言切换按钮
  let languageSwitchBtn;
  
  // 翻译内容
  const translations = {
    // 英文翻译
    [LANGUAGES.EN]: {
      // 标题和导航
      'title': 'Markdown Table Converter',
      'subtitle': 'Easily convert between Markdown and Excel tables',
      'md2excel': 'Markdown → Excel',
      'excel2md': 'Excel → Markdown',
      
      // 通用UI元素
      'input': 'Input',
      'output': 'Output',
      'process': 'Process',
      'options': 'Options',
      'output_settings': 'Output Settings',
      
      // MD转Excel部分
      'dropzone_md': 'Drop Markdown file or click to upload',
      'dropzone_md_hint': 'Supports .md and .txt formats, can handle single or multiple tables',
      'md_placeholder': 'Paste Markdown table content here...',
      'first_row_header': 'Use first row as header',
      'skip_separator': 'Skip separator row (---|---)',
      'multi_table': 'Multi-table mode (detect multiple tables and put them in different worksheets)',
      'excel_filename': 'Excel filename',
      'worksheet_name': 'Worksheet name',
      
      // Excel转MD部分
      'dropzone_excel': 'Drop Excel file or click to upload',
      'dropzone_excel_hint': 'Supports .xlsx, .xls and .csv formats, can handle multiple worksheets',
      'md_filename': 'Markdown filename',
      'convert_to_md': 'Convert to Markdown',
      
      // 指引和提示
      'md_instruction': 'Enter Markdown table content on the left to see results',
      'excel_instruction': 'Upload Excel file on the left to see results',
      
      // 页脚
      'built_with': 'Built with',
      'about': 'About',
      'built_with_suffix': '',
      
      // 关于对话框
      'about_title': 'About Markdown Table Converter',
      'about_intro': 'This is a pure frontend application for converting between Markdown tables and Excel tables.',
      'features': 'Features:',
      'feature_1': 'Markdown to Excel, supporting multiple tables',
      'feature_2': 'Excel to Markdown, supporting worksheet selection',
      'feature_3': 'Light/dark theme toggle, responding to system settings',
      'feature_4': 'Completely browser-based processing, no server requirements',
      'close': 'Close',
      
      // 表格控制
      'copy': 'Copy',
      'download': 'Download',
      'download_all': 'Download All',
      'rows': 'rows',
      'columns': 'columns',
      
      // 其他
      'lang_switch': 'Switch to Chinese'
    },
    
    // 中文翻译
    [LANGUAGES.ZH]: {
      // 标题和导航
      'title': 'Markdown表格转换工具',
      'subtitle': '轻松在 Markdown 与 Excel 表格之间转换',
      'md2excel': 'Markdown → Excel',
      'excel2md': 'Excel → Markdown',
      
      // 通用UI元素
      'input': '输入',
      'output': '输出',
      'process': '处理',
      'options': '选项',
      'output_settings': '输出设置',
      
      // MD转Excel部分
      'dropzone_md': '拖放 Markdown 文件或点击此处上传',
      'dropzone_md_hint': '支持.md和.txt格式，可处理单表格或多表格',
      'md_placeholder': '在此粘贴 Markdown 表格内容...',
      'first_row_header': '第一行作为表头',
      'skip_separator': '跳过分隔行（---|---）',
      'multi_table': '多表格模式（检测多个表格并分别放入不同工作表）',
      'excel_filename': 'Excel 文件名',
      'worksheet_name': '工作表名称',
      
      // Excel转MD部分
      'dropzone_excel': '拖放 Excel 文件或点击此处上传',
      'dropzone_excel_hint': '支持.xlsx、.xls和.csv格式，可处理多工作表',
      'md_filename': 'Markdown 文件名',
      'convert_to_md': '转换为 Markdown',
      
      // 指引和提示
      'md_instruction': '在左侧输入 Markdown 表格内容以查看结果',
      'excel_instruction': '在左侧上传 Excel 文件以查看结果',
      
      // 页脚
      'built_with': '使用',
      'about': '关于',
      'built_with_suffix': '构建',
      
      // 关于对话框
      'about_title': '关于 Markdown 表格转换工具',
      'about_intro': '这是一个纯前端应用，支持在 Markdown 表格和 Excel 表格之间进行转换。',
      'features': '功能特性：',
      'feature_1': 'Markdown 转 Excel，支持多表格',
      'feature_2': 'Excel 转 Markdown，支持选择工作表',
      'feature_3': '明暗主题切换，响应系统设置',
      'feature_4': '完全基于浏览器处理，无服务器需求',
      'close': '关闭',
      
      // 表格控制
      'copy': '复制',
      'download': '下载',
      'download_all': '下载全部',
      'rows': '行',
      'columns': '列',
      
      // 其他
      'lang_switch': '切换到英文'
    }
  };
  
  /**
   * 初始化国际化
   */
  function init() {
    console.log('初始化国际化模块...');
    
    // 应用保存的语言或默认语言
    applyLanguage();
    
    // 获取已在HTML中创建的按钮
    setupLanguageSwitch();
    
    // 初始翻译UI
    setTimeout(() => {
      translateUI();
      console.log('UI翻译完成');
      
      // 监听选项卡切换事件，确保切换时保持语言一致
      setupTabChangeListener();
    }, 300);
  }
  
  /**
   * 监听选项卡切换事件
   */
  function setupTabChangeListener() {
    const md2excelTab = document.getElementById('md2excelTab');
    const excel2mdTab = document.getElementById('excel2mdTab');
    
    if (md2excelTab) {
      md2excelTab.addEventListener('click', () => {
        setTimeout(translateUI, 100); // 选项卡切换后重新翻译UI
      });
    }
    
    if (excel2mdTab) {
      excel2mdTab.addEventListener('click', () => {
        setTimeout(translateUI, 100); // 选项卡切换后重新翻译UI
      });
    }
    
    console.log('已设置选项卡切换监听');
  }
  
  /**
   * 应用语言
   */
  function applyLanguage() {
    const savedLanguage = localStorage.getItem(STORAGE_KEY);
    
    // 检查URL参数是否包含语言设置
    const urlParams = new URLSearchParams(window.location.search);
    const urlLang = urlParams.get('lang');
    
    // 判断是否是GitHub Pages环境
    const isGitHubPages = window.location.hostname.includes('github.io');
    
    let language;
    
    // 优先使用URL参数中的语言设置
    if (urlLang && (urlLang === LANGUAGES.EN || urlLang === LANGUAGES.ZH)) {
      language = urlLang;
    } 
    // 其次使用本地存储的语言设置
    else if (savedLanguage) {
      language = savedLanguage;
    }
    // 如果是GitHub Pages环境且没有其他语言指定，则默认使用英文
    else if (isGitHubPages) {
      language = LANGUAGES.EN;
    }
    // 其他情况使用默认语言（英文）
    else {
      language = DEFAULT_LANGUAGE;
    }
    
    // 设置文档的lang属性
    document.documentElement.setAttribute('lang', language);
    
    // 将当前使用的语言保存到本地存储
    localStorage.setItem(STORAGE_KEY, language);
    
    console.log(`应用${language}语言`);
  }
  
  /**
   * 设置语言切换按钮
   */
  function setupLanguageSwitch() {
    // 获取HTML中已经创建的按钮
    languageSwitchBtn = document.getElementById('languageSwitchBtn');
    
    if (!languageSwitchBtn) {
      console.error('找不到语言切换按钮');
      return;
    }
    
    console.log('找到语言切换按钮');
    
    // 添加事件监听
    languageSwitchBtn.addEventListener('click', toggleLanguage);
    
    // 更新按钮文本
    updateLanguageButtonText();
  }
  
  /**
   * 更新语言按钮文本
   */
  function updateLanguageButtonText() {
    if (!languageSwitchBtn) return;
    
    const currentLang = document.documentElement.getAttribute('lang');
    const text = getTranslation('lang_switch');
    
    // 设置按钮提示文本
    languageSwitchBtn.setAttribute('title', text);
    
    // 更新语言指示器
    const langIndicator = languageSwitchBtn.querySelector('.lang-indicator');
    if (langIndicator) {
      langIndicator.textContent = currentLang.toUpperCase();
    }
    
    // 显示切换通知
    showLanguageNotification(currentLang);
  }
  
  /**
   * 显示语言切换通知
   */
  function showLanguageNotification(lang) {
    // 移除旧的通知
    const oldNotification = document.querySelector('.language-notification');
    if (oldNotification) {
      oldNotification.remove();
    }
    
    // 创建新通知
    const notification = document.createElement('div');
    notification.className = 'language-notification';
    notification.textContent = lang === LANGUAGES.EN ? 'English' : '中文';
    
    // 添加到文档
    document.body.appendChild(notification);
    
    // 动画后移除
    setTimeout(() => {
      notification.classList.add('notification-fade-out');
      setTimeout(() => {
        if (notification.parentNode) {
          notification.remove();
        }
      }, 800);
    }, 2000);
  }
  
  /**
   * 切换语言
   */
  function toggleLanguage() {
    const currentLang = document.documentElement.getAttribute('lang');
    const newLang = currentLang === LANGUAGES.EN ? LANGUAGES.ZH : LANGUAGES.EN;
    
    // 设置新语言
    document.documentElement.setAttribute('lang', newLang);
    
    // 保存到本地存储
    localStorage.setItem(STORAGE_KEY, newLang);
    
    // 更新界面翻译
    translateUI();
    
    // 更新按钮文本
    updateLanguageButtonText();
    
    console.log(`切换到${newLang}语言`);
  }
  
  /**
   * 获取翻译文本
   */
  function getTranslation(key) {
    const lang = document.documentElement.getAttribute('lang') || DEFAULT_LANGUAGE;
    return translations[lang][key] || key;
  }
  
  /**
   * 翻译整个UI
   */
  function translateUI() {
    console.log('开始翻译UI...');
    const currentLang = document.documentElement.getAttribute('lang');
    console.log(`当前语言: ${currentLang}`);
    
    // 翻译标题和导航
    document.title = getTranslation('title');
    translateElement('h1', 'title');
    translateElement('.subtitle', 'subtitle');
    translateElement('#md2excelTab', 'md2excel');
    translateElement('#excel2mdTab', 'excel2md');
    
    // 翻译通用元素
    translateAllElementsByText('h2', 'input', '输入', 'Input');
    translateAllElementsByText('h2', 'output', '输出', 'Output');
    translateElement('#processBtn', 'process');
    translateElement('#convertToMdBtn', 'convert_to_md');
    translateAllElementsByText('h3', 'options', '选项', 'Options');
    translateAllElementsByText('h3', 'output_settings', '输出设置', 'Output Settings');
    
    // 翻译MD转Excel部分
    translateAllElementsBySelector('#dropzone p:first-of-type', 'dropzone_md');
    translateAllElementsBySelector('#dropzone .dropzone-hint', 'dropzone_md_hint');
    
    const markdownInput = document.getElementById('markdownInput');
    if (markdownInput) {
      markdownInput.placeholder = getTranslation('md_placeholder');
    }
    
    translateLabel('hasHeaders', 'first_row_header');
    translateLabel('skipHeaderSeparator', 'skip_separator');
    translateLabel('multiTableMode', 'multi_table');
    translateLabel('excelFilename', 'excel_filename');
    translateLabel('worksheetName', 'worksheet_name');
    
    // 翻译Excel转MD部分
    translateAllElementsBySelector('#excelDropzone p:first-of-type', 'dropzone_excel');
    translateAllElementsBySelector('#excelDropzone .dropzone-hint', 'dropzone_excel_hint');
    translateLabel('excelHasHeaders', 'first_row_header');
    translateLabel('mdFilename', 'md_filename');
    
    // 翻译指引和提示
    translateInstructionTexts();
    
    // 翻译关于对话框
    translateElement('#aboutDialog h2', 'about_title');
    translateAllElementsBySelector('#aboutDialog p:first-of-type', 'about_intro');
    translateAllElementsBySelector('#aboutDialog p:nth-of-type(2)', 'features');
    translateAllElementsBySelector('#aboutDialog li:nth-of-type(1)', 'feature_1');
    translateAllElementsBySelector('#aboutDialog li:nth-of-type(2)', 'feature_2');
    translateAllElementsBySelector('#aboutDialog li:nth-of-type(3)', 'feature_3');
    translateAllElementsBySelector('#aboutDialog li:nth-of-type(4)', 'feature_4');
    translateElement('#closeAboutBtn', 'close');
    
    // 翻译页脚
    const builtWithText = document.querySelector('footer p');
    if (builtWithText) {
      const builtWithLinks = Array.from(builtWithText.querySelectorAll('a')).map(a => a.outerHTML);
      builtWithText.innerHTML = `${getTranslation('built_with')} ${builtWithLinks.join(', ')} ${getTranslation('built_with_suffix') || ''}`;
    }
    translateElement('#aboutLink', 'about');
    
    // 翻译动态生成的表格控制按钮
    translateAllElementsBySelector('.table-controls .copy-btn', 'copy');
    translateAllElementsBySelector('.table-controls .download-btn', 'download');
    translateAllElementsBySelector('.table-controls .download-all-btn', 'download_all');
    translateAllMetadata();
    
    console.log('UI已翻译为：' + currentLang);
  }
  
  /**
   * 专门处理指令文本，确保在选项卡切换时保持正确的语言
   */
  function translateInstructionTexts() {
    // 翻译MD2Excel的指令文本
    const mdOutput = document.querySelector('#output .instruction p');
    if (mdOutput) {
      mdOutput.textContent = getTranslation('md_instruction');
    }
    
    // 翻译Excel2MD的指令文本
    const excelOutput = document.querySelector('#mdOutput .instruction p');
    if (excelOutput) {
      excelOutput.textContent = getTranslation('excel_instruction');
    }
    
    console.log('已翻译指令文本');
  }
  
  /**
   * 翻译所有指引提示文本
   */
  function translateAllInstructionTexts() {
    translateInstructionTexts();
    
    document.querySelectorAll('.instruction p').forEach(element => {
      const text = element.textContent.trim();
      
      // 根据内容匹配相应的翻译键
      if (text.includes('在左侧输入') || text.includes('Enter Markdown')) {
        element.textContent = getTranslation('md_instruction');
      } else if (text.includes('在左侧上传') || text.includes('Upload Excel')) {
        element.textContent = getTranslation('excel_instruction');
      }
    });
  }
  
  /**
   * 翻译表格元数据
   */
  function translateMetadata() {
    document.querySelectorAll('.table-metadata').forEach(metadata => {
      const text = metadata.textContent;
      if (text.includes('rows') || text.includes('columns') || text.includes('行') || text.includes('列')) {
        const numbers = text.match(/\d+/g);
        if (numbers && numbers.length >= 2) {
          metadata.textContent = `${numbers[0]} ${getTranslation('rows')}, ${numbers[1]} ${getTranslation('columns')}`;
        }
      }
    });
  }
  
  /**
   * 定期翻译可能动态添加的元素
   */
  function translateAllMetadata() {
    translateMetadata();
    // 设置一个观察器来监听DOM变化并翻译新元素
    const observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        if (mutation.addedNodes.length) {
          translateMetadata();
        }
      });
    });
    
    observer.observe(document.body, { childList: true, subtree: true });
  }
  
  /**
   * 翻译单个元素
   */
  function translateElement(selector, key) {
    const element = document.querySelector(selector);
    if (element) {
      element.textContent = getTranslation(key);
    }
  }
  
  /**
   * 根据文本内容匹配并翻译元素
   */
  function translateAllElementsByText(selector, key, zhText, enText) {
    document.querySelectorAll(selector).forEach(element => {
      const text = element.textContent.trim();
      if (text === zhText || text === enText) {
        element.textContent = getTranslation(key);
      }
    });
  }
  
  /**
   * 使用CSS选择器翻译所有匹配的元素
   */
  function translateAllElementsBySelector(selector, key) {
    document.querySelectorAll(selector).forEach(element => {
      element.textContent = getTranslation(key);
    });
  }
  
  /**
   * 翻译标签
   */
  function translateLabel(inputId, key) {
    const label = document.querySelector(`label[for="${inputId}"]`);
    if (label) {
      label.textContent = getTranslation(key);
    }
  }
  
  // 公开API
  const publicAPI = {
    init,
    getTranslation,
    translateUI,
    translateInstructionTexts
  };
  
  // 确保DOM加载完成后初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
    console.log('等待DOM加载完成后初始化');
  } else {
    // 如果DOM已加载完成，直接初始化
    init();
    console.log('DOM已加载，直接初始化');
  }
  
  return publicAPI;
})(); 