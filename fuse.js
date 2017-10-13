const { FuseBox, Sparky, QuantumPlugin, UglifyJSPlugin, PlainJSPlugin } = require('fuse-box')
const fs = require('fs')
const imagemin = require('imagemin')
const imageminJpegtran = require('imagemin-jpegtran')
const imageminPngquant = require('imagemin-pngquant')
const sass = require('node-sass')
const postcss = require('postcss')
const autoprefixer = require('autoprefixer')
const cssnano = require('cssnano')
const mkdirp = require('mkdirp')
const pm2 = require('pm2')

let isProduction = false;
let fuse = null;
let app = null;

Sparky.task('static', () => {
  return srcOrWatch(isProduction)('**.*', { base: './assets/static' }).dest('public/');
})

Sparky.task('fonts', () => {
  return srcOrWatch(isProduction)('fonts/**/*', { base: './assets' }).dest('public/');
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
    return buildStyles(file, path)
      .then(console.log)
      .catch(console.error)
  })
})

const srcOrWatch = (isProduction) => {
  return isProduction ? Sparky.src : Sparky.watch;
}

const buildStyles = (sparkyFile, path) => {
  return renderSCSS(sparkyFile.filepath, path)
    .then(createStylesDirectory)
    .then(result => writeStylesOutput(path, result))
    .then(() => postCSS(path));         
}

const renderSCSS = (inputFile, outFile) => {
  return new Promise(function (resolve, reject) {
    sass.render({
      file: inputFile,
      outFile: outFile
    }, function(error, result) {
      if(error) {
        reject(error)
        return
      }

      resolve(result)
    })
  })
}

const writeStylesOutput = (path, result) => {
  return new Promise(function (resolve, reject) {
    fs.writeFile(path, result.css, function(err) {
      if(err){
        reject(err)
        return
      }

      resolve('SASS -> CSS successfully done. Output file: ' + path)
    })
  })
}

const postCSS = (path) => {
  return new Promise(function (resolve, reject) {
    fs.readFile(path, (err, css) => {
      if(err) {
        reject(err)
        return
      }

      postcss([autoprefixer, cssnano])
        .process(css, { from: path, to: path })
        .then(result => {
            fs.writeFile(path, result.css);
            if ( result.map ) {
              fs.writeFile('path' + '.map', result.map);
            }
            resolve()
        });
      }
    )
  }) 
}

const createStylesDirectory = (styles) => {
  return new Promise(function (resolve, reject) {
    mkdirp('./public/styles', function (mkdirError) {
      if(mkdirError) {
        reject(mkdirError)
        return
      }
      
      resolve(styles)
    })
  }) 
}

Sparky.task('config', () => {
  fuse = FuseBox.init({
    homeDir: "./assets/js",
    output: "public/js/$name.js",
    plugins: [UglifyJSPlugin()]
  });
  app = fuse.bundle("app")
            .instructions(">main.ts")
});

Sparky.task('default', ['clean', 'config', 'static', 'fonts', 'svg', 'images', 'styles'], () => {
  return fuse.run()
})

Sparky.task('clean', () => Sparky.src('public/').clean('public/'))

Sparky.task('prod-env', () => {
  isProduction = true;
})

Sparky.task('dist', ['prod-env', 'default'])