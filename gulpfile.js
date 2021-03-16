let source_folder = "src";
let build_folder = "dist";

let fs = require('fs');

let path = {
    build: {
        html: build_folder + "/",
        css: build_folder + "/css/",
        js: build_folder + "/js/",
        img: build_folder + "/img/",
        fonts: build_folder + "/fonts/",
    },
    src: {
        html: [source_folder + "/html/**/*.html", "!"+source_folder + "/html/**/_*.html"],
        css: source_folder + "/sass/style.sass",
        js: source_folder + "/js/script.js",
        img: source_folder + "/img/**/*.{jpg,png,svg,gif,ico,webp}",
        fonts: source_folder + "/fonts/*.{ttf,woff,woff2}",
    },
    watch: {
        html: source_folder + "/html/**/*.html",
        css: source_folder + "/sass/**/*.{sass,scss}",
        js: source_folder + "/js/**/*.js",
        fonts: source_folder + "/fonts/**/*.ttf",
        img: source_folder + "/img/**/*.{jpg,png,svg,gif,ico,webp}"
    },
    clean: "./" + build_folder + "/"
}

let {src, dest} = require('gulp'),

    gulp = require('gulp'),
    browsersync = require("browser-sync").create(),
    fileinclude = require("gulp-file-include"),
    sass = require("gulp-sass"),
    autoprefixer = require("gulp-autoprefixer"),
    gcmq = require("gulp-group-css-media-queries"),
    clean_css = require("gulp-clean-css"),
    uglify = require("gulp-uglify-es").default,
    rename = require("gulp-rename"),
    del = require("del"),
    ttf2woff = require('gulp-ttf2woff'),
    imagemin = require('gulp-imagemin')
    

// Static server
function browserSync(params) {
    browsersync.init({
        server: {
            baseDir: "./" + build_folder + "/"
        },
        port: 3000,
        notify: false
    });
}

function fonts() {
    return src(path.src.fonts)
        .pipe(ttf2woff())
        .pipe(dest(path.build.fonts))

}

function html() {
    return src(path.src.html)
        .pipe(fileinclude())
        .pipe(dest(path.build.html))
        .pipe(browsersync.reload({ stream: true }));
}



// Img
function img() {
    return src(path.src.img)
        .pipe(
            imagemin({
                progressive: true,
                svgoPlugins: [{ removeViewBox: false }],
                interlaced: true,
                optimizationLevel: 3
            })
        )
        .pipe(dest(path.build.img))
        .pipe(browsersync.reload({ stream: true }));
}

function css(params) {
    return src(path.src.css)
        .pipe(
            sass({
                outputStyle: "expanded"
            })
        )
        .pipe(
            gcmq()
        )
        .pipe(autoprefixer(
            {
                overrideBrowserslist: ["last 5 versions"],
                cascade: true
            }
        ))
        .pipe(dest(path.build.css))
        .pipe(clean_css())
        .pipe(
            rename({
                extname: ".min.css"
            })
        )
        .pipe(dest(path.build.css))
        .pipe(browsersync.reload({ stream: true }));
}
function js() {
    return src(path.src.js)
        .pipe(fileinclude())
        .pipe(dest(path.build.js))
        .pipe(
            uglify()
        )
        .pipe(
            rename({
                extname: ".min.js"
            })
        )
        .pipe(dest(path.build.js))
        .pipe(browsersync.reload({ stream: true }));
}

function clean(params) {
    return del(path.clean);
}

function watchFiles(params) {
    gulp.watch([path.watch.html], html);
    gulp.watch([path.watch.css], css);
    gulp.watch([path.watch.js], js);
    gulp.watch([path.watch.fonts], fonts);
}
let build = gulp.series(gulp.parallel(clean, js, css, html, img, fonts));
let watch = gulp.parallel(build, watchFiles, browserSync);

exports.fonts = fonts
exports.html = html;
exports.js = js;
exports.build = build;
exports.watch = watch;
exports.default = watch;