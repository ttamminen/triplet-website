const { FuseBox, Sparky } = require('fuse-box');
const fs = require('fs');
const imagemin = require('imagemin');
const imageminJpegtran = require('imagemin-jpegtran');
const imageminPngquant = require('imagemin-pngquant');
const sass = require('node-sass')
const mkdirp = require('mkdirp');

Sparky.task('static', () => {
  return Sparky.src('**.*', { base: './assets/static' }).dest('public/');
})

Sparky.task('fonts', () => {
  return Sparky.src('fonts/**.*', { base: './assets' }).dest('public/');
})

Sparky.task('svg', () => {
  return Sparky.src('images/**/*.svg', { base: './assets' }).dest('public/')
})

Sparky.task('images', () => {
  return Sparky.src('images/**/*.+(jpg|png)', { base: './assets' }).file('*.*', file => {
    imagemin([file.filepath], './public/images', {
      plugins: [
        imageminJpegtran(),
        imageminPngquant({quality: '65-80'})
      ]
    })
  })
})

Sparky.task('styles', () => {
  return Sparky.src(['styles/main.scss', 'styles/styleguide.scss'], { base: './assets' }).file('*.*', file => {
    const path = './public/styles/' + file.name.replace('.scss', '') + '.css'
    return renderScss(file, path)
      .then(console.log)
      .catch(console.error)
  })
})

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

Sparky.task('build', () => {
  const fuse = FuseBox.init({
    homeDir: "./assets/js",
    output: "public/js/$name.js",
    plugins: []
  });
  fuse.bundle("app")
      .instructions(">main.ts");

  return fuse.run();
});

Sparky.task('default', ['build', 'static', 'fonts', 'svg', 'images', 'styles'], () => {});