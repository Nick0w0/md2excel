/**
 * 主题切换模块
 */
const ThemeManager = (function() {
  // 主题类型
  const THEMES = {
    LIGHT: 'light',
    DARK: 'dark'
  };
  
  // 存储主题键名
  const STORAGE_KEY = 'md2excel-theme';
  
  // 主题切换按钮
  let themeToggleBtn;
  
  /**
   * 初始化主题
   */
  function init() {
    // 应用保存的主题或系统主题
    applyTheme();
    
    // 创建主题切换按钮
    createThemeToggle();
    
    // 监听系统主题变更
    listenForSystemThemeChanges();
  }
  
  /**
   * 应用主题
   */
  function applyTheme() {
    const savedTheme = localStorage.getItem(STORAGE_KEY);
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // 如果有保存的主题，使用保存的；否则使用系统主题
    const theme = savedTheme || (prefersDark ? THEMES.DARK : THEMES.LIGHT);
    
    // 设置文档的data-theme属性
    document.documentElement.setAttribute('data-theme', theme);
    
    console.log(`应用${theme}主题`);
  }
  
  /**
   * 创建主题切换按钮
   */
  function createThemeToggle() {
    // 创建按钮
    themeToggleBtn = document.createElement('button');
    themeToggleBtn.className = 'theme-switch';
    themeToggleBtn.setAttribute('aria-label', '切换深色/浅色模式');
    themeToggleBtn.innerHTML = `
      <div class="theme-switch-inner">
        <svg xmlns="http://www.w3.org/2000/svg" class="moon-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
        </svg>
        <svg xmlns="http://www.w3.org/2000/svg" class="sun-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="5"></circle>
          <line x1="12" y1="1" x2="12" y2="3"></line>
          <line x1="12" y1="21" x2="12" y2="23"></line>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
          <line x1="1" y1="12" x2="3" y2="12"></line>
          <line x1="21" y1="12" x2="23" y2="12"></line>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
        </svg>
      </div>
    `;
    
    // 添加事件监听
    themeToggleBtn.addEventListener('click', toggleTheme);
    
    // 添加到文档
    document.body.appendChild(themeToggleBtn);
    
    // 更新图标显示
    updateThemeIcon();
  }
  
  /**
   * 监听系统主题变更
   */
  function listenForSystemThemeChanges() {
    const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    // 添加变更监听器
    if (darkModeMediaQuery.addEventListener) {
      darkModeMediaQuery.addEventListener('change', (e) => {
        // 只有在没有保存的主题时才跟随系统设置
        if (!localStorage.getItem(STORAGE_KEY)) {
          const newTheme = e.matches ? THEMES.DARK : THEMES.LIGHT;
          document.documentElement.setAttribute('data-theme', newTheme);
          updateThemeIcon();
        }
      });
    }
  }
  
  /**
   * 切换主题
   */
  function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === THEMES.DARK ? THEMES.LIGHT : THEMES.DARK;
    
    // 设置新主题
    document.documentElement.setAttribute('data-theme', newTheme);
    
    // 保存到本地存储
    localStorage.setItem(STORAGE_KEY, newTheme);
    
    // 更新图标显示
    updateThemeIcon();
    
    console.log(`切换到${newTheme}主题`);
  }
  
  /**
   * 更新主题图标显示
   */
  function updateThemeIcon() {
    if (!themeToggleBtn) return;
    
    const currentTheme = document.documentElement.getAttribute('data-theme');
    
    // 不需要在这里手动设置显示或隐藏，
    // 现在通过CSS中的数据主题选择器自动处理
    console.log(`主题已切换为: ${currentTheme}`);
  }
  
  // 公开API
  return {
    init
  };
})();

// 在DOMContentLoaded时初始化
document.addEventListener('DOMContentLoaded', ThemeManager.init); 