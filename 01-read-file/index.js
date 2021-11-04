const fs = require('fs');
const path = require('path');
const fileStream = fs.createReadStream(path.join(__dirname, 'text.txt'));
let fileData = '';

fileStream.on('data', chunk => fileData += chunk);
fileStream.on('end', () => {
  console.log(fileData)
  process.exit();
});