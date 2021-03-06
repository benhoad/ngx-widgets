/**
* @Author: Alex Sorafumo <alex.sorafumo>
* @Date:   30/09/2016 2:19 PM
* @Email:  alex@yuion.net
* @Filename: webpack.js
* @Last modified by:   alex.sorafumo
* @Last modified time: 24/01/2017 4:56 PM
*/

'use strict';

var gulp = require("gulp");
var gutil = require("gulp-util");
var webpack = require("webpack");
var WebpackDevServer = require("webpack-dev-server");

var webpack_config_dev = require('../../webpack/webpack.dev.js')({env: 'development'});
var webpack_config_prod = require('../../webpack/webpack.prod.js')({env: 'production'});
var webpack_config_test = require('../../webpack/webpack.test.js')({env: 'testing'});

gulp.task('webpack:dev', ['source', 'sass'], function() {
    return gulp.src(['./_build/**']).pipe(gulp.dest('./dist'));
});

gulp.task('webpack:prod', ['ngc'], function() {
        //Copy compiled source to dist
    gulp.src(['./_build/compiled/_build/**', './_build/**/*.html', './_build/**/*.css']).pipe(gulp.dest('./dist/_build'));
        //Copy project metadata and readme to the folder
    gulp.src(['./package.json', './README.md', './_build/compiled/index.*']).pipe(gulp.dest('./dist'));
});
