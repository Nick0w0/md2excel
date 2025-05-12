/**
 * 启动HTTP服务器的脚本
 */
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

// 检查项目依赖是否已安装
function checkDependencies() {
  if (!fs.existsSync(path.join(__dirname, 'node_modules'))) {
    console.log('未发现node_modules目录，正在安装依赖...');
    
    exec('npm install', { cwd: __dirname }, (error) => {
      if (error) {
        console.error('安装依赖失败:', error);
        return;
      }
      
      console.log('依赖安装完成，启动服务器...');
      startServer();
    });
  } else {
    startServer();
  }
}

// 启动HTTP服务器
function startServer() {
  console.log('正在启动HTTP服务器...');
  
  const server = exec('npx http-server -p 8080 -c-1 -o index.html', { cwd: __dirname });
  
  server.stdout.on('data', (data) => {
    console.log(data.toString().trim());
  });
  
  server.stderr.on('data', (data) => {
    console.error(data.toString().trim());
  });
  
  console.log('HTTP服务器已启动，请在浏览器中访问：http://localhost:8080');
}

// 开始检查并启动
checkDependencies(); 