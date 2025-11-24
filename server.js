// Простой Node HTTP сервер без внешних зависимостей.
// Запуск: node server.js
// Открой http://localhost:3000/ в браузере.
// Эндпоинт /api/homeworks сканирует папки homeworkN и возвращает JSON.

const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = __dirname; // корень проекта
const PORT = 3000;

function getContentType(file){
  const ext = path.extname(file).toLowerCase();
  switch(ext){
    case '.html': return 'text/html; charset=UTF-8';
    case '.css': return 'text/css; charset=UTF-8';
    case '.js': return 'application/javascript; charset=UTF-8';
    case '.json': return 'application/json; charset=UTF-8';
    case '.png': return 'image/png';
    case '.jpg': case '.jpeg': return 'image/jpeg';
    case '.gif': return 'image/gif';
    default: return 'text/plain; charset=UTF-8';
  }
}

function scanHomeworks(){
  return fs.readdirSync(ROOT)
    .filter(name => /^homework\d+$/.test(name) && fs.statSync(path.join(ROOT,name)).isDirectory())
    .map(folder => {
      const num = folder.match(/\d+/)[0];
      return { folder, title: `Домашнее задание ${num}` };
    })
    .sort((a,b) => parseInt(a.folder.match(/\d+/)[0]) - parseInt(b.folder.match(/\d+/)[0]));
}

const server = http.createServer((req,res) => {
  // API endpoint
  if (req.url.startsWith('/api/homeworks')){
    const list = scanHomeworks();
    const payload = { homeworks: list };
    res.writeHead(200,{ 'Content-Type':'application/json', 'Cache-Control':'no-cache' });
    return res.end(JSON.stringify(payload));
  }

  // Статические файлы
  let requestedPath = req.url.split('?')[0];
  if (requestedPath === '/' ) requestedPath = '/index.html';
  // запрет выхода выше корня
  const safePath = path.normalize(requestedPath).replace(/^\.\.(?:\\|\/)/,'');
  const filePath = path.join(ROOT, safePath);
  if (!filePath.startsWith(ROOT)){
    res.writeHead(403); return res.end('Forbidden');
  }
  fs.stat(filePath,(err,stat) => {
    if (err || !stat.isFile()){
      res.writeHead(404); return res.end('Not found');
    }
    fs.readFile(filePath,(e,data) => {
      if (e){ res.writeHead(500); return res.end('Server error'); }
      res.writeHead(200,{ 'Content-Type': getContentType(filePath) });
      res.end(data);
    });
  });
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});
