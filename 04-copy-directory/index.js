const fs = require('fs');
const fsPromises = fs.promises;
const path = require('path');

function copyDir() {
  const originalUrl = path.join(__dirname, 'files');
  const copyUrl = path.join(__dirname, 'files-copy');
  // fsPromises.rm() available with Node v.14 and upper 
  const delPromise = 
    fsPromises.rm ? 
    fsPromises.rm(copyUrl, { recursive: true }) : 
    fsPromises.rmdir(copyUrl, { recursive: true });

  delPromise.then(
    () => {
      fsPromises.mkdir(copyUrl);
    }
  ).then(
    () => {
      return fsPromises.readdir(originalUrl, {withFileTypes: true});
    }
  ).then(
    (files) => {
      const copyPromises =[];
      files.forEach(file => {
        if (file.isFile()) {
          const srcPath = path.join(originalUrl, file.name);
          const destPath = path.join(copyUrl, file.name);
          copyPromises.push(fsPromises.copyFile(srcPath, destPath));
        }
      });
      return Promise.all(copyPromises)
    }
  ).catch(err => console.log(err));
}

copyDir();