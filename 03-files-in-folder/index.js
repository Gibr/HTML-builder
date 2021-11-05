const fs = require('fs');
const path = require('path');
const targetUrl = path.join(__dirname, 'secret-folder');

fs.readdir(targetUrl, {withFileTypes: true}, (err, files) => {
  files.forEach(file => {
    if (file.isFile()) {
      const filePath = path.join(targetUrl, file.name);
      const { name, ext } = path.parse(filePath);
      fs.stat(filePath, (err, stats) => {
        console.log(`${name} - ${ext.substr(1)} - ${stats.size} bytes`)
      });
    }
  });
})