const rename = require('gulp-rename')
const sass = require('gulp-sass')
const postcss = require('gulp-postcss')
const gulpif = require('gulp-if')
const uglify = require('gulp-uglify')
const concat = require('gulp-concat')
const clean = require('gulp-clean')
const connect = require('gulp-connect')
const { src, dest, parallel, series, watch } = require('gulp')

const rollup = require('gulp-rollup')
const babel = require('rollup-plugin-babel')

const isProd = process.env.NODE_ENV.trim() == 'prod'

const basename = 'css-snnipets'

const tasks = {
  scss: {
    src: 'scss/**/*.scss',
    entry: 'scss/index.scss',
    dest: 'dist/css',
    rename: {
      basename,
      extname: '.css'
    }
  },
  js: {
    src: 'js/**/*.js',
    entry: 'js/index.js',
    dest: 'dist/js',
    rename: {
      basename
    }
  },
  example: {
    src: ['example/start.html', 'example/**/!(start|end).html', 'example/end.html'],
    dest: 'dist/example',
  },
  static: {
    src: ['example/static/**/*'],
    dest: 'dist/example/static'
  },
  connect: {
    root: 'dist',
    livereload: true,
    port: 8888,
    host: '0.0.0.0'
  }
}

function getRename (rename) {
  return isProd ? {...rename, suffix: '.min'} : rename
}

function compileScss () {
  const scss = tasks.scss
  return src(scss.entry)
    .pipe(postcss())
    .pipe(sass({ outputStyle: isProd ? 'compressed' : 'expanded' }))
    .pipe(rename(getRename(scss.rename)))
    .pipe(dest(scss.dest))
    .pipe(connect.reload())
}

function compileJs () {
  const js = tasks.js
  return src(js.src)
    .pipe(rollup({
      input: js.entry,
      output: {
        filename: `${basename}.${isProd ? '.min' : ''}.js`,
        format: 'iife',
        name: 'uiKit'
      },
      external: ['jQuery'],
      plugins: [
        babel({
          runtimeHelpers: true,
          exclude: 'node_modules/**'
        })
      ]
    }))
    .pipe(rename(getRename(js.rename)))
    .pipe(gulpif(isProd, uglify()))
    .pipe(dest(js.dest))
    .pipe(connect.reload())
}

function concatExample () {
  const exam = tasks.example
  return src(exam.src)
    .pipe(concat('index.html'))
    .pipe(dest(exam.dest))
    .pipe(connect.reload())
}

function cleanStatic () {
  return src(tasks.static.dest).pipe(clean())
}

function copyStatic () {
  const static = tasks.static
  return src(static.src).pipe(dest(static.dest)).pipe(connect.reload())
}

const example = parallel(series(cleanStatic, copyStatic), concatExample)

function devWatch () {
  watch(tasks.static.src, copyStatic)
  watch(tasks.example.src, concatExample)
  watch(tasks.scss.src, compileScss)
  watch(tasks.js.src, compileJs)
}

function connectTask () {
  connect.server(tasks.connect)
}

exports.compileScss = compileScss
exports.compileJs = compileJs
exports.cleanStatic = cleanStatic
exports.copyStatic = copyStatic
exports.concatExample = concatExample
exports.example = example
exports.connect = connectTask
exports.default = parallel(compileScss, compileJs)
exports.watch = parallel(connectTask, devWatch)
