const gulp = require('gulp')
const sass = require('gulp-sass')
const plumber = require('gulp-plumber')
const notify = require('gulp-notify')
// const runSequence = require('run-sequence')
const webpack = require('webpack')
const webpackStream = require('webpack-stream')
const webpackConfig = require('./webpack.config')

const del = require('del')
require('dotenv')

const env = process.env.KINTONE_ENV === 'development' ? 'dev' : 'prod'
const paths = {
  'js': './src/**/*.js',
  'sass': './src/styles/*.+(sass|scss)',
  'dist': './dist/' + env
}

// clean
gulp.task('clean', () => {
  del([paths.dist])
})

// js
gulp.task('js', () => {
  return gulp.src([paths.js])
    .pipe(plumber({errorHandler: notify.onError('<%= error.message %>')}))
    .pipe(webpackStream(webpackConfig, webpack))
    .pipe(gulp.dest(paths.dist + '/js'))
})

// sass
gulp.task('sass', () => {
  return gulp.src([paths.sass])
    // .pipe(filter(['**/styles/*.(sass|scss)'], {restore: true}))
    .pipe(plumber({errorHandler: notify.onError('<%= error.message %>')}))
    .pipe(sass())
    .pipe(gulp.dest(paths.dist + '/css'))
})

// watch
gulp.task('watch', () => {
  gulp.watch(paths.js, ['js'])
  gulp.watch(paths.sass, ['sass'])
})

// default
gulp.task('default', ['js', 'sass'])
