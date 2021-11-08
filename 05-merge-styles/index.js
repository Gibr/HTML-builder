const fs = require('fs');
const fsPromises = fs.promises;
const path = require('path');

const originalUrl = path.join(__dirname, 'styles');
const copyUrl = path.join(__dirname, 'project-dist', 'bundle.css');

fsPromises.unlink(copyUrl)
  .catch(err => {
    if (err.code === 'ENOENT') console.log('no bundle.css founded, creating new one...')
    else console.log(err)
  })
  .then(() => {
    return fsPromises.readdir(originalUrl, { withFileTypes: true });
  })
  .then((files) => {
    if (files.length === 0) throw new Error('css files not found');

    files.reduce( (promChain, file) => {
      const srcPath = path.join(originalUrl, file.name);
      const { ext } = path.parse(srcPath);
      if (file.isFile() && ext === '.css') {
        promChain = promChain.then(async () => {
          const fileData = await fsPromises.readFile(srcPath);
          await fsPromises.appendFile(copyUrl, fileData + '\n');
        })
      } 
      return promChain
    }, Promise.resolve());
  })

