var gulp = require('gulp'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglifyjs'),
    less = require('gulp-less'),
    postcss = require('gulp-postcss'),
    autoprefixer = require('autoprefixer-core'),
    replace = require('gulp-replace'),
    removeComma = require('gulp-trailing-comma');

var scriptsInOrder = [
    'src/polyfills/polyfill-request-animation-frame.js',
    'src/polyfills/polyfill-object-keys.js',
    'src/polyfills/polyfill-object-assign.js',

    'src/base/base-global-init.js',

    'src/core/core-class.js',

    'src/utils/utils-converter.js',
    'src/utils/utils-html.js',
    'src/utils/utils-oop.js',
    'src/utils/utils-number.js',
    'src/utils/utils-object.js',

    'src/core/models/model.js',
    'src/core/models/model-block.js',
    'src/core/models/model-block-tile.js',

    'src/core/collections/collection.js',
    'src/core/collections/collection-blocks.js',
    'src/core/collections/collection-blocks-tiles.js',

    'src/core/services-classes/service-class-event-manager.js',
    'src/core/services-classes/service-class-game-data-manager.js',
    'src/core/services-classes/service-class-assets-loader.js',

    'src/core/graphical-engine/graphical-engine-canvas-manager.js',

    'src/settings/settings-game-constants.js',

    'src/game/game-tetris.js',

    'src/main.js'
];

gulp.task('pre-build-concat', function () {
    'use strict';
    return gulp.src(scriptsInOrder)
        .pipe(removeComma())
        .pipe(concat('game-concat.js'))
        .pipe(gulp.dest('pre-build'));
});

gulp.task('pre-build-game', ['pre-build-concat'], function () {
    'use strict';
    return gulp.src('pre-build/game-concat.js')
        .pipe(uglify("game.js",
            {
                outSourceMap: false,
                mangle : false
            }))
        .pipe(gulp.dest('pre-build'));
});

gulp.task('build-less', function () {
    'use strict';
    return gulp.src('styles/less/game.less')
        .pipe(less())
        .pipe(postcss([ autoprefixer({ browsers: ['last 3 version'] }) ]))
        .pipe(gulp.dest('styles/'));
});

gulp.task('build-styles', ['build-less'], function () {
    'use strict';
    gulp.src("styles/game.css")
        .pipe(gulp.dest("game"));
});

gulp.task('build-javascript', ['pre-build-game', 'build-styles'], function () {
    'use strict';
    gulp.src('pre-build/game.js')
        .pipe(gulp.dest('game'));
});

// LIVE build
gulp.task('default', ['build-javascript'], function () {
    'use strict';
});

// DEV build
gulp.task('build-dev', ['build-less'], function () {
    'use strict';
});