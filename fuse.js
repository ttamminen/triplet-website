const { FuseBox, Sparky, QuantumPlugin } = require('fuse-box');
const fs = require('fs');
const imagemin = require('imagemin');
const imageminJpegtran = require('imagemin-jpegtran');
const imageminPngquant = require('imagemin-pngquant');
const sass = require('node-sass')
const mkdirp = require('mkdirp');

let isProduction = false;
let fuse = null;
let app = null;

Sparky.task('static', () => {
  return srcOrWatch(isProduction)('**.*', { base: './assets/static' }).dest('public/');
})

Sparky.task('fonts', () => {
  return srcOrWatch(isProduction)('fonts/**.*', { base: './assets' }).dest('public/');
})

Sparky.task('svg', () => {
  return srcOrWatch(isProduction)('images/**/*.svg', { base: './assets' }).dest('public/')
})

Sparky.task('images', () => {
  return srcOrWatch(isProduction)('images/**/*.+(jpg|png)', { base: './assets' }).file('*.*', file => {
    imagemin([file.filepath], './public/images', {
      plugins: [
        imageminJpegtran(),
        imageminPngquant({quality: '65-80'})
      ]
    })
  })
})

Sparky.task('styles', () => {
  return srcOrWatch(isProduction)(['styles/main.scss', 'styles/styleguide.scss'], { base: './assets' }).file('*.*', file => {
    const path = './public/styles/' + file.name.replace('.scss', '') + '.css'
    return renderScss(file, path)
      .then(console.log)
      .catch(console.error)
  })
})

const srcOrWatch = function (isProduction) {
  return isProduction ? Sparky.src : Sparky.watch;
}

const renderScss = function (file, path) {
  return new Promise(function (resolve, reject) {
    sass.render({
      file: file.filepath,
      outFile: path
    }, function(error, result) {
      if(error) {
        reject(error)
        return
      }
  
      mkdirp('./public/styles', function (mkdirError) {
        if(mkdirError) {
          reject(mkdirError)
          return
        }
  
        fs.writeFile(path, result.css, function(err) {
          if(err){
            reject(err)
            return
          }
  
          resolve('SASS -> CSS successfully done. Output file: ' + path)
        });   
      })
    })
  })
}

Sparky.task('config', () => {
  fuse = FuseBox.init({
    homeDir: "./assets/js",
    output: "public/js/$name.js",
    plugins: []
  });
  app = fuse.bundle("app")
      .instructions(">main.ts");
});

Sparky.task('default', ['clean', 'config', 'static', 'fonts', 'svg', 'images', 'styles'], () => {
  fuse.dev();
  app.watch().hmr();
  return fuse.run();  
});

Sparky.task('clean', () => Sparky.src('public/').clean('public/'));
Sparky.task('prod-env', ['clean'], () => {
  isProduction = true;
});

Sparky.task('dist', ['prod-env', 'static', 'fonts', 'svg', 'images', 'styles'], () => {
  return fuse.run();
})