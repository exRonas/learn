// Скрипт генерации homeworks.json
// Запуск: node build-homeworks.js
// Он найдёт папки вида homeworkN и обновит файл homeworks.json

const fs = require('fs');
const path = require('path');

const ROOT = __dirname;

function isHomeworkDir(name){
  return /^homework\d+$/.test(name) && fs.statSync(path.join(ROOT,name)).isDirectory();
}

function build(){
  const entries = fs.readdirSync(ROOT).filter(isHomeworkDir);
  const homeworks = entries.map(folder => {
    const num = folder.match(/homework(\d+)/)[1];
    return { folder, title: `Домашнее задание ${num}` };
  }).sort((a,b)=>{
    const na = +a.folder.match(/\d+/)[0];
    const nb = +b.folder.match(/\d+/)[0];
    return na - nb;
  });
  const jsonPath = path.join(ROOT,'homeworks.json');
  fs.writeFileSync(jsonPath, JSON.stringify({ homeworks }, null, 2), 'utf8');
  console.log('Обновлено:', jsonPath);
  console.log('Найдено папок:', homeworks.length);
}

build();
