const fs = require('fs');
const path = require('path');
const { stdin, exit } = process;
const fileStream = fs.createWriteStream(path.join(__dirname, 'text.txt'));

console.log('Введите содержимое файла:');
stdin.on('data', data => fileStream.write(data));

process.on('exit', code => {
  if (code === 0 ) {
    console.log('Данные внесены в text.txt');
  } else {
    console.log(`Что-то пошло не так. Программа завершилась с кодом ${code}`);
  }
})

process.on( "SIGINT", () => exit() );