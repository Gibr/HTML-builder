const fs = require('fs');
const fsPromises = fs.promises;
const path = require('path');

const templatePath = path.join(__dirname, 'template.html');
const distPath = path.join(__dirname, 'project-dist');
const styleSrcPath = path.join(__dirname, 'styles');

function copyDir(originalUrl, copyUrl) {
  const delPromise =
    fsPromises.rm ?
      fsPromises.rm(copyUrl, { recursive: true, force: true }) :
      fsPromises.rmdir(copyUrl, { recursive: true });

  delPromise.then(() => {
    fsPromises.mkdir(copyUrl);
  }
  ).then(() => {
    return fsPromises.readdir(originalUrl, { withFileTypes: true });
  }
  ).then((files) => {
    const copyPromises = [];
    files.forEach(async (file) => {
      const srcPath = path.join(originalUrl, file.name);
      const destPath = path.join(copyUrl, file.name);
      if (file.isFile())
        copyPromises.push(fsPromises.copyFile(srcPath, destPath));
      else await copyDir(srcPath, destPath);
    });
    return Promise.all(copyPromises)
  }
  ).catch(err => console.log(err));
}

const delPromise =
  fsPromises.rm ?
    fsPromises.rm(distPath, { recursive: true, force: true }) :
    fsPromises.rmdir(distPath, { recursive: true });
delPromise.then(() => {
  fsPromises.mkdir(distPath);
})
  .then(() => {
    return fsPromises.readFile(templatePath, { encoding: "utf8" })
  })
  .then(async (template) => {
    const templateComponents = [...template.matchAll(/{{(.*?)}}/g)];
    const tempCompNames = templateComponents.map(val => val[1]);
    let resultHtmlData = template;

    await tempCompNames.reduce((promChain, componentName) => {
      promChain = promChain.then(async () => {
        const compPath = path.join(__dirname, 'components', componentName + '.html');
        const compFileData = await fsPromises.readFile(compPath);
        const regex = `{{${componentName}}}`;
        resultHtmlData = resultHtmlData.replace(new RegExp(regex, 'g'), compFileData);
      })
      return promChain
    }, Promise.resolve());
    return resultHtmlData
  })
  .then((resultHtmlData) => {
    const indexHtmlPath = path.join(distPath, 'index.html');
    fsPromises.appendFile(indexHtmlPath, resultHtmlData);
  })
  .then(() => {
    return fsPromises.readdir(styleSrcPath, { withFileTypes: true });
  })
  .then((styleFiles) => {
    if (styleFiles.length === 0) throw new Error('css files not found');

    const styleDestPath = path.join(distPath, 'style.css');

    styleFiles.reduce((promChain, file) => {
      const srcPath = path.join(styleSrcPath, file.name);
      const { ext } = path.parse(srcPath);
      if (file.isFile() && ext === '.css') {
        promChain = promChain.then(async () => {
          const fileData = await fsPromises.readFile(srcPath);
          await fsPromises.appendFile(styleDestPath, fileData + '\n');
        })
      }
      return promChain
    }, Promise.resolve());
  })
  .then(() => {
    const assetsCopyPath = path.join(__dirname, 'project-dist', 'assets');
    const assetsSrcPath = path.join(__dirname, 'assets');
    copyDir(assetsSrcPath, assetsCopyPath);
  })